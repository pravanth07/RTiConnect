import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cioAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge, StatCard } from '../../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function CIODashboard() {
  const qc = useQueryClient();
  const [selectedReq, setSelectedReq] = useState(null);
  const [selectedPIO, setSelectedPIO] = useState('');

  const { data: dashData, isLoading } = useQuery({ queryKey: ['cioDash'], queryFn: cioAPI.getDashboard });
  const { data: reqData } = useQuery({ queryKey: ['cioRequests', 'SUBMITTED'], queryFn: () => cioAPI.getRequests({ status: 'SUBMITTED', limit: 20 }) });
  const { data: pioData } = useQuery({ queryKey: ['cioAllPIOs'], queryFn: cioAPI.getPIOs });

  const dash = dashData?.data || {};
  const unassigned = reqData?.data?.requests || [];
  const pios = pioData?.data?.pios || [];

  const assignMut = useMutation({
    mutationFn: () => cioAPI.assignToPIO(selectedReq, { pioId: selectedPIO }),
    onSuccess: () => {
      toast.success('Request assigned to PIO!');
      setSelectedReq(null); setSelectedPIO('');
      qc.invalidateQueries(['cioDash']); qc.invalidateQueries(['cioRequests']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Assignment failed'),
  });

  return (
    <PageWrapper title="CIO Dashboard">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total" value={dash.stats?.totalRequests} icon={FileText} color="blue" />
          <StatCard title="Unassigned" value={dash.stats?.submitted} icon={Clock} color="orange" />
          <StatCard title="In Progress" value={dash.stats?.inProgress} icon={TrendingUp} color="yellow" />
          <StatCard title="Responded" value={dash.stats?.responded} icon={CheckCircle} color="green" />
          <StatCard title="Overdue" value={dash.stats?.overdue} icon={AlertTriangle} color="red" />
          <StatCard title="Active PIOs" value={dash.stats?.activePIOs} icon={Users} color="purple" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Department chart */}
          <div className="card">
            <h3 className="font-semibold mb-4">Requests by Department</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dash.deptStats?.slice(0, 6)}>
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly trend */}
          <div className="card">
            <h3 className="font-semibold mb-4">Monthly Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dash.monthlyTrend}>
                <XAxis dataKey="_id.month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assign PIO */}
        <div className="card">
          <h3 className="font-semibold mb-4">Assign Pending Requests to PIO</h3>
          {unassigned.length === 0 ? (
            <p className="text-gray-400 text-sm">No unassigned requests.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-600">Request ID</th>
                    <th className="pb-3 font-medium text-gray-600">Citizen</th>
                    <th className="pb-3 font-medium text-gray-600">Department</th>
                    <th className="pb-3 font-medium text-gray-600">Subject</th>
                    <th className="pb-3 font-medium text-gray-600">Assign to PIO</th>
                    <th className="pb-3 font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {unassigned.map(req => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="py-3 font-mono text-xs text-blue-700">{req.requestId}</td>
                      <td className="py-3">{req.citizen?.name}</td>
                      <td className="py-3 text-gray-500 text-xs">{req.department}</td>
                      <td className="py-3 max-w-xs truncate">{req.subject}</td>
                      <td className="py-3">
                        <select className="input-field text-xs py-1.5" onClick={() => setSelectedReq(req._id)} onChange={e => setSelectedPIO(e.target.value)}>
                          <option value="">Select PIO...</option>
                          {pios.filter(p => p.isActive).map(p => (
                            <option key={p._id} value={p._id}>{p.name} ({p.activeRequests} active)</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => { setSelectedReq(req._id); assignMut.mutate(); }}
                          disabled={!selectedPIO || assignMut.isPending}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          Assign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
