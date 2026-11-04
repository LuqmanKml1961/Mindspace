// Counts characters the way Postgres char_length() does (code points), so "😀" is 1, not 2.
export function characterCount(text: string): number {
  return [...text].length;
}
