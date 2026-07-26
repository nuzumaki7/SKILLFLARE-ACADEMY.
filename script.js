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
let activeImageElementTarget = null;

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
        alert("Admin Mode Disabled!");
        return;
    }

    const verificationInput = prompt("Enter Admin Password:");
    if (verificationInput === "TAIYABSAYYEDXYZ") {
        isAdminActive = true;
        document.body.classList.add('admin-mode-active');
        if(btn) btn.innerHTML = '🔒 Exit Admin';
        if(saveBtn) saveBtn.style.display = "inline-block";
        document.querySelectorAll('[data-editable="text"]').forEach(el => el.setAttribute('contenteditable', 'true'));
        alert("Login Successful! Tap on Logo or Trainer image to upload new photos directly from Gallery!");
    } else if (verificationInput !== null) {
        alert("INVALID PASSWORD!");
    }
};

// Save to Cloud
function saveAdminDataOffline() {
    if(!database) { alert("Database Error!"); return; }
    let editablePayload = {};
    document.querySelectorAll('[data-editable="text"]').forEach(el => {
        if(el.id) editablePayload[el.id] = el.innerText;
    });

    let imagesPayload = {};
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        if(img.id && img.src) imagesPayload[img.id] = img.src;
    });

    database.ref('skillflare_data').set({
        texts: editablePayload,
        images: imagesPayload
    }).then(() => {
        alert("All Changes & Gallery Images Saved to Cloud Successfully!");
    }).catch(err => alert("Save Error: " + err.message));
}

// Setup Page Events
document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('globalSaveBtn');
    if(saveBtn) saveBtn.addEventListener('click', saveAdminDataOffline);

    const galleryInput = document.getElementById('galleryFileInput');

    // Click Image to open Mobile Gallery
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        img.addEventListener('click', function() {
            if(isAdminActive) {
                activeImageElementTarget = this;
                galleryInput.click(); // Mobile Gallery Chooser Khulega
            }
        });
    });

    // Process Gallery Selected Photo
    if(galleryInput) {
        galleryInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if(file && activeImageElementTarget) {
                const reader = new FileReader();
                reader.onload = function(evt) {
                    activeImageElementTarget.src = evt.target.result; // Instant preview
                    alert("Image replaced! Click 'Save Changes' to update online.");
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // FAQ Accordion Fix
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqAnswer = button.nextElementSibling;
            faqAnswer.style.display = (faqAnswer.style.display === "block") ? "none" : "block";
        });
    });

    // Fetch Live Data from Firebase
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
                    if(img) img.src = data.images[id];
                });
            }
        });
    }
});
