# Academic CV

Open `/cv/` using the CV navigation link (opens in a new tab). Click **Download PDF** to generate a single-column A4 PDF directly in the browser, with clickable links and page numbers. The button reads the current CV page, so it never downloads a stale prebuilt PDF. Generation stays on the user's device. The bundled pdfmake 0.2.20 library and Roboto fonts load only when exporting; their MIT license is in `assets/lib/pdfmake/LICENSE`.

Alternatively, click **Print**, select **Save as PDF**, and disable browser headers/footers. The print version uses the same content with its own A4 stylesheet; page count may differ by browser. The local `output/pdf/` file is a verification snapshot, not served by the website.

## One shared content source

Homepage content now lives in `_includes/home-content.md`. `_pages/about.md` includes this file; `_pages/cv.html` reads the same source during the Jekyll build. Update this shared file to change publications, interests, education, research and teaching experience, awards, talks, and reviewer service in both places. No browser scraping, separate bibliography, or third-party PDF service is needed. Every subsequent build updates both pages.

Keep the existing section headings, intro-card markup, paper-box-text markup, and `Under review` / `Preprint` badges when editing: the CV uses these boundaries to select the corresponding content. The CV includes all papers, independently of the homepage's Selected filter. The badge determines which publication section a paper belongs to; papers retain their homepage order within each section.

Supplementary information from the supplied CV (languages, skills, conference presentations, summer schools) lives in `_data/cv.yml`. Contact information comes from `_config.yml`; the website and display name are in `_data/cv.yml`. No phone number is published. Dates and publication years follow the homepage as requested.

`assets/css/cv.css` controls the screen and print presentation; `assets/js/cv-export.js` controls the downloadable PDF. The CV has its own layout and does not load the visitor tracker.

## Validation

After `bundle exec jekyll build`, run `bundle exec ruby scripts/check_cv.rb _site`. For a custom build directory, pass that directory instead. This checks publication parity, section extraction, standalone links, phone exclusion, and CV navigation.

Optional additions requiring new information: grants/funding, supervision/mentoring, reviewer years and roles, thesis titles, and complete publication bibliographic metadata (DOIs, volumes, issues, pages). Omit these sections until confirmed.
