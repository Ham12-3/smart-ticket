import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import ReactMarkdown from "react-markdown";
import Navigation from "../components/navigation";
import CheckAuth from "../components/check-auth";

export default function Ticket() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Handle token on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
    }
  }, []);

  const fetchTicket = async () => {
    if (!token || !id) return;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      const data = await res.json();
      setTicket(data.ticket || null);
    } catch (err) {
      console.error("Failed to fetch ticket:", err);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchTicket();
    }
  }, [token, id]);

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
        return <span className="text-red-400 text-2xl">🔴</span>;
      case 'medium':
        return <span className="text-yellow-400 text-2xl">🟡</span>;
      case 'low':
        return <span className="text-green-400 text-2xl">🟢</span>;
      default:
        return <span className="text-gray-400 text-2xl">⚪</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'bug':
        return '🐛';
      case 'feature':
        return '✨';
      case 'support':
        return '🛟';
      case 'question':
        return '❓';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <CheckAuth protected={true}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="luxury-glass rounded-3xl p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 luxury-loading rounded-full"></div>
            <h3 className="text-2xl font-bold luxury-heading mb-4">Loading Ticket</h3>
            <p className="luxury-text">Fetching ticket details...</p>
          </div>
        </div>
      </CheckAuth>
    );
  }

  if (!ticket) {
    return (
      <CheckAuth protected={true}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="luxury-glass rounded-3xl p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold luxury-heading mb-4">Ticket Not Found</h3>
            <p className="luxury-text mb-8">The ticket you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/tickets" className="btn-luxury-primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Tickets
            </Link>
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
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <Link 
                    to="/tickets" 
                    className="flex items-center space-x-2 luxury-text hover:text-white transition-colors group"
                  >
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">Back to Tickets</span>
                  </Link>
                  <span className="text-gray-600">•</span>
                  <span className="luxury-text text-sm">#{ticket._id?.slice(-8).toUpperCase()}</span>
                </div>
                <h1 className="text-5xl font-black luxury-heading mb-4">
                  Ticket <span className="luxury-accent">Details</span>
                </h1>
                <p className="text-xl luxury-subheading">
                  Complete information and AI analysis for your support request
                </p>
              </div>
              <div className="hidden lg:flex items-center space-x-3">
                {getPriorityIcon(ticket.priority)}
                {getStatusBadge(ticket.status)}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ticket Header */}
            <div className="luxury-glass rounded-3xl p-8 luxury-fade-in">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold luxury-heading mb-4">{ticket.title}</h2>
                    <div className="flex items-center space-x-4 mb-4 lg:hidden">
                      {getPriorityIcon(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    {ticket.category && (
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="text-2xl">{getCategoryIcon(ticket.category)}</span>
                        <span className="px-4 py-2 bg-white/10 rounded-full text-sm luxury-text font-medium capitalize">
                          {ticket.category} Request
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-xl font-bold luxury-subheading mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m-3 5a9 9 0 01-6-6" />
                  </svg>
                  Description
                </h3>
                <div className="luxury-glass-subtle rounded-2xl p-6">
                  <p className="luxury-text leading-relaxed text-lg">{ticket.description}</p>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {ticket.aiNotes && (
              <div className="luxury-glass rounded-3xl p-8 luxury-slide-up">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center mr-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold luxury-heading">AI Analysis</h3>
                    <p className="luxury-text">Powered by Google Gemini Intelligence</p>
                  </div>
                </div>
                <div className="luxury-glass-subtle rounded-2xl p-6">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="luxury-text leading-relaxed mb-4">{children}</p>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold luxury-subheading mb-4">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold luxury-subheading mb-3">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold luxury-subheading mb-2">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                        li: ({ children }) => <li className="luxury-text">{children}</li>,
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                        code: ({ children }) => <code className="px-2 py-1 bg-white/10 rounded text-sm font-mono text-gray-200">{children}</code>,
                      }}
                    >
                      {ticket.aiNotes}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Ticket Info */}
            <div className="luxury-glass rounded-3xl p-6 luxury-scale-in">
              <h3 className="text-xl font-bold luxury-heading mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ticket Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold luxury-text mb-2">Priority Level</label>
                  <div className="flex items-center space-x-3">
                    {getPriorityIcon(ticket.priority)}
                    <span className="luxury-subheading font-medium capitalize">{ticket.priority || 'Not set'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold luxury-text mb-2">Current Status</label>
                  {getStatusBadge(ticket.status)}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold luxury-text mb-2">Created Date</label>
                  <div className="flex items-center space-x-3 luxury-subheading">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                      <div className="text-sm luxury-text">{new Date(ticket.createdAt).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>

                {ticket.assignedTo && (
                  <div>
                    <label className="block text-sm font-semibold luxury-text mb-2">Assigned Agent</label>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="luxury-subheading font-medium">{ticket.assignedTo.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Skills */}
            {ticket.relatedSkills && ticket.relatedSkills.length > 0 && (
              <div className="luxury-glass rounded-3xl p-6 luxury-scale-in" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-xl font-bold luxury-heading mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Related Skills
                </h3>
                <div className="flex flex-wrap gap-3">
                  {ticket.relatedSkills.map((skill: string, index: number) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-full text-sm luxury-subheading font-medium hover:bg-purple-400/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="luxury-glass rounded-3xl p-6 luxury-scale-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-bold luxury-heading mb-6 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="space-y-4">
                <Link to="/tickets" className="btn-luxury-primary w-full">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to All Tickets
                </Link>
                <Link to="/admin" className="btn-luxury-secondary w-full">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Dashboard
                </Link>
                <button className="btn-luxury-gold w-full">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </CheckAuth>
  );
} 