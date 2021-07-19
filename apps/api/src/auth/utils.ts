import { argon2id, hash, verify } from "argon2";

export interface SessionPayload {
  /** The subject (user) id. */
  sub: string;
}

export const hashPassword = (password: string) =>
  hash(password, { type: argon2id });

export const verifyPassword = (hashedPassword: string, password: string) =>
  verify(hashedPassword, password, { type: argon2id });
