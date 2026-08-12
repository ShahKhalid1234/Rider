import React, { useState, useEffect } from 'react';
import { rideEngine } from './services/rideEngine';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import LandingPage from './components/LandingPage';
import CustomerDashboard from './components/CustomerDashboard';
import RiderDashboard from './components/RiderDashboard';
import AdminDashboard from './components/AdminDashboard';
import SupportSystem from './components/SupportSystem';
import { 
  Phone, 
  Key, 
  Smartphone, 
  UserCheck, 
  MapPin, 
  Check, 
  ShieldCheck, 
  ArrowRight,
  User,
  Shield,
  Clock,
  Briefcase
} from 'lucide-react';
import { RiderProfile } from './types';

export default function App() {
  const [route, setRoute] = useState('/');
  const [session, setSession] = useState(() => rideEngine.getState());

  // Login inputs
  const [phone, setPhone] = useState('');
  const [loginRole, setLoginRole] = useState<'customer' | 'rider' | 'admin'>('customer');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [loginName, setLoginName] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<'customer' | 'rider'>('customer');
  const [regMake, setRegMake] = useState('Honda');
  const [regModel, setRegModel] = useState('Activa 6G');
  const [regColor, setRegColor] = useState('Matte Blue');
  const [regNumber, setRegNumber] = useState('KA-01-HE-4827');

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
    });
    return () => unsubscribe();
  }, []);

  // Sync route based on active session role when user logs in/out
  useEffect(() => {
    if (session.currentUser) {
      if (route === '/login' || route === '/register' || route === '/') {
        setRoute(`/${session.currentUser.role}/dashboard`);
      }
    } else {
      // If not logged in and trying to access private page, redirect to land
      if (route.startsWith('/customer') || route.startsWith('/rider') || route.startsWith('/admin')) {
        setRoute('/');
      }
    }
  }, [session.currentUser]);

  // Handle Login Actions
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setLoginStep('otp');
    rideEngine.addNotification(
      'guest',
      'OTP Code Dispatched',
      `Simulated OTP successfully generated and sent to ${phone}. Enter 1234 to verify.`
    );
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '1234' && otpCode !== '4827') {
      alert('Invalid security OTP! Please use 1234 for testing.');
      return;
    }

    try {
      await rideEngine.loginWithPhone(phone, loginRole, loginName);
      setLoginStep('phone');
      setPhone('');
      setOtpCode('');
      setLoginName('');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Register Onboarding Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      alert('Please complete all required fields.');
      return;
    }

    try {
      // Set temporary phone name in system
      const user = await rideEngine.loginWithPhone(regPhone, regRole, regName);
      
      // If rider, update vehicle details
      if (regRole === 'rider' && user) {
        rideEngine.updateRiderScooty(user.uid, regMake, regModel, regColor, regNumber);
      }

      // Reset
      setRegName('');
      setRegPhone('');
      alert('Account registered successfully! Welcome to ScootyRide.');
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Demo logins shortcuts
  const handleQuickLogin = async (phoneArg: string, roleArg: 'customer' | 'rider' | 'admin') => {
    await rideEngine.loginWithPhone(phoneArg, roleArg);
  };

  // --- PRIVATE ROUTE CHECKS ---
  const isAuthorized = (requiredRole: 'customer' | 'rider' | 'admin') => {
    return session.currentUser && session.currentUser.role === requiredRole;
  };

  return (
    <div className="bg-gray-50/30 min-h-screen flex flex-col font-sans" id="app_root">
      
      {/* Dynamic Header */}
      <Navbar onNavigate={setRoute} currentRoute={route} />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* PUBLIC ROUTES */}
        {route === '/' && <LandingPage onNavigate={setRoute} />}

        {route === '/login' && (
          <div className="max-w-md mx-auto px-4 py-16" id="login_page">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <span className="text-4xl">🛵</span>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Access ScootyRide</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Fast phone number verification</p>
              </div>

              {loginStep === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Your Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['customer', 'rider', 'admin'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setLoginRole(r)}
                          className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                            loginRole === r 
                              ? 'bg-amber-500 border-amber-400 text-white shadow-sm' 
                              : 'bg-white border-gray-150 text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loginRole !== 'admin' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Your Name (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Khalid Ashraf"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        className="w-full border border-gray-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-gray-50"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                        <Phone className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        required
                        placeholder="+91 99999 XXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-gray-50"
                        id="login_input_phone"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    id="login_btn_send_otp"
                  >
                    <span>Request Security Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                  <div className="space-y-1.5 text-center bg-amber-50 p-3 rounded-2xl border border-amber-100">
                    <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Simulated verification PIN dispatched</p>
                    <p className="text-xs text-amber-600 font-semibold mt-1">Please enter verification pin code <span className="font-extrabold text-gray-900">1234</span></p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Enter 4-Digit OTP</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                        <Key className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-xl text-xs font-black tracking-widest text-center focus:outline-none focus:border-amber-500 bg-gray-50"
                        id="login_input_otp"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep('phone')}
                      className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md"
                      id="login_btn_verify_confirm"
                    >
                      Verify Code
                    </button>
                  </div>
                </form>
              )}

              {/* DEVELOPER QUICK LOGIN SHORTCUTS */}
              <div className="pt-6 border-t border-gray-50 space-y-3">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block text-center">
                  🛠️ Developer Seed Logins (Instant)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleQuickLogin('customer', 'customer')}
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-[10px] font-extrabold text-left flex items-center space-x-2 cursor-pointer"
                  >
                    <span>👤</span>
                    <div>
                      <p className="text-gray-800">Khalid (User)</p>
                      <p className="text-[8px] text-gray-400">Customer</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('rider1', 'rider')}
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-[10px] font-extrabold text-left flex items-center space-x-2 cursor-pointer"
                  >
                    <span>🛵</span>
                    <div>
                      <p className="text-gray-800">Rajesh (Approved)</p>
                      <p className="text-[8px] text-gray-400">Rider</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('rider5', 'rider')}
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-[10px] font-extrabold text-left flex items-center space-x-2 cursor-pointer"
                  >
                    <span>⏳</span>
                    <div>
                      <p className="text-gray-800">Vikram (Review)</p>
                      <p className="text-[8px] text-gray-400">Rider Onboarding</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickLogin('admin', 'admin')}
                    className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl text-[10px] font-extrabold text-left flex items-center space-x-2 cursor-pointer"
                  >
                    <span>⚙️</span>
                    <div>
                      <p className="text-gray-800">Operator Admin</p>
                      <p className="text-[8px] text-gray-400">Admin Panel</p>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {route === '/register' && (
          <div className="max-w-md mx-auto px-4 py-12" id="register_page">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
              <div className="text-center space-y-1">
                <span className="text-4xl">🛵</span>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">Onboard with ScootyRide</h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Start booking or earning in minutes</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Onboarding Path</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('customer')}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        regRole === 'customer' 
                          ? 'bg-amber-500 border-amber-400 text-white shadow-sm' 
                          : 'bg-white border-gray-150 text-gray-500'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('rider')}
                      className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                        regRole === 'rider' 
                          ? 'bg-amber-500 border-amber-400 text-white shadow-sm' 
                          : 'bg-white border-gray-150 text-gray-500'
                      }`}
                    >
                      Scooty Rider
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-gray-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 91234 56789"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full border border-gray-200 px-4 py-3 rounded-xl text-xs font-semibold focus:outline-none focus:border-amber-500 bg-gray-50"
                  />
                </div>

                {/* Rider Scooty Fields */}
                {regRole === 'rider' && (
                  <div className="pt-2 border-t border-gray-100 space-y-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Scooty details</span>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Make</label>
                        <input
                          type="text"
                          required
                          value={regMake}
                          onChange={(e) => setRegMake(e.target.value)}
                          className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Model</label>
                        <input
                          type="text"
                          required
                          value={regModel}
                          onChange={(e) => setRegModel(e.target.value)}
                          className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Color</label>
                        <input
                          type="text"
                          required
                          value={regColor}
                          onChange={(e) => setRegColor(e.target.value)}
                          className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Reg Number</label>
                        <input
                          type="text"
                          required
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                          className="w-full border border-gray-200 px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                >
                  Onboard & Login
                </button>
              </form>
            </div>
          </div>
        )}

        {route === '/about' && (
          <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
            <h1 className="text-3xl font-black text-gray-950">How It Works</h1>
            <p className="text-sm text-gray-600 leading-relaxed font-semibold">
              ScootyRide bridges the gap in the last-mile commute. Instead of costly car-hailing apps, customers can book a local scooty rider. Here are the simple steps:
            </p>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start space-x-3.5 shadow-sm">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-extrabold">1</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-950">Set local destination</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Pick short commutes across our service areas. Standard shortcuts are loaded on the map helper dashboard.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start space-x-3.5 shadow-sm">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-extrabold">2</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-950">Unlock with passenger OTP</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Your 4-digit code ensures you get on the correct vehicle with the authorized driver. Never get on without OTP verification.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start space-x-3.5 shadow-sm">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-extrabold">3</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gray-950">Pay cash upon arrival</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-normal">Fares are calculated at a base rate plus flat distance metrics. Complete your ride and pay the rider directly.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {route === '/terms' && (
          <div className="max-w-3xl mx-auto px-4 py-16 space-y-6">
            <h1 className="text-3xl font-black text-gray-950">Safety & Operating Guidelines</h1>
            <p className="text-sm text-gray-600 leading-relaxed font-semibold">
              Passenger and Rider protection is our primary concern. Please follow these guidelines:
            </p>
            <ul className="list-disc pl-6 space-y-3.5 text-xs text-gray-500 font-medium">
              <li><strong>Helmet is Compulsory:</strong> Always wear the sterile helmet provided by the rider. It's a legal safety requirement.</li>
              <li><strong>Verify OTP:</strong> Share your 4-digit code only once the driver reaches your exact pickup location.</li>
              <li><strong>Verify Vehicle:</strong> Ensure the scooty's color, make, and number plate match your screen exactly before starting.</li>
              <li><strong>Safe Speeds:</strong> Riders must comply with local speed limits. Report any reckless riding via the Support ticketing portal.</li>
            </ul>
          </div>
        )}

        {route === '/privacy' && (
          <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
            <h1 className="text-3xl font-black text-gray-950">Privacy Policy</h1>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              We respect your privacy. ScootyRide collects geolocations only when booking is open to coordinate rider matching and live trip navigation. We never share documents or private locations with third parties.
            </p>
          </div>
        )}

        {/* CUSTOMER VIEWS */}
        {route === '/customer/dashboard' && isAuthorized('customer') && <CustomerDashboard onNavigate={setRoute} />}
        {route === '/customer/history' && isAuthorized('customer') && <CustomerDashboard onNavigate={setRoute} />}
        {route === '/customer/wallet' && isAuthorized('customer') && <CustomerDashboard onNavigate={setRoute} />}
        {route === '/customer/profile' && isAuthorized('customer') && (
          <div className="max-w-md mx-auto py-16 px-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-4">
              <h3 className="font-black text-lg text-gray-950 pb-2 border-b border-gray-50 uppercase">My Profile Settings</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Profile Name</label>
                  <p className="font-extrabold text-gray-800 text-sm mt-0.5">{session.currentUser?.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Registered Mobile</label>
                  <p className="font-extrabold text-gray-800 text-sm mt-0.5">{session.currentUser?.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Profile Role</label>
                  <p className="font-bold text-amber-800 mt-0.5 uppercase tracking-wide bg-amber-50 px-2 py-0.5 rounded inline-block border border-amber-100">{session.currentUser?.role}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {route === '/customer/support' && isAuthorized('customer') && <SupportSystem onNavigate={setRoute} />}

        {/* RIDER VIEWS */}
        {route === '/rider/dashboard' && isAuthorized('rider') && <RiderDashboard onNavigate={setRoute} />}
        {route === '/rider/earnings' && isAuthorized('rider') && <RiderDashboard onNavigate={setRoute} />}
        {route === '/rider/history' && isAuthorized('rider') && (
          <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center space-x-1.5">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Rider Trip Logs</span>
            </h1>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 divide-y divide-gray-50">
              {session.allRides.filter(r => r.riderId === session.currentUser?.uid).length === 0 ? (
                <p className="text-center py-6 text-xs font-semibold text-gray-400">No trips completed on database yet</p>
              ) : (
                session.allRides
                  .filter(r => r.riderId === session.currentUser?.uid)
                  .map((ride) => (
                    <div key={ride.rideId} className="py-3 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-extrabold text-gray-900">Trip to: {ride.destination.address.split(',')[0]}</p>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Passenger: {ride.customerName} | {new Date(ride.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="font-black text-emerald-600">₹{Math.round(ride.estimatedFare * 0.9)}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
        {route === '/rider/profile' && isAuthorized('rider') && (
          <div className="max-w-md mx-auto py-16 px-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-md space-y-4">
              <h3 className="font-black text-lg text-gray-950 pb-2 border-b border-gray-50 uppercase">Rider & Vehicle Profile</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Driver Name</label>
                  <p className="font-extrabold text-gray-800 text-sm mt-0.5">{session.currentUser?.name}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Mobile Number</label>
                  <p className="font-extrabold text-gray-800 text-sm mt-0.5">{session.currentUser?.phone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Scooty Make & Model</label>
                  <p className="font-extrabold text-emerald-700 font-bold mt-0.5">
                    {(session.currentUser as RiderProfile).scooty?.color} {(session.currentUser as RiderProfile).scooty?.make} {(session.currentUser as RiderProfile).scooty?.model}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase">Registration Number</label>
                  <p className="font-extrabold text-gray-800 font-mono mt-0.5">{(session.currentUser as RiderProfile).scooty?.registrationNumber}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {route === '/rider/support' && isAuthorized('rider') && <SupportSystem onNavigate={setRoute} />}

        {/* ADMIN VIEWS */}
        {route === '/admin/dashboard' && isAuthorized('admin') && <AdminDashboard onNavigate={setRoute} />}
        {route === '/admin/riders' && isAuthorized('admin') && <AdminDashboard onNavigate={setRoute} />}
        {route === '/admin/fare-settings' && isAuthorized('admin') && <AdminDashboard onNavigate={setRoute} />}
        {route === '/admin/support' && isAuthorized('admin') && <SupportSystem onNavigate={setRoute} />}

      </main>

      {/* Mobile Sticky Tab bar */}
      <MobileBottomNav onNavigate={setRoute} currentRoute={route} />

      {/* Spacing for mobile tab-bar safe bounds */}
      <div className="h-16 md:hidden"></div>

    </div>
  );
}
