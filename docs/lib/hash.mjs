export async function sha256Hex(text) {
  const encoded = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
