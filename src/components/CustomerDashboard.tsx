import React, { useState, useEffect } from 'react';
import { rideEngine } from '../services/rideEngine';
import { RideRequest, LatLng } from '../types';
import MapView from './MapView';
import { 
  MapPin, 
  Navigation, 
  Search, 
  X, 
  ChevronRight, 
  Clock, 
  User, 
  ShieldAlert, 
  Star, 
  Check, 
  CreditCard, 
  TrendingUp, 
  History,
  Phone,
  MessageSquare,
  AlertOctagon,
  ArrowRight,
  Wallet
} from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (route: string) => void;
}

// Popular Hyperlocal shortcuts (Anantnag District accessible coordinates)
const POPULAR_SHORTCUTS = [
  { name: 'Anantnag Lal Chowk', latitude: 33.7300, longitude: 75.1500, address: 'Lal Chowk, Anantnag City, Jammu & Kashmir' },
  { name: 'Pahalgam Valley Resort', latitude: 34.0100, longitude: 75.1900, address: 'Main Market, Pahalgam, Jammu & Kashmir' },
  { name: 'Martand Sun Temple Ruins', latitude: 33.7456, longitude: 75.2203, address: 'Keharbal, Anantnag, Jammu & Kashmir' },
  { name: 'Kokernag Botanical Garden', latitude: 33.5872, longitude: 75.3013, address: 'Kokernag Springs, Anantnag, Jammu & Kashmir' },
  { name: 'Achabal Mughal Garden', latitude: 33.6839, longitude: 75.2195, address: 'Achabal Garden Rd, Achabal, Jammu & Kashmir' },
  { name: 'Verinag Royal Spring', latitude: 33.5500, longitude: 75.2500, address: 'Source of Jhelum, Verinag, Jammu & Kashmir' }
];

