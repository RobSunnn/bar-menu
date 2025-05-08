// ===== main.js =====

// ——— 1) Translations ———
const translations = {
    en: {
        menuTitle:             '🍹 Bar Menu',
        intro:                 'Scan the QR on your table, then tap a category below…',
        searchPlaceholder:     '🔍 Search menu…',
        alcoholPageTitle:      'Alcohol – Bar Menu',
        alcohol:               'Alcohol',
        alcoholIntro:          'Browse our spirits below—or search for your favorite.',
        searchAlcohol:         'Search alcohol…',
        whiskey:               'Whiskey',
        vodka:                 'Vodka',
        otherDrinks:           'Other Drinks',
        beerPageTitle:         'Beer – Bar Menu',
        beer:                  'Beer',
        beerIntro:             'Browse our beers below—or search for your favorite.',
        searchBeer:            '🔍 Search beers…',
        ourBeers:              'Our Beers',
        beveragesPageTitle:    'Beverages – Bar Menu',
        beverages:             'Beverages',
        beveragesIntro:        'Browse our beverages below—or search for your favorite.',
        searchBeverages:       '🔍 Search beverages…',
        nonAlcoholicBeverages: 'Non-Alcoholic Beverages',
        coffeePageTitle:       'Coffee – Bar Menu',
        coffee:                'Coffee',
        coffeeIntro:           'Browse our coffee below—or search for your favorite.',
        searchCoffee:          '🔍 Search coffee…',
        espresso:              'Espresso',
        milkBased:             'Milk-Based',
        coldCoffee:            'Cold Coffee',
        snacksPageTitle:       'Snacks – Bar Menu',
        snacks:                'Snacks',
        snacksIntro:           'Browse our snacks below—or search for your favorite.',
        searchSnacks:          '🔍 Search snacks…',
        snacksCategory:        'Snacks',
        backToMenu:            'Back to Menu',
        wine:                  'Wine - Starosel',
        wineWhite:             'White Wine 150ml',
        wineRed:               'Red Wine 150ml',
        gin:                   'Dry Gin 50ml',
        baileys:               'Baileys 50ml',
        appleLiqueur:          'Jack Daniels Apple Liqueur 50ml',
        kamenitza:             'Kamenitza',
        burgasko:              'Burgasko',
        naturalJuices:         'Natural Juices',
        energyDrinks:          'Energy Drinks',
        coffeeAndTea:          'Coffee And Tea',
        footerText:            '© 2025 OK SPORT Bar Digital Menu. Enjoy responsibly!'
    },
    bg: {
        menuTitle:             '🍹 Бар Меню',
        intro:                 'Сканирайте QR кода на масата и изберете категория…',
        searchPlaceholder:     '🔍 Търси в менюто…',
        alcoholPageTitle:      'Алкохол – Бар Меню',
        alcohol:               'Алкохол',
        alcoholIntro:          'Разгледайте нашите напитки или потърсете любимата си.',
        searchAlcohol:         '🔍 Търси алкохол…',
        whiskey:               'Уиски',
        vodka:                 'Водка',
        otherDrinks:           'Други напитки',
        beerPageTitle:         'Бира – Бар Меню',
        beer:                  'Бира',
        beerIntro:             'Разгледайте нашите бири или потърсете любимата си.',
        searchBeer:            '🔍 Търси бири…',
        ourBeers:              'Нашите бири',
        beveragesPageTitle:    'Безалкохолни – Бар Меню',
        beverages:             'Безалкохолни',
        beveragesIntro:        'Разгледайте безалкохолните или потърсете любимото си.',
        searchBeverages:       '🔍 Търси безалкохолни…',
        nonAlcoholicBeverages: 'Безалкохолни напитки',
        coffeePageTitle:       'Кафе – Бар Меню',
        coffee:                'Кафе',
        coffeeIntro:           'Разгледайте нашето кафе или потърсете любимото си.',
        searchCoffee:          '🔍 Търси кафе…',
        espresso:              'Еспресо',
        milkBased:             'Напитки с мляко',
        coldCoffee:            'Студено кафе',
        snacksPageTitle:       'Снаксове – Бар Меню',
        snacks:                'Снаксове',
        snacksIntro:           'Разгледайте нашите снаксове или потърсете любимото си.',
        searchSnacks:          '🔍 Търси снаксове…',
        snacksCategory:        'Снаксове',
        backToMenu:            'Към менюто',
        wine:                  'Вино - Старосел',
        wineWhite:             'Бяло Вино 150 мл',
        wineRed:               'Червено Вино 150 мл',
        gin:                   'Джин 50мл',
        baileys:               'Бейлис 50мл',
        appleLiqueur:          'Ябълков ликьор 50мл',
        kamenitza:             'Каменица',
        burgasko:              'Бургаско',
        naturalJuices:         'Натурални сокове',
        energyDrinks:          'Енергийни напитки',
        coffeeAndTea:          'Кафе и Чай',
        footerText:            '© 2025 OK SPORT Bar Digital Menu. Наслаждавайте се отговорно!'
    }
};

// ——— 2) Apply saved theme (or default) immediately ———
(function(){
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(saved);
})();

// ——— 3) Debounce helper ———
function debounce(fn, delay = 200) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(()=> fn(...args), delay);
    };
}

// ——— 4) Search logic ———
let fuseItems, fuseCats, sections, items, cats, navItems;
const noResults = document.createElement('p');
noResults.id = 'no-results';
noResults.textContent = '😕 No matches found';
noResults.style.textAlign = 'center';
noResults.style.marginTop = '1rem';
noResults.style.display = 'none';

