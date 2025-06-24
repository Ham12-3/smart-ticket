import { useEffect, useState } from "react";
import { Link } from "react-router";
import Navigation from "../components/navigation";

export function meta() {
  return [
    { title: "Smart Ticket System - Premium AI-Powered Support" },
    { name: "description", content: "Experience the future of customer support with our luxury AI-powered ticket management system." },
  ];
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-24">
        <div className="absolute inset-0 luxury-bg"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="luxury-fade-in">
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-black luxury-heading mb-8 leading-tight">
              Smart Ticket
              <br />
              <span className="luxury-accent">System</span>
            </h1>
            
            <p className="text-2xl md:text-3xl luxury-subheading mb-6 max-w-4xl mx-auto">
              Experience the pinnacle of customer support excellence
            </p>
            
            <p className="text-lg luxury-text mb-12 max-w-3xl mx-auto leading-relaxed">
              Harness the power of artificial intelligence to transform your support workflow. 
              Our premium platform delivers unparalleled efficiency, sophisticated automation, 
              and elegant user experiences that elevate your business to new heights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              {token ? (
                <>
                  <Link to="/tickets" className="btn-luxury-gold text-lg px-12 py-4">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Access Dashboard
                  </Link>
                  <Link to="/admin" className="btn-luxury-secondary text-lg px-12 py-4">
                    Admin Panel
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn-luxury-gold text-lg px-12 py-4">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Your Journey
                  </Link>
                  <Link to="/login" className="btn-luxury-secondary text-lg px-12 py-4">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto luxury-slide-up">
            <div className="luxury-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold luxury-subheading mb-4">AI-Powered Intelligence</h3>
              <p className="luxury-text">Advanced machine learning algorithms automatically categorize, prioritize, and route tickets for optimal efficiency.</p>
            </div>
            
            <div className="luxury-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold luxury-subheading mb-4">Lightning Performance</h3>
              <p className="luxury-text">Experience unmatched speed with our optimized infrastructure designed for enterprise-scale operations.</p>
            </div>
            
            <div className="luxury-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold luxury-subheading mb-4">Enterprise Security</h3>
              <p className="luxury-text">Bank-grade security protocols and encryption ensure your sensitive data remains protected at all times.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 luxury-fade-in">
            <h2 className="text-5xl font-bold luxury-heading mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl luxury-text max-w-3xl mx-auto">
              Join thousands of organizations that have transformed their support operations with our premium platform.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 luxury-scale-in">
            <div className="text-center">
              <div className="text-5xl font-black luxury-accent mb-2">99.9%</div>
              <div className="luxury-text font-semibold">Uptime Guarantee</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black luxury-accent mb-2">500K+</div>
              <div className="luxury-text font-semibold">Tickets Processed</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black luxury-accent mb-2">50%</div>
              <div className="luxury-text font-semibold">Faster Resolution</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black luxury-accent mb-2">24/7</div>
              <div className="luxury-text font-semibold">Premium Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="luxury-glass p-16 rounded-3xl luxury-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold luxury-heading mb-6">
              Ready to Elevate Your Support?
            </h2>
            <p className="text-xl luxury-text mb-10 max-w-2xl mx-auto">
              Transform your customer support experience with our AI-powered platform. 
              Join the elite companies already using Smart Ticket System.
            </p>
            
            {!token && (
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link to="/signup" className="btn-luxury-gold text-lg px-12 py-4">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started Today
                </Link>
                <Link to="/login" className="btn-luxury-secondary text-lg px-12 py-4">
                  Sign In to Continue
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold luxury-heading">Smart Ticket System</span>
          </div>
          <p className="luxury-text mb-4">
            &copy; 2024 Smart Ticket System. All rights reserved.
          </p>
          <p className="luxury-text text-sm">
            Engineered for excellence. Designed for the future.
          </p>
        </div>
      </footer>
    </div>
  );
} 