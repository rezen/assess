## assess
[![NPM Version][npm-image]][npm-url] <br />

## About
A handy dandy tool to inspsect your objects!

## Install
`npm install assess`


## Example

```js
'use strict';

const assess = require('assess');

const data = {
  a: 'b', c: {}, d: [1, 2, 3]
};

const assessor = assess.resolve(data);

console.log(assessor.methods.names);

```

[npm-image]: https://img.shields.io/npm/v/assess.svg
[npm-url]: https://npmjs.org/package/assess