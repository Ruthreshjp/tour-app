import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaShoppingBag, FaUsers, FaRupeeSign, FaStar, FaEye, FaTrendingUp } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const ShoppingAnalytics = () => {
  const { currentBusiness } = useSelector((state) => state.business);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalViews: 0,
      totalCustomers: 0,
      averageRating: 0,
      monthlyRevenue: 0,
      topProducts: [],
      categoryPerformance: [],
      customerSatisfaction: 0
    },
    viewTrends: [],
    salesTrends: [],
    categoryStats: [],
    customerFeedback: [],
    productPerformance: [],
    monthlyComparison: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business/analytics/shopping/${currentBusiness._id}?days=${dateRange}`, {
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
        <h2 className="text-2xl font-bold text-gray-800">Shopping Analytics</h2>
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

      {/* Top Products & Category Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h3>
          <div className="space-y-3">
            {analytics.overview.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.sales} sales</p>
                  <p className="text-sm text-gray-600">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Performance</h3>
          <div className="space-y-3">
            {analytics.overview.categoryPerformance.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaShoppingBag className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium capitalize">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.products} products</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{category.sales} sales</p>
                  <p className="text-sm text-gray-600">₹{category.revenue.toLocaleString()}</p>
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

        {/* Sales Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.salesTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Sales']} />
              <Bar dataKey="sales" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution & Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="sales"
              >
                {analytics.categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.productPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#3B82F6" name="Views" />
              <Bar dataKey="sales" fill="#EB662B" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Comparison */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} name="Views" />
            <Line type="monotone" dataKey="sales" stroke="#10B981" strokeWidth={2} name="Sales" />
            <Line type="monotone" dataKey="revenue" stroke="#EB662B" strokeWidth={2} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">View to Sale Rate</span>
              <span className="font-semibold text-blue-600">
                {analytics.overview.totalViews > 0 
                  ? ((analytics.overview.totalCustomers / analytics.overview.totalViews) * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Satisfaction</span>
              <span className="font-semibold text-green-600">
                {analytics.overview.customerSatisfaction.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repeat Customer Rate</span>
              <span className="font-semibold text-orange-600">
                {analytics.overview.repeatCustomerRate || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Order Value</span>
              <span className="font-semibold">
                ₹{analytics.overview.totalCustomers > 0 
                  ? (analytics.overview.monthlyRevenue / analytics.overview.totalCustomers).toFixed(0)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue per View</span>
              <span className="font-semibold text-green-600">
                ₹{analytics.overview.totalViews > 0 
                  ? (analytics.overview.monthlyRevenue / analytics.overview.totalViews).toFixed(2)
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Growth Rate</span>
              <span className="font-semibold text-blue-600">
                +{analytics.overview.growthRate || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Engagement Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Ratings</span>
              <span className="font-semibold">{analytics.overview.totalRatings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg. Session Duration</span>
              <span className="font-semibold text-blue-600">
                {analytics.overview.avgSessionDuration || '0'} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bounce Rate</span>
              <span className="font-semibold text-red-600">
                {analytics.overview.bounceRate || 0}%
              </span>
            </div>
          </div>
        </div>
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
              {feedback.productPurchased && (
                <p className="text-sm text-gray-500 mt-1">Purchased: {feedback.productPurchased}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">🎯 Focus Areas</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Promote top-performing products</li>
              <li>• Improve low-performing categories</li>
              <li>• Optimize inventory based on trends</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">📈 Growth Opportunities</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Expand successful product lines</li>
              <li>• Target high-conversion time slots</li>
              <li>• Implement customer loyalty programs</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">⚡ Quick Wins</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Feature popular products prominently</li>
              <li>• Improve product descriptions</li>
              <li>• Encourage customer reviews</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingAnalytics;
