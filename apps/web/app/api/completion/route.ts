import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { prompt }: { prompt: string } = await req.json();

    const result = streamText({
        model: groq('llama-3.1-8b-instant'),
        prompt: `Write a haiku using this pharse: ${prompt}. Must involve keyword: Kawaii.`,
    });

    return result.toDataStreamResponse();
}