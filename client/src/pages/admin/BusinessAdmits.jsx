import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';

const BusinessAdmits = () => {
  const [pendingBusinesses, setPendingBusinesses] = useState([]);
  const [approvedBusinesses, setApprovedBusinesses] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const res = await axios.get('/api/admin/businesses', {
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      setPendingBusinesses(res.data.pending || []);
      setApprovedBusinesses(res.data.approved || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast.error('Failed to fetch businesses');
    }
  };

  const handleApproval = async (businessId, status) => {
    try {
      setLoading(true);
      const res = await axios.put(`/api/admin/business/${businessId}/status`, 
        { status },
        {
          headers: {
            'Authorization': `Bearer ${currentUser?.token}`
          }
        }
      );

      if (res.data.success) {
        toast.success(`Business ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        fetchBusinesses(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating business status:', error);
      toast.error('Failed to update business status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Business Management</h2>
      
      {/* Pending Approvals Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Pending Approvals</h3>
        <div className="grid gap-4">
          {pendingBusinesses.map((business) => (
            <div key={business._id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-medium">{business.organization_name}</h4>
                  <p className="text-gray-600">{business.email}</p>
                  <p className="text-gray-600">{business.business_type}</p>
                  <p className="text-sm text-gray-500 mt-2">{business.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(business._id, 'approved')}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(business._id, 'rejected')}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pendingBusinesses.length === 0 && (
            <p className="text-gray-500">No pending business approvals</p>
          )}
        </div>
      </div>

      {/* Approved Businesses Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Approved Businesses</h3>
        <div className="grid gap-4">
          {approvedBusinesses.map((business) => (
            <div key={business._id} className="bg-white p-4 rounded-lg shadow">
              <h4 className="text-lg font-medium">{business.organization_name}</h4>
              <p className="text-gray-600">{business.email}</p>
              <p className="text-gray-600">{business.business_type}</p>
              <p className="text-sm text-gray-500 mt-2">{business.description}</p>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-sm rounded mt-2">
                Approved
              </span>
            </div>
          ))}
          {approvedBusinesses.length === 0 && (
            <p className="text-gray-500">No approved businesses</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessAdmits;