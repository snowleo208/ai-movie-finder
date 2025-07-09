import { Em, Strong, Text } from '@radix-ui/themes';
import ReactMarkdown from 'react-markdown';

export const MarkdownDisplay = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            components={{
                p: ({ children }) => (
                    <Text as="p" size="3">
                        {children}
                    </Text>
                ),
                strong: ({ children }) => (
                    <Strong>
                        {children}
                    </Strong>
                ),
                em: ({ children }) => (
                    <Em>
                        {children}
                    </Em>
                )
            }}
            children={content}
        />
    );
}