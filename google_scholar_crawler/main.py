"""Fetch a public Scholar profile; publish only complete, successful snapshots."""
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen
from bs4 import BeautifulSoup


def parse_profile(html, author_id):
    soup = BeautifulSoup(html, 'html.parser')
    rows = soup.select('.gsc_a_tr')
    years, counts = soup.select('.gsc_g_t'), soup.select('.gsc_g_al')
    total = soup.select_one('#gsc_rsb_st .gsc_rsb_std')
    if not rows or not total or not years or len(years) != len(counts):
        raise ValueError('Scholar profile unavailable or markup changed')
    publications = []
    for row in rows:
        title, cited = row.select_one('.gsc_a_at'), row.select_one('.gsc_a_ac')
        if not title or not cited:
            raise ValueError('Incomplete publication data')
        count = cited.get_text(strip=True).rstrip('*')
        publications.append({
            'title': title.get_text(), 'num_citations': int(count or 0),
            'url': urljoin('https://scholar.google.com', title['href']),
            'citations_url': urljoin('https://scholar.google.com', cited.get('href') or title['href'])})
    more = soup.select_one('#gsc_bpf_more')
    if more and not more.has_attr('disabled'):
        raise ValueError('More than 100 publications: pagination support required')
    return {'author_id': author_id, 'updated': datetime.now(timezone.utc).isoformat(),
            'citedby': int(total.get_text().replace(',', '')),
            'cites_per_year': {y.get_text(): int(c.get_text().replace(',', '')) for y, c in zip(years, counts)},
            'publications': publications}


if __name__ == '__main__':
    author_id = os.environ.get('GOOGLE_SCHOLAR_ID', 'qN8hC60AAAAJ')
    url = 'https://scholar.google.com/citations?' + urlencode({'user': author_id, 'hl': 'en', 'pagesize': 100})
    with urlopen(Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=45) as response:
        data = parse_profile(response.read(), author_id)
    output = Path(os.environ.get('OUTPUT_DIR', 'results'))
    output.mkdir(parents=True, exist_ok=True)
    (output / 'gs_data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(f"Updated {len(data['publications'])} publications; {data['citedby']} citations")
