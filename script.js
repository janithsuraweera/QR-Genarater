function generateQR() {
    const text = document.getElementById('qr-text').value;
    if (!text) {
        alert('Please enter some text');
        return;
    }

    // Clear previous QR code
    document.getElementById('qrcode').innerHTML = '';
    
    // Generate new QR code
    new QRCode(document.getElementById('qrcode'), {
        text: text,
        width: 200,
        height: 200,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
    });

    // Show download button
    document.getElementById('download-btn').style.display = 'inline-block';
}

function downloadQR() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
} 