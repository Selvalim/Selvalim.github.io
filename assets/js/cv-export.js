// One renderer for both the browser download and the PDF verification script.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.buildAcademicCV = factory;
})(typeof window === 'undefined' ? this : window, function (document, portraitData) {
  var ink = '#253e38';
  var accent = '#23675b';
  function clean(text) { return text.replace(/\s+/g, ' ').replace(/[\u2013\u2014]/g, '-'); }
  function inline(node, inherited) {
    var style = Object.assign({}, inherited || {});
    if (node.nodeType === 3) return [Object.assign({ text: clean(node.textContent) }, style)];
    if (node.nodeType !== 1) return [];
    if (node.tagName === 'STRONG' || node.classList.contains('me')) style.bold = true;
    if (node.classList.contains('me')) style.decoration = 'underline';
    if (node.tagName === 'A') {
      style.link = node.getAttribute('href');
      style.color = accent;
    }
    if (node.style.color) {
      // CSSOM serializes hex colors as rgb(); pdfmake expects hex colors.
      var rgb = node.style.color.match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
      style.color = rgb ? '#' + rgb.slice(1).map(function (value) {
        return Number(value).toString(16).padStart(2, '0');
      }).join('') : node.style.color;
    }
    if (node.style.fontWeight === 'bold') style.bold = true;
    return Array.from(node.childNodes).reduce(function (runs, child) {
      return runs.concat(inline(child, style));
    }, []);
  }
  function paragraph(node, options) {
    return Object.assign({ text: inline(node), margin: [0, 0, 0, 4] }, options || {});
  }
  var header = document.querySelector('.cv-header');
  var headerText = [
    { text: 'CURRICULUM VITAE', fontSize: 8, characterSpacing: 1.5, color: '#64786c', margin: [0, 0, 0, 8] },
    { text: header.querySelector('h1').textContent, fontSize: 25, bold: true, margin: [0, 0, 0, 6] },
    paragraph(header.querySelector('.cv-position')),
    paragraph(header.querySelector('.cv-contact'), { fontSize: 9 })
  ];
  var content = [
    portraitData ? { unbreakable: true, columns: [
      { width: '*', stack: headerText },
      { width: 60, image: portraitData, fit: [60, 84], alignment: 'right' }
    ], columnGap: 18 } : { stack: headerText },
    { canvas: [{ type: 'line', x1: 0, y1: 6, x2: 503, y2: 6, lineWidth: 1.3, lineColor: accent }], margin: [0, 0, 0, 6] }
  ];
  document.querySelectorAll('.cv-section').forEach(function (section) {
    content.push({ text: section.querySelector('h2').textContent, fontSize: 12, bold: true, color: accent, margin: [0, 11, 0, 6], headlineLevel: 1 });
    Array.from(section.children).forEach(function (element) {
      if (element.tagName === 'H2') return;
      if (element.tagName === 'P') { content.push(paragraph(element)); return; }
      if (element.tagName !== 'UL' && element.tagName !== 'OL') return;
      Array.from(element.children).forEach(function (li, index) {
        var stack;
        if (li.classList.contains('cv-publication')) {
          stack = Array.from(li.children).map(function (p, pIndex) {
            var copy = p.cloneNode(true);
            if (pIndex > 0) copy.querySelectorAll('a').forEach(function (link) { link.remove(); });
            if (!copy.textContent.trim()) return null;
            return paragraph(copy, { bold: pIndex === 0, fontSize: pIndex < 2 ? 9.5 : 9, margin: [0, 0, 0, 2] });
          }).filter(Boolean);
        } else {
          var copy = li.cloneNode(true);
          var nested = copy.querySelector('ul');
          if (nested) nested.remove();
          stack = [paragraph(copy)];
          if (nested) stack.push({ ul: Array.from(nested.children).map(function (item) { return { text: inline(item) }; }), margin: [0, 0, 0, 0], fontSize: 9 });
        }
        content.push({ unbreakable: true, columns: [
          { width: 18, text: element.tagName === 'OL' ? (index + 1) + '.' : '•' },
          { width: '*', stack: stack }
        ], margin: [0, 0, 0, li.classList.contains('cv-publication') ? 6 : 4] });
      });
    });
  });
  var paginated = [];
  for (var i = 0; i < content.length; i++) {
    if (content[i].headlineLevel === 1 && content[i + 1]) {
      paginated.push({ unbreakable: true, stack: [content[i], content[++i]] });
    } else paginated.push(content[i]);
  }
  return {
    info: { title: 'Xiaolin Wen - Academic CV', author: 'Xiaolin Wen' },
    pageSize: 'A4', pageMargins: [46, 44, 46, 44],
    defaultStyle: { font: 'Roboto', fontSize: 9.5, lineHeight: 1.1, color: ink },
    content: paginated,
    footer: function (page, pages) { return { text: page + ' / ' + pages, alignment: 'right', margin: [0, 12, 46, 0], fontSize: 8, color: '#64786c' }; },
    pageBreakBefore: function (current, following) { return current.headlineLevel === 1 && following.length === 0; }
  };
});
