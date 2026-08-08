import { useState, useCallback } from 'react';

export function useCopyToClipboard(resetInterval = 2000) {
  const [isCopied, setIsCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        return false;
      }
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), resetInterval);
        return true;
      } catch {
        setIsCopied(false);
        return false;
      }
    },
    [resetInterval]
  );

  return { isCopied, copied: isCopied, copy };
}
