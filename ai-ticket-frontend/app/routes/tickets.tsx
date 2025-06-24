import { useEffect, useState } from "react";
import { Link } from "react-router";
import Navigation from "../components/navigation";
import CheckAuth from "../components/check-auth";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Handle token on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const fetchTickets = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets(); // Refresh list
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'todo':
        return <span className="badge-luxury-todo">To Do</span>;
      case 'in_progress':
        return <span className="badge-luxury-progress">In Progress</span>;
      case 'done':
        return <span className="badge-luxury-done">Completed</span>;
      default:
        return <span className="badge-luxury-todo">New</span>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className="text-red-400">🔴</span>;
      case 'medium':
        return <span className="text-yellow-400">🟡</span>;
      case 'low':
        return <span className="text-green-400">🟢</span>;
      default:
        return <span className="text-gray-400">⚪</span>;
    }
  };

  return (
    <CheckAuth protected={true}>
      <div className="min-h-screen">
        <Navigation />
        <div className="p-6 pt-32">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="luxury-fade-in">
            <h1 className="text-6xl font-black luxury-heading mb-4">
              Your <span className="luxury-accent">Tickets</span>
            </h1>
            <p className="text-xl luxury-subheading mb-8">
              Create and manage your support tickets with AI-powered assistance
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Ticket Form */}
          <div className="lg:col-span-1">
            <div className="luxury-glass rounded-3xl p-8 luxury-fade-in">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold luxury-heading">Create Ticket</h2>
                  <p className="luxury-text text-sm">Submit a new support request</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold luxury-subheading mb-3">
                    Ticket Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="What's the issue?"
                    className="luxury-input w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold luxury-subheading mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Provide detailed information about the issue..."
                    rows={4}
                    className="luxury-input w-full resize-none"
                    required
                  />
                </div>
                
                <button 
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 ${
                    loading 
                      ? 'luxury-loading' 
                      : 'btn-luxury-primary hover:scale-105'
                  }`}
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Creating Ticket...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 inline mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Submit Ticket
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Tickets List */}
          <div className="lg:col-span-2">
            <div className="luxury-glass rounded-3xl p-8 luxury-slide-up">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold luxury-heading">All Tickets</h2>
                    <p className="luxury-text">Track your support requests</p>
                  </div>
                </div>
                <div className="luxury-accent font-bold text-lg">
                  {tickets.length} Total
                </div>
              </div>

              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {tickets.map((ticket: any, index) => (
                  <Link
                    key={ticket._id}
                    to={`/tickets/${ticket._id}`}
                    className="block"
                  >
                    <div className="luxury-card p-6 transition-all duration-300 hover:scale-[1.02]" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            {getPriorityIcon(ticket.priority)}
                            <h3 className="font-bold text-xl luxury-subheading truncate flex-1">{ticket.title}</h3>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="luxury-text mb-4 line-clamp-2 leading-relaxed">{ticket.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center luxury-text">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(ticket.createdAt).toLocaleDateString()}
                            </span>
                            {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
                              <div className="flex space-x-2">
                                {ticket.relatedSkills.slice(0, 2).map((skill: string, idx: number) => (
                                  <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-xs luxury-text">
                                    {skill}
                                  </span>
                                ))}
                                {ticket.relatedSkills.length > 2 && (
                                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs luxury-text">
                                    +{ticket.relatedSkills.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-6">
                          <svg className="w-6 h-6 luxury-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {tickets.length === 0 && (
                  <div className="text-center py-20">
                    <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-bold luxury-heading mb-4">No Tickets Yet</h3>
                    <p className="luxury-text text-lg mb-8 max-w-md mx-auto">
                      Create your first support ticket to get started with our AI-powered assistance
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                             <button 
                         onClick={() => (document.querySelector('input[name="title"]') as HTMLInputElement)?.focus()}
                         className="btn-luxury-gold"
                       >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Your First Ticket
                      </button>
                      <Link to="/admin" className="btn-luxury-secondary">
                        View Admin Dashboard
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </CheckAuth>
  );
} 