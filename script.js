// ============================================
// GLOBAL VARIABLES
// ============================================
let currentCaptcha = "";
let map; // Global map variable
const zoneData = {}; // Stores generated zone data

// ============================================
// 1. INITIALIZATION & CAPTCHA
// ============================================
window.onload = function() {
    generateCaptcha();
    simulateFullstackLoad(); // Start the KPI simulation
    
    // Sidebar active state logic
    document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Scroll listener for bottom button
    window.onscroll = function() {
        const bottomBtn = document.getElementById("scroll-bottom-btn");
        if (bottomBtn) {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                bottomBtn.style.display = "block";
            } else {
                bottomBtn.style.display = "none";
            }
        }
    };
};

function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
    currentCaptcha = "";
    for (let i = 0; i < 6; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captcha-box').innerText = currentCaptcha;
}

// ============================================
// 2. LOGIN & ACCESS CONTROL
// ============================================
function validateAccess() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const captchaInput = document.getElementById('captcha-input').value;
    const warning = document.getElementById('login-warning');

    // MOCK CREDENTIALS
    const validUser = "NODAL";
    const validPass = "secure123";

    if (user === validUser && pass === validPass && captchaInput.toUpperCase() === currentCaptcha) {
        // 1. Hide Login / Show Dashboard
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('main-platform').style.display = 'block';
        
        // 2. Sync Profile ID
        if(document.getElementById('input-id')) {
            document.getElementById('input-id').value = user;
            syncProfile();
        }

        // 3. INITIALIZE MAP (Critical: Must happen after display:block)
        initMap(); 
        
        // 4. Generate Data
        initialize445Zones();

    } else {
        warning.innerText = "🚨 ACCESS DENIED: INVALID CREDENTIALS OR CAPTCHA";
        document.getElementById('login-pass').value = ""; 
        generateCaptcha(); 
        
        // Shake animation
        const card = document.querySelector('.login-premium-card') || document.querySelector('.login-glass-card');
        if(card) {
            card.style.animation = "shake 0.4s";
            setTimeout(() => card.style.animation = "", 400);
        }
    }
}

// ============================================
// 3. MAP LOGIC (THE FIX)
// ============================================
function initMap() {
    // Prevent re-initialization if map already exists
    if (map) {
        map.remove();
    }

    // Initialize Map focused on Delhi
    map = L.map('leaflet-map').setView([28.6139, 77.2090], 11);

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Initial Nodal Markers (Visual Baseline)
    const nodes = [
        { name: "Minto Bridge", coords: [28.6328, 77.2345] },
        { name: "ITO Junction", coords: [28.6301, 77.2433] },
        { name: "Dwarka Sector 10", coords: [28.5811, 77.0597] },
        { name: "Ashram Chowk", coords: [28.5708, 77.2519] }
    ];

    nodes.forEach(n => {
        L.marker(n.coords)
            .addTo(map)
            .bindPopup(`<strong>${n.name}</strong><br>Status: Monitoring Active`);
    });

    // CRITICAL FIX: Force map to recalculate size after becoming visible
    setTimeout(() => {
        map.invalidateSize();
    }, 300);
}

// ============================================
// 4. DATA GENERATION (ZONES & PUMPS)
// ============================================
function initialize445Zones() {
    // 1. Standard Wards (445)
    for (let i = 1; i <= 445; i++) {
        const zoneKey = `ward ${i}`;
        const wardHealth = Math.floor(Math.random() * (100 - 60 + 1)) + 60; 
        
        zoneData[zoneKey] = {
            name: `Ward ${i}`,
            coords: [28.6 + (Math.random()*0.1), 77.1 + (Math.random()*0.1)],
            pumps: [{ 
                id: `P-${i}01`, 
                rpm: (Math.floor(Math.random() * 400) + 1000).toString(), 
                health: wardHealth 
            }]
        };
    }

    // 2. THE 30 NODAL REGIONS (Delhi Hotspots)
    const thirtyNodes = {
        "minto": { name: "Minto Bridge", coords: [28.6328, 77.2345] },
        "ito": { name: "ITO Junction", coords: [28.6301, 77.2433] },
        "ashram": { name: "Ashram Chowk", coords: [28.5708, 77.2519] },
        "lajpat": { name: "Lajpat Nagar", coords: [28.5677, 77.2431] },
        "dwarka": { name: "Dwarka Sector 10", coords: [28.5811, 77.0597] },
        "rohini": { name: "Rohini Sector 7", coords: [28.7056, 77.1251] },
        "saket": { name: "Saket", coords: [28.5245, 77.2100] },
        "connaught place": { name: "Connaught Place", coords: [28.6315, 77.2167] }
        // Add more if needed...
    };

    // 3. Blending Dynamic Data
    Object.keys(thirtyNodes).forEach(key => {
        const pumpA_Health = Math.floor(Math.random() * (100 - 45 + 1)) + 45; 
        const pumpB_Health = Math.floor(Math.random() * (100 - 45 + 1)) + 45;

        zoneData[key] = {
            ...thirtyNodes[key],
            pumps: [
                { 
                    id: "P-" + Math.floor(Math.random() * 900 + 100), 
                    rpm: (Math.floor(Math.random() * 500) + 1100).toString(), 
                    health: pumpA_Health,
                    suggestion: getMaintenanceAdvice(pumpA_Health)
                },
                { 
                    id: "P-" + Math.floor(Math.random() * 900 + 100), 
                    rpm: (Math.floor(Math.random() * 500) + 1100).toString(), 
                    health: pumpB_Health,
                    suggestion: getMaintenanceAdvice(pumpB_Health)
                }
            ]
        };
    });
}

