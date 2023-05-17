import crypto from "crypto"
export function assertNever(x: never): asserts x is never {
    if(x) {
        throw new Error(`Expected never, got ${x}`)
    }
}

export function getUniqueId(): string {
   return crypto.randomBytes(6).toString("hex")
}

export function assertIsDefined<T>(x: T): asserts x is NonNullable<T> {
    if(typeof x === "undefined") {
        throw new Error("cannot be undefined")
    }
}

export function getRiskyness(): number {
    return crypto.randomInt(100) / 100
}