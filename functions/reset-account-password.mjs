import fs from "node:fs/promises";
import os from "node:os";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { writeFirestoreDocuments } from "../scripts/firestoreImport.mjs";

const projectId = "revision-hub-ee911";
const usernameArgument = process.argv.find((value) => value.startsWith("--username="));
const usernameIndex = process.argv.indexOf("--username");
const username = (usernameArgument?.split("=").slice(1).join("=") || process.argv[usernameIndex + 1] || "").trim().toLowerCase();
const apply = process.argv.includes("--apply");

const readHiddenPassword = () => new Promise((resolve, reject) => {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    reject(new Error("Run this command in an interactive terminal or set STUDYFORGE_TEMP_PASSWORD securely."));
    return;
  }
  let value = "";
  process.stdout.write("Temporary password: ");
  process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");
  process.stdin.resume();
  const finish = () => {
    process.stdin.setRawMode(false);
    process.stdin.pause();
    process.stdin.removeListener("data", onData);
    process.stdout.write("\n");
    resolve(value);
  };
  const onData = (character) => {
    if (character === "\u0003") {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
      reject(new Error("Password reset cancelled."));
    } else if (character === "\r" || character === "\n") finish();
    else if (character === "\u007f") value = value.slice(0, -1);
    else value += character;
  };
  process.stdin.on("data", onData);
});

if (!/^[a-z0-9_-]{3,32}$/.test(username)) throw new Error("Pass a valid username with --username USERNAME.");
const temporaryPassword = apply ? (process.env.STUDYFORGE_TEMP_PASSWORD || await readHiddenPassword()) : "";
if (apply && temporaryPassword.length < 12) throw new Error("Use a temporary password of at least 12 characters.");

const config = JSON.parse(await fs.readFile(`${os.homedir()}/.config/configstore/firebase-tools.json`, "utf8"));
initializeApp({ projectId, credential: { getAccessToken: async () => ({ access_token: config.tokens.access_token, expires_in: 3600 }) } });
const auth = getAuth();
const email = `${username}@users.studyforge.local`;
const account = await auth.getUserByEmail(email);

console.log(JSON.stringify({ username, uid: account.uid, disabled: account.disabled, apply }));
if (!apply) process.exit(0);

await auth.updateUser(account.uid, { password: temporaryPassword, disabled: false });
await auth.revokeRefreshTokens(account.uid);
await writeFirestoreDocuments([{ collection: "accountSecurity", id: account.uid, data: { validAfter: Math.floor(Date.now() / 1000) } }], { projectId });
console.log(JSON.stringify({ username, passwordReset: true, refreshTokensRevoked: true }));
