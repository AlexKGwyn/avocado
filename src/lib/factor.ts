import { js2xml } from './js2xml';
import { Attr, JsApi } from './jsapi';
import { findRecursive } from './util';
import { xml2js } from './xml2js';

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

export function processFactor(avdName: string, xml: string): Promise<Results> {
  return new Promise((resolve, reject) => {
    xml2js(
      xml,
      jsApi => {
        const ret = factor(jsApi, avdName);
        const results = new Results(toXmlString(jsApi));
        for (const [file, jsxml] of ret) {
          const xmlString = toXmlString(jsxml);
          results.splits.push([file, xmlString]);
        }
        resolve(results);
      },
      _ => resolve(new Results(xml)),
    );
  });
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
    if (nodes.length > 1) {
      const childNode = nodes[0];
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

      const androidNs = {
        name: 'xmlns:android',
        prefix: 'xmlns',
        value: 'http://schemas.android.com/apk/res/android',
        local: 'android',
      } as Attr;
      const aaptNs = {
        name: 'xmlns:aapt',
        prefix: 'xmlns',
        value: 'http://schemas.android.com/aapt',
        local: 'aapt',
      } as Attr;
      childNode.content[0].addAttr(androidNs);
      childNode.content[0].addAttr(aaptNs);

      output.push([fileName, childNode]);

      nodes.filter(node => node.parentNode).forEach(node => {
        node.parentNode.content.splice(
          node.parentNode.content.indexOf(node),
          1,
        );
        const ref = {
          name: attributeName,
          prefix: attributePrefix,
          value: resourceReference,
          local: attributeSuffix,
        } as Attr;
        node.parentNode.addAttr(ref);
      });
    }
  }

  return output;
}

function toXmlString(item: JsApi) {
  return js2xml(item, { pretty: true });
}
