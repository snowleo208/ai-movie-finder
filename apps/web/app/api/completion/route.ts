import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
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
    const body = await req.json();

    // Validate the request body against the schema
    const validationResult = promptSchema.safeParse(body.prompt);
    if (!validationResult.success) {
        return new Response(
            JSON.stringify({ error: "Invalid prompt structure", details: validationResult.error.errors }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const prompt = validationResult.data;


    console.log(prompt);

    const result = streamText({
        model: groq('llama-3.1-8b-instant'),
        prompt: `
        Suggest one movie that fits the following preferences: 
        Genre: ${prompt.genre}
        Length: ${prompt.hour}
        Include: 
        - Title (with release year) 
        - 1–2 sentence explanation of why it's a good fit

        Return the response in JSON format with the following structure:
        {
            "title": "Movie Title",
            "year": "Year",
            "explanation": "Brief explanation of why this movie fits the preferences.",
        }
        
        Do NOT include more than one movie. Only return one suggestion.`,
    });

    return result.toDataStreamResponse();
}