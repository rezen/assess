'use strict';

const type = require('../type');

const Unsure = Symbol.for('Unsure');

class Param {

  /**
   * @param  {String} raw
   * @param  {Number} index
   */
  constructor(node, index, fnString) {
    this.label          = '';
    this.node           = node;
    this.index          = index;
    this.isCallback     = Unsure;
    this.isRest         = Unsure;
    this.isDestructured = Unsure;
    this.typeof         = 'param';
    this.hasDefault     = false;
    this.defaultDetermined = false;
    this.defaultValue   = null;
    this.defaultType    = null;
    this.paramType        = null;
    this.raw = '';
    this.rawDefault = '';
    this.fn             = fnString

    this.parseParam(node);
    this.parseName(this.label);
    this.parseDefault(this.rawDefault);

    this.hasDefault = (this.defaultValue !== null);
   // delete this.node;
  }


  /**
   * @param  {String} raw
   */
  parseParam(node) {
    this.raw = this.fn.slice(node.start, node.end);

    if (node.type === 'Identifier') {
      this.label = node.name;
    } else if (node.type === 'AssignmentPattern') {
      const right = node.right;
      this.label = node.left.name;
      this.rawDefault = this.fn.slice(right.start, right.end);
    } else if (node.type === 'RestElement') {
      this.isRest = true;
      this.label = node.argument.name;
    } else if (node.type === 'ObjectPattern') {
      this.isDestructured = true;
    } else {
      throw new Error('Param@parseParam: What is ?' + node.type);
    }

    delete this.fn;
  }

  /**
   * @param  {String} name
   */
  parseName(name) {
    switch (name) {
      case 'callback':
        this.paramType    = 'Function';
        this.isCallback = true;
        return;
      case 'options':
        this.paramType  = 'Object';
        return;
    }
  }

  rawDefaultJson(defaultType, raw) {
    try {
      switch (defaultType) {
        case 'Object':
        case 'Array':
          return JSON.parse(raw);
      }
    } catch(e) {}

    return Unsure; // @todo new Undetermined
  }

  rawDefaultRisky(raw) {
    const risky = Function('return ' + raw +  ';');
    try {
      return risky();
    } catch (e) {
      // this._parseErr = e;
    }

    return Unsure; // @todo new Undetermined
  }

  parseDefault(raw) {
    if (raw.length === 0) {return}

    var value;
    this.defaultType  = type.fromString(raw);
    

    value = this.rawDefaultJson(this.defaultType, raw);

    if (value === undefined) {
      value = this.rawDefaultRisky(raw);
    }

    if (value === undefined) {return this;}

    this.defaultDetermined = true;
    this.defaultValue = value;
    this.defaultType = type.instanceOf(value);
  }

  getArgType() {
    return this.paramType || this.defaultType;
  }

  /**
   * @return {Mixed}
   */
  getDefaultValue() {
    return this.defaultValue;
  }

  /**
   * @return {String}
   */
  getName() {
    return this.label;
  }

  /**
   * @return {Number}
   */
  getPosition() {
    return this.index;
  }
}

module.exports = Param;
