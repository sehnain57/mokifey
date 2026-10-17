const STYLES = [
  { k:'center', t:'Center Showcase', d:'A bold headline above a straight-on device. Clean, balanced, perfect for hero screens.', tags:['Hero','Classic'], bg:'mesh',p:'C4B5FD',s:'FBCFE8', chip:'★ 4.9' },
  { k:'left',   t:'Left Aligned',    d:'Copy on the left, a tilted phone sliding in from the right. Editorial and modern.', tags:['Editorial','Tilted'], bg:'aurora',p:'FDBA74',s:'FDA4AF', chip:'🔥 Trending' },
  { k:'right',  t:'Right Aligned',   d:'The mirror image: right-aligned copy and a left-leaning device for rhythm in a set.', tags:['Editorial','Tilted'], bg:'bubbles',p:'86EFAC',s:'93C5FD', chip:'✓ Verified' },
  { k:'tilt',   t:'Tilt Center',     d:'Centered headline with a dynamic 8° tilt that adds energy and depth.', tags:['Dynamic','Feature'], bg:'spotlight',p:'93C5FD',s:'C4B5FD', chip:'⚡ Fast' },
  { k:'float',  t:'Float Top',       d:'The device floats at the top, headline below. Great for closing and call-to-action screens.', tags:['Closer','Bold'], bg:'dots',p:'FDE68A',s:'FCA5A5', chip:'⬇ 1M+' },
  { k:'set',    t:'Full Story Set',  d:'A curated mix of every layout across 8 screens that tells your app story end to end.', tags:['8 screens','Best value'], bg:'horizon',p:'C4B5FD',s:'F9A8D4', chip:'★ Best' }
];
const scr = '<b><s class="h"></s><s class="t"></s><s class="r"></s><s class="r"></s></b>';
document.getElementById('types').innerHTML = STYLES.map((s, i) => `
  <a class="type rv" style="--i:${i}" href="/styles/?type=${s.k}">
    <div class="pv ${s.k}" style="${MK.style(s.bg, '#' + s.p, '#' + s.s, i, .25)}">
      <u></u><u></u>
      ${s.k === 'set' ? `<div class="ph">${scr}</div><div class="ph">${scr}</div><div class="ph">${scr}</div>` : `<div class="ph">${scr}</div>`}
      <div class="fb">${s.chip}</div>
    </div>
    <h3>${s.t}</h3><p>${s.d}</p>
    <div class="tags">${s.tags.map(t => `<span>${t}</span>`).join('')}</div>
    <div class="go">Browse designs →</div>
  </a>`).join('');

document.getElementById('bgs').innerHTML = Object.entries(MK.BG).map(([k, v], i) => {
  const P = MK.PAL[i % MK.PAL.length];
  return `<a class="bgt rv" style="--i:${i % 6};${MK.style(k, '#' + P[1], '#' + P[2], i, .28)}" href="/studio/?bg=${k}&p=${P[1]}&s=${P[2]}&d=${P[3]}&t=${P[4]}"><span>${v.n}</span><div class="mph"><b></b></div></a>`;
}).join('');
document.getElementById('pals').innerHTML = MK.PAL.map(P => `<a class="palp rv" href="/studio/?p=${P[1]}&s=${P[2]}&d=${P[3]}&t=${P[4]}"><i style="background:linear-gradient(135deg,#${P[1]},#${P[2]})"></i>${P[0]}</a>`).join('');
document.querySelectorAll('.sec-head,.feat,.band').forEach(el => el.classList.add('rv'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));
