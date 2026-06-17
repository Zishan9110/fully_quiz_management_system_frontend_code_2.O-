import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminApi as api } from '@/services/api';

export default function PendingApprovalsPage() {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/auth/pending');
      setPendingAdmins(data.data || []);
    } catch (error) {
      toast.error('Failed to fetch pending admins');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (adminId) => {
    setProcessing(adminId);
    try {
      await api.put(`/admin/auth/approve/${adminId}`);
      toast.success('Admin approved successfully');
      fetchPendingAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (adminId) => {
    if (!confirm('Are you sure you want to reject this admin?')) return;
    
    setProcessing(adminId);
    try {
      await api.delete(`/admin/auth/reject/${adminId}`);
      toast.success('Admin rejected');
      fetchPendingAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" 
             style={{ borderColor: 'var(--color-primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Pending Admin Approvals
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {pendingAdmins.length} admin(s) waiting for approval
        </p>

        {pendingAdmins.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
              No Pending Admins
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              All admin accounts are approved
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingAdmins.map((admin) => (
              <motion.div
                key={admin._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card border-2 p-6"
                style={{ borderColor: 'rgba(251, 191, 36, 0.2)' }}
              >
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                         style={{ background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))' }}>
                      {admin.firstName?.[0]}{admin.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {admin.firstName} {admin.lastName}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {admin.email}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          {admin.registrationMethod || 'email'}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {admin.role}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleApprove(admin._id)}
                      disabled={processing === admin._id}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)' }}
                    >
                      {processing === admin._id ? 'Processing...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(admin._id)}
                      disabled={processing === admin._id}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}