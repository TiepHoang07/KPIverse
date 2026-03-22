import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-card/80 border-b border-border px-6 py-3 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
      <Link to="/" className="font-bold text-xl text-foreground">
        KPIverse
      </Link>

      <div className="space-x-4">
        {!user && (
          <>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Login</Link>
            <Link to="/register" className="text-muted-foreground hover:text-foreground">Register</Link>
          </>
        )}

        {user && (
          <>
            <span className="text-muted-foreground">Hi, {user.name || user.email}</span>
            <button
              onClick={logout}
              className="text-destructive hover:underline"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
