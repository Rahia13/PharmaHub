import { promises as fs } from "fs";
import path from "path";

/**
 * Private file storage. This is the local-disk adapter: files live under
 * STORAGE_DIR (never under /public) and are only served through
 * authenticated API routes.
 *
 * To move to S3/R2/Supabase, keep these three function signatures and swap
 * the bodies; nothing else in the app touches the filesystem.
 */

function root() {
  return path.resolve(process.env.STORAGE_DIR ?? "./storage");
}

// Reject keys that would escape the storage root (path traversal).
function resolveSafe(key: string) {
  const base = root();
  const full = path.resolve(base, key);
  if (!full.startsWith(base + path.sep)) throw new Error("Invalid storage key");
  return full;
}

export async function saveFile(key: string, data: Buffer) {
  const full = resolveSafe(key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data, { flag: "wx" }); // never overwrite
}

export async function readFile(key: string) {
  return fs.readFile(resolveSafe(key));
}

export async function deleteFile(key: string) {
  await fs.rm(resolveSafe(key), { force: true });
}
