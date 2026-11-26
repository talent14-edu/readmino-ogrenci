// Oyun dolabı: kitaptan bağımsız, okuduğunu anlamayı geliştiren oyunlar (veri/oyun_icerik.js).
// Seviye öğrencinin sınıfından gelir (1-2 Minik, 3 Kâşif, 4 Usta). Bir oyunu %60 ve üstü
// bitirmek her seviyede bir kez 2 damla verir (Journal: kitap 'oyun-dolabi', kimlik <tür>-<seviye>).
const karistir = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const SEVIYE = {minik: 'Little Readers · Grades 1–2', kasif: 'Explorers · Grade 3', usta: 'Masters · Grade 4'};
const OYUNLAR = [
  {tur: 'dedektif', ad: 'Mino the Detective', ik: 'buyutec', renk: 'mor', aciklama: "The text doesn't say it out loud. Collect the clues and solve the mystery.", beceri: 'Making inferences'},
  {tur: 'yol', ad: 'Your Path', ik: 'pusula', renk: 'petrol', aciklama: 'You choose the path of the story. Careful readers find the right way.', beceri: 'Spotting details'},
  {tur: 'yonerge', ad: 'Instruction Master', ik: 'el', renk: 'altin', aciklama: 'Explore the shelf. Read the instruction and tap the right object.', beceri: 'Following instructions'},
  {tur: 'baslik', ad: 'Find the Title', ik: 'yildiz', renk: 'turuncu', aciklama: 'Read the short text and pick the title that fits it best.', beceri: 'Main idea'},
  {tur: 'sira', ad: 'Story Order', ik: 'kumsaati', renk: 'mavi', aciklama: 'Put the mixed-up sentences back in the right order.', beceri: 'Order of events'},
  {tur: 'kelime', ad: 'Word Detective', ik: 'dusunce', renk: 'yesil', aciklama: "Work out what a new word means from the sentence.", beceri: 'Meaning from context'}
];
function oyunlarEkrani() {
  const sv = seviyeAdi();
  ekran.innerHTML = `<div class="bas"><div><h1>Game Cabinet</h1><p class="alt">Games that make your reading understanding stronger · <b>${SEVIYE[sv]}</b> level</p></div></div>
  <ul class="oyunIzgara">${OYUNLAR.map(o => { const bitti = Journal.has('oyun-dolabi', 'task', `${o.tur}-${sv}`);
    return `<li><a class="oyunKart renk-${o.renk}" href="#oyun/${o.tur}" aria-label="${esc(o.ad)}${bitti ? ', done' : ''}">${ikon(o.ik, 'oyunIk')}<b>${o.ad}</b><span class="dugme ana">Play →</span></a></li>`; }).join('')}</ul>`;
}

let oyun = null;
// Puan: ilk denemede 1, ikinci denemede 0.5, sonrası 0. Doğru cevap verilmeden geçilmez.
const puanHesap = yanlis => Math.max(0, 1 - yanlis * 0.5);
const puanYaz = n => String(Math.round(n * 10) / 10);
function oyunEkrani(tur) {
  const o = OYUNLAR.find(x => x.tur === tur) || OYUNLAR[0], sv = seviyeAdi(), veri = OYUN_ICERIK[o.tur][sv];
  oyun = {o, sv, i: 0, puan: 0, top: 0, maddeler: o.tur === 'yol' ? [] : karistir(veri), yol: o.tur === 'yol' ? veri : null};
  ekran.innerHTML = `<div class="bas"><div><a class="geri" href="#oyunlar">← Game Cabinet</a><h1 class="oyunBaslik">${ikon(o.ik)}${o.ad} <small class="faz">${SEVIYE[sv]}</small></h1></div></div>
  <article class="oyunAlan renk-${o.renk}"></article>`;
  o.tur === 'yol' ? yolCiz(veri.bas) : maddeCiz();
}
const ilerleme = () => `<div class="ilerleme" aria-label="Part ${oyun.i + 1} of ${oyun.maddeler.length}">${oyun.maddeler.map((_, k) => `<i class="${k < oyun.i ? 'gecti' : k === oyun.i ? 'su' : ''}"></i>`).join('')}</div>`;
const sonraki = () => `<button type="button" class="dugme ana" data-ileri>${oyun.i + 1 < oyun.maddeler.length ? 'Next →' : 'See your score →'}</button>`;
function ileriBagla(alan) { const b = $('[data-ileri]', alan); if (b) { b.onclick = () => { oyun.i++; maddeCiz(); }; b.focus(); } }

