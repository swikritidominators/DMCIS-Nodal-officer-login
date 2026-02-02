let currentCaptcha = "";

// Run captcha on load
window.onload = function() {
    generateCaptcha();
};

function generateCaptcha() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous O, 0, I, 1
    currentCaptcha = "";
    for (let i = 0; i < 6; i++) {
        currentCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    document.getElementById('captcha-box').innerText = currentCaptcha;
}

function validateAccess() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const captchaInput = document.getElementById('captcha-input').value;
    const warning = document.getElementById('login-warning');

    // MOCK CREDENTIALS - Change these for your demo!
    const validUser = "NODAL";
    const validPass = "secure123";

    if (user === validUser && pass === validPass && captchaInput.toUpperCase() === currentCaptcha) {
        // SUCCESS: Hide login and show platform
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('main-platform').style.display = 'block';
        
        // Sync the ID used in login to the top badge automatically
        if(typeof syncProfile === "function") {
            document.getElementById('input-id').value = user;
            syncProfile();
        }
    } else {
        // FAILURE: Show Warning
        warning.innerText = "🚨 ACCESS DENIED: INVALID CREDENTIALS OR CAPTCHA";
        document.getElementById('login-pass').value = ""; // Clear password
        generateCaptcha(); // Refresh captcha on failure
        
        // Shake animation for effect
        const card = document.querySelector('.login-glass-card');
        card.style.animation = "shake 0.4s";
        setTimeout(() => card.style.animation = "", 400);
    }
}
let map;
const zoneData = {};

