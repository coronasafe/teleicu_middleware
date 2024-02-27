import crypto from "crypto";

/**
 * Generates a random string of the specified size.
 * @param size The size of the random string to generate.
 * @returns The generated random string.
 */
export function randomString(size: number) {
  return crypto.randomBytes(size).toString("base64url");
}
