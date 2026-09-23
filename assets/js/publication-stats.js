(function () {
  const section = document.querySelector('.publication-stats');
  if (!section) return;
  // Count all paper cards, independently of active filters and collapsed years.
  const counts = new Map();
  document.querySelectorAll('.pub-scroll .paper-box').forEach(card => {
    if ((card.dataset.categories || '').split(/\s+/).includes('books')) return;
    const year = card.querySelector('.paper-year')?.textContent.trim();
    if (!/^\d{4}$/.test(year || '')) return;
    counts.set(Number(year), (counts.get(Number(year)) || 0) + 1);
  });
  if (!counts.size) { section.hidden = true; return; }
  const first = Math.min(...counts.keys());
  const last = Math.max(...counts.keys());
  const max = Math.max(...counts.values());
  const chart = section.querySelector('.publication-stats__chart');
  chart.replaceChildren();
  for (let year = first; year <= last; year++) {
    const count = counts.get(year) || 0;
    const column = document.createElement('div');
    column.className = 'scholar-stats__column';
    column.title = `${year}: ${count} papers`;
    const value = document.createElement('span');
    value.className = 'scholar-stats__value';
    value.textContent = count;
    const bar = document.createElement('span');
    bar.className = 'scholar-stats__bar';
    bar.style.height = `${count / max * 90}px`;
    const label = document.createElement('span');
    label.className = 'scholar-stats__year';
    label.textContent = year;
    column.append(value, bar, label);
    chart.append(column);
  }
  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  section.querySelector('.publication-stats__total').textContent = `· ${total} papers`;
})();
