'use strict';

const util  = require('util');
const acorn = require('acorn');
const Param = require('./param');

const Unsure = Symbol.for('Unsure');


class Params {

  constructor() {
    this.checkCount = null;
    this.params = [];
    this.isNative = false;
    this.isHacked = false;
    this.stringValue = '';
    this.length = 0;
  }

  get(index) {
    return this.params[index];
  }

  hasCallback() {
    
  }

  parse(text, fn) {
    var node;
    this.params = [];
    this.isNative = false;

    if (typeof fn === 'function') {
      this.checkCount = this.checkParamCount(fn);
    }
    if (typeof text === 'string') {
      [node, text] = this.paramsStringNode(text);
    }

    this.parseParams(node, text);
    return this;
  }
  
  paramsStringNode(argString) {
    var node;
    var text = '' + argString;

    if (text.indexOf('[native code]') !== -1) {
      this.isNative = true;
      text = text.replace('[native code]', '');
    }

    try {
      try {
        node = acorn.parse(text);
      } catch (e) {
        // @hack
        this.isHacked = true;
        text = 'function ' + text;
        node = acorn.parse(text);
        //console.log(e);
      }
    } catch (e) {
      console.log('parse-err', text);
      throw e;
    }

    return [node, text];
  }

  parseParams(node, text) {
    const id = node.id || node.body[0].id;
    const params = node.params || node.body[0].params;

    if (!params) {
      console.log('P', node.body[1], text);
      process.exit();
    }

    if (params.length === 0) {return this;}

    const range = [params[0].start, params[params.length - 1].end];
    this.stringValue = text.slice(...range);
    this.params = params.map((node, idx) => new Param(node, idx, text));
    this.length = params.length;
    return this;
  }

  checkParamCount(fn) {
    // @todo is broken with es6 params?
    const info = util.inspect(fn, {
      showHidden: true, 
      depth: null, 
      showProxy: true
    });

    const [__, count] =  /\[\length\]\: ([0-9])+/.exec(info);
    return parseInt(count);
  }

  [Symbol.iterator]() {
    return this.params[Symbol.iterator]();
  }
}

module.exports = Params;
