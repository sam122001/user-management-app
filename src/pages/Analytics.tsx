import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';

const userActivityData = [
  { date: 'Mon', users: 120 },
  { date: 'Tue', users: 150 },
  { date: 'Wed', users: 180 },
  { date: 'Thu', users: 140 },
  { date: 'Fri', users: 160 },
  { date: 'Sat', users: 90 },
  { date: 'Sun', users: 85 },
];

interface UserRole {
  name: string;
  value: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

export function Analytics() {
  const [userRolesData, setUserRolesData] = useState<UserRole[]>([]); 
  const token = localStorage.getItem('token');
  const [userActivityData, setUserActivityData] = useState<{ date: string; users: number }[]>([]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
          }
        });
        const users = response.data;
  
        // Format dates to group users by day
        const activityCounts: { [key: string]: number } = {};
        users.forEach((user: { createdAt: string }) => {
          const createdDate = new Date(user.createdAt);
          const formattedDate = createdDate.toLocaleDateString(); // e.g., '1/27/2025'
          
          // Count the number of users created on each day
          if (!activityCounts[formattedDate]) {
            activityCounts[formattedDate] = 0;
          }
          activityCounts[formattedDate]++;
        });
  
        const activityData = Object.keys(activityCounts).map(date => ({
          date,
          users: activityCounts[date],
        }));
  
        const sortedActivityData = activityData.sort((a, b) => {
          const parseDate = (dateString: string) => {
            const [day, month, year] = dateString.split('/').map(Number); 
            return new Date(year, month - 1, day).getTime(); 
          };
        
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
        
          return dateA - dateB; // Ascending order: earliest to latest
        });     
  
  
        // Update the user activity data state
        setUserActivityData(sortedActivityData);
  
        // Process roles (same as before)
        const roleCounts = { Admin: 0, Editor: 0, Viewer: 0 };
        users.forEach((user: { role: string }) => {
          if (user.role.toLowerCase() === 'admin') roleCounts.Admin++;
          else if (user.role.toLowerCase() === 'editor') roleCounts.Editor++;
          else if (user.role.toLowerCase() === 'viewer') roleCounts.Viewer++;
        });
  
        // Update the user roles data state
        setUserRolesData([
          { name: 'Admin', value: roleCounts.Admin },
          { name: 'Editor', value: roleCounts.Editor },
          { name: 'Viewer', value: roleCounts.Viewer }
        ]);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    fetchUserData();
  }, []);
  
  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
          <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
  <BarChart data={userActivityData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="users" fill="#4f46e5" />
  </BarChart>
</ResponsiveContainer>
          </div>
        </div>

        {/* User Roles Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRolesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRolesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Login Trends */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Login Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#4f46e5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}