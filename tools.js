'use strict';

const Unsure = Symbol.for('Unsure');

module.exports.segment = function segment(start, end, str, endFast=false) {
  const segments = [];
  var idx = 0;
  var acc = '';

  if (!Array.isArray(str)) { 
    str = str.split('');
  }

  while (str.length > 0) {

    const c = str.shift();
    acc += c;
    if (c === start) {idx++;}

    if (c === end) {
      idx--;

      if (endFast) {
        segments.push(acc);
        return segments;
      }

      if (idx === 0) {
        segments.push(acc);
        acc = '';
      }
    }
  }

  return segments;
}


function sampleText(text, rate) {
  rate = rate || 8;
  const portion = (text.length / rate);

  return Array.apply(null, {length: rate}).map(function(n, i) {
    const idx = Math.floor(i * portion);
    return text.charAt(idx);
  })
};

module.exports.sampleText = sampleText;