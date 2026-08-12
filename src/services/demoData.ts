import { UserProfile, RiderProfile, FareSettings, ServiceArea, SupportTicket } from '../types';

// Default Fare Settings
export const DEFAULT_FARE_SETTINGS: FareSettings = {
  baseFare: 30,         // Base rate in ₹
  perKmRate: 12,        // Per km rate in ₹
  minimumFare: 40,      // Minimum charge for any ride
  bookingFee: 5,        // Flat booking fee
  platformCommissionPercent: 10, // 10% platform share
  cancellationFee: 15    // Cancellation charge
};

// Supported Service Areas
export const DEFAULT_SERVICE_AREAS: ServiceArea[] = [
  {
    areaId: 'anantnag_central',
    name: 'Anantnag District (Pahalgam, Kokernag, Verinag)',
    center: { latitude: 33.7300, longitude: 75.1500 },
    operatingRadiusKm: 45,
    active: true
  },
  {
    areaId: 'blr_central',
    name: 'Bengaluru Central (Koramangala, Indiranagar)',
    center: { latitude: 12.9352, longitude: 77.6245 },
    operatingRadiusKm: 15,
    active: true
  },
  {
    areaId: 'del_cp',
    name: 'Delhi Connaught Place',
    center: { latitude: 28.6304, longitude: 77.2177 },
    operatingRadiusKm: 10,
    active: true
  },
  {
    areaId: 'mum_bandra',
    name: 'Mumbai Bandra West',
    center: { latitude: 19.0596, longitude: 72.8295 },
    operatingRadiusKm: 8,
    active: true
  }
];

// Initial Mock Riders
export const INITIAL_DEMO_RIDERS: RiderProfile[] = [
  {
    uid: 'rider_rajesh',
    role: 'rider',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@example.com',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'active',
    createdAt: new Date().toISOString(),
    scooty: {
      make: 'Honda',
      model: 'Activa 6G',
      registrationNumber: 'JK-03-HE-4827',
      color: 'Matte Blue'
    },
    verificationStatus: 'approved',
    documents: {
      drivingLicenseUrl: 'placeholder_license.jpg',
      vehicleRegistrationUrl: 'placeholder_rc.jpg'
    },
    rating: 4.8,
    totalRides: 342,
    online: true,
    available: true,
    currentLocation: { latitude: 33.7410, longitude: 75.1610 }, // Anantnag City North
    todayEarnings: 840,
    todayRides: 6
  },
  {
    uid: 'rider_amit',
    role: 'rider',
    name: 'Amit Sharma',
    phone: '+91 91234 56789',
    email: 'amit.sharma@example.com',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'active',
    createdAt: new Date().toISOString(),
    scooty: {
      make: 'TVS',
      model: 'Jupiter 125',
      registrationNumber: 'JK-03-JM-1209',
      color: 'Titanium Grey'
    },
    verificationStatus: 'approved',
    documents: {
      drivingLicenseUrl: 'placeholder_license.jpg',
      vehicleRegistrationUrl: 'placeholder_rc.jpg'
    },
    rating: 4.9,
    totalRides: 512,
    online: true,
    available: true,
    currentLocation: { latitude: 33.7280, longitude: 75.1420 }, // Anantnag City West
    todayEarnings: 1250,
    todayRides: 8
  },
  {
    uid: 'rider_priya',
    role: 'rider',
    name: 'Priya Patel',
    phone: '+91 88888 77777',
    email: 'priya.patel@example.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'active',
    createdAt: new Date().toISOString(),
    scooty: {
      make: 'Suzuki',
      model: 'Access 125',
      registrationNumber: 'JK-03-SR-8930',
      color: 'Pearl White'
    },
    verificationStatus: 'approved',
    documents: {
      drivingLicenseUrl: 'placeholder_license.jpg',
      vehicleRegistrationUrl: 'placeholder_rc.jpg'
    },
    rating: 4.7,
    totalRides: 189,
    online: true,
    available: true,
    currentLocation: { latitude: 33.7390, longitude: 75.1380 }, // Anantnag City Northwest
    todayEarnings: 420,
    todayRides: 3
  },
  {
    uid: 'rider_sandeep',
    role: 'rider',
    name: 'Sandeep Singh',
    phone: '+91 99999 88888',
    email: 'sandeep.singh@example.com',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'active',
    createdAt: new Date().toISOString(),
    scooty: {
      make: 'Ather',
      model: '450X Gen 3',
      registrationNumber: 'JK-03-EL-7711',
      color: 'Space Grey (Electric)'
    },
    verificationStatus: 'approved',
    documents: {
      drivingLicenseUrl: 'placeholder_license.jpg',
      vehicleRegistrationUrl: 'placeholder_rc.jpg'
    },
    rating: 4.95,
    totalRides: 89,
    online: true,
    available: true,
    currentLocation: { latitude: 33.7320, longitude: 75.1580 }, // Anantnag City East
    todayEarnings: 980,
    todayRides: 5
  },
  {
    uid: 'rider_vikram',
    role: 'rider',
    name: 'Vikram Rathore',
    phone: '+91 77777 66666',
    email: 'vikram.r@example.com',
    photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    status: 'active',
    createdAt: new Date().toISOString(),
    scooty: {
      make: 'Ola',
      model: 'S1 Pro',
      registrationNumber: 'JK-03-OL-2390',
      color: 'Neo Mint Green'
    },
    verificationStatus: 'under_review', // Needs admin approval to show up
    documents: {
      drivingLicenseUrl: 'placeholder_license.jpg',
      vehicleRegistrationUrl: 'placeholder_rc.jpg'
    },
    rating: 4.6,
    totalRides: 45,
    online: false,
    available: false,
    currentLocation: { latitude: 33.7360, longitude: 75.1550 },
    todayEarnings: 0,
    todayRides: 0
  }
];

// Initial Support Tickets
export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    ticketId: 'ticket_1',
    userId: 'customer_khalid',
    userRole: 'customer',
    userName: 'Khalid Ashraf',
    category: 'Payment Issue',
    subject: 'Charged twice for ride KA-01',
    description: 'I selected Cash payment but my Wallet was also deducted ₹68.40. Please check and refund.',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    replies: [
      {
        replyId: 'rep_1',
        senderId: 'customer_khalid',
        senderName: 'Khalid Ashraf',
        senderRole: 'customer',
        message: 'Please review this as soon as possible.',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
      }
    ]
  },
  {
    ticketId: 'ticket_2',
    userId: 'rider_rajesh',
    userRole: 'rider',
    userName: 'Rajesh Kumar',
    category: 'Technical Issue',
    subject: 'App lag during GPS navigation',
    description: 'The map lagged and did not update my location near Koramangala 4th Block. Had to restart.',
    status: 'resolved',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    replies: [
      {
        replyId: 'rep_2',
        senderId: 'admin_demo',
        senderName: 'System Admin',
        senderRole: 'admin',
        message: 'Hi Rajesh, please update the app to the latest version. We optimized location polling to reduce battery and memory lag.',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
      },
      {
        replyId: 'rep_3',
        senderId: 'rider_rajesh',
        senderName: 'Rajesh Kumar',
        senderRole: 'rider',
        message: 'Thanks, the update resolved the lag!',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
      }
    ]
  }
];
