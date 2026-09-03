/* ============================================================
   DESTINATIONS GUILD — "WE HAVE A BOOK ON THAT"
   ------------------------------------------------------------
   When a visitor types a destination into the search box, and
   the Guild has written a book about that place, a small line
   appears underneath offering it.

   It NEVER touches the Check Availability button. The Trip.com
   hand-off works exactly as before. If we have no book for what
   they typed, nothing appears at all.

   To use: put this file in the site root and add one line just
   before </body> on any page with a destination box:

       <script src="dg-book-suggest.js" defer></script>

   Optional: put  data-dg-book  on an input to force it on, or
             data-dg-book="off" to force it off.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1. THE BOOKSHELF -------------------------------
     [ what the visitor might type , the page it opens ]
     Country books win over city books when both could match.  */

  var COUNTRIES = [
    ['Australia', 'australia'],
    ['Brazil', 'brazil'],
    ['China', 'china'],
    ['Dominican Republic', 'dominican-republic'],
    ['Egypt', 'egypt'],
    ['France', 'france'],
    ['Germany', 'germany'],
    ['Greece', 'greece'],
    ['Hong Kong', 'hongkong'],
    ['Italy', 'italy'],
    ['Japan', 'japan'],
    ['Malaysia', 'malaysia'],
    ['Mexico', 'mexico'],
    ['Morocco', 'morocco'],
    ['Singapore', 'singapore'],
    ['South Africa', 'south-africa'],
    ['South Korea', 'south-korea'],
    ['Spain', 'spain'],
    ['Thailand', 'thailand'],
    ['United Kingdom', 'united-kingdom'],
    ['United States', 'usa']
  ];

  var CITIES = [
    ['Agadir', 'agadir-hotels'],
    ['Amalfi Coast', 'amalfi-coast-hotels'],
    ['Athens', 'athens-hotels'],
    ['Bangkok', 'bangkok'],
    ['Barcelona', 'barcelona-hotels'],
    ['Beijing', 'beijing-hotels'],
    ['Berlin', 'berlin-hotels'],
    ['Busan', 'busan-hotels'],
    ['Cairo', 'cairo-hotels'],
    ['Cancun', 'cancun'],
    ['Cape Town', 'cape-town-hotels'],
    ['Casablanca', 'casablanca-hotels'],
    ['Chengdu', 'chengdu-hotels'],
    ['Chiang Mai', 'chiang-mai'],
    ['Cozumel', 'cozumel'],
    ['Crete', 'crete-hotels'],
    ['Durban', 'durban-hotels'],
    ['Edinburgh', 'edinburgh-hotels'],
    ['Fes', 'fes-hotels'],
    ['Guangzhou', 'guangzhou-hotels'],
    ['Guilin', 'guilin-hotels'],
    ['Gyeongju', 'gyeongju-hotels'],
    ['Hiroshima', 'hiroshima-hotels'],
    ['Hong Kong Island', 'hong-kong-hotels'],
    ['Incheon', 'incheon-hotels'],
    ['Jeju', 'jeju-hotels'],
    ['Johannesburg', 'johannesburg-hotels'],
    ['Koh Samui', 'koh-samui'],
    ['Kota Kinabalu', 'kota-kinabalu-hotels'],
    ['Kowloon', 'kowloon-hotels'],
    ['Krabi', 'krabi'],
    ['Kuala Lumpur', 'kuala-lumpur-hotels'],
    ['Kyoto', 'kyoto-hotels'],
    ['La Romana', 'la-romana-hotels'],
    ['Langkawi', 'langkawi-hotels'],
    ['Las Vegas', 'las-vegas'],
    ['London', 'london-hotels'],
    ['Los Cabos', 'los-cabos'],
    ['Madrid', 'madrid-hotels'],
    ['Malacca', 'malacca-hotels'],
    ['Marrakech', 'marrakech-hotels'],
    ['Melbourne', 'melbourne-hotels'],
    ['Mexico City', 'mexico-city'],
    ['Munich', 'munich-hotels'],
    ['Mykonos', 'mykonos-hotels'],
    ['Niagara Falls', 'niagara-falls-usa'],
    ['Nice', 'nice-hotels'],
    ['Orlando', 'orlando'],
    ['Osaka', 'osaka-hotels'],
    ['Paris', 'paris-hotels'],
    ['Pattaya', 'pattaya'],
    ['Penang', 'penang-hotels'],
    ['Phuket', 'phuket'],
    ['Playa del Carmen', 'playa-del-carmen'],
    ['Port Elizabeth', 'port-elizabeth-hotels'],
    ['Pretoria', 'pretoria-hotels'],
    ['Puerto Plata', 'puerto-plata-hotels'],
    ['Puerto Vallarta', 'puerto-vallarta'],
    ['Punta Cana', 'punta-cana-hotels'],
    ['Rhodes', 'rhodes-hotels'],
    ['Rio de Janeiro', 'rio-de-janeiro-hotels'],
    ['Rome', 'rome-hotels'],
    ['Samana', 'samana-hotels'],
    ['Santo Domingo', 'santo-domingo-hotels'],
    ['Santorini', 'santorini-hotels'],
    ['Sao Paulo', 'sao-paulo-hotels'],
    ['Sapporo', 'sapporo-hotels'],
    ['Seoul', 'seoul-hotels'],
    ['Shanghai', 'shanghai-hotels'],
    ['Stellenbosch', 'stellenbosch-hotels'],
    ['Sydney', 'sydney-hotels'],
    ['Tangier', 'tangier-hotels'],
    ['Tokyo', 'tokyo-hotels'],
    ['Tulum', 'tulum'],
    ['Venice', 'venice-hotels'],
    ["Xi'an", 'xian-hotels']
  ];

  var STATES = ('Alabama|Alaska|American Samoa|Arizona|Arkansas|California|Colorado|' +
    'Connecticut|Delaware|Florida|Georgia|Guam|Hawaii|Idaho|Illinois|Indiana|Iowa|' +
    'Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|' +
    'Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|' +
    'New Mexico|New York|North Carolina|North Dakota|Northern Mariana Islands|Ohio|' +
    'Oklahoma|Oregon|Pennsylvania|Puerto Rico|Rhode Island|South Carolina|' +
    'South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|' +
    'Wisconsin|Wyoming').split('|').map(function (n) {
      return [n, n.toLowerCase().replace(/[^a-z0-9]+/g, '-')];
    });

  STATES.push(['Washington, D.C.', 'washington-dc']);
  STATES.push(['U.S. Virgin Islands', 'us-virgin-islands']);

  var PORTS = [
    ['Aruba', 'aruba-cruise-port'],
    ['Oranjestad', 'aruba-cruise-port'],
    ['San Miguel de Cozumel', 'cozumel-cruise-port']
  ];

  /* Other ways people write the same place. */
  var ALIASES = {
    'roma': 'Rome', 'rome italy': 'Rome',
    'nyc': 'New York', 'new york city': 'New York', 'manhattan': 'New York',
    'vegas': 'Las Vegas',
    'cabo': 'Los Cabos', 'cabo san lucas': 'Los Cabos',
    'cdmx': 'Mexico City',
    'marrakesh': 'Marrakech', 'fez': 'Fes',
    'xian': "Xi'an",
    'uk': 'United Kingdom', 'england': 'United Kingdom',
    'britain': 'United Kingdom', 'great britain': 'United Kingdom',
    'scotland': 'United Kingdom', 'wales': 'United Kingdom',
    'usa': 'United States', 'us': 'United States', 'america': 'United States',
    'united states of america': 'United States',
    'dr': 'Dominican Republic',
    'korea': 'South Korea', 'holland': null,
    'dc': 'Washington, D.C.', 'washington dc': 'Washington, D.C.',
    'sao paolo': 'Sao Paulo', 'saopaulo': 'Sao Paulo',
    'hk': 'Hong Kong',
    'kl': 'Kuala Lumpur',
    'phuket thailand': 'Phuket',
    'santorini greece': 'Santorini'
  };

  /* ---------- 2. MATCHING ------------------------------------ */

  /* Lower-case, strip accents (Cancun) and punctuation. */
  var ACCENT_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

  function tidy(s) {
    s = String(s || '').toLowerCase();
    if (s.normalize) s = s.normalize('NFD').replace(ACCENT_MARKS, '');
    return s.replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* One flat list, best kind of book first. */
  var SHELF = [];
  function shelve(rows, kind) {
    rows.forEach(function (r) {
      SHELF.push({ name: r[0], slug: r[1], kind: kind, key: tidy(r[0]) });
    });
  }
  shelve(COUNTRIES, 'country');
  shelve(CITIES, 'city');
  shelve(STATES, 'state');
  shelve(PORTS, 'port');

  function findBook(typed) {
    var q = tidy(typed);
    if (!q) return null;

    /* Short-hand people actually type: uk, nyc, kl, dc, cabo */
    var alias = ALIASES[q];
    if (alias === null) return null;
    if (alias) q = tidy(alias);
    else if (q.length < 3) return null;

    var i, b;

    /* Exact name */
    for (i = 0; i < SHELF.length; i++) {
      if (SHELF[i].key === q) return SHELF[i];
    }
    /* They are still typing: "ven" -> Venice */
    for (i = 0; i < SHELF.length; i++) {
      b = SHELF[i];
      if (b.key.indexOf(q) === 0) return b;
    }
    /* They typed more than the name: "rome for a week" */
    for (i = 0; i < SHELF.length; i++) {
      b = SHELF[i];
      if (q.indexOf(b.key) === 0 && b.key.length >= 4) return b;
    }
    /* Name sits inside what they typed: "hotels in venice" */
    for (i = 0; i < SHELF.length; i++) {
      b = SHELF[i];
      if (b.key.length >= 5 && q.indexOf(' ' + b.key) > -1) return b;
    }
    return null;
  }

  /* ---------- 3. THE LINE ITSELF ------------------------------ */

  var CSS =
    '.dg-book-hint{display:none;margin:10px 0 0;padding:9px 13px;' +
    'background:#f4f8fd;border:1px solid #cfe0f2;border-left:4px solid #C9A84C;' +
    'border-radius:8px;font-family:"DM Sans",-apple-system,"Segoe UI",Roboto,sans-serif;' +
    'font-size:14.5px;line-height:1.45;color:#1c3049;}' +
    '.dg-book-hint.on{display:block;animation:dgBookIn .18s ease-out;}' +
    '@keyframes dgBookIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}' +
    '.dg-book-hint b{font-weight:700;color:#12467f;}' +
    '.dg-book-hint a{color:#12467f;font-weight:700;text-decoration:underline;' +
    'text-underline-offset:2px;white-space:nowrap;}' +
    '.dg-book-hint a:hover{color:#0d3260;}' +
    '.dg-book-hint .dg-book-ico{margin-right:6px;}' +
    '@media (prefers-color-scheme:dark){.dg-book-hint{background:#16305c;' +
    'border-color:#2a4a7d;color:#e8eff8;}.dg-book-hint b,.dg-book-hint a{color:#f0d894;}}';

  function addCSS() {
    if (document.getElementById('dg-book-hint-css')) return;
    var s = document.createElement('style');
    s.id = 'dg-book-hint-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function wording(book) {
    if (book.kind === 'city') {
      return 'We have a Guild guide to <b>where to stay in ' + book.name + '</b>.';
    }
    if (book.kind === 'port') {
      return 'We have a Guild <b>port day guide for ' + book.name + '</b>, harbour map and all.';
    }
    return 'We have a Guild book on <b>' + book.name + '</b>.';
  }

  /* ---------- 4. WIRE IT UP ----------------------------------- */

  function looksLikeDestinationBox(el) {
    if (el.dataset.dgBook === 'off') return false;
    if (el.dataset.dgBook !== undefined) return true;
    var t = (el.type || 'text').toLowerCase();
    if (['text', 'search', ''].indexOf(t) === -1) return false;
    var hay = [el.placeholder, el.name, el.id, el.getAttribute('aria-label'),
      el.getAttribute('data-label')].join(' ').toLowerCase();
    return /destination|city|where|going|search|place/.test(hay);
  }

  function attach(input) {
    if (input.dgBookWired) return;
    input.dgBookWired = true;

    var hint = document.createElement('div');
    hint.className = 'dg-book-hint';
    hint.setAttribute('role', 'status');

    /* Put it where the page says, if the page says. Otherwise sit under
       the whole field rather than squeezed inside a tight wrapper. */
    var host = document.querySelector('[data-dg-book-hint]');
    if (!host) {
      host = input.parentNode;
      if (host && host.parentNode && host.children.length <= 2) host = host.parentNode;
    }
    (host || input.parentNode).appendChild(hint);

    var shown = null;
    var timer = null;

    function paint() {
      var book = findBook(input.value);
      if (!book) {
        hint.className = 'dg-book-hint';
        hint.innerHTML = '';
        shown = null;
        return;
      }
      if (shown === book.slug) return;
      shown = book.slug;
      hint.innerHTML =
        '<span class="dg-book-ico">&#128214;</span>' + wording(book) +
        ' <a href="' + (window.DG_BOOK_BASE || '') + '/' + book.slug +
        '" data-dg-book-link="' + book.slug + '">Read it first &rarr;</a>';
      hint.className = 'dg-book-hint on';
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(paint, 160);
    });
    input.addEventListener('change', paint);
    if (input.value) paint();

    hint.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a[data-dg-book-link]') : null;
      if (!a) return;
      try {
        if (typeof window.__dgTrack === 'function') {
          window.__dgTrack('book_suggest_click', { slug: a.getAttribute('data-dg-book-link') });
        } else if (typeof window.gtag === 'function') {
          window.gtag('event', 'book_suggest_click', {
            book_slug: a.getAttribute('data-dg-book-link')
          });
        }
      } catch (err) { /* never block the click */ }
    });
  }

  function scan() {
    var inputs = document.querySelectorAll('input');
    for (var i = 0; i < inputs.length; i++) {
      if (looksLikeDestinationBox(inputs[i])) attach(inputs[i]);
    }
  }

  function start() {
    addCSS();
    scan();
    /* Boxes that appear later (pop-ups, the Polly panel). */
    if (window.MutationObserver) {
      new MutationObserver(function () { scan(); })
        .observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  /* Let other scripts reuse the lookup if ever useful. */
  window.dgFindBook = findBook;
})();
