// Okuma fidanı: mobil/okuma.js içindeki çizimin aynısı; damla arttıkça gövde uzar, yaprak çıkar.
function plantSVG(sum, size = 'big') {
  const d = sum.drops, L = sum.level;
  const g = Math.min(1, d / 60);
  const stemTop = 168 - (L === 0 ? 0 : 22 + g * 104);
  const leaves = [];
  if (L >= 1) {
    const n = Math.min(8, 2 + Math.floor(d / 2));
    for (let i = 0; i < n; i++) {
      const y = 166 - (i + 1) * ((166 - stemTop) / (n + 1));
      const dir = i % 2 ? -1 : 1, s = 0.75 + (i / n) * 0.35;
      leaves.push(`<path class="leaf" style="--i:${i}" d="M100 ${y}c${dir * 10 * s} ${-14 * s} ${dir * 30 * s} ${-14 * s} ${dir * 34 * s} ${-4 * s}c${-dir * 8 * s} ${12 * s} ${-dir * 24 * s} ${14 * s} ${-dir * 34 * s} ${4 * s}z"/>`);
    }
  }
  let crown = '';
  if (L >= 3) {
    const r = 26 + Math.min(1, (d - 22) / 38) * 26;
    crown = `<g class="crown"><circle cx="100" cy="${stemTop}" r="${r}"/><circle cx="${100 - r * .7}" cy="${stemTop + r * .35}" r="${r * .62}"/><circle cx="${100 + r * .7}" cy="${stemTop + r * .35}" r="${r * .62}"/><circle cx="100" cy="${stemTop - r * .45}" r="${r * .6}"/></g>`;
    if (L >= 4) crown += [[-.45, -.1], [.4, .05], [0, -.55], [-.15, .3], [.55, -.35]].slice(0, L === 5 ? 5 : 2).map(([x, y], i) => `<circle class="${L === 5 ? 'fruit' : 'bloom'}" style="--i:${i}" cx="${100 + x * r}" cy="${stemTop + y * r}" r="${L === 5 ? 6 : 4.5}"/>`).join('');
  }
  const trunk = L >= 3 ? 7 : 3.5;
  return `<svg class="plant-svg ${size}" viewBox="0 0 200 230" role="img" aria-label="Reading sapling: ${sum.stage.name}, ${d} ${d === 1 ? 'drop' : 'drops'}">
    <ellipse class="shadow" cx="100" cy="222" rx="58" ry="6"/>
    ${L === 0 ? '<ellipse class="seed" cx="100" cy="166" rx="9" ry="6"/><path class="sprout" d="M100 161c0-6 3-9 7-10"/>' : `<path class="stem" stroke-width="${trunk}" d="M100 170C${L >= 3 ? 98 : 96} ${(170 + stemTop) / 2} ${L >= 3 ? 102 : 104} ${(170 + stemTop) / 2 - 10} 100 ${stemTop}"/>`}
    ${leaves.join('')}${crown}
    <path class="soil" d="M52 168q48-12 96 0v6H52z"/>
    <path class="pot" d="M46 172h108l-12 50H58z"/><path class="pot-rim" d="M42 166h116v12H42z"/>
  </svg>`;
}
