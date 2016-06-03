'use strict';

const acorn        = require('acorn');
const util         = require('util');
const tools        = require('./tools');
const type         = require('./type');
const rexp         = require('./rexp');
const AssessObject = require('./assess-object');
const AssessParams = require('./fn/params');

const Unsure = Symbol.for('Unsure');

class AssessFunction extends AssessObject {

  constructor(object) {
    super()
    if (!object) {return this;}
    this.parse(object);
  }
  /**
   * @param  {Function} object
   * @param  {String}   label
   * @param  {Mixed}    parent
   * @return {AssessFunction}
   */
  parse(object, label, parent, node) {
    if (typeof object !== 'function') {
      let context = this.constructor.name;
      throw new Error('{object} ' + context + ' can only be applied to a function');
    }
    this.meta = {};
    this.label       = label;
    this.assess      = object;
    this.parent      = parent;
    this.node        = node;
    this.typeof      = 'function';
    this.instanceOf  = type.instanceOf(object);
    this.hasReturn   = Unsure;
    this.hasPromise  = Unsure;
    this.returnType  = Unsure;
    this.isAnonymous = Unsure;
    this.isNative    = type.isNative(object);
    this.isClass     = type.isClass(object);
    this.isStatic    = Unsure;
    this.params      = null;
    this.stringValue = null;
    this.AssessParams = this.AssessParams || AssessParams;

    this.parseFunction();

    return this;
  }

  /**
   * Get the string of the function name
   *
   * @param  {Function} fn
   * @return {String}
   */
  getName() {
    if (typeof this.assess !== 'function') {return false;}
    if (this.assess.name) {return this.assess.name;}
    this.isAnonymous = true;
    return 'fn?';
    // @todo
    // const args = this.getParamsString(fn);
    // if (!args) {return 'fn';}
    // return 'function (' + (args || '').replace(/[\s\r\n]+/, ' ') + ')';
  }


  /**
   * @param  {Function} fn
   * @param  {Boolean}  strip
   * @return {String}
   */
  getString(strip) {
    const string = Function.prototype.toString.call(this.assess);
    if (!strip) {return string;}

    return string.replace(rexp.STRIP_COMMENTS, '');
  }

  /**
   * @param  {Function} fn
   * @return {Boolean}
   */
  isClass(fn) {
    return type.isClass(fn);
  }

  /**
   * Get a string representation of the method+params.
   * A use case is for checking implementions of methods
   * and if they match expectionats
   * 
   * @return {String}
   */
  signature() {
    const name = this.getName();
    return ''.concat(name, '(', this.params.stringValue, ')');
  }

  /**
   * Get a string quick identifier of the function body
   * @return {String}
   */
  id() {
    const stringValue = this.getString();
    const woSpaces = stringValue.replace(/[\n\r\s=]+/g, '');
    return ''.concat(
      this.getName(), 
      '_', stringValue.length, 
      '_', woSpaces.length,
      '_', tools.sampleText(woSpaces, 10).join('')
    );
  }

  /**
   * Take the string name and function and decipher
   * params, if there is a return, if it takes a callback etc.
   * @param  {Function} fn
   */
   parseFunction() {
    const fn = this.assess;
    const data = {};

    data.params = (new this.AssessParams()).parse(this.getString(), this.assess);
    data.label       = this.getName(fn);
    data.stringValue = this.getString(fn);
    data.isNative    = (data.stringValue.indexOf('[native code]') !== -1);
    
    for (const prop in data) {
      if (this[prop]) {continue;}
      this[prop] = data[prop];
    }

    this.parseNode();
  }

  parseNode() {
    if (this.isNative) {
      return;
    }

    if (!this.node) {
      const ast = acorn.parse(this.getString());
      this.node = ast.body[0];
    }

    var body;

    this.isStatic = this.node.static;

    if (this.node.value) {
      body = this.node.value.body.body;
    } else {
      body = this.node.body.body;
    }

    if (body.length === 0) {
      return;
    }

    const last = body[body.length - 1];

    if (last.type === 'ReturnStatement') {
      this.hasReturn = true;
    }
  }

  /**
   * @return {Number}
   */
  getParamsLength() {
    return this.getParams().length;
  }

  /**
   * @return {AssessArgs}
   */
  getParams() {
    return this.params;
  }

  /**
   * @param  {Number} index
   * @return {AssessArg}
   */
  getParam(index) {
    if (!this.params) {
      return Unsure;
    }

    return this.params.get(index);
  }
}

module.exports = AssessFunction;
