const option = {};

const single = [
  'br', 'hr', 'img', 'input', 'meta', 'link',
  'col', 'base', 'param', 'track', 'source', 'wbr',
  'command', 'keygen', 'area', 'embed', 'menuitem'
];

const closing = (el) => {
  el = el.replace(/<(\w+)[^>]*>/g, (match, capture) => {
    if (single.indexOf(capture) > -1) {
      return (match.substring(0, match.length - 1) + ' />').replace(/\/\s\//g, '/');
    }
    return match.replace('/>', '></' + capture + '>');
  });
  return el;
};

const minify = (el) => {
  return el
    .replace(/\n|\t/g, '')
    .replace(/[a-z]+="\s*"/ig, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/"\s>/g, '">')
    //.replace(/"\s/g, '"')
    .replace(/>\s/g, '>')
    .replace(/\s</g, '<')
    .replace(/class=["']\s/g, (match) => {
      return match.replace(/\s/g, '');
    })
    ;
};

const convert = {
  comment: [],
  line: []
};

const comment = (el) => {
  convert.comment = [];
  el = el.replace(/(<!--[^>]*?>)/g, (match) => {
    convert.comment.push(match);
    return '<!-- [#!# : ' + (convert.comment.length - 1) + ' : #!#] -->';
  });
  return el
};

const line = (el) => {
  convert.line = [];
  let i = -1;
  el = el.replace(/<[^>]*>/g, (match) => {
    convert.line.push(match);
    i++;
    return `\n[#-# : ${i} : ${match} : #-#]\n`;
  });
  el = el.replace(/\n\n/g, '\n');
  return el;
};

const tidy = (el) => {
  let tab = '';
  convert.line.forEach((source, index) => {
    el = el.replace(`[#-# : ${index} : ${source} : #-#]`, (match) => {
      let prevLine = `[#-# : ${index - 1} : ${convert.line[index - 1]} : #-#]`;
      tab += '\t';
      let remove = 0;
      if (match.indexOf('<!doctype') > -1) remove++;
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
    .replace(/\n<!doctype/g, '<!doctype')
    .replace(/>\n([\w+!@#$%^&*\(\)_+\-=\?\:;"'\/\.,\[\]\{\}\|]+)/g, '>$1')
    .replace(/([\w+!@#$%^&*\(\)_+\-=\?\:;"'\/\.,\[\]\{\}\|])\n\s+<\//g, '$1</')
    .replace(/[^\/]>\n\s+<\/(.)>/g, '$1></$1>')
    .replace(/<(\w+)[^>]*[^\/]>\n\s+<\/(\w+)>/g, (match) => {
      return match.replace(/\n|\t/g, '').replace(/\s+/g, ' ');
    })

  convert.comment.forEach((source, index) => {
    el = el.replace(new RegExp('<!--[^>]*' + index + ' : #!#] -->', 'g'), (match) => {
      let cnt = /%(\d+)%/g.exec(match);
      let t = '';
      for (let c = 0; c < cnt[1]; c++) {
        t += '\t';
      }
      return source.replace(/\n/g, '\n' + t);
    });
  });
  return el
};

const entity = (el) => {
  el = el.replace(/(<textarea[^>]*>)\n\s+/g, '$1');
  el = el.replace(/\s+<\/textarea>/g, '</textarea>');
  el = el.replace(/<textarea[^>]*>((.|\n)*?)<\/textarea>/g, (match, capture) => {
    return match.replace(capture, (match) => {
      return match
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\//g, '&#47;')
        .replace(/"/g, '&#34;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '&#13;')
        .replace(/\s/g, '&nbsp;')
    });
  });
  return el;
};

const render = (el, opt) => {
  el = closing(el);
  el = comment(el);
  el = entity(el);
  el = minify(el);
  el = line(el);
  el = tidy(el);

  return el;
};

module.exports = {
  closing: closing,
  minify: minify,
  entity: entity,
  render: render
};