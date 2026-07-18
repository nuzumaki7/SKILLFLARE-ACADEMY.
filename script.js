// 1. FAQ Accordion (Open/Close Effect)
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const faqAnswer = button.nextElementSibling;
        const icon = button.querySelector('i');

        if (faqAnswer.style.maxHeight) {
            faqAnswer.style.maxHeight = null;
            icon.style.transform = 'rotate(0deg)';
        } else {
            document.querySelectorAll('.faq-answer').forEach(ans => ans.style.maxHeight = null);
            document.querySelectorAll('.faq-question i').forEach(ico => ico.style.transform = 'rotate(0deg)');
            
            faqAnswer.style.maxHeight = faqAnswer.scrollHeight + "px";
            icon.style.transform = 'rotate(180deg)';
        }
    });
});

// 2. WhatsApp Form Submission
document.getElementById('whatsappForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const course = document.getElementById('course').value;

    const targetWhatsAppNumber = "916367052851";

    const message = `Hello SkillFlare Academy! 👋%0A%0A` +
                    `I would like to register for a course.%0A%0A` +
                    `📝 *Registration Details:*%0A` +
                    `• *Name:* ${encodeURIComponent(name)}%0A` +
                    `• *Phone:* ${encodeURIComponent(phone)}%0A` +
                    `• *Email:* ${encodeURIComponent(email)}%0A` +
                    `• *Selected Course:* 🎓 *${encodeURIComponent(course)}*`;

    const whatsappUrl = `https://wa.me/${targetWhatsAppNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
});
// Ye line aapke pehle wale savedTexts load ke andar honi chahiye
let el = document.getElementById('edit-address');
if(el && parsed['edit-address']) el.innerText = parsed['edit-address'];
