'use strict';

const assess = require('../index');
const Hey    = require('../test/hey');

 function catDog ({name: x}, callback, cats = [1, 3], dogs = {a: 'b', c: 'd'}, ...other) {
      if (cats.length) {
        return 'z';
      }

      return dogs.c;
    }

 function meow(...cats) {
  return cats.length;
}


meow(1, 2, 4);


// const ass = assess.resolve(catDog);
const ass = assess.resolve(catDog);


console.log(ass.getProperties())
console.log(ass.getPrototypeChain());
console.log(ass.params.length)
console.log(ass.params.get(0))
console.log();


for (let p of ass.assessPrototype()) {
 //console.log(p);
}

console.log(Hey.isFrozen())