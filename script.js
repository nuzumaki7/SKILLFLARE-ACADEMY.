const firebaseConfig = {
  apiKey: "AIzaSyBbUA-8cGkBgh8aGLRDN2QoWMHZoran0bE",
  authDomain: "skillflare-d5bed.firebaseapp.com",
  databaseURL: "https://skillflare-d5bed-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skillflare-d5bed",
  storageBucket: "skillflare-d5bed.firebasestorage.app",
  messagingSenderId: "504817435329",
  appId: "1:504817435329:web:99049c5ed9fefbd891ca40"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = (typeof firebase !== 'undefined') ? firebase.database() : null;

let isAdminActive = false;

// Admin Login
window.initiateSecureAdminLogin = function() {
    const btn = document.getElementById('adminSettingsBtn');
    const saveBtn = document.getElementById('globalSaveBtn');

    if (isAdminActive) {
        isAdminActive = false;
        document.body.classList.remove('admin-mode-active');
        if(btn) btn.innerHTML = '⚙️ Settings';
        if(saveBtn) saveBtn.style.display = "none";
        document.querySelectorAll('[data-editable="text"]').forEach(el => el.setAttribute('contenteditable', 'false'));
        alert("Admin Mode Closed!");
        return;
    }

    const verificationInput = prompt("Enter Admin Password:");
    if (verificationInput === "TAIYABSAYYEDXYZ") {
        isAdminActive = true;
        document.body.classList.add('admin-mode-active');
        if(btn) btn.innerHTML = '🔒 Exit Admin';
        if(saveBtn) saveBtn.style.display = "inline-block";
        document.querySelectorAll('[data-editable="text"]').forEach(el => el.setAttribute('contenteditable', 'true'));
        alert("Admin Login Successful! Click on texts/videos to edit.");
    } else if (verificationInput !== null) {
        alert("INVALID PASSWORD!");
    }
};

// Video URL Change Helper
window.changeVideoUrl = function(iframeId) {
    if(!isAdminActive) return;
    const iframe = document.getElementById(iframeId);
    let newUrl = prompt("Enter YouTube Embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID):", iframe.src);
    if(newUrl) {
        // Convert watch?v= to embed/ if user pastes normal URL
        if(newUrl.includes("watch?v=")) {
            newUrl = newUrl.replace("watch?v=", "embed/");
        }
        iframe.src = newUrl;
    }
};

// Image URL Change Helper
function setupImageEditHandlers() {
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        img.addEventListener('click', function() {
            if(isAdminActive) {
                let newImgUrl = prompt("Enter Image URL (or path like assets/logo.jpg):", this.src);
                if(newImgUrl) this.src = newImgUrl;
            }
        });
    });
}

// Save to Cloud
function saveAdminDataOffline() {
    if(!database) { alert("Database Error!"); return; }

    let editablePayload = {};
    document.querySelectorAll('[data-editable="text"]').forEach(el => {
        if(el.id) editablePayload[el.id] = el.innerText;
    });

    let imagesPayload = {};
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        if(img.id) imagesPayload[img.id] = img.src;
    });

    let videosPayload = {
        'edit-video-1': document.getElementById('edit-video-1')?.src || '',
        'edit-video-2': document.getElementById('edit-video-2')?.src || ''
    };

    database.ref('skillflare_data').set({
        texts: editablePayload,
        images: imagesPayload,
        videos: videosPayload
    }).then(() => {
        alert("All Changes Saved Online Successfully!");
    }).catch(err => alert("Save Error: " + err.message));
}

// Setup Page Events
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('globalSaveBtn');
    if(saveBtn) saveBtn.addEventListener('click', saveAdminDataOffline);

    setupImageEditHandlers();

    // Sync from Firebase
    if(database) {
        database.ref('skillflare_data').on('value', snapshot => {
            const data = snapshot.val();
            if(!data) return;

            if(data.texts) {
                Object.keys(data.texts).forEach(id => {
                    let el = document.getElementById(id);
                    if(el && !isAdminActive) el.innerText = data.texts[id];
                });
            }
            if(data.images) {
                Object.keys(data.images).forEach(id => {
                    let img = document.getElementById(id);
                    if(img && data.images[id]) img.src = data.images[id];
                });
            }
            if(data.videos) {
                if(data.videos['edit-video-1']) document.getElementById('edit-video-1').src = data.videos['edit-video-1'];
                if(data.videos['edit-video-2']) document.getElementById('edit-video-2').src = data.videos['edit-video-2'];
            }
        });
    }
});
