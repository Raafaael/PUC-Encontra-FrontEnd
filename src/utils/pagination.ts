import type { Paginated } from "../types.js";

export function isPaginated<T>(value: unknown): value is Paginated<T> {
  return Boolean(value && typeof value === "object" && "results" in value);
}

export function unwrapResults<T>(value: Paginated<T> | T[]): T[] {
  return isPaginated<T>(value) ? value.results : value;
}
