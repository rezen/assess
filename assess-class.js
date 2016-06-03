'use strict';

const acorn             = require('acorn');
const type              = require('./type');
const AssessParams      = require('./fn/params');
const AssessFunction    = require('./assess-function');

const Unsure = Symbol.for('Unsure');

class AssessClass extends AssessFunction {

  /**
   * @param  {Function} object
   * @param  {String}   label
   * @param  {Mixed}    parent
   * @return {AssessClass}
   */
  parse(object, label, parent, node) {
    if (!type.isClass(object)) {
      let context = this.constructor.name;
      throw new Error('{object} ' + context + ' can only be applied to a class');
    }

    this.assess      = object;
    this.label       = label;
    this.parent      = parent;
    this.node        = node;
    this.typeof      = 'class';
    this.isNative    = type.isNative(object);
    this.isClass     = Unsure;
    this.params      = Unsure;
    this.construct   = Unsure;
    this.stringValue = Unsure;

    this.AssessParams = this.AssessParams || AssessParams;

    this.parseClass(object);
    return this;
  }

  /**
   * Parse out attributes of class
   */
  parseClass() {
    const data = {};

    data.label       = this.getName();
    data.stringValue = this.getString();
    
    const ast = acorn.parse(data.stringValue);

    this.node = ast.body[0];

    const construct = this.node.body.body.filter(node => {
      return (node.kind === 'constructor');
    }).pop();

    if (construct) {
      data.construct = data.stringValue.slice(construct.start, construct.end);
      data.params = (new this.AssessParams()).parse(data.construct);
    }

    for (const prop in data) {
      this[prop] = data[prop];
    }

    return this;
  }
}

module.exports = AssessClass;
