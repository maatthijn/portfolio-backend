import { useNavigate } from "react-router-dom";
import { isTokenExpired } from "./utils/auth";
import { useEffect, useRef } from "react";
import useIdleTimer from "./utils/useIdleTimer";

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const alertShown = useRef(false);
  const token = localStorage.getItem("token");
  const handleTimeout = async () => {
    localStorage.removeItem("token");
    alert("You've been logged out due to inactivity.");
    navigate("/");
  }
  useIdleTimer(15 * 60 * 1000, handleTimeout);

  useEffect(() => {
    if (!alertShown.current && (!token || isTokenExpired(token))) {
      alertShown.current = true;
      localStorage.removeItem("token");

      window.alert("Your log in session is expired.");
      navigate("/");
    }
  }, [token, navigate])

  return children;
}