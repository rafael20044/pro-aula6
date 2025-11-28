import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContentModerationService {
    private genAI: GoogleGenerativeAI;

    private readonly modelsToTry = ['gemini-2.5-flash', 'gemini-1.5-flash'];

    constructor() {
    this.genAI = new GoogleGenerativeAI(environment.geminiApiKey);
}

    async validateContent(text: string): Promise<{ valid: boolean; reason?: string; error?: boolean }> {
        for (const modelName of this.modelsToTry) {
            try {
                const timeout = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 10000)
                );

                const model = this.genAI.getGenerativeModel({ model: modelName });

                const prompt = `
                Analiza el siguiente texto y determina si contiene contenido inapropiado (odio, violencia explícita, sexual, acoso).
                Responde SOLO con un objeto JSON con este formato:
                {
                    "valid": boolean, // true si es seguro, false si es inapropiado
                    "reason": "string" // explicación breve si es false, null si es true
                }
                
                Texto: "${text}"
                `;

                const result: any = await Promise.race([
                    model.generateContent(prompt),
                    timeout
                ]);

                const response = await result.response;
                const textResponse = response.text();

                const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                return JSON.parse(cleanJson);
            } catch (error: any) {
                console.warn(`Model ${modelName} failed:`, error);
                
                if (modelName === this.modelsToTry[this.modelsToTry.length - 1]) {
                    console.error('All Gemini models failed.');
                    return { valid: true, error: true };
                }
            }
        }
        return { valid: true, error: true };
    }
}