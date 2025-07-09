import { simulateReadableStream } from "ai";
import { POST } from "./route"
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

const server = setupServer(
    http.post('https://api.groq.com/openai/v1/chat/completions', () => {
        const rawStream = simulateReadableStream({
            chunks: [
                `0:"Hello"\n`,
                `0:" world!"\n`,
                `d:{"finishReason":"stop"}\n`,
            ],
        });

        const encodedStream = rawStream.pipeThrough(new TextEncoderStream());

        return new HttpResponse(encodedStream, {
            status: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1',
            },
        });
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
    process.env['GROQ_API_KEY'] = '1234567'
})

afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
    delete process.env['GROQ_API_KEY'];
});

describe('api/completion', () => {
    it('should return a successful response', async () => {
        const mockRequest = new Request('http://localhost/api/completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: JSON.stringify({
                    genre: "Action",
                    hour: "2"
                })
            })
        });

        const response = await POST(mockRequest);

        expect(response.status).toEqual(200);
        expect(response.body).toBeInstanceOf(ReadableStream);
    });

    it('should return error when prompt data is invalid', async () => {
        const mockRequest = new Request('http://localhost/api/completion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: 12345
            })
        });

        const response = await POST(mockRequest);

        expect(response.status).toEqual(400);
        expect(response.statusText).toEqual('Invalid prompt structure');
    });
})