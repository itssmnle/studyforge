import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function BackButton({ fallback, children, className = "back-link" }) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(fallback);
  };

  return <button type="button" className={`${className} back-link`} onClick={goBack}><FiArrowLeft /> {children}</button>;
}
