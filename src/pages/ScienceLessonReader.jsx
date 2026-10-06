import { Navigate, useParams } from "react-router-dom";

export default function ScienceLessonReader() {
  const { subject, topic, section } = useParams();
  const suffix = section ? `/${section}` : "";
  return <Navigate to={`/notes/${subject}/${topic}${suffix}`} replace />;
}
