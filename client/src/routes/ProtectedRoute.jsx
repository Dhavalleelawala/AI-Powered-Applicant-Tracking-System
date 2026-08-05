import { CircularProgress, Box } from '@mui/material';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth(); const location = useLocation();
  if (loading) return <Box sx={{ p: 8, textAlign: 'center' }}><CircularProgress color="secondary" /></Box>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/jobs'} replace />;
  return children;
}
