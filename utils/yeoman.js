'use strict';

const path = require('path');
const configUtils = require('./config');
const C = require('./constants');

const _ = require('lodash');

// Needed directory paths
const baseName = path.basename(process.cwd());

/**
 * Get the base directory
 * @return {String}
 */
let getBaseDir = () => {
  return baseName;
};

/**
 * Get all settings (paths and the like) from components name
 * @param {String} componentName The components name
 * @param {String} style Style language to use [optional]
 * @param {Boolean} isPure Use a pure component? [optional]
 * @param {String|Number} generatorVersion The version of the generator [optional]
 * @return {Object} Component settings
 */
let getAllSettingsFromComponentName = (componentName, style, isPure, generatorVersion) => {

  // Use css per default
  if(!style) {
    style = 'css';
  }

  // Use version 3 fallback as default for projects
  if(!generatorVersion) {
    generatorVersion = 4;
  }

  if (componentName.indexOf('/') !== -1) {
    throw new Error('Please specify component name correctly! For example, `peer-groups` or `PeerGroups`.');
  }

  let camelizedComponentName;
  let kebabedComponentName;

  if (_.includes(componentName, '-')) {
    kebabedComponentName = componentName;
    componentName = camelizedComponentName = _.camelCase(componentName);
  } else {
    kebabedComponentName = _.kebabCase(componentName);
    componentName = camelizedComponentName = componentName;
  }

  componentName = `${componentName[0].toUpperCase()}${componentName.substr(1)}`;

  // Configure Styles
  let stylePaths = configUtils.getChoiceByKey('path', 'style');
  let styleSettings = configUtils.getChoiceByKey('style', style);

  // Configure components
  let componentPath = configUtils.getChoiceByKey('path', 'component');

  // Configure tests
  let testPath = configUtils.getChoiceByKey('path', 'test');

  const pathToComponent = path.normalize(`${componentPath.path}/${kebabedComponentName}/`);
  const styleFileName = `${kebabedComponentName}${styleSettings.suffix}`;

  let settings;

  switch(generatorVersion) {

    case 4:
      settings = {
        style: {
          path: pathToComponent,
          fileName: styleFileName,
          className: camelizedComponentName,
          suffix: styleSettings.suffix
        },
        component: {
          path: pathToComponent,
          styleFileName: styleFileName,
          fileName: `${kebabedComponentName}.tsx`,
          className: camelizedComponentName,
          classBase: isPure ? 'React.PureComponent' : 'React.Component',
          displayName: camelizedComponentName,
          componentName,
          suffix: '.tsx'
        },
        test: {
          path: pathToComponent,
          styleFileName: styleFileName,
          className: camelizedComponentName,
          fileName: `${kebabedComponentName}.spec.ts`
        }
      };
      break;
  }

  return settings;
};

/**
 * Get a cleaned path name for a given path
 * @param {String} path
 * @param {String} suffix [optional]
 * @return {String}
 */
let getCleanedPathName = (path, suffix) => {

  if(!suffix) {
    suffix = '';
  }

  // If we have filesystem separators, use them to build the full path
  let pathArray = path.split('/');

  // Build the full components name
  return pathArray.map((path) => {
    return _.camelize(_.slugify(_.humanize(path)));
  }).join('/') + _.capitalize(suffix);
};

/**
 * Get the css/less/whatever style name to use
 * @param  {String} path
 * @return {String}
 */
let getComponentStyleName = (path) => {
  let fileName = path.split('/').pop().toLowerCase();
  return _.slugify(_.humanize(fileName)) + '-component';
};

/**
 * Get a js friendly application name
 * @param  {String} appName The input application name [optional]
 * @return {String}
 */
let getAppName = (appName) => {

  // If appName is not given, use the current directory
  if(appName === undefined) {
    appName = getBaseDir();
  }

  return _.slugify(_.humanize(appName));
};

/**
 * Get the wanted destination path
 * @param  {String} name Name of the file
 * @param  {String} type The type to use (e.g. action, store, ...)
 * @param  {Suffix} suffix The suffix to use for the file (e.g. Store, Actions, ...)
 * @return {String} Final path
 */
let getDestinationPath = (name, type, suffix) => {

  let cleanedPaths = getCleanedPathName(name, suffix);
  let fsParts = cleanedPaths.split('/');
  let actionBaseName = _.capitalize(fsParts.pop());
  let partPath = fsParts.join('/');

  let fsPath = configUtils.getChoiceByKey('path', type).path;

  let parts = [ fsPath ];
  if(partPath.length > 0) {
    parts.push(partPath);
  }
  parts.push(actionBaseName);
  let fullPath = parts.join('/');

  return `${fullPath}.js`;
};

/**
 * Get the destinations class name
 * @param  {String} name Name of the file
 * @param  {String} type The type to use (e.g. action, store, ...)
 * @param  {Suffix} suffix The suffix to use for the file (e.g. Store, Actions, ...)
 * @return {String} The javascript class name to use
 */
let getDestinationClassName = (name, type, suffix) => {

  let fixedName = getDestinationPath(name, type, suffix);
  return _.capitalize(fixedName.split('/').pop().split('.js')[0]);
};

/**
 * Get the filename of the component template to copy.
 * @param {boolean} isStateless
 * @param {boolean} useStyles
 * @return {string} The template filename including the .js suffix
 */
let getComponentTemplateName = (isStateless, useStyles) => {
  const componentTypeFrag = isStateless ? C.COMP_TYPES.STATELESS : C.COMP_TYPES.STATEFUL;
  const styleTypeFrag = !useStyles
    ? C.STYLE_TYPES.NO_STYLES
    : C.STYLE_TYPES.WITH_STYLES
    ;

  return `${componentTypeFrag}${styleTypeFrag}.js`;
};

module.exports = {
  getBaseDir,
  getAllSettingsFromComponentName,
  getAppName,
  getCleanedPathName,
  getComponentStyleName,
  getComponentTemplateName,
  getDestinationPath,
  getDestinationClassName
};
