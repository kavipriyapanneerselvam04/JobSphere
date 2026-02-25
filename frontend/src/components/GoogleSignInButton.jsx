import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function GoogleSignInButton({ role = "USER" }) {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const existingScript = document.getElementById("google-identity-script");
    const initGoogle = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            const res = await api.post("/api/users/google-auth", {
              credential: response.credential,
              role,
            });

            const { id, name, email, role: userRole } = res.data.user;
            const token = res.data.token;
            localStorage.setItem("userId", id);
            localStorage.setItem("userName", name);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("role", userRole);
            if (token) localStorage.setItem("authToken", token);

            if (userRole === "RECRUITER") navigate("/recruiter");
            else navigate("/user");
          } catch (err) {
            alert(err.response?.data?.message || "Google sign-in failed");
          }
        },
      });

      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        width: 320,
        text: "signin_with",
      });
      setReady(true);
    };

    if (existingScript) {
      initGoogle();
      return;
    }

    const script = document.createElement("script");
    script.id = "google-identity-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, [navigate, role]);

  if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
    return (
      <p className="google-missing">
        Google sign-in is not configured. Add `REACT_APP_GOOGLE_CLIENT_ID` in frontend `.env`.
      </p>
    );
  }

  return (
    <div className="google-wrap">
      <div ref={containerRef} />
      {!ready && <small className="google-loading">Loading Google Sign-In...</small>}
    </div>
  );
}

export default GoogleSignInButton;