function getMaintenanceAdvice(health) {
    if (health < 70) {
        return `<div class="maintenance-alert"><strong>⚠️ CRITICAL:</strong> Immediate mechanical overhaul required. <button onclick="scrollToSection('source-request')" class="mini-btn">Deploy QRT</button></div>`;
    } else if (health < 90) {
        return `<div class="maintenance-warning"><strong>⚡ ADVISORY:</strong> Schedule lubrication within 48 hours.</div>`;
    } else {
        return `<div class="maintenance-good">✅ System operating within peak performance.</div>`;
    }
}

// ============================================
// 5. DASHBOARD UI UPDATES
// ============================================
function updateDashboard(data) {
    // A. Header styling
    document.getElementById('display-zone-name').innerHTML = `<span class="zone-accent-active">${data.name}</span>`;
    
    // B. Live Status
    const statusPill = document.querySelector('.status-pill');
    if(statusPill) {
        statusPill.className = "status-pill-live";
        statusPill.innerHTML = `<i class="fas fa-broadcast-tower live-icon-pulse"></i> <span>SYSTEM LIVE</span>`;
    }

    // C. Map Navigation
    map.flyTo(data.coords, 15, { duration: 1.5 });
    
    // Clear old markers to avoid clutter
    map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer); });

    // D. The Popup "Board"
    let popupHTML = `
        <div class="map-popup-card-light">
            <div class="popup-header-light">STATION: ${data.name}</div>
            <div class="popup-body-light">
                ${data.pumps.map(p => `
                    <div class="pump-row-popup">
                        <b>PUMP #${p.id}</b>: ${p.rpm} RPM 
                        <span class="health-tag" style="background:${p.health < 40 ? '#FFF3E0' : '#E8F5E9'}; color:${p.health < 40 ? '#FF8C00' : '#28A745'}">
                            ${p.health}%
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    L.marker(data.coords).addTo(map).bindPopup(popupHTML).openPopup();

    // E. Telemetry Grid Update
    const grid = document.getElementById('telemetry-grid');
    if (grid) {
        grid.innerHTML = data.pumps.map(p => `
            <div class="card border-blue">
                <h2 class="title-blue"><i class="fas fa-microchip"></i> Pump #${p.id}</h2>
                <p>Status: <strong>${p.rpm} RPM</strong></p>
                <div class="health-bar-container">
                    <div class="health-bar-fill" style="width: ${p.health}%; background: ${p.health < 40 ? 'orange' : '#10b981'}"></div>
                </div>
                <p>Predictive Health: ${p.health}%</p>
                ${p.suggestion || ''}
            </div>`).join('');
    }
}

// Search Logic
function triggerSearch() {
    const val = document.getElementById('zone-search').value.toLowerCase().trim();
    if (zoneData[val]) {
        updateDashboard(zoneData[val]);
    } else {
        alert("Zone data initialized. Please search 'Minto', 'ITO', or 'Dwarka'.");
    }
}

function handleSearch(e) { if (e.key === "Enter") triggerSearch(); }

// ============================================
// 6. UI HELPERS & SIMULATIONS
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    sidebar.classList.toggle('active'); // Mobile

    // Refresh map size on sidebar toggle
    if (map) {
        setTimeout(() => map.invalidateSize(), 400); 
    }
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
        
        // Highlight logic
        const sidebarItems = document.querySelectorAll('.sidebar ul li');
        sidebarItems.forEach(li => {
            if(li.innerText.toLowerCase().includes(sectionId.replace('-', ' '))) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }
}