export default function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const [session, setSession] = useState(() => rideEngine.getState());
  
  // Locations State
  const [pickup, setPickup] = useState<typeof POPULAR_SHORTCUTS[0] | null>(null);
  const [destination, setDestination] = useState<typeof POPULAR_SHORTCUTS[0] | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [estimatedFare, setEstimatedFare] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<any>(null);

  // Flow State
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRide, setSelectedRide] = useState<RideRequest | null>(null);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Wallet
  const [walletAmount, setWalletAmount] = useState(250);
  const [addFundsInput, setAddFundsInput] = useState('');

  // Auto Geolocate
  useEffect(() => {
    // Set default pickup to Koramangala
    setPickup(POPULAR_SHORTCUTS[0]);
  }, []);

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
      if (state.activeRide) {
        setSelectedRide(state.activeRide);
        setIsSearching(state.activeRide.status === 'searching');
      } else {
        setSelectedRide(null);
        setIsSearching(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute mock distance/duration on pickup or destination changes
  useEffect(() => {
    if (pickup && destination) {
      if (pickup.name === destination.name) {
        setDistance(0);
        setDuration(0);
        setEstimatedFare(0);
        return;
      }

      // Compute mathematical Euclidean distance for mock purposes
      const latDiff = destination.latitude - pickup.latitude;
      const lngDiff = destination.longitude - pickup.longitude;
      const computedDistance = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 10) / 10; // degrees to km approx

      // Min 1.5km
      const finalDistance = Math.max(computedDistance, 1.2);
      const computedDuration = Math.round(finalDistance * 3.5); // ~3.5 min per km on scooty

      setDistance(finalDistance);
      setDuration(computedDuration);

      rideEngine.calculateFare(finalDistance).then((res) => {
        setEstimatedFare(res.fare);
        setBreakdown(res.breakdown);
      });
    }
  }, [pickup, destination]);

  const handleBookRide = async () => {
    if (!pickup || !destination) return;
    setIsSearching(true);
    try {
      await rideEngine.bookRide(
        { address: pickup.address, latitude: pickup.latitude, longitude: pickup.longitude },
        { address: destination.address, latitude: destination.latitude, longitude: destination.longitude },
        distance,
        duration
      );
    } catch (err) {
      console.error(err);
      setIsSearching(false);
    }
  };

  const handleCancelRide = async () => {
    if (selectedRide) {
      await rideEngine.cancelRide(selectedRide.rideId, 'Customer cancelled manually');
      setIsSearching(false);
    }
  };

  const handleAddFunds = () => {
    const amt = parseFloat(addFundsInput);
    if (!isNaN(amt) && amt > 0) {
      setWalletAmount(prev => prev + amt);
      setAddFundsInput('');
      rideEngine.addNotification(
        session.currentUser?.uid || 'guest',
        'Wallet Recharged',
        `₹${amt} successfully added to your wallet account.`
      );
    }
  };

  const handleRatingSubmit = async () => {
    if (selectedRide) {
      await rideEngine.submitRideRating(selectedRide.rideId, ratingStars, ratingComment);
      setRatingSubmitted(true);
      setTimeout(() => {
        rideEngine.clearActiveRide();
        setRatingSubmitted(false);
        setRatingComment('');
        setPickup(POPULAR_SHORTCUTS[0]);
        setDestination(null);
      }, 1500);
    }
  };

  // Get active rider's live coordinates for map rendering
  const getRiderCoordinates = (): LatLng | null => {
    if (!selectedRide || !selectedRide.riderId) return null;
    const rider = session.riders.find(r => r.uid === selectedRide.riderId);
    return rider?.currentLocation || null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen pb-20" id="customer_dashboard_root">
      
      {/* Simulation Info Badge */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-extrabold text-sm text-amber-900 flex items-center space-x-1.5">
            <span>✨ Interactive Simulator Active</span>
          </h2>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Book a scooty ride below. After 4 seconds, a simulated AI driver nearby will accept your request, navigate to your pickup, verify the OTP, and drive to the destination in real time.
          </p>
        </div>
        <span className="text-[10px] bg-amber-500 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-wider self-start sm:self-center">
          Local Sim Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Booking & Status Sheets (Column Span 5) */}
        <div className="lg:col-span-5 space-y-6">

          {/* ACTIVE RIDE ENGINES (STATE MACHINE VIEWS) */}
          {selectedRide ? (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6" id="active_ride_card">
              
              {/* Header Status */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RIDE STATUS</p>
                  <h3 className="font-extrabold text-lg text-amber-500 uppercase tracking-tight mt-0.5 animate-pulse">
                    {selectedRide.status.replace(/_/g, ' ')}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">EST. FARE</p>
                  <p className="text-xl font-black text-gray-900">₹{selectedRide.estimatedFare}</p>
                </div>
              </div>

              {/* SEARCHING ANIMATION */}
              {selectedRide.status === 'searching' && (
                <div className="text-center py-8 space-y-4">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <span className="absolute w-full h-full border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></span>
                    <span className="text-2xl">🛵</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-800">Finding nearby ScootyRiders...</h4>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Allocating the closest on-duty approved rider in Bengaluru Central operating radius.</p>
                  <button
                    onClick={handleCancelRide}
                    className="mt-4 px-4 py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-100 transition-all"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}

              {/* RIDER FOUND & ARRIVING / ARRIVED */}
              {(selectedRide.status === 'accepted' || 
                selectedRide.status === 'rider_arriving' || 
                selectedRide.status === 'rider_arrived') && (
                <div className="space-y-4">
                  
                  {/* Rider Details Card */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 overflow-hidden flex items-center justify-center">
                      {selectedRide.riderPhoto ? (
                        <img src={selectedRide.riderPhoto} alt={selectedRide.riderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <User className="w-6 h-6 text-amber-700" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-gray-900">{selectedRide.riderName || 'Rajesh Kumar'}</p>
                      <div className="flex items-center space-x-1.5 mt-0.5 text-[10px] font-bold text-gray-500">
                        <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded uppercase font-extrabold">
                          {(selectedRide.riderScooty?.color || 'Blue') + ' ' + (selectedRide.riderScooty?.model || 'Activa')}
                        </span>
                        <span>•</span>
                        <span className="text-gray-900 font-bold">{selectedRide.riderScooty?.registrationNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-amber-500 flex items-center justify-end">
                        <Star className="w-3.5 h-3.5 fill-amber-500 inline-block mr-0.5" />
                        <span>{selectedRide.riderRating || 4.8}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">3 min ETA</p>
                    </div>
                  </div>

                  {/* SECURITY OTP DISPLAY (Passenger only) */}
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50 text-center space-y-1.5">
                    <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">Share this OTP with driver to unlock ride</p>
                    <p className="text-3xl font-black tracking-widest text-emerald-950 font-mono">{selectedRide.otp}</p>
                    {selectedRide.status === 'rider_arrived' ? (
                      <span className="inline-block text-[10px] bg-emerald-500 text-white font-extrabold px-2.5 py-0.5 rounded-full mt-2 animate-bounce">
                        🛵 Rider Has Arrived!
                      </span>
                    ) : (
                      <p className="text-[10px] text-emerald-600 font-medium">Rider is currently navigating to your pickup location.</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-2">
                    <a
                      href={`tel:${selectedRide.riderPhone || '9876543210'}`}
                      className="flex-1 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 text-center flex items-center justify-center space-x-1.5"
                    >
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>Call Driver</span>
                    </a>
                    <button
                      onClick={handleCancelRide}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all"
                    >
                      Cancel Ride
                    </button>
                  </div>

                </div>
              )}

              {/* RIDE IN PROGRESS */}
              {selectedRide.status === 'in_progress' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center space-y-1">
                    <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">TRIP IN TRANSIT</p>
                    <p className="text-sm font-extrabold text-gray-800">Heading safely to your destination</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">{selectedRide.destination.address.split(',')[0]}</p>
                  </div>

                  <div className="flex items-center space-x-3.5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-extrabold text-xs text-gray-900">Emergency SOS Support</h4>
                      <p className="text-[10px] text-gray-400">Share live ride status with friends or trigger support alerts instantly.</p>
                    </div>
                    <button 
                      onClick={() => alert(`SOS Emergency Triggered! Live location coordinates: ${selectedRide.pickup.latitude}, ${selectedRide.pickup.longitude} sent to local police control.`)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-lg uppercase tracking-wider transition-all"
                    >
                      Trigger SOS
                    </button>
                  </div>
                </div>
              )}

              {/* RIDE COMPLETED & POST REVIEW */}
              {selectedRide.status === 'completed' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 text-center space-y-2">
                    <span className="text-2xl">🎉</span>
                    <h4 className="font-extrabold text-emerald-900">Arrived at Destination!</h4>
                    <p className="text-xs text-emerald-700 font-medium">Please hand over cash payment of ₹{selectedRide.estimatedFare} directly to {selectedRide.riderName}.</p>
                  </div>

                  {/* Rating Feedback UI */}
                  {!ratingSubmitted ? (
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-inner space-y-4">
                      <p className="text-center font-extrabold text-xs text-gray-700 uppercase tracking-wider">Rate your ScootyRider</p>
                      
                      <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setRatingStars(star)}
                            className="p-1 focus:outline-none"
                          >
                            <Star className={`w-8 h-8 ${star <= ratingStars ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Add optional review comment..."
                        value={ratingComment}
                        onChange={(e) => setRatingComment(e.target.value)}
                        className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-gray-50"
                      />

                      <button
                        onClick={handleRatingSubmit}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-1">
                      <p className="text-xs font-bold text-emerald-600">Review Submitted Successfully!</p>
                      <p className="text-[10px] text-gray-400">Thank you for helping keep ScootyRide safe.</p>
                    </div>
                  )}

                </div>
              )}

            </div>
          ) : (
            /* BOOKING CONTROLLER SHEETS */
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-5" id="booking_form_card">
              <h3 className="font-black text-xl text-gray-900 tracking-tight">Where are you going?</h3>

              {/* Set Pickup */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pickup Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <select
                    value={pickup?.name || ''}
                    onChange={(e) => {
                      const selected = POPULAR_SHORTCUTS.find(s => s.name === e.target.value);
                      if (selected) setPickup(selected);
                    }}
                    className="w-full border border-gray-100 pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 text-gray-800 cursor-pointer"
                  >
                    <option value="" disabled>Select your pickup point...</option>
                    {POPULAR_SHORTCUTS.map((s) => (
                      <option key={s.name} value={s.name}>{s.name} (Auto)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Set Destination */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Destination</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Navigation className="w-4 h-4 text-rose-500" />
                  </div>
                  <select
                    value={destination?.name || ''}
                    onChange={(e) => {
                      const selected = POPULAR_SHORTCUTS.find(s => s.name === e.target.value);
                      if (selected) setDestination(selected);
                    }}
                    className="w-full border border-gray-200 pl-10 pr-4 py-3 bg-white rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 text-gray-800 cursor-pointer"
                  >
                    <option value="" disabled>Select your local destination...</option>
                    {POPULAR_SHORTCUTS.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estimated calculations panel */}
              {pickup && destination && pickup.name !== destination.name && (
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Trip Distance:</span>
                    <span className="text-gray-900">{distance} km</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500">
                    <span>Est. Travel Time:</span>
                    <span className="text-gray-900">{duration} minutes</span>
                  </div>
                  <hr className="border-gray-200/50" />
                  <div className="flex justify-between items-center font-extrabold text-sm text-gray-800">
                    <span>Total Estimated Fare:</span>
                    <span className="text-base text-gray-950 font-black">₹{estimatedFare}</span>
                  </div>
                </div>
              )}

              {/* Book Button */}
              <button
                onClick={handleBookRide}
                disabled={!pickup || !destination || pickup.name === destination.name}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-black rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                id="btn_book_ride_confirm"
              >
                <span>Find a ScootyRider</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MOCK PASSENGER WALLET */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-4">
            <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span>ScootyRide Wallet (Credits)</span>
            </h4>
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">AVAILABLE BALANCE</p>
                <p className="text-2xl font-black text-gray-900">₹{walletAmount}</p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                100% Secure
              </span>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Amount (₹)"
                value={addFundsInput}
                onChange={(e) => setAddFundsInput(e.target.value)}
                className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleAddFunds}
                className="bg-gray-900 hover:bg-black text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all flex-shrink-0"
              >
                Add Funds
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Map Display (Column Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <MapView
            pickup={pickup ? { latitude: pickup.latitude, longitude: pickup.longitude } : null}
            destination={destination ? { latitude: destination.latitude, longitude: destination.longitude } : null}
            riderLocation={getRiderCoordinates()}
            rideStatus={selectedRide ? selectedRide.status : null}
            onSelectPickup={(loc) => setPickup(loc)}
            onSelectDestination={(loc) => setDestination(loc)}
            className="w-full rounded-3xl"
          />

          {/* TRIP HISTORY PANEL */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-gray-400" />
                <span>My Trip Records</span>
              </h4>
              <span className="text-[10px] text-gray-400 font-bold">Showing last 3 rides</span>
            </div>

            <div className="divide-y divide-gray-50">
              {session.allRides.filter(r => r.customerId === session.currentUser?.uid).length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs font-medium">
                  No completed trips yet
                </div>
              ) : (
                session.allRides
                  .filter(r => r.customerId === session.currentUser?.uid)
                  .slice(0, 3)
                  .map((ride) => (
                    <div key={ride.rideId} className="py-3 flex justify-between items-center">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-gray-800 truncate max-w-[150px]">
                            {ride.destination.address.split(',')[0]}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            ride.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {ride.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-semibold">
                          Rider: {ride.riderName || 'N/A'} • {new Date(ride.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-sm font-black text-gray-900">₹{ride.estimatedFare}</span>
                    </div>
                  ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
