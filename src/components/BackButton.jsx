import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

function BackButton({ className = "" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.pathname === "/") {
      return;
    }

    if (location.pathname === "/login" || location.pathname === "/register") {
      navigate("/", { replace: true });
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/");
  };

  return (
    <button
      type="button"
      className={`app-back-btn ${className}`.trim()}
      onClick={handleBack}
      aria-label="Go back"
      title="Go back"
    >
      <FiArrowLeft />
      <span>Back</span>
    </button>
  );
}

export default BackButton;
export { BackButton };
