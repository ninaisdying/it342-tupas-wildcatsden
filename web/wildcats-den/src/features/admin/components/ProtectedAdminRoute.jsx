import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function ProtectedAdminRoute({ children }) {
  const { user, setUser, isLoading } = useContext(UserContext);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // If NO context user but user exists in localStorage → restore it
    if (!user) {
      const saved = localStorage.getItem("currentUser");
      if (saved) setUser(JSON.parse(saved));
    }

    setTimeout(() => setChecking(false), 100);
  }, []);

  if (checking || isLoading) return null;

  if (!user || user.userType !== "Admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
