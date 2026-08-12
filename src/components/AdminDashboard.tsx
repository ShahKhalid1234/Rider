import React, { useState, useEffect } from 'react';
import { rideEngine } from '../services/rideEngine';
import { RiderProfile, FareSettings, ServiceArea, RideRequest } from '../types';
import { 
  Users, 
  MapPin, 
  Settings, 
  Activity, 
  TrendingUp, 
  UserCheck, 
  XCircle, 
  ShieldAlert, 
  DollarSign, 
  Clock, 
  HelpCircle,
  FileText,
  AlertTriangle,
  ArrowRight,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (route: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [session, setSession] = useState(() => rideEngine.getState());

  // Editable Fare Settings State
  const [baseFare, setBaseFare] = useState('30');
  const [perKmRate, setPerKmRate] = useState('12');
  const [minimumFare, setMinimumFare] = useState('40');
  const [bookingFee, setBookingFee] = useState('5');
  const [platformCommission, setPlatformCommission] = useState('10');

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
      // Hydrate forms
      setBaseFare(state.fareSettings.baseFare.toString());
      setPerKmRate(state.fareSettings.perKmRate.toString());
      setMinimumFare(state.fareSettings.minimumFare.toString());
      setBookingFee(state.fareSettings.bookingFee.toString());
      setPlatformCommission(state.fareSettings.platformCommissionPercent.toString());
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateFare = async (e: React.FormEvent) => {
    e.preventDefault();
    const settings: FareSettings = {
      baseFare: parseFloat(baseFare) || 30,
      perKmRate: parseFloat(perKmRate) || 12,
      minimumFare: parseFloat(minimumFare) || 40,
      bookingFee: parseFloat(bookingFee) || 5,
      platformCommissionPercent: parseFloat(platformCommission) || 10,
      cancellationFee: 15
    };
    await rideEngine.updateFareSettings(settings);
    alert('Global pricing matrix updated successfully on database!');
  };

  const handleToggleRiderStatus = async (uid: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    await rideEngine.updateRiderOnboarding(uid, nextStatus);
  };

  const handleToggleServiceArea = async (areaId: string, currentActive: boolean) => {
    await rideEngine.updateServiceArea(areaId, !currentActive);
  };

  // Metric Computations
  const totalRiders = session.riders.length;
  const approvedRiders = session.riders.filter(r => r.verificationStatus === 'approved').length;
  const onlineRiders = session.riders.filter(r => r.online).length;
  const activeRides = session.allRides.filter(r => 
    !['completed', 'cancelled_by_customer', 'cancelled_by_rider', 'cancelled_by_system'].includes(r.status)
  ).length;

  const totalEarningsGross = session.allRides
    .filter(r => r.status === 'completed')
    .reduce((acc, r) => acc + (r.finalFare || r.estimatedFare), 0);

  const platformCommissionsRevenue = Math.round(totalEarningsGross * (session.fareSettings.platformCommissionPercent / 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen pb-20" id="admin_dashboard_root">
      
      {/* HEADER TITLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-rose-500" />
            <span>ScootyRide Operator Control Room</span>
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">
            Global fleet oversight, fares parameters, and onboarding audits
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Live Telemetry Grid</span>
        </div>
      </div>

      {/* 1. OVERVIEW METRICS PANEL */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl hidden sm:block">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">COMMISSIONS (NET)</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">₹{platformCommissionsRevenue}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Platform operators share</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl hidden sm:block">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ONLINE FLEETS</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{onlineRiders}/{totalRiders}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Riders currently on duty</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl hidden sm:block">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ACTIVE TRANSITS</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{activeRides}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Rides currently in transit</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl hidden sm:block">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FLEET GMV</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">₹{totalEarningsGross}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-0.5">Gross ride revenue volume</p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Rider Approvals & Active Rides Tables (Column Span 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* FLEET DRIVERS ONBOARDING VERIFICATIONS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="rider_onboarding_manager">
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/40">
              <h3 className="font-extrabold text-sm text-gray-950 uppercase tracking-tight flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <span>Rider Documents & Onboarding Reviews</span>
              </h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black uppercase">
                {session.riders.length} Registered
              </span>
            </div>

            <div className="divide-y divide-gray-50 overflow-x-auto">
              {session.riders.map((rider) => (
                <div key={rider.uid} className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/40 transition-all">
                  
                  {/* Driver Basics */}
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 overflow-hidden flex items-center justify-center">
                      {rider.photoURL ? (
                        <img src={rider.photoURL} alt={rider.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Users className="w-5 h-5 text-amber-700" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-900">{rider.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{rider.phone}</p>
                      <div className="flex items-center space-x-1 text-[9px] font-bold text-gray-500 mt-1">
                        <span className="bg-gray-100 text-gray-800 px-1 rounded uppercase">{rider.scooty.color} {rider.scooty.make} {rider.scooty.model}</span>
                        <span>•</span>
                        <span className="text-gray-900">{rider.scooty.registrationNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Document Review Status */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-400 font-black uppercase tracking-wider block">Document Review</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">License ✓</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-extrabold">RC RC ✓</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2.5 self-end sm:self-center">
                    <span className={`text-[9px] font-black border rounded px-2 py-0.5 uppercase tracking-wider ${
                      rider.verificationStatus === 'approved' 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border-amber-200'
                    }`}>
                      {rider.verificationStatus.replace('_', ' ')}
                    </span>
                    
                    <button
                      onClick={() => handleToggleRiderStatus(rider.uid, rider.verificationStatus)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all ${
                        rider.verificationStatus === 'approved'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {rider.verificationStatus === 'approved' ? 'Suspend' : 'Approve'}
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE TRIP TELEMETRY LOGS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" id="live_ride_logs">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/40">
              <h3 className="font-extrabold text-sm text-gray-950 uppercase tracking-tight">
                All-Time Booking logs & Live Audits
              </h3>
            </div>

            <div className="overflow-x-auto divide-y divide-gray-50">
              {session.allRides.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs font-semibold">
                  No transits logged on database yet
                </div>
              ) : (
                session.allRides.map((ride) => (
                  <div key={ride.rideId} className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50/40 transition-all text-xs">
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-gray-800">RIDE #{ride.rideId.slice(-6)}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                          ride.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {ride.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold">
                        Passenger: {ride.customerName} | Rider: {ride.riderName || 'Searching...'}
                      </p>
                    </div>

                    <div className="space-y-0.5 text-left sm:text-right">
                      <p className="font-bold text-gray-600 truncate max-w-[200px]">To: {ride.destination.address.split(',')[0]}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{ride.estimatedDistanceKm} km ({ride.estimatedDurationMinutes} mins)</p>
                    </div>

                    <div className="text-right self-end sm:self-center">
                      <p className="font-black text-gray-900">₹{ride.estimatedFare}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase">{ride.paymentMethod}</p>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Fare Matrix Tweaks & Zones (Column Span 4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* PRICING ENGINE PARAMETERS */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4" id="fare_settings_editor">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
              <Settings className="w-5 h-5 text-rose-500" />
              <h3 className="font-black text-sm text-gray-900 uppercase">Pricing & Fare Matrix</h3>
            </div>

            <form onSubmit={handleUpdateFare} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Base Fare (₹)</label>
                  <input
                    type="number"
                    value={baseFare}
                    onChange={(e) => setBaseFare(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Per KM Rate (₹)</label>
                  <input
                    type="number"
                    value={perKmRate}
                    onChange={(e) => setPerKmRate(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Min Fare (₹)</label>
                  <input
                    type="number"
                    value={minimumFare}
                    onChange={(e) => setMinimumFare(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Booking Fee (₹)</label>
                  <input
                    type="number"
                    value={bookingFee}
                    onChange={(e) => setBookingFee(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Platform Commission (%)</label>
                <input
                  type="number"
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(e.target.value)}
                  className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-rose-500/10 transition-all cursor-pointer"
              >
                Apply Parameters
              </button>
            </form>
          </div>

          {/* ACTIVE SERVICE OPERATIONAL AREAS */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4" id="service_zones_editor">
            <div className="flex items-center space-x-2 pb-2 border-b border-gray-50">
              <MapPin className="w-5 h-5 text-emerald-500" />
              <h3 className="font-black text-sm text-gray-900 uppercase">Operational Zones</h3>
            </div>

            <div className="space-y-3">
              {session.serviceAreas.map((area) => (
                <div key={area.areaId} className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                  <div>
                    <h4 className="font-extrabold text-xs text-gray-900 leading-tight">{area.name.split(' ')[0]} Area</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{area.operatingRadiusKm} KM Radius Active</p>
                  </div>
                  
                  <button
                    onClick={() => handleToggleServiceArea(area.areaId, area.active)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      area.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {area.active ? 'Active' : 'Offline'}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
