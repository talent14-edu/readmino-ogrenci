// Okumino öğrenci alanı (web). BİLGİN öğrenci webinin iskeleti, Okumino'nun okuma
// günlüğü (damla + fidan), kitapları ve ikonlarıyla. Tek para birimi damla:
// okunan her sayfa 1, biten her etkinlik/oyun 2 damla (gunluk.js).
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const IK = n => `../mobil/assets/ikon/${n}.png`;
const ikon = (n, c = 'ik') => `<img class="${c}" src="${IK(n)}" alt="">`;
const esc = s => String(s).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');
const ekran = $('#ekran');
// Öğretmen alanı (../ogretmen/) bu dosyayı aynen kullanır; yalnız kayıt anahtarı, hesap ve ek ekranlar değişir.
const OG = window.OKUMINO_ROL === 'ogretmen';

/* ---------- kitaplar: klasikler (mobil verisi) + tashihten geçmiş özgün kitaplar ---------- */
const KAPAK = id => `../img/covers/${id}.webp`;
// Sınıf eşlemesi: Minik 1-2, Kâşif 3-4, Usta 4; özgün kitaplar yazıldıkları sınıfa.
const SINIF = {heidi: [1, 2], pinokyo: [3, 4], alice: [3, 4], 'kucuk-prens': [4, 5, 6, 7, 8], 'kus-mu-top-mu': [2], pusula: [3]};
const KITAPLAR = [
  ...KLASIK_EK.map(b => ({...b, kapak: KAPAK(b.id), ozgun: false,
    sayfalar: readerBooks[b.id].map(([baslik, satirlar, g]) => ({baslik, satirlar, gorsel: g ? `../mobil/assets/${g}.webp` : null}))})),
  ...OZGUN
].map(b => ({...b, siniflar: SINIF[b.id] || [1, 2, 3, 4]}));
const YAKINDA = [['oz', 'The Wizard of Oz'], ['beyaz-dis', 'White Fang'], ['define', 'Treasure Island'], ['pollyanna', 'Pollyanna']];
const aralik = b => b.siniflar.length > 1 ? b.siniflar[0] + '–' + b.siniflar[b.siniflar.length - 1] : String(b.siniflar[0]);
// İngilizce metin yardımcıları: "Grade 3" / "Grades 3–4", "1 drop" / "2 drops".
const sinifYazi = b => (b.siniflar.length > 1 ? 'Grades ' : 'Grade ') + aralik(b);
const cogul = (n, tek, cok) => n === 1 ? tek : (cok || tek + 's');
const kitap = id => KITAPLAR.find(b => b.id === id) || sinifKitaplari()[0] || KITAPLAR[0];
const okunan = id => Journal.entries().filter(e => e.book === id && e.type === 'page').length;
const okunduMu = (id, i) => Journal.has(id, 'page', 'p' + i);
function yerel(k, v) { if (OG) k = k.replace('okumino-web-', 'okumino-ogrt-'); try { if (v !== undefined) localStorage.setItem(k, v); return localStorage.getItem(k); } catch { return null; } }
// Demo: öğrencinin sınıfı. Canlıda hesaptan gelecek; sol menüdeki seçim yalnız tanıtım için.
const aktifSinif = () => Math.min(OG ? 8 : 4, Math.max(1, Number(yerel('okumino-web-sinif')) || 3));
const uygun = b => b.siniflar.includes(aktifSinif());
const sinifKitaplari = () => KITAPLAR.filter(uygun);
const siraliKitaplar = () => [...sinifKitaplari(), ...KITAPLAR.filter(b => !uygun(b))];
const seviyeAdi = () => aktifSinif() <= 2 ? 'minik' : aktifSinif() === 3 ? 'kasif' : 'usta';

// Patika: kitap duraklara bölünür (kısa kitapta 2, uzunda 3 sayfa). Her durak beş adım:
// önce Tahmin et, sırası Oku, sonra Kelime oyunu, Anla, Yaz (veri/duraklar.js).
const ADIMLAR = [
  {k: 'tahmin', ad: 'Predict', faz: 'before', ik: 'soru'}, {k: 'oku', ad: 'Read', faz: 'during', ik: 'kitap'},
  {k: 'kelime', ad: 'Word game', faz: 'after', ik: 'yapboz'}, {k: 'anla', ad: 'Understand', faz: 'after', ik: 'buyutec'},
  {k: 'yaz', ad: 'Write', faz: 'after', ik: 'defter'}];
const adimBitti = (b, d, k) => k === 'oku' ? Array.from({length: d.son - d.bas + 1}, (_, j) => okunduMu(b.id, d.bas + j)).every(Boolean) : Journal.has(b.id, 'task', `${d.id}-${k}`);
// Durak sayısı sınıfa göre: 1. sınıf 3, 2. sınıf 4, 3. sınıf 5, 4. sınıf 6. Kısa kitapta yazılmış
// etkinlik seti kadar. Etkinlik içeriği (veri/duraklar.js) sayfa aralığına göre eşlenir: tahmin
// durağın ilk sayfasının, kelime/anla/yaz son sayfasının yazıldığı bölümden gelir.
// Sayfa başlığı olmayan kitapların durak adları (2 sayfalık bölümlere göre).
const DURAK_ADI = {heidi: ['The mountain hut', 'A bed of hay', 'A starry night'], alice: ['Chasing the Rabbit', 'The golden key', 'The pool of tears'], 'kucuk-prens': ['The boy in the desert', 'The sheep in the box', 'Sunsets and the rose']};
function duraklar(b) {
  const n = b.sayfalar.length, set = DURAKLAR[b.id] || [], boy0 = n <= 8 ? 2 : 3;
  const N = Math.max(1, Math.min(aktifSinif() + 2, set.length || n, n));
  const bolumler = set.map((c, i) => ({c, s: i * boy0, e: Math.min(n, (i + 1) * boy0) - 1}));
  const kok = w => w.toLocaleLowerCase('en').slice(0, Math.max(4, w.length - 3));
  return Array.from({length: N}, (_, k) => {
    const bas = Math.round(k * n / N), son = Math.round((k + 1) * n / N) - 1;
    const metin = b.sayfalar.slice(bas, son + 1).map(p => p.satirlar.join(' ')).join(' ').toLocaleLowerCase('en');
    const ortak = x => Math.max(0, Math.min(son, x.e) - Math.max(bas, x.s) + 1);
    const kesisen = bolumler.filter(x => ortak(x) > 0);
    let icerik = null;
    if (kesisen.length) {
      const enCok = kesisen.reduce((m, x) => ortak(x) > ortak(m) ? x : m), ilk = kesisen[0];
      const kelimeler = kesisen.flatMap(x => x.c.k), icinde = kelimeler.filter(([w]) => metin.includes(kok(w)));
      const sec = [...icinde, ...kelimeler.filter(x => !icinde.includes(x))].slice(0, 3);
      icerik = {t: ilk.c.t, k: sec, a: enCok.c.a, y: enCok.c.y};
    }
    const x = {no: k + 1, bas, son, id: `d${bas + 1}-${son + 1}`, icerik, ad: b.sayfalar[bas].baslik || (DURAK_ADI[b.id] || [])[Math.floor(bas / boy0)] || `Pages ${bas + 1}–${son + 1}`};
    x.adim = ADIMLAR.map(st => adimBitti(b, x, st.k)); x.bitti = x.adim.every(Boolean); return x;
  });
}
function sonKitap() {
  const son = Journal.entries().find(e => e.type === 'page' && KITAPLAR.some(b => b.id === e.book && uygun(b)));
  return kitap(son ? son.book : (sinifKitaplari().some(b => b.id === yerel('okumino-web-secili')) ? yerel('okumino-web-secili') : sinifKitaplari()[0]?.id));
}

/* ---------- hesap ---------- */
const AVATARLAR = [['kitapkurdu', 'Bookworm'], ['elsalla', 'Waving hello'], ['kosan', 'Runner'], ['arkadaslar', 'Friends'], ['yildiz', 'Star']];
const HESAP0 = OG ? {ad: 'Sarah', soyad: 'Miller', eposta: 'sarah.miller@school.readmino.app', okul: 'Readmino Demo School', brans: 'Classroom teacher', sinif: '3', avatar: 'kitapkurdu'}
  : {ad: 'Emma', soyad: 'Clark', eposta: 'emma.clark@school.readmino.app', sinif: '3', avatar: 'kitapkurdu'};
