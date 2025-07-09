import { ReactElement } from 'react';
import {
    render,
    RenderOptions,
    RenderResult,
} from '@testing-library/react';
import { Theme } from '@radix-ui/themes';

const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <Theme accentColor="indigo" grayColor="mauve" radius="large" scaling="100%">
            {children}
        </Theme>
    );
};

const renderWithProviders = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
    return render(ui, { wrapper: AllProviders, ...options });
};

export { renderWithProviders };
