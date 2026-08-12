import React, { useState, useEffect } from 'react';
import { rideEngine } from '../services/rideEngine';
import { UserProfile, RiderProfile, SystemNotification } from '../types';
import { 
  Bell, 
  LogOut, 
  User, 
  MapPin, 
  CheckCircle, 
  Wifi, 
  Cpu, 
  Menu, 
  X,
  CreditCard,
  Shield,
  Phone
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export default function Navbar({ onNavigate, currentRoute }: NavbarProps) {
  const [session, setSession] = useState(() => rideEngine.getState());
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    rideEngine.logout();
    onNavigate('/');
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleToggleMode = () => {
    const nextMode = session.mode === 'simulated' ? 'cloud' : 'simulated';
    rideEngine.setMode(nextMode);
  };

  const unreadNotifs = session.notifications.filter(n => !n.read).length;

  const handleMarkRead = (id: string) => {
    rideEngine.markNotificationRead(id);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'rider': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" id="scootyride_header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onNavigate('/')}>
            <div className="p-2 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/20 flex items-center justify-center">
              <span className="font-bold text-lg tracking-tight">🛵</span>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-gray-900 leading-tight">
                Scooty<span className="text-amber-500">Ride</span>
              </span>
              <span className="text-[9px] text-gray-500 font-medium tracking-wider uppercase -mt-0.5">Hyperlocal Booking</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => onNavigate('/')} 
              className={`text-sm font-medium transition-colors ${currentRoute === '/' ? 'text-amber-500' : 'text-gray-600 hover:text-gray-900'}`}
              id="nav_btn_home"
            >
              Home
            </button>
            <button 
              onClick={() => onNavigate('/about')} 
              className={`text-sm font-medium transition-colors ${currentRoute === '/about' ? 'text-amber-500' : 'text-gray-600 hover:text-gray-900'}`}
              id="nav_btn_about"
            >
              How It Works
            </button>
            <button 
              onClick={() => onNavigate('/terms')} 
              className={`text-sm font-medium transition-colors ${currentRoute === '/terms' ? 'text-amber-500' : 'text-gray-600 hover:text-gray-900'}`}
              id="nav_btn_terms"
            >
              Safety Guidelines
            </button>
          </nav>

          {/* Configuration & Profiles */}
          <div className="flex items-center space-x-4">
            
            {/* Simulation/Cloud Selector */}
            <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100 shadow-inner">
              <button
                onClick={handleToggleMode}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  session.mode === 'simulated' 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Simulation: autonomous AI riders, routes, and OTP automated testing"
                id="btn_mode_sim"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Simulation</span>
              </button>
              <button
                onClick={handleToggleMode}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  session.mode === 'cloud' 
                    ? 'bg-blue-500 text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
                title="Cloud Mode: syncs directly with Firebase database for multiple devices"
                id="btn_mode_cloud"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span>Live Cloud</span>
              </button>
            </div>

            {/* Authenticated user controls */}
            {session.currentUser ? (
              <div className="flex items-center space-x-3">
                {/* Dashboard Shortcut */}
                <button
                  onClick={() => {
                    const r = session.currentUser?.role;
                    onNavigate(`/${r}/dashboard`);
                  }}
                  className="hidden sm:inline-flex items-center text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 transition-all"
                  id="nav_btn_dashboard"
                >
                  My Dashboard
                </button>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotifOpen(!isNotifOpen);
                      setIsProfileOpen(false);
                    }}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl border border-gray-100 transition-all relative"
                    id="btn_notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <span className="font-bold text-xs text-gray-800 uppercase tracking-wider">Inbox Notifications</span>
                        {unreadNotifs > 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                            {unreadNotifs} Unread
                          </span>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                        {session.notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-gray-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          session.notifications.map((notif) => (
                            <div 
                              key={notif.notificationId} 
                              className={`p-3.5 hover:bg-gray-50/50 transition-all cursor-pointer ${notif.read ? 'opacity-70' : 'bg-amber-50/20'}`}
                              onClick={() => handleMarkRead(notif.notificationId)}
                            >
                              <div className="flex justify-between items-start mb-0.5">
                                <span className="font-semibold text-xs text-gray-800 leading-tight">{notif.title}</span>
                                {!notif.read && <span className="w-2 h-2 bg-amber-500 rounded-full mt-1 flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-gray-500 leading-normal">{notif.body}</p>
                              <span className="text-[9px] text-gray-400 mt-1 block">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Trigger */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotifOpen(false);
                    }}
                    className="flex items-center space-x-1.5 focus:outline-none"
                    id="btn_profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center overflow-hidden">
                      {session.currentUser.photoURL ? (
                        <img 
                          src={session.currentUser.photoURL} 
                          alt={session.currentUser.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="w-4 h-4 text-amber-700" />
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1.5 z-50">
                      <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/40">
                        <p className="text-xs font-bold text-gray-800 truncate">{session.currentUser.name}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{session.currentUser.phone}</p>
                        <span className={`inline-block text-[9px] font-bold border rounded px-1.5 py-0.5 uppercase tracking-wider mt-2 ${getRoleBadgeColor(session.currentUser.role)}`}>
                          {session.currentUser.role}
                        </span>
                        {session.currentUser.role === 'rider' && (
                          <div className="text-[10px] font-semibold text-emerald-600 mt-1.5 flex items-center space-x-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
                            <span>Rating: {(session.currentUser as RiderProfile).rating || 5.0}★</span>
                          </div>
                        )}
                      </div>
                      <div className="p-1">
                        <button
                          onClick={() => {
                            const r = session.currentUser?.role;
                            onNavigate(`/${r}/dashboard`);
                            setIsProfileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
                        >
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>My Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            onNavigate(`/${session.currentUser?.role}/profile`);
                            setIsProfileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          <span>My Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            onNavigate(`/${session.currentUser?.role}/support`);
                            setIsProfileOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-all flex items-center space-x-2"
                        >
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span>Help & Support</span>
                        </button>
                        <hr className="my-1 border-gray-50" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-600 hover:text-rose-900 hover:bg-rose-50/50 font-bold transition-all flex items-center space-x-2"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-950 transition-all"
                  id="nav_btn_login"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                  id="nav_btn_signup"
                >
                  Join ScootyRide
                </button>
              </div>
            )}

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 md:hidden text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
              id="btn_hamburger"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-50 bg-white/95 px-4 py-4 space-y-3 shadow-lg">
          <button
            onClick={() => { onNavigate('/'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${currentRoute === '/' ? 'text-amber-600 bg-amber-50' : 'text-gray-600'}`}
          >
            Home
          </button>
          <button
            onClick={() => { onNavigate('/about'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${currentRoute === '/about' ? 'text-amber-600 bg-amber-50' : 'text-gray-600'}`}
          >
            How It Works
          </button>
          <button
            onClick={() => { onNavigate('/terms'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${currentRoute === '/terms' ? 'text-amber-600 bg-amber-50' : 'text-gray-600'}`}
          >
            Safety Guidelines
          </button>
          {session.currentUser && (
            <div className="pt-2 border-t border-gray-50 space-y-2">
              <div className="px-3 py-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                My Accounts ({session.currentUser.role})
              </div>
              <button
                onClick={() => { onNavigate(`/${session.currentUser?.role}/dashboard`); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => { onNavigate(`/${session.currentUser?.role}/profile`); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm text-gray-600 font-medium"
              >
                Profile Details
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-rose-600 font-bold"
              >
                Logout Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
