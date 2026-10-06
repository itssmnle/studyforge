import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const toFirestoreValue = (value) => {
  if (value === null || value === undefined) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (typeof value === "object") return { mapValue: { fields: toFirestoreFields(value) } };
  return { stringValue: String(value) };
};
const toFirestoreFields = (object) => Object.fromEntries(Object.entries(object).map(([key, value]) => [key, toFirestoreValue(value)]));

const readProjectId = async (explicitProjectId) => {
  if (explicitProjectId) return explicitProjectId;
  const config = JSON.parse(await fs.readFile(new URL("../.firebaserc", import.meta.url), "utf8"));
  if (!config.projects?.default) throw new Error("No default Firebase project is configured in .firebaserc.");
  return config.projects.default;
};
const readAccessToken = async () => {
  if (process.env.FIREBASE_TOKEN) return process.env.FIREBASE_TOKEN;
  const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(await fs.readFile(configPath, "utf8"));
  if (!config.tokens?.access_token) throw new Error("Firebase CLI access token is unavailable. Run firebase login again.");
  return config.tokens.access_token;
};
const request = async (url, accessToken, options = {}) => {
  const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...options.headers } });
  if (!response.ok) throw new Error(`Firestore request failed: ${response.status} ${await response.text()}`);
  return response.status === 204 ? null : response.json();
};
const chunks = (values, size = 400) => {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
};

export const writeFirestoreDocuments = async (documents, { projectId: explicitProjectId } = {}) => {
  const projectId = await readProjectId(explicitProjectId);
  const accessToken = await readAccessToken();
  const databaseRoot = `projects/${projectId}/databases/(default)/documents`;
  for (const batch of chunks(documents)) {
    const writes = batch.map((item) => ({ update: { name: `${databaseRoot}/${item.collection}/${encodeURIComponent(item.id)}`, fields: toFirestoreFields(item.data) } }));
    const result = await request(`https://firestore.googleapis.com/v1/${databaseRoot}:batchWrite`, accessToken, { method: "POST", body: JSON.stringify({ writes }) });
    if (result.status?.some((status) => status.code)) throw new Error(`Firestore rejected a write: ${JSON.stringify(result.status)}`);
  }
  return { projectId, accessToken, databaseRoot };
};
export const listFirestoreDocuments = async (collectionName, credentials) => {
  const documents = [];
  let pageToken = "";
  do {
    const url = new URL(`https://firestore.googleapis.com/v1/${credentials.databaseRoot}/${collectionName}`);
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const page = await request(url, credentials.accessToken);
    documents.push(...(page.documents || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return documents;
};
export const deleteFirestoreDocuments = async (documentNames, credentials) => {
  for (const batch of chunks(documentNames)) {
    const result = await request(`https://firestore.googleapis.com/v1/${credentials.databaseRoot}:batchWrite`, credentials.accessToken, { method: "POST", body: JSON.stringify({ writes: batch.map((name) => ({ delete: name })) }) });
    if (result.status?.some((status) => status.code)) throw new Error(`Firestore rejected a delete: ${JSON.stringify(result.status)}`);
  }
};

