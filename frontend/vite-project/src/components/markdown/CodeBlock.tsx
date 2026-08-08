import { useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '@/hooks/useTheme';
import { Check, Copy } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { CodeBlockAction } from '@/features/chat/types/chat.types';

interface CodeBlockProps {
  language: string;
  code: string;
  /**
   * Extra toolbar actions beyond the built-in Copy — e.g. Analyze Security,
   * Explain Code, Run Sandbox, Download. Pass them here; this component's
   * internals never need to change to support a new one.
   */
  actions?: CodeBlockAction[];
}

export function CodeBlock({ language, code, actions = [] }: CodeBlockProps) {
  const { theme } = useTheme();
  const { copied, copy } = useCopyToClipboard();
  const isDark = theme !== 'light';

  const handleCopy = useCallback(() => copy(code), [code, copy]);

  const toolbarActions: CodeBlockAction[] = [
    {
      id: 'copy',
      label: copied ? 'Copied' : 'Copy',
      icon: copied ? Check : Copy,
      onClick: handleCopy,
    },
    ...actions,
  ];

  return (
    <div className="group/codeblock my-3 w-full max-w-full overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex min-h-[40px] items-center justify-between border-b border-border bg-muted/50 px-3 py-1.5">
        <span className="select-none font-mono text-xs font-medium text-muted-foreground truncate max-w-[150px] sm:max-w-none">
          {language}
        </span>
        <div
          className="flex items-center gap-1 opacity-100 transition-opacity
                     md:opacity-0 md:group-hover/codeblock:opacity-100 focus-within:opacity-100"
        >
          {toolbarActions.map((action) => {
            const Icon = action.icon;
            return (
              <IconButton
                key={action.id}
                aria-label={action.label}
                onClick={() => action.onClick(code)}
                className="h-8 w-8 min-h-[32px] min-w-[32px] sm:h-7 sm:w-7"
              >
                <Icon size={15} />
              </IconButton>
            );
          })}
        </div>
      </div>

      <div className="w-full max-w-full overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: '0.875rem 1rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: 1.6,
            overflowX: 'auto',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}