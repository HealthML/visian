import { argon2id, hash, verify } from "argon2";

export interface JwtPayload {
  sub: string;
}

export const mockJwtSecret = "tbpa#TSs$Fk9?!Sg";

export const hashPassword = (password: string) =>
  hash(password, { type: argon2id });

export const verifyPassword = (hash: string, password: string) =>
  verify(hash, password, { type: argon2id });
