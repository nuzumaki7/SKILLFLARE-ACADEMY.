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

// Admin Login Handler
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
        alert("Admin Login Successful! Click on logo, images or video overlays to update.");
    } else if (verificationInput !== null) {
        alert("INVALID PASSWORD!");
    }
};

// Video Link Modification Handler
window.modifyVideoLink = function(iframeId) {
    if(!isAdminActive) {
        alert("Please login to Admin Mode first!");
        return;
    }
    const iframe = document.getElementById(iframeId);
    if(!iframe) return;

    let inputUrl = prompt("Enter YouTube URL (e.g., https://www.youtube.com/watch?v=XXXX or embed link):", iframe.src);
    if(inputUrl && inputUrl.trim() !== "") {
        let cleanUrl = inputUrl.trim();
        if(cleanUrl.includes("watch?v=")) {
            const videoId = cleanUrl.split("v=")[1].split("&")[0];
            cleanUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (cleanUrl.includes("youtu.be/")) {
            const videoId = cleanUrl.split("youtu.be/")[1].split("?")[0];
            cleanUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        iframe.src = cleanUrl;
        alert("Video updated! Click 'Save Changes' at bottom to persist online.");
    }
};

// Save All Edits to Firebase Realtime Database
function saveAdminDataOffline() {
    if(!database) {
        alert("Firebase connection failed!");
        return;
    }
    let editablePayload = {};
    document.querySelectorAll('[data-editable="text"]').forEach(el => {
        if(el.id) editablePayload[el.id] = el.innerText;
    });

    let imagesPayload = {};
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        if(img.id && img.src && !img.src.includes('undefined')) {
            imagesPayload[img.id] = img.src;
        }
    });

    let v1 = document.getElementById('vid-frame-1');
    let v2 = document.getElementById('vid-frame-2');
    let videosPayload = {
        "vid-frame-1": v1 ? v1.src : "",
        "vid-frame-2": v2 ? v2.src : ""
    };

    let container = document.getElementById('reviewsContainer');
    let reviewsPayload = container ? container.innerHTML : "";

    database.ref('skillflare_data').set({
        texts: editablePayload,
        images: imagesPayload,
        videos: videosPayload,
        reviews: reviewsPayload
    }).then(() => {
        alert("All changes saved onto Cloud Database successfully!");
    }).catch((error) => {
        alert("Save Error: " + error.message);
    });
}

// Toggle Review Form
function toggleReviewForm() {
    let block = document.getElementById('reviewFormBlock');
    if(block) block.style.display = (block.style.display === "block") ? "none" : "block";
}

// Submit User Review
function submitUserReview() {
    let nameEl = document.getElementById('revName');
    let starsEl = document.getElementById('revStars');
    let msgEl = document.getElementById('revMessage');

    if(!nameEl || !msgEl) return;
    let name = nameEl.value.trim();
    let stars = starsEl.value;
    let msg = msgEl.value.trim();

    if(!name || !msg) { alert("Please fill name and review text!"); return; }

    let html = `<div class="individual-review-item">
        <button type="button" class="review-delete-btn">✖</button>
        <div class="review-meta-info">${name}</div>
        <div class="review-stars">${stars}</div>
        <div class="review-user-text">"${msg}"</div>
    </div>`;

    let container = document.getElementById('reviewsContainer');
    if(container) container.insertAdjacentHTML('beforeend', html);

    nameEl.value = "";
    msgEl.value = "";
    toggleReviewForm();
}

// Setup Event Listeners
function setupEventListeners() {
    const saveBtn = document.getElementById('globalSaveBtn');
    if(saveBtn) {
        saveBtn.addEventListener('click', saveAdminDataOffline);
    }

    const reviewTrigger = document.getElementById('addReviewTrigger');
    if(reviewTrigger) reviewTrigger.addEventListener('click', toggleReviewForm);

    const reviewSubmit = document.getElementById('submitReviewBtn');
    if(reviewSubmit) reviewSubmit.addEventListener('click', submitUserReview);

    const overlay1 = document.getElementById('overlay-frame-1');
    if(overlay1) overlay1.addEventListener('click', () => window.modifyVideoLink('vid-frame-1'));

    const overlay2 = document.getElementById('overlay-frame-2');
    if(overlay2) overlay2.addEventListener('click', () => window.modifyVideoLink('vid-frame-2'));

    // Image Editing
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        img.addEventListener('click', function() {
            if(isAdminActive) {
                let newImgUrl = prompt("Enter Image URL link or relative path (e.g., assets/logo.jpg):", this.src);
                if (newImgUrl && newImgUrl.trim() !== "") {
                    this.src = newImgUrl.trim();
                    alert("Image updated locally! Remember to click 'Save Changes'.");
                }
            }
        });
    });

    // Delete Review Handler
    const reviewsContainer = document.getElementById('reviewsContainer');
    if(reviewsContainer) {
        reviewsContainer.addEventListener('click', (e) => {
            if(e.target.classList.contains('review-delete-btn')) {
                if(confirm("Delete this review permanently?")) {
                    e.target.parentElement.remove();
                }
            }
        });
    }

    // FAQ Accordion Fix
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const faqAnswer = button.nextElementSibling;
            if (faqAnswer.style.display === "block") {
                faqAnswer.style.display = "none";
            } else {
                document.querySelectorAll('.faq-answer').forEach(ans => ans.style.display = "none");
                faqAnswer.style.display = "block";
            }
        });
    });

    // Database Sync Handler
    if(database) {
        database.ref('skillflare_data').on('value', (snapshot) => {
            const data = snapshot.val();
            if (!data) return;

            if (data.texts) {
                Object.keys(data.texts).forEach(id => {
                    let el = document.getElementById(id);
                    if(el && !isAdminActive) {
                        el.innerText = data.texts[id];
                    }
                });
            }
            if (data.images) {
                Object.keys(data.images).forEach(id => {
                    let img = document.getElementById(id);
                    if(img && data.images[id] && data.images[id].trim() !== "") {
                        img.src = data.images[id];
                    }
                });
            }
            if (data.videos) {
                if(data.videos["vid-frame-1"] && document.getElementById('vid-frame-1')) {
                    document.getElementById('vid-frame-1').src = data.videos["vid-frame-1"];
                }
                if(data.videos["vid-frame-2"] && document.getElementById('vid-frame-2')) {
                    document.getElementById('vid-frame-2').src = data.videos["vid-frame-2"];
                }
            }
            if (data.reviews && data.reviews.trim() !== "" && document.getElementById('reviewsContainer')) {
                document.getElementById('reviewsContainer').innerHTML = data.reviews;
            }
        });
    }

    // WhatsApp Form Submit
    const waForm = document.getElementById('whatsappForm');
    if(waForm) {
        waForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const phone = document.getElementById('phone').value;
            const email = document.getElementById('email').value;
            const course = document.getElementById('course').value;

            const message = `Hello SkillFlare Academy! 👋%0A%0A` +
                            `I would like to register for a course.%0A%0A` +
                            `📝 *Registration Details:*%0A` +
                            `• *Name:* ${encodeURIComponent(name)}%0A` +
                            `• *Phone:* ${encodeURIComponent(phone)}%0A` +
                            `• *Email:* ${encodeURIComponent(email)}%0A` +
                            `• *Selected Course:* 🎓 *${encodeURIComponent(course)}*`;

            window.open(`https://wa.me/916367052851?text=${message}`, '_blank');
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
      }
