import { FiActivity, FiAperture, FiAward, FiBookOpen, FiCode, FiGlobe, FiUsers } from "react-icons/fi";

// eslint-disable-next-line react-refresh/only-export-components
export const classIconOptions = [
  { value: "users", label: "People", Icon: FiUsers },
  { value: "book", label: "Book", Icon: FiBookOpen },
  { value: "activity", label: "Activity", Icon: FiActivity },
  { value: "award", label: "Award", Icon: FiAward },
  { value: "code", label: "Code", Icon: FiCode },
  { value: "globe", label: "Globe", Icon: FiGlobe },
  { value: "aperture", label: "Aperture", Icon: FiAperture },
];

export default function ClassIcon({ icon = "users" }) {
  const Icon = classIconOptions.find((option) => option.value === icon)?.Icon || FiUsers;
  return <Icon />;
}
