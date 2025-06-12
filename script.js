let currentType = 'text';
let currentCategory = 'basic';
let logoImage = null;

// Initialize type selector
document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update current type
        currentType = btn.dataset.type;
        
        // Show/hide input fields
        document.querySelectorAll('.input-group').forEach(group => {
            group.style.display = 'none';
        });
        document.getElementById(`${currentType}-input`).style.display = 'block';
        
        // Clear QR code
        document.getElementById('qrcode').innerHTML = '';
        document.getElementById('download-btn').style.display = 'none';
        document.getElementById('share-btn').style.display = 'none';
    });
});

// Initialize category selector
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update current category
        currentCategory = btn.dataset.category;
        
        // Show/hide type buttons based on category
        const typeButtons = document.querySelectorAll('.type-btn');
        typeButtons.forEach(typeBtn => {
            const type = typeBtn.dataset.type;
            switch(currentCategory) {
                case 'basic':
                    if (['text', 'url'].includes(type)) {
                        typeBtn.style.display = 'flex';
                    } else {
                        typeBtn.style.display = 'none';
                    }
                    break;
                case 'social':
                    if (['whatsapp', 'email'].includes(type)) {
                        typeBtn.style.display = 'flex';
                    } else {
                        typeBtn.style.display = 'none';
                    }
                    break;
                case 'business':
                    if (['vcard'].includes(type)) {
                        typeBtn.style.display = 'flex';
                    } else {
                        typeBtn.style.display = 'none';
                    }
                    break;
                case 'contact':
                    if (['phone', 'vcard'].includes(type)) {
                        typeBtn.style.display = 'flex';
                    } else {
                        typeBtn.style.display = 'none';
                    }
                    break;
            }
        });

        // Reset to first visible type
        const firstVisibleType = document.querySelector('.type-btn[style="display: flex;"]');
        if (firstVisibleType) {
            firstVisibleType.click();
        }
    });
});

// Handle customization options
document.getElementById('qr-size').addEventListener('input', function(e) {
    document.getElementById('size-value').textContent = `${e.target.value}px`;
});

