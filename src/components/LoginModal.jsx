import { useState } from "react";
import { useAuthModal } from "../context/AuthModalContext";
import "./loginModal.css";

/* 🔹 React Icons */
import { FcGoogle } from "react-icons/fc";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { IoClose } from "react-icons/io5";

export default function LoginModal() {
  const { isLoginOpen, closeLogin } = useAuthModal();

  /* 🔹 Password visibility state */
  const [showPassword, setShowPassword] = useState(false);

  if (!isLoginOpen) return null;

  return (
    <div className="login-backdrop" onClick={closeLogin}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          className="login-close"
          onClick={closeLogin}
          aria-label="Close"
        >
          <IoClose />
        </button>

        <h2>Log in to your account</h2>

        {/* Google login */}
        <button className="google-btn">
          <FcGoogle className="google-icon" />
          Log in with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <label>
          Email
          <input type="email" placeholder="user@example.com" />
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
            />

            <button
              type="button"
              className="eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </label>

        <a className="forgot" href="#">
          Forgot password?
        </a>

        <button className="login-primary">Log in</button>

        <p className="signup">
          Don’t have an account? <a href="#">Sign up</a>
        </p>

        <p className="terms">
          By clicking “Log in” you agree to our
          <a href="#"> Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
