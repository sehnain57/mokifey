// ==========================================
// SortableJS Drag & Drop Reordering
// ==========================================
var grid = document.getElementById('sortable-grid');
var sortable = window.Sortable && Sortable.create(grid, {
    animation: 200,
    ghostClass: 'sortable-ghost',
    handle: '.mockup-card',
    filter: '.layout-select, .btn-small, .screen, [contenteditable]', // prevent drag when interacting with tools or text
    preventOnFilter: false
});

// ==========================================
// UI Logic (Colors, Fonts, Layouts, Devices)
// ==========================================
const root = document.documentElement;

let bgKey = 'gradient';
function updateGradients() {
    const pi = document.getElementById('primaryColor'), si = document.getElementById('secondaryColor');
    if (!pi || !si || !window.MK) return;
    for (let i = 1; i <= 8; i++) MK.apply(document.getElementById('mockup-' + i), bgKey, pi.value, si.value, i - 1, 1);
    if (window.MK_thumbs) MK_thumbs();
}

// Initialize explicit hex backgrounds
updateGradients();
let gradRaf;
function scheduleGradients(){ cancelAnimationFrame(gradRaf); gradRaf = requestAnimationFrame(updateGradients); }

// Colors
const primaryColor = document.getElementById('primaryColor');
if (primaryColor) {
    primaryColor.addEventListener('input', (e) => {
        document.getElementById('primaryHex').innerText = e.target.value.toUpperCase();
        root.style.setProperty('--primary', e.target.value);
        scheduleGradients();
    });
}

const secondaryColor = document.getElementById('secondaryColor');
if (secondaryColor) {
    secondaryColor.addEventListener('input', (e) => {
        document.getElementById('secondaryHex').innerText = e.target.value.toUpperCase();
        root.style.setProperty('--secondary', e.target.value);
        scheduleGradients();
    });
}

const deviceColor = document.getElementById('deviceColor');
if (deviceColor) {
    deviceColor.addEventListener('input', (e) => {
        document.getElementById('deviceHex').innerText = e.target.value.toUpperCase();
        root.style.setProperty('--device-color', e.target.value);
    });
}

const textColor = document.getElementById('textColor');
if (textColor) {
    textColor.addEventListener('input', (e) => {
        document.getElementById('textHex').innerText = e.target.value.toUpperCase();
        root.style.setProperty('--text-color', e.target.value);
    });
}

// Font Family Toggle
const fontFamily = document.getElementById('fontFamily');
if (fontFamily) {
    fontFamily.addEventListener('change', (e) => {
        root.style.setProperty('--font-family', e.target.value);
    });
}

// Global Device Frame Toggle
const deviceFrame = document.getElementById('deviceFrame');
if (deviceFrame) {
    deviceFrame.addEventListener('change', (e) => {
        const frameClass = e.target.value;
        // Get all phone frames
        document.querySelectorAll('.phone-frame').forEach(el => {
            // Remove all frame-* classes
            el.classList.remove('frame-ios', 'frame-island', 'frame-android', 'frame-samsung', 'frame-pixel', 'frame-classic', 'frame-minimal');
            // Add the new one
            el.classList.add(frameClass);
        });
    });
}

// Per-Mockup Layout Change
window.changeLayout = function(id, layoutClass) {
    const container = document.getElementById('mockup-' + id);
    // Remove existing layout classes
    container.classList.remove('layout-center', 'layout-left', 'layout-right', 'layout-tilt', 'layout-split-right', 'layout-float');
    container.classList.add(layoutClass);
}

// ==========================================
// Upload Logic
// ==========================================
let currentUploadId = 1;
window.triggerUpload = function(id) {
    currentUploadId = id;
    document.getElementById('fileInput').click();
}

window.handleUpload = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            // Hide placeholder and show img
            const ph = document.getElementById('placeholder-' + currentUploadId);
            if (ph) ph.style.display = 'none';

            const img = document.getElementById('img-' + currentUploadId);
            img.src = e.target.result;
            img.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// ==========================================
// Export Logic (Single & ZIP)
// ==========================================

