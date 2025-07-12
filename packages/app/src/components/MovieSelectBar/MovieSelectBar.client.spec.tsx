import { screen } from "@testing-library/react";
import { MovieSelectBar, MovieSelectBarProps } from "./MovieSelectBar.client";
import { renderWithProviders } from "../../utils/renderWithProviders";

global.HTMLElement.prototype.scrollIntoView = jest.fn();
global.HTMLElement.prototype.releasePointerCapture = jest.fn();
global.HTMLElement.prototype.hasPointerCapture = jest.fn();

const defaultProps: MovieSelectBarProps = {
    isLoading: false,
    onGenreChange: jest.fn(),
    onHourChange: jest.fn(),
    onStop: jest.fn(),
    onSubmit: jest.fn(),
}

const renderComponent = (props: MovieSelectBarProps = defaultProps) => {
    return renderWithProviders(
        <MovieSelectBar
            isLoading={props.isLoading}
            onGenreChange={props.onGenreChange}
            onHourChange={props.onHourChange}
            onStop={props.onStop}
            onSubmit={props.onSubmit}
        />
    );
};

afterEach(() => {
    jest.clearAllMocks();
});

describe("MovieSelectBar", () => {
    it("renders correctly", () => {
        renderComponent();

        const genreSelect = screen.getByRole("combobox", { name: 'Select genre' });
        expect(genreSelect).toBeInTheDocument();

        const lengthSelect = screen.getByRole("combobox", { name: 'Select length' });
        expect(lengthSelect).toBeInTheDocument();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeInTheDocument();
        expect(askButton).not.toBeDisabled();

        const stopButton = screen.queryByRole("button", { name: "Stop" });
        expect(stopButton).toBeInTheDocument();
        expect(stopButton).toBeDisabled();
    });

    it("calls onSubmit when form is submitted", async () => {
        const { user } = renderComponent();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeInTheDocument();
        await user.click(askButton);

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it("calls onGenreChange when genre is changed", async () => {
        const mockOnGenreChange = jest.fn();
        const { user } = renderComponent({
            ...defaultProps,
            onGenreChange: mockOnGenreChange,
        });
        const select = screen.getByRole("combobox", { name: "Select genre" });
        expect(select).toBeInTheDocument();

        await user.click(select);

        const option = await screen.findByRole('option', { name: 'Sci-Fi' });
        await user.click(option);

        expect(mockOnGenreChange).toHaveBeenCalledWith("Sci-Fi");
    });

    it("disables Ask button when it is loading", () => {
        renderComponent({
            ...defaultProps,
            isLoading: true,
        });

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeDisabled();
    });

    it("calls onStop when Stop is clicked", async () => {
        const mockStop = jest.fn();
        const { user } = renderComponent({
            ...defaultProps,
            isLoading: true,
            onStop: mockStop,
        });

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeDisabled();

        const stopButton = screen.getByRole("button", { name: "Stop" });
        expect(stopButton).toBeInTheDocument();

        await user.click(stopButton);
        expect(mockStop).toHaveBeenCalled();
    });
});