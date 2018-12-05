import { JsApi } from '../lib/jsapi';
import { Plugin } from './_types';

/**
 * Removes names from groups that aren't referenced in any target animations.
 * These are expected to then be stripped by collapseGroups
 */
function fn(item: JsApi) {
  const findRecursive = (
    current: JsApi,
    filter: (node: JsApi) => Boolean,
    results: JsApi[] = [],
  ): JsApi[] => {
    if (filter(current)) {
      results.push(current);
    }
    current.content.forEach(child => {
      findRecursive(child, filter, results);
    });
    return results;
  };

  const animationTargets: Set<string> = new Set(
    findRecursive(item, node => node.isElem('target'))
      .filter(node => node.hasAttr('android:name'))
      .map(node => node.attr('android:name').value),
  );

  return item;
}

export const removeUnusedNames: Plugin<undefined> = {
  type: 'full',
  active: true,
  description: 'Merge animations for the same target',
  params: undefined,
  fn,
};
