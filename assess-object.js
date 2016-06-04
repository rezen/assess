'use strict';

const type     = require('./type');
const resolver = require('./resolver');

const Unsure = Symbol.for('Unsure');

/**
 * Assessor that is used by default ... after all
 * everything in js is an object
 */
class AssessObject {

  constructor(object) {
    this.meta = {};
    if (!object) {return this;}
    this.parse(...arguments);
  }


  /**
   * @param  {Object}  object
   * @return {Boolean}
   */
  has(attr) {
    return !!this.assess[attr];
  }
  
  /**
   * @param  {Object}  object
   * @return {Boolean}
   */
  isExtensible() {
    return Object.isExtensible(this.assess);
  }

  /**
   * @param  {Object}  object
   * @return {Boolean}
   */
  isFrozen() {
    return Object.isFrozen(this.assess);
  } 

  /**
   * @param  {Object}  object
   * @return {Boolean}
   */
  isSealed() {
    return Object.isSealed(this.assess);
  }


  isWritable() {
    if (!this.context) {return Unsure;}
    const descriptor = Object.getOwnPropertyDescriptor(this.context, this.label);
    return descriptor ? descriptor.writable : Unsure;
  }

  /**
   * @param  {Object} object
   * @param  {String} label
   * @param  {Mixed}  context
   * @return {AssessObject}
   */
  parse(object, label, context, node) {

    this.label      = (label || object.name) || '';
    this.assess     = object;
    this.context     = context;
    this.node       = node;
    this.typeof     = typeof object;
    this.instanceOf = type.instanceOf(object);
    this.isNative   = type.isNative(object);
 
    return this;
  }

  source() {
    return this.assess;
  }

  /**
   * @param  {Object} object
   * @return {String}
   */
  getName() {
    return this.label || this.assess.name;
  }

  /**
   * @todo decide if it returns only direct prototype
   * properties or inherited as well
   * 
   * @param  {Object} object
   * @return {Array}
   */
  getPrototypeProperties() {
    const prototype = Object.getPrototypeOf(this.assess);
    return [].concat(
      AssessObject.getProperties(this.assess.prototype),
      AssessObject.getProperties(prototype)
    )
  }

  /**
   * @param  {Object} object
   * @return {Array}
   */
  getPropertyNames() {
    return Array.from(
      new Set([].concat(
        this.getPrototypeProperties(this.assess),
        AssessObject.getProperties(this.assess)
      ).filter(p => {
        if (typeof p !== 'string') {return true;}
        return /^[^0-9]/.test(p);
      }))
    );
  }

  getProperties() {
    const self = this;
    return this.getPropertyNames(self.assess).reduce((acc, prop) => {
      try {
        acc[prop] = self.assess[prop];
      } catch (e) {}
      return acc;
    }, {});
  }

  get methods() {
    return {
      all: this.getMethods(), 
      names: this.getMethodNames()
    };
  }

  /**
   * @param  {Object} object
   * @return {Array}
   */
  getMethodNames() {
    const self = this;
    const props = this.getPropertyNames(self.assess);
    return props.filter(p => typeof self.assess[p] === 'function');
  }

  getMethods() {
    const object = this.assess;
    return this.getMethodNames(object).reduce((acc, prop) => {
      acc[prop] = object[prop];
      return acc;
    }, {});
  }

  /**
   * @todo rename chain to inheritance?
   * 
   * @param  {Object} Class
   * @param  {Number} depth
   * @return {Object}
   */
  getPrototypeChain(depth) {
    const Class = this.assess;
    depth = depth || 11;

    if (typeof Class === 'object') {
      Class = Class.constructor;
    }

    const heirarchy = [];
    const MAX       = 10;
    var count       = 0;
    var check       = Class;

    while (true) {
      let proto = Object.getPrototypeOf(check);

      if (!proto.name) {break;}

      heirarchy.push(proto);
      check = proto;

      count++;

      if (count >= depth) {break;}

      if (count >= MAX) {
        throw new Error('You should never extend an object 10x ....');
      }
    }

    return {
      class: Class.name, 
      extends: heirarchy[0] || null, 
      heirarchy
    };
  }

  get chain() {
    if (!this.meta.chain) {
      this.meta.chain = this.getPrototypeChain();
    }
    return this.meta.chain;
  }

  getNodeByName(name) {
    if (!this.node) {return null;}
    if (!this.node.body.body) {return null;}
    return this.node.body.body.filter(n => n.key.name === name).pop();
  }

  assessProperties() {
    const properties = this.getPropertyNames(this.assess);
    return resolver.enumerate(this.assess, properties, this);
  }

  assessPrototype() {
    const properties = this.getPrototypeProperties(this.assess);
    return resolver.enumerate(this.assess.prototype, properties, this);
  }
}


AssessObject.getProperties = function(object) {
  if (!object) {return [];}
  return Object.getOwnPropertyNames(object)
    .concat(Object.getOwnPropertySymbols(object));
};

module.exports = AssessObject;
