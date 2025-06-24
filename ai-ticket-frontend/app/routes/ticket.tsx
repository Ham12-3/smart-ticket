import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import ReactMarkdown from "react-markdown";
import CheckAuth from "../components/check-auth";

export default function TicketDetailsPage() {
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

  useEffect(() => {
    if (!token) return;
    
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, token]);

  if (loading)
    return (
      <CheckAuth protected={true}>
        <div className="text-center mt-10">Loading ticket details...</div>
      </CheckAuth>
    );
    
  if (!ticket) 
    return (
      <CheckAuth protected={true}>
        <div className="text-center mt-10">Ticket not found</div>
      </CheckAuth>
    );

  return (
    <CheckAuth protected={true}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-4">
          <Link to="/" className="btn btn-outline btn-sm">
            ← Back to Tickets
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>

        <div className="card bg-base-200 shadow p-4 space-y-4">
          <h3 className="text-xl font-semibold">{ticket.title}</h3>
          <p>{ticket.description}</p>

          {/* Conditionally render extended details */}
          {ticket.status && (
            <>
              <div className="divider">Metadata</div>
              <p>
                <strong>Status:</strong> {ticket.status}
              </p>
              {ticket.priority && (
                <p>
                  <strong>Priority:</strong> {ticket.priority}
                </p>
              )}

              {ticket.relatedSkills?.length > 0 && (
                <p>
                  <strong>Related Skills:</strong>{" "}
                  {ticket.relatedSkills.join(", ")}
                </p>
              )}

              {ticket.helpfulNotes && (
                <div>
                  <strong>Helpful Notes:</strong>
                  <div className="prose max-w-none bg-base-100 p-4 rounded mt-2">
                    <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                  </div>
                </div>
              )}

              {ticket.assignedTo && (
                <p>
                  <strong>Assigned To:</strong> {ticket.assignedTo?.email}
                </p>
              )}

              {ticket.createdAt && (
                <p className="text-sm text-gray-500 mt-2">
                  Created At: {new Date(ticket.createdAt).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </CheckAuth>
  );
} 