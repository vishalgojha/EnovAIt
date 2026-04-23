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

function test(token, path, label) {
  return new Promise((resolve) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: path,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + token }
    };
    http.request(options, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log('\n=== ' + label + ' ===');
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', body.substring(0, 400));
        resolve();
      });
    }).end();
  });
}

async function main() {
  const token = await signin();
  await test(token, '/api/v1/workflows/instances', 'Workflow Instances');
}

main();
