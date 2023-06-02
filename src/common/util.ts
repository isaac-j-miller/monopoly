import crypto from "crypto";

export function assertNever(x: never): asserts x is never {
  if (x) {
    throw new Error(`Expected never, got ${x}`);
  }
}

export function getUniqueId(): string {
  return crypto.randomBytes(6).toString("hex");
}

export function assertIsDefined<T>(x: T, message?: string): asserts x is NonNullable<T> {
  if (typeof x === "undefined") {
    throw new Error(message ?? "cannot be undefined");
  }
}

export function getRiskyness(): number {
  return crypto.randomInt(100) / 100;
}

export function isPromise(x: unknown): x is Promise<unknown> {
  const then = (x as any)?.then;
  return typeof then === "function";
}

export function validateNumberIsNotNaN(number: number, message?: string) {
  if (Number.isNaN(number)) {
    throw new Error(message ?? "Expected number to not be NaN");
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
