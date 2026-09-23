(async function () {
  const section = document.querySelector('.scholar-stats');
  if (!section) return;
  const normalize = text => text.replace(/:\s*(?:X\. Zhang|F\. Chen) et al\.$/i, '')
    .normalize('NFKD').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  // This Chinese-language paper has an English title on the homepage.
  const aliases = new Map([[normalize('Visual Analysis Method of Blockchain Community Evolution Based on DPoS Consensus Mechanism'),
    normalize('基于DPoS共识机制的区块链社区演化的可视分析方法')]]);
  const valid = data => data.author_id === 'qN8hC60AAAAJ' && Number.isInteger(data.citedby)
    && data.citedby >= 0 && Number.isFinite(Date.parse(data.updated))
    && Array.isArray(data.publications) && data.cites_per_year
    && Object.entries(data.cites_per_year).every(([year, count]) => /^\d{4}$/.test(year) && Number.isInteger(count) && count >= 0);
  const safeLink = value => {
    try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === 'scholar.google.com' ? u.href : null; }
    catch (_) { return null; }
  };
  function render(data) {
    const chart = section.querySelector('.scholar-stats__chart');
    const entries = Object.entries(data.cites_per_year).sort((a, b) => Number(a[0]) - Number(b[0]));
    const max = Math.max(1, ...entries.map(entry => entry[1]));
    chart.replaceChildren();
    entries.forEach(([year, count]) => {
      const item = document.createElement('div');
      item.className = 'scholar-stats__column';
      item.title = `${year}: ${count} citations`;
      const value = document.createElement('span');
      value.className = 'scholar-stats__value';
      value.textContent = count;
      const bar = document.createElement('span');
      bar.className = 'scholar-stats__bar';
      bar.style.height = `${count / max * 90}px`;
      const label = document.createElement('span');
      label.className = 'scholar-stats__year';
      label.textContent = year;
      item.append(value, bar, label);
      chart.append(item);
    });
    section.querySelector('.scholar-stats__total').textContent = `· ${data.citedby} citations`;
    section.querySelector('.scholar-stats__updated').textContent = `Updated ${data.updated.slice(0, 10)}`;
    const publications = new Map();
    data.publications.forEach(p => {
      const key = normalize(p.title || '');
      // Ambiguous duplicate titles must not silently select a citation count.
      publications.set(key, publications.has(key) ? null : p);
    });
    document.querySelectorAll('.paper-box').forEach(card => {
      card.querySelectorAll('.paper-citations').forEach(link => link.remove());
      const title = card.querySelector('.paper-box-text > p:first-child a');
      if (!title) return;
      const key = normalize(title.textContent);
      const paper = publications.get(aliases.get(key) || key);
      if (!paper || !Number.isInteger(paper.num_citations) || paper.num_citations < 0) return;
      const url = safeLink(paper.citations_url);
      if (!url) return;
      const links = Array.from(card.querySelectorAll('.paper-box-text > p')).find(p =>
        Array.from(p.querySelectorAll('a')).some(a => /^(PDF|Publisher)$/.test(a.textContent.trim())));
      if (!links) return;
      const link = document.createElement('a');
      link.className = 'paper-citations';
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = `Cited by ${paper.num_citations}`;
      const existingLinks = links.querySelectorAll('a');
      existingLinks[existingLinks.length - 1].after(link);
    });
  }
  let newest = -Infinity;
  async function load(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('Unavailable citation data');
      const data = await response.json();
      if (!valid(data)) throw new Error('Invalid citation data');
      if (Date.parse(data.updated) > newest) {
        newest = Date.parse(data.updated);
        render(data);
      }
    } finally { clearTimeout(timer); }
  }
  await Promise.allSettled([load(section.dataset.fallback), load(section.dataset.source)]);
  if (newest === -Infinity) section.querySelector('.scholar-stats__updated').textContent = 'Citation data unavailable. View Google Scholar ↗';
})();
