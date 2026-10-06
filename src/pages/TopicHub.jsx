import { Navigate, useParams } from "react-router-dom";
import { findTopic } from "../data/scienceCurriculum";

export default function TopicHub() {
  const { subject, topic } = useParams();
  if (!findTopic(subject, topic)) return <Navigate to={`/subjects/${subject || "maths"}`} replace />;
  return <Navigate to={`/learn/${subject}/${topic}`} replace />;
}
