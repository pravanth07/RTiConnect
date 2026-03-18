
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ChatBot from "./components/ChatBot";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TransparencyScoreboard from './pages/TransparencyScoreboard';
import ImpactWall from './pages/ImpactWall';
// Public Pages
import LandingPage from "./pages/LandingPage";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

// Citizen Pages
import CitizenDashboard from "./pages/Citizen/Dashboard";
import SubmitRTI from "./pages/Citizen/SubmitRTI";
import TrackRequest from "./pages/Citizen/TrackRequest";
import FileAppeal from "./pages/Citizen/FileAppeal";
import DepartmentRecommendation from "./pages/Citizen/DepartmentRecommendation";
import RTITemplates from "./pages/Citizen/RTITemplates";
import PaymentReceipt from "./pages/Citizen/PaymentReceipt";

// PIO Pages
import PIODashboard from "./pages/PIO/Dashboard";
import PendingRequests from "./pages/PIO/PendingRequests";
import RespondRequest from "./pages/PIO/RespondRequest";

// CIO Pages
import CIODashboard from "./pages/CIO/Dashboard";
import ManagePIOs from "./pages/CIO/ManagePIOs";
import Reports from "./pages/CIO/Reports";
import AnalyticsDashboard from "./pages/CIO/AnalyticsDashboard";

// Appellate Pages
import AppellateDashboard from "./pages/Appellate/Dashboard";
import HearingRoom from "./pages/Appellate/HearingRoom";
import Decisions from "./pages/Appellate/Decisions";


// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!user && !loading) {
  return <Navigate to="/login" replace />;
}

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};


// Role-based redirect
const RoleRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/home" replace />;

  const routes = {
    citizen: "/citizen",
    pio: "/pio",
    cio: "/cio",
    appellate: "/appellate",
  };

  return <Navigate to={routes[user.role] || "/citizen"} replace />;
};

const queryClient = new QueryClient();
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* Public */}
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/home" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/transparency" element={<TransparencyScoreboard />} />
            <Route path="/impact" element={<ImpactWall />} />
            <Route path="/dashboard" element={<RoleRedirect />} />
            <Route
              path="/unauthorized"
              element={
                <div className="flex items-center justify-center h-screen text-red-600 text-xl">
                  ⛔ Access Denied
                </div>
              }
            />

            {/* Citizen */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citizen/submit"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <SubmitRTI />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citizen/receipt"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <PaymentReceipt />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citizen/track/:id"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <TrackRequest />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citizen/appeal/:requestId"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <FileAppeal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citizen/find-department"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <DepartmentRecommendation />
                </ProtectedRoute>
              }
            />

            <Route
              path="/citizen/templates"
              element={
                <ProtectedRoute allowedRoles={["citizen"]}>
                  <RTITemplates />
                </ProtectedRoute>
              }
            />

            {/* PIO */}
            <Route
              path="/pio"
              element={
                <ProtectedRoute allowedRoles={["pio"]}>
                  <PIODashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pio/requests"
              element={
                <ProtectedRoute allowedRoles={["pio"]}>
                  <PendingRequests />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pio/requests/:id"
              element={
                <ProtectedRoute allowedRoles={["pio"]}>
                  <RespondRequest />
                </ProtectedRoute>
              }
            />

            {/* CIO */}
            <Route
              path="/cio"
              element={
                <ProtectedRoute allowedRoles={["cio"]}>
                  <CIODashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cio/pio"
              element={
                <ProtectedRoute allowedRoles={["cio"]}>
                  <ManagePIOs />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cio/reports"
              element={
                <ProtectedRoute allowedRoles={["cio"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/cio/analytics"
              element={
                <ProtectedRoute allowedRoles={["cio"]}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Appellate */}
            <Route
              path="/appellate"
              element={
                <ProtectedRoute allowedRoles={["appellate"]}>
                  <AppellateDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appellate/hearing"
              element={
                <ProtectedRoute allowedRoles={["appellate"]}>
                  <HearingRoom />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appellate/decisions"
              element={
                <ProtectedRoute allowedRoles={["appellate"]}>
                  <Decisions />
                </ProtectedRoute>
              }
            />

          </Routes>

          <ChatBot />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
