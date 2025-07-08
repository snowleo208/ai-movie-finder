import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

export const maxDuration = 30;

const promptSchema = z.string().refine((value) => {
    try {
        JSON.parse(value);
        return true;
    } catch (_) {
        return false;
    }
}).transform((value) => JSON.parse(value));

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const validationResult = promptSchema.safeParse(body.prompt);

        if (!validationResult.success) {
            return new Response(
                JSON.stringify({ error: "Invalid prompt structure", details: validationResult.error.errors }),
                { status: 400, headers: { 'Content-Type': 'application/json' }, statusText: 'Invalid prompt structure' }
            );
        }

        const prompt = validationResult.data;

        const result = streamText({
            model: groq('llama-3.1-8b-instant'),
            onError: (error) => {
                console.error("Error in AI response:", error)
            },
            prompt: `
        Suggest one movie that fits the following preferences: 
        Genre: ${prompt.genre}
        Length: ${prompt.hour}
        Include: 
        - Title (with release year) 
        - 500 words (without spoilers) of why it's a good fit
        
        Do NOT include more than one movie. Only return one suggestion.`,
        });

        return result.toDataStreamResponse();
    } catch (e) {
        console.error("Error processing request:", e);
        return new Response(
            JSON.stringify({ error: "An error occurred while processing your request." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}