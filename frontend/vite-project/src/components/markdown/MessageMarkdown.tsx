'use client';

import { memo, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';
import { cn } from '@/utils/cn';

interface MessageMarkdownProps {
  content: string;
}

function MessageMarkdownComponent({ content }: MessageMarkdownProps) {
  // Memoized so streaming updates (content growing token-by-token) don't
  // force react-markdown to treat every renderer as a brand-new function
  // reference on each render — that's what causes flicker/remounts.
  const components = useMemo<Components>(
    () => ({
      pre({ children }) {
        // CodeBlock renders its own container (border, header, padding) —
        // skip the typography plugin's default <pre> wrapper to avoid
        // double borders/padding around it.
        return <>{children}</>;
      },
      code({ className, children }) {
        const match = /language-(\w+)/.exec(className ?? '');
        const raw = String(children);
        const isInline = !match && !raw.includes('\n');

        if (isInline) {
          return (
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
              {children}
            </code>
          );
        }

        return (
          <CodeBlock
            language={match?.[1] ?? 'text'}
            code={raw.replace(/\n$/, '')}
          />
        );
      },
      a({ children, ...props }) {
        return (
          <a
            className="text-primary underline underline-offset-2 hover:text-primary/80"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    []
  );

  return (
    <div
      className={cn(
        'prose prose-sm max-w-none dark:prose-invert',
        'prose-p:my-2 prose-p:leading-relaxed',
        'prose-headings:mb-2 prose-headings:mt-4 prose-headings:font-semibold',
        'prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
        'prose-table:text-sm',
        'break-words'
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

// Only re-render when the text itself changes — critical during streaming,
// so updating one message's content doesn't re-render every bubble in the list.
export const MessageMarkdown = memo(
  MessageMarkdownComponent,
  (prev, next) => prev.content === next.content
);