// 1. Initialize Map
function initMap() {
    map = L.map('leaflet-map').setView([28.6139, 77.2090], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

// 2. Load all 30 Nodal Regions + 445 Wards
function initialize445Zones() {
    // 1. Standard Wards (445)
    for (let i = 1; i <= 445; i++) {
        const zoneKey = `ward ${i}`;
        // Randomize health for standard wards too for realism
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

    // 2. THE 30 NODAL REGIONS (Coordinates for Delhi Hotspots)
    const thirtyNodes = {
        "minto": { name: "Minto Bridge", coords: [28.6328, 77.2345] },
        "ito": { name: "ITO Junction", coords: [28.6301, 77.2433] },
        "ashram": { name: "Ashram Chowk", coords: [28.5708, 77.2519] },
        "lajpat": { name: "Lajpat Nagar", coords: [28.5677, 77.2431] },
        "munirka": { name: "Munirka", coords: [28.5545, 77.1711] },
        "dwarka": { name: "Dwarka Sector 10", coords: [28.5811, 77.0597] },
        "rohini": { name: "Rohini Sector 7", coords: [28.7056, 77.1251] },
        "pitampura": { name: "Pitampura", coords: [28.7033, 77.1323] },
        "saket": { name: "Saket", coords: [28.5245, 77.2100] },
        "hauz khas": { name: "Hauz Khas", coords: [28.5494, 77.2044] },
        "nehru place": { name: "Nehru Place", coords: [28.5488, 77.2513] },
        "okhla": { name: "Okhla Phase 3", coords: [28.5358, 77.2732] },
        "karol bagh": { name: "Karol Bagh", coords: [28.6510, 77.1906] },
        "chandni chowk": { name: "Chandni Chowk", coords: [28.6608, 77.2311] },
        "connaught place": { name: "Connaught Place", coords: [28.6315, 77.2167] },
        "rk puram": { name: "RK Puram", coords: [28.5653, 77.1761] },
        "vasant kunj": { name: "Vasant Kunj", coords: [28.5293, 77.1519] },
        "janakpuri": { name: "Janakpuri", coords: [28.6219, 77.0878] },
        "vikaspuri": { name: "Vikaspuri", coords: [28.6338, 77.0700] },
        "nizamuddin": { name: "Nizamuddin East", coords: [28.5912, 77.2490] },
        "mayur vihar": { name: "Mayur Vihar Ph 1", coords: [28.6041, 77.2932] },
        "laxmi nagar": { name: "Laxmi Nagar", coords: [28.6367, 77.2766] },
        "preet vihar": { name: "Preet Vihar", coords: [28.6418, 77.2911] },
        "shahdara": { name: "Shahdara", coords: [28.6738, 77.2861] },
        "dilshad garden": { name: "Dilshad Garden", coords: [28.6811, 77.3019] },
        "civil lines": { name: "Civil Lines", coords: [28.6757, 77.2255] },
        "model town": { name: "Model Town", coords: [28.7027, 77.1936] },
        "punjabi bagh": { name: "Punjabi Bagh", coords: [28.6675, 77.1259] },
        "rajouri garden": { name: "Rajouri Garden", coords: [28.6425, 77.1200] },
        "paschim vihar": { name: "Paschim Vihar", coords: [28.6636, 77.0850] }
    };

    // 3. Blending Dynamic Data Logic for all 30 Nodes
    Object.keys(thirtyNodes).forEach(key => {
        // Generate two unique pumps for each of the 30 zones
        const pumpA_Health = Math.floor(Math.random() * (100 - 45 + 1)) + 45; 
        const pumpB_Health = Math.floor(Math.random() * (100 - 45 + 1)) + 45;

        zoneData[key] = {
            ...thirtyNodes[key],
            pumps: [
                { 
                    id: "P-" + Math.floor(Math.random() * 900 + 100), 
                    rpm: (Math.floor(Math.random() * 500) + 1100).toString(), 
                    health: pumpA_Health,
                    suggestion: getMaintenanceAdvice(pumpA_Health) // Logic added here
                },
                { 
                    id: "P-" + Math.floor(Math.random() * 900 + 100), 
                    rpm: (Math.floor(Math.random() * 500) + 1100).toString(), 
                    health: pumpB_Health,
                    suggestion: getMaintenanceAdvice(pumpB_Health) // Logic added here
                }
            ]
        };
    });
}

/**
 * Helper function to generate professional advice based on health
 * Place this below the initialize function in script.js
 */
function getMaintenanceAdvice(health) {
    if (health < 70) {
        return `<div class="maintenance-alert"><strong>⚠️ CRITICAL:</strong> Immediate mechanical overhaul required. Bearing temperature exceeding safety limits. <button onclick="scrollToSection('source-request')" class="mini-btn">Deploy QRT Squad</button></div>`;
    } else if (health < 90) {
        return `<div class="maintenance-warning"><strong>⚡ ADVISORY:</strong> Schedule lubrication within 48 hours. Slight vibration detected.</div>`;
    } else {
        return `<div class="maintenance-good">✅ System operating within peak performance parameters.</div>`;
    }
}

// 3. UI Update (Styled Header, Styled Popup, Styled Grid)
function updateDashboard(data) {
    // A. Header styling (Gradient & Orange line)
    document.getElementById('display-zone-name').innerHTML = `<span class="zone-accent-active">${data.name}</span>`;
    
    // B. Live Status styling (Red & Pulsing)
    const statusPill = document.querySelector('.status-pill');
    if(statusPill) {
        statusPill.className = "status-pill-live";
        statusPill.innerHTML = `<i class="fas fa-broadcast-tower live-icon-pulse"></i> <span>NETWORK STABLE | SYSTEM LIVE</span>`;
    }

    // C. Map Navigation
    map.flyTo(data.coords, 15, { duration: 1.5 });
    map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer); });

    // D. The Popup "Board" (Light Yellow with Red Strip)
    let popupHTML = `
        <div class="map-popup-card-light">
            <div class="popup-header-light">ACTIVE PUMP STATION</div>
            <div class="popup-body-light">
                ${data.pumps.map(p => `
                    <div class="pump-row-popup">
                        <b>PUMP #${p.id}</b>: ${p.rpm} RPM 
                        <span class="health-tag" style="background:${p.health < 40 ? '#FFF3E0' : '#E8F5E9'}; color:${p.health < 40 ? '#FF8C00' : '#28A745'}">
                            ${p.health}% HEALTH
                        </span>
                    </div>
                `).join('')}
            </div>
            
            <div class="popup-footer-live" onclick="document.getElementById('telemetry-grid').scrollIntoView({behavior: 'smooth'})">
                <span class="heartbeat-dot"></span>
                LIVE TELEMETRY ACTIVE
            </div>
        </div>
    `;

    L.marker(data.coords).addTo(map).bindPopup(popupHTML, { className: 'custom-leaflet-popup-light' }).openPopup();

    // E. Telemetry Grid
    const grid = document.getElementById('telemetry-grid');
    grid.innerHTML = data.pumps.map(p => `
        <div class="card border-blue">
            <h2 class="title-blue"><i class="fas fa-microchip"></i> Pump #${p.id}</h2>
            <p>Status: <strong>${p.rpm} RPM</strong></p>
            <div class="health-bar-container"><div class="health-bar-fill" style="width: ${p.health}%; background: ${p.health < 40 ? 'var(--dmcis-orange)' : 'var(--dmcis-green)'}"></div></div>
            <p>Predictive Health: ${p.health}%</p>
        </div>`).join('');
}
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    
    // Toggle classes for desktop view
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    
    // Toggle class for mobile view
    sidebar.classList.toggle('active');

    // Refresh the map size so it fills the new expanded width
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 400); 
    }
}
// New function to scroll to sections
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        // Calculate offset to account for fixed headers or spacing
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

