import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  if (!date) return '';
  
  // If it's already a Date object, use it directly
  // Otherwise, create a new Date from the string
  const dateObj = date instanceof Date ? date : new Date(date);
  
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatBytes(bytes: number | bigint | string | null) {
  if (!bytes) return '0 B';

  // Convert input to BigInt
  const numBytes = typeof bytes === 'string' ? BigInt(bytes) : 
                  typeof bytes === 'number' ? BigInt(Math.floor(bytes)) : bytes;

  const k = BigInt(1024);
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  // Find the appropriate unit
  let i = 0;
  let b = numBytes;
  while (b >= k && i < sizes.length - 1) {
    b = b / k;
    i++;
  }

  // Convert back to number for formatting, with 2 decimal places
  const value = Number(b);
  return `${value.toFixed(2)} ${sizes[i]}`;
}

export function serializeBigInt(data: any): any {
  return JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function fetcher<T = any>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init)
  
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    // Attach extra info to the error object.
    const info = await res.json().catch(() => ({}))
    ;(error as any).status = res.status
    ;(error as any).info = info
    throw error
  }
  
  return res.json()
}
