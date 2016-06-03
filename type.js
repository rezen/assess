'use strict';

const rexp = require('./rexp');

const Unsure = Symbol.for('Unsure');


/**
 * @type {Array}
 */
const NativeObjects = [
  'Buffer',
  'Number',
  'Array', 
  'Object', 
  'Function', 
  'RegExp',
  'Date',  
  'Boolean', 
  'Symbol', 
  'String',
  'Set',  
  'Map', 
  'WeakMap', 
  'WeakSet', 
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'EvalError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'TypeError',
  'URIError',
  'Promise',
  'ArrayBuffer',
  'Generator',
  'GeneratorFunction',
  'Reflect',
  'Proxy'
]
.map(name => global[name])
.filter(o => !!o);

/**
 * Get the instanceof or instance of an object is
 *
 * @param  {Mixed} object
 * @return {String|Undefined}
 */
function kindOf(object) {
  const typed     = typeof object;
  var constructor = object;
  if (object === null) {return 'Null';}
  if (object === undefined) {return 'Null';}

  if (typed !== 'object') {
    return typed[0].toUpperCase() + typed.slice(1, typed.length);
  }

  if (typed === 'object') {
    constructor = object.constructor;
  }

  return constructor ? constructor.name : null;
}

/**
 * @param  {Mixed}  object
 * @return {Boolean}
 */
function isArray(object) {
  return (Array.isArray(object));
}

/**
 * Is the object a class or an instance of a class?
 *
 * @param  {Mixed}  Cls
 * @return {Boolean}
 */
function isClass(Cls) {
  if (typeof Cls !== 'function') {return false;}
  if (!Cls) {return false;}

  return (Cls.toString().slice(0, 5) === 'class');
}

/**
 * Makes assumption the function is custom and not
 * built in and checks if name starts with a capital
 * and the prototype has been modified
 *
 * @param  {Mixed}  Cls
 * @return {Boolean}
 */
function isClassFunction(Fn) {
  if (!Fn) {return false;}

  const kind = kindOf(Fn);
  const char = kind.charAt(0);


  const isClassCase = (char === char.toUpperCase());

  if (typeof Fn === 'object') {Fn = Fn.constructor;}

  if (!Fn.prototype) {
    return false;
  }

  const isCustomized = (Object.keys(Fn.prototype).length > 0);

  return (isClassCase && isCustomized);
}

/**
 * Is there anything in the object?
 *
 * @param  {Mixed}  object
 * @return {Boolean}
 */
function isEmpty(object) {
  if (!object) {return true};

  if (object === true) {
    return false;
  }

  // If is a falsy number
  if (typeof object === 'number') {
    return !object;
  }

  // Check if the function has any body
  if (typeof object === 'function') {
    const body = object.toString()
               .replace(object.name, '')
               .replace('function', '')
               .replace(/\s/g, '');

    return /\((.+)?\)(=>)?{}/.test(body);
  }

  // If string or array is empty
  if (object.length !== undefined) {
    return (object.length === 0);
  }

  // If map or set has no values
  if (object.size !== undefined) {
    return (object.size === 0);
  }

  // If object has no attributes
  return (Object.keys(object).length === 0);
}

/**
 * Is the value 0, 0.0, false, undefined, null
 *
 * @param  {Mixed}  object
 * @return {Boolean}
 */
function isFalsy(object) {
  return !object;
}

/**
 * Is the object a number and is it not an integer?
 *
 * @param  {Mixed}  number
 * @return {Boolean}
 */
function isFloat(number) {
  if (isNaN(number)) {return false;}
  if (kindOf(number) !== 'Number') {return false;}

  return !isInteger(number);
}

/**
 * Is the object a number and an integer?
 *
 * @param  {Mixed}  object
 * @return {Boolean}
 */
function isInteger(object) {
  if (isNaN(object)) {return false;}
  return (Number.isInteger(object));
}

/**
 * Is the object a stream?
 *
 * @param  {Mixed}  object
 * @return {Boolean}
 */
function isStream(object) {
  if (typeof object !== 'object') {return false};

  return (typeof object.pipe === 'function');
}

function isSymbol(object) {
  return (typeof object === 'symbol');
}

/**
 * @param  {Mixed}
 * @return {Boolean}
 */
function isGenerator(fn) {
  if (typeof fn !== 'function') {return false;}

  return fn.constructor.name === 'GeneratorFunction';
}

/**
 * @param  {Mixed}
 * @return {Boolean}
 */
function isBound(fn) {
  if (typeof fn !== 'function') {return false;}

  return (fn.name.indexOf('bound') === 0);
}

/**
 * @param  {Mixed}
 * @return {Boolean}
 */
function isIterable(object) {
  if (isFalsy(object)) {return false;}

  return typeof object[Symbol.iterator] === 'function';
}

/**
 * @param  {Mixed}
 * @return {Boolean}
 */
function isEmitter(object) {
  if (typeof object === 'function') {
    object = object.prototype;
  }

  if (isFalsy(object)) {return false;}

  const methods = ['on', 'once', 'emit', 'removeListener'];

  for (const method of methods) {
    if (!object[method]) {return false;}
  }

  // @todo ?maybe be more strict?
  // const name '' + object.constructor.name;
  // return (name.indexOf('EventEmitter') === 0);
  return true;
}

/**
 * @param  {Mixed}
 * @return {Boolean}
 */
function isPromise(object) {
  if (typeof object !== 'object') {return false;}

  if (typeof object.then !== 'function') {return false;}

  return (object.constructor.name.indexOf('Promise') !== -1);
}

/**
 * Identify if the object is native or not
 *
 * @param  {Mixed}  object
 * @return {Boolean}
 */
function isNative(object) {
  const construct = object.constructor;
  const proto = object.prototype;

  if (typeof object === 'function') {
    return (NativeObjects.indexOf(object) !== -1);
  }

  for (const t of NativeObjects) {
    try {
      if (object instanceof t) {
        return true;
      }
    } catch (e) {}
  }

  return false;
}

/**
 * Designed usage was for examining function
 * paramater declarations
 *
 * @param  {String} str
 * @return {String}
 */
function typeFromString(str) {
  str = str.trim();
  const start = str.charAt(0);
  const end = str.charAt(str.length - 1);

  switch (start) {
    case '"':
    case "'":
      return 'String';
    case '/':
      return 'RegExp';
    case '[':
      return 'Array';
    case '{':
      return 'Object';
    case '`':
      return 'literal';
  }

  if (/^[0-9]/.test(start)) {
    return 'Number';
  }

  if (str.indexOf('new ') === 0) {
    let tmp = str.replace(/new\s+/, '');
    let marker = tmp.indexOf('(');

    if (marker === -1) {
      return tmp;
    }

    return tmp.slice(0, marker);
  }

  if (/^[a-z\$\_]/i.test(start)) {
    if (rexp.VAR_NAME.test(str)) {
      return 'variable';
    }

    if (end === '}') {
      return 'Function';
    }

    if (end === ')') {
      return 'functionValue';
    }
  }

  return '?';
}

module.exports = {
  instanceOf: kindOf, 
  fromString: typeFromString,
  isArray, 
  isClass,
  isClassFunction,
  isEmpty,
  isFalsy, 
  isFloat, 
  isInteger, 
  isStream,
  isGenerator,
  isBound,
  isIterable,
  isEmitter,
  isPromise,
  isNative,
  isSymbol,
};
