const http = require('http');

const EMAIL = 'aitest@enov360.com';
const PASSWORD = 'TestPassword123!';

function signin() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: EMAIL, password: PASSWORD });
    const req = http.request('http://127.0.0.1:3000/api/v1/public/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const token = JSON.parse(body).data.token;
          resolve(token);
        } catch (e) {
          reject(new Error('Signin failed: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function testChat(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is BRSR? Keep it short.' }
      ]
    });
    const req = http.request('http://127.0.0.1:3000/api/v1/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          console.log('\n=== AI CHAT RESPONSE ===');
          const parsed = JSON.parse(body);
          if (parsed.content) {
            console.log('Model:', parsed.model || 'unknown');
            console.log('Provider:', parsed.provider || 'unknown');
            console.log('Content:', parsed.content);
          } else {
            console.log('Error:', JSON.stringify(parsed, null, 2));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error('Chat response parse failed: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    console.log('Step 1: Signing in...');
    const token = await signin();
    console.log('Token obtained:', token.substring(0, 50) + '...');

    console.log('\nStep 2: Testing AI chat...');
    await testChat(token);

    console.log('\n=== TEST COMPLETE ===');
  } catch (err) {
    console.error('ERROR:', err.message);
  }
})();
