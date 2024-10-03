import { type, Type } from "arktype";
import { InvalidAccessError, InvalidEnvVariablesError } from "./errors";
import type { AenvArgs, ExcludeUndefined } from "./types";

export const validateEnv = <T extends Type<{}>, S extends boolean = false>(
  schema: T,
  runtimeEnv: T["inferIn"],
  name?: string,
  skipMorphs: S = false as S
): S extends true ? T["inferIn"] : T["infer"] => {
  const s = schema.onUndeclaredKey("delete");
  const env = skipMorphs ? (s.in as any).traverse(runtimeEnv) : s(runtimeEnv);

  if (env instanceof type.errors) {
    throw new InvalidEnvVariablesError(env, name);
  }

  return env;
};

export const createAenv = <T extends Type<{}>>(
  args: AenvArgs<T>
): T["infer"] => {
  const {
    schema,
    runtimeEnv,
    name,
    clientPrefix,
    skipValidation = false,
    isServer = typeof window === "undefined" || "Deno" in window,
  } = args;

  const schemaKeys = schema.props.map((prop) => (prop as any).key) as string[];

  const env = skipValidation
    ? Object.fromEntries(
        Object.entries(runtimeEnv).filter(([key]) => schemaKeys.includes(key))
      )
    : validateEnv(schema, runtimeEnv, name);

  const ignoreKey = (prop: string) => {
    return prop === "__esModule" || prop === "$$typeof";
  };

  const combinedEnv = {
    ...env,
    _envName: name,
  };

  return new Proxy(combinedEnv, {
    get(target, key) {
      if (key === "_envName") {
        return name;
      }

      if (typeof key !== "string") return undefined;
      if (ignoreKey(key)) return undefined;

      if (!isServer && (!clientPrefix || key.startsWith(clientPrefix))) {
        throw new InvalidAccessError(name);
      }

      return target[key as keyof typeof target];
    },
  }) as T["infer"];
};

export const removeUndefined = <T extends Record<string, unknown>>(object: T) =>
  Object.fromEntries(
    Object.entries(object).filter(([_, v]) => v !== undefined)
  ) as ExcludeUndefined<T>;
