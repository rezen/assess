'use strict';

const AssessObject = require('./assess-object');

class AssessNumber extends AssessObject {

  /**
   * @param  {Number} object
   * @param  {String} label
   * @param  {Mixed}  context
   * @return {AssessNumber}
   */
  parse(object, label, context, node) {
    this.meta = {};
    this.assess     = object;
    this.label      = label;
    this.context     = context;
    this.typeof     = 'number';
    this.instanceOf = 'Number';
    return this;
  }

  /**
   * @return {Boolean}
   */
  hasDecimals() {
    return (this.assess.toString().indexOf('.') !== -1);
  }

  /**
   * @return {Boolean}
   */
  isFloat() {
    return type.isFloat(this.assess);
  }

  /**
   * @return {Boolean}
   */
  isInteger() {
    return type.isInteger(this.assess);
  }

  isEven() {
    return (this.assess % 2) === 0;
  }

  isOdd() {
    return !this.isEven();
  }

  isBetween(lower, higher) {
    return (this.assess > lower && this.assess < higher);
  }
}

module.exports = AssessNumber;