document.getElementById('logo-upload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showNotification('Logo file size should be less than 5MB', 'error');
            this.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            logoImage = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function generateQR() {
    let text = '';
    const generateBtn = document.querySelector('.generate-btn');
    const qrcodeDiv = document.getElementById('qrcode');
    
    // Get text based on current type
    switch(currentType) {
        case 'text':
            text = document.getElementById('qr-text').value;
            break;
        case 'url':
            text = document.getElementById('qr-url').value;
            if (text && !text.startsWith('http://') && !text.startsWith('https://')) {
                text = 'https://' + text;
            }
            break;
        case 'phone':
            text = document.getElementById('qr-phone').value;
            if (text) {
                text = 'tel:' + text.replace(/[^0-9+]/g, '');
            }
            break;
        case 'whatsapp':
            const number = document.getElementById('qr-whatsapp').value;
            const message = document.getElementById('qr-whatsapp-message').value;
            if (number) {
                text = 'https://wa.me/' + number.replace(/[^0-9+]/g, '');
                if (message) {
                    text += '?text=' + encodeURIComponent(message);
                }
            }
            break;
        case 'email':
            const emailAddress = document.getElementById('qr-email').value;
            const emailSubject = document.getElementById('qr-email-subject').value;
            const emailBody = document.getElementById('qr-email-body').value;
            if (emailAddress) {
                text = `mailto:${emailAddress}`;
                if (emailSubject || emailBody) {
                    text += '?';
                    if (emailSubject) text += `subject=${encodeURIComponent(emailSubject)}`;
                    if (emailBody) text += `${emailSubject ? '&' : ''}body=${encodeURIComponent(emailBody)}`;
                }
            }
            break;
        case 'vcard':
            const name = document.getElementById('vcard-name').value;
            const phone = document.getElementById('vcard-phone').value;
            const vcardEmail = document.getElementById('vcard-email').value;
            const company = document.getElementById('vcard-company').value;
            const title = document.getElementById('vcard-title').value;
            
            if (name || phone || vcardEmail) {
                text = 'BEGIN:VCARD\nVERSION:3.0\n';
                if (name) text += `FN:${name}\n`;
                if (phone) text += `TEL:${phone}\n`;
                if (vcardEmail) text += `EMAIL:${vcardEmail}\n`;
                if (company) text += `ORG:${company}\n`;
                if (title) text += `TITLE:${title}\n`;
                text += 'END:VCARD';
            }
            break;
    }

    if (!text) {
        showNotification('Please enter some text', 'error');
        return;
    }

    // Add loading state
    generateBtn.classList.add('loading');
    generateBtn.disabled = true;

    // Clear previous QR code
    qrcodeDiv.innerHTML = '';
    
    // Get customization options
    const size = document.getElementById('qr-size').value;
    const qrColor = document.getElementById('qr-color').value;
    const bgColor = document.getElementById('bg-color').value;
    const errorCorrection = document.getElementById('error-correction').value;
    
    // Generate new QR code with a slight delay for better UX
    setTimeout(() => {
        try {
            new QRCode(qrcodeDiv, {
                text: text,
                width: parseInt(size),
                height: parseInt(size),
                colorDark: qrColor,
                colorLight: bgColor,
                correctLevel: QRCode.CorrectLevel[errorCorrection]
            });

            // Add logo if exists
            if (logoImage) {
                const canvas = qrcodeDiv.querySelector('canvas');
                const ctx = canvas.getContext('2d');
                const logoSize = size * 0.2; // 20% of QR code size
                const logoX = (size - logoSize) / 2;
                const logoY = (size - logoSize) / 2;

                const logo = new Image();
                logo.src = logoImage;
                logo.onload = function() {
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
                    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
                };
            }

            // Show buttons with animation
            const downloadBtn = document.getElementById('download-btn');
            const shareBtn = document.getElementById('share-btn');
            downloadBtn.style.display = 'inline-block';
            shareBtn.style.display = 'inline-block';
            downloadBtn.style.opacity = '0';
            shareBtn.style.opacity = '0';
            setTimeout(() => {
                downloadBtn.style.opacity = '1';
                shareBtn.style.opacity = '1';
            }, 100);

            showNotification('QR Code generated successfully!', 'success');
        } catch (error) {
            showNotification('Error generating QR code. Please try again.', 'error');
        } finally {
            // Remove loading state
            generateBtn.classList.remove('loading');
            generateBtn.disabled = false;
        }
    }, 500);
}

function downloadQR() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }

    try {
        const link = document.createElement('a');
        link.download = `qrcode-${currentType}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showNotification('QR Code downloaded successfully!', 'success');
    } catch (error) {
        showNotification('Error downloading QR code. Please try again.', 'error');
    }
}

function shareQR() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }

    if (navigator.share) {
        canvas.toBlob(blob => {
            const file = new File([blob], `qrcode-${currentType}.png`, { type: 'image/png' });
            navigator.share({
                title: 'My QR Code',
                text: 'Check out this QR code I generated!',
                files: [file]
            }).catch(error => {
                showNotification('Error sharing QR code', 'error');
            });
        });
    } else {
        showNotification('Sharing is not supported on your device', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add styles
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 24px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.zIndex = '1000';
    notification.style.animation = 'slideIn 0.3s ease-out';
    notification.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#22c55e';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function showAbout() {
    const modal = document.getElementById('about-modal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('about-modal');
    modal.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('about-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Add input validation
document.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', function(e) {
        const maxLength = this.getAttribute('maxlength');
        if (maxLength && e.target.value.length > maxLength) {
            e.target.value = e.target.value.slice(0, maxLength);
            showNotification(`Maximum length is ${maxLength} characters`, 'error');
        }
    });
});

// Initialize color inputs with proper format
document.getElementById('qr-color').value = '#000000';
document.getElementById('bg-color').value = '#FFFFFF';

// Add color input validation
document.querySelectorAll('input[type="color"]').forEach(input => {
    input.addEventListener('input', function(e) {
        if (!/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
            e.target.value = '#000000';
            showNotification('Please enter a valid color code', 'error');
        }
    });
});

// Initialize the first category
document.querySelector('.category-btn[data-category="basic"]').click(); 