function hesap() { let k = {}; try { k = JSON.parse(yerel('okumino-web-hesap') || '{}'); } catch {} const h = {...HESAP0, ...k, sinif: String(aktifSinif())}; if (!AVATARLAR.some(a => a[0] === h.avatar) && !(h.avatar === 'ozel' && h.avatarResim)) h.avatar = HESAP0.avatar; return h; }
// Avatar: hazır ikonlardan biri ya da bilgisayardan yüklenen resim (küçültülüp bu cihazda saklanır).
const avatarSrc = h => h.avatar === 'ozel' && h.avatarResim ? h.avatarResim : IK(h.avatar);

/* ---------- rozetler ---------- */
function rozetler(s) {
  const biten = KITAPLAR.filter(b => okunan(b.id) >= b.sayfalar.length).length;
  const oyun = s.list.filter(e => e.type === 'task' && e.book === 'oyun-dolabi').length;
  return [
    ['damla', 'First drop', s.pages, 1, 'Read your first page'], ['kitap', 'Page pal', s.pages, 10, 'Read 10 pages'],
    ['buyutec', 'Curious explorer', s.tasks, 1, 'Finish an activity or a game'], ['yapboz', 'Game lover', oyun, 3, 'Finish 3 games in the Game Cabinet'],
    ['kitapkurdu', 'Bookworm', biten, 1, 'Read a whole book to the end'], ['alev', '3-day streak', s.streak, 3, 'Read 3 days in a row'],
    ['agac', 'Gardener', s.streak, 7, 'Read 7 days in a row'], ['pusula', 'Shelf traveler', s.books, 4, 'Read from 4 different books'],
    ['kupa', 'Activity master', s.tasks, 6, 'Finish 6 activities or games']
  ].map(([ik, ad, var_, ist, ipucu]) => ({ik, ad, var: Math.min(var_, ist), ist, ipucu, on: var_ >= ist}));
}

