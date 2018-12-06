import { js2xml } from './js2xml';
import { Attr, JsApi } from './jsapi';
import { findRecursive } from './util';
import { xml2js } from './xml2js';
import { js2path } from '../plugins/_path';

const attributeToNameMap = new Map([
  ['android:animation', 'animator'],
  ['android:interpolator', 'interpolator'],
]);
function getFileNameFromAttribute(attr: string) {
  return attributeToNameMap.has(attr) ? attributeToNameMap.get(attr) : attr;
}

const attributeToResourcePrefixMap = new Map([
  ['android:animation', 'animator'],
  ['android:interpolator', 'anim'],
]);
function getResourceNameFromAttribute(attr: string) {
  return attributeToResourcePrefixMap.has(attr)
    ? attributeToResourcePrefixMap.get(attr)
    : attr;
}

export class Results {
  constructor(xml: string) {
    this.xml = xml;
  }
  xml: string;
  splits: [string, string][] = [];
}

export function processFactor(avdName: string, xml: string): Results {
  xml2xjs(xml, jsApi => {
      const ret = factor(jsApi, avdName);
      const results = new Results(toXmlString(jsApi));
      for (const [file, jsxml] of ret) {
        results.splits.push([file, toXmlString(jsxml)]);
      }
      return results;
    },
    _error => return new Results(xml),
  );
}

function factor(item: JsApi, avdName: string): [string, JsApi][] {
  const attrs = findRecursive(item, node => node.isElem('aapt:attr'));

  const attributeMap = new Map<string, JsApi[]>();
  const indexMap = new Map<string, number>();

  const output: [string, JsApi][] = [];

  for (const node of attrs) {
    const xmlString = toXmlString(node);
    if (attributeMap.has(xmlString)) {
      attributeMap.get(xmlString).push(node);
    } else {
      attributeMap.set(xmlString, [node]);
    }
  }

  for (const nodes of Array.from(attributeMap.values())) {
    if (nodes.length > 1 && nodes[0].content) {
      const childNode = nodes[0].content[0];
      const attributeName = nodes[0].attr('name').value;
      const attributePrefix = attributeName.split(':')[0];
      const attributeSuffix = attributeName.split(':')[1];
      const filePrefix = getFileNameFromAttribute(attributeName);
      const fileNumber = indexMap.has(filePrefix)
        ? indexMap.get(filePrefix)
        : indexMap.set(filePrefix, 1).get(filePrefix);
      indexMap.set(filePrefix, indexMap.get(filePrefix) + 1);

      const resourceType = getResourceNameFromAttribute(attributeName);
      const resourcePath = `${resourceType}/${avdName}_${filePrefix}_${fileNumber}`;
      const fileName = resourcePath + '.xml';
      const resourceReference = '@' + resourcePath;

      addStandalone(childNode);
      output.push([fileName, childNode]);

      nodes.filter(node => node.parentNode).forEach(node => {
        node.parentNode.content.splice(
          node.parentNode.content.indexOf(node),
          1,
        );
        const ref = {
          name: attributeSuffix,
          prefix: attributePrefix,
          value: resourceReference,
          local: attributeName,
        } as Attr;
        node.addAttr(ref);
      });
    }
  }

  return output;
}

function toXmlString(item: JsApi) {
  return js2xml(item, { pretty: true });
}

function addStandalone(item: JsApi) {
  const androidNs = {
    name: 'android',
    prefix: 'xmlns',
    value: 'http://schemas.android.com/apk/res/android',
    local: 'xmlns:android',
  } as Attr;
  const aaptNs = {
    name: 'aapt',
    prefix: 'xmlns',
    value: 'http://schemas.android.com/aapt',
    local: 'xmlns:aapt',
  } as Attr;

  item.addAttr(androidNs);
  item.addAttr(aaptNs);
  item.parentNode = undefined;
}
