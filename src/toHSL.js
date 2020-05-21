export function toHSL(str) {
  if (!str) return;
  const opts = {
    hue: [60, 360],
    sat: [75, 100],
    lum: [70, 71],
  };

  function range(hash, min, max) {
    const diff = max - min;
    const x = ((hash % diff) + diff) % diff;
    return x + min;
  }

  let hash = 0;
  if (str === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  let h = range(hash, opts.hue[0], opts.hue[1]);
  let s = range(hash, opts.sat[0], opts.sat[1]);
  let l = range(hash, opts.lum[0], opts.lum[1]);

  return `hsl(${h}, ${s}%, ${l}%)`;
}
