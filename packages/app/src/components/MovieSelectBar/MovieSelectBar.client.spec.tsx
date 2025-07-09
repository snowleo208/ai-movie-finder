import { fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MovieSelectBar, MovieSelectBarProps } from "./MovieSelectBar.client";
import { renderWithProviders } from "../../utils/renderWithProviders";

const scrollIntoViewMock = jest.fn();
window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

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

    it("calls onSubmit when form is submitted", () => {
        renderComponent();

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeInTheDocument();
        fireEvent.click(askButton);

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });

    it("calls onGenreChange when genre is changed", () => {
        const mockOnGenreChange = jest.fn();
        renderComponent({
            ...defaultProps,
            onGenreChange: mockOnGenreChange,
        });
        const select = screen.getByRole("combobox", { name: "Select genre" });
        expect(select).toBeInTheDocument();

        fireEvent.click(select);

        const option = screen.getByRole('option', { name: 'Sci-Fi' });
        fireEvent.click(option);

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

    it("calls onStop when Stop is clicked", () => {
        const mockStop = jest.fn();
        renderComponent({
            ...defaultProps,
            isLoading: true,
            onStop: mockStop,
        });

        const askButton = screen.getByRole("button", { name: "Ask" });
        expect(askButton).toBeDisabled();

        const stopButton = screen.getByRole("button", { name: "Stop" });
        expect(stopButton).toBeInTheDocument();

        fireEvent.click(stopButton);
        expect(mockStop).toHaveBeenCalled();
    });
});