// Update your existing window.onload to handle the active class switch
window.onload = () => { 
    initMap(); 
    initialize445Zones(); 
    scrollToSection('home');
    document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all
            document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
            // Add active class to the one we just clicked
            this.classList.add('active');
        });
    });
};
window.onload = () => { initMap(); initialize445Zones(); 
    // Function to handle sidebar menu switching
    document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all
            document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Optional: In the future, we can add code here to scroll to the section
        });
    });
};
function triggerSearch() {
    const val = document.getElementById('zone-search').value.toLowerCase().trim();
    if (zoneData[val]) updateDashboard(zoneData[val]);
    else alert("Zone data initialized. Please search 'Minto' or 'ITO'.");
}
function handleSearch(e) { if (e.key === "Enter") triggerSearch(); }
// Function to show/hide the 'Scroll to Bottom' button based on scroll position
window.onscroll = function() {
    const bottomBtn = document.getElementById("scroll-bottom-btn");
    
    // Show button after scrolling down 300 pixels
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        bottomBtn.style.display = "block";
    } else {
        bottomBtn.style.display = "none";
    }
};

// Ensure your existing scrollToSection handles the smooth movement
// Function to handle the smooth scroll to the profile form
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        
        // Visual feedback: briefly highlight the section
        element.style.backgroundColor = "#f0f7ff";
        setTimeout(() => {
            element.style.backgroundColor = "white";
        }, 1000);
    }
}
// NEW: Advanced Map Heatmap Logic & Simulated API Fetching
function simulateFullstackLoad() {
    // 1. Show skeletons on start
    document.querySelectorAll('.stat-card').forEach(card => card.classList.add('skeleton'));

    // 2. Simulate API Delay (1.5 seconds)
    setTimeout(() => {
        // Remove skeleton state
        document.querySelectorAll('.stat-card').forEach(card => card.classList.remove('skeleton'));
        
        // Update with Dynamic Mock Data
        document.querySelector('#kpi-alerts .stat-value').innerText = Math.floor(Math.random() * 15) + 5;
        document.querySelector('#kpi-water .stat-value').innerText = (Math.random() * (1.2 - 0.2) + 0.2).toFixed(2) + "m";
        document.querySelector('#kpi-assets .stat-value').innerText = "24/30";
        
        renderHeatmapMarkers();
        // Add this inside the setTimeout of simulateFullstackLoad()
        document.querySelector('.main-branding').style.opacity = "1";
    }, 1500);
}

function renderHeatmapMarkers() {
    // Add colored circle markers to map based on severity
    Object.values(thirtyNodes).forEach(node => {
        const severityColor = Math.random() > 0.7 ? '#dc3545' : '#28a745'; // Random Red/Green for Heatmap
        L.circleMarker(node.coords, {
            radius: 12,
            fillColor: severityColor,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.6
        }).addTo(map).bindTooltip(`${node.name}: ${severityColor === '#dc3545' ? 'Critical' : 'Normal'}`);
    });
}
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
        const fileName = afterImg.name.toLowerCase();

        // 1. Check for AI Software Signatures
        const hasAISoftware = software.includes("adobe") || software.includes("firefly") || software.includes("midjourney");
        
        // 2. Check for AI naming
        const hasAIName = fileName.includes("ai") || fileName.includes("gemini") || fileName.includes("generated");

        setTimeout(() => {
            if (hasAISoftware || hasAIName) {
                statusDiv.className = "verification-text status-ai";
                statusDiv.innerHTML = "<i class='fas fa-robot'></i> <strong>WARNING: AI Source Detected.</strong><br>Internal signatures match known AI generation tools.";
            } else if (!lat) {
                // This is why your genuine photos might be failing
                statusDiv.className = "verification-text status-ai";
                statusDiv.innerHTML = "<i class='fas fa-map-marker-alt'></i> <strong>REJECTED: Missing GPS Data.</strong><br>Genuine field photos must have Location Tags enabled. Screenshots are not accepted.";
            } else {
                statusDiv.className = "verification-text status-real";
                statusDiv.innerHTML = "<i class='fas fa-check-circle'></i> <strong>VERIFIED: Genuine Field Photo.</strong><br>GPS and Timestamp headers authenticated.";
            }
        }, 1200);
    });
}


