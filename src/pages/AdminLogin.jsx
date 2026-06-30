import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminService";
import { BackButton } from "../components/BackButton";
import logoImage from "../assets/logo.png";
import "../styles/login.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await adminLogin(email, password);
      localStorage.setItem("adminToken", res.token);
      localStorage.setItem("adminUser", JSON.stringify(res.admin));
      navigate("/admin");
    } catch (err) {
      alert(err.response?.data?.message || "Admin login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <BackButton className="auth-back-btn" />
      <div className="auth-orb orb-a" aria-hidden="true" />
      <div className="auth-orb orb-b" aria-hidden="true" />
      <div className="auth-grid" aria-hidden="true" />

      <section className="auth-card" aria-label="Admin login form">
        <div className="auth-brand-row">
          <img src={logoImage} alt="LalluGram logo" className="brand-logo-image" />
          <div>
            <h1 className="auth-title">Admin Login</h1>
            <p className="auth-subtitle">Manage users securely</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field-label" htmlFor="adminEmail">Email</label>
          <input
            id="adminEmail"
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@gmail.com"
            required
          />

          <label className="auth-field-label" htmlFor="adminPassword">Password</label>
          <input
            id="adminPassword"
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
          />

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Admin Sign In"}
          </button>
        </form>
      </section>
    </div>
  );
}
