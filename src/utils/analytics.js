import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { firestore } from "./firebase";

const QUEUE_KEY = "studyforge.analytics.queue";
const VISITOR_KEY = "studyforge.analytics.visitor";
const VISIT_KEY = "studyforge.analytics.visit";
const SESSION_KEY = "studyforge.analytics.session";
const FLOW_KEY = "studyforge.analytics.flow";
const RETURN_AFTER_MS = 30 * 60 * 1000;
const allowedMetadata = new Set(["flow", "step", "subject", "topic", "lesson", "questions", "score", "source"]);
let flushing = false;
const recentEvents = new Map();

const hasBrowser = () => typeof window !== "undefined";
const makeId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const readJson = (storage, key, fallback) => {
  try { return JSON.parse(storage.getItem(key) || "null") ?? fallback; }
  catch { return fallback; }
};
const cleanMetadata = (metadata = {}) => Object.fromEntries(Object.entries(metadata)
  .filter(([key, value]) => allowedMetadata.has(key) && ["string", "number", "boolean"].includes(typeof value))
  .slice(0, 8)
  .map(([key, value]) => [key, typeof value === "string" ? value.slice(0, 120) : value]));

const identity = () => {
  let visitorId = localStorage.getItem(VISITOR_KEY);
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!visitorId) { visitorId = makeId(); localStorage.setItem(VISITOR_KEY, visitorId); }
  if (!sessionId) { sessionId = makeId(); sessionStorage.setItem(SESSION_KEY, sessionId); }
  return { visitorId, sessionId };
};

const writeQueue = (queue) => localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-100)));

const flushQueue = async () => {
  if (!hasBrowser() || flushing || !navigator.onLine) return;
  const queued = readJson(localStorage, QUEUE_KEY, []);
  if (!queued.length) return;
  flushing = true;
  const remaining = [];
  for (const item of queued) {
    try {
      await addDoc(collection(firestore, "analyticsEvents"), { ...item, recordedAt: serverTimestamp() });
    } catch {
      remaining.push(item);
    }
  }
  writeQueue(remaining);
  flushing = false;
};

export const trackEvent = (event, metadata = {}) => {
  if (!hasBrowser()) return;
  const clean = cleanMetadata(metadata);
  const dedupeKey = `${event}:${window.location.pathname}:${JSON.stringify(clean)}`;
  const now = Date.now();
  if (now - (recentEvents.get(dedupeKey) || 0) < 1500) return;
  recentEvents.set(dedupeKey, now);
  const item = {
    event,
    path: `${window.location.pathname}${window.location.search}`.slice(0, 300),
    occurredAt: new Date().toISOString(),
    ...identity(),
    metadata: clean,
  };
  writeQueue([...readJson(localStorage, QUEUE_KEY, []), item]);
  void flushQueue();
};

export const initialiseAnalytics = () => {
  if (!hasBrowser()) return () => {};
  const now = Date.now();
  const visit = readJson(localStorage, VISIT_KEY, null);
  if (visit?.lastVisitAt && now - visit.lastVisitAt >= RETURN_AFTER_MS) trackEvent("return_visit", { source: "returning-browser" });
  localStorage.setItem(VISIT_KEY, JSON.stringify({ firstVisitAt: visit?.firstVisitAt || now, lastVisitAt: now }));
  const online = () => void flushQueue();
  const pagehide = () => {
    const current = readJson(sessionStorage, FLOW_KEY, null);
    if (!current) return;
    trackEvent("flow_abandon", { flow: current.flow, step: current.step, subject: current.subject, topic: current.topic });
    sessionStorage.removeItem(FLOW_KEY);
  };
  window.addEventListener("online", online);
  window.addEventListener("pagehide", pagehide);
  void flushQueue();
  return () => {
    window.removeEventListener("online", online);
    window.removeEventListener("pagehide", pagehide);
  };
};

export const startFlow = (flow, id, step, pathPrefix = window.location.pathname) => {
  if (!hasBrowser() || !flow || !id) return;
  const current = readJson(sessionStorage, FLOW_KEY, null);
  const key = `${flow}:${id}`;
  if (current?.key === key) return;
  if (current) trackEvent("flow_abandon", { flow: current.flow, step: current.step, subject: current.subject, topic: current.topic });
  const [subject, topic] = String(id).split("/");
  sessionStorage.setItem(FLOW_KEY, JSON.stringify({ key, flow, step, pathPrefix, subject, topic }));
  trackEvent(flow === "practice" ? "practice_start" : "topic_start", { flow, step, subject, topic });
};

export const updateFlow = (flow, id, step) => {
  if (!hasBrowser()) return;
  const current = readJson(sessionStorage, FLOW_KEY, null);
  if (current?.key === `${flow}:${id}`) sessionStorage.setItem(FLOW_KEY, JSON.stringify({ ...current, step }));
};

export const completeFlow = (flow, id, event, metadata = {}) => {
  if (!hasBrowser()) return;
  const current = readJson(sessionStorage, FLOW_KEY, null);
  if (current?.key === `${flow}:${id}`) sessionStorage.removeItem(FLOW_KEY);
  trackEvent(event, { flow, ...metadata });
};

export const abandonFlowOutside = (pathname) => {
  if (!hasBrowser()) return;
  const current = readJson(sessionStorage, FLOW_KEY, null);
  if (current && !pathname.startsWith(current.pathPrefix)) {
    trackEvent("flow_abandon", { flow: current.flow, step: current.step, subject: current.subject, topic: current.topic });
    sessionStorage.removeItem(FLOW_KEY);
  }
};
