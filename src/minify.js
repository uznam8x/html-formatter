var minify = function(el)  {
  return el
    .replace(/\n|\t/g, '')
    .replace(/[a-z]+="\s*"/ig, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/\s>/g, '>')
    .replace(/>\s/g, '>')
    .replace(/\s</g, '<')
    .replace(/class=["']\s/g, function(match) {
      return match.replace(/\s/g, '');
    })
    ;
};

if (typeof define === "function" && define.amd) {
  define([], function() {
    return minify;
  });
} else if (typeof module !== "undefined") {
  module.exports = minify;
}
