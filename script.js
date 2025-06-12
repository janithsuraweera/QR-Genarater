function generateQR() {
    const text = document.getElementById('qr-text').value;
    const generateBtn = document.querySelector('button');
    const qrcodeDiv = document.getElementById('qrcode');
    
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
document.getElementById('qr-text').addEventListener('input', function(e) {
    const maxLength = 1000; // Maximum length for QR code content
    if (e.target.value.length > maxLength) {
        e.target.value = e.target.value.slice(0, maxLength);
        showNotification(`Maximum length is ${maxLength} characters`, 'error');
    }
}); 