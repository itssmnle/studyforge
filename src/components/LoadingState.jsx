import yay from "../assets/revision-loop/yay.svg";

export default function LoadingState({ label = "Loading", detail = "Getting everything ready for you" }) {
  return <section className="loading-state" role="status" aria-live="polite">
    <div className="loading-state-bar" aria-hidden="true"><span /></div>
    <div className="loading-state-content">
      <img src={yay} alt="" className="loading-state-art" />
      <strong>{label}</strong>
      <p>{detail}</p>
    </div>
  </section>;
}