// Trigger simulation on window load - Add this to your existing window.onload if needed
window.addEventListener('load', simulateFullstackLoad);
// NEW: Helper to update active class for the Home button
function setActive(element) {
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    element.classList.add('active');
}
// Function to handle sidebar highlighting and smooth scrolling
function setActive(element) {
    // Remove active class from all sidebar items
    document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
    // Add active class to the clicked one
    element.classList.add('active');
}

// Ensure your existing scrollToSection is updated to also handle the highlight
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        // Find the sidebar item that corresponds to this section to highlight it
        const sidebarItems = document.querySelectorAll('.sidebar ul li');
        sidebarItems.forEach(li => {
            if(li.innerText.toLowerCase().includes(sectionId.replace('-', ' '))) {
                setActive(li);
            }
        });

        // Professional smooth scroll with offset
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}
function startDispatch(resId, name) {
    const card = document.getElementById(`res-${resId}`);
    const statusText = document.getElementById(`status-${resId}`);
    const progressBar = document.getElementById(`progress-${resId}`);
    const btn = card.querySelector('.btn-request');

    // 1. Immediate Visual Response
    btn.disabled = true;
    btn.innerText = "REQUEST SENT...";
    btn.style.opacity = "0.6";

    // 2. Simulate Network Delay & Verification
    setTimeout(() => {
        progressBar.style.display = "block";
        statusText.className = "avail orange";
        statusText.innerText = "STATUS: DISPATCHING";
        
        // 3. Simulate "Success" from Central Command
        setTimeout(() => {
            btn.innerText = "ON ROUTE";
            btn.style.background = "#10b981"; // Success Green
            console.log(`Resource ${name} linked to current GPS location.`);
        }, 3000);
        
    }, 800);
}
// function executeCommand(resId, resName) {
//     const tile = document.getElementById(`res-${resId}`);
//     const statusText = document.getElementById(`status-${resId}`);
//     const progressDiv = document.getElementById(`progress-${resId}`);
//     const btn = tile.querySelector('button');

//     // 1. Disable button to prevent double-clicks
//     btn.disabled = true;
//     btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> TRANSMITTING...`;
//     btn.style.opacity = "0.7";

//     // 2. Show the progress bar after a short "network delay"
//     setTimeout(() => {
//         progressDiv.style.display = "block";
//         statusText.innerHTML = `● INITIALIZING DISPATCH`;
//         statusText.className = "status-glow-orange";

//         // 3. After the progress bar finishes (3 seconds)
//         setTimeout(() => {
//             tile.classList.add('tile-dispatched');
//             statusText.innerHTML = `● ON ROUTE TO SITE`;
//             statusText.className = "status-glow-green";
//             btn.innerHTML = `<i class="fas fa-check-double"></i> DISPATCHED`;
//             btn.className = "btn-command-locked"; // Turn it grey/inactive
            
//             // Final Notification
//             console.log(`System: ${resName} successfully locked to Nodal Officer coordinates.`);
//         }, 3000);

