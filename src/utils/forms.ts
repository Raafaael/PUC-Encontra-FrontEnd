export function formData(form: HTMLFormElement): Record<string, string> {
  const data = new FormData(form);
  return Object.fromEntries(Array.from(data.entries()).map(([key, value]) => [key, String(value)]));
}
