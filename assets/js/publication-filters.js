document.addEventListener('DOMContentLoaded', function () {
  const container = document.querySelector('.pub-scroll');
  if (!container) return;
  const buttons = document.querySelectorAll('.filter-btn');
  const papers = Array.from(container.querySelectorAll('.paper-box'));
  const categories = paper => (paper.dataset.categories || '').split(/\s+/);
  const groups = new Map();

  papers.forEach(paper => {
    const year = paper.querySelector('.paper-year')?.textContent.trim() || 'Other';
    if (!groups.has(year)) {
      const details = document.createElement('details');
      details.className = 'publication-year-group';
      details.open = true;
      const summary = document.createElement('summary');
      const heading = document.createElement('span');
      heading.textContent = year;
      const count = document.createElement('span');
      count.className = 'publication-year-count';
      summary.append(heading, count);
      details.append(summary);
      groups.set(year, { details, count, papers: [] });
    }
    groups.get(year).papers.push(paper);
  });
  const years = Array.from(groups.keys()).sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
  groups.forEach(group => { group.count.textContent = `(${group.papers.length})`; });

  function applyFilter(button) {
    buttons.forEach(btn => {
      const active = btn === button;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    const filter = button.dataset.filter;
    if (filter === 'all') {
      years.forEach(year => {
        const group = groups.get(year);
        group.papers.forEach(paper => {
          paper.style.display = '';
          group.details.append(paper);
        });
      });
      container.replaceChildren(...years.map(year => groups.get(year).details));
    } else {
      // Restore the original curated order, independently of collapsed years.
      container.replaceChildren(...papers);
      papers.forEach(paper => {
        paper.style.display = categories(paper).includes(filter) ? '' : 'none';
      });
    }
    container.scrollTop = 0;
  }
  buttons.forEach(button => {
    const count = button.dataset.filter === 'all' ? papers.length
      : papers.filter(paper => categories(paper).includes(button.dataset.filter)).length;
    button.textContent = `${button.dataset.label} (${count})`;
    button.addEventListener('click', () => applyFilter(button));
  });
  const defaultButton = document.querySelector('.filter-btn[data-filter="all"]');
  if (defaultButton) applyFilter(defaultButton);
});
