'use strict';

const type = require('./type');

/**
 * Names of native attributes
 * @type {Array}
 */
const native = [
  'bind', 'apply', 'caller',
  'arguments', 'call', 
  'constructor', 'prototype',
  'toString'
 ];

/**
 * To get around circular dependancy issues we created
 * as map of the assessor type to the assessor module
 *
 * You can also add custom assessors be by adding your
 * custom assessors here
 * @type {Object}
 */
module.exports.assessors = {
  AssessFunction: './assess-function',
  AssessClass:    './assess-class', 
  AssessObject:   './assess-object',
  AssessNumber:   './assess-number'
};

/**
 * Take an object and inspect the properties and prototype
 * @param  {Object} object
 * @param  {String} name
 * @return {Object}
 */
function resolve(object, name, parent, node) {
  const assessors = module.exports.assessors;
  const parentIs = type.instanceOf(parent);

  if (parentIs === 'Node') {
    node = parent;
    parent = null;
  }

  const instanceOf = type.instanceOf(object);
  const typef      = type.isClass(object) ? 'Class' : instanceOf;
  const assessType = ''.concat('Assess', typef);
  const id         = assessors[assessType] ? assessType  : 'AssessObject';

  // Don't re-evaluate an assessor
  if (instanceOf.indexOf('Assess') === 0) {
    return object;
  }

  if (typeof assessors[id] === 'string') {
    assessors[id] = require(assessors[id]);
  }

  const assessor = new assessors[id]();

  assessor.parse(object, name, parent, node);
  return assessor;
};

/**
 * Designed to be used by other assessors that already have
 * properties determined
 * 
 * @param {Mixed}  object
 * @param {String} label
 * @yield {Assess*|Object}
 */

function *enumerate(object, properties, assessor) {
  properties = properties || Object.getOwnPropertyNames(object);

  for (const name of properties) {
    let value;

    try {
      value = object[name];
    } catch(e) {}

    // Let's not even bother moving on ...
    if (native.indexOf(name) !== -1) {
      yield {
        label: name, 
        isNative: true, 
        value: value, 
        typeof: type.instanceOf(value)
      };
      continue;
    }

    // No need to process null/empty values
    // @todo may up the prototype chain
    if (value === null || value === undefined) {
      yield {
        label: name, 
        value: value,
        type: value
      };
      continue;
    }

    if (!type.isSymbol(name)) {
      // We wont bother iterating array indices
      if (/^[0-9]$/.test(name)) {continue;}
    }

    const node = assessor ? assessor.getNodeByName(name) : null;
    yield resolve(value, name, object, node);
  }
}

module.exports.resolve = resolve;
module.exports.enumerate = enumerate;
