import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { abandonFlowOutside, initialiseAnalytics, trackEvent } from "../utils/analytics";

export default function RouteAnalytics() {
  const { pathname } = useLocation();

  useEffect(() => initialiseAnalytics(), []);
  useEffect(() => {
    abandonFlowOutside(pathname);
    if (pathname === "/") trackEvent("landing_page_view");
  }, [pathname]);

  return null;
}
