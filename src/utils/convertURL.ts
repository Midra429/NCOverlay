export function convertURL(input: string): URL {
  return new URL(input, URL.canParse(input) ? undefined : location.href)
}
