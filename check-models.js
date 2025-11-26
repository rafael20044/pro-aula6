const fs = require('fs');

try {
    const data = fs.readFileSync('models_list.json', 'utf8');
    const json = JSON.parse(data);
    if (json.models) {
        console.log('--- MODELS START ---');
        json.models.forEach(m => console.log(m.name));
        console.log('--- MODELS END ---');
    } else {
        console.log('No models found in JSON');
    }
} catch (e) {
    console.error(e);
}
