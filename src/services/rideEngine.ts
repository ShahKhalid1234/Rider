import { isFirebaseAvailable, db, auth } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  addDoc,
  runTransaction
} from 'firebase/firestore';
import {
  UserProfile,
  RiderProfile,
  RideRequest,
  FareSettings,
  ServiceArea,
  SupportTicket,
  SystemNotification,
  RideStatus,
  PaymentRecord,
  AdminAuditLog,
  LatLng
} from '../types';
import {
  DEFAULT_FARE_SETTINGS,
  DEFAULT_SERVICE_AREAS,
  INITIAL_DEMO_RIDERS,
  INITIAL_SUPPORT_TICKETS
} from './demoData';

type ListenerCallback = (state: EngineState) => void;

interface EngineState {
  currentUser: UserProfile | RiderProfile | null;
  activeRide: RideRequest | null;
  riders: RiderProfile[];
  allRides: RideRequest[];
  fareSettings: FareSettings;
  serviceAreas: ServiceArea[];
  supportTickets: SupportTicket[];
  notifications: SystemNotification[];
  mode: 'simulated' | 'cloud';
}

class RideEngine {
  private state: EngineState = {
    currentUser: null,
    activeRide: null,
    riders: [...INITIAL_DEMO_RIDERS],
    allRides: [],
    fareSettings: { ...DEFAULT_FARE_SETTINGS },
    serviceAreas: [...DEFAULT_SERVICE_AREAS],
    supportTickets: [...INITIAL_SUPPORT_TICKETS],
    notifications: [],
    mode: 'simulated' // Default to simulation mode for an out-of-the-box working experience
  };

  private listeners: Set<ListenerCallback> = new Set();
  private simulationInterval: any = null;
  private searchingTimeout: any = null;
  private firebaseUnsubscribers: (() => void)[] = [];

  constructor() {
    this.loadLocalState();
    // Start tracking background riders if in simulation mode
    this.startLocationTracker();
  }

