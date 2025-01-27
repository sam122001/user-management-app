import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BarChart2, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to track sidebar visibility
  console.log("layout test")

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 border-b px-4">
              <h1
                className={`text-xl font-bold text-gray-800 transition-all duration-300 ${
                  isSidebarOpen ? 'block' : 'hidden'
                }`}
              >
                Dashboard
              </h1>
              <button
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                {isSidebarOpen ? (
                  <ChevronLeft className="w-6 h-6" />
                ) : (
                  <ChevronRight className="w-6 h-6" />
                )}
              </button>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-3" />
                    {isSidebarOpen && 'Overview'}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/users"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <Users className="w-5 h-5 mr-3" />
                    {isSidebarOpen && 'Users'}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/dashboard/analytics"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <BarChart2 className="w-5 h-5 mr-3" />
                    {isSidebarOpen && 'Analytics'}
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
              >
                <LogOut className="w-5 h-5 mr-3" />
                {isSidebarOpen && 'Logout'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>

    </div>
  );
}
