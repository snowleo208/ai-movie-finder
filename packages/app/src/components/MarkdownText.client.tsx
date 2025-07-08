import ReactMarkdown from 'react-markdown';

export const MarkdownDisplay = ({ content }: { content: string }) => {
    return (
        <ReactMarkdown
            children={content}
        />
    );
}