  // Subscribe to state changes
  public subscribe(callback: ListenerCallback): () => void {
    this.listeners.add(callback);
    callback({ ...this.state });
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getState(): EngineState {
    return { ...this.state };
  }

  private notify() {
    this.saveLocalState();
    this.listeners.forEach(cb => cb({ ...this.state }));
  }

  // Set mode: simulated vs cloud
  public setMode(mode: 'simulated' | 'cloud') {
    if (mode === 'cloud' && !isFirebaseAvailable) {
      this.addNotification(
        'system',
        'Firebase Offline',
        'Cannot switch to Live Cloud Mode because Firebase is currently unavailable. Operating in local simulation.'
      );
      return;
    }

    this.state.mode = mode;
    this.addNotification(
      'system',
      `Mode Switched`,
      `You are now in ${mode === 'cloud' ? 'Live Cloud Mode (Firebase)' : 'Interactive Simulation Mode'}.`
    );

    if (mode === 'cloud') {
      this.stopSimulation();
      this.setupFirebaseListeners();
    } else {
      this.clearFirebaseListeners();
      this.startLocationTracker();
    }
    this.notify();
  }

  private loadLocalState() {
    try {
      const saved = localStorage.getItem('scootyride_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state.currentUser = parsed.currentUser || null;
        this.state.activeRide = parsed.activeRide || null;
        this.state.riders = parsed.riders || [...INITIAL_DEMO_RIDERS];
        this.state.allRides = parsed.allRides || [];
        this.state.fareSettings = parsed.fareSettings || { ...DEFAULT_FARE_SETTINGS };
        this.state.serviceAreas = parsed.serviceAreas || [...DEFAULT_SERVICE_AREAS];
        this.state.supportTickets = parsed.supportTickets || [...INITIAL_SUPPORT_TICKETS];
        this.state.notifications = parsed.notifications || [];
        this.state.mode = parsed.mode || 'simulated';
      }
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  }

  private saveLocalState() {
    try {
      localStorage.setItem(
        'scootyride_state',
        JSON.stringify({
          currentUser: this.state.currentUser,
          activeRide: this.state.activeRide,
          riders: this.state.riders,
          allRides: this.state.allRides,
          fareSettings: this.state.fareSettings,
          serviceAreas: this.state.serviceAreas,
          supportTickets: this.state.supportTickets,
          notifications: this.state.notifications,
          mode: this.state.mode
        })
      );
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  // --- AUTHENTICATION ---
  public async loginWithPhone(phone: string, role: 'customer' | 'rider' | 'admin', name?: string): Promise<any> {
    // Normalization
    const trimmedPhone = phone.trim();

    // Check pre-configured demo users
    let profile: UserProfile | RiderProfile | null = null;

    if (role === 'admin' && trimmedPhone === 'admin') {
      profile = {
        uid: 'admin_demo',
        role: 'admin',
        name: 'System Admin',
        phone: '+91 00000 00000',
        email: 'admin@scootyride.com',
        status: 'active',
        createdAt: new Date().toISOString()
      };
    } else if (role === 'customer' && trimmedPhone === 'customer') {
      profile = {
        uid: 'customer_khalid',
        role: 'customer',
        name: 'Khalid Ashraf',
        phone: '+91 99999 00001',
        email: 'khalidashraf105@gmail.com',
        status: 'active',
        createdAt: new Date().toISOString()
      };
    } else if (role === 'rider' && trimmedPhone.startsWith('rider')) {
      // rider1, rider2, rider3, rider4
      const index = parseInt(trimmedPhone.replace('rider', ''), 10) - 1;
      const candidates = this.state.riders.filter(r => r.role === 'rider');
      if (index >= 0 && index < candidates.length) {
        profile = candidates[index];
      } else {
        profile = candidates[0];
      }
    }

    // If no demo user found, create/use standard session
    if (!profile) {
      const uid = 'user_' + Math.random().toString(36).substring(2, 11);
      if (role === 'rider') {
        const rProfile: RiderProfile = {
          uid,
          role: 'rider',
          name: name || 'Demo Rider',
          phone: trimmedPhone,
          status: 'active',
          createdAt: new Date().toISOString(),
          scooty: {
            make: 'TVS',
            model: 'iQube Electric',
            registrationNumber: `KA-03-EM-${Math.floor(1000 + Math.random() * 9000)}`,
            color: 'Luminous Red'
          },
          verificationStatus: 'under_review', // Needs admin approval
          documents: {
            drivingLicenseUrl: 'demo_license.png',
            vehicleRegistrationUrl: 'demo_rc.png'
          },
          rating: 5.0,
          totalRides: 0,
          online: false,
          available: false,
          todayEarnings: 0,
          todayRides: 0,
          currentLocation: { latitude: 12.9352 + (Math.random() - 0.5) * 0.02, longitude: 77.6245 + (Math.random() - 0.5) * 0.02 }
        };
        profile = rProfile;
        this.state.riders.push(rProfile);
      } else {
        profile = {
          uid,
          role,
          name: name || (role === 'admin' ? 'Admin User' : 'Customer Account'),
          phone: trimmedPhone,
          status: 'active',
          createdAt: new Date().toISOString()
        };
      }
    }

    this.state.currentUser = profile;

    // Sync to Firestore if in Cloud Mode
    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'users', profile.uid), profile);
      } catch (err) {
        console.error('Firestore login sync failed:', err);
      }
    }

    this.addNotification(
      profile.uid,
      'Welcome back!',
      `Logged in successfully as ${profile.name} (${profile.role}).`
    );

    this.notify();
    return profile;
  }

  public updateRiderScooty(uid: string, make: string, model: string, color: string, regNumber: string) {
    const idx = this.state.riders.findIndex(r => r.uid === uid);
    if (idx !== -1) {
      this.state.riders[idx].scooty = {
        make,
        model,
        color,
        registrationNumber: regNumber
      };
      if (this.state.currentUser?.uid === uid) {
        this.state.currentUser = { ...this.state.riders[idx] };
      }
      this.notify();
    }
  }

  public logout() {
    this.stopSimulation();
    if (this.state.currentUser) {
      this.addNotification(this.state.currentUser.uid, 'Logged Out', 'You have been securely logged out.');
    }
    this.state.currentUser = null;
    this.state.activeRide = null;
    this.clearFirebaseListeners();
    this.notify();
  }

  // --- CORE BOOKING SYSTEM ---
  public async calculateFare(distanceKm: number): Promise<{ fare: number; breakdown: any }> {
    const s = this.state.fareSettings;
    const calc = s.baseFare + distanceKm * s.perKmRate;
    const fare = Math.round(Math.max(calc, s.minimumFare) + s.bookingFee);
    
    return {
      fare,
      breakdown: {
        baseFare: s.baseFare,
        distanceCharge: Math.round(distanceKm * s.perKmRate * 10) / 10,
        bookingFee: s.bookingFee,
        minimumFare: s.minimumFare,
        finalFare: fare
      }
    };
  }

