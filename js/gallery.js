const TYPES = {
  center:{t:'Center Showcase',d:'Headline on top, device straight-on. Pick a design and open it in the Studio.',l:['layout-center']},
  left:{t:'Left Aligned',d:'Left-aligned copy with a tilted phone. Pick a design and open it in the Studio.',l:['layout-left']},
  right:{t:'Right Aligned',d:'Right-aligned copy with a left-leaning phone. Pick a design and open it in the Studio.',l:['layout-right']},
  tilt:{t:'Tilt Center',d:'Centered headline with a dynamic tilt. Pick a design and open it in the Studio.',l:['layout-tilt']},
  float:{t:'Float Top',d:'A floating device with the headline below. Pick a design and open it in the Studio.',l:['layout-float']},
  set:{t:'Full Story Set',d:'A mix of every layout. Pick a look and the Studio builds all 8 screens in it.',l:['layout-center','layout-left','layout-right','layout-tilt','layout-float']}
};
const FR = ['frame-island','frame-pixel','frame-samsung','frame-ios','frame-island','frame-android','frame-minimal','frame-classic'];
const BGS = ['mesh','aurora','bubbles','spotlight','night','dots','split','horizon'];
const TX = [['Freelance Marketplace','Where skills meet endless opportunities.'],['Track Every Order','Active, completed and cancelled at a glance.'],['Discover Top Talent','Search categories to find the perfect expert.'],['Real-Time Chat','Instant messaging and smart notifications.'],['Build Your Portfolio','Showcase your skills and win more projects.'],['Offer Your Services','Create gigs that attract global clients.'],['Grow Your Business','Everything you need, in one simple app.'],['Join Us Today','Trusted by thousands of happy users.']];
const key = new URLSearchParams(location.search).get('type');
const T = TYPES[key] || TYPES.center;
document.title = T.t + ' Designs - Mockify';
document.getElementById('gt').textContent = T.t;
document.getElementById('gd').textContent = T.d;
document.getElementById('ggrid').innerHTML = TX.map((x, i) => {
  const [n, p, s, d, t] = MK.PAL[i], f = FR[i], bg = BGS[i], l = T.l[i % T.l.length], [ti, su] = x;
  const go = `/studio/?layout=${l}&frame=${f}&bg=${bg}&p=${p}&s=${s}&d=${d}&t=${t}`;
  return `<div class="g-card" style="--i:${i}"><a class="gl" href="${go}">
    <div class="gw"><div class="mockup-container ${l}${MK.BG[bg].dark ? ' bgdark' : ''}" style="--primary:#${p};--secondary:#${s};--device-color:#${d};--text-color:#${t};${MK.style(bg, '#' + p, '#' + s, i, 1)}">
      <div class="text-area"><div class="chip">★ Featured</div><div class="title">${ti}</div><div class="subtitle">${su}</div></div>
      <div class="phone-frame ${f}"><div class="notch"></div><div class="screen"><div class="img-placeholder">Your screenshot</div></div></div>
    </div></div>
    <div class="gi"><b>${n}</b><span>${MK.BG[bg].n}</span></div><div class="go">Use this design →</div></a></div>`;
}).join('');
