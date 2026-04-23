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
        try { resolve(JSON.parse(body).data.token); }
        catch (e) { reject(new Error('Signin failed: ' + body)); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testChat(token, model) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Say hello in one word.' }]
    });
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/ai/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = http.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log('\n=== ' + model + ' ===');
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', body.substring(0, 400));
        resolve();
      });
    });
    req.on('error', e => { console.error('REQ ERROR:', e.message); resolve(); });
    req.write(payload);
    req.end();
  });
}

async function main() {
  const token = await signin();
  console.log('Token obtained:', token.substring(0, 50) + '...');
  await testChat(token, 'llama-3.3-70b-versatile');
  await testChat(token, 'google/gemma-4-26b-a4b-it:free');
}

main();
