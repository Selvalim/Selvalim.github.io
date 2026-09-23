// Flickr justified-layout 4.1.0 preserves source order and image aspect ratios.
const lifeGallery = document.querySelector('.life-gallery:not(.life-placeholders)');
const lifePhotos = lifeGallery ? Array.from(lifeGallery.querySelectorAll('.life-photo')) : [];

function layoutLifePhotos() {
  if (!lifeGallery || !window.justifiedLayout || !lifePhotos.length) return;
  const width = lifeGallery.clientWidth;
  if (!width) return;
  const gap = width < 540 ? 4 : 6;
  const target = width < 540 ? 170 : 260;
  const ratios = lifePhotos.map(photo => {
    const image = photo.querySelector('img:not([hidden])');
    return (image.naturalWidth || Number(image.getAttribute('width')) || 1) /
      (image.naturalHeight || Number(image.getAttribute('height')) || 1);
  });
  const geometry = window.justifiedLayout(ratios, {
    containerWidth: width, containerPadding: 0, boxSpacing: gap,
    targetRowHeight: target, targetRowHeightTolerance: 0.2,
    showWidows: true
  });
  const rows = [];
  geometry.boxes.forEach((box, index) => {
    const last = rows[rows.length - 1];
    if (!last || last.top !== box.top) rows.push({ top: box.top, indices: [index] });
    else last.indices.push(index);
  });
  const rowHeight = row => (width - gap * (row.indices.length - 1)) /
    row.indices.reduce((sum, i) => sum + ratios[i], 0);
  // Fill the last row too; absorb a sparse final row to avoid oversized photos.
  if (rows.length > 1 && rowHeight(rows[rows.length - 1]) > target * 1.5) {
    const tail = rows.pop();
    rows[rows.length - 1].indices.push(...tail.indices);
  }
  let top = 0;
  rows.forEach(row => {
    const height = rowHeight(row);
    let left = 0;
    row.indices.forEach(index => {
      const photoWidth = height * ratios[index];
      Object.assign(lifePhotos[index].style, {
        left: `${left}px`, top: `${top}px`, width: `${photoWidth}px`, height: `${height}px`
      });
      left += photoWidth + gap;
    });
    top += height + gap;
  });
  lifeGallery.style.height = `${top - gap}px`;
  lifeGallery.classList.add('is-justified');
}

let lifeLayoutFrame;
function scheduleLifeLayout() {
  cancelAnimationFrame(lifeLayoutFrame);
  lifeLayoutFrame = requestAnimationFrame(layoutLifePhotos);
}
if (lifeGallery) {
  lifeGallery.querySelectorAll('img').forEach(image => image.addEventListener('load', scheduleLifeLayout));
  if (window.ResizeObserver) new ResizeObserver(scheduleLifeLayout).observe(lifeGallery);
  else window.addEventListener('resize', scheduleLifeLayout);
  layoutLifePhotos();
}

document.querySelectorAll('.life-caption-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Hide photo caption' : 'Show photo caption');
    button.closest('.life-photo').classList.toggle('is-open', open);
  });
});
