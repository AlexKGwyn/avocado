import { JsApi } from '../lib/jsapi';
import { Plugin } from './_types';

/**
 * Removes names from groups that aren't referenced in any target animations. These are expected to then be stripped by collapseGroups
 */
function fn(item: JsApi) {

  let findRecursive = (current: JsApi, filter: (node: JsApi) => Boolean, results: JsApi[] = []): JsApi[] => {
    if (filter(current)) {
      results.push(current);
    }
    if (current.content && current.content.length > 0) {
      current.content.forEach(child => {
        findRecursive(child, filter, results)
      });
    }
    return results;
  }

  let vector = findRecursive(item, (node) => { return node.isElem('vector') })[0];
  let targetAnimations = findRecursive(item, (node) => { return node.isElem('vector') });

  if (vector) {
    let groups = getGroupsRecursive(vector);
  }

  return item;
}

function getGroupsRecursive(item: JsApi, map: Map<String, JsApi> = new Map): Map<String, JsApi> {
  if (item.isElem('group')) {
    if (item.hasAttr('android:name')) {
      map.set(item.attr('android:name').value, item);
    }
    item.content.forEach(item => {
      getGroupsRecursive(item, map);
    });
  }
  return map;
}

export const removeUselessGroupNames: Plugin<undefined> = {
  type: 'full',
  active: false,
  description: 'removes unused group names',
  params: undefined,
  fn,
};
