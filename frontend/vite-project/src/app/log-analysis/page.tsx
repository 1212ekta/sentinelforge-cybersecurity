import { FolderSearch, ScrollText } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';

export default function FileAnalysisPage() {
  return (
    <EmptyState
      icon={ScrollText}
      title="Log Analysis"
      description="Upload files for the RAG pipeline to index and analyze. Coming in a later milestone."
    />
  );
}