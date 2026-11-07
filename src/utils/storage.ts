import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function readStored<T>(key: string, fallback: T, valid: (value: unknown) => boolean = () => true): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value: unknown = key === 'idogtc_lang' && (raw === 'en' || raw === 'so') ? raw : JSON.parse(raw, (_key, item) =>
      typeof item === 'string' && item.startsWith('/src/assets/images/')
        ? item.replace('/src/assets/images/', '/images/') : item);
    return valid(value) ? value as T : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    setTimeout(() => window.dispatchEvent(new Event('idogtc-storage-error')), 0);
    return false;
  }
}

export function useStoredState<T>(key: string, fallback: T, valid?: (value: unknown) => boolean): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStored(key, fallback, valid));
  useEffect(() => { writeStored(key, value); }, [key, value]);
  return [value, setValue];
}

