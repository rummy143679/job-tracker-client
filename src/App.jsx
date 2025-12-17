import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Read token once on mount
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored);
    setAuthReady(true);
  }, []);

  if (!authReady) {
    // Optional loading state while checking localStorage
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-md mx-auto px-3 py-4">
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/login"
            element={
              token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login onLogin={(t) => setToken(t)} />
              )
            }
          />

          <Route
            path="/register"
            element={
              token ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register onLogin={(t) => setToken(t)} />
              )
            }
          />

          <Route
            path="/dashboard"
            element={
              token ? (
                <Dashboard
                  onLogout={() => {
                    localStorage.clear();
                    setToken(null);
                  }}
                />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Optional catch-all: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
