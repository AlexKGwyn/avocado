import { JsApi } from '../lib/jsapi';
import { Plugin } from './_types';
import { Options } from '../lib/avocado';

/**
 * Merge animates for the same object into one animation set
 */
function fn(item: JsApi) {
  const targets: Map<string, JsApi[]> = new Map();
  findRecursive(item, node => node.isElem('target'))
    .filter(node => node.hasAttr('android:name'))
    .forEach(node => {
      const name = node.attr('android:name').value;
      if (targets.has(name)) {
        targets.get(name).push(node);
      } else {
        targets.set(name, [node]);
      }
    });

  // This currently assumes that all of the sets have been flattened
  for (const value of Array.from(targets.values())) {
    let primarySet;
    if (value.length > 0) {
      for (const element of value) {
        if (
          !element.hasAttr('android:ordering') ||
          element.attr('android:ordering').value === 'together'
        ) {
          if (primarySet) {
            const anims = getAnimationsFromTarget(element);
            primarySet.spliceContent(primarySet.content.length, 0, anims);

            element.parentNode.spliceContent(
              element.parentNode.content.indexOf(element),
              1,
              [],
            );
          } else if (!element.isEmpty() && !element.content[0].isEmpty()) {
            const child = element.content[0].content[0];
            if (child && child.isElem('set')) {
              primarySet = child;
            } else {
              primarySet = new JsApi({
                elem: 'set',
              });
              const parent = child.parentNode;
              parent.spliceContent(parent.content.indexOf(child), 1, [
                primarySet,
              ]);
              primarySet.spliceContent(0, 0, [child]);
            }
          }
        }
      }
    }
  }
  return item;
}

function getAnimationsFromTarget(item: JsApi) {
  return findRecursive(item, node => node.isElem('objectAnimator'));
}

function findRecursive(
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

export const mergeAnimations: Plugin<undefined> = {
  type: 'full',
  active: true,
  description: 'Merges animations targetting the same element into one',
  params: undefined,
  fn,
};
