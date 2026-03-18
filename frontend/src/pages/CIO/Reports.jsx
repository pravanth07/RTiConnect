import { useQuery } from '@tanstack/react-query';
import { cioAPI } from '../../api';
import { PageWrapper } from '../../components/UI';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function Reports() {
  const { data, isLoading } = useQuery({ queryKey: ['cioReports'], queryFn: cioAPI.getReports });
  const reports = data?.data || {};

  return (
    <PageWrapper title="Reports & Analytics">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Status Distribution</h3>
            {isLoading ? <div className="h-48 bg-gray-100 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={reports.statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({_id, count}) => `${_id}: ${count}`}>
                    {reports.statusBreakdown?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">PIO Performance (Response Rate)</h3>
            {isLoading ? <div className="h-48 bg-gray-100 animate-pulse rounded" /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reports.pioPerformance?.slice(0, 8)}>
                  <XAxis dataKey="pioName" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={v => `${Math.round(v * 100)}%`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={v => `${Math.round(v * 100)}%`} />
                  <Bar dataKey="responseRate" fill="#10b981" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Department-wise Summary</h3>
          {isLoading ? <div className="h-32 bg-gray-100 animate-pulse rounded" /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200"><th className="pb-2 text-left font-medium text-gray-600">Department</th><th className="pb-2 font-medium text-gray-600">Total</th><th className="pb-2 font-medium text-gray-600">Responded</th><th className="pb-2 font-medium text-gray-600">Response Rate</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {reports.deptBreakdown?.map(d => (
                  <tr key={d._id}><td className="py-2">{d._id}</td><td className="py-2 text-center">{d.total}</td><td className="py-2 text-center">{d.responded}</td><td className="py-2 text-center">{d.total ? `${Math.round((d.responded/d.total)*100)}%` : '—'}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
