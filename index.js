'use strict';

const type     = require('./type');
const resolver = require('./resolver');
const pkg      = require('./package.json');

/**
 * Public api we export for use
 * @type {Object}
 */
 const assessor = {
  /**
   * Version yo
   * @type {String}
   */
   v: pkg.version,

  /**
   * The resolver maps the object to a reflector
   * @type {Object}
   */
  resolver,

  /**
   * Determine the type of object
   * @type {Object}
   */
  type,

  /**
   * The library was designed for node.js
   * @type {Boolean}
   */
  isNode: (typeof module !== 'undefined' && !!module.exports),

  /**
   * Returns a reflection on the passed object
   * @param  {Object} object
   * @return {Object}
   */
  resolve(object, label, context, node) {
    return resolver.resolve(object, label, context, node);
  }
};

module.exports = assessor;
