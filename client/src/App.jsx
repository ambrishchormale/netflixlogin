import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { ProtectedRoute } from "./ProtectedRoute";

export default function App() {
  // This helps you see if your Vercel Environment Variable is working
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL;
    console.log("🚀 API Check:", backendUrl || "Localhost");
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      {/* If the user goes to any other page, send them home */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}