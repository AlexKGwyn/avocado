import { JsApi, Attr } from '../lib/jsapi';
import { Plugin } from './_types';

/**
 * Converts sequentially animation sets to together animation sets.
 * This lets us merge animations easier and avoids animation issues on older platforms described in
 * https://medium.com/androiddevelopers/re-animation-7869722af206#7bd8
 */
function fn(item: JsApi) {
  if (item.isElem('set') && item.hasAttr('android:ordering')) {
    if (item.attr('android:ordering').value === 'sequentially') {
      let currentTime = 0;

      // TODO needs to be recursive for nested sets
      for (const child of item.content) {
        const startOffset = child.attr('android:startOffset');
        const duration = child.attr('android:duration');
        if (startOffset) {
          currentTime += parseInt(startOffset.value, 10);
          startOffset.value = currentTime.toString();
        } else if (currentTime > 0) {
          child.addAttr({
            name: 'android:startOffset',
            prefix: 'android',
            local: 'startOffset',
            value: currentTime.toString(),
          });
        }
        if (duration) {
          currentTime += parseInt(duration.value, 10);
        }
      }
    }
    item.removeAttr('android:ordering');
  }

  return item;
}

export const convertAnimationSetsToTogether: Plugin<undefined> = {
  type: 'perItem',
  active: true,
  description: 'Merge animations for the same target',
  params: undefined,
  fn,
};