function showLoading(text) {
    document.getElementById('loadingText').innerText = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

window.exportSingle = async function(id) {
    if (window.event && window.event.isTrusted === false) return; // only real clicks export
    showLoading('Generating High-Quality Image...');
    await new Promise(resolve => setTimeout(resolve, 400));

    const node = document.getElementById('mockup-' + id);

    // Create a temporary container behind the loading overlay to prevent viewport clipping
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.top = '0';
    exportContainer.style.left = '0';
    exportContainer.style.zIndex = '9000'; // Behind 9999 loading overlay

    // Clone the node to avoid disrupting the live UI
    const clone = node.cloneNode(true);
    clone.style.transform = 'none'; // Remove scale so it's 1080x1920 natively

    // html2canvas BUG FIX: Rotated box-shadows render as solid black polygons
    clone.querySelectorAll('.phone-frame').forEach(frame => {
        frame.style.boxShadow = 'none';
    });

    exportContainer.appendChild(clone);
    document.body.appendChild(exportContainer);

    try {
        const canvas = await html2canvas(clone, {
            scale: 1,
            useCORS: true,
            backgroundColor: null,
            width: 1080,
            height: 1920,
            scrollX: 0,
            scrollY: 0
        });

        // Download
        const link = document.createElement('a');
        link.download = `mockup-${id}.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link); // Ensure click registers in all browsers
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        alert("Error exporting image: " + err.message);
    } finally {
        document.body.removeChild(exportContainer);
        hideLoading();
    }
}

window.exportAll = async function() {
    if (window.event && window.event.isTrusted === false) return;
    const btn = document.querySelector('.btn-green');
    btn.innerText = '⏳ Generating ZIP...';
    btn.disabled = true;

    showLoading('Generating Mockups ZIP...');
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
        // Initialize JSZip
        const zip = new JSZip();
        const folder = zip.folder("PlayStore_Mockups");

        // Get mockups in their CURRENT visual sorted order
        const mockups = Array.from(document.querySelectorAll('.mockup-container'));

        for (let i = 0; i < mockups.length; i++) {
            const node = mockups[i];

            const exportContainer = document.createElement('div');
            exportContainer.style.position = 'absolute';
            exportContainer.style.top = '0';
            exportContainer.style.left = '0';
            exportContainer.style.zIndex = '9000';

            const clone = node.cloneNode(true);
            clone.style.transform = 'none';

            clone.querySelectorAll('.phone-frame').forEach(frame => {
                frame.style.boxShadow = 'none';
            });

            exportContainer.appendChild(clone);
            document.body.appendChild(exportContainer);

            const canvas = await html2canvas(clone, {
                scale: 1,
                useCORS: true,
                backgroundColor: null,
                width: 1080,
                height: 1920,
                scrollX: 0,
                scrollY: 0
            });

            document.body.removeChild(exportContainer);

            // Get the base64 string
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");

            // Number files sequentially based on visual order
            const fileIndex = (i + 1).toString().padStart(2, '0');
            folder.file(`mockup-export-${fileIndex}.png`, base64Data, { base64: true });
        }

        // Generate zip blob and trigger download
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.download = "Play_Store_Mockups.zip";
        link.href = URL.createObjectURL(content);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        btn.innerText = '✅ Export Complete';
    } catch (err) {
        alert("Error creating ZIP: " + err.message);
        btn.innerText = '❌ Error Exporting';
    }

    hideLoading();
    btn.disabled = false;
    setTimeout(() => btn.innerText = '📥 Export All (ZIP)', 3000);
}

// ==========================================
// Presets from landing page: /studio/?layout=layout-tilt&frame=frame-pixel
// ==========================================
;(function () {
    const q = new URLSearchParams(location.search);
    const l = q.get('layout');
    if (l) {
        document.querySelectorAll('.mockup-container').forEach(m => {
            const id = m.id.split('-')[1];
            changeLayout(id, l);
            const s = m.closest('.mockup-card').querySelector('.layout-select');
            if (s) s.value = l;
        });
    }
    ['primaryColor:p','secondaryColor:s','deviceColor:d','textColor:t'].forEach(x => {
        const [id, k] = x.split(':'), v = q.get(k), el = document.getElementById(id);
        if (el && /^[0-9a-fA-F]{6}$/.test(v || '')) { el.value = '#' + v; el.dispatchEvent(new Event('input')); }
    });
    const f = q.get('frame');
    if (f && deviceFrame) { deviceFrame.value = f; deviceFrame.dispatchEvent(new Event('change')); }
})();

// ==========================================
// Backgrounds, palettes and style controls
// ==========================================
;(function () {
    const grid = document.getElementById('bgGrid');
    if (!grid || !window.MK) return;
    const $ = id => document.getElementById(id);
    const setVal = (id, v) => { const el = $(id); el.value = v; el.dispatchEvent(new Event('input')); };
    const isDark = k => k !== 'image' && MK.BG[k] && MK.BG[k].dark;

    grid.innerHTML = Object.entries(MK.BG).map(([k, v]) => `<button class="bg-opt" data-k="${k}" title="${v.n}"><i></i><span>${v.n}</span></button>`).join('')
        + '<button class="bg-opt" data-k="image" title="Upload image"><i class="up">＋</i><span>Upload</span></button>';
    window.MK_thumbs = function () {
        const p = $('primaryColor').value, s = $('secondaryColor').value;
        grid.querySelectorAll('.bg-opt').forEach(b => {
            const k = b.dataset.k;
            if (k === 'image' && !MK.image) return;
            MK.apply(b.firstChild, k, p, s, 0, .2);
            if (k === 'image') b.firstChild.textContent = '';
        });
    };
    function pick(k) {
        bgKey = k;
        grid.querySelectorAll('.bg-opt').forEach(b => b.classList.toggle('on', b.dataset.k === k));
        fixText();
        updateGradients();
    }
    function fixText() { // keep text readable on dark backgrounds
        const t = $('textColor').value.toLowerCase();
        if (isDark(bgKey) && t !== '#ffffff') setVal('textColor', '#ffffff');
        else if (!isDark(bgKey) && t === '#ffffff' && !window.__lightPal) setVal('textColor', '#231f3d');
    }
    grid.addEventListener('click', e => {
        const b = e.target.closest('.bg-opt'); if (!b) return;
        if (b.dataset.k === 'image') $('bgFile').click(); else pick(b.dataset.k);
    });
    $('bgFile').addEventListener('change', e => {
        const f = e.target.files[0]; if (!f) return;
        const r = new FileReader();
        r.onload = ev => { MK.image = ev.target.result; pick('image'); };
        r.readAsDataURL(f);
    });

    // Palettes
    function applyPal(p) {
        window.__lightPal = p[4].toUpperCase() === 'FFFFFF';
        setVal('primaryColor', '#' + p[1]); setVal('secondaryColor', '#' + p[2]);
        setVal('deviceColor', '#' + p[3]); setVal('textColor', '#' + p[4]);
        if (isDark(bgKey)) setVal('textColor', '#ffffff');
    }
    $('palRow').innerHTML = MK.PAL.map((p, i) => `<button class="pal" data-i="${i}" title="${p[0]}" style="background:linear-gradient(135deg,#${p[1]},#${p[2]})"><i style="background:#${p[3]}"></i></button>`).join('');
    $('palRow').addEventListener('click', e => { const b = e.target.closest('.pal'); if (b) applyPal(MK.PAL[b.dataset.i]); });

    // Style controls
    $('titleSize').addEventListener('input', e => { root.style.setProperty('--title-size', e.target.value + 'px'); $('tsVal').textContent = e.target.value; });
    $('decor').addEventListener('change', e => root.dataset.decor = e.target.value);
    $('badge').addEventListener('change', e => root.dataset.badge = e.target.value);
    $('shuffleBtn').addEventListener('click', () => {
        const keys = Object.keys(MK.BG), r = a => a[Math.floor(Math.random() * a.length)];
        applyPal(r(MK.PAL)); pick(r(keys));
    });

    const bg = new URLSearchParams(location.search).get('bg');
    pick(MK.BG[bg] ? bg : 'gradient');
})();
