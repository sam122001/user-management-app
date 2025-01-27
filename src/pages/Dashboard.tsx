import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type ChartData = {
  name: string;
  users: number;
};

export function Dashboard() {
  const token = localStorage.getItem('token');

  // State variables
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]); // Explicitly typed
  const [loading, setLoading] = useState(true);

  // Group users by the day of the week
  const groupUsersByDay = (users: any[]): ChartData[] => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const groupedData = daysOfWeek.map((day) => ({ name: day, users: 0 }));

    users.forEach((user) => {
      const dayIndex = new Date(user.createdAt).getDay();
      groupedData[dayIndex].users += 1;
    });

    return groupedData;
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const users = response.data;

      setTotalUsers(users.length);
      setActiveUsers(users.filter((user: any) => user.status === 'active').length);
      setNewUsers(users.filter((user: { createdAt: string }) => new Date(user.createdAt).toLocaleDateString() === new Date().toLocaleDateString()).length);
      setChartData(groupUsersByDay(users)); // Set chart data dynamically
    } catch (error) {
      console.error('Error fetching user data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, [token]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">{totalUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Users</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{activeUsers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">New Users (Today)</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{newUsers}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">User Registration Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
