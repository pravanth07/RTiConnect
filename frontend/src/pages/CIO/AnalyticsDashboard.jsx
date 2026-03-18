import { useState, useEffect } from "react";
import {
  getOverviewStats,
  getMonthlyTrend,
  getDepartmentPerformance,
  getStatusDistribution,
} from "../../api/moduleAPI";

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendRes, deptRes, statusRes] = await Promise.all([
        getOverviewStats(),
        getMonthlyTrend(),
        getDepartmentPerformance(),
        getStatusDistribution(),
      ]);
      setStats(statsRes.data.stats);
      setTrend(trendRes.data.trend || []);
      setDepartments(deptRes.data.departments || []);
      setStatusDist(statusRes.data.distribution || []);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalForPie = statusDist.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Transparency & Analytics Dashboard
        </h1>
        <p className="text-gray-600">
          Real-time insights into RTI request statistics and department performance
        </p>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total RTI Requests" value={stats.totalRequests} color="blue" />
          <StatCard label="Resolved" value={stats.resolvedCount} color="green" />
          <StatCard label="Pending" value={stats.pendingCount} color="yellow" />
          <StatCard label="Total Appeals" value={stats.totalAppeals} color="red" />
          <StatCard label="Last 30 Days" value={stats.recentRequests} color="purple" />
          <StatCard label="Registered Citizens" value={stats.totalUsers} color="indigo" />
          <StatCard label="Active PIOs" value={stats.totalPIOs} color="teal" />
          <StatCard
            label="Avg Resolution"
            value={`${stats.avgResolutionDays} days`}
            color="orange"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {["overview", "departments", "status"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "overview"
              ? "Monthly Trend"
              : tab === "departments"
              ? "Department Performance"
              : "Status Distribution"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly RTI Requests (Last 12 Months)
          </h3>
          {trend.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trend data available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Month</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Submitted</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Resolved</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Bar Chart</th>
                  </tr>
                </thead>
                <tbody>
                  {trend.map((item, index) => {
                    const maxVal = Math.max(...trend.map((t) => t.submitted), 1);
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{item.month}</td>
                        <td className="py-3 px-4 text-right text-gray-700">{item.submitted}</td>
                        <td className="py-3 px-4 text-right text-green-600 font-medium">
                          {item.resolved}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${(item.submitted / maxVal) * 100}%` }}
                              />
                            </div>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(item.resolved / maxVal) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-blue-600">Submitted</span>
                            <span className="text-xs text-green-600">Resolved</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "departments" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Department-wise Performance
          </h3>
          {departments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No department data available yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Resolved</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Pending</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Rejected</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Avg Days</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Resolution %</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{dept.department}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{dept.total}</td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">
                        {dept.responded}
                      </td>
                      <td className="py-3 px-4 text-right text-yellow-600">{dept.pending}</td>
                      <td className="py-3 px-4 text-right text-red-600">{dept.rejected}</td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {dept.avgResolutionDays}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            dept.resolutionRate >= 80
                              ? "bg-green-100 text-green-700"
                              : dept.resolutionRate >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {dept.resolutionRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "status" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            RTI Status Distribution
          </h3>
          {statusDist.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No status data available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visual bars */}
              <div className="space-y-3">
                {statusDist.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">
                        {item.status.replace(/_/g, " ")}
                      </span>
                      <span className="text-gray-500">
                        {item.count} ({totalForPie > 0 ? Math.round((item.count / totalForPie) * 100) : 0}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-6">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${totalForPie > 0 ? (item.count / totalForPie) * 100 : 0}%`,
                          backgroundColor: item.color,
                          minWidth: item.count > 0 ? "2rem" : "0",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary table */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-3">Summary</h4>
                <div className="space-y-2">
                  {statusDist.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-700">
                          {item.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {item.count}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2 px-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">TOTAL</span>
                    <span className="text-sm font-bold text-blue-800">{totalForPie}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Stat Card Component ─────────────────────────────
const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  red: "bg-red-50 border-red-200 text-red-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  teal: "bg-teal-50 border-teal-200 text-teal-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
};

const StatCard = ({ label, value, color }) => (
  <div className={`rounded-lg border p-4 ${colorMap[color] || colorMap.blue}`}>
    <p className="text-xs font-medium opacity-80 mb-1">{label}</p>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AnalyticsDashboard;
