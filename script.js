let currentType = 'text';

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
    });
});

function generateQR() {
    let text = '';
    const generateBtn = document.querySelector('button');
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
    
    // Generate new QR code with a slight delay for better UX
    setTimeout(() => {
        try {
            new QRCode(qrcodeDiv, {
                text: text,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            // Show download button with animation
            const downloadBtn = document.getElementById('download-btn');
            downloadBtn.style.display = 'inline-block';
            downloadBtn.style.opacity = '0';
            setTimeout(() => {
                downloadBtn.style.opacity = '1';
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
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showNotification('QR Code downloaded successfully!', 'success');
    } catch (error) {
        showNotification('Error downloading QR code. Please try again.', 'error');
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

// Add input validation
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function(e) {
        const maxLength = this.getAttribute('maxlength');
        if (e.target.value.length > maxLength) {
            e.target.value = e.target.value.slice(0, maxLength);
            showNotification(`Maximum length is ${maxLength} characters`, 'error');
        }
    });
}); 