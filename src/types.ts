import type { Type } from "arktype";

type AllowUndefined<T> = {
  [P in keyof T]: T[P] | undefined;
};

export type ExcludeUndefined<T> = {
  [P in keyof T]: undefined extends T[P] ? never : T[P];
};

export type AenvArgs<T extends Type<{}>> = {
  schema: T;
  runtimeEnv: AllowUndefined<T["inferIn"]> | NodeJS.ProcessEnv;
  name?: string;
  clientPrefix?: string;
  skipValidation?: boolean;
  isServer?: boolean;
};
