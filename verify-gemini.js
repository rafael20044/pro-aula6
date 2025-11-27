const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyCV4Y6OyUqjOW68oMfH4u1mr-0-6atA6lc";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    const models = ['gemini-1.5-flash', 'gemini-pro'];

    for (const modelName of models) {
        console.log(`Testing model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Hello, are you working?";
            const result = await model.generateContent(prompt);
            const response = await result.response;
            console.log(`Success with ${modelName}:`, response.text());
        } catch (error) {
            console.error(`Error with ${modelName}:`, error.message);
            if (error.response) {
                try {
                    console.error('Response:', await error.response.text());
                } catch (e) {
                    console.error('Could not read response text');
                }
            }
            console.error('Full error:', JSON.stringify(error, null, 2));
        }
    }
}

run();
