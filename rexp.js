'use strict';

/**
 * The resolver maps the object to a reflector
 * @type {Object}
 */
module.exports = Object.freeze({
  FUNCNAME          : /function (.{1,})\(/,
  HAS_CLASS         : /^\s*class\s+/,
  CLASS_CONSTRUCTOR : /constructor\(([A-Za-z0-9,_$\s]+)?\)\s+?/,
  CLASS             : /class\s+([A-Za-z_0-9]+)((\s+extends\s+([A-Za-z_0-9\(\)]+))?)\s?\{/,
  ARROW_ARG         : /^([^\(]+?)=>/,
  FN_ARGS           : /^[^\(]*\(\s*([^\)]*)\)/m,
  FN_ARG_SPLIT      : /,/,
  FN_ARG            : /^\s*(_?)(\S+?)\1\s*$/,
  STRIP_COMMENTS    : /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,
  ARG_PARTS         : /^(\.{3}\s?)?([$\w]+)\s?\=?/,
  VAR_NAME          : /^[a-z\$\_]+[a-z\$\_0-9]$/i,
  NESTED_COMMA      : /[\[\{\(][^,]+(,)[^,]+[\]\}\)]/
});
