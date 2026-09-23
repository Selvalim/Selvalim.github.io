# Life photo journal

Edit `_data/life.yml` and keep original photos in `images/life/`.

```yaml
- image: /images/life/example.png
  year: 2026
  location: Chengdu
  caption: A story about this moment.
  alt: Describe the photo.
```

The single gallery sorts years descending, read left-to-right then top-to-bottom.
Year headings are omitted; year and location still appear together in captions.
Only years are supplied, so order within a year does not imply exact dates.
Desktop hover/keyboard focus reveals captions; touch users tap to toggle them.

Flickr's **justified-layout 4.1.0** (MIT) is bundled locally in
`assets/js/lib/justified-layout.js`, with its license alongside it.
No CDN or build-time npm dependency is required for GitHub Pages.
The gallery keeps original aspect ratios and original image files: no cropping,
stretching, recompression, or padded image frames. Narrow gutters separate photos.
Every row, including the last, fills the available width. A sparse final row is
merged with the preceding row to avoid oversized images.

`_data/life_image_sizes.json` caches original dimensions, keyed by image URL, so
lazy-loaded photos have correct geometry before downloading. Update it when
adding/replacing photos using `python3 scripts/update_life_image_sizes.py`
(requires Pillow; detects the actual image format, including JPEGs named .png). Images without cached
dimensions fall back to their natural dimensions once loaded.
Old `shape`, `position`, and `contain` fields are ignored.

Each photo has its own entry and card. For photos from the same event, repeat
the year, location, and caption for each image. There are no stacked albums or
previous/next controls.
