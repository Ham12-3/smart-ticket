import { useEffect, useState } from "react";
import { Link } from "react-router";
import Navigation from "../components/navigation";
import CheckAuth from "../components/check-auth";

export default function Admin() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTickets: 0,
    todoTickets: 0,
    inProgressTickets: 0,
    doneTickets: 0,
    totalUsers: 0,
  });

  // Handle token on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const fetchData = async () => {
    if (!token) return;
    
    try {
      // Fetch tickets
      const ticketsRes = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const ticketsData = await ticketsRes.json();
      const allTickets = ticketsData.tickets || [];
      setTickets(allTickets);

      // Calculate stats
      const todoCount = allTickets.filter((t: any) => t.status === 'todo').length;
      const inProgressCount = allTickets.filter((t: any) => t.status === 'in_progress').length;
      const doneCount = allTickets.filter((t: any) => t.status === 'done').length;

      setStats({
        totalTickets: allTickets.length,
        todoTickets: todoCount,
        inProgressTickets: inProgressCount,
        doneTickets: doneCount,
        totalUsers: 0, // We don't have a users endpoint yet
      });

    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

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

  if (loading) {
    return (
      <CheckAuth protected={true}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="luxury-glass rounded-3xl p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 luxury-loading rounded-full"></div>
            <h3 className="text-2xl font-bold luxury-heading mb-4">Loading Dashboard</h3>
            <p className="luxury-text">Fetching analytics and insights...</p>
          </div>
        </div>
      </CheckAuth>
    );
  }

  return (
    <CheckAuth protected={true}>
      <div className="min-h-screen">
        <Navigation />
        <div className="p-6 pt-32">
        {/* Page Header */}
        <div className="max-w-7xl mx-auto mb-12">
          <div className="luxury-fade-in">
            <h1 className="text-6xl font-black luxury-heading mb-4">
              Admin <span className="luxury-accent">Dashboard</span>
            </h1>
            <p className="text-xl luxury-subheading mb-8">
              Monitor and manage your ticket system with enterprise-grade analytics
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="luxury-card p-8 luxury-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold luxury-subheading mb-2">Total Tickets</h3>
                  <p className="text-4xl font-black luxury-accent">{stats.totalTickets}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 text-sm font-semibold">↗ Active</span>
              </div>
            </div>

            <div className="luxury-card p-8 luxury-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold luxury-subheading mb-2">Pending</h3>
                  <p className="text-4xl font-black text-orange-400">{stats.todoTickets}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-orange-400 text-sm font-semibold">⚠ Attention Required</span>
              </div>
            </div>

            <div className="luxury-card p-8 luxury-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold luxury-subheading mb-2">In Progress</h3>
                  <p className="text-4xl font-black text-blue-400">{stats.inProgressTickets}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-blue-400 text-sm font-semibold">⚡ Processing</span>
              </div>
            </div>

            <div className="luxury-card p-8 luxury-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold luxury-subheading mb-2">Completed</h3>
                  <p className="text-4xl font-black text-green-400">{stats.doneTickets}</p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-green-400 text-sm font-semibold">✓ Resolved</span>
              </div>
            </div>
          </div>

          {/* Recent Tickets Table */}
          <div className="luxury-glass rounded-3xl p-8 luxury-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold luxury-heading">Recent Activity</h2>
                  <p className="luxury-text">Latest ticket submissions and updates</p>
                </div>
              </div>
              <Link to="/tickets" className="btn-luxury-primary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View All Tickets
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 luxury-subheading font-bold">Title</th>
                    <th className="text-left py-4 px-6 luxury-subheading font-bold">Priority</th>
                    <th className="text-left py-4 px-6 luxury-subheading font-bold">Status</th>
                    <th className="text-left py-4 px-6 luxury-subheading font-bold">Created</th>
                    <th className="text-left py-4 px-6 luxury-subheading font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 10).map((ticket: any, index) => (
                    <tr key={ticket._id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <h4 className="font-bold luxury-subheading truncate max-w-xs">{ticket.title}</h4>
                          <p className="text-sm luxury-text truncate max-w-xs">{ticket.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          {getPriorityIcon(ticket.priority)}
                          <span className="luxury-text font-medium capitalize">{ticket.priority || 'Not set'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="luxury-subheading">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm luxury-text">
                          {new Date(ticket.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Link 
                          to={`/tickets/${ticket._id}`}
                          className="btn-luxury-secondary btn-sm"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {tickets.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold luxury-heading mb-4">No Tickets Found</h3>
                  <p className="luxury-text text-lg mb-6">When users create tickets, they will appear here for management</p>
                  <Link to="/tickets" className="btn-luxury-primary">
                    Go to Tickets
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </CheckAuth>
  );
}