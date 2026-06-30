import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import logoImage from "../assets/logo.png";
import { BackButton } from "../components/BackButton";
import "../styles/login.css";

function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    isFriend: "Yes",
    realNameAnswer: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const isFriend = form.isFriend === "Yes";
    const normalizedAnswer = form.realNameAnswer.trim().toLowerCase().replace(/\s+/g, " ");
    const isValidName = normalizedAnswer === "fazin" || normalizedAnswer === "fazin harshad";

    if (isFriend && !isValidName) {
      alert("Wrong answer. You can register only if Lallu's real name is Fazin or Fazin Harshad.");
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
        isFriend,
        realNameAnswer: form.realNameAnswer,
      });

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
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

      <section className="auth-card" aria-label="Register form">
        <div className="auth-brand-row">
          <img src={logoImage} alt="LalluGram logo" className="brand-logo-image" />
          <div>
            <h1 className="auth-title">LalluGram</h1>
            <p className="auth-subtitle">Create your account</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <label className="auth-field-label" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={form.username}
            placeholder="Choose a username"
            className="auth-input"
            onChange={handleChange}
            required
          />

          <label className="auth-field-label" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
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
            type="password"
            id="password"
            name="password"
            value={form.password}
            placeholder="Create a password"
            className="auth-input"
            onChange={handleChange}
            autoComplete="new-password"
            required
          />

          <div>
            <label className="auth-field-label" htmlFor="isFriend">
              Are you Lallu&apos;s friend?
            </label>
            <select
              id="isFriend"
              name="isFriend"
              className="auth-input"
              value={form.isFriend}
              onChange={handleChange}
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          {form.isFriend === "Yes" ? (
            <div>
              <label className="auth-field-label" htmlFor="realNameAnswer">
                Tell Lallu&apos;s real name
              </label>
              <input
                type="text"
                id="realNameAnswer"
                name="realNameAnswer"
                value={form.realNameAnswer}
                placeholder="Type the real name"
                className="auth-input"
                onChange={handleChange}
                required
              />
            </div>
          ) : null}

          <button className="auth-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?
          <Link to="/login" className="auth-footer-link">
            Login
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
