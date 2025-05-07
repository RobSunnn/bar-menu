// ===== main.js =====

// ——— Translations ———
const translations = {
    en: {
        menuTitle:         '🍹 Bar Menu',
        intro:             'Scan the QR on your table, then tap a category below…',
        searchPlaceholder: '🔍 Search menu…',
        alcoholPageTitle:  'Alcohol – Bar Menu',
        alcohol:           'Alcohol',
        alcoholIntro:      'Enjoy!',
        searchAlcohol:     '🔍 Search alcohol…',
        whiskey:           'Whiskey',
        vodka:             'Vodka',
        otherDrinks:       'Other Drinks',
        beerPageTitle:     'Beer – Bar Menu',
        beer:              'Beer',
        beerIntro:         'Browse our beers below—or search for your favorite.',
        searchBeer:        '🔍 Search beers…',
        ourBeers:          'Our beers',
        beverages:         'Beverages',
        coffee:            'Coffee',
        snacks:            'Snacks',
        backToMenu:        'Back to Menu',
        beveragesIntro:           'Browse our beverages below—or search for your favorite.',
        searchBeverages:          '🔍 Search beverages…',
        nonAlcoholicBeverages:    'Non-Alcoholic Beverages',
        coffeeIntro:     'Browse our coffee below—or search for your favorite.',
        searchCoffee:    '🔍 Search coffee…',
        espresso:        'Espresso',
        milkBased:       'Milk-Based',
        coldCoffee:      'Cold Coffee',
        itemSingleEspresso: 'Single Espresso',
        itemDoubleEspresso: 'Double Espresso',
        itemCappuccino:     'Cappuccino',
        itemLatte:          'Latte',
        itemFlatWhite:      'Flat White',
        itemIcedLatte:      'Iced Latte',
        itemColdBrew:       'Cold Brew',
        footerText:        '© 2025 OK SPORT Bar Digital Menu. Enjoy responsibly!'
    },
    bg: {
        menuTitle:         '🍹 Бар Меню',
        intro:             'Сканирайте QR кода на масата и изберете категория…',
        searchPlaceholder: '🔍 Търси в менюто…',
        alcoholPageTitle:  'Алкохол – Бар Меню',
        alcohol:           'Алкохол',
        alcoholIntro:      'Пожелаваме ви приятно прекарване!',
        searchAlcohol:     '🔍 Търси алкохол…',
        whiskey:           'Уиски',
        vodka:             'Водка',
        otherDrinks:       'Други напитки',
        beerPageTitle:     'Бира – Бар Меню',
        beer:              'Бира',
        beerIntro:         'Разгледайте нашите бири или потърсете любимата си.',
        searchBeer:        '🔍 Търси бири…',
        ourBeers:          'Нашите бири',
        beverages:         'Безалкохолни',
        coffee:            'Кафе',
        snacks:            'Снаксове',
        backToMenu:        'Към менюто',
        beveragesIntro:           'Разгледайте безалкохолните или потърсете любимото си.',
        searchBeverages:          '🔍 Търси безалкохолни…',
        nonAlcoholicBeverages:    'Безалкохолни напитки',
        coffeeIntro:     'Разгледайте нашето кафе или потърсете любимото си.',
        searchCoffee:    '🔍 Търси кафе…',
        espresso:        'Еспресо',
        milkBased:       'Напитки с мляко',
        coldCoffee:      'Студено кафе',
        itemSingleEspresso: 'Eспресо',
        itemDoubleEspresso: 'Двойно еспресо',
        itemCappuccino:     'Капучино',
        itemLatte:          'Лате',
        itemFlatWhite:      'Флат уайт',
        itemIcedLatte:      'Лате на лед',
        itemColdBrew:       'Студено кафе (Cold Brew)',
        footerText:        '© 2025 OK SPORT Bar Digital Menu. Наслаждавайте се отговорно!'
    }
};

// ——— Theme toggle (with persistence) ———

// 1) On load: restore saved theme (default to dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
} else {
    document.documentElement.classList.remove('light');
}

// 2) Wire up the toggle button
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    // Set the initial icon
    themeToggle.textContent = document.documentElement.classList.contains('light') ? '🌙' : '🌞';

    // On click: flip theme, update icon, and save
    themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light');
        themeToggle.textContent = isLight ? '🌙' : '🌞';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
}



// ——— 2) Debounce helper ———
function debounce(fn, delay = 200) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// ——— 3) Search setup ———
let fuseItems, fuseCats;
let sections, items, cats, navItems;
const searchInput = document.getElementById('menuSearch');

// “No results” banner (appended dynamically for category pages)
const noResults = document.createElement('p');
noResults.textContent = '😕 No matches found';
noResults.style.textAlign = 'center';
noResults.style.marginTop = '1rem';
noResults.style.display = 'none';

