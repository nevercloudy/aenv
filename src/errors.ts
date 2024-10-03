import { type, Type } from "arktype";

export class InvalidEnvVariablesError extends Error {
  constructor(envErrors: type.errors, envName?: string) {
    super(
      `🛑 Invalid environment variables${
        envName ? ` for '${envName}' env` : ""
      }:\n\t${envErrors.join("\n\t")}`
    );
    this.name = "InvalidEnvVariablesError";
  }
}

export class InvalidAccessError extends Error {
  constructor(envName?: string) {
    super(
      `🛑 Attempted to access server-only env on client${
        envName ? ` from '${envName}' env` : ""
      }`
    );
    this.name = "InvalidAccessError";
  }
}
