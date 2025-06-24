import { useEffect, useState } from "react";
import { Link } from "react-router";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        window.location.href = "/tickets";
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("token", data.token);
          window.location.href = "/tickets";
        }
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 luxury-bg"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Welcome Header */}
        <div className="text-center mb-12 luxury-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black luxury-heading mb-4">
            Join the <span className="luxury-accent">Elite</span>
          </h1>
          <p className="text-lg luxury-text">
            Create your account and experience premium support excellence
          </p>
        </div>

        {/* Signup Form */}
        <div className="luxury-glass rounded-3xl p-8 luxury-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-200 font-medium">{error}</span>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold luxury-subheading mb-3">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="luxury-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold luxury-subheading mb-3">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="luxury-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold luxury-subheading mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a secure password"
                  className="luxury-input w-full pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs luxury-text mt-2">
                Password must be at least 6 characters long
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 ${
                loading 
                  ? 'luxury-loading cursor-not-allowed' 
                  : 'btn-luxury-gold hover:scale-105'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Creating Account...
                </div>
              ) : (
                <>
                  <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Your Journey
                </>
              )}
            </button>
          </form>

          {/* Features List */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 mr-3"></div>
              <span className="text-sm luxury-text">AI-powered ticket analysis and routing</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 mr-3"></div>
              <span className="text-sm luxury-text">Real-time status updates and notifications</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mr-3"></div>
              <span className="text-sm luxury-text">Enterprise-grade security and privacy</span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
            <span className="px-4 text-sm luxury-text font-medium">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="luxury-text mb-4">Already have an account?</p>
            <Link 
              to="/login" 
              className="btn-luxury-secondary w-full"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In Instead
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 luxury-fade-in">
          <p className="luxury-text text-sm">
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
} 