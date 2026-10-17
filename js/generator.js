// ==========================================
// SortableJS Drag & Drop Reordering
// ==========================================
var grid = document.getElementById('sortable-grid');
var sortable = Sortable.create(grid, {
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

function updateGradients() {
    const primaryInput = document.getElementById('primaryColor');
    const secondaryInput = document.getElementById('secondaryColor');
    
    if(!primaryInput || !secondaryInput) return; // Prevent errors on pages without generator
    
    const p = primaryInput.value;
    const s = secondaryInput.value;

    document.getElementById('mockup-1').style.backgroundImage = `linear-gradient(120deg, ${p} 0%, ${s} 90%)`;
    document.getElementById('mockup-2').style.backgroundImage = `linear-gradient(135deg, ${s} 20%, ${p} 100%)`;
    document.getElementById('mockup-3').style.backgroundImage = `linear-gradient(315deg, ${p} 0%, ${s} 75%)`;
    document.getElementById('mockup-4').style.backgroundImage = `linear-gradient(180deg, ${s} 30%, ${p} 100%)`;
    document.getElementById('mockup-5').style.backgroundImage = `linear-gradient(45deg, ${p} 0%, ${s} 65%)`;
    document.getElementById('mockup-6').style.backgroundImage = `linear-gradient(160deg, ${p} 0%, ${s} 70%)`;
    document.getElementById('mockup-7').style.backgroundImage = `linear-gradient(60deg, ${s} 30%, ${p} 100%)`;
    document.getElementById('mockup-8').style.backgroundImage = `linear-gradient(180deg, ${p} 0%, ${s} 85%)`;
}

// Initialize explicit hex backgrounds
updateGradients();

// Colors
const primaryColor = document.getElementById('primaryColor');
if (primaryColor) {
    primaryColor.addEventListener('input', (e) => {
        document.getElementById('primaryHex').innerText = e.target.value.toUpperCase();
        root.style.setProperty('--primary', e.target.value);
        updateGradients();
    });
}

const secondaryColor = document.getElementById('secondaryColor');
if (secondaryColor) {
    secondaryColor.addEventListener('input', (e) => {
        document.getElementById('secondaryHex').innerText = e.target.value.toUpperCase();
        root.style.setProperty('--secondary', e.target.value);
        root.style.setProperty('--bg-color', e.target.value);
        updateGradients();
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
    showLoading('Generating High-Quality Image...');
    await new Promise(resolve => setTimeout(resolve, 5000));

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
    const btn = document.querySelector('.btn-green');
    btn.innerText = '⏳ Generating ZIP...';
    btn.disabled = true;

    showLoading('Generating Mockups ZIP...');
    await new Promise(resolve => setTimeout(resolve, 5000));

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
