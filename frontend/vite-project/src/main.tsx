import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AppShell } from '@/components/layout/AppShell';
import { ChatHistoryProvider } from '@/features/chat/context/ChatHistoryContext';
import ChatPage from '@/app/chat/page';
import FileAnalysisPage from '@/app/file-analysis/page';
import LogAnalysisPage from '@/app/log-analysis/page';
import VulnerabilityScannerPage from '@/app/vulnerability-scanner/page';
import ReportsPage from '@/app/reports/page';
import SettingsPage from '@/app/settings/page';
import '@/app/globals.css';
import '@/style.css';

function MainApp() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    const handleCustomNav = (e: CustomEvent<string>) => {
      if (e.detail) {
        window.history.pushState({}, '', e.detail);
        setCurrentPath(e.detail);
      }
    };

    window.addEventListener('navigate' as any, handleCustomNav);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigate' as any, handleCustomNav);
    };
  }, []);

  let pageContent = <ChatPage />;
  if (currentPath.startsWith('/file-analysis')) {
    pageContent = <FileAnalysisPage />;
  } else if (currentPath.startsWith('/log-analysis')) {
    pageContent = <LogAnalysisPage />;
  } else if (currentPath.startsWith('/vulnerability-scanner')) {
    pageContent = <VulnerabilityScannerPage />;
  } else if (currentPath.startsWith('/reports')) {
    pageContent = <ReportsPage />;
  } else if (currentPath.startsWith('/settings')) {
    pageContent = <SettingsPage />;
  }

  return (
    <ChatHistoryProvider>
      <AppShell>{pageContent}</AppShell>
    </ChatHistoryProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);
