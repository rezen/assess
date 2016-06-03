'use strict';

const sinon   = require('sinon');
const assert  = require('assert');
const Hey     = require('./hey');

describe('AssessObject', () => {
  var AssessObject;
  var assessor;

  beforeEach(() => {
    delete require.cache[require.resolve('../assess-object')]
    AssessObject = require('../assess-object');
    assessor = new AssessObject(Hey);
  });

  describe('#parse', () => {
    it('Should map objects to the appropriate assessor', () => {
      assert.equal(assessor.label, 'Hey');
      assert.equal(assessor.assess, Hey);
      assert.equal(assessor.instanceOf, 'Function');
    });

  });
  
  describe('#getName', () => {
    it('Gets the label/name of object', () => {
      const name = assessor.getName();
      console.log(name);
      assert.equal(typeof name, 'string');
      assert.equal(name, 'Hey');
    });
   
  });

  describe('#getPrototypeProperties', () => {
    it('?', () => {
      const oprops = Object.getOwnPropertyNames(Object);
      const props = assessor.getPrototypeProperties();
      const overlaps = !oprops.some(p => props.indexOf(p) === -1);

      assert(overlaps)
      assert.equal(props.length, 27);

    });
  });

  describe('#getPropertyNames', () => {
    it('Get properties that are both defined and in protype chain', () => {
      const props = assessor.getPropertyNames();
      assert(Array.isArray(props));
      assert.equal(props.length, 30);
      assert.equal(typeof props[0], 'string');
      assert(props.indexOf('meow') !== -1);
      assert(props.indexOf('create') !== -1);
      assert(props.indexOf('laha') !== -1);
    });
  });

  describe('#getProperties', () => {
    it('?', () => {
      const props = assessor.getProperties();

      assert(typeof props === 'object');
      assert.equal(props.laha, 777);
      assert.equal(typeof props.meow, 'function');
    });
  });

  describe('#getMethodNames', () => {
    it('Should map objects to the appropriate assessor', () => {
      const methods = assessor.getMethodNames();

      assert(Array.isArray(methods));
      assert.equal(methods.length, 20);
      assert.equal(typeof methods[0], 'string');
      assert(methods.indexOf('meow') !== -1);
      assert(methods.indexOf('create') !== -1);
      assert(methods.indexOf('hey') !== -1);
    });
  });

  describe('#getPrototypeChain', () => {
    it('?', () => {
      const chain = assessor.getPrototypeChain();

      assert.equal(chain.class, 'Hey');
      assert.equal(chain.extends, Object);
      assert.equal(chain.heirarchy.length, 1);
      assert.equal(chain.heirarchy[0], Object);
    });
  });

  describe('.chain', () => {
    it('?', () => {
      assert.equal(assessor.chain.class, 'Hey');
      assert.equal(assessor.chain.extends, Object);
      assert.equal(assessor.chain.heirarchy.length, 1);
      assert.equal(assessor.chain.heirarchy[0], Object);
    });
  });

  describe('.methods', () => {
    it('?', () => {
      console.log(assessor.methods.names);
    });
  });
});