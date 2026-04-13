import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import "../index.css";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="hero-wrapper">
        <div className="hero-text">
          <p>Learn. Prepare. Stay Safe.</p>
        </div>

        <div className="hero-action">
          <button
            className="hero-btn"
            onClick={() => navigate("/login")}
          >
            Get Started →
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}