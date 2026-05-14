export function escapeLiteral(str: string): string {
  // Escapes characters that have special meaning in regex outside of character classes
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeClass(str: string): string {
  // Escapes characters that have special meaning inside regex character classes: [ ] \ ^ -
  return str.replace(/[\]\\^-]/g, '\\$&');
}
