import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { appellateAPI } from '../../api';
import { PageWrapper, StatusBadge, DeadlineBadge, StatCard } from '../../components/UI';
import { Gavel, Clock, CheckCircle, FileText, AlertCircle } from 'lucide-react';

export default function AppellateDashboard() {
  const { data: statsData } = useQuery({ queryKey: ['appellateStats'], queryFn: appellateAPI.getStats });
  const { data: appealsData, isLoading } = useQuery({ queryKey: ['appellateAppeals'], queryFn: () => appellateAPI.getAppeals({ limit: 10 }) });

  const stats = statsData?.data?.stats || {};
  const appeals = appealsData?.data?.appeals || [];

  return (
    <PageWrapper title="Appellate Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Appeals" value={stats.total} icon={FileText} color="blue" />
          <StatCard title="Under Review" value={stats.underReview} icon={Clock} color="yellow" />
          <StatCard title="Hearing Scheduled" value={stats.hearingScheduled} icon={Gavel} color="purple" />
          <StatCard title="Decided" value={stats.decided} icon={CheckCircle} color="green" />
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Pending Appeals</h2>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 font-medium text-gray-600">Appeal ID</th>
                  <th className="pb-3 font-medium text-gray-600">Citizen</th>
                  <th className="pb-3 font-medium text-gray-600">Type</th>
                  <th className="pb-3 font-medium text-gray-600">RTI Request</th>
                  <th className="pb-3 font-medium text-gray-600">Status</th>
                  <th className="pb-3 font-medium text-gray-600">Deadline</th>
                  <th className="pb-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appeals.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="py-3 font-mono text-xs text-blue-700">{a.appealId}</td>
                    <td className="py-3">{a.citizen?.name}</td>
                    <td className="py-3"><span className={`text-xs font-medium px-2 py-1 rounded-full ${a.type === 'FIRST' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{a.type}</span></td>
                    <td className="py-3 font-mono text-xs">{a.rtiRequest?.requestId}</td>
                    <td className="py-3"><StatusBadge status={a.status} /></td>
                    <td className="py-3"><DeadlineBadge daysRemaining={a.daysRemaining} /></td>
                    <td className="py-3"><Link to={`/appellate/decisions`} state={{ appealId: a._id }} className="text-blue-700 hover:underline text-xs">Review →</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
