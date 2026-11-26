// Okuma günlüğü: okunan her sayfa ve biten her etkinlik tek bir kayıt.
// Profil, fidan, rozetler ve bildirimler hepsini buradan okur.
// Kayıt anahtarı kitap+tür+kimlik olduğundan aynı sayfa iki kez damla vermez.
const Journal = (() => {
  const prefix = window.OKUMINO_GUNLUK || 'okumino-gunluk-v1/';  // öğretmen alanı kendi günlüğünü tutar
  const memory = new Map();
  const DROPS = {page: 1, task: 2};
  // Fidan aşamaları damla eşikleriyle. Dört kitapta 42 sayfa + 14 etkinlik = 70 damla var,
  // son aşama bütün kataloğu bitirmeden açılabilsin diye 60'ta.
  const STAGES = [
    {name: 'Seed', at: 0}, {name: 'Sprout', at: 3}, {name: 'Sapling', at: 10},
    {name: 'Young tree', at: 22}, {name: 'Mighty tree', at: 38}, {name: 'Fruit tree', at: 60}
  ];
  const DAILY_GOAL = 3;

  function entries() {
    const all = new Map(memory);
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith(prefix)) all.set(key, JSON.parse(localStorage.getItem(key)));
      }
    } catch {}
    return [...all.values()].filter(e => e && typeof e.title === 'string' && DROPS[e.type]).sort((a, b) => b.time - a.time);
  }
  function has(book, type, id) {
    const key = prefix + [book, type, id].join('/');
    if (memory.has(key)) return true;
    try { return !!localStorage.getItem(key); } catch { return false; }
  }
  function record(book, type, id, title, extra = {}) {
    const key = prefix + [book, type, id].join('/');
    if (has(book, type, id)) return false;
    const event = {book, type, id, title, time: Date.now(), ...extra};
    try { localStorage.setItem(key, JSON.stringify(event)); } catch {}
    memory.set(key, event);
    return true;
  }
  const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  function streak(list) {
    const days = new Set(list.map(e => dayKey(e.time)));
    const d = new Date();
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); // bugün henüz okumadıysa seri dünden sayılır
    let n = 0;
    while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function summary() {
    const list = entries();
    const pages = list.filter(e => e.type === 'page');
    const tasks = list.filter(e => e.type === 'task');
    const drops = list.reduce((sum, e) => sum + DROPS[e.type], 0);
    const today = dayKey(Date.now());
    const todayDrops = list.filter(e => dayKey(e.time) === today).reduce((s, e) => s + DROPS[e.type], 0);
    let level = 0;
    STAGES.forEach((s, i) => { if (drops >= s.at) level = i; });
    const next = STAGES[level + 1];
    const week = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const k = dayKey(d);
      week.push({date: d, drops: list.filter(e => dayKey(e.time) === k).reduce((s, e) => s + DROPS[e.type], 0)});
    }
    // Her kitap (patika) için ayrı: aktif gün sayısı ve ardışık gün serisi.
    // Süre tutulmaz; bir gün, o kitapta en az bir sayfa ya da etkinlik varsa aktiftir.
    const perBook = {};
    for (const e of list) {
      perBook[e.book] = perBook[e.book] || {pages: 0, tasks: 0, list: []};
      perBook[e.book][e.type === 'page' ? 'pages' : 'tasks']++;
      perBook[e.book].list.push(e);
    }
    for (const k of Object.keys(perBook)) {
      const l = perBook[k].list;
      perBook[k].activeDays = new Set(l.map(e => dayKey(e.time))).size;
      perBook[k].streak = streak(l);
      delete perBook[k].list;
    }
    return {
      list, pages: pages.length, tasks: tasks.length, drops, todayDrops, goal: DAILY_GOAL,
      streak: streak(list), level, stage: STAGES[level], next, stages: STAGES,
      progress: next ? (drops - STAGES[level].at) / (next.at - STAGES[level].at) : 1,
      activeDays: new Set(list.map(e => dayKey(e.time))).size, week, perBook,
      books: Object.keys(perBook).length
    };
  }
  function bookmark(book, page) {
    try {
      if (page !== undefined) localStorage.setItem((window.OKUMINO_AYRAC || 'okumino-ayrac/') + book, String(page));
      return Number(localStorage.getItem((window.OKUMINO_AYRAC || 'okumino-ayrac/') + book)) || 0;
    } catch { return page || 0; }
  }
  // Sunum için: geçen haftayı okumuş bir öğrenci. Bugün boş bırakılır ki
  // günlük hedef ve "serin bozulmasın" bildirimi görünsün.
  function seed() {
    reset();
    const plan = [
      [6, 'heidi', [0, 1], ['soru-0']], [5, 'heidi', [2, 3, 4], []], [4, 'heidi', [5], ['soru-1']],
      [3, 'alice', [0, 1, 2], ['soru-0']], [2, 'pinokyo', [0, 1, 2], []], [1, 'pinokyo', [3, 4], []]
    ];
    const titles = {'soru-0': 'Story question · Stop 1', 'soru-1': 'Story question · Stop 2'};
    for (const [ago, book, pages, tasks] of plan) {
      const base = new Date(); base.setDate(base.getDate() - ago); base.setHours(17, 5, 0, 0);
      pages.forEach((p, i) => {
        const time = base.getTime() + i * 90000;
        try { localStorage.setItem(prefix + [book, 'page', 'p' + p].join('/'), JSON.stringify({book, type: 'page', id: 'p' + p, title: (readerBooks[book][p][0] || 'Page ' + (p + 1)), time})); } catch {}
      });
      tasks.forEach((t, i) => {
        const time = base.getTime() + 600000 + i * 60000;
        try { localStorage.setItem(prefix + [book, 'task', t].join('/'), JSON.stringify({book, type: 'task', id: t, title: titles[t], time})); } catch {}
      });
      bookmark(book, Math.min(readerBooks[book].length - 1, Math.max(...pages) + 1));
    }
    try { localStorage.setItem('okumino-mobil-v1', JSON.stringify({selected: 'pinokyo', steps: {heidi: 4, alice: 2}})); } catch {}
  }
  function reset() {
    memory.clear();
    try {
      for (const key of Object.keys(localStorage)) if (key.startsWith('okumino-')) localStorage.removeItem(key);
      for (const key of Object.keys(sessionStorage)) if (key.startsWith('okumino-')) sessionStorage.removeItem(key);
    } catch {}
  }
  return {entries, has, record, summary, bookmark, seed, reset, DROPS};
})();