function maddeCiz() {
  const alan = $('.oyunAlan'); if (!alan) return;
  const {o, maddeler, i} = oyun;
  if (i >= maddeler.length) return oyunSonu(alan);
  const m = maddeler[i];
  if (o.tur === 'sira') return siraCiz(alan, m);
  if (o.tur === 'yonerge') return yonergeCiz(alan, m);
  let metin = '', soru, secenek, aciklama = '';
  if (o.tur === 'dedektif') { metin = m[0]; soru = m[1]; secenek = m[2]; aciklama = m[3]; }
  else if (o.tur === 'baslik') { metin = m[0]; soru = 'Which title fits this text best?'; secenek = m[1]; }
  else { metin = m[0].replace(/\*\*(.+?)\*\*/, '<mark>$1</mark>'); soru = `What does “${m[0].match(/\*\*(.+?)\*\*/)[1]}” mean?`; secenek = m[1]; }
  const dogru = secenek[0];
  alan.innerHTML = `${ilerleme()}<blockquote class="baglam buyuk">${o.tur === 'kelime' ? metin : esc(metin)}</blockquote><h2 class="soruMetni">${esc(soru)}</h2>
   <div class="secenekler">${karistir(secenek).map(x => `<button type="button" class="secenek">${esc(x)}</button>`).join('')}</div><div class="geriBildirim" role="status" aria-live="polite"></div>`;
  oyun.top = maddeler.length;
  let deneme = 0;
  $$('.secenek', alan).forEach(btn => btn.onclick = () => {
    if (btn.textContent !== dogru) { deneme++; oyun.deneme = (oyun.deneme || 0) + 1; btn.classList.add('yanlis'); btn.disabled = true;
      $('.geriBildirim', alan).innerHTML = `<p>Not quite. Read it again and try another answer.${deneme === 1 ? ' <small>(Now worth ½ point.)</small>' : ' <small>(No points for this one now, but you still need the right answer.)</small>'}</p>`; return; }
    const kazanc = puanHesap(deneme); oyun.puan += kazanc; oyun.deneme = (oyun.deneme || 0) + 1;
    btn.classList.add('dogru'); $$('.secenek', alan).forEach(x => x.disabled = true);
    $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>${deneme ? 'Right answer!' : ['Well done!', 'Spot on!', 'Great reading!'][i % 3]} <b class="puanEtiket">+${puanYaz(kazanc)} ${kazanc === 1 ? 'point' : 'points'}</b>${aciklama ? `<small class="ipucuMetni">Hint: ${esc(aciklama)}</small>` : ''}</p>${sonraki()}`;
    ileriBagla(alan);
  });
}
function siraCiz(alan, cumleler) {
  if (!oyun.karisik) { oyun.karisik = karistir(cumleler.map((t, k) => ({t, k}))); oyun.sec = []; }
  const sec = oyun.sec, bitti = sec.length === cumleler.length;
  alan.innerHTML = `${ilerleme()}<h2 class="soruMetni">In what order did these happen? Tap them, starting with the first.</h2>
   <ol class="siraListe">${oyun.karisik.map(x => { const n = sec.indexOf(x.k), durum = bitti ? (sec[n] === n ? 'dogru' : 'yanlis') : ''; return `<li><button type="button" data-k="${x.k}" class="siraKart ${n >= 0 ? 'secili ' + durum : ''}"><b>${n >= 0 ? n + 1 : ''}</b><span>${esc(x.t)}</span></button></li>`; }).join('')}</ol>
   <div class="geriBildirim" role="status" aria-live="polite">${bitti ? '' : `<p class="ipucu">${sec.length}/${cumleler.length} sentences in order</p>${sec.length ? '<button type="button" class="metinDugme" data-geri>Undo last pick</button>' : ''}`}</div>`;
  $$('[data-k]', alan).forEach(d => d.onclick = () => { const k = Number(d.dataset.k); if (bitti || sec.includes(k)) return; sec.push(k); siraCiz(alan, cumleler); });
  const geri = $('[data-geri]', alan); if (geri) geri.onclick = () => { sec.pop(); siraCiz(alan, cumleler); };
  if (bitti) {
    const tam = sec.every((k, n) => k === n); oyun.top = oyun.maddeler.length;
    if (tam && !oyun.sayildi) { const k = puanHesap(oyun.siraYanlis || 0); oyun.puan += k; oyun.deneme = (oyun.deneme || 0) + (oyun.siraYanlis || 0) + 1; oyun.sayildi = true; oyun.sonKazanc = k; }
    $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>${tam ? `All in the right order! <b class="puanEtiket">+${puanYaz(oyun.sonKazanc)} ${oyun.sonKazanc === 1 ? 'point' : 'points'}</b>` : `Green ones are in the right place; red ones need to move.${(oyun.siraYanlis || 0) === 0 ? ' <small>(Next try is worth ½ point.)</small>' : ' <small>(No points for this one now, but you still need the right order.)</small>'}`}</p>${tam ? sonraki() : '<button type="button" class="dugme" data-tekrar>Try again</button>'}`;
    const t = $('[data-tekrar]', alan); if (t) t.onclick = () => { oyun.siraYanlis = (oyun.siraYanlis || 0) + 1; oyun.sec = []; siraCiz(alan, cumleler); };
    const ileri = $('[data-ileri]', alan); if (ileri) ileri.onclick = () => { oyun.i++; oyun.karisik = null; oyun.siraYanlis = 0; oyun.sayildi = false; maddeCiz(); };
  }
}
// Ekran okuyucu için ikon dosya adlarının İngilizce karşılıkları (dosya adları değişmez).
const IKON_AD = {agac: 'tree', aile: 'family', alev: 'flame', arkadaslar: 'friends', bank: 'bench', buyutec: 'magnifying glass', cay: 'tea', cop: 'trash can', damla: 'drop', defter: 'notebook', dusunce: 'thought bubble', el: 'hand', elsalla: 'waving hand', ev: 'house', fidan: 'sapling', goz: 'eye', gozkapat: 'closed eyes', harita: 'map', hoparlor: 'speaker', kagit: 'paper', kaydirak: 'slide', kilit: 'lock', kitap: 'book', kitapkurdu: 'bookworm', kitaplar: 'books', konfeti: 'confetti', kosan: 'runner', kumsaati: 'hourglass', kupa: 'trophy', madalya: 'medal', musluk: 'tap', nine: 'grandma', portakal: 'orange', pusula: 'compass', sandik: 'chest', sessiz: 'mute', soru: 'question mark', telefon: 'phone', tokalasma: 'handshake', top: 'ball', yapboz: 'puzzle', yardim: 'help', yildiz: 'star', zil: 'bell'};
function yonergeCiz(alan, [izgara, yonerge, dogru]) {
  oyun.top = oyun.maddeler.length;
  alan.innerHTML = `${ilerleme()}<p class="yonergeKart">${ikon('el')}<span>${esc(yonerge)}</span></p>
   <div class="raf3" role="group" aria-label="Objects on the shelf">${izgara.map((n, k) => `<button type="button" data-k="${k}" aria-label="${IKON_AD[n] || n}"><img src="${IK(n)}" alt=""></button>`).join('')}</div><div class="geriBildirim" role="status" aria-live="polite"></div>`;
  let deneme = 0;
  $$('[data-k]', alan).forEach(btn => btn.onclick = () => {
    if (Number(btn.dataset.k) === dogru) {
      btn.classList.add('dogru'); $$('[data-k]', alan).forEach(x => x.disabled = true); oyun.puan += puanHesap(deneme); oyun.deneme = (oyun.deneme || 0) + deneme + 1;
      $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>${deneme ? 'You found it! Reading the instruction step by step worked.' : 'You found it on the first try!'} <b class="puanEtiket">+${puanYaz(puanHesap(deneme))} ${puanHesap(deneme) === 1 ? 'point' : 'points'}</b></p>${sonraki()}`; ileriBagla(alan);
    } else { deneme++; btn.classList.add('yanlis'); setTimeout(() => btn.classList.remove('yanlis'), 450); $('.geriBildirim', alan).innerHTML = '<p>Not this one. Read the instruction again, word by word.</p>'; }
  });
}
function yolCiz(dugum) {
  const alan = $('.oyunAlan'), y = oyun.yol, [metin, secim] = y.d[dugum];
  if (!oyun.yanlis) oyun.yanlis = 0;
  if (dugum.startsWith('y')) oyun.yanlis++;
  if (dugum === 's') {
    const [soru, sec] = y.soru;
    alan.innerHTML = `<p class="yolMetin son">${esc(metin)}</p><h2 class="soruMetni">${esc(soru)}</h2><div class="secenekler">${karistir(sec).map(x => `<button type="button" class="secenek">${esc(x)}</button>`).join('')}</div><div class="geriBildirim" role="status" aria-live="polite"></div>`;
    let deneme = 0;
    $$('.secenek', alan).forEach(btn => btn.onclick = () => {
      if (btn.textContent !== sec[0]) { deneme++; btn.classList.add('yanlis'); btn.disabled = true;
        $('.geriBildirim', alan).innerHTML = `<p>Not quite. Think about the story and try another answer.${deneme === 1 ? ' <small>(Now worth ½ point.)</small>' : ' <small>(No points for this one now, but you still need the right answer.)</small>'}</p>`; return; }
      btn.classList.add('dogru'); $$('.secenek', alan).forEach(x => x.disabled = true);
      const k = puanHesap(deneme); oyun.puan = k + Math.max(0, 2 - oyun.yanlis); oyun.top = 3; oyun.deneme = deneme + 1;
      $('.geriBildirim', alan).innerHTML = `<img src="../img/mino_selam.webp" alt=""><p>Correct! <b class="puanEtiket">+${puanYaz(k)} ${k === 1 ? 'point' : 'points'}</b></p><button type="button" class="dugme ana" data-son>See your score →</button>`;
      $('[data-son]', alan).onclick = () => oyunSonu(alan);
    });
    return;
  }
  alan.innerHTML = `<p class="yolBas">${esc(y.ad)}</p><p class="yolMetin ${dugum.startsWith('y') ? 'yanlisYol' : ''}">${dugum.startsWith('y') ? '<img src="../img/mino_selam.webp" alt="">' : ''}<span>${esc(metin)}</span></p>
   <div class="secenekler yolSecim">${secim.map(([m, git]) => `<button type="button" class="secenek" data-git="${git}">${esc(m)} →</button>`).join('')}</div>`;
  $$('[data-git]', alan).forEach(b => b.onclick = () => yolCiz(b.dataset.git));
}
function oyunSonu(alan) {
  const {o, sv, puan} = oyun, top = oyun.top || oyun.maddeler.length, oran = top ? puan / top : 0;
  const yeni = oran >= .6 && Journal.record('oyun-dolabi', 'task', `${o.tur}-${sv}`, `${o.ad} · ${SEVIYE[sv]}`);
  const diger = OYUNLAR[(OYUNLAR.indexOf(o) + 1) % OYUNLAR.length];
  alan.innerHTML = `<div class="sonuc"><img src="../img/mino_selam.webp" alt=""><h2>${oran === 1 ? 'Perfect!' : oran >= .6 ? "You're doing really well!" : 'Shall we try again?'}</h2><p class="buyukSayi">${puanYaz(puan)}<small>/${top} points</small></p>${oyun.deneme && o.tur !== 'yol' ? `<p class="denemeNot">You answered ${top} ${top === 1 ? 'question' : 'questions'} in ${oyun.deneme} ${oyun.deneme === 1 ? 'try' : 'tries'}.</p>` : ''}
   <p>${yeni ? 'You earned 2 drops for this game, and your sapling grew.' : oran >= .6 ? 'You already got the drops for this game.' : 'Read the text slowly, one more time. Get most of them right and 2 drops are waiting for you.'}</p>
   <div class="dugmeler"><a class="dugme" href="#oyunlar">Game Cabinet</a><a class="dugme" href="#oyun/${diger.tur}">Play ${diger.ad}</a><button type="button" class="dugme ana" data-tekrar>Play again</button></div></div>`;
  $('[data-tekrar]', alan).onclick = () => oyunEkrani(o.tur);
  if (yeni) damlaKazan(2, `You finished ${o.ad}`);
}
