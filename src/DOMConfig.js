export const isEventRegex = /^on([A-Z][a-zA-Z]+)$/;

export const ReservedPropNames = new Set([
  'children',
  'dangerouslySetInnerHTML',
  'innerHTML',
]);

export const MapPropertyToAttribute = Object.create(null);
['rowSpan', 'colSpan', 'contentEditable', 'spellCheck'].forEach(name => {
  MapPropertyToAttribute[name] = name.toLowerCase();
});

export const isNamespaced = /^(xml|xlink|xmlns):?/i;

export const MapNamespaceToUri = Object.create(null);

// All SVG attributes without dash-casing
if (__SVG__) {
  MapNamespaceToUri.xlink = 'http://www.w3.org/1999/xlink';
  MapNamespaceToUri.xml = 'http://www.w3.org/XML/1998/namespace';

  [
    'allowReorder',
    'attributeName',
    'attributeType',
    'autoReverse',
    'baseFrequency',
    'baseProfile',
    'calcMode',
    'contentScriptType',
    'contentStyleType',
    'diffuseConstant',
    'edgeMode',
    'externalResourcesRequired',
    'glyphRef',
    'gradientTransform',
    'gradientUnits',
    'kernelMatrix',
    'kernelUnitLength',
    'keyPoints',
    'keySplines',
    'keyTimes',
    'lengthAdjust',
    'limitingConeAngle',
    'markerHeight',
    'markerUnits',
    'markerWidth',
    'maskContentUnits',
    'maskUnits',
    'numOctaves',
    'paintOrder',
    'pathLength',
    'patternContentUnits',
    'patternTransform',
    'patternUnits',
    'pointsAtX',
    'pointsAtY',
    'pointsAtZ',
    'preserveAlpha',
    'preserveAspectRatio',
    'primitiveUnits',
    'refX',
    'refY',
    'renderingIntent',
    'repeatCount',
    'repeatDur',
    'requiredExtensions',
    'requiredFeatures',
    'shapeRendering',
    'specularConstant',
    'specularExponent',
    'spreadMethod',
    'startOffset',
    'stdDeviation',
    'stitchTiles',
    'surfaceScale',
    'systemLanguage',
    'tableValues',
    'targetX',
    'targetY',
    'textLength',
    'viewBox',
    'viewTarget',
    'yChannelSelector',
    'zoomAndPan',
  ].forEach(name => (MapPropertyToAttribute[name] = name));
}
