"use client";

import React from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../app/actions/auth";

export default function LogoutButton() {
  const [loading, setLoading] = React.useState(false);
  const { setAccessToken } = useAuth();

  async function handleLogout() {
    setLoading(true);
    setAccessToken(null);
    await logout();
  }

  return (
    <button onClick={handleLogout} disabled={loading} className="btn">
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
