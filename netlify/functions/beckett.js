// Beckett — the Guild Librarian (Netlify Function). Added 6 October 2026.
//
// What he does: a visitor asks a question; Beckett answers ONLY with books that
// are really on our shelves. He reads the shelves live from library.html and
// us-states-library.html, so every new book the daily desks add is his at once.
//
// The AI is used for one narrow job: choosing which of OUR books fit the question.
// Every title and link the visitor sees comes from our own pages, never from the AI,
// so he cannot invent a hotel, a page or a fact. If the AI key is missing or the
// AI is unavailable, he falls back to a plain word search of the same shelves.
//
// Key: ANTHROPIC_API_KEY, set in Netlify (Site configuration > Environment variables).

const SITE = 'https://destinationsguild.com';
const MODEL = 'claude-haiku-4-5-20251001';
const CACHE_MS = 10 * 60 * 1000;
let shelf = { at: 0, books: [] };
const hits = new Map(); // light per-visitor limit, best effort

const STOP = new Set(('a an and are about any best book books can do find for from give go going guide guides ' +
  'have help i in is it me my of on or our please show some tell that the there this to trip ' +
  'travel visit want we what when where which who will with would you your talk like need looking ' +
  'stay hotel hotels cruise cruises time month months').split(' '));

function clean(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ');
}
function decode(s) {
  return (s || '').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').trim();
}
function kindOf(id) {
  if (id.startsWith('best-time-to-visit-')) return 'when';
  if (id.endsWith('-cruise-port')) return 'port';
  if (id.endsWith('-cruises') || id === 'cruises') return 'cruise';
  if (id.endsWith('-hotels')) return 'stay';
  return 'book';
}
function titleOf(b) {
  if (b.kind === 'stay') return 'Where to Stay in ' + b.name;
  return b.name;
}

async function loadShelves() {
  if (shelf.books.length && Date.now() - shelf.at < CACHE_MS) return shelf.books;
  const get = (p) => fetch(SITE + p, { headers: { 'user-agent': 'Beckett-Librarian' } })
    .then((r) => (r.ok ? r.text() : '')).catch(() => '');
  const [lib, us] = await Promise.all([get('/library.html'), get('/us-states-library.html')]);
  const books = new Map();
  const reCat = /<a class="catf[^"]*" data-nm="([^"]*)" href="\/?([a-z0-9-]+)(?:\.html)?"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = reCat.exec(lib))) {
    const inner = m[3];
    const name = decode((inner.match(/class="cf-name">([^<]*)</) || [])[1]);
    const where = decode((inner.match(/class="cf-parent">([^<]*)</) || [])[1]);
    const flag = (inner.match(/class="cf-flag">([^<]*)</) || [])[1] || '';
    if (!name) continue;
    const id = m[2];
    books.set(id, { id, name, where, flag, nm: clean(m[1] + ' ' + name + ' ' + where), kind: kindOf(id), shelf: 'library' });
  }
  const reUs = /<a class="spine"[^>]*href="\/?([a-z0-9-]+)(?:\.html)?"[^>]*title="([^"]+)"/g;
  while ((m = reUs.exec(us))) {
    const id = m[1];
    if (books.has(id)) continue;
    const name = decode(m[2]);
    books.set(id, { id, name, where: 'United States', flag: '🇺🇸', nm: clean(name + ' united states usa state'), kind: 'book', shelf: 'states' });
  }
  if (books.size) shelf = { at: Date.now(), books: [...books.values()] };
  return shelf.books;
}

// Plain word search: the backup when the AI is not available.
// Two-word places ("south america", "new york") count as one; words like "south" or "new"
// on their own count for nothing, so South America never turns into South Africa.
const WEAK = new Set('south north east west new san santa saint st great little upper lower central old la el los las'.split(' '));
function wordSearch(q, books) {
  const qc = clean(q);
  const all = qc.split(/\s+/).filter((w) => w && !STOP.has(w));
  const words = all.filter((w) => w.length > 2 && !WEAK.has(w));
  const pairs = [];
  for (let i = 0; i < all.length - 1; i++) pairs.push(all[i] + ' ' + all[i + 1]);
  const wantWhen = /\bwhen\b|best time|weather|month|season/.test(qc);
  const wantStay = /\bstay\b|hotel|where to sleep|neighbou?rhood/.test(qc);
  const wantCruise = /cruise|ship|sail/.test(qc);
  const scored = books.map((b) => {
    let s = 0;
    const name = clean(b.name);
    const nmPad = ' ' + b.nm + ' ';
    for (const pr of pairs) if (nmPad.includes(' ' + pr + ' ')) s += 6;
    for (const w of words) {
      if (name.split(' ').includes(w)) s += 5;
      else if (b.nm.split(' ').includes(w)) s += 2;
      else if (w.length > 4 && b.nm.includes(w)) s += 1;
    }
    if (s > 0) {
      if (wantWhen && b.kind === 'when') s += 3;
      if (wantStay && b.kind === 'stay') s += 3;
      if (wantCruise && (b.kind === 'cruise' || b.kind === 'port')) s += 3;
      if (!wantWhen && !wantStay && !wantCruise && b.kind === 'book') s += 1;
    }
    return { b, s };
  }).filter((x) => x.s >= 4).sort((x, y) => y.s - x.s);
  if (wantCruise) {
    const cruiseHits = scored.filter((x) => x.b.kind === 'cruise' || x.b.kind === 'port');
    if (!cruiseHits.length) {
      const companion = books.find((b) => b.id === 'cruises');
      const closest = [companion && companion.id, scored[0] && scored[0].b.id].filter(Boolean);
      return { found: false, picks: [], closest, topic: 'that cruise' };
    }
    return { found: true, picks: cruiseHits.slice(0, 3).map((x) => x.b.id), closest: [], topic: '' };
  }
  return { found: scored.length > 0, picks: scored.slice(0, 3).map((x) => x.b.id), closest: [], topic: '' };
}

