import { Link } from "react-router";
import CheckAuth from "../components/check-auth";

export default function Admin() {
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  return (
    <CheckAuth protected={true}>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="space-x-2">
            <Link to="/" className="btn btn-outline btn-sm">
              Back to Tickets
            </Link>
            <button 
              onClick={handleLogout}
              className="btn btn-outline btn-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">User Management</h2>
              <p>Manage user accounts and permissions</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Ticket Analytics</h2>
              <p>View ticket statistics and reports</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">System Settings</h2>
              <p>Configure system-wide settings</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">AI Configuration</h2>
              <p>Manage AI ticket processing settings</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Email Templates</h2>
              <p>Customize email notification templates</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Coming Soon</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Integration Settings</h2>
              <p>Configure external service integrations</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">Coming Soon</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckAuth>
  );
}