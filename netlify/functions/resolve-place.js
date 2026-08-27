// resolve-place — the Guild's own Trip.com lookup desk.
//
// resolve-city answers "what is this city's number?". This one answers the harder
// question the Explorers actually need: "does Trip.com sell this exact hotel, and if
// so what is its number and which city does it sit in?" — so a booking button can be
// built from ID numbers instead of a name Trip.com has to guess at.
//
// GET /.netlify/functions/resolve-place?q=The%20Merrion%20Hotel&n=5
//   -> { "q": "...", "candidates": [ { id, name, subtitle, fields:{...} }, ... ] }
//
// `fields` carries every plain value Trip.com returns for that candidate, so the
// caller can tell a hotel from a city, a district or a landmark without guessing.

const AID = '8217189';   // Destinations Guild alliance id — do not change
const SID = '317113714'; // Destinations Guild sid — do not change

exports.handler = async (event) => {
  const p = event.queryStringParameters || {};
  const q = (p.q || '').trim();
  const n = Math.min(parseInt(p.n || '5', 10) || 5, 10);

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
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch('https://us.trip.com/restapi/soa2/34951/getHotelKeywords', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    clearTimeout(t);

    const data = await r.json();
    const list = (data && data.data && data.data.mainKeywordList &&
                  data.data.mainKeywordList.keywords) || [];
    if (!Array.isArray(list) || !list.length) return json(200, { q, candidates: [] });

    const flat = (o, out, prefix) => {
      out = out || {}; prefix = prefix || '';
      for (const k of Object.keys(o || {})) {
        const v = o[k];
        if (v === null || v === undefined) continue;
        if (typeof v === 'object') {
          if (Array.isArray(v)) {
            v.forEach((item, i) => {
              if (item && typeof item === 'object') flat(item, out, prefix + k + i + '.');
              else out[prefix + k + i] = item;
            });
          } else flat(v, out, prefix + k + '.');
        } else if (String(v).length < 120) {
          out[prefix + k] = v;
        }
      }
      return out;
    };

    const candidates = [];
    for (const item of list.slice(0, n)) {
      const k = item && item.keyword && item.keyword.keywordContentInfo;
      if (!k || !k.keywordId) continue;
      const sub = (k.displayTexts || []).find(d => d.key === 'SUB_TITLE');
      candidates.push({
        id: String(k.keywordId),
        name: k.keyword || '',
        subtitle: (sub && sub.value) || '',
        fields: flat(k)
      });
    }

    return json(200, { q, candidates }, 'public, max-age=86400');
  } catch (err) {
    return json(200, { q, error: 'lookup_failed', detail: String(err && err.message || err) });
  }
};
