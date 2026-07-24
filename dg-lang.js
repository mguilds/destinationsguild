/* ============================================================
   DESTINATIONS GUILD — SHARED LANGUAGE SWITCHER (EN / ES / FR)
   Include on any page that has the shared header:
       <script src="dg-lang.js" defer></script>

   HOW IT WORKS
   - COMMON below holds the strings shared by every guide built from
     the city template (nav, section furniture, fact-box labels, the
     currency widget, buttons, the affiliate note).
   - A page may ALSO define its own dictionary for its unique prose,
     BEFORE this script loads:
         <script>window.DG_PAGE_ES = { "Why visit Tulum":"Por qué visitar Tulum", ... };
                 window.DG_PAGE_FR = { "Why visit Tulum":"Pourquoi visiter Tulum", ... };</script>
     Anything not in a dictionary simply stays in English.
   ============================================================ */
(function(){

  var COMMON_ES = {
    /* nav + header */
    "Home":"Inicio",
    "Guild Atlas Library":"Biblioteca Atlas del Guild",
    "Mexico":"México",
    "United States":"Estados Unidos",
    "Cancún":"Cancún",
    "An Affiliate of":"Afiliado de",
    "An Affiliate of Trip.com":"Afiliado de Trip.com",
    "Hotels":"Hoteles",
    "Flights":"Vuelos",
    "Things to Do":"Qué Hacer",
    "Things to do":"Qué hacer",
    "Trains":"Trenes",
    "Cars":"Autos",

    /* section furniture repeated on every guide */
    "The who, what, where — and how it works — before you go.":"Quién, qué y dónde — y cómo funciona — antes de viajar.",
    "The experiences worth building the trip around.":"Las experiencias que valen un viaje entero.",
    "Best time to visit & getting there":"Mejor época para viajar y cómo llegar",
    "When to go":"Cuándo ir",
    "Getting there":"Cómo llegar",
    "Explorer’s Wisdom":"Sabiduría del Explorador",
    "Book Tours & Activities on Trip.com":"Reserva tours y actividades en Trip.com",
    "Explore hotels ›":"Ver hoteles ›",
    "Read our guide ›":"Lee nuestra guía ›",

    /* fact box labels */
    "Country":"País",
    "State":"Estado",
    "Region":"Región",
    "Currency":"Moneda",
    "Language":"Idioma",
    "Population":"Población",
    "Airport":"Aeropuerto",
    "Time zone":"Zona horaria",
    "Founded":"Fundada",
    "Landmark":"Emblema",

    /* currency widget */
    "What your money’s worth today":"Cuánto vale tu dinero hoy",
    "US dollars":"Dólares estadounidenses",
    "Canadian dollars":"Dólares canadienses",
    "Mexican pesos":"Pesos mexicanos",
    "Live mid-market rate, refreshed when the page loads. Banks, cards, and ATMs add their own margins, so treat it as a guide.":"Tipo de cambio medio en tiempo real, actualizado al cargar la página. Bancos, tarjetas y cajeros añaden sus propios márgenes, así que tómalo como referencia.",

    /* affiliate note + footer */
    "Destinations Guild is an affiliate of Trip.com. When you book through the links on this page, we may earn a commission at no additional cost to you. This helps us keep publishing free travel guides like this one.":"Destinations Guild es afiliado de Trip.com. Cuando reservas a través de los enlaces de esta página, podemos ganar una comisión sin costo adicional para ti. Esto nos permite seguir publicando guías de viaje gratuitas como esta.",
    "Hotels, flights, tours, and airport transfers — all in one place, all through Trip.com. Every booking helps support Destinations Guild at no extra cost to you.":"Hoteles, vuelos, tours y traslados al aeropuerto — todo en un solo lugar, todo a través de Trip.com. Cada reserva ayuda a Destinations Guild sin costo adicional para ti.",
    "A Division of Guild Companies USA":"Una División de Guild Companies USA",
    "soon":"pronto",
    "Live":"En línea",
    "Guide":"Guía"
  };

  var COMMON_FR = {
    "Home":"Accueil",
    "Guild Atlas Library":"Bibliothèque Atlas du Guild",
    "Mexico":"Mexique",
    "United States":"États-Unis",
    "Cancún":"Cancún",
    "An Affiliate of":"Un affilié de",
    "An Affiliate of Trip.com":"Un affilié de Trip.com",
    "Hotels":"Hôtels",
    "Flights":"Vols",
    "Things to Do":"Activités",
    "Things to do":"Activités",
    "Trains":"Trains",
    "Cars":"Voitures",

    "The who, what, where — and how it works — before you go.":"Qui, quoi, où — et comment ça marche — avant de partir.",
    "The experiences worth building the trip around.":"Les expériences qui méritent à elles seules le voyage.",
    "Best time to visit & getting there":"Quand partir et comment s'y rendre",
    "When to go":"Quand partir",
    "Getting there":"Comment s'y rendre",
    "Explorer’s Wisdom":"Sagesse de l'explorateur",
    "Book Tours & Activities on Trip.com":"Réservez visites et activités sur Trip.com",
    "Explore hotels ›":"Voir les hôtels ›",
    "Read our guide ›":"Lire notre guide ›",

    "Country":"Pays",
    "State":"État",
    "Region":"Région",
    "Currency":"Devise",
    "Language":"Langue",
    "Population":"Population",
    "Airport":"Aéroport",
    "Time zone":"Fuseau horaire",
    "Founded":"Fondée",
    "Landmark":"Point de repère",

    "What your money’s worth today":"Ce que vaut votre argent aujourd'hui",
    "US dollars":"Dollars américains",
    "Canadian dollars":"Dollars canadiens",
    "Mexican pesos":"Pesos mexicains",
    "Live mid-market rate, refreshed when the page loads. Banks, cards, and ATMs add their own margins, so treat it as a guide.":"Taux moyen du marché en direct, actualisé au chargement de la page. Les banques, les cartes et les guichets ajoutent leurs propres marges — à titre indicatif seulement.",

    "Destinations Guild is an affiliate of Trip.com. When you book through the links on this page, we may earn a commission at no additional cost to you. This helps us keep publishing free travel guides like this one.":"Destinations Guild est un affilié de Trip.com. Lorsque vous réservez via les liens de cette page, nous pouvons toucher une commission, sans frais supplémentaires pour vous. Cela nous permet de continuer à publier des guides de voyage gratuits comme celui-ci.",
    "Hotels, flights, tours, and airport transfers — all in one place, all through Trip.com. Every booking helps support Destinations Guild at no extra cost to you.":"Hôtels, vols, excursions et transferts aéroport — tout au même endroit, via Trip.com. Chaque réservation soutient Destinations Guild, sans frais supplémentaires pour vous.",
    "A Division of Guild Companies USA":"Une division de Guild Companies USA",
    "soon":"bientôt",
    "Live":"En ligne",
    "Guide":"Guide"
  };

  function merge(base, extra){
    var out = {}, k;
    for (k in base) out[k] = base[k];
    if (extra) for (k in extra) out[k] = extra[k];
    return out;
  }

  var ES = merge(COMMON_ES, window.DG_PAGE_ES);
  var FR = merge(COMMON_FR, window.DG_PAGE_FR);
  var DICT = { es: ES, fr: FR };

  var cur = 'en';
  var _orig = new WeakMap();

  function walk(node, dict){
    try{
      if(node.nodeType === 3){
        if(!_orig.has(node)) _orig.set(node, node.nodeValue);
        var raw = _orig.get(node), t = raw.trim();
        if(!t) return;
        if(dict && Object.prototype.hasOwnProperty.call(dict, t)){
          node.nodeValue = raw.replace(t, dict[t]);
        } else {
          node.nodeValue = raw;   // back to the English baseline
        }
      } else if(node.nodeType === 1){
        var tag = node.tagName;
        if(tag==='SCRIPT'||tag==='STYLE'||tag==='INPUT'||tag==='TEXTAREA'||tag==='IFRAME'||tag==='OPTION') return;
        if(node.classList && node.classList.contains('noi18n')) return;
        for(var c=node.firstChild; c; c=c.nextSibling) walk(c, dict);
      }
    }catch(e){}
  }

  function apply(lang){
    if(lang === cur) return;
    walk(document.body, DICT[lang] || null);
    cur = lang;
    document.documentElement.lang = lang;
    var pills = document.querySelectorAll('.lang-tgl');
    for(var i=0;i<pills.length;i++){
      pills[i].classList.toggle('active', pills[i].getAttribute('data-lang') === lang);
    }
    try{ localStorage.setItem('dgLang', lang); }catch(e){}
  }

  window.setLang = function(l){ apply(l); };

  function boot(){
    try{
      var saved = localStorage.getItem('dgLang');
      if(saved === 'es' || saved === 'fr') apply(saved);
    }catch(e){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
