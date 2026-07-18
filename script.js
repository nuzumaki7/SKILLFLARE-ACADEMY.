const firebaseConfig = {
    apiKey: "AIzaSyA4we76ElUQ6xvxmGc4V32NVlocfVTUVDc",
    authDomain: "skillflare-academy.firebaseapp.com",
    databaseURL: "https://skillflare-academy-default-rtdb.firebaseio.com",
    projectId: "skillflare-academy",
    storageBucket: "skillflare-academy.firebasestorage.app",
    messagingSenderId: "512100827561",
    appId: "1:512100827561:web:bf89cf557442e9095444b8"
};

// Initialize Firebase Engine
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Admin Login System
function adminLogin() {
    let pin = prompt("Enter Admin Secure Password Pin:");
    if (pin === "1234") {
        alert("Login Successful! Ab aap text, videos aur changes kar sakte hain.");
        document.body.classList.add('admin-mode-active');
        let saveBtn = document.getElementById('globalSaveBtn');
        if(saveBtn) saveBtn.style.display = "inline-block";
        
        document.querySelectorAll('[data-editable="text"]').forEach(el => {
            el.contentEditable = "true";
        });
    } else if (pin !== null) {
        alert("Galat Password! Access Denied.");
    }
}

// Modify YouTube link
function modifyVideoLink(frameId) {
    if(!document.body.classList.contains('admin-mode-active')) return;
    let currentSrc = document.getElementById(frameId).src;
    let newUrl = prompt("Enter Full YouTube Share/Embed/Shorts Link Here:", currentSrc);
    if(newUrl) {
        let cleanId = extractYoutubeId(newUrl);
        if(cleanId) {
            document.getElementById(frameId).src = "https://www.youtube.com/embed/" + cleanId;
        } else {
            alert("Invalid YouTube URL Format ID.");
        }
    }
}

function extractYoutubeId(url) {
    if (url.includes('shorts/')) {
        let parts = url.split('shorts/');
        if (parts[1]) return parts[1].split(/[?#&]/)[0];
    }
    let regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    let match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Save Changes
function saveAdminDataOffline() {
    let editablePayload = {};
    document.querySelectorAll('[data-editable="text"]').forEach(el => {
        editablePayload[el.id] = el.innerText;
    });
    
    let imagesPayload = {};
    document.querySelectorAll('[data-editable="image"]').forEach(img => {
        if(img.src) imagesPayload[img.id] = img.src;
    });

    let videosPayload = {
        "vid-frame-1": document.getElementById('vid-frame-1') ? document.getElementById('vid-frame-1').src : "",
        "vid-frame-2": document.getElementById('vid-frame-2') ? document.getElementById('vid-frame-2').src : ""
    };
    
    let container = document.getElementById('reviewsContainer');
    let reviewsPayload = container ? container.innerHTML : "";

    database.ref('skillflare_data').set({
        texts: editablePayload,
        images: imagesPayload,
        videos: videosPayload,
        reviews: reviewsPayload
    }).then(() => {
        alert("All changes saved onto Firebase Cloud Database permanently!");
        document.querySelectorAll('[data-editable="text"]').forEach(el => {
            el.contentEditable = "false";
        });
        document.body.classList.remove('admin-mode-active');
        let saveBtn = document.getElementById('globalSaveBtn');
        if(saveBtn) saveBtn.style.display = "none";
    }).catch((error) => {
        alert("Database write error: " + error.message);
    });
}

// Toggle review window
function toggleReviewForm() {
    let block = document.getElementById('reviewFormBlock');
    if(block) block.style.display = block.style.display === "block" ? "none" : "block";
}

// Add user review
function submitUserReview() {
    let name = document.getElementById('revName').value.trim();
    let stars = document.getElementById('revStars').value;
    let msg = document.getElementById('revMessage').value.trim();
    if(!name || !msg) { alert("Please fill name and review text!"); return; }
    
    let html = `<div class="individual-review-item">
        <button type="button" class="review-delete-btn">✖</button>
        <div class="review-meta-info">${name}</div>
        <div class="review-stars">${stars}</div>
        <div class="review-user-text">"${msg}"</div>
    </div>`;
    
    let container = document.getElementById('reviewsContainer');
    if(container) container.insertAdjacentHTML('beforeend', html);
    
    document.getElementById('revName').value = "";
    document.getElementById('revMessage').value = "";
    toggleReviewForm();
    
    if(document.body.classList.contains('admin-mode-active')) {
        saveAdminDataOffline();
    } else {
        alert("Review added locally! Admin login karke 'Save Changes' dabayein taaki permanently save ho jaye.");
    }
}

// Dom Loader Event Listener
window.addEventListener('DOMContentLoaded', () => {
    
    // Dynamic Event Bindings for Buttons
    if(document.getElementById('adminSettingsBtn')) {
        document.getElementById('adminSettingsBtn').addEventListener('click', adminLogin);
    }
    
    if(document.getElementById('globalSaveBtn')) {
        document.getElementById('globalSaveBtn').addEventListener('click', saveAdminDataOffline);
    }
    
    if(document.getElementById('addReviewTrigger')) {
        document.getElementById('addReviewTrigger').addEventListener('click', toggleReviewForm);
    }
    
    if(document.getElementById('submitReviewBtn')) {
        document.getElementById('submitReviewBtn').addEventListener('click', submitUserReview);
    }

    if(document.getElementById('overlay-frame-1')) {
        document.getElementById('overlay-frame-1').addEventListener('click', () => modifyVideoLink('vid-frame-1'));
    }

    if(document.getElementById('overlay-frame-2')) {
        document.getElementById('overlay-frame-2').addEventListener('click', () => modifyVideoLink('vid-frame-2'));
    }

    // Delete reviews dynamic delegation
    if(document.getElementById('reviewsContainer')) {
        document.getElementById('reviewsContainer').addEventListener('click', (e) => {
            if(e.target.classList.contains('review-delete-btn')) {
                if(confirm("Delete this review permanently?")) {
                    e.target.parentElement.remove();
                    if(document.body.classList.contains('admin-mode-active')) saveAdminDataOffline();
                }
            }
        });
    }

    // Accordion Control System
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            const icon = button.querySelector('i');
            if(answer.style.display === "block") {
                answer.style.display = "none";
                if(icon) icon.className = "fas fa-chevron-down";
            } else {
                answer.style.display = "block";
                if(icon) icon.className = "fas fa-chevron-up";
            }
        });
    });

    // Sync Live Data from Cloud 
    database.ref('skillflare_data').on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        if (data.texts) {
            Object.keys(data.texts).forEach(id => {
                let el = document.getElementById(id);
                if(el) el.innerText = data.texts[id];
            });
        }
        if (data.images) {
            Object.keys(data.images).forEach(id => {
                let img = document.getElementById(id);
                if(img) img.src = data.images[id];
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
});

if(document.getElementById('whatsappForm')) {
    document.getElementById('whatsappForm').addEventListener('submit', function(e) {
        e.preventDefault();
        let name = document.getElementById('name').value;
        let phone = document.getElementById('phone').value;
        let email = document.getElementById('email').value;
        let course = document.getElementById('course').value;
        let txt = `Hello SkillFlare Academy, I want to register.%0A*Name:* ${name}%0A*WhatsApp:* ${phone}%0A*Email:* ${email}%0A*Course:* ${course}`;
        window.open(`https://wa.me/915121008275?text=${txt}`, '_blank');
    });
}
