// StatusBadge component
export const StatusBadge = ({ status }) => {
  const styles = {
    SUBMITTED: 'bg-blue-100 text-blue-800',
    ASSIGNED: 'bg-purple-100 text-purple-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    AWAITING_FEES: 'bg-orange-100 text-orange-800',
    RESPONDED: 'bg-green-100 text-green-800',
    FIRST_APPEAL: 'bg-indigo-100 text-indigo-800',
    SECOND_APPEAL: 'bg-pink-100 text-pink-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    REJECTED: 'bg-red-100 text-red-800',
    DEEMED_REFUSED: 'bg-red-200 text-red-900',
    TRANSFERRED: 'bg-teal-100 text-teal-800',
    FILED: 'bg-blue-100 text-blue-800',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
    HEARING_SCHEDULED: 'bg-purple-100 text-purple-800',
    DECIDED: 'bg-green-100 text-green-800',
    DISMISSED: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// DeadlineBadge component
export const DeadlineBadge = ({ daysRemaining }) => {
  if (daysRemaining === undefined || daysRemaining === null) return null;
  if (daysRemaining < 0) return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 animate-pulse">OVERDUE {Math.abs(daysRemaining)}d</span>;
  if (daysRemaining <= 3) return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">{daysRemaining}d left ⚠️</span>;
  if (daysRemaining <= 7) return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">{daysRemaining}d left</span>;
  return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">{daysRemaining}d left</span>;
};

// StatCard component
export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium opacity-80">{title}</span>
        {Icon && <Icon size={20} className="opacity-60" />}
      </div>
      <p className="text-3xl font-bold">{value ?? '—'}</p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
    </div>
  );
};

// Layout wrapper
export const Layout = ({ children, title }) => (
  <div className="flex-1 flex flex-col min-h-screen">
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </header>
    <main className="flex-1 p-8">{children}</main>
  </div>
);

// Page wrapper with sidebar
import Sidebar from './Sidebar';
export const PageWrapper = ({ children, title }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <Layout title={title}>{children}</Layout>
  </div>
);
