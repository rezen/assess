'use strict';

const sinon   = require('sinon');
const assert  = require('assert');
const type = require('../type');

/*
const types = {
  Integer: 12,
  Float: 12.12,
  Stream: 
  Array: [1, 2, 3]
  Generator:
  Bound:
  Iterable: 
  Emitter:
  Promise:
};
*/

describe('type', () => {

  describe('#instanceof', () => {
    it('Should correctly determine instance type', () => {
      class Dog {}
      function *cats() {}

      assert.equal(type.instanceOf(7), 'Number');
      assert.equal(type.instanceOf({}), 'Object');
      assert.equal(type.instanceOf(''), 'String');
      assert.equal(type.instanceOf(null), 'Null');
      assert.equal(type.instanceOf(false), 'Boolean');
      assert.equal(type.instanceOf(new Dog), 'Dog');
      assert.equal(type.instanceOf(/[0-9]/g), 'RegExp');
      assert.equal(type.instanceOf(cats), 'Function');
      assert.equal(type.instanceOf(new Set()), 'Set');
      assert.equal(type.instanceOf([]), 'Array');
      assert.equal(type.instanceOf(Array), 'Function');
    });
  });

  describe('#isArray', () => {
    it('', () => {
      assert(type.isArray([]));
      assert(!type.isArray({}));
    });
  });

  describe('#isClass', () => {
    it('Checks if is function and is defined as a class', () => {
      class Cats{}
      function Dogs() {}
      assert(type.isClass(Cats));
      assert(!type.isClass(new Cats));
      assert(!type.isClass(new Dogs));
      assert(!type.isClass(function moveit() {}));
    });
  });

  describe('#isClassFunction', () => {
    it('Won\'t pass functions that don\'t have prototype additions', () => {
      class Cats{}
      function Dogs() {}
      assert(!type.isClassFunction(Cats));
      assert(!type.isClassFunction(new Cats));
      assert(!type.isClassFunction(Dogs));
      assert(!type.isClassFunction(function moveit() {}));
    });

    it('Will pass functions that have a prototype', () => {
      function Dogs() {}
      Dogs.prototype.bark = true;

      assert(type.isClassFunction(Dogs));
    });
  });

  describe('#isEmpty', () => {
    it(' emptyish', () => {
      assert(type.isEmpty({}));
      assert(type.isEmpty(0));
      assert(type.isEmpty([]));
      assert(type.isEmpty(function ( ) {  }));
      assert(type.isEmpty(function (a) {  }));
      assert(!type.isEmpty(function () {var z = 1;}));
      assert(type.isEmpty(() => { }));
      assert(type.isEmpty(new Buffer('')));
    });
  });

  describe('#isFalsy', () => {
    it('Should check if the arg is false', () => {
      assert(type.isFalsy(null));
      assert(type.isFalsy(undefined));
      assert(type.isFalsy(0));
      assert(type.isFalsy(false));
      assert(!type.isFalsy([]));
    });
  });

  describe('#isFloat', () => {
    it('', () => {
      assert(!type.isFloat(12));
      assert(type.isFloat(12.01)); 
      assert(!type.isFloat(NaN));
      assert(!type.isFloat('99.34'));
    });
  });

  describe('#isStream', () => {
    it('', () => {
      const stream = require('stream');
      const rstream = new stream.Readable;
      const wstream = new stream.Writable;

      assert(type.isStream(rstream));
      assert(type.isStream(wstream));
      assert(!type.isStream(new Buffer('')));
      assert(!type.isStream([]));
    });
  });

  describe('#isGenerator', () => {
    it('', () => {
      assert(type.isGenerator(function *cats() {}));
      assert(!type.isGenerator([]));
      assert(!type.isGenerator(function() {}));
    });
  });

  describe('#isBound', () => {
    it('', () => {
      assert(type.isBound(function cats() {}.bind({})));
      assert(!type.isBound(function cats() {}));
    });
  });

  describe('#isIterable', () => {
    it('', () => {
      assert(type.isIterable([]));
      assert(type.isIterable(new Set));
      assert(type.isIterable('Meow'));
      assert(type.isIterable(new Map));
      assert(!type.isIterable({}));
      assert(!type.isIterable(() => {}));
    });
  });

  describe('#isEmitter', () => {
    it('Checks if have emitter functions', () => {
      const E1 = require('events');
      const E2 = require('eventemitter2').EventEmitter2;
      assert(type.isEmitter(new E1));
      assert(type.isEmitter(new E2));
      assert(!type.isEmitter([]));
    });
  });

  describe('#isPromise', () => {
    it('', () => {
      const Prom = require('bluebird');
      assert(type.isPromise(new Promise((resolve, reject) => {})));
      assert(type.isPromise(new Prom((resolve, reject) => {})));
      assert(!type.isPromise(() => {}));
    });
  });

  describe('#isNative', () => {
    it('Check if the variable is a native data type', () => {
      assert(type.isNative([]));
      assert(type.isNative(Array));
      assert(type.isNative(new Set));
      assert(type.isNative(Function));
      assert(type.isNative(/[a-z]/));
      assert(!type.isNative(function cats() {}));
    });
  });

  describe('#fromString', () => {
    it('Determine the type of data from the string', () => {
      assert.equal(type.fromString(' 9'), 'Number');
      assert.equal(type.fromString(' "cats"'), 'String');
      assert.equal(type.fromString('/[0-9]/'), 'RegExp');
      assert.equal(type.fromString('[1, 2, 4]'), 'Array');
      assert.equal(type.fromString('{a: 1, b:2}'), 'Object');
      assert.equal(type.fromString('`Hello ${name}`'), 'literal');
      assert.equal(type.fromString('cats '), 'variable');
      assert.equal(type.fromString('cats () {}'), 'Function');
      assert.equal(type.fromString('move()'), 'functionValue');
      assert.equal(type.fromString('new   Cats'), 'Cats');
      assert.equal(type.fromString(' new   Cats("fluffy");'), 'Cats');
    });
  });
});