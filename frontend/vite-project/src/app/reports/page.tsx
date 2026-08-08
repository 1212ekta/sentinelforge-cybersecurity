import { FileText, FolderSearch } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';

export default function FileAnalysisPage() {
  return (
    <EmptyState
      icon={FileText}
      title="Reports"
      description="Upload files for the RAG pipeline to index and analyze. Coming in a later milestone."
    />
  );
}