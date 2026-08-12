import React, { useState } from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Key, 
  Clock, 
  ChevronDown, 
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is ScootyRide?",
      a: "ScootyRide is a hyperlocal ride-hailing marketplace specifically for short-distance commutes. You hire a professional rider who drives you safely to your local destination on their verified scooty."
    },
    {
      q: "How does OTP verification work?",
      a: "To guarantee passenger safety, every ride generates a secure 4-digit PIN (OTP) displayed only on the customer's app. The rider must enter this OTP into their terminal to unlock and start the trip."
    },
    {
      q: "Are the riders verified?",
      a: "Yes, 100%. Before any rider is allowed online, an admin reviews their driver's license, vehicle registration, background details, and commercial insurance to ensure maximum safety and legality."
    },
    {
      q: "How are fares calculated?",
      a: "Fares are structured on a base fare plus a flat per-kilometer rate. The system shows you a transparent, guaranteed estimate before you confirm your request, and there are no hidden surge fees."
    }
  ];

  return (
    <div className="bg-white min-h-screen" id="landing_page_root">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-amber-500/10 via-white to-gray-50 pt-10 pb-20 overflow-hidden" id="hero_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Text */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-amber-100/80 px-3.5 py-1.5 rounded-full border border-amber-200 text-amber-900 text-xs font-extrabold uppercase tracking-widest shadow-sm">
                <span>🌟 Welcome to the Future of Commute</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
                Short trips made <span className="text-amber-500">simple</span>.
              </h1>
              <p className="text-lg text-gray-600 font-medium max-w-lg mx-auto lg:mx-0">
                Book a verified, professional scooty rider near you and reach your local destination quickly. No traffic hassles, no parking stresses. Just quick rides and quick pickups.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  id="hero_btn_book"
                >
                  <span>Book a Ride Now</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-extrabold rounded-2xl shadow-md transition-all cursor-pointer"
                  id="hero_btn_driver"
                >
                  Become a Rider
                </button>
              </div>

              {/* Statistics overlay */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-100 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-3xl font-black text-gray-900">3 Min</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Avg Pickup</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900">100%</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Verified Drivers</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-gray-900">₹40</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">Min Fare</p>
                </div>
              </div>
            </div>

            {/* Right Column Illustration */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-amber-400/25 to-yellow-300/20 rounded-[3rem] p-8 flex items-center justify-center overflow-hidden border border-amber-100/50">
                {/* Floating Scooty elements */}
                <div className="text-[120px] filter drop-shadow-2xl animate-bounce">🛵</div>
                
                {/* Floating location cards */}
                <div className="absolute top-8 left-8 bg-white/90 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-lg flex items-center space-x-3 max-w-[200px] animate-pulse">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pickup Location</p>
                    <p className="text-xs font-extrabold text-gray-800 truncate">Indiranagar Metro</p>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 bg-white/90 backdrop-blur p-4 rounded-2xl border border-gray-100 shadow-lg flex items-center space-x-3 max-w-[200px]">
                  <div className="p-1.5 bg-rose-500 text-white rounded-lg">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">OTP Verified</p>
                    <p className="text-xs font-black text-gray-800 tracking-wider">🟢 4827</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100" id="how_it_works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">How ScootyRide Works</h2>
            <p className="text-gray-500 font-medium">Get a ride on the go in 4 simple clicks. It's rapid, transparent, and direct.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center">1</div>
              <h3 className="font-extrabold text-base text-gray-900">Set Destination</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Input your destination on our simple localized map layout to get distance estimates.</p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center">2</div>
              <h3 className="font-extrabold text-base text-gray-900">Find Nearby Rider</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Our system automatically matches you with the nearest approved ScootyRider on duty.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center">3</div>
              <h3 className="font-extrabold text-base text-gray-900">OTP Ride Unlock</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Verify your rider by sharing the 4-digit security PIN displayed on your app to start transit.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black text-lg flex items-center justify-center">4</div>
              <h3 className="font-extrabold text-base text-gray-900">Arrive & Pay Cash</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">Arrive safely at your location and pay the transparently calculated fare directly to the rider.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SAFETY CHAMPION SECTION */}
      <section className="py-20" id="safety_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety First Priority</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                Our safety protocols keep you fully secured
              </h2>
              <p className="text-gray-500 font-medium">
                We believe hyperlocal travel must be trustworthy. ScootyRide is engineered with layered security features so you can travel with complete peace of mind.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3.5">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Strict Document Audits</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Every driver must submit commercial licenses and registration papers reviewed manually by admins.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">OTP Code verification</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">No ride can ever be initiated without the proper 4-digit passenger code being entered.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-gray-900">Real-Time Route Auditing</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Track your vehicle moving along the designated route map live. Quick SOS button support.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 flex flex-col justify-center space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                  <Star className="w-6 h-6 fill-amber-500 text-amber-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Top-Rated Local Drivers</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Drivers maintain a high rating average. Post-trip anonymous feedback guarantees extreme quality control.</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Zero Idle Wait Times</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Hyperlocal routing means drivers are only dispatched when they are within a 3-mile operational range.</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Eco-Friendly commute</h4>
                  <p className="text-xs text-gray-400 mt-0.5">We prioritize electric scooties (Ola, Ather) to reduce carbon foot-print in heavily congested cities.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FAQ EXPANDABLE SECTION */}
      <section className="py-20 bg-gray-50/50 border-t border-gray-100" id="faqs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-12">
            <HelpCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-gray-500 font-medium">Answers to your basic questions about ScootyRide.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left focus:outline-none"
                  id={`faq_trigger_${index}`}
                >
                  <span className="font-extrabold text-sm sm:text-base text-gray-900">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === index ? 'transform rotate-180' : ''}`} />
                </button>
                
                {openFaq === index && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-500 border-t border-gray-50 font-medium leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION FOOTER */}
      <section className="bg-gray-950 text-white py-16 text-center" id="footer_cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <span className="text-amber-500 font-black text-3xl tracking-tight">🛵 ScootyRide</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Short rides. Quick pickups. Local freedom.</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            Ready to experience effortless, affordable, rapid transit in your neighborhood? Create your account today.
          </p>
          <div className="flex justify-center space-x-4 pt-4">
            <button
              onClick={() => onNavigate('/login')}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 font-black rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer"
            >
              Get Booking
            </button>
            <button
              onClick={() => onNavigate('/register')}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-black rounded-xl text-sm transition-all cursor-pointer"
            >
              Earn as Driver
            </button>
          </div>
          <div className="pt-12 text-xs text-gray-600 border-t border-gray-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span>© 2026 ScootyRide. All rights reserved. Built for high-speed local transit.</span>
            <div className="flex space-x-6">
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => onNavigate('/privacy')}>Privacy Policy</span>
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => onNavigate('/terms')}>Terms & Conditions</span>
              <span className="hover:text-gray-300 cursor-pointer" onClick={() => onNavigate('/contact')}>Contact Support</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
