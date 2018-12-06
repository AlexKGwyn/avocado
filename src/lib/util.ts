import { JsApi } from './jsapi';

export function findRecursive(
  current: JsApi,
  filter: (node: JsApi) => Boolean,
  results: JsApi[] = [],
): JsApi[] {
  if (filter(current)) {
    results.push(current);
  }
  current.content.forEach(child => {
    findRecursive(child, filter, results);
  });
  return results;
}
