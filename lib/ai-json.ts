export function extractJson<T>(raw: string): T | null {
  const startObject = raw.indexOf("{");
  const endObject = raw.lastIndexOf("}");
  const startArray = raw.indexOf("[");
  const endArray = raw.lastIndexOf("]");

  const objectCandidate =
    startObject >= 0 && endObject > startObject
      ? raw.slice(startObject, endObject + 1)
      : null;
  const arrayCandidate =
    startArray >= 0 && endArray > startArray
      ? raw.slice(startArray, endArray + 1)
      : null;

  for (const candidate of [objectCandidate, arrayCandidate, raw]) {
    if (!candidate) continue;
    try {
      return JSON.parse(candidate) as T;
    } catch {
      /* keep trying */
    }
  }

  return null;
}
