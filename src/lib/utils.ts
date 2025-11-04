import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a psychologist access code in the format PSI-#####
// Example: PSI-04217. Use only digits to keep it easy to communicate.
export function generatePsychologistCode(): string {
  const n = Math.floor(Math.random() * 100000); // 0..99999
  const digits = n.toString().padStart(5, '0');
  return `PSI-${digits}`;
}
