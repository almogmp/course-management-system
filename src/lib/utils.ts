import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג מחלקות Tailwind ללא התנגשויות */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
