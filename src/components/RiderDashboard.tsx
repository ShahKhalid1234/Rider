import React, { useState, useEffect } from 'react';
import { rideEngine } from '../services/rideEngine';
import { RiderProfile, RideRequest } from '../types';
import MapView from './MapView';
import { 
  Wifi, 
  WifiOff, 
  MapPin, 
  User, 
  Check, 
  ShieldAlert, 
  Smartphone, 
  X, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  History,
  Phone,
  FileText,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface RiderDashboardProps {
  onNavigate: (route: string) => void;
}

export default function RiderDashboard({ onNavigate }: RiderDashboardProps) {
  const [session, setSession] = useState(() => rideEngine.getState());
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Verification Form Uploads Sim
  const [licenseUploaded, setLicenseUploaded] = useState(true);
  const [rcUploaded, setRcUploaded] = useState(true);

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
    });
    return () => unsubscribe();
  }, []);

  const profile = session.currentUser as RiderProfile;
  if (!profile) return null;

  const handleToggleOnline = async () => {
    if (profile.verificationStatus !== 'approved') return;
    await rideEngine.goOnlineToggle(profile.uid, !profile.online);
  };

  const handleDocumentSubmit = async () => {
    // Submit files to verification review
    await rideEngine.updateRiderOnboarding(profile.uid, 'under_review');
  };

  const handleAcceptRide = async (rideId: string) => {
    await rideEngine.acceptRide(rideId, profile.uid);
  };

  const handleArrived = async (rideId: string) => {
    await rideEngine.riderArrivedAtPickup(rideId);
  };

  const handleVerifyOtp = async (rideId: string) => {
    const success = await rideEngine.startRideWithOTP(rideId, otpInput);
    if (!success) {
      setOtpError(true);
    } else {
      setOtpError(false);
      setOtpInput('');
    }
  };

  const handleEndRide = async (rideId: string) => {
    await rideEngine.endRide(rideId);
  };

  // Find incoming ride request matching 'searching' state (simulating a request incoming for this driver)
  const incomingRequests = session.allRides.filter(r => r.status === 'searching');
  const activeAssignedRide = session.activeRide && session.activeRide.riderId === profile.uid ? session.activeRide : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen pb-20" id="rider_dashboard_root">
      
      {/* 1. VERIFICATION CHECK / ONBOARDING */}
      {profile.verificationStatus !== 'approved' && (
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 space-y-4 mb-6">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-amber-900 uppercase tracking-tight">Your driver account is under verification</h2>
              <p className="text-xs text-amber-700 leading-relaxed font-semibold mt-1">
                Local rules require human review of registration documents. Please verify your driving license and registration papers below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-black text-gray-800">Commercial Driving License</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase">✓ Submitted</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-xs font-black text-gray-800">Scooty RC registration</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase">✓ Submitted</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="font-semibold text-amber-800">Status: {profile.verificationStatus.replace('_', ' ').toUpperCase()}</span>
            <button
              onClick={() => rideEngine.updateRiderOnboarding(profile.uid, 'approved')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl transition-all"
            >
              Simulate Instant Admin Approval
            </button>
          </div>
        </div>
      )}

      {/* 2. ON DUTY CONTROL / METRICS */}
      {profile.verificationStatus === 'approved' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
          
          {/* Active online toggle */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ON DUTY STATUS</p>
              <h3 className="font-black text-base text-gray-800 tracking-tight mt-0.5">
                {profile.online ? 'YOU ARE ONLINE' : 'YOU ARE OFFLINE'}
              </h3>
            </div>
            
            <button
              onClick={handleToggleOnline}
              className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 ${
                profile.online 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/10' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
              }`}
              id="rider_btn_duty_toggle"
            >
              {profile.online ? (
                <>
                  <Wifi className="w-4 h-4 animate-ping" />
                  <span>On Duty (Online)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Go Online</span>
                </>
              )}
            </button>
          </div>

          {/* Today earnings */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TODAY'S NET</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">₹{profile.todayEarnings}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Platform fee deducted</p>
            </div>
          </div>

          {/* Today rides */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TODAY'S RIDES</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{profile.todayRides}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">Completed rides</p>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">MY RATING</p>
              <p className="text-2xl font-black text-gray-900 mt-0.5">{profile.rating}★</p>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">Out of {profile.totalRides} trips</p>
            </div>
          </div>

        </div>
      )}

      {/* 3. ACTIVE ASSIGNED RIDE AND REQUEST TERMINALS */}
      {profile.verificationStatus === 'approved' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Ride Details / Incoming Requests (Column Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {activeAssignedRide ? (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-6" id="rider_active_card">
                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                  <div>
                    <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                      ACTIVE TRANSIT
                    </span>
                    <h3 className="font-extrabold text-base text-gray-950 uppercase mt-2">
                      {activeAssignedRide.status.replace(/_/g, ' ')}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">EARNINGS</p>
                    <p className="text-lg font-black text-emerald-600">₹{Math.round(activeAssignedRide.estimatedFare * 0.9)}</p>
                  </div>
                </div>

                {/* PASSENGER CARD */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                    <User className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-extrabold text-xs text-gray-900">{activeAssignedRide.customerName}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{activeAssignedRide.customerPhone}</p>
                  </div>
                  <a
                    href={`tel:${activeAssignedRide.customerPhone}`}
                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>

                {/* PROGRESS CONTROLLER */}
                {activeAssignedRide.status === 'accepted' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">NAVIGATE TO PICKUP</p>
                      <p className="text-xs text-gray-700 font-extrabold mt-1 truncate">{activeAssignedRide.pickup.address}</p>
                    </div>
                    <button
                      onClick={() => handleArrived(activeAssignedRide.rideId)}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all"
                      id="rider_btn_arrived"
                    >
                      I Have Arrived at Pickup
                    </button>
                  </div>
                )}

                {activeAssignedRide.status === 'rider_arrived' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center space-y-1">
                      <p className="text-[10px] font-black text-amber-800 uppercase tracking-wider">WAITING FOR CUSTOMER</p>
                      <p className="text-xs font-semibold text-gray-500">Ask the passenger for their 4-digit code to start the ride.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Enter OTP Code</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={4}
                          placeholder="XXXX"
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          className={`flex-1 border text-center font-bold tracking-widest text-lg px-4 py-2.5 rounded-xl focus:outline-none focus:border-amber-500 ${
                            otpError ? 'border-rose-500 bg-rose-50' : 'border-gray-200 bg-white'
                          }`}
                        />
                        <button
                          onClick={() => handleVerifyOtp(activeAssignedRide.rideId)}
                          className="px-6 bg-gray-900 hover:bg-black text-white font-black text-xs rounded-xl transition-all"
                          id="rider_btn_verify_otp"
                        >
                          Verify OTP
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wide">Incorrect security pin. Check passenger's screen.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeAssignedRide.status === 'in_progress' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                      <p className="text-[10px] font-black text-blue-800 uppercase tracking-wider">TRIP IN PROGRESS</p>
                      <p className="text-xs text-gray-700 font-extrabold mt-1 truncate">{activeAssignedRide.destination.address}</p>
                    </div>
                    
                    <button
                      onClick={() => handleEndRide(activeAssignedRide.rideId)}
                      className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/10 transition-all"
                      id="rider_btn_end_ride"
                    >
                      End Ride at Destination
                    </button>
                  </div>
                )}

                {activeAssignedRide.status === 'completed' && (
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 text-center space-y-2">
                    <span className="text-2xl">🎉</span>
                    <h4 className="font-extrabold text-emerald-950">Trip Completed Successfully!</h4>
                    <p className="text-xs text-emerald-700 font-medium">Please collect ₹{activeAssignedRide.estimatedFare} cash directly from passenger.</p>
                    <button
                      onClick={() => rideEngine.clearActiveRide()}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all mt-2"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                )}

              </div>
            ) : (
              
              /* NO ACTIVE RIDE: INCOMING BOARD LIST */
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md space-y-5">
                <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                  <h3 className="font-black text-base text-gray-950 tracking-tight uppercase">Incoming Requests</h3>
                  <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-black animate-pulse">
                    ONLINE
                  </span>
                </div>

                {!profile.online ? (
                  <div className="text-center py-12 space-y-3">
                    <WifiOff className="w-10 h-10 text-gray-300 mx-auto" />
                    <h4 className="font-extrabold text-xs text-gray-500">You are offline</h4>
                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Toggle "Go Online" at the top-left of the screen to start receiving local booking alerts.</p>
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <div className="text-center py-12 space-y-3 animate-pulse">
                    <Smartphone className="w-10 h-10 text-amber-400 mx-auto" />
                    <h4 className="font-extrabold text-xs text-gray-800">Waiting for local ride bookings...</h4>
                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto">Keep this window open. Nearby customers booking scooty trips will pop up instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((req) => (
                      <div key={req.rideId} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3 shadow-inner">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-black text-gray-400">TRIP #{req.rideId.slice(-4)}</span>
                          <span className="text-emerald-600 font-extrabold text-sm">₹{Math.round(req.estimatedFare * 0.9)} (Net)</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1 flex-shrink-0"></span>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pickup</p>
                              <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{req.pickup.address.split(',')[0]}</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-2">
                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full mt-1 flex-shrink-0"></span>
                            <div>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Destination</p>
                              <p className="text-xs font-bold text-gray-800 truncate max-w-[200px]">{req.destination.address.split(',')[0]}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold pt-1">
                          <span>Trip Distance: {req.estimatedDistanceKm} km</span>
                          <span>•</span>
                          <span>Duration: {req.estimatedDurationMinutes} mins</span>
                        </div>

                        <button
                          onClick={() => handleAcceptRide(req.rideId)}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all mt-2"
                        >
                          Accept Booking
                        </button>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* DRIVER STATS CARD */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-md">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center space-x-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  <span>Wallet & Earnings Log</span>
                </h4>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold uppercase">Safe Wallet</span>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold">Base Gross Booking Revenue</span>
                  <span className="text-xs font-black text-gray-800">₹{Math.round(profile.todayEarnings / 0.9)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold">10% Platform Operator Commission</span>
                  <span className="text-xs font-black text-rose-500">-₹{Math.round(profile.todayEarnings * 0.1)}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-800 font-extrabold">Net Wallet Earnings Payout</span>
                  <span className="text-base font-black text-emerald-600">₹{profile.todayEarnings}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Map Canvas (Column Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <MapView
              pickup={activeAssignedRide ? { latitude: activeAssignedRide.pickup.latitude, longitude: activeAssignedRide.pickup.longitude } : null}
              destination={activeAssignedRide ? { latitude: activeAssignedRide.destination.latitude, longitude: activeAssignedRide.destination.longitude } : null}
              riderLocation={profile.currentLocation || null}
              rideStatus={activeAssignedRide ? activeAssignedRide.status : null}
              className="w-full h-[400px] sm:h-[480px] rounded-3xl"
            />
          </div>

        </div>
      )}

    </div>
  );
}
