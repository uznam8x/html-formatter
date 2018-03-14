var entity = function(el) {
  el = el.replace(/(<textarea[^>]*>)\n\s+/g, '$1');
  el = el.replace(/\s+<\/textarea>/g, '</textarea>');
  el = el.replace(/<textarea[^>]*>((.|\n)*?)<\/textarea>/g, function(match, capture) {
    return match.replace(capture, function(match) {
      return match
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#47;')
        .replace(/"/g, '&#34;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '&#13;')
        .replace(/%/g, '&#37;')
        .replace(/\{/g, '&#123;')
        .replace(/\}/g, '&#125;')
        .replace(/\s/g, '&nbsp;');
    });
  });
  return el;
};


if (typeof define === "function" && define.amd) {
  define([], function() {
    return entity;
  });
} else if (typeof module !== "undefined") {
  module.exports = entity;
}
