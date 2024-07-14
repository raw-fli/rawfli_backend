import { ValidationError } from "class-validator";

export function extractConstraints(
  error: ValidationError,
  collected: string[] = [],
): string[] {
  if (error.constraints) {
    collected.push(...Object.values(error.constraints));
  }

  if (error.children) {
    for (const child of error.children) {
      extractConstraints(child, collected);
    }
  }

  return collected;
}