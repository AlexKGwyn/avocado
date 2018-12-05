import {
  applyTransforms,
  convertToRelative,
  flattenGroups,
  getGroupAttrs,
  getRotation,
  getScaling,
  getTranslation,
  js2path,
  path2js,
} from './_path';

import { JsApi } from '../lib/jsapi';
import { Plugin } from './_types';

export const defaultParams = {
  floatPrecision: 3,
  transformPrecision: 5,
  applyTransformsStroked: true,
};

export type Params = typeof defaultParams;

/**
 * Bakes group transforms into paths.
 */
function fn(item: JsApi, params: Params) {

  return item;
}


export const bakeGroupAnimations: Plugin<Params> = {
  type: 'perItem',
  active: true,
  description: 'merges group transforms towards the bottom of the tree',
  params: defaultParams,
  fn,
};
