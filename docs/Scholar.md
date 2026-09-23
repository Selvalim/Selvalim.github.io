# Google Scholar citations

The homepage loads the public snapshot in `assets/data/scholar.json` immediately and attempts to replace it with newer data from the `google-scholar-stats` branch. The date below the chart is the actual snapshot date. Failed refreshes retain the previous successful snapshot; no placeholder counts are displayed.

The `Get Citation Data` GitHub Actions workflow runs daily at 08:00 UTC (16:00 Singapore), on crawler changes pushed to main, or manually via Actions. It requires repository Actions to be enabled and permission to write the data branch. No Scholar credentials or secret are needed for the public profile. Google may rate-limit requests. A failed run does not publish incomplete data. GitHub may disable scheduled workflows in inactive public repositories; re-enable them in Actions if needed.

Run `pip install -r google_scholar_crawler/requirements.txt` and `OUTPUT_DIR=/tmp/scholar-data python google_scholar_crawler/main.py` to refresh locally. Copy the resulting `gs_data.json` to `assets/data/scholar.json` when updating the bundled fallback.

The client matches normalized titles, with explicitly verified aliases for the Chinese DPoS paper and two Scholar titles containing author suffixes. Ambiguous or missing matches are omitted. Confirmed zero counts remain zero, linking to the Scholar entry when no citing-results link exists. Citation links are added only to the homepage, not the CV/PDF. The chart shows Scholar's annual counts without assuming they sum to the all-time total.