// Build or rebuild Fuse indexes (called after every language swap)
function initSearch() {
    // find category sections
    sections = Array.from(document.querySelectorAll('section.category'));
    if (sections.length) {
        // category page: build items & categories arrays
        items = [];
        cats  = [];
        sections.forEach(sec => {
            // category heading
            cats.push({
                name: sec.querySelector('h2').textContent.trim(),
                section: sec
            });
            // each item
            sec.querySelectorAll('.item').forEach(el => {
                items.push({
                    name: el.querySelector('.item-name').textContent.trim(),
                    el,
                    section: sec
                });
            });
        });

        // Fuse options
        const opts = {
            keys: ['name'],
            threshold: 0.3,
            distance: 100,
            minMatchCharLength: 1
        };

        // re-create indexes
        fuseItems = new Fuse(items, opts);
        fuseCats  = new Fuse(cats, opts);

        // append noResults if not already
        const main = document.querySelector('main');
        if (main && !noResults.parentElement) {
            main.append(noResults);
        }
    } else {
        // index page: just grab nav items
        navItems = Array.from(document.querySelectorAll('nav .menu li'));
    }
}

// The single filter function for both index & category pages
function filterContent(term) {
    const q = term.trim().toLowerCase();

    // If empty, show everything
    if (!q) {
        if (sections.length) {
            sections.forEach(sec => {
                sec.style.display = '';
                sec.querySelectorAll('.item').forEach(i => (i.style.display = 'flex'));
            });
        } else {
            navItems.forEach(li => (li.style.display = ''));
        }
        noResults.style.display = 'none';
        return;
    }

    // Category page: fuzzy filter
    if (sections.length) {
        const matchedCats  = new Set(fuseCats.search(q).map(r => r.item.section));
        const matchedItems = new Set(fuseItems.search(q).map(r => r.item));
        let anyVisible = false;

        sections.forEach(sec => {
            if (matchedCats.has(sec)) {
                // whole section
                sec.style.display = '';
                sec.querySelectorAll('.item').forEach(i => (i.style.display = 'flex'));
                anyVisible = true;
            } else {
                // filter inside
                let sectionHas = false;
                sec.querySelectorAll('.item').forEach(iEl => {
                    const data = items.find(d => d.el === iEl);
                    if (matchedItems.has(data)) {
                        iEl.style.display = 'flex';
                        sectionHas = true;
                    } else {
                        iEl.style.display = 'none';
                    }
                });
                sec.style.display = sectionHas ? '' : 'none';
                if (sectionHas) anyVisible = true;
            }
        });

        noResults.style.display = anyVisible ? 'none' : 'block';

    } else {
        // Index page: simple substring filter
        navItems.forEach(li => {
            li.style.display = li.textContent.toLowerCase().includes(q)
                ? ''
                : 'none';
        });
    }
}

// Wire up search input once
if (searchInput) {
    // initialize search data structures
    initSearch();
    // on user typing
    searchInput.addEventListener('input', debounce(e => filterContent(e.target.value)));
}

// ——— 4) Internationalization ———
function applyLanguage(lang) {
    document.documentElement.lang = lang;
    // swap text for every element with data-i18n-key
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.getAttribute('data-i18n-key');
        const txt = translations[lang][key];
        if (!txt) return;
        if (el.tagName === 'INPUT' && el.placeholder != null) {
            el.placeholder = txt;
        } else {
            el.textContent = txt;
        }
    });
    // update toggle label
    const lt = document.getElementById('langToggle');
    if (lt) lt.textContent = lang === 'en' ? 'BG' : 'EN';
    localStorage.setItem('lang', lang);

    // **rebuild** search indexes now that headings may have changed
    initSearch();
    // and reset any active filter
    if (searchInput) filterContent('');
}

// on load: apply saved or default language
const savedLang = localStorage.getItem('lang') || 'en';
applyLanguage(savedLang);

// wire the language-toggle button
const langToggle = document.getElementById('langToggle');
if (langToggle) {
    langToggle.addEventListener('click', () => {
        const next = document.documentElement.lang === 'en' ? 'bg' : 'en';
        applyLanguage(next);
    });
}

// ——— Splash screen remover ———
window.addEventListener('load', () => {
    // wait 1.5 seconds, then fade out & remove the splash
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (!splash) return;
        splash.classList.add('fade-out');
        splash.addEventListener('transitionend', () => splash.remove());
    }, 700);
});

// ——— Clear storage when the page is truly unloaded ———
window.addEventListener('pagehide', event => {
    // If the page isn't being persisted to bfcache,
    // we assume it's a “real” unload/close.
    if (!event.persisted) {
        sessionStorage.clear();
        localStorage.clear();
    }
});


