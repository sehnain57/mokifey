// Shared background + palette engine (gradients only, so html2canvas exports them faithfully)
(function () {
  const A = [120, 135, 315, 180, 45, 160, 60, 180];
  const al = (c, a) => c + Math.round(a * 255).toString(16).padStart(2, '0');
  const w = a => `rgba(255,255,255,${a})`, w0 = w(0);
  const px = (n, k) => Math.max(1, Math.round(n * k)) + 'px';
  const base = (p, s, i) => `linear-gradient(${A[i % 8]}deg,${p} 0%,${s} 90%)`;
  const BG = {
    gradient: { n: 'Soft Gradient', f: (p, s, i) => ({ img: base(p, s, i) }) },
    mesh: { n: 'Mesh', f: (p, s, i) => { const x = 12 + (i % 4) * 6; return { color: s, img: [
      `radial-gradient(60% 40% at ${x}% 12%,${p},${al(p, 0)} 72%)`, `radial-gradient(55% 38% at ${100 - x}% 28%,${s},${al(s, 0)} 72%)`,
      `radial-gradient(70% 45% at ${100 - x}% 88%,${p},${al(p, 0)} 72%)`, `radial-gradient(60% 40% at ${x}% 78%,${s},${al(s, 0)} 72%)`].join(',') }; } },
    aurora: { n: 'Aurora', f: (p, s, i) => ({ img: [
      `radial-gradient(90% 26% at 50% 0%,${w(.55)},${w0})`,
      `linear-gradient(115deg,${w0} 26%,${w(.42)} 42%,${w0} 58%)`, `linear-gradient(115deg,${w0} 56%,${w(.28)} 70%,${w0} 86%)`,
      `linear-gradient(200deg,${p},${s})`].join(',') }) },
    spotlight: { n: 'Spotlight', f: (p, s) => ({ img: `radial-gradient(70% 45% at 50% 38%,#ffffff 0%,${p} 48%,${s} 100%)` }) },
    solid: { n: 'Solid', f: (p) => ({ img: `linear-gradient(${p},${p})` }) },
    split: { n: 'Duotone Split', f: (p, s) => ({ img: `linear-gradient(115deg,${p} 0%,${p} 50%,${s} 50%,${s} 100%)` }) },
    dots: { n: 'Dots', f: (p, s, i, k) => { const L = []; for (let r = 0; r < 10; r++) for (let c = 0; c < 5; c++) { const x = c * 25 + (r % 2 ? 12.5 : 0); if (x > 100) continue; L.push(`radial-gradient(circle at ${x}% ${r * 10 + 5}%,${w(.55)} ${px(17, k)},${w0} ${px(19, k)})`); } L.push(base(p, s, i)); return { img: L.join(',') }; } },
    grid: { n: 'Grid', f: (p, s, i, k) => ({ img: `linear-gradient(${w(.42)} ${px(2, k)},${w0} ${px(2, k)}),linear-gradient(90deg,${w(.42)} ${px(2, k)},${w0} ${px(2, k)}),${base(p, s, i)}`, size: `${px(90, k)} ${px(90, k)},${px(90, k)} ${px(90, k)},100% 100%` }) },
    stripes: { n: 'Stripes', f: (p, s, i, k) => ({ img: `linear-gradient(135deg,${w(.2)} 25%,${w0} 25%,${w0} 50%,${w(.2)} 50%,${w(.2)} 75%,${w0} 75%),${base(p, s, i)}`, size: `${px(140, k)} ${px(140, k)},100% 100%` }) },
    bubbles: { n: 'Bubbles', f: (p, s, i, k) => { const c = (x, y, r, a) => `radial-gradient(circle at ${x}% ${y}%,${w(a)} ${px(r, k)},${w0} ${px(r + 2, k)})`; return { img: [c(14, 16, 190, .3), c(88, 30, 120, .28), c(70, 72, 260, .22), c(12, 84, 150, .3), c(92, 94, 90, .35), base(p, s, i)].join(',') }; } },
    night: { n: 'Midnight Glow', dark: true, f: (p, s) => ({ color: '#0B0B1A', img: [
      `radial-gradient(62% 40% at 50% 30%,${al(p, .95)},${al(p, 0)} 75%)`, `radial-gradient(55% 35% at 90% 88%,${al(s, .85)},${al(s, 0)} 75%)`, `radial-gradient(40% 26% at 4% 66%,${al(s, .6)},${al(s, 0)} 75%)`].join(',') }) },
    horizon: { n: 'Horizon', f: (p, s) => ({ img: `radial-gradient(140% 30% at 50% 100%,${w(.6)},${w0} 70%),radial-gradient(100% 24% at 50% 0%,${w(.42)},${w0}),linear-gradient(180deg,${p},${s})` }) }
  };
  const PAL = [
    ['Lavender Dream', 'C4B5FD', 'FBCFE8', '1F2330', '231F3D'], ['Peach Sunset', 'FDBA74', 'FDA4AF', '2A1B1B', '3B1D1D'],
    ['Mint Fresh', '86EFAC', '67E8F9', '12302A', '0F3B33'], ['Ocean Blue', '93C5FD', 'C4B5FD', '1B2540', '172554'],
    ['Midnight', '312E81', '7C3AED', '0B0B14', 'FFFFFF'], ['Lemon Pop', 'FDE68A', 'FCA5A5', '2B2416', '3A2A0A'],
    ['Forest', '065F46', '34D399', '06231B', 'FFFFFF'], ['Rose Gold', 'FBCFE8', 'FDBA74', '3A2230', '4A1D3A'],
    ['Candy', 'F9A8D4', 'A5B4FC', '2D1B3D', '3B0F4A'], ['Sunrise', 'FCA5A5', 'FDE68A', '2A1515', '4A1D1D']
  ];
  const css = (key, p, s, i, k) => {
    if (key === 'image' && MK.image) return { img: `url(${MK.image})`, size: 'cover' };
    return (BG[key] || BG.gradient).f(p, s, i || 0, k || 1);
  };
  const MK = window.MK = { BG, PAL, image: null, css };
  MK.apply = (el, key, p, s, i, k) => {
    const r = css(key, p, s, i, k), st = el.style;
    st.backgroundImage = r.img; st.backgroundSize = r.size || 'auto';
    st.backgroundColor = r.color || 'transparent'; st.backgroundPosition = 'center';
    st.backgroundRepeat = r.size === 'cover' ? 'no-repeat' : 'repeat';
    el.classList.toggle('bgdark', !!(BG[key] && BG[key].dark));
  };
  MK.style = (key, p, s, i, k) => {
    const r = css(key, p, s, i, k);
    return `background-image:${r.img};background-size:${r.size || 'auto'};background-color:${r.color || 'transparent'};background-position:center;background-repeat:repeat`;
  };
})();
