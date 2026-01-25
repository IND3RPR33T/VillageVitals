// Quick test script to verify Cloudinary setup
const https = require('https');
const fs = require('fs');

const CLOUD_NAME = 'dtp3kdr12';
const UPLOAD_PRESET = 'smart_health_uploads';

console.log('🧪 Testing Cloudinary Configuration...');
console.log('☁️  Cloud Name:', CLOUD_NAME);
console.log('🔧 Upload Preset:', UPLOAD_PRESET);

// Test with a simple data URL (1x1 pixel PNG)
const testImageDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const formData = `------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="file"\r\n\r\n${testImageDataURL}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="upload_preset"\r\n\r\n${UPLOAD_PRESET}\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n`;

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${CLOUD_NAME}/image/upload`,
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW',
    'Content-Length': Buffer.byteLength(formData)
  }
};

const req = https.request(options, (res) => {
  console.log('📡 Response Status:', res.statusCode);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (res.statusCode === 200) {
        console.log('✅ Cloudinary test successful!');
        console.log('🖼️  Image URL:', result.secure_url);
        console.log('📏 Dimensions:', result.width + 'x' + result.height);
      } else {
        console.log('❌ Cloudinary test failed:', result);
      }
    } catch (error) {
      console.log('❌ Error parsing response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request error:', error.message);
});

req.write(formData);
req.end();