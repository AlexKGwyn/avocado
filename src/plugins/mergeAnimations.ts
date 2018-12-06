// import { JsApi } from '../lib/jsapi';
// import { Plugin } from './_types';
// import { start } from 'repl';

// /**
//  * Removes names from groups that aren't referenced in any target animations.
//  * These are expected to then be stripped by collapseGroups
//  */
// function fn(item: JsApi) {
//   const findRecursive = (
//     current: JsApi,
//     filter: (node: JsApi) => Boolean,
//     results: JsApi[] = [],
//   ): JsApi[] => {
//     if (filter(current)) {
//       results.push(current);
//     }
//     current.content.forEach(child => {
//       findRecursive(child, filter, results);
//     });
//     return results;
//   };

//   const animationTargets: Set<string> = new Set(
//     findRecursive(item, node => node.isElem('target'))
//       .filter(node => node.hasAttr('android:name'))
//       .map(node => node.attr('android:name').value),
//   );

//   return item;
// }

// function convertSequentialToTogether(animSet: JsApi): JsApi {
//   let currentTime = 0;
//   for(const animator for animSet){
//     let startDelay = animator.attr('android:startDelay', 0);
//     let duration = animator.attr('android:duration', 0);
//     animator.a
//   }
// }

// export const removeUnusedNames: Plugin<undefined> = {
//   type: 'full',
//   active: true,
//   description: 'Merge animations for the same target',
//   params: undefined,
//   fn,
// };