//     }, 1000);
// }
function executeCommand(resId, resName) {
    const tile = document.getElementById(`res-${resId}`);
    const statusText = document.getElementById(`status-${resId}`);
    const progressDiv = document.getElementById(`progress-${resId}`);
    const btn = tile.querySelector('button');

    // 1. Visual Transmission State
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-satellite-dish fa-spin"></i> UPLINKING...`;
    btn.style.opacity = "0.7";

    setTimeout(() => {
        // 2. Show Progress Bar
        progressDiv.style.display = "block";
        statusText.innerHTML = `● MOBILIZING UNITS`;
        statusText.className = "status-glow-orange";

        // 3. Final Success State after 3 seconds
        setTimeout(() => {
            // Apply specific class based on type
            if(resId.includes('qrt')) {
                tile.classList.add('tile-squad-deployed');
            } else {
                tile.classList.add('tile-dispatched');
            }

            statusText.innerHTML = `● SQUAD DEPLOYED / ON ROUTE`;
            statusText.className = "status-glow-green";
            btn.innerHTML = `<i class="fas fa-check-circle"></i> MISSION ACTIVE`;
            btn.style.background = "#6b7280"; // Neutralize button after action
            
            console.log(`Action: ${resName} has been dispatched to your GPS location.`);
        }, 3000);

    }, 1000);
}
// SIMULATION: Hardware detects water > 2ft
function simulateHardwareAlert() {
    const alertSection = document.getElementById('utility-control');
    alertSection.style.display = 'block'; // Show the emergency card
    alertSection.scrollIntoView({ behavior: 'smooth' });
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
/**
 * Dynamic Profile Syncing
 * This function reflects changes from the bottom profile section 
 * to the top navigation badge in real-time.
 */
function syncProfile() {
    // Get the values from the bottom input fields
    const newName = document.getElementById('input-name').value;
    const newId = document.getElementById('input-id').value;

    // Get the top badge elements
    const topNameDisplay = document.getElementById('top-officer-name');
    const topIdDisplay = document.getElementById('top-officer-id');

    // Update Top Name: If input is empty, revert to default label
    if (newName.trim() !== "") {
        topNameDisplay.innerText = newName.toUpperCase();
    } else {
        topNameDisplay.innerText = "PRIMARY NODAL OFFICER";
    }

    // Update Top ID: If input is empty, revert to default ID
    if (newId.trim() !== "") {
        topIdDisplay.innerText = "ID: " + newId.toUpperCase();
    } else {
        topIdDisplay.innerText = "ID: ND-2026-DEL";
    }
}
/**
 * MULTILINGUAL ENGINE
 * Manages English/Hindi translation for key interface elements
 */
const translations = {
    'en': {
        'main-title': 'NODAL OFFICER INTERFACE',
        'boots-text': 'BOOTS ON THE GROUND',
        'power-btn': 'INITIATE EMERGENCY POWER CUT',
        'search-placeholder': 'Search Nodal Zone (Minto, ITO, Dwarka)...',
        'resource-title': 'EMERGENCY RESOURCE COMMAND'
    },
    'hi': {
        'main-title': 'नोडल अधिकारी इंटरफेस',
        'boots-text': 'ज़मीनी तैयारी (बूट्स ऑन द ग्राउंड)',
        'power-btn': 'आपातकालीन बिजली कटौती शुरू करें',
        'search-placeholder': 'नोडल क्षेत्र खोजें (मिंटो, आईटीओ, द्वारका)...',
        'resource-title': 'आपातकालीन संसाधन कमान'
    }
};

function switchLanguage(lang) {
    // 1. Update Capsule UI
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');
    document.getElementById('btn-hi').classList.toggle('active', lang === 'hi');

    // 2. Global Translation Sweep
    // Finds every element with 'lang-text' and swaps based on data attributes
    const elements = document.querySelectorAll('.lang-text');
    
    elements.forEach(el => {
        const translation = el.getAttribute(`data-${lang}`);
        if (translation) {
            el.innerText = translation;
        }
    });

    // 3. Handle Special Cases (Placeholders)
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.placeholder = lang === 'hi' 
            ? "नोडल क्षेत्र खोजें (मिंटो, आईटीओ)..." 
            : "Search Nodal Zone (Minto, ITO)...";
    }

    // 4. Update dynamic pump status alerts (if currently visible)
    updateMapResultLanguage(lang);
}

// Ensure results generated via map search also respect the language
function updateMapResultLanguage(lang) {
    const suggestionBox = document.getElementById('suggestion-container');
    if (suggestionBox && suggestionBox.innerHTML !== "") {
        // This forces a re-search to regenerate the text in the correct language
        // Or you can manually translate the critical alert strings here
    }
}
