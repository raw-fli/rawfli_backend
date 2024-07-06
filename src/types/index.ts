export type Merge<F, S> = {
  [K in keyof (F & S)]: K extends keyof S
    ? S[K]
    : K extends keyof F
      ? F[K]
      : never;
};

export interface ResponseForm<T> {
  result: true;
  code: 1000;
  requestToResponse?: `${number}ms`;
  data: T;
}

export type ERROR = { result: false; code: number; data: string };

export type Try<T> = ResponseForm<T>;
export type TryCatch<T, E extends ERROR> = ResponseForm<T> | E;

export function createResponseForm<T>(
  data: T,
  requestToResponse?: `${number}ms`,
): Try<T> {
  return {
    result: true,
    code: 1000,
    requestToResponse,
    data,
  } as const;
}
