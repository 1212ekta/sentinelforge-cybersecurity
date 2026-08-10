import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AppShell } from '@/components/layout/AppShell';
import { ChatHistoryProvider } from '@/features/chat/context/ChatHistoryContext';
import { WelcomeScreen } from '@/components/welcome/WelcomeScreen';
import ChatPage from '@/app/chat/page';
import FileAnalysisPage from '@/app/file-analysis/page';
import LogAnalysisPage from '@/app/log-analysis/page';
import VulnerabilityScannerPage from '@/app/vulnerability-scanner/page';
import ReportsPage from '@/app/reports/page';
import SettingsPage from '@/app/settings/page';
import '@/app/globals.css';
import '@/style.css';

function MainApp() {
  const [hasVisited, setHasVisited] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    if (path === '/' || path === '/welcome' || path === '') return false;
    return false;
  });
  const [currentPath, setCurrentPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'));



  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      if (path === '/welcome') {
        setHasVisited(false);
      }
    };
    window.addEventListener('popstate', handlePopState);

    const handleCustomNav = (e: CustomEvent<string>) => {
      if (e.detail) {
        window.history.pushState({}, '', e.detail);
        setCurrentPath(e.detail);
        if (e.detail !== '/welcome') {
          setHasVisited(true);
        }
      }
    };

    window.addEventListener('navigate' as any, handleCustomNav);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('navigate' as any, handleCustomNav);
    };
  }, []);

  useEffect(() => {
    if (hasVisited && (currentPath === '/' || currentPath === '')) {
      window.history.replaceState({}, '', '/chat');
      setCurrentPath('/chat');
    }
  }, [hasVisited, currentPath]);

  const handleStart = () => {
    localStorage.setItem('sf_welcome_completed', 'true');
    setHasVisited(true);
    window.history.pushState({}, '', '/chat');
    setCurrentPath('/chat');
  };


  if (!hasVisited || currentPath === '/welcome') {
    return <WelcomeScreen onStart={handleStart} />;
  }

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