  public async bookRide(
    pickup: { address: string; latitude: number; longitude: number },
    destination: { address: string; latitude: number; longitude: number },
    distanceKm: number,
    durationMin: number
  ): Promise<RideRequest> {
    if (!this.state.currentUser) throw new Error('Authentication required');

    const { fare } = await this.calculateFare(distanceKm);
    
    // Generate a secure, 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const ride: RideRequest = {
      rideId: 'ride_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      customerId: this.state.currentUser.uid,
      customerName: this.state.currentUser.name,
      customerPhone: this.state.currentUser.phone,
      customerPhoto: this.state.currentUser.photoURL,
      customerRating: 4.8, // Demo average
      status: 'searching',
      pickup,
      destination,
      estimatedDistanceKm: distanceKm,
      estimatedDurationMinutes: durationMin,
      estimatedFare: fare,
      otp,
      otpVerified: false,
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      requestedAt: new Date().toISOString()
    };

    this.state.activeRide = ride;
    this.state.allRides.unshift(ride);

    this.addNotification(
      this.state.currentUser.uid,
      'Ride Requested',
      `Searching for nearby ScootyRiders to ${destination.address.split(',')[0]}...`
    );

    this.notify();

    // Trigger Cloud Write or Local Simulator
    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'rides', ride.rideId), ride);
      } catch (err) {
        console.error('Firebase ride write failed:', err);
      }
    } else {
      this.triggerSimulatedRiderMatching(ride);
    }

    return ride;
  }

  // Cancel ride
  public async cancelRide(rideId: string, reason: string): Promise<void> {
    const ride = this.state.allRides.find(r => r.rideId === rideId);
    if (!ride) return;

    const cancelledBy = this.state.currentUser?.role === 'rider' ? 'rider' : 'customer';
    const status: RideStatus = cancelledBy === 'rider' ? 'cancelled_by_rider' : 'cancelled_by_customer';

    ride.status = status;
    ride.cancelledAt = new Date().toISOString();
    ride.cancelledBy = cancelledBy;
    ride.cancelReason = reason;

    if (this.state.activeRide?.rideId === rideId) {
      this.state.activeRide = null;
    }

    // If a rider was assigned, make them available again
    if (ride.riderId) {
      const riderIdx = this.state.riders.findIndex(r => r.uid === ride.riderId);
      if (riderIdx !== -1) {
        this.state.riders[riderIdx].available = true;
      }
      this.addNotification(
        ride.riderId,
        'Ride Cancelled',
        `The ride request to ${ride.pickup.address.split(',')[0]} was cancelled by the ${cancelledBy}.`
      );
    }

    this.addNotification(
      ride.customerId,
      'Ride Cancelled',
      `Your ride request was cancelled successfully.`
    );

    this.stopSimulation();
    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'rides', rideId), {
          status,
          cancelledAt: ride.cancelledAt,
          cancelledBy,
          cancelReason: reason
        });
      } catch (e) {
        console.error('Cloud ride cancel update failed:', e);
      }
    }
  }

  // --- RIDER SYSTEM ACTIONS ---
  public async goOnlineToggle(riderId: string, online: boolean): Promise<void> {
    const idx = this.state.riders.findIndex(r => r.uid === riderId);
    if (idx === -1) return;

    this.state.riders[idx].online = online;
    this.state.riders[idx].available = online; // Available when online by default

    if (this.state.currentUser?.uid === riderId) {
      this.state.currentUser = { ...this.state.riders[idx] };
    }

    this.addNotification(
      riderId,
      online ? 'Online' : 'Offline',
      online ? 'You are now online and available for bookings!' : 'You are offline.'
    );

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'users', riderId), {
          online,
          available: online
        });
      } catch (e) {
        console.error('Firebase online status sync failed:', e);
      }
    }
  }

  // Accept booking
  public async acceptRide(rideId: string, riderId: string): Promise<boolean> {
    // Check if ride is still searching
    const ride = this.state.allRides.find(r => r.rideId === rideId);
    if (!ride || ride.status !== 'searching') {
      return false; // Already taken or cancelled
    }

    const rider = this.state.riders.find(r => r.uid === riderId);
    if (!rider || !rider.online || !rider.available) {
      return false; // Rider is busy or offline
    }

    // Allocate rider details to the ride
    ride.riderId = rider.uid;
    ride.riderName = rider.name;
    ride.riderPhone = rider.phone;
    ride.riderPhoto = rider.photoURL;
    ride.riderScooty = rider.scooty;
    ride.riderRating = rider.rating;
    ride.status = 'accepted';
    ride.acceptedAt = new Date().toISOString();

    // Lock rider availability
    rider.available = false;

    if (this.state.activeRide?.rideId === rideId) {
      this.state.activeRide = ride;
    }

    if (this.state.currentUser?.uid === riderId) {
      this.state.activeRide = ride;
    }

    this.addNotification(
      ride.customerId,
      'Rider Found',
      `${rider.name} is arriving on a ${rider.scooty.color} ${rider.scooty.make} ${rider.scooty.model}.`
    );

    this.addNotification(
      riderId,
      'Ride Accepted',
      `Navigate to pickup at ${ride.pickup.address.split(',')[0]}.`
    );

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'rides', rideId), {
          riderId: rider.uid,
          riderName: rider.name,
          riderPhone: rider.phone,
          riderPhoto: rider.photoURL || '',
          riderScooty: rider.scooty,
          riderRating: rider.rating,
          status: 'accepted',
          acceptedAt: ride.acceptedAt
        });

        await updateDoc(doc(db, 'users', riderId), {
          available: false
        });
      } catch (e) {
        console.error('Firebase ride accept update failed:', e);
      }
    } else {
      // Start simulated approach if customer is playing with it
      this.triggerSimulatedRiderApproach(ride);
    }

    return true;
  }

  // Rider Arrived at pickup
  public async riderArrivedAtPickup(rideId: string): Promise<void> {
    const ride = this.state.allRides.find(r => r.rideId === rideId);
    if (!ride) return;

    ride.status = 'rider_arrived';
    ride.arrivedAt = new Date().toISOString();

    if (this.state.activeRide?.rideId === rideId) {
      this.state.activeRide = ride;
    }

    this.addNotification(
      ride.customerId,
      'Rider Arrived!',
      `Your ScootyRider ${ride.riderName} has arrived at the pickup location. Share OTP ${ride.otp} to start.`
    );

    this.addNotification(
      ride.riderId!,
      'Arrived at Pickup',
      `Ask the customer for their 4-digit OTP to start the ride.`
    );

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'rides', rideId), {
          status: 'rider_arrived',
          arrivedAt: ride.arrivedAt
        });
      } catch (e) {
        console.error('Firebase arrival status sync failed:', e);
      }
    }
  }

  // Validate OTP and start ride
  public async startRideWithOTP(rideId: string, inputOtp: string): Promise<boolean> {
    const ride = this.state.allRides.find(r => r.rideId === rideId);
    if (!ride) return false;

    if (ride.otp !== inputOtp) {
      this.addNotification(
        ride.riderId!,
        'Invalid OTP',
        'The OTP you entered is incorrect. Please request the customer to verify.'
      );
      return false;
    }

    ride.status = 'in_progress';
    ride.startedAt = new Date().toISOString();
    ride.otpVerified = true;

    if (this.state.activeRide?.rideId === rideId) {
      this.state.activeRide = ride;
    }

    this.addNotification(
      ride.customerId,
      'Ride Started',
      `Have a safe trip! Transit in progress to ${ride.destination.address.split(',')[0]}.`
    );

    this.addNotification(
      ride.riderId!,
      'Ride Started',
      `Transit started. Drive safely to ${ride.destination.address.split(',')[0]}.`
    );

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'rides', rideId), {
          status: 'in_progress',
          otpVerified: true,
          startedAt: ride.startedAt
        });
      } catch (e) {
        console.error('Firebase start ride sync failed:', e);
      }
    } else {
      this.triggerSimulatedRideProgress(ride);
    }

    return true;
  }

  // End Ride at destination
  public async endRide(rideId: string): Promise<void> {
    const ride = this.state.allRides.find(r => r.rideId === rideId);
    if (!ride) return;

    ride.status = 'completed';
    ride.completedAt = new Date().toISOString();
    ride.actualDistanceKm = ride.estimatedDistanceKm;
    ride.actualDurationMinutes = ride.estimatedDurationMinutes;
    ride.finalFare = ride.estimatedFare;
    ride.paymentStatus = 'paid'; // Set paid instantly on cash/MVP flow

    // Create payment record
    const commission = Math.round(ride.estimatedFare * (this.state.fareSettings.platformCommissionPercent / 100));
    const riderShare = ride.estimatedFare - commission;

    const payment: PaymentRecord = {
      paymentId: 'pay_' + Math.random().toString(36).substring(2, 11).toUpperCase(),
      rideId,
      customerId: ride.customerId,
      customerName: ride.customerName,
      riderId: ride.riderId!,
      riderName: ride.riderName!,
      amount: ride.estimatedFare,
      status: 'paid',
      method: ride.paymentMethod,
      platformCommission: commission,
      riderEarnings: riderShare,
      timestamp: new Date().toISOString()
    };

    // Release rider back to online available state
    const riderIdx = this.state.riders.findIndex(r => r.uid === ride.riderId);
    if (riderIdx !== -1) {
      const rider = this.state.riders[riderIdx];
      rider.available = true;
      rider.todayRides += 1;
      rider.todayEarnings += riderShare;
      rider.totalRides += 1;

      // Sync active rider profile session
      if (this.state.currentUser?.uid === rider.uid) {
        this.state.currentUser = { ...rider };
      }
    }

    if (this.state.activeRide?.rideId === rideId) {
      this.state.activeRide = ride; // Keep active ride details on receipt screen
    }

    this.addNotification(
      ride.customerId,
      'Ride Completed',
      `You have arrived! Please pay ₹${ride.estimatedFare} in cash to your rider.`
    );

    this.addNotification(
      ride.riderId!,
      'Ride Completed',
      `Earnings of ₹${riderShare} credited to your wallet (after 10% platform fee).`
    );

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'rides', rideId), {
          status: 'completed',
          completedAt: ride.completedAt,
          actualDistanceKm: ride.actualDistanceKm,
          actualDurationMinutes: ride.actualDurationMinutes,
          finalFare: ride.finalFare,
          paymentStatus: 'paid'
        });

        await updateDoc(doc(db, 'users', ride.riderId!), {
          available: true,
          todayRides: this.state.riders[riderIdx]?.todayRides || 1,
          todayEarnings: this.state.riders[riderIdx]?.todayEarnings || riderShare,
          totalRides: this.state.riders[riderIdx]?.totalRides || 1
        });

        await setDoc(doc(db, 'payments', payment.paymentId), payment);
      } catch (e) {
        console.error('Firebase ride end sync failed:', e);
      }
    }
  }

  // --- RATINGS SYSTEM ---
  public async submitRideRating(rideId: string, stars: number, comment?: string): Promise<void> {
    const ride = this.state.allRides.find(r => r.rideId === rideId);
    if (!ride) return;

    const isCustomer = this.state.currentUser?.role === 'customer';
    const timestamp = new Date().toISOString();

    if (isCustomer) {
      ride.ratingByCustomer = { stars, comment, createdAt: timestamp };
      this.addNotification(ride.riderId!, 'New Review Received', `Customer rated you ${stars} stars!`);
      
      // Update average rider rating
      const riderIdx = this.state.riders.findIndex(r => r.uid === ride.riderId);
      if (riderIdx !== -1) {
        const rider = this.state.riders[riderIdx];
        const prevSum = rider.rating * rider.totalRides;
        rider.rating = Math.round(((prevSum + stars) / (rider.totalRides + 1)) * 100) / 100;
      }
    } else {
      ride.ratingByRider = { stars, comment, createdAt: timestamp };
      this.addNotification(ride.customerId, 'Rider Feedback', `Your rider rated you ${stars} stars.`);
    }

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        if (isCustomer) {
          await updateDoc(doc(db, 'rides', rideId), {
            ratingByCustomer: ride.ratingByCustomer
          });
          // Update rider rating
          if (ride.riderId) {
            const rRef = doc(db, 'users', ride.riderId);
            const rSnap = await getDoc(rRef);
            if (rSnap.exists()) {
              const data = rSnap.data() as RiderProfile;
              const prevTotal = data.totalRides || 1;
              const prevRating = data.rating || 5;
              const newRating = Math.round(((prevRating * prevTotal + stars) / (prevTotal + 1)) * 100) / 100;
              await updateDoc(rRef, { rating: newRating });
            }
          }
        } else {
          await updateDoc(doc(db, 'rides', rideId), {
            ratingByRider: ride.ratingByRider
          });
        }
      } catch (e) {
        console.error('Firebase rating sync failed:', e);
      }
    }
  }

  // Clear current active ride from tracking screen
  public clearActiveRide() {
    this.state.activeRide = null;
    this.notify();
  }

  // --- SUPPORT TICKETS ---
  public async createSupportTicket(category: string, subject: string, description: string): Promise<SupportTicket> {
    if (!this.state.currentUser) throw new Error('Authentication required');

    const ticket: SupportTicket = {
      ticketId: 'ticket_' + Math.random().toString(36).substring(2, 11),
      userId: this.state.currentUser.uid,
      userRole: this.state.currentUser.role,
      userName: this.state.currentUser.name,
      category,
      subject,
      description,
      status: 'open',
      createdAt: new Date().toISOString(),
      replies: []
    };

    this.state.supportTickets.unshift(ticket);
    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'supportTickets', ticket.ticketId), ticket);
      } catch (e) {
        console.error('Firebase ticket sync failed:', e);
      }
    }

    return ticket;
  }

  public async replyToSupportTicket(ticketId: string, message: string): Promise<void> {
    if (!this.state.currentUser) throw new Error('Authentication required');

    const ticket = this.state.supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    const reply = {
      replyId: 'rep_' + Math.random().toString(36).substring(2, 11),
      senderId: this.state.currentUser.uid,
      senderName: this.state.currentUser.name,
      senderRole: this.state.currentUser.role,
      message,
      timestamp: new Date().toISOString()
    };

    ticket.replies.push(reply);
    
    // Auto reopen on customer reply
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      ticket.status = 'in_progress';
    }

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'supportTickets', ticketId), {
          replies: ticket.replies,
          status: ticket.status
        });
      } catch (e) {
        console.error('Firebase ticket reply sync failed:', e);
      }
    }
  }

  public async updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'resolved' | 'closed'): Promise<void> {
    const ticket = this.state.supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;

    ticket.status = status;
    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'supportTickets', ticketId), { status });
      } catch (e) {
        console.error('Firebase ticket status sync failed:', e);
      }
    }
  }

  // --- ADMIN SETTINGS ---
  public async updateFareSettings(settings: FareSettings): Promise<void> {
    this.state.fareSettings = { ...settings };
    
    this.addAuditLog('Updated global fare settings', 'system');
    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'fareSettings', 'global_fare'), settings);
      } catch (e) {
        console.error('Firebase fare settings sync failed:', e);
      }
    }
  }

  public async updateServiceArea(areaId: string, active: boolean, operatingRadiusKm?: number): Promise<void> {
    const idx = this.state.serviceAreas.findIndex(a => a.areaId === areaId);
    if (idx === -1) return;

    this.state.serviceAreas[idx].active = active;
    if (operatingRadiusKm !== undefined) {
      this.state.serviceAreas[idx].operatingRadiusKm = operatingRadiusKm;
    }

    this.addAuditLog(`Updated service area ${this.state.serviceAreas[idx].name} status to ${active ? 'active' : 'inactive'}`, areaId);
    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await setDoc(doc(db, 'serviceAreas', areaId), this.state.serviceAreas[idx]);
      } catch (e) {
        console.error('Firebase service area update failed:', e);
      }
    }
  }

  public async updateRiderOnboarding(riderId: string, status: 'approved' | 'rejected' | 'suspended' | 'under_review'): Promise<void> {
    const idx = this.state.riders.findIndex(r => r.uid === riderId);
    if (idx === -1) return;

    this.state.riders[idx].verificationStatus = status;

    if (this.state.currentUser?.uid === riderId) {
      this.state.currentUser = { ...this.state.riders[idx] };
    }

    this.addAuditLog(`Admin changed rider ${this.state.riders[idx].name} onboarding verification status to ${status}`, riderId);
    
    this.addNotification(
      riderId,
      'Account Verification Update',
      status === 'approved' 
        ? 'Congratulations! Your account is approved. You can now go online to accept rides.' 
        : `Your registration status is updated to: ${status.replace('_', ' ')}.`
    );

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      try {
        await updateDoc(doc(db, 'users', riderId), {
          verificationStatus: status
        });
      } catch (e) {
        console.error('Firebase rider status update failed:', e);
      }
    }
  }

  // --- SYSTEM NOTIFICATIONS ---
  public addNotification(userId: string, title: string, body: string, type: string = 'info') {
    const notif: SystemNotification = {
      notificationId: 'notif_' + Math.random().toString(36).substring(2, 11),
      userId,
      title,
      body,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };

    this.state.notifications.unshift(notif);
    
    // Maintain maximum 30 notifications locally
    if (this.state.notifications.length > 50) {
      this.state.notifications.pop();
    }

    this.notify();

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      setDoc(doc(db, 'notifications', notif.notificationId), notif).catch(e => {
        console.error('Firebase notification sync failed:', e);
      });
    }
  }

  public markNotificationRead(notifId: string) {
    const notif = this.state.notifications.find(n => n.notificationId === notifId);
    if (notif) {
      notif.read = true;
      this.notify();

      if (this.state.mode === 'cloud' && isFirebaseAvailable) {
        updateDoc(doc(db, 'notifications', notifId), { read: true }).catch(e => {
          console.error('Firebase notification update failed:', e);
        });
      }
    }
  }

  private addAuditLog(action: string, targetId: string) {
    if (!this.state.currentUser || this.state.currentUser.role !== 'admin') return;

    const log: AdminAuditLog = {
      logId: 'log_' + Math.random().toString(36).substring(2, 11),
      adminId: this.state.currentUser.uid,
      adminName: this.state.currentUser.name,
      action,
      targetId,
      timestamp: new Date().toISOString()
    };

    if (this.state.mode === 'cloud' && isFirebaseAvailable) {
      setDoc(doc(db, 'adminLogs', log.logId), log).catch(e => {
        console.error('Firebase audit log write failed:', e);
      });
    }
  }

  // --- HIGH FIDELITY SIMULATION CONTROLLER ---
  
  // Background loop: slowly shifts offline/idle riders around the map to feel alive
  private startLocationTracker() {
    this.stopSimulation();
    
    this.simulationInterval = setInterval(() => {
      if (this.state.mode !== 'simulated') return;

      // Slowly drift available/online riders to mimic roaming around local area
      this.state.riders.forEach(r => {
        if (r.online && r.available && r.currentLocation) {
          // Drifts latitude/longitude slightly (±5 meters per cycle)
          r.currentLocation = {
            latitude: r.currentLocation.latitude + (Math.random() - 0.5) * 0.0003,
            longitude: r.currentLocation.longitude + (Math.random() - 0.5) * 0.0003
          };
        }
      });

      this.notify();
    }, 4000);
  }

  private stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    if (this.searchingTimeout) {
      clearTimeout(this.searchingTimeout);
      this.searchingTimeout = null;
    }
  }

  // Simulated automatic driver matching
  private triggerSimulatedRiderMatching(ride: RideRequest) {
    if (this.searchingTimeout) clearTimeout(this.searchingTimeout);

    this.searchingTimeout = setTimeout(() => {
      if (this.state.activeRide?.rideId !== ride.rideId || ride.status !== 'searching') return;

      // Find an available online rider (Rajesh or Sandeep or Priya or Amit)
      const approvedRiders = this.state.riders.filter(
        r => r.role === 'rider' && r.verificationStatus === 'approved' && r.online && r.available
      );

      if (approvedRiders.length === 0) {
        // No riders available! Let's make Rajesh available
        const rajesh = this.state.riders.find(r => r.uid === 'rider_rajesh');
        if (rajesh) {
          rajesh.online = true;
          rajesh.available = true;
          approvedRiders.push(rajesh);
        }
      }

      if (approvedRiders.length > 0) {
        // Find the closest approved rider mathematically
        const closestRider = approvedRiders.reduce((closest, current) => {
          const dClosest = this.haversine(ride.pickup, closest.currentLocation!);
          const dCurrent = this.haversine(ride.pickup, current.currentLocation!);
          return dCurrent < dClosest ? current : closest;
        }, approvedRiders[0]);

        this.acceptRide(ride.rideId, closestRider.uid);
      } else {
        // System auto timeout
        this.cancelRide(ride.rideId, 'No drivers nearby available');
      }
    }, 4000);
  }

  // Simulated GPS driving to the customer's pickup
  private triggerSimulatedRiderApproach(ride: RideRequest) {
    this.stopSimulation();

    const riderIdx = this.state.riders.findIndex(r => r.uid === ride.riderId);
    if (riderIdx === -1) return;

    let steps = 0;
    const maxSteps = 5; // Arrives in 5 steps (7.5 seconds)

    const riderLoc = { ...this.state.riders[riderIdx].currentLocation! };
    const pickupLoc = { latitude: ride.pickup.latitude, longitude: ride.pickup.longitude };

    this.simulationInterval = setInterval(() => {
      steps++;
      
      const interpolationRatio = steps / maxSteps;
      const currentLat = riderLoc.latitude + (pickupLoc.latitude - riderLoc.latitude) * interpolationRatio;
      const currentLng = riderLoc.longitude + (pickupLoc.longitude - riderLoc.longitude) * interpolationRatio;

      // Update location
      this.state.riders[riderIdx].currentLocation = { latitude: currentLat, longitude: currentLng };
      
      if (this.state.currentUser?.uid === ride.riderId) {
        this.state.currentUser = { ...this.state.riders[riderIdx] };
      }

      // Re-trigger visual updates on the map
      if (this.state.activeRide?.rideId === ride.rideId) {
        this.state.activeRide = { ...ride };
      }

      this.notify();

      if (steps >= maxSteps) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
        this.riderArrivedAtPickup(ride.rideId);
      }
    }, 1500);
  }

  // Simulated GPS transit to the destination
  private triggerSimulatedRideProgress(ride: RideRequest) {
    this.stopSimulation();

    const riderIdx = this.state.riders.findIndex(r => r.uid === ride.riderId);
    if (riderIdx === -1) return;

    let steps = 0;
    const maxSteps = 7; // Ride completes in 7 steps (14 seconds)

    const pickupLoc = { latitude: ride.pickup.latitude, longitude: ride.pickup.longitude };
    const destLoc = { latitude: ride.destination.latitude, longitude: ride.destination.longitude };

    this.simulationInterval = setInterval(() => {
      steps++;

      const interpolationRatio = steps / maxSteps;
      const currentLat = pickupLoc.latitude + (destLoc.latitude - pickupLoc.latitude) * interpolationRatio;
      const currentLng = pickupLoc.longitude + (destLoc.longitude - pickupLoc.longitude) * interpolationRatio;

      // Update both rider location and map indicators
      this.state.riders[riderIdx].currentLocation = { latitude: currentLat, longitude: currentLng };

      if (this.state.currentUser?.uid === ride.riderId) {
        this.state.currentUser = { ...this.state.riders[riderIdx] };
      }

      if (this.state.activeRide?.rideId === ride.rideId) {
        this.state.activeRide = { ...ride };
      }

      this.notify();

      if (steps >= maxSteps) {
        clearInterval(this.simulationInterval);
        this.simulationInterval = null;
        this.endRide(ride.rideId);
      }
    }, 2000);
  }

  // Haversine formula to compute distance in km between two lat/lng coordinates
  private haversine(c1: LatLng, c2: LatLng): number {
    const R = 6371; // Radius of Earth in km
    const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.latitude * Math.PI) / 180) *
        Math.cos((c2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // --- FIREBASE LIVE CLOUD SYNC LISTENERS ---
  private setupFirebaseListeners() {
    this.clearFirebaseListeners();

    if (!isFirebaseAvailable) return;

    // Listen to Active Ride changes for currently authenticated customer/rider
    if (this.state.currentUser) {
      const uid = this.state.currentUser.uid;
      const role = this.state.currentUser.role;

      // Active Ride query: ride is active if not completed or cancelled
      const activeQuery = query(
        collection(db, 'rides'),
        where(role === 'customer' ? 'customerId' : 'riderId', '==', uid)
      );

      const unsubActive = onSnapshot(activeQuery, snap => {
        let activeFound = false;
        snap.forEach(docSnap => {
          const ride = docSnap.data() as RideRequest;
          const activeStatuses: RideStatus[] = [
            'requested',
            'searching',
            'accepted',
            'rider_arriving',
            'rider_arrived',
            'otp_pending',
            'in_progress'
          ];
          
          if (activeStatuses.includes(ride.status)) {
            this.state.activeRide = ride;
            activeFound = true;
          }
          
          // Merge to all rides list
          const existingIdx = this.state.allRides.findIndex(r => r.rideId === ride.rideId);
          if (existingIdx !== -1) {
            this.state.allRides[existingIdx] = ride;
          } else {
            this.state.allRides.unshift(ride);
          }
        });

        if (!activeFound) {
          this.state.activeRide = null;
        }
        this.notify();
      });

      this.firebaseUnsubscribers.push(unsubActive);

      // Setup list of all support tickets
      const unsubTickets = onSnapshot(
        query(
          collection(db, 'supportTickets'),
          role === 'admin' ? orderBy('createdAt', 'desc') : where('userId', '==', uid)
        ),
        snap => {
          const tickets: SupportTicket[] = [];
          snap.forEach(docSnap => {
            tickets.push(docSnap.data() as SupportTicket);
          });
          this.state.supportTickets = tickets;
          this.notify();
        }
      );
      this.firebaseUnsubscribers.push(unsubTickets);

      // Listen to profile updates (e.g. admin approves rider)
      const unsubProfile = onSnapshot(doc(db, 'users', uid), docSnap => {
        if (docSnap.exists()) {
          const updated = docSnap.data() as UserProfile | RiderProfile;
          this.state.currentUser = updated;
          
          // If the current user is a rider, keep our local riders list synchronized
          if (updated.role === 'rider') {
            const idx = this.state.riders.findIndex(r => r.uid === uid);
            if (idx !== -1) {
              this.state.riders[idx] = updated as RiderProfile;
            }
          }
          this.notify();
        }
      });
      this.firebaseUnsubscribers.push(unsubProfile);
    }
  }

  private clearFirebaseListeners() {
    this.firebaseUnsubscribers.forEach(unsub => unsub());
    this.firebaseUnsubscribers = [];
  }
}

export const rideEngine = new RideEngine();
export default rideEngine;
