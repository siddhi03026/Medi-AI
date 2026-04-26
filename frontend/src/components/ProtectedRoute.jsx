import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('imai_token');

  if (!token) {
    // Redirect to login, but save where user wanted to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
