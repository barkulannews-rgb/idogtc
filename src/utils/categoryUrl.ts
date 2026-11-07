export function categoryUrl(id: string): string {
  return `/?category=${encodeURIComponent(id)}`;
}
