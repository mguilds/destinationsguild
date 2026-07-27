// resolve-city — turns a typed destination (e.g. "Wichita") into Trip.com's
// numeric city ID so the homepage search can deep-link to real results with the
// user's dates. Runs server-side on Netlify (no browser), so it can call Trip's
// keyword lookup directly — a browser can't, because of cross-site security.
//
// GET /.netlify/functions/resolve-city?q=Wichita
//   -> { "cityId": 1856, "name": "Wichita", "subtitle": "Sedgwick County, Kansas, United States" }
//   -> { "error": "not_found" } when nothing matches.

const AID = '8217189';   // Destinations Guild alliance id — do not change
const SID = '317113714'; // Destinations Guild sid — do not change

exports.handler = async (event) => {
  const q = ((event.queryStringParameters || {}).q || '').trim();

  const json = (statusCode, obj, cache) => ({
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'cache-control': cache || 'no-store'
    },
    body: JSON.stringify(obj)
  });

  if (!q) return json(400, { error: 'missing_query' });

  // A synthetic client id keeps Trip's endpoint happy; no real session needed.
  const cid = Date.now() + '.dg' + Math.random().toString(36).slice(2, 12);

  const payload = {
    queryInfo: { keyword: q, actionType: 'destination' },
    head: {
      platform: 'PC', cver: '0', cid, bu: 'IBU', group: 'trip',
      aid: AID, sid: SID, ouid: '', locale: 'en-US', region: 'US',
      timezone: '-7', currency: 'USD', pageId: '10320668148',
      vid: cid, guid: '', isSSR: false,
      extension: [{ name: 'cityId', value: '' }]
    }
  };

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch('https://us.trip.com/restapi/soa2/34951/getHotelKeywords', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    clearTimeout(t);

    const data = await r.json();
    const list = data && data.data && data.data.mainKeywordList &&
                 data.data.mainKeywordList.keywords;
    if (!Array.isArray(list) || !list.length) return json(200, { error: 'not_found' });

    // Pick the best match. Prefer an EXACT name match to what the traveler
    // typed (so "Salina" -> Salina, Kansas, not "Salinas", California), then
    // fall back to Trip's top-ranked result.
    const qLower = q.toLowerCase();
    const idOf = (item) => item && item.keyword && item.keyword.keywordContentInfo;
    let info = null;
    for (const item of list) {
      const k = idOf(item);
      if (k && k.keywordId && String(k.keyword || '').toLowerCase() === qLower) { info = k; break; }
    }
    if (!info) {
      for (const item of list) {
        const k = idOf(item);
        if (k && k.keywordId) { info = k; break; }
      }
    }
    if (!info) return json(200, { error: 'not_found' });

    const sub = (info.displayTexts || []).find(d => d.key === 'SUB_TITLE');

    // City IDs are stable, so let the browser/CDN cache the answer for a day.
    return json(200, {
      cityId: String(info.keywordId),
      name: info.keyword || q,
      subtitle: (sub && sub.value) || '',
      searchType: info.searchType || ''
    }, 'public, max-age=86400');
  } catch (err) {
    return json(200, { error: 'lookup_failed' });
  }
};
