import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ProtectedRoute } from "./ProtectedRoute";

export default function App() {
  
  // This effect is just for you to verify the URL in the console while developing/testing
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL;
    console.log("🚀 System Check: Frontend is pointing to:", backendUrl || "LOCAL_HOST (check your .env)");
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected Routes - Only accessible if logged in */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      {/* Redirect all other paths to /home (which redirects to /login if not authenticated) */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}