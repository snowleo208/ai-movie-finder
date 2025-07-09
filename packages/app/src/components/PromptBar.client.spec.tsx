import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PromptBar } from "./PromptBar.client";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { Theme } from "@radix-ui/themes";
import { simulateReadableStream } from "ai";

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
    return render(
        <Theme
            accentColor="pink"
            grayColor="mauve"
            radius="large"
            scaling="100%"
        ><PromptBar />
        </Theme>);
};

describe("Prompt Bar", () => {
    it("renders correctly", () => {
        renderComponent();
        expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    });

    it("displays loading state when submitting", async () => {
        renderComponent();
        const submitButton = screen.getByRole("button", { name: "Submit" });
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

        const submitButton = screen.getByRole("button", { name: "Submit" });
        fireEvent.click(submitButton);

        expect(await screen.findByText(expectedText)).toBeInTheDocument();
    });

    it("stops messages when user clicked stop button", async () => {
        jest.useFakeTimers();

        server.use(
            http.post('/api/completion', async () => {
                const stream = simulateReadableStream({
                    chunkDelayInMs: 200,
                    chunks: [
                        `0:"First "\n`,
                        `0:"second "\n`,
                        `0:"third "\n`,
                        `0:"fourth "\n`,
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

        renderComponent();

        const submitButton = screen.getByRole("button", { name: "Submit" });
        fireEvent.click(submitButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(200);
        })

        expect(await screen.findByText("First")).toBeInTheDocument();


        const stopButton = screen.getByRole("button", { name: "Stop" });
        fireEvent.click(stopButton);

        jest.advanceTimersByTime(1000);

        await waitFor(() => {
            expect(screen.queryByText("third")).not.toBeInTheDocument();
        });

        expect(await screen.findByTestId("completion")).toHaveTextContent('First');

        jest.useRealTimers();

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

        const submitButton = screen.getByRole("button", { name: "Submit" });
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

        const submitButton = screen.getByRole("button", { name: "Submit" });
        fireEvent.click(submitButton);

        expect(await screen.findByText("Loading...")).toBeInTheDocument();

        expect(await screen.findByText("First part")).toBeInTheDocument();


        const errorText = await screen.findByText("You have reached the limit of requests.");
        expect(errorText).toBeInTheDocument();
    });

    it("displays error message on API failure", async () => {
        server.use(
            http.post('/api/completion', () => {
                return new HttpResponse(null, { status: 500 })
            })
        );

        renderComponent();
        const submitButton = screen.getByRole("button", { name: "Submit" });
        fireEvent.click(submitButton);

        const errorText = await screen.findByText("Sorry, something went wrong.");
        expect(errorText).toBeInTheDocument();
    });
});