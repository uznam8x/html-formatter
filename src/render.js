var closing = require(__dirname + '/closing.js');
var entity = require(__dirname + '/entity.js');
var minify = require(__dirname + '/minify.js');

var option = {};

var convert = {
  comment: [],
  line: []
};

var comment = function (el) {
  convert.comment = [];
  el = el.replace(/(<!--[^>]*?>)/g, function (match) {
    convert.comment.push(match);
    return '<!-- [#!# : ' + (convert.comment.length - 1) + ' : #!#] -->';
  });
  return el
};

var line = function (el) {
  convert.line = [];
  var i = -1;
  el = el.replace(/<[^>]*>/g, function (match) {
    convert.line.push(match);
    i++;
    return '\n[#-# : ' + i + ' : ' + match + ' : #-#]\n';
  });
  el = el.replace(/\n\n/g, '\n');
  return el;
};

var tidy = function (el) {
  var tab = '';
  convert.line.forEach(function (source, index) {
    el = el.replace('[#-# : ' + index + ' : ' + source + ' : #-#]', function (match) {
      var prevLine = '[#-# : ' + (index - 1) + ' : ' + convert.line[index - 1] + ' : #-#]';
      tab += '\t';
      var remove = 0;
      if (index === 0) remove++;
      if (match.indexOf('#-# : ' + (index) + ' : </') > -1) remove++;
      if (prevLine.indexOf('<!doctype') > -1) remove++;
      if (prevLine.indexOf('<!--') > -1) remove++;
      if (prevLine.indexOf('/> : #-#') > -1) remove++;
      if (prevLine.indexOf('#-# : ' + (index - 1) + ' : </') > -1) remove++;
      if (match.indexOf('<!--') > -1) {
        match = match.replace('<!-- [#!# :', '<!-- [#!# %' + (tab.length - remove) + '% :');
      }
      tab = tab.substring(0, tab.length - remove);
      return tab + match.replace('[#-# : ' + index + ' : ', '').replace(' : #-#]', '');
    });
  });

  el = el
    .replace(/>\n([\w+!@#$%^&*\(\)_+\-=\?\:;"'\/\.,\[\]\{\}\|]+)/g, '>$1')
    .replace(/([\w+!@#$%^&*\(\)_+\-=\?\:;"'\/\.,\[\]\{\}\|])\n\s+<\//g, '$1</')
    .replace(/<[^\/]([^>]*?)>\s+<\//g, function (match, capture) {
      if (match.indexOf('/>') > -1) {
        return match;
      }
      return match.replace(/\s\s+/g, '');
    })

  convert.comment.forEach(function (source, index) {
    el = el.replace(new RegExp('<!--[^>]*' + index + ' : #!#] -->', 'g'), function (match) {
      var cnt = /%(\d+)%/g.exec(match);
      var t = '';
      for (var c = 0; c < cnt[1]; c++) {
        t += '\t';
      }
      return source.replace(/\n/g, '\n' + t);
    });
  });
  return el.substring(1, el.length - 1);
};

var render = function (el, opt) {
  el = closing(el);
  el = comment(el);
  el = entity(el);

  el = minify(el);
  el = line(el);
  el = tidy(el);

  return el;
};

if (typeof define === "function" && define.amd) {
  define([], function () {
    return render;
  });
} else if (typeof module !== "undefined") {
  module.exports = render;
}
