import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Weather from './pages/Weather';
import Parcels from './pages/Parcels';
import ParcelForm from './pages/ParcelForm';
import ParcelDetail from './pages/ParcelDetail';
import Predictions from './pages/Predictions';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import NationalMap from './pages/NationalMap';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Cooperative from './pages/Cooperative';

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="weather" element={<Weather />} />
        <Route path="parcels" element={<Parcels />} />
        <Route path="parcels/new" element={<ParcelForm />} />
        <Route path="parcels/:id" element={<ParcelDetail />} />
        <Route path="parcels/:id/edit" element={<ParcelForm />} />
        <Route path="predictions" element={<Predictions />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="reports" element={<Reports />} />
        <Route path="map" element={<NationalMap />} />
        <Route path="admin" element={<Admin />} />
        <Route path="cooperative" element={<Cooperative />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
