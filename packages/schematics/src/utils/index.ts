export function classify(val: string): string {
  return val.charAt(0).toUpperCase() + val.slice(1);
}
export function pluralize(val: string): string {
  return val.endsWith('s') ? val : val + 's';
}
