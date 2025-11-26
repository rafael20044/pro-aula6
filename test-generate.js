const https = require('https');

const apiKey = 'AIzaSyCV4Y6OyUqjOW68oMfH4u1mr-0-6atA6lc';
const model = 'gemini-pro';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

const data = JSON.stringify({
    contents: [{
        parts: [{ text: "Hello, are you working?" }]
    }]
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = https.request(url, options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log('Response Body:', responseBody);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