function initSearch() {
    sections = Array.from(document.querySelectorAll('section.category'));
    if (sections.length) {
        items = []; cats = [];
        sections.forEach(sec => {
            cats.push({ name: sec.querySelector('h2').textContent.trim(), section: sec });
            sec.querySelectorAll('.item').forEach(el => {
                items.push({
                    name: el.querySelector('.item-name').textContent.trim(),
                    el, section: sec
                });
            });
        });
        const opts = { keys:['name'], threshold:0.3, distance:100, minMatchCharLength:1 };
        fuseItems = new Fuse(items, opts);
        fuseCats  = new Fuse(cats, opts);
        const main = document.querySelector('main');
        if (main && !main.contains(noResults)) main.append(noResults);
    } else {
        navItems = Array.from(document.querySelectorAll('nav .menu li'));
    }
}

function filterContent(term) {
    const q = term.trim().toLowerCase();
    if (!q) {
        if (sections.length) {
            sections.forEach(sec => {
                sec.style.display = '';
                sec.querySelectorAll('.item').forEach(i=>i.style.display='flex');
            });
        } else {
            navItems.forEach(li=>li.style.display='');
        }
        noResults.style.display = 'none';
        return;
    }

    if (sections.length) {
        const matchedCats  = new Set(fuseCats.search(q).map(r=>r.item.section));
        const matchedItems = new Set(fuseItems.search(q).map(r=>r.item));
        let anyVisible = false;
        sections.forEach(sec => {
            if (matchedCats.has(sec)) {
                sec.style.display='';
                sec.querySelectorAll('.item').forEach(i=>i.style.display='flex');
                anyVisible = true;
            } else {
                let found=false;
                sec.querySelectorAll('.item').forEach(iEl=>{
                    const data = items.find(d=>d.el===iEl);
                    if (matchedItems.has(data)) {
                        iEl.style.display='flex'; found=true;
                    } else {
                        iEl.style.display='none';
                    }
                });
                sec.style.display = found?'':'none';
                if (found) anyVisible=true;
            }
        });
        noResults.style.display = anyVisible?'none':'block';
    } else {
        navItems.forEach(li=>{
            li.style.display = li.textContent.toLowerCase().includes(q)?'':'none';
        });
    }
}

// ——— 5) I18n ———
function applyLanguage(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n-key]').forEach(el=>{
        const key = el.getAttribute('data-i18n-key'), txt = translations[lang][key];
        if (!txt) return;
        if (el.tagName==='INPUT' && 'placeholder' in el) {
            el.placeholder = txt;
        } else {
            el.textContent = txt;
        }
    });
    const lt = document.getElementById('langToggle');
    if (lt) lt.textContent = lang==='en'?'BG':'EN';
    localStorage.setItem('lang', lang);

    initSearch();
    const si = document.getElementById('menuSearch');
    if (si) filterContent(si.value);
}

// ——— 6) Splash removal ———
window.addEventListener('load', () => {
    setTimeout(()=>{
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('fade-out');
            splash.addEventListener('transitionend', ()=> splash.remove());
        }
    }, 700);
});

// ——— 7) Clear storage on true unload ———
window.addEventListener('pagehide', e => {
    if (!e.persisted) {
        sessionStorage.clear();
        localStorage.clear();
    }
});

// ——— 8) DOM wiring ———
document.addEventListener('DOMContentLoaded', ()=> {

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = document.documentElement.classList.contains('light')?'🌙':'🌞';
        themeToggle.addEventListener('click', ()=>{
            const isLight = document.documentElement.classList.toggle('light');
            themeToggle.textContent = isLight?'🌙':'🌞';
            localStorage.setItem('theme', isLight?'light':'dark');
        });
    }

    // Language toggle & initial apply
    const savedLang = localStorage.getItem('lang')||'en';
    applyLanguage(savedLang);
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', ()=>{
            applyLanguage(document.documentElement.lang==='en'?'bg':'en');
        });
    }

    // Live search
    const searchInput = document.getElementById('menuSearch');
    if (searchInput) {
        initSearch();
        searchInput.addEventListener('input', debounce(e=>filterContent(e.target.value)));
    }

    // Beer‐page modal (guarded)
    const modal = document.getElementById('itemModal');
    if (modal) {
        const mImage   = document.getElementById('modalImage');
        const mName    = document.getElementById('modalName');
        const mDesc    = document.getElementById('modalDesc');
        const mPrice   = document.getElementById('modalPrice');
        const closeBtn = modal.querySelector('.close-btn');

        const beerData = {
            'Heineken':    { img:'https://cdn.nokovandson.com/crop/10145/750/734/go/go4PQOKjKN.webp',   desc:'A crisp, refreshing pale lager from the Netherlands.',         price:'$5.00' },
            'Corona':      { img:'images/corona.jpg',     desc:'Light Mexican lager with a smooth finish.',                    price:'$5.50' },
            'Guinness':    { img:'images/guinness.jpg',   desc:'Rich Irish dry stout with notes of coffee and chocolate.',      price:'$6.00' },
            'Craft IPA':   { img:'images/craft-ipa.jpg',  desc:'Hoppy IPA bursting with citrus and pine aromas.',              price:'$6.50' }
            // …etc…
        };

        document.querySelectorAll('.item-list .item').forEach(el => {
            el.addEventListener('click', ()=> {
                const name = el.querySelector('.item-name').textContent.trim();
                const data = beerData[name];
                if (!data) return;
                mImage.src        = data.img;
                mImage.alt        = name;
                mName.textContent = name;
                mDesc.textContent = data.desc;
                mPrice.textContent= data.price;
                modal.classList.add('show');
                modal.setAttribute('aria-hidden','false');
            });
        });

        closeBtn.addEventListener('click', ()=> {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden','true');
        });
        modal.addEventListener('click', e => {
            if (e.target===modal) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden','true');
            }
        });
    }
});
