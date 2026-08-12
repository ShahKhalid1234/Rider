import React, { useState, useEffect } from 'react';
import { rideEngine } from '../services/rideEngine';
import { 
  Home, 
  Clock, 
  Wallet, 
  User, 
  HelpCircle, 
  TrendingUp, 
  Settings, 
  Users, 
  Activity,
  FileText
} from 'lucide-react';

interface MobileBottomNavProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export default function MobileBottomNav({ onNavigate, currentRoute }: MobileBottomNavProps) {
  const [session, setSession] = useState(() => rideEngine.getState());

  useEffect(() => {
    const unsubscribe = rideEngine.subscribe((state) => {
      setSession(state);
    });
    return () => unsubscribe();
  }, []);

  if (!session.currentUser) return null;

  const role = session.currentUser.role;

  // Custom tabs per role
  const getTabs = () => {
    switch (role) {
      case 'admin':
        return [
          { label: 'Metrics', route: '/admin/dashboard', icon: Activity },
          { label: 'Riders', route: '/admin/riders', icon: Users },
          { label: 'Pricing', route: '/admin/fare-settings', icon: Settings },
          { label: 'Support', route: '/admin/support', icon: HelpCircle }
        ];
      case 'rider':
        return [
          { label: 'Duty', route: '/rider/dashboard', icon: Home },
          { label: 'Earnings', route: '/rider/earnings', icon: TrendingUp },
          { label: 'Trips', route: '/rider/history', icon: Clock },
          { label: 'Profile', route: '/rider/profile', icon: User }
        ];
      default: // customer
        return [
          { label: 'Book Ride', route: '/customer/dashboard', icon: Home },
          { label: 'My Trips', route: '/customer/history', icon: Clock },
          { label: 'Wallet', route: '/customer/wallet', icon: Wallet },
          { label: 'Profile', route: '/customer/profile', icon: User }
        ];
    }
  };

  const tabs = getTabs();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl z-40 pb-safe" id="mobile_bottom_nav">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentRoute === tab.route;
          return (
            <button
              key={tab.route}
              onClick={() => onNavigate(tab.route)}
              className="flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-all focus:outline-none"
              id={`tab_btn_${tab.label.toLowerCase().replace(' ', '_')}`}
            >
              <IconComponent 
                className={`w-5 h-5 transition-transform ${
                  isActive ? 'text-amber-500 scale-110' : 'text-gray-400 hover:text-gray-600'
                }`} 
              />
              <span className={`text-[9px] font-bold mt-1 tracking-wide uppercase ${
                isActive ? 'text-amber-500 font-extrabold' : 'text-gray-400'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