async function aiChoose(q, books) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const list = books.map((b) => `${b.id} | ${titleOf(b)} | ${b.where}`).join('\n');
  const system =
    'You are the card catalogue of the Destinations Guild Travel Library. You are given a visitor question ' +
    'and the complete list of books on our shelves, one per line as: id | title | where. Choose up to 3 ids ' +
    'that best answer the question, best first. Use ONLY ids that appear in the list, copied exactly. ' +
    'If no book truly covers what the visitor asked for (a place, region or kind of trip we have no book on), ' +
    'set found to false, leave picks empty, and put up to 2 ids of the closest related books in closest. ' +
    'topic is 2 to 5 plain words naming what the visitor asked for, for example "a South America cruise". ' +
    'Reply with JSON only, no other text: {"found":true,"picks":["id"],"closest":[],"topic":"..."}';
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctl.signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        temperature: 0,
        system,
        messages: [{ role: 'user', content: 'BOOKS:\n' + list + '\n\nVISITOR QUESTION: ' + q }],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const text = (data.content && data.content[0] && data.content[0].text) || '';
    const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const ids = new Set(books.map((b) => b.id));
    const keep = (a) => (Array.isArray(a) ? a.filter((x) => ids.has(x)) : []);
    const out = {
      found: !!json.found,
      picks: keep(json.picks).slice(0, 3),
      closest: keep(json.closest).slice(0, 2),
      topic: clean(json.topic || '').trim().slice(0, 40),
    };
    if (out.found && !out.picks.length) out.found = false;
    return out;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function card(b) {
  return {
    id: b.id,
    title: titleOf(b),
    where: b.where,
    flag: b.flag,
    kind: b.kind,
    url: '/' + b.id + '.html',
    shelfUrl: b.shelf === 'library' ? '/library.html#' + b.id : '/us-states-library.html',
  };
}

function reply(body, status) {
  return {
    statusCode: status || 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reply({ error: 'Ask Beckett with a POST request.' }, 405);
  let q = '';
  try { q = String(JSON.parse(event.body || '{}').q || ''); } catch (e) { q = ''; }
  q = q.replace(/\s+/g, ' ').trim().slice(0, 200);
  if (q.length < 2) return reply({ found: false, say: 'Ask me for a country, a city or a cruise, and I will fetch the book.', books: [], closest: [] });

  const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || 'x';
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now); hits.set(ip, recent);
  const tooMany = recent.length > 30;

  const books = await loadShelves();
  if (!books.length) return reply({ found: false, say: 'I cannot reach the shelves just now. Please try again in a moment.', books: [], closest: [] });

  let choice = tooMany ? null : await aiChoose(q, books);
  const via = choice ? 'ai' : 'search';
  if (!choice) choice = wordSearch(q, books);

  const byId = new Map(books.map((b) => [b.id, b]));
  const picks = choice.picks.map((id) => byId.get(id)).filter(Boolean).map(card);
  const closest = choice.closest.map((id) => byId.get(id)).filter(Boolean).map(card);

  let say;
  if (choice.found && picks.length) {
    say = picks.length === 1 ? 'Here you are: ' + picks[0].title + '.' : 'Here you are. I found ' + picks.length + ' books for you.';
  } else if (closest.length) {
    say = 'We have not written a book on ' + (choice.topic || 'that') + ' yet. This is the closest on our shelf.';
  } else {
    say = 'I could not find that on our shelves. Try a country, a city or a cruise.';
  }
  return reply({ found: !!(choice.found && picks.length), say, books: picks, closest, via });
};