/* ---------- üst köşe: damla + bildirimler ---------- */
function gunAnahtari() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
function bildirimler() {
  if (OG && window.OGRT_BILDIRIM) return window.OGRT_BILDIRIM();
  const s = Journal.summary(), b = sonKitap(), sayfa = Math.min(b.sayfalar.length - 1, Journal.bookmark(b.id)), kalan = Math.max(0, s.goal - s.todayDrops);
  const g = gunAnahtari(), saat = new Date().getHours(), list = [];
  list.push(kalan
    ? {id: 'gun-' + g, ik: 'fidan', zaman: saat < 12 ? 'This morning' : 'Today', baslik: saat < 12 ? 'Good morning! Your sapling is awake' : 'Your sapling is thirsty', metin: `${kalan} more ${cogul(kalan, 'drop')} today. One page = one drop.`, link: `#oku/${b.id}/${sayfa}`}
    : {id: 'tamam-' + g, ik: 'agac', zaman: 'Today', baslik: "Today's goal is done!", metin: `Your sapling drank ${s.todayDrops} ${cogul(s.todayDrops, 'drop')} today. See you tomorrow.`, link: '#profil'});
  list.push({id: `mino-${b.id}-${sayfa}`, ik: 'kitap', zaman: 'Today', baslik: 'Mino is waiting for you', metin: `You stopped on page ${sayfa + 1} of ${b.ad}.`, link: `#oku/${b.id}/${sayfa}`});
  if (s.streak) list.push({id: `seri-${g}`, ik: 'alev', zaman: 'Today', baslik: `You have a ${s.streak}-day streak`, metin: 'Read today too and your streak grows.', link: `#oku/${b.id}/${sayfa}`});
  const yakin = rozetler(s).filter(r => !r.on).sort((x, y) => (x.ist - x.var) - (y.ist - y.var))[0];
  if (yakin) list.push({id: `rozet-${yakin.ad}-${yakin.var}`, ik: yakin.ik, zaman: 'This week', baslik: `Almost there: ${yakin.ad} badge`, metin: `${yakin.ipucu} (${yakin.var}/${yakin.ist}).`, link: '#profil/rozet'});
  list.push({id: 'yeni-kitap-2', ik: 'kitaplar', zaman: 'New', baslik: '2 new books on your shelf', metin: "Bird or Ball? and The Compass That Won't Point North are now in your library.", link: '#kitaplar'});
  list.push({id: 'yeni-oyun', ik: 'yapboz', zaman: 'New', baslik: 'The Game Cabinet is open', metin: 'Detective games, choose-your-path stories and instruction games are waiting for you.', link: '#oyunlar'});
  return list;
}
const okunanBildirim = () => { try { return new Set(JSON.parse(yerel('okumino-web-okunan') || '[]')); } catch { return new Set(); } };
function ustGuncelle() {
  const s = Journal.summary();
  if ($('#damlaSayi')) $('#damlaSayi').textContent = s.todayDrops >= s.goal ? `${Math.min(s.todayDrops, 99)} ✓` : `${s.todayDrops}/${s.goal}`;
  if ($('.damlaRozet')) $('.damlaRozet').classList.toggle('tamam', s.todayDrops >= s.goal);
  const ok = okunanBildirim(), n = bildirimler().filter(b => !ok.has(b.id)).length;
  $('#zilSayi').hidden = !n; $('#zilSayi').textContent = n;
}
function bildirimAc(ac) {
  const kutu = $('.bildirimKutu'), zil = $('.zil');
  if (!ac) { kutu.hidden = true; zil.setAttribute('aria-expanded', 'false'); return; }
  const ok = okunanBildirim(), list = bildirimler();
  kutu.innerHTML = `<header><h2>Notifications</h2><button type="button" class="metinDugme" data-hepsi>Mark all as read</button></header><ul>${list.map(b => `<li class="${ok.has(b.id) ? '' : 'yeni'}"><a href="${b.link}" data-bid="${b.id}">${ikon(b.ik)}<span><b>${esc(b.baslik)}</b><small>${esc(b.metin)}</small><em>${b.zaman}</em></span></a></li>`).join('')}</ul><p class="not">Mino reminds you at most twice a day, and never scolds.</p>`;
  kutu.hidden = false; zil.setAttribute('aria-expanded', 'true');
  const kaydet = ids => { yerel('okumino-web-okunan', JSON.stringify([...new Set([...okunanBildirim(), ...ids])])); ustGuncelle(); };
  $$('[data-bid]', kutu).forEach(a => a.onclick = () => { kaydet([a.dataset.bid]); bildirimAc(false); });
  $('[data-hepsi]', kutu).onclick = () => { kaydet(list.map(b => b.id)); bildirimAc(true); };
}
$('.zil').onclick = e => { e.stopPropagation(); bildirimAc($('.bildirimKutu').hidden); };
document.addEventListener('click', e => { if (!e.target.closest('#ust')) bildirimAc(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') bildirimAc(false); });

function tost(html) {
  const t = $('.tost'); t.innerHTML = html; t.classList.remove('goster'); void t.offsetWidth; t.classList.add('goster');
}
function damlaKazan(n, neden) { tost(`${ikon('damla')}<b>+${n} ${cogul(n, 'drop')}</b><span>${neden}</span>`); ustGuncelle(); }

/* ---------- vitrin: ana sayfadaki canlı duyuru karuseli (öğrenci ve öğretmen ortak) ---------- */
// BİLGİN web ve AI-LA öğretmen panelindeki haftalık karuselin Okumino sürümü:
// 4,5 sn'de bir döner, üstüne gelince durur, noktalar ve oklarla gezilir.
// Slayt: {etiket, ton (lavanta|altin|nane|petrol|mandalina), metin (html), resim | kapaklar[], mino, ikonResim}
const SOZLER = [
  ['One child, one teacher, one book and one pen can change the world.', 'Malala Yousafzai'],
  ['The more that you read, the more things you will know. The more that you learn, the more places you\'ll go.', 'Dr. Seuss'],
  ['There is more treasure in books than in all the pirate\'s loot on Treasure Island.', 'Walt Disney'],
  ['A child who reads becomes a grown-up who thinks and asks questions.', 'Readmino'],
  ['Every book is a new door opening in front of a child.', 'Readmino']];
const gununSozu = () => SOZLER[Math.floor(Date.now() / 864e5) % SOZLER.length];
let vitrinZaman = 0;
function vitrin(slaytlar) {
  return `<section class="vitrin" aria-roledescription="carousel" aria-label="Announcements"><div class="vSlaytlar">${slaytlar.map((x, i) => `<article class="vSlayt ton-${x.ton}" id="vs-${i}" role="tabpanel" aria-roledescription="slide" aria-label="${i + 1} / ${slaytlar.length}: ${x.etiket}">
    <div class="vMetin">${x.metin}</div><div class="vResim${x.mino ? ' mino' : ''}${x.ikonResim ? ' ikonlu' : ''}${x.tekKapak ? ' tekKapak' : ''}">${x.kapaklar ? `<div class="vKapaklar">${x.kapaklar.map(k => `<img src="${k}" alt="">`).join('')}</div>` : `<img src="${x.resim}" alt="" ${i ? 'loading="lazy"' : ''}>`}</div></article>`).join('')}</div>
   <div class="vNav"><div class="vNoktalar" role="tablist" aria-label="Announcement slides">${slaytlar.map((x, i) => `<button type="button" role="tab" aria-controls="vs-${i}" aria-label="${x.etiket}" title="${x.etiket}"><i></i></button>`).join('')}</div><button type="button" class="vOk" data-adim="-1" aria-label="Previous">‹</button><button type="button" class="vOk" data-adim="1" aria-label="Next">›</button></div></section>`;
}
function vitrinBagla(kok) {
  clearTimeout(vitrinZaman); if (!kok) return;
  const sl = [...kok.querySelectorAll('.vSlayt')], nk = [...kok.querySelectorAll('.vNoktalar button')], azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let su = 0, dur = false;
  const say = () => { clearTimeout(vitrinZaman); nk.forEach(d => d.classList.remove('dolu')); const calis = kok.isConnected && !dur && !azHareket && !document.hidden;
    kok.classList.toggle('calisiyor', calis); if (!calis) return; void nk[su].offsetWidth; nk[su].classList.add('dolu'); vitrinZaman = setTimeout(() => { if (kok.isConnected) goster(su + 1); }, 4500); };
  const goster = (i, odak) => { su = (i + sl.length) % sl.length; sl.forEach((x, k) => { x.classList.toggle('on', k === su); x.classList.toggle('sol', k < su); x.inert = k !== su; });
    nk.forEach((d, k) => { d.setAttribute('aria-selected', String(k === su)); d.tabIndex = k === su ? 0 : -1; }); if (odak) nk[su].focus(); say(); };
  nk.forEach((d, i) => d.onclick = () => goster(i));
  kok.querySelector('.vNoktalar').onkeydown = e => { const k = {ArrowRight: 1, ArrowLeft: -1}[e.key]; if (k) { e.preventDefault(); goster(su + k, true); } };
  kok.querySelectorAll('.vOk').forEach(b => b.onclick = () => goster(su + Number(b.dataset.adim)));
  kok.onmouseenter = kok.onfocusin = () => { dur = true; say(); };
  kok.onmouseleave = () => { dur = kok.contains(document.activeElement); say(); };
  kok.onfocusout = e => { if (!kok.contains(e.relatedTarget)) { dur = kok.matches(':hover'); say(); } };
  kok.vitrinSay = say;
  goster(0);
}
document.addEventListener('visibilitychange', () => { const k = document.querySelector('.vitrin'); if (k && k.vitrinSay) k.vitrinSay(); });
// Küçük fidan kartı: tıklanınca Profil > Fidanım açılır.
function fidanMini(s) {
  const damlalar = Array.from({length: s.goal}, (_, i) => `<img class="${i < s.todayDrops ? 'dolu' : ''}" src="${IK('damla')}" alt="">`).join('');
  return `<a class="fidanMini" href="#profil/fidan" aria-label="My reading sapling: ${s.stage.name}. Go to My Sapling"><div class="fidanCizim">${plantSVG(s)}</div><div><p class="ust">My reading sapling</p><b>${s.stage.name}</b><span class="damlalar">${damlalar}</span><small>${ikon('alev')}${s.streak ? s.streak + '-day streak' : 'Start today'} · ${s.drops} ${cogul(s.drops, 'drop')}</small><em class="fidanGit">Go to My Sapling →</em></div></a>`;
}

/* ---------- ekranlar ---------- */
function anaSayfa() {
  const s = Journal.summary(), h = hesap(), b = sonKitap(), sayfa = Math.min(b.sayfalar.length - 1, Journal.bookmark(b.id));
  const oku = okunan(b.id), top = b.sayfalar.length, kalan = Math.max(0, s.goal - s.todayDrops), [soz, kim] = gununSozu();
  const yeniKitap = KITAPLAR.filter(k => k.ozgun), oyun = OYUNLAR[(new Date().getDate()) % OYUNLAR.length];
  const yakin = rozetler(s).filter(r => !r.on).sort((x, y) => (x.ist - x.var) - (y.ist - y.var))[0];
  const slaytlar = [
    {etiket: 'Pick up where you left off', ton: 'lavanta', resim: b.kapak, tekKapak: true, metin: `<p class="ust">Pick up where you left off · Grade ${aktifSinif()}</p><h2>${esc(b.ad)}</h2><p>${esc(b.sayfalar[sayfa].baslik || b.alt || '')}${b.sayfalar[sayfa].baslik ? ' · ' : ''}Page ${sayfa + 1} · ${oku}/${top} pages read</p><div class="cubuk"><i style="width:${oku / top * 100}%"></i></div><div class="dugmeler"><a class="dugme ana" href="#oku/${b.id}/${sayfa}">Keep reading →</a><a class="dugme" href="#patika/${b.id}">See My Trail</a></div>`},
    {etiket: 'New books', ton: 'altin', kapaklar: yeniKitap.map(k => k.kapak), metin: `<p class="ust">News · Just arrived on your shelf</p><h2>${yeniKitap.map(k => esc(k.ad)).join(' and ')}</h2><p>New Readmino stories are in your library. Treasure Island is up next!</p><a class="dugme ana" href="#kitaplar">See the books →</a>`},
    {etiket: 'Quote of the day', ton: 'nane', resim: '../img/mino_selam.webp', mino: true, metin: `<p class="ust">Quote of the day</p><blockquote><p>“${esc(soz)}”</p><footer>${esc(kim)}</footer></blockquote>`},
    {etiket: 'Game of the day', ton: 'petrol', resim: IK('yapboz'), ikonResim: true, metin: `<p class="ust">Game of the day</p><h2>${esc(oyun.ad)}</h2><p>Games that help you understand what you read are in the Game Cabinet. Every game is 2 drops!</p><a class="dugme ana" href="#oyunlar">Open the Game Cabinet →</a>`},
    ...(yakin ? [{etiket: 'Badge', ton: 'mandalina', resim: IK(yakin.ik), ikonResim: true, metin: `<p class="ust">Almost there</p><h2>${esc(yakin.ad)}</h2><p>${esc(yakin.ipucu)} (${yakin.var}/${yakin.ist}).</p><a class="dugme ana" href="#profil/rozet">See My Badges →</a>`}] : [])];
  const raf = [...siraliKitaplar().map(k => { const r = okunan(k.id), t = k.sayfalar.length; return `<a class="rafKitap${uygun(k) ? '' : ' digerSinif'}" href="#kitap/${k.id}"><img src="${k.kapak}" alt=""><span><b>${esc(k.ad)}</b><small>${r ? r + '/' + t + ' pages' : sinifYazi(k)}</small></span><i style="--p:${r / t * 100}%"></i></a>`; }),
    ...YAKINDA.map(([id, ad]) => `<a class="rafKitap yakinda" href="#kitaplar"><img src="${KAPAK(id)}" alt=""><span><b>${ad}</b><small>Coming soon</small></span></a>`)].join('');
  ekran.innerHTML = `<div class="bas"><div><h1>Hello, ${esc(h.ad)}!</h1><p class="alt">${kalan ? `Read ${kalan} more ${cogul(kalan, 'drop')} today and your sapling will grow.` : "Today's goal is done, your sapling is so happy!"}</p></div></div>
  <div class="ogrAna">${vitrin(slaytlar)}${fidanMini(s)}
   <section class="raf"><div class="bolumBas"><h2>My Shelf</h2><a href="#kitaplar">All books →</a></div><div class="rafSira">${raf}</div></section></div>`;
  vitrinBagla($('.vitrin'));
}

let rafFiltre = 'sinif';
function kitaplarEkrani() {
  const f = rafFiltre, g = aktifSinif();
  const list = f === 'sinif' ? sinifKitaplari() : f === 'ozgun' ? KITAPLAR.filter(b => b.ozgun) : siraliKitaplar();
  const kart = b => { const r = okunan(b.id), t = b.sayfalar.length; return `<li><a class="kitapKart${uygun(b) ? '' : ' digerSinif'}" href="#kitap/${b.id}"><span class="kapak"><img src="${b.kapak}" alt="">${b.ozgun ? '<em class="yeniEtiket">New</em>' : ''}${uygun(b) ? '' : `<em class="sinifEtiket">${sinifYazi(b)}</em>`}</span><b>${esc(b.ad)}</b><small>${b.ozgun ? 'Readmino original' : esc(b.yazar)} · ${sinifYazi(b)}</small><span class="mini"><i style="width:${r / t * 100}%"></i></span></a></li>`; };
  ekran.innerHTML = `<div class="bas"><div><h1>Books</h1><p class="alt">${f === 'sinif' ? `Books we picked for Grade ${g}.` : 'The whole shelf. Books for your grade come first.'}</p></div></div>
  <div class="cipler" role="group" aria-label="Shelf">${[['sinif', `My Grade ${g} books`], ['hepsi', 'Whole shelf'], ['ozgun', 'Readmino originals']].map(([k, a]) => `<button type="button" data-f="${k}" aria-pressed="${k === f}">${a}</button>`).join('')}</div>
  <ul class="kitapIzgara">${list.map(kart).join('')}${f === 'hepsi' ? YAKINDA.map(([id, ad]) => `<li><div class="kitapKart yakinda"><span class="kapak"><img src="${KAPAK(id)}" alt=""><em>Coming soon</em></span><b>${ad}</b><small>On its way to the shelf</small></div></li>`).join('') : ''}</ul>`;
  $$('[data-f]').forEach(d => d.onclick = () => { rafFiltre = d.dataset.f; kitaplarEkrani(); });
}

function kitapEkrani(id) {
  const b = kitap(id), r = okunan(b.id), t = b.sayfalar.length, sayfa = Math.min(t - 1, Journal.bookmark(b.id)), ds = duraklar(b);
  ekran.innerHTML = `<div class="bas"><div><a class="geri" href="#kitaplar">← Books</a></div></div>
  <article class="kitapDetay"><img class="buyukKapak" src="${b.kapak}" alt=""><div class="detayMetin"><p class="ust">${sinifYazi(b)} · ${b.ozgun ? 'A Readmino original story' : esc(b.yazar)}</p><h1>${esc(b.ad)}</h1>
   <p class="aciklama">${esc(b.aciklama || b.alt || '')}${b.tema ? `<small>${esc(b.tema)}</small>` : ''}</p>
   <div class="cubuk"><i style="width:${r / t * 100}%"></i></div><small>${r}/${t} pages · ${ds.filter(d => d.bitti).length}/${ds.length} stops</small>
   <div class="dugmeler"><a class="dugme ana" href="#patika/${b.id}">Go along the trail →</a><a class="dugme" href="#oku/${b.id}/${sayfa}">${r ? 'Read from where I stopped' : 'Start reading now'}</a></div>
   <h2>Every stop on the trail</h2><div class="adimSerit">${ADIMLAR.map((a, i) => `<span>${ikon(a.ik)}<b>${a.ad}</b><small>${a.faz}</small></span>${i < 4 ? '<i aria-hidden="true">›</i>' : ''}`).join('')}</div></div></article>`;
}

let yaziBoyu = Number(yerel('okumino-web-yazi')) || 0;
function okuyucu(id, i) {
  const b = kitap(id), t = b.sayfalar.length; i = Math.max(0, Math.min(t - 1, Number(i) || 0));
  const p = b.sayfalar[i], durak = duraklar(b).find(d => i >= d.bas && i <= d.son);
  const resim = p.gorsel || [...b.sayfalar.slice(0, i + 1)].reverse().find(x => x.gorsel)?.gorsel || b.kapak;
  yerel('okumino-web-secili', b.id); Journal.bookmark(b.id, i);
  const yeni = Journal.record(b.id, 'page', 'p' + i, p.baslik || `${b.ad} · page ${i + 1}`);
  const durakSonu = i === durak.son;
  const ileri = durakSonu && i < t - 1 ? `<a class="dugme ana" href="#oku/${b.id}/${i + 1}">Next →</a>` : i === t - 1 ? `<a class="dugme ana" href="#patika/${b.id}">Back to My Trail →</a>` : `<a class="dugme ana" href="#oku/${b.id}/${i + 1}">Next →</a>`;
  ekran.innerHTML = `<div class="bas"><div><a class="geri" href="#kitap/${b.id}">← ${esc(b.ad)}</a></div><div class="okuAraclar" role="group" aria-label="Text size"><button type="button" data-y="-1" aria-label="Make text smaller">A−</button><button type="button" data-y="1" aria-label="Make text bigger">A+</button></div></div>
  <article class="okuyucu" style="--yazi:${yaziBoyu}"><div class="sayfaResim"><img src="${resim}" alt=""></div><div class="sayfaMetin"><p class="ust">${esc(b.ad)} · Stop ${durak.no} · Page ${i + 1}/${t}</p>${p.baslik ? `<h2>${esc(p.baslik)}</h2>` : ''}<div class="metin">${p.satirlar.map(l => `<p>${esc(l)}</p>`).join('')}</div>
   <div class="sayfaAlt"><a class="dugme${i ? '' : ' pasif'}" ${i ? `href="#oku/${b.id}/${i - 1}"` : 'aria-disabled="true"'}>← Previous</a><div class="noktalar" aria-hidden="true">${b.sayfalar.map((_, k) => `<i class="${k === i ? 'su' : okunduMu(b.id, k) ? 'ok' : ''}${k >= durak.bas && k <= durak.son ? ' durakta' : ''}"></i>`).join('')}</div>${ileri}</div></div></article>`;
  $$('[data-y]').forEach(d => d.onclick = () => { yaziBoyu = Math.max(-1, Math.min(3, yaziBoyu + Number(d.dataset.y))); yerel('okumino-web-yazi', yaziBoyu); $('.okuyucu').style.setProperty('--yazi', yaziBoyu); });
  if (yeni) damlaKazan(1, 'You read a page');
}
function bittiEkrani(id) {
  const b = kitap(id);
  ekran.innerHTML = `<article class="kutlama"><img src="../img/mino_selam.webp" alt=""><h1>${esc(b.ad)} trail complete!</h1><p>You read ${okunan(b.id)}/${b.sayfalar.length} pages and finished the activities at every stop. One more stamp for your reading passport!</p>
   <div class="dugmeler"><a class="dugme" href="#kitaplar">Pick a new book</a><a class="dugme ana" href="#oyunlar">Go to the Game Cabinet →</a></div></article>`;
}

// Patikam: Bilgin'in patika sistemi (dev.bilgin.app/patikalar) Okumino'ya uyarlandı.
// Harita: başlık + çipler, koyu şerit, çapraz inen 3D adımlar, Final, sağda özet.
// Durak oynatıcısı: tam ekran; üstte etkinlik numaraları, ilerleme, "Okuma Yolculuğum" paneli.
function patikaEkrani(id) {
  // BİLGİN web'deki Patikam kartı gibi sade: tek kart, kıvrılan yol, etiketli duraklar, altta devam şeridi.
  const b = id ? kitap(id) : sonKitap(), ds = duraklar(b), sira = ds.findIndex(d => !d.bitti), hepsi = sira < 0;
  yerel('okumino-web-secili', b.id);
  const acik = k => k === 0 || ds[k - 1].bitti, biten = ds.filter(x => x.bitti).length, n = ds.length + 1;
  const nokta = k => [k % 2 ? 66 : 32, 13 + k * 80 / (n - 1)];
  const yol = Array.from({length: n}, (_, k) => nokta(k)).map(([x, y], k, a) => k ? `C${a[k - 1][0]} ${(a[k - 1][1] + y) / 2} ${x} ${(a[k - 1][1] + y) / 2} ${x} ${y}` : `M${x} ${y}`).join(' ');
  const hedef = d => { const ilk = d.adim.findIndex(x => !x); return `#durak/${b.id}/${d.no}/${ADIMLAR[Math.max(0, ilk)].k}`; };
  const duraklarHtml = ds.map((d, k) => { const [x, y] = nokta(k), durum = d.bitti ? 'bitti' : acik(k) ? 'acik' : 'kilit', tamam = d.adim.filter(Boolean).length;
    return `<div class="izDurak ${durum} ${x > 50 ? 'bati' : 'dogu'}" style="--x:${x}%;--y:${y}%">
      <a class="izDugum" ${durum !== 'kilit' ? `href="${hedef(d)}"` : 'aria-disabled="true"'} aria-label="Stop ${d.no}: ${esc(d.ad)}, ${durum === 'kilit' ? 'locked' : durum === 'bitti' ? 'completed' : tamam + '/5 steps'}">${durum === 'kilit' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' : `<b>${d.no}</b>`}${durum === 'bitti' ? '<i class="izTik" aria-hidden="true">✓</i>' : ''}</a>
      <span class="izEtiket"><strong>${esc(d.ad)}</strong><small>${durum === 'bitti' ? 'Completed' : durum === 'kilit' ? 'Locked' : tamam ? tamam + '/5 steps' : 'Pages ' + (d.bas + 1) + '–' + (d.son + 1)}</small></span>
      ${k === sira ? `<span class="izBayrak">${tamam ? 'Continue' : 'Start'}</span><img class="izMino" src="../img/mino_selam.webp" alt="">` : ''}</div>`; }).join('');
  const [sx, sy] = nokta(n - 1), sonraki = hepsi ? null : ds[sira];
  ekran.innerHTML = `<div class="bas"><div><h1>My Trail</h1></div><a class="izKitapSec" href="#kitaplar">Pick a book ↗</a></div>
  <section class="izKart"><div class="izBaslik"><div><p class="ust">Book trail · Grade ${aktifSinif()}</p><h2>${esc(b.ad)}</h2><p class="izIpucu">At every stop, first predict, then read, then play and write.</p></div><span class="izSkor" aria-label="${biten} ${cogul(biten, 'stop')} completed">${biten}/${ds.length}</span></div>
   <div class="izArazi"><svg class="izYol" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${yol}"/></svg>${duraklarHtml}
    <div class="izDurak final ${hepsi ? 'bitti' : 'kilit'} ${sx > 50 ? 'bati' : 'dogu'}" style="--x:${sx}%;--y:${sy}%"><a class="izDugum" ${hepsi ? `href="#bitti/${b.id}"` : 'aria-disabled="true"'} aria-label="Treasure chest">${ikon('sandik')}</a><span class="izEtiket"><strong>Treasure chest</strong><small>${hepsi ? 'Unlocked!' : 'When all stops are done'}</small></span></div></div>
   <a class="izDevam" href="${hepsi ? `#bitti/${b.id}` : hedef(sonraki)}"><span>${hepsi ? 'Trail complete! Open the chest' : sonraki.adim.some(Boolean) ? `Pick up where you left off at stop ${sonraki.no}` : sira ? `Start stop ${sonraki.no}` : 'Start the first stop'}</span><b aria-hidden="true">→</b></a></section>`;
}

/* ---------- durak oynatıcısı (Bilgin adım ekranının Okumino'su) ---------- */
let okuSayfa = {};
function durakAdim(id, no, adim) {
  const b = kitap(id), ds = duraklar(b), d = ds[Number(no) - 1], c = d && d.icerik;
  if (!d || !c || (d.no > 1 && !ds[d.no - 2].bitti)) { location.hash = `patika/${b.id}`; return; }
  const ai = Math.max(0, ADIMLAR.findIndex(x => x.k === adim)), a = ADIMLAR[ai], sonraki = ADIMLAR[ai + 1];
  const acikMi = k => k === 0 || ds[k - 1].bitti;
  const tamamla = mesaj => { const yeni = Journal.record(b.id, 'task', `${d.id}-${a.k}`, `${a.ad} · ${b.ad} stop ${d.no}`); if (yeni) damlaKazan(2, mesaj); };
  const ileriLink = sonraki ? `#durak/${b.id}/${d.no}/${sonraki.k}` : (ds[d.no] ? `#durak/${b.id}/${d.no + 1}/tahmin` : `#patika/${b.id}`);
  const ileriAd = sonraki ? `${sonraki.ad} →` : ds[d.no] ? `Go to stop ${d.no + 1} →` : 'Back to the trail map →';
  const ileri = `<a class="dugme turuncu" href="${ileriLink}">${ileriAd}</a>`;
  const biten = ds.filter(x => x.bitti).length;
  document.body.classList.add('tamEkran');
  ekran.innerHTML = `<div class="oyna">
   <header class="oyUst"><a class="oyKapat" href="#patika/${b.id}" aria-label="Back to the trail map">✕</a><span class="oyCip">Activities ${d.adim.filter(Boolean).length}/5 <i>✦</i></span>
    <ol class="oyNoktalar">${ADIMLAR.map((x, i) => `<li><a href="#durak/${b.id}/${d.no}/${x.k}" class="${d.adim[i] ? 'bitti' : ''}${i === ai ? ' su' : ''}" title="${x.ad}" aria-label="${i + 1}. ${x.ad}${d.adim[i] ? ', done' : ''}">${i + 1}</a></li>`).join('')}</ol>
    <div class="oyBaslik"><div><b>Stop ${d.no}: ${esc(d.ad)}</b><span class="oyRozet">${a.ad}</span><span class="oyDamla">${ikon('damla')}${a.k === 'oku' ? '+1 / page' : '+2 drops'}</span></div><div class="oyCubuk"><i style="width:${(biten + d.adim.filter(Boolean).length / 5) / ds.length * 100}%"></i></div><small>Trail ${biten} / ${ds.length}</small></div>
    <button type="button" class="oyYolculuk">${ikon('kitap')}My Reading Journey</button></header>
   <section class="oyGovde"><div class="oySekme" role="tablist"><button type="button" role="tab" aria-selected="true" data-s="e">${a.k === 'oku' ? 'Read' : 'Activity'}</button><button type="button" role="tab" aria-selected="false" data-s="i">Hint</button></div><div class="oyIcerik"></div><div class="oyIpucu" hidden></div></section>
   <aside class="yolculuk" hidden><div class="yBas"><div><p class="ust">My Reading Journey</p><h2>${esc(b.ad)}</h2></div><button type="button" class="oyKapat" data-kapat aria-label="Close">✕</button></div>
    <div class="yIlerleme"><span class="cubuk"><i style="width:${biten / ds.length * 100}%"></i></span><small>${biten}/${ds.length} stops</small></div>
    <ol class="yListe">${ds.map((x, k) => { const durum = x.bitti ? 'bitti' : acikMi(k) ? 'acik' : 'kilit', su = x.no === d.no;
      return `<li class="${durum}${su ? ' su' : ''}"><div class="ySatir"><span class="yNo">${x.bitti ? '✓' : durum === 'kilit' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>' : x.no}</span><span><b>Stop ${x.no}: ${esc(x.ad)}</b><small>${su ? 'You are here' : durum === 'kilit' ? 'Opens when you finish the stop before' : durum === 'bitti' ? 'Completed' : 'Pages ' + (x.bas + 1) + '–' + (x.son + 1)}</small></span>${durum !== 'kilit' && !su ? `<a href="#durak/${b.id}/${x.no}/tahmin" aria-label="Go to stop ${x.no}">→</a>` : ''}</div>
       ${su ? `<ol class="yAdimlar">${ADIMLAR.map((y, i) => `<li class="${i === ai ? 'su' : ''}${x.adim[i] ? ' bitti' : ''}"><a href="#durak/${b.id}/${x.no}/${y.k}"><span>${x.adim[i] ? '✓' : i + 1}</span>${y.ad}<em>${y.faz}</em></a></li>`).join('')}</ol>` : ''}</li>`; }).join('')}</ol>
    <a class="yDon" href="#patika/${b.id}">Back to the trail map →</a></aside><div class="yPerde" hidden></div></div>`;
  const alan = $('.oyIcerik'), ipucu = $('.oyIpucu'), panel = $('.yolculuk'), perde = $('.yPerde');
  const paneliAc = ac => { panel.hidden = !ac; perde.hidden = !ac; };
  $('.oyYolculuk').onclick = () => paneliAc(true); $('[data-kapat]').onclick = () => paneliAc(false); perde.onclick = () => paneliAc(false);
  $$('.oySekme button').forEach(t => t.onclick = () => { $$('.oySekme button').forEach(x => x.setAttribute('aria-selected', String(x === t))); alan.hidden = t.dataset.s !== 'e'; ipucu.hidden = t.dataset.s !== 'i'; });
  const sayfalar = b.sayfalar.slice(d.bas, d.son + 1), metinler = sayfalar.map(p => p.satirlar.join(' '));
  const kelimeCumle = w => { for (const m of metinler) { const c2 = (m.match(/[^.!?…]+[.!?…]+/g) || [m]).find(x => x.toLocaleLowerCase('en').includes(w.toLocaleLowerCase('en').slice(0, Math.max(4, w.length - 3)))); if (c2) return c2.trim(); } return ''; };
  ipucu.innerHTML = `<div class="ipucuKart">${ikon('dusunce')}<div>${{
    tahmin: `<p>Look at the name of the stop: <b>${esc(d.ad)}</b>. Think about the book cover and what happened at the stop before. There are no wrong guesses!</p>`,
    oku: `<p>If the text looks small, make it bigger with <b>A+</b>. If a word is tricky, you will find its meaning in the word game in the next step.</p>`,
    kelime: `<p>The words appear in these sentences:</p><ul>${c.k.map(([w]) => `<li><b>${esc(w)}</b>: ${esc(kelimeCumle(w) || '—')}</li>`).join('')}</ul>`,
    anla: `<p>Remember what happened at this stop:</p><ul>${sayfalar.map(p => `<li>${esc(p.baslik ? p.baslik + ': ' : '')}${esc((p.satirlar.join(' ').match(/^[^.!?…]+[.!?…]/) || [''])[0])}</li>`).join('')}</ul><a class="metinDugme" href="#durak/${b.id}/${d.no}/oku">Read the pages again</a>`,
    yaz: `<p>Start with a sentence: <i>“If I were…”</i> or <i>“I think…”</i>. Add the reason why and your sentence gets stronger.</p>`}[a.k]}</div></div>`;
  const tahminKey = `okumino-web-tahmin/${b.id}/${d.id}`;
  if (a.k === 'oku') {
    const i0 = Math.min(sayfalar.length - 1, okuSayfa[d.id] || 0), i = d.bas + i0, p = b.sayfalar[i];
    const resim = p.gorsel || [...b.sayfalar.slice(0, i + 1)].reverse().find(x => x.gorsel)?.gorsel || b.kapak;
    Journal.bookmark(b.id, i); const yeni = Journal.record(b.id, 'page', 'p' + i, p.baslik || `${b.ad} · page ${i + 1}`);
    const son = i0 === sayfalar.length - 1;
    alan.innerHTML = `<article class="okuyucu gomulu" style="--yazi:${yaziBoyu}"><div class="sayfaResim"><img src="${resim}" alt=""></div><div class="sayfaMetin"><div class="okuUst"><p class="ust">Page ${i + 1} · ${i0 + 1}/${sayfalar.length} at this stop</p><span class="okuAraclar"><button type="button" data-y="-1" aria-label="Make text smaller">A−</button><button type="button" data-y="1" aria-label="Make text bigger">A+</button></span></div>${p.baslik ? `<h2>${esc(p.baslik)}</h2>` : ''}<div class="metin">${p.satirlar.map(l => `<p>${esc(l)}</p>`).join('')}</div>
      <div class="sayfaAlt"><button type="button" class="dugme" data-o="-1" ${i0 ? '' : 'disabled'}>← Previous</button><div class="noktalar">${sayfalar.map((_, k) => `<i class="${k === i0 ? 'su' : okunduMu(b.id, d.bas + k) ? 'ok' : ''}"></i>`).join('')}</div>${son ? ileri : '<button type="button" class="dugme turuncu" data-o="1">Next page →</button>'}</div></div></article>`;
    $$('[data-o]', alan).forEach(x => x.onclick = () => { okuSayfa[d.id] = i0 + Number(x.dataset.o); durakAdim(id, no, adim); });
    $$('[data-y]', alan).forEach(x => x.onclick = () => { yaziBoyu = Math.max(-1, Math.min(3, yaziBoyu + Number(x.dataset.y))); yerel('okumino-web-yazi', yaziBoyu); $('.okuyucu').style.setProperty('--yazi', yaziBoyu); });
    if (yeni) damlaKazan(1, 'You read a page');
  } else if (a.k === 'tahmin') {
    const [soru, sec, dogru] = c.t, onceki = yerel(tahminKey), okundu = d.adim[1];
    alan.innerHTML = `<div class="oyKart"><p class="ipucu">Think before you read. There are no wrong guesses; we will find out as we read.</p><h2 class="soruMetni">${esc(soru)}</h2><div class="secenekler">${karistir(sec).map(x => `<button type="button" class="secenek${x === onceki ? ' secildi' : ''}">${esc(x)}</button>`).join('')}</div><div class="geriBildirim" role="status" aria-live="polite"></div></div>`;
    $$('.secenek', alan).forEach(btn => btn.onclick = () => { $$('.secenek', alan).forEach(x => x.classList.remove('secildi')); btn.classList.add('secildi'); yerel(tahminKey, btn.textContent); tamamla('You made your prediction');
      $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>${okundu ? (btn.textContent === sec[dogru] ? 'Your guess matches the story!' : `In the story: <b>${esc(sec[dogru])}</b>. Guessing is part of reading too.`) : "I wrote down your guess! Now let's read and check."}</p>${ileri}`; });
  } else if (a.k === 'kelime') {
    const tahmin = yerel(tahminKey), sol = karistir(c.k.map((x, i) => [x[0], i])), sag = karistir(c.k.map((x, i) => [x[1], i]));
    let secili = null; const es = new Set();
    alan.innerHTML = `<div class="oyKart">${tahmin && d.adim[1] ? `<p class="tahminSonuc">${tahmin === c.t[1][c.t[2]] ? '✓ Your guess was right: ' : 'Your guess: ' + esc(tahmin) + ' · In the story: '}<b>${esc(c.t[1][c.t[2]])}</b></p>` : ''}<h2 class="soruMetni">Tap a word first, then tap its meaning.</h2>
      <div class="eslestir"><div>${sol.map(([w, i]) => `<button type="button" class="secenek kelimeD" data-i="${i}">${esc(w)}</button>`).join('')}</div><div>${sag.map(([m, i]) => `<button type="button" class="secenek anlamD" data-i="${i}">${esc(m)}</button>`).join('')}</div></div><div class="geriBildirim" role="status" aria-live="polite"></div></div>`;
    const fb = $('.geriBildirim', alan);
    $$('.kelimeD', alan).forEach(x => x.onclick = () => { if (es.has(x.dataset.i)) return; $$('.kelimeD', alan).forEach(y => y.classList.remove('secildi')); x.classList.add('secildi'); secili = x.dataset.i; fb.innerHTML = ''; });
    $$('.anlamD', alan).forEach(x => x.onclick = () => { if (secili === null) { fb.innerHTML = '<p>First pick a word on the left.</p>'; return; }
      if (x.dataset.i === secili) { es.add(secili); $$(`[data-i="${secili}"]`, alan).forEach(y => { y.classList.remove('secildi'); y.classList.add('dogru'); y.disabled = true; }); secili = null;
        fb.innerHTML = es.size === 3 ? `<img src="../img/mino_selam.webp" alt=""><p>Great! You found all three words.</p>${ileri}` : '<p>Correct match!</p>'; if (es.size === 3) tamamla('You finished the word game'); }
      else { x.classList.add('yanlis'); setTimeout(() => x.classList.remove('yanlis'), 450); fb.innerHTML = '<p>Try again. You can look at the Hint tab.</p>'; } });
  } else if (a.k === 'anla') {
    const [soru, sec, dogru] = c.a;
    alan.innerHTML = `<div class="oyKart"><h2 class="soruMetni">${esc(soru)}</h2><div class="secenekler">${karistir(sec).map(x => `<button type="button" class="secenek">${esc(x)}</button>`).join('')}</div><div class="geriBildirim" role="status" aria-live="polite"></div></div>`;
    $$('.secenek', alan).forEach(btn => btn.onclick = () => {
      if (btn.textContent === sec[dogru]) { btn.classList.add('dogru'); $$('.secenek', alan).forEach(x => x.disabled = true); tamamla('You understood what you read'); $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>Correct! You read very carefully.</p>${ileri}`; }
      else { btn.classList.add('yanlis'); btn.disabled = true; $('.geriBildirim', alan).innerHTML = '<p>Think back to the story and try again. The Hint tab can help.</p>'; } });
  } else {
    const key = `okumino-web-yaz/${b.id}/${d.id}`;
    alan.innerHTML = `<div class="oyKart"><h2 class="soruMetni">${esc(c.y)}</h2><label class="yazAlani"><span class="gizli">Your answer</span><textarea rows="4" maxlength="400" placeholder="Write here…">${esc(yerel(key) || '')}</textarea></label><p class="ipucu">What you write stays only on this device.</p><div class="geriBildirim" role="status" aria-live="polite"><button type="button" class="dugme turuncu" data-kaydet>Send →</button></div></div>`;
    $('[data-kaydet]', alan).onclick = () => { const v = $('textarea', alan).value.trim();
      if (v.split(/\s+/).filter(Boolean).length < 3) { $('.geriBildirim', alan).insertAdjacentHTML('afterbegin', '<p class="kisa">Write a sentence with at least three words.</p>'); return; }
      yerel(key, v); tamamla('You wrote your own sentence'); $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>I saved your sentence.${duraklar(b)[d.no - 1].bitti ? ' This stop is done!' : ''}</p>${ileri}`; };
  }
}

/* ---------- okuma pasaportu (BİLGİN pasaport kitapçığının Okumino'su) ---------- */
// Solda okurun kimliği, sağda kitap damgaları. Bir kitabın bütün durakları bitince o kitabın
// damgası basılır; hiç damga yoksa bir ÖRNEK damga gösterilir. Öğrenci ve öğretmen ortak.
function kitapDamgalari() {
  const zaman = id => Math.max(0, ...Journal.entries().filter(e => e.book === id).map(e => e.time || 0));
  return KITAPLAR.map(b => ({b, ds: duraklar(b)})).filter(x => x.ds.length && x.ds.every(d => d.bitti))
    .map(x => ({ad: x.b.ad, kapak: x.b.kapak, sinif: aralik(x.b), tarih: zaman(x.b.id)})).sort((a, b) => a.tarih - b.tarih);
}
function pasaportHtml(s, h) {
  const dm = kitapDamgalari(), bitenDurak = KITAPLAR.reduce((t, b) => t + duraklar(b).filter(d => d.bitti).length, 0);
  const damga = (e, i, ornek) => `<li class="damga ton${i % 4}${ornek ? ' ornek' : ''}" style="--r:${[-8, 5, -3, 9, -6, 3, -10, 6][i % 8]}deg" title="${esc(e.ad)}"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="dy${i}" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs><circle cx="60" cy="60" r="56" class="dDis"/><circle cx="60" cy="60" r="37" class="dIc"/><text><textPath href="#dy${i}" startOffset="2%">READMINO · GRADE ${e.sinif} · BOOK STAMP ·</textPath></text></svg><img src="${e.kapak}" alt=""><b>${esc(e.ad)}</b><small>${e.tarih ? new Date(e.tarih).toLocaleDateString('en-US') : 'Trail complete'}</small>${ornek ? '<em>SAMPLE</em>' : ''}</li>`;
  const ornekKitap = KITAPLAR.find(b => b.id === 'heidi') || KITAPLAR[0];
  const liste = dm.length ? dm.map((e, i) => damga(e, i)).join('') : damga({ad: ornekKitap.ad, kapak: ornekKitap.kapak, sinif: aralik(ornekKitap), tarih: Date.now()}, 0, true);
  const yuva = Math.max(8, dm.length + (dm.length ? 0 : 1));
  return `<article class="pasaport"><section class="pasSol"><p class="pasBaslik">Readmino · Reading passport</p><img class="pasFoto" src="${avatarSrc(h)}" alt="">
    <dl><dt>Full name</dt><dd data-etiket="Full name">${esc(h.ad + ' ' + h.soyad)}</dd><dt>${OG ? 'Role' : 'Grade'}</dt><dd data-etiket="${OG ? 'Role' : 'Grade'}">${OG ? esc(h.brans) : 'Grade ' + h.sinif}</dd><dt>Book stamps</dt><dd data-etiket="Book stamps">${dm.length}</dd><dt>Stops finished</dt><dd data-etiket="Stops finished">${bitenDurak}</dd></dl>
    <p class="pasNot">${dm.length ? "When you finish every stop of a book, that book's stamp goes in your passport." : 'Finish every stop of a book and your first stamp will go right here.'}</p>${dm.length ? '' : '<a class="dugme ana" href="#patika">Go to My Trail →</a>'}</section>
   <section class="pasSag"><p class="pasBaslik">My book stamps <span>${dm.length} ${cogul(dm.length, 'stamp')} · ${s.drops} ${cogul(s.drops, 'drop')}</span></p><ul class="damgalar">${liste}${Array.from({length: yuva - (dm.length || 1)}, () => '<li class="damga bos" aria-hidden="true"><span>?</span></li>').join('')}</ul></section></article>`;
}

let profilSekme = 'fidan', hesapBolme = 'bilgi';
function profilEkrani(sekme) {
  profilSekme = ['fidan', 'pasaport', 'rozet', 'hesap'].includes(sekme) ? sekme : 'fidan';
  const s = Journal.summary(), h = hesap(), rz = rozetler(s);
  const ust = `<div class="bas"><div class="profilBas"><img class="avatarSimdi" src="${avatarSrc(h)}" alt=""><div><h1>${esc(h.ad + ' ' + h.soyad)}</h1><p class="alt">${OG ? esc(h.brans) : 'Grade ' + h.sinif} · ${s.drops} ${cogul(s.drops, 'drop')} · ${rz.filter(r => r.on).length} ${cogul(rz.filter(r => r.on).length, 'badge')}</p></div></div></div>
  <div class="sekmeler" role="tablist">${[['fidan', 'fidan', 'My Sapling'], ['pasaport', 'defter', 'My Passport'], ['rozet', 'madalya', 'My Badges'], ['hesap', 'el', 'My Account']].map(([k, ik, a]) => `<a href="#profil/${k}" role="tab" aria-selected="${k === profilSekme}">${ikon(ik)}${a}</a>`).join('')}</div>`;
  if (profilSekme === 'fidan') {
    const max = Math.max(s.goal, ...s.week.map(w => w.drops)), gun = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    ekran.innerHTML = ust + `<div class="profilIzgara"><article class="fidanBuyuk"><div class="fidanCizim">${plantSVG(s)}</div><div><p class="ust">My reading sapling</p><h2>${s.stage.name}</h2>
      <div class="asamalar">${s.stages.map((a, k) => `<i class="${k <= s.level ? 'on' : ''}" title="${a.name}"></i>`).join('')}</div><p>${s.next ? `<b>${s.next.at - s.drops} more ${cogul(s.next.at - s.drops, 'drop')}</b> until it becomes a <b>${s.next.name}</b>.` : 'Your sapling has grown fruit!'}</p><small>${s.drops} ${cogul(s.drops, 'drop')} in total</small></div></article>
     <div class="sayilar">${[['kitap', s.pages, cogul(s.pages, 'page')], ['yapboz', s.tasks, 'activities & games'], ['alev', s.streak, 'day streak'], ['yildiz', s.activeDays, cogul(s.activeDays, 'active day')]].map(([ik, n, a]) => `<div>${ikon(ik)}<b>${n}</b><small>${a}</small></div>`).join('')}</div>
     <article class="hafta"><div class="bolumBas"><h2>This week</h2><small>Daily goal: ${s.goal} ${cogul(s.goal, 'drop')}</small></div><div class="cubuklar">${s.week.map((w, k) => `<div class="${k === 6 ? 'bugunSutun' : ''}"><span>${w.drops || ''}</span><i class="${w.drops >= s.goal ? 'hedef' : ''}" style="--h:${Math.max(3, w.drops / max * 100)}%"></i><small>${k === 6 ? 'Today' : gun[w.date.getDay()]}</small></div>`).join('')}<b class="hedefCizgi" style="--h:${s.goal / max * 100}%"></b></div></article></div>`;
  } else if (profilSekme === 'pasaport') {
    ekran.innerHTML = ust + pasaportHtml(s, h);
  } else if (profilSekme === 'rozet') {
    ekran.innerHTML = ust + `<div class="rozetBas"><h2>My Badges</h2><span>${rz.filter(r => r.on).length} / ${rz.length} earned</span></div><ul class="rozetIzgara">${rz.map(r => `<li class="${r.on ? 'on' : ''}">${ikon(r.ik, 'rozetIk')}<b>${r.ad}</b><small>${r.on ? 'Earned' : r.ipucu}</small><span class="mini"><i style="width:${r.var / r.ist * 100}%"></i></span><em>${r.var}/${r.ist}</em></li>`).join('')}</ul>`;
  } else hesapEkrani(ust, h);
}
function hesapEkrani(ust, h) {
  const bilgi = hesapBolme === 'bilgi';
  ekran.innerHTML = ust + `<article class="hesap"><div class="bolmeSec" role="tablist"><button type="button" role="tab" data-b="bilgi" aria-selected="${bilgi}">Profile details</button><button type="button" role="tab" data-b="sifre" aria-selected="${!bilgi}">Change password</button></div><form novalidate></form><p class="formNot" role="status" aria-live="polite"></p></article>`;
  $$('[data-b]').forEach(d => d.onclick = () => { hesapBolme = d.dataset.b; profilEkrani('hesap'); });
  const f = $('.hesap form'), not = $('.formNot'), soyle = (m, kotu) => { not.textContent = m; not.classList.toggle('kotu', !!kotu); };
  if (bilgi) {
    f.innerHTML = `<fieldset class="avatarSec"><legend>My avatar</legend><div>${AVATARLAR.map(([k, a]) => `<label title="${a}"><input type="radio" name="avatar" value="${k}" ${k === h.avatar ? 'checked' : ''}><img src="${IK(k)}" alt="${a}"></label>`).join('')}<label class="avatarYukle${h.avatarResim ? ' dolu' : ''}" title="Upload a picture from my computer"><input type="radio" name="avatar" value="ozel" ${h.avatar === 'ozel' && h.avatarResim ? 'checked' : ''}>${h.avatarResim ? `<img src="${h.avatarResim}" alt="My uploaded picture">` : '<span class="arti" aria-hidden="true">+</span>'}<button type="button" class="yukleDugme" data-yukle aria-label="Upload a picture from my computer">${h.avatarResim ? '✎' : '+'}</button></label><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" data-dosya hidden></div><p class="ipucu avatarNot">Use + to upload your own picture.</p></fieldset>
     <div class="alanlar"><label class="alan"><span>First name</span><input name="ad" value="${esc(h.ad)}" maxlength="40" autocomplete="given-name"></label><label class="alan"><span>Last name</span><input name="soyad" value="${esc(h.soyad)}" maxlength="40" autocomplete="family-name"></label>
     <label class="alan kilitli"><span>Email</span><input value="${esc(h.eposta)}" readonly></label>${OG ? `<label class="alan kilitli"><span>School</span><input value="${esc(h.okul)}" readonly></label><label class="alan"><span>Role</span><select name="brans">${['Classroom teacher', 'English teacher', 'School administrator', 'School counselor', 'Other'].map(x => `<option${x === h.brans ? ' selected' : ''}>${x}</option>`).join('')}</select></label>` : `<label class="alan kilitli"><span>Grade</span><input value="Grade ${h.sinif}" readonly></label>`}</div>
     <div class="formAlt"><button type="reset" class="metinDugme">Reset</button><button class="dugme ana">Save</button></div>`;
    let yeniResim = null;
    const resimSec = () => yeniResim || h.avatarResim;
    f.onchange = e => { if (e && e.target.matches('[data-dosya]')) return; const a = f.querySelector('[name=avatar]:checked'); if (a) $$('.avatarSimdi').forEach(i => i.src = a.value === 'ozel' ? resimSec() : IK(a.value)); };
    f.onreset = () => setTimeout(() => { yeniResim = null; profilEkrani('hesap'); });
    const dosya = $('[data-dosya]', f), yukleKutu = $('.avatarYukle', f);
    const ac = e => { e.preventDefault(); e.stopPropagation(); dosya.click(); };
    $('[data-yukle]', f).onclick = ac;
    yukleKutu.addEventListener('click', e => { if (!resimSec()) ac(e); });
    dosya.onchange = () => { const d = dosya.files[0]; dosya.value = '';
      if (!d) return; if (!/^image\//.test(d.type)) return soyle('Please choose a picture file (PNG, JPG, WEBP).', true);
      if (d.size > 10 * 1024 * 1024) return soyle('The picture must be smaller than 10 MB.', true);
      const url = URL.createObjectURL(d), img = new Image();
      img.onload = () => { const k = 240, c = document.createElement('canvas'); c.width = c.height = k; const m = Math.min(img.naturalWidth, img.naturalHeight);
        c.getContext('2d').drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, k, k); URL.revokeObjectURL(url);
        yeniResim = c.toDataURL('image/jpeg', .86);
        yukleKutu.classList.add('dolu'); $('input[value=ozel]', yukleKutu).checked = true;
        const eski = $('img, .arti', yukleKutu); eski.outerHTML = `<img src="${yeniResim}" alt="My uploaded picture">`; $('[data-yukle]', f).textContent = '✎';
        f.onchange(); soyle('Your picture is ready. Press Save to add it to your profile.'); };
      img.onerror = () => { URL.revokeObjectURL(url); soyle("This picture couldn't be opened. Try another file.", true); };
      img.src = url; };
    f.onsubmit = e => { e.preventDefault(); const ad = f.ad.value.trim(), soyad = f.soyad.value.trim();
      if (!ad || !soyad) return soyle('First name and last name cannot be empty.', true);
      yerel('okumino-web-hesap', JSON.stringify({...h, ad, soyad, ...(OG ? {brans: f.brans.value} : {}), avatar: f.querySelector('[name=avatar]:checked').value, ...(resimSec() ? {avatarResim: resimSec()} : {})}));
      profilEkrani('hesap'); $('.formNot').textContent = '✓ Your profile has been saved.'; };
  } else {
    f.innerHTML = `<div class="alanlar"><label class="alan genis"><span>Current password</span><input type="password" name="eski" autocomplete="current-password"></label><label class="alan"><span>New password</span><input type="password" name="yeni" autocomplete="new-password"></label><label class="alan"><span>New password (again)</span><input type="password" name="tekrar" autocomplete="new-password"></label></div>
     <p class="ipucu">At least 6 characters. Use both letters and numbers.</p><div class="formAlt"><button type="reset" class="metinDugme">Clear</button><button class="dugme ana">Update password</button></div>`;
    f.onreset = () => soyle('');
    f.onsubmit = e => { e.preventDefault(); const {eski, yeni, tekrar} = f;
      if (!eski.value) return soyle('First type your current password.', true);
      if (yeni.value.length < 6 || !/\d/.test(yeni.value) || !/\p{L}/u.test(yeni.value)) return soyle('The new password needs at least 6 characters, with letters and numbers.', true);
      if (yeni.value !== tekrar.value) return soyle("The two new passwords don't match.", true);
      f.reset(); soyle('✓ Your password has been updated.'); };
  }
}

/* ---------- çıkış ---------- */
document.addEventListener('click', e => {
  if (!e.target.closest('[data-cikis]')) return;
  let d = $('.cikisKutu');
  if (!d) {
    d = document.createElement('dialog'); d.className = 'cikisKutu';
    d.innerHTML = `<img src="../img/mino_selam.webp" alt=""><h2>Log out now?</h2><p>Your sapling, drops and badges stay saved on this device. When you come back, you can pick up where you left off.</p><div class="formAlt"><button type="button" class="metinDugme">Cancel</button><button type="button" class="dugme kirmizi">Log out</button></div>`;
    document.body.append(d); d.querySelector('.metinDugme').onclick = () => d.close();
    d.querySelector('.kirmizi').onclick = () => { location.href = new URL('../', location.href).href; };
  }
  d.showModal();
});

/* Öğrencinin sınıfı hesaptan gelir (demo: son kayıtlı ya da 3. sınıf); sol menüdeki demo seçimi 2026-11-26'da kaldırıldı.
   Öğretmen alanı sağ üstteki kendi sınıf seçimini (#sinif) ogretmen.js'te kurar. */

/* ---------- menü daraltma ---------- */
const menuDugme = $('.menuDugme');
function menuAc(acik) { document.body.classList.toggle('dar', !acik); menuDugme.setAttribute('aria-expanded', String(acik)); menuDugme.setAttribute('aria-label', acik ? 'Collapse menu' : 'Expand menu'); yerel('okumino-web-menu', acik ? 'acik' : 'kapali'); }
menuAc(yerel('okumino-web-menu') !== 'kapali');
menuDugme.onclick = () => menuAc(document.body.classList.contains('dar'));

/* ---------- yönlendirme ---------- */
function goster() {
  const [sayfa, a, b2] = location.hash.slice(1).split('/').map(decodeURIComponent);
  const sekme = {ana: 'ana', kitaplar: 'kitaplar', kitap: 'kitaplar', oku: 'patika', bitti: 'patika', patika: 'patika', durak: 'patika', oyunlar: 'oyunlar', oyun: 'oyunlar', profil: 'profil', ...(window.EK_SEKME || {})}[sayfa] || 'ana';
  $$('#menu > a').forEach(x => x.hash === '#' + sekme ? x.setAttribute('aria-current', 'page') : x.removeAttribute('aria-current'));
  bildirimAc(false); document.body.classList.remove('tamEkran');
  if (window.EK_EKRAN && window.EK_EKRAN[sayfa]) window.EK_EKRAN[sayfa](a, b2);
  else if (sayfa === 'kitaplar') kitaplarEkrani();
  else if (sayfa === 'kitap') kitapEkrani(a);
  else if (sayfa === 'oku') okuyucu(a, b2);
  else if (sayfa === 'bitti') bittiEkrani(a);
  else if (sayfa === 'patika') patikaEkrani(a);
  else if (sayfa === 'durak') durakAdim(a, b2, location.hash.split('/')[3]);
  else if (sayfa === 'oyunlar') oyunlarEkrani();
  else if (sayfa === 'oyun') oyunEkrani(a);
  else if (sayfa === 'profil') profilEkrani(a);
  else { anaSayfa(); if (window.EK_ANA) window.EK_ANA(); }
  ekran.dataset.sayfa = sayfa || 'ana';
  ustGuncelle(); ekran.focus({preventScroll: true});
}
// İlk ziyarette, geçen haftayı okumuş bir öğrenci gibi açılır (mobil uygulamanın sunum verisi).
if (!yerel('okumino-web-tohum') && !Journal.entries().length) { Journal.seed(); yerel('okumino-web-tohum', '1'); yerel('okumino-web-sinif', '3'); }
window.addEventListener('hashchange', goster); goster();