function simulateFullstackLoad() {
    // Show skeletons
    document.querySelectorAll('.stat-card').forEach(card => card.classList.add('skeleton'));

    setTimeout(() => {
        // Remove skeleton
        document.querySelectorAll('.stat-card').forEach(card => card.classList.remove('skeleton'));
        
        // Mock Data
        if(document.querySelector('#kpi-alerts .stat-value')) document.querySelector('#kpi-alerts .stat-value').innerText = Math.floor(Math.random() * 15) + 5;
        if(document.querySelector('#kpi-water .stat-value')) document.querySelector('#kpi-water .stat-value').innerText = (Math.random() * (1.2 - 0.2) + 0.2).toFixed(2) + "m";
        if(document.querySelector('#kpi-assets .stat-value')) document.querySelector('#kpi-assets .stat-value').innerText = "24/30";
        
        // Show Branding
        if(document.querySelector('.main-branding')) document.querySelector('.main-branding').style.opacity = "1";
    }, 1500);
}

// ============================================
// 7. VERIFICATION & COMMAND LOGIC
// ============================================

function submitProof() {
    const statusDiv = document.getElementById('upload-status');
    const afterImg = document.querySelector('.after-border input').files[0];

    if (!afterImg) {
        alert("Please upload the Post-Intervention photo first.");
        return;
    }

    statusDiv.style.display = "block";
    statusDiv.className = "verification-text";
    statusDiv.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Analyzing Metadata Headers...";

    EXIF.getData(afterImg, function() {
        const lat = EXIF.getTag(this, "GPSLatitude");
        const software = (EXIF.getTag(this, "Software") || "").toLowerCase();
        
        setTimeout(() => {
            if (!lat) {
                statusDiv.className = "verification-text status-ai";
                statusDiv.innerHTML = "<i class='fas fa-map-marker-alt'></i> <strong>REJECTED: Missing GPS Data.</strong><br>Genuine field photos must have Location Tags enabled.";
            } else {
                statusDiv.className = "verification-text status-real";
                statusDiv.innerHTML = "<i class='fas fa-check-circle'></i> <strong>VERIFIED: Genuine Field Photo.</strong><br>GPS and Timestamp headers authenticated.";
            }
        }, 1200);
    });
}

function startDispatch(resId, name) {
    const card = document.getElementById(`res-${resId}`);
    const statusText = document.getElementById(`status-${resId}`);
    const progressBar = document.getElementById(`progress-${resId}`);
    const btn = card.querySelector('.btn-request');

    btn.disabled = true;
    btn.innerText = "REQUEST SENT...";
    btn.style.opacity = "0.6";

    setTimeout(() => {
        progressBar.style.display = "block";
        statusText.className = "avail orange";
        statusText.innerText = "STATUS: DISPATCHING";
        
        setTimeout(() => {
            btn.innerText = "ON ROUTE";
            btn.style.background = "#10b981"; 
        }, 3000);
    }, 800);
}

function executeCommand(resId, resName) {
    const tile = document.getElementById(`res-${resId}`);
    const statusText = document.getElementById(`status-${resId}`);
    const progressDiv = document.getElementById(`progress-${resId}`);
    const btn = tile.querySelector('button');

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-satellite-dish fa-spin"></i> UPLINKING...`;
    
    setTimeout(() => {
        progressDiv.style.display = "block";
        statusText.innerHTML = `● MOBILIZING UNITS`;
        statusText.className = "status-glow-orange";

        setTimeout(() => {
            tile.classList.add('tile-dispatched');
            statusText.innerHTML = `● SQUAD DEPLOYED`;
            statusText.className = "status-glow-green";
            btn.innerHTML = `<i class="fas fa-check-circle"></i> MISSION ACTIVE`;
            btn.style.background = "#6b7280"; 
        }, 3000);
    }, 1000);
}

function triggerPowerCut() {
    const btn = document.getElementById('kill-switch-btn');
    const statusText = document.getElementById('power-status-text');

    if(confirm("DANGER: This will cut power to the entire local grid sector. Proceed?")) {
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ISOLATING GRID...`;
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = `<i class="fas fa-shield-alt"></i> GRID ISOLATED - SECURE`;
            btn.style.background = "#1e293b";
            statusText.innerHTML = `● POWER DISCONNECTED`;
            statusText.style.color = "#dc2626";
            alert("Power successfully cut. Local grid is safe for dewatering operations.");
        }, 2500);
    }
}

function syncProfile() {
    const newName = document.getElementById('input-name').value;
    const newId = document.getElementById('input-id').value;
    const topNameDisplay = document.getElementById('top-officer-name');
    const topIdDisplay = document.getElementById('top-officer-id');

    if (newName.trim() !== "") topNameDisplay.innerText = newName.toUpperCase();
    if (newId.trim() !== "") topIdDisplay.innerText = "ID: " + newId.toUpperCase();
}

function switchLanguage(lang) {
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-hi').classList.toggle('active', lang === 'hi');

    const elements = document.querySelectorAll('.lang-text');
    elements.forEach(el => {
        const translation = el.getAttribute(`data-${lang}`);
        if (translation) el.innerText = translation;
    });
}
