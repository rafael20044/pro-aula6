const https = require('https');
const fs = require('fs');

const apiKey = 'AIzaSyCV4Y6OyUqjOW68oMfH4u1mr-0-6atA6lc';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                const geminiModels = json.models.filter(m => m.name.includes('gemini'));
                fs.writeFileSync('verification_result.json', JSON.stringify(geminiModels, null, 2));
                console.log('Found ' + geminiModels.length + ' Gemini models.');
            } else {
                console.log('No models found.');
                fs.writeFileSync('verification_result.json', JSON.stringify(json, null, 2));
            }
        } catch (e) {
            console.error(e);
        }
    });
}).on('error', err => console.error(err));
