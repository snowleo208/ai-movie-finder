import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { simulateReadableStream } from "ai";
import { MovieFinder } from "./MovieFinder.client";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { renderWithProviders } from "../../utils/renderWithProviders";

const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

const server = setupServer(
    http.post('/api/completion', async ({ request }) => {
        const data = await request.clone().json();

        const prompt = JSON.parse(data.prompt);

        const genreText = prompt.genre ? `${String(prompt.genre).toLowerCase()} movie` : 'movie';
        const hourText = prompt.hour ?? 'no length specified';

        // https://ai-sdk.dev/docs/ai-sdk-core/testing#simulate-data-stream-protocol-responses
        const stream = simulateReadableStream({
            initialDelayInMs: 1,
            chunkDelayInMs: 5,
            chunks: [
                `0:"This"\n`,
                `0:" is a "\n`,
                `0:"${hourText} example ${genreText}. "\n`,
                `e:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50},"isContinued":false}\n`,
                `d:{"finishReason":"stop","usage":{"promptTokens":20,"completionTokens":50}}\n`,
            ],
        }).pipeThrough(new TextEncoderStream());

        return new HttpResponse(stream, {
            status: 200,
            headers: {
                'X-Vercel-AI-Data-Stream': 'v1',
                'Content-Type': 'text/plain; charset=utf-8',
            },
        });
    }),
);

beforeAll(() => server.listen());

afterEach(() => {
    jest.clearAllMocks();
    server.resetHandlers();
});
afterAll(() => server.close());

const renderComponent = () => {
    return renderWithProviders(
        <MovieFinder />
    );
};

describe("MovieFinder", () => {
    it("renders correctly", () => {
        renderComponent();
        expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();
    });

    it("displays loading state when submitting", async () => {
        renderComponent();
        const submitButton = screen.getByRole("button", { name: "Ask" });
        fireEvent.click(submitButton);

        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it.each([
        ['genre to Romance', 'Select genre', 'Romance', 'This is a 2 hours example romance movie.'],
        ['genre to Mystery', 'Select genre', 'Mystery', 'This is a 2 hours example mystery movie.'],
        ['genre to Sci-Fi', 'Select genre', 'Sci-Fi', 'This is a 2 hours example sci-fi movie.'],
        ['length to 1 hour', 'Select length', '1 hour', 'This is a 1 hour example mystery movie.'],
        ['length to 2 hours', 'Select length', '2 hours', 'This is a 2 hours example mystery movie.'],
        ['length to 2 hours+', 'Select length', '2 hours+', 'This is a 2 hours+ example mystery movie.'],
    ])("displays results when changed %s", async (_, selectLabel, optionName, expectedText) => {
        renderComponent();

        const select = screen.getByRole("combobox", { name: selectLabel });
        expect(select).toBeInTheDocument();
        fireEvent.click(select);

        const option = screen.getByRole('option', { name: optionName });
        fireEvent.click(option);

        const submitButton = screen.getByRole("button", { name: "Ask" });
        fireEvent.click(submitButton);

        expect(await screen.findByText(expectedText)).toBeInTheDocument();
    });

    it("stops when user clicked 'Stop' button", async () => {
        const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

        renderComponent();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(screen.getByRole("button", { name: "Ask" })).toBeInTheDocument();

        fireEvent.click(askButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();

        expect(abortSpy).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        const stopButton = screen.getByRole("button", { name: "Stop" });
        fireEvent.click(stopButton);


        // Note: This test confirms that the Stop button triggers the SDK's abort logic.
        // Due to MSW limitations, the mock fetch stream cannot respond to AbortSignal coming from Vercel ai-sdk.
        // Unfortunately, this test does NOT verify that streaming is halted mid-request, it only asserts that .abort() was called.
        expect(abortSpy).toHaveBeenCalledTimes(1);
    });

    it("displays malformed chunks with an error message", async () => {
        server.use(
            http.post('/api/completion', () => {
                const stream = simulateReadableStream({
                    chunks: [
                        `0:"First part "\n`,
                        `⚠️bad data\n`,
                        `0:"Second part"\n`,
                        `d:{"finishReason":"stop"}\n`,
                    ],
                }).pipeThrough(new TextEncoderStream());

                return new HttpResponse(stream, {
                    status: 200,
                    headers: {
                        'X-Vercel-AI-Data-Stream': 'v1',
                        'Content-Type': 'text/plain; charset=utf-8',
                    },
                });
            })
        );

        renderComponent();

        const submitButton = screen.getByRole("button", { name: "Ask" });
        fireEvent.click(submitButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();

        expect(await screen.findByText("First part")).toBeInTheDocument();


        const errorText = await screen.findByText("Sorry, something went wrong.");
        expect(errorText).toBeInTheDocument();

        expect(screen.queryByText("Second part")).not.toBeInTheDocument();

    });

    it("displays an error message when there's a rate-limit error", async () => {
        server.use(
            http.post('/api/completion', () => {
                const stream = simulateReadableStream({
                    chunks: [
                        `0:"First part "\n`,
                        '3:"OpenAI: rate-limit exceeded"\n',
                        'e:{"finishReason":"error","usage":{"promptTokens":20,"completionTokens":0},"isContinued":false}\n',
                        'd:{"finishReason":"error","usage":{"promptTokens":20,"completionTokens":0}}\n',
                    ],
                }).pipeThrough(new TextEncoderStream());

                return new HttpResponse(stream, {
                    status: 200,
                    headers: {
                        'X-Vercel-AI-Data-Stream': 'v1',
                        'Content-Type': 'text/plain; charset=utf-8',
                    },
                });
            })
        );

        renderComponent();

        const submitButton = screen.getByRole("button", { name: "Ask" });
        fireEvent.click(submitButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();

        expect(await screen.findByText("First part")).toBeInTheDocument();


        const errorText = await screen.findByText("You have reached the limit of requests.");
        expect(errorText).toBeInTheDocument();
    });

    it("displays error message on network error", async () => {
        server.use(
            http.post('/api/completion', () => {
                return HttpResponse.error()
            })
        );

        renderComponent();
        const submitButton = screen.getByRole("button", { name: "Ask" });
        fireEvent.click(submitButton);

        const errorText = await screen.findByText("Sorry, something went wrong.");
        expect(errorText).toBeInTheDocument();
    });
});