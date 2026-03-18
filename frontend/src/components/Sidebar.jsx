import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, Home, Send, Bell, Users, BarChart2, Gavel, MessageSquare } from 'lucide-react';

const navConfig = {
  citizen: [
    { to: '/citizen', label: 'Dashboard', icon: Home },
    { to: '/citizen/submit', label: 'Submit RTI', icon: Send },
  ],
  pio: [
    { to: '/pio', label: 'Dashboard', icon: Home },
    { to: '/pio/requests', label: 'Pending Requests', icon: FileText },
  ],
  cio: [
    { to: '/cio', label: 'Dashboard', icon: Home },
    { to: '/cio/pio', label: 'Manage PIOs', icon: Users },
    { to: '/cio/reports', label: 'Reports', icon: BarChart2 },
  ],
  appellate: [
    { to: '/appellate', label: 'Dashboard', icon: Home },
    { to: '/appellate/hearing', label: 'Hearings', icon: Gavel },
    { to: '/appellate/decisions', label: 'Decisions', icon: MessageSquare },
  ],
};

const roleLabels = {
  citizen: 'Citizen Portal',
  pio: 'PIO Portal',
  cio: 'CIO Portal',
  appellate: 'Appellate Portal',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🇮🇳</span>
          <span className="font-bold text-lg leading-tight">RTI Portal</span>
        </div>
        <p className="text-blue-300 text-xs">{roleLabels[user?.role]}</p>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-blue-800">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold mb-2">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <p className="font-medium text-sm truncate">{user?.name}</p>
        <p className="text-blue-300 text-xs truncate">{user?.email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
