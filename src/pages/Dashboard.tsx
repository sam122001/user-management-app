import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Upload, FileType, Table } from 'lucide-react';


type ChartData = {
  name: string;
  users: number;
};

interface UploadedFile {
  _id: string;
  filename: string;
  uploadDate: string;
  data: any[];
}

export function Dashboard() {
  const token = localStorage.getItem('token');

  // State variables
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [newUsers, setNewUsers] = useState(0);
  const [chartData, setChartData] = useState<ChartData[]>([]); // Explicitly typed
  const [loading, setLoading] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
const [errorMessage, setErrorMessage] = useState<string | null>(null);


  useEffect(() => {
    fetchUploads();
  }, []);

  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/csv/uploads', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setUploads(response.data);
      setErrorMessage(null); // Reset error message on successful fetch
    } catch (error) {
      console.error('Error fetching uploads:', error);
      setErrorMessage('Error fetching uploads. Please try again later.');
    }
  };
  
  const handleUpload = async () => {
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setErrorMessage(null); // Clear previous error messages
    setSuccessMessage(null); // Clear previous success messages
  
    try {
      console.log('apihit');
      await axios.post('http://localhost:5000/api/csv/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`, // Include the token in the Authorization header
        }
      });
  
      setFile(null);
      fetchUploads();
      setSuccessMessage('File uploaded successfully!'); // Set success message
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('There was an error uploading the file. Please try again later.'); // Set error message
    } finally {
      setUploading(false);
    }
  };
  


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

      <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        {/* Success/Error Message Display */}
        {successMessage && (
          <div className="mb-4 p-4 text-green-700 bg-green-100 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CSV File Upload</h1>
          <div className="flex items-center space-x-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <span className="text-gray-600">Upload your CSV files</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex-1">
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
              >
                <FileType className="w-5 h-5 mr-2 text-gray-400" />
                <span className="text-gray-600">
                  {file ? file.name : 'Choose CSV file'}
                </span>
              </label>
            </div>
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-6 py-2 rounded-lg text-white font-medium ${
              !file || uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <Table className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Uploaded Files</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filename
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploads.map((upload) => (
                <tr key={upload._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {upload.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(upload.uploadDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedFile(upload)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View Data
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Data from {selectedFile.filename}
                </h3>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              <div className="overflow-x-auto">
                {selectedFile.data.length > 0 && (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        {Object.keys(selectedFile.data[0]).map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedFile.data.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value: any, i) => (
                            <td
                              key={i}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>

    </div>
  );
}
