import { useEffect, useState } from "react";
import { Link } from "react-router";
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

  return (
    <CheckAuth protected={true}>
      <div className="p-4 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Smart Ticket System</h1>
          <button 
            onClick={handleLogout}
            className="btn btn-outline btn-sm"
          >
            Logout
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-3 mb-8">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ticket Title"
            className="input input-bordered w-full"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ticket Description"
            className="textarea textarea-bordered w-full"
            required
          ></textarea>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Ticket"}
          </button>
        </form>

        <h2 className="text-xl font-semibold mb-2">All Tickets</h2>
        <div className="space-y-3">
          {tickets.map((ticket: any) => (
            <Link
              key={ticket._id}
              className="card shadow-md p-4 bg-base-200 hover:bg-base-300 transition-colors block"
              to={`/tickets/${ticket._id}`}
            >
              <h3 className="font-bold text-lg">{ticket.title}</h3>
              <p className="text-sm">{ticket.description}</p>
              <p className="text-sm text-gray-500">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            </Link>
          ))}
          {tickets.length === 0 && <p>No tickets submitted yet.</p>}
        </div>
      </div>
    </CheckAuth>
  );
} 