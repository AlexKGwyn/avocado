import { JsApi } from '../lib/jsapi';
import { Plugin } from './_types';

/**
 * Remove useless sets
 */
function fn(item: JsApi) {
  // TODO we can do a check to see if there is only one animator but other apt elements
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

  findRecursive(
    item,
    node => node.isElem('set') && node.content && node.content.length === 1,
  ).forEach(element => {
    element.parentNode.spliceContent(0, 1, element.content);
  });
  return item;
}

export const removeUselessSets: Plugin<undefined> = {
  type: 'full',
  active: true,
  description: 'removes useless sets',
  params: undefined,
  fn,
};
