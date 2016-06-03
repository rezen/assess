'use strict';

const sinon   = require('sinon');
const assert  = require('assert');


describe('resolver', () => {
  var resolver;

  beforeEach(() => {
    delete require.cache[require.resolve('../resolver')]
    resolver = require('../resolver');
  });

  describe('#resolve', () => {
    it('Should map objects to the appropriate assessor', () => {
      class Dog {}
      function *cats() {}

      assert.equal(resolver.resolve(7).constructor.name, 'AssessNumber');
      assert.equal(resolver.resolve({}).constructor.name, 'AssessObject');
      assert.equal(resolver.resolve('').constructor.name, 'AssessObject');
      assert.equal(resolver.resolve(false).constructor.name, 'AssessObject');;
      assert.equal(resolver.resolve(Dog).constructor.name, 'AssessClass');
      assert.equal(resolver.resolve(new Dog).constructor.name, 'AssessObject');
      assert.equal(resolver.resolve(/[0-9]/g).constructor.name, 'AssessObject');
      assert.equal(resolver.resolve(cats).constructor.name, 'AssessFunction');
      assert.equal(resolver.resolve(new Set()).constructor.name, 'AssessObject');
      assert.equal(resolver.resolve([]).constructor.name, 'AssessObject');
      assert.equal(resolver.resolve(Array).constructor.name, 'AssessFunction');
    });

    it('The object, label parent & node should be passed to the parser', () => {
      const data = {cats: 'Fluffy'};
      const params = ['Fluffy', 'cats', data, '&'];
      function AssessString() {}

      AssessString.prototype.parse = sinon.spy();

      resolver.assessors.AssessString = AssessString;
      const assessor = resolver.resolve(...params);

      assert(assessor.parse.calledOnce);
      assert.deepEqual(assessor.parse.args[0], params);
    });

    it('Can use custom or replace assessors', () => {
      class Meh {parse() {}}

      resolver.assessors.AssessNumber = Meh;
      const assessor = resolver.resolve(9);

      assert.equal(assessor.constructor.name, 'Meh');
    });
  });

  describe('#enumerate', () => {
    it('Can use custom or replace assessors', () => {
      const data = {a: 'b'};
      const assessment = resolver.enumerate(data);
      const assessor = assessment.next().value;

      assert.equal(assessor.constructor.name, 'AssessObject');
      assert.equal(assessor.typeof, 'string');
      assert.deepEqual(assessor.context, data);
      assert.deepEqual(assessor.label, 'a');
      assert(assessment.next().done)
    });

    it('Maps properties to right assessors', () => {
      const assessment = resolver.enumerate([1]);
      const assessor = assessment.next().value;

      assert.equal(assessor.constructor.name, 'AssessNumber');
      assert.equal(assessor.typeof, 'number');

      assert(Array.isArray(assessor.context));
      assert.equal(assessor.label, 'length');
      assert.equal(assessor.source(), 1);
      assert(assessment.next().done)
    });

     it('Finds the right number of properties', () => {
      class Cat {
        constructor(name) {
          this.name = name;
          this.age = 0;
        }
        meow(...meows) {}
      }

      const assessment = resolver.enumerate(new Cat('fluffin'));
      const assessor = assessment.next().value;
      assert.equal(assessor.constructor.name, 'AssessObject');
      assert.equal(assessor.typeof, 'string');
      assessment.next()
      assert(assessment.next().done)
    });
  });
});