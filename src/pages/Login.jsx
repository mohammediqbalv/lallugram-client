import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import logoImage from "../assets/logo.png";
import { BackButton } from "../components/BackButton";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await api.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      window.dispatchEvent(new Event("user-updated"));

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
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

      <section className="auth-card" aria-label="Login form">
        <div className="auth-brand-row">
          <img src={logoImage} alt="LalluGram logo" className="brand-logo-image" />
          <div>
            <h1 className="auth-title">LalluGram</h1>
            <p className="auth-subtitle">Welcome back to your timeline</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <label className="auth-field-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            placeholder="you@example.com"
            className="auth-input"
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label className="auth-field-label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            placeholder="Enter your password"
            className="auth-input"
            onChange={handleChange}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account?
          <Link to="/register" className="auth-footer-link">
            Register
          </Link>
        </p>

        <p className="auth-footer-text" style={{ marginTop: 8 }}>
          Admin?
          <Link to="/admin-login" className="auth-footer-link">
            Admin Login
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
