import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCoffee, FaUsers, FaRupeeSign, FaStar, FaEye, FaClock } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const CafeAnalytics = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 0,
      totalRatings: 0,
      averageRating: 0,
      totalCustomers: 0,
      peakHours: [],
      popularItems: [],
      monthlyRevenue: 0
    },
    viewTrends: [],
    ratingTrends: [],
    hourlyTraffic: [],
    customerFeedback: [],
    popularDrinks: [],
    weeklyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/analytics/cafe/${currentBusiness._id}?days=${dateRange}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#EB662B', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Cafe Analytics</h2>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalViews}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaEye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalCustomers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaUsers className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.overview.averageRating.toFixed(1)}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaStar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{analytics.overview.monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <FaRupeeSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours & Popular Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peak Hours</h3>
          <div className="space-y-3">
            {analytics.overview.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaClock className="w-5 h-5 text-orange-500 mr-3" />
                  <span className="font-medium">{hour.time}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-blue-600">{hour.customers} customers</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Items</h3>
          <div className="space-y-3">
            {analytics.overview.popularItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">₹{item.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.orders} orders</p>
                  <p className="text-sm text-gray-600">₹{item.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* View Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">View Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.viewTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="views" stroke="#EB662B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rating Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.ratingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Traffic & Popular Drinks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Traffic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.hourlyTraffic}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Drinks Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.popularDrinks}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="orders"
              >
                {analytics.popularDrinks.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Performance */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.weeklyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="customers" fill="#EB662B" name="Customers" />
            <Bar dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Feedback */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Customer Feedback</h3>
        <div className="space-y-4">
          {analytics.customerFeedback.map((feedback) => (
            <div key={feedback._id} className="border-l-4 border-orange-500 pl-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{feedback.customerName}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {new Date(feedback.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-gray-700">{feedback.comment}</p>
              {feedback.itemOrdered && (
                <p className="text-sm text-gray-500 mt-1">Ordered: {feedback.itemOrdered}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Insights & Recommendations */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">📈 Growth Opportunities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Consider extending hours during peak times</li>
              <li>• Promote popular items on social media</li>
              <li>• Introduce loyalty programs for regular customers</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">⚡ Quick Wins</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Optimize menu based on popular items</li>
              <li>• Improve service during peak hours</li>
              <li>• Encourage customer reviews and feedback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeAnalytics;
