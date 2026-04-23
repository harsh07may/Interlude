import { useEffect, useState } from 'react';
import { useOCRConfig } from './hooks/useOCRConfig';
import { useScannedPages } from './hooks/useScannedPages';
import { Dashboard } from './components/Dashboard';
import { DigitizeModal } from './components/DigitizeModal';
import { LibraryPage } from './components/LibraryPage';
import { SettingsModal } from './components/SettingsModal';
import type { OCRConfig } from './types';
import './App.css';

type Route = '/' | '/library';

function getRoute(): Route {
  return window.location.pathname === '/library' ? '/library' : '/';
}

function App() {
  const ocrConfig = useOCRConfig();
  const scannedPages = useScannedPages();
  const [route, setRoute] = useState<Route>(getRoute);
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (nextRoute: Route) => {
    if (nextRoute !== route) {
      window.history.pushState(null, '', nextRoute);
      setRoute(nextRoute);
    }
  };

  const handleSettingsSave = (newConfig: OCRConfig) => {
    ocrConfig.setConfig(newConfig);
    setShowSettingsModal(false);
  };

  const handleSaveScan = (...args: Parameters<typeof scannedPages.addPage>) => {
    scannedPages.addPage(...args);
    setShowDigitizeModal(false);
    navigate('/library');
  };

  return (
    <div className="app">
      {route === '/library' ? (
        <LibraryPage
          pages={scannedPages.pages}
          onBackHome={() => navigate('/')}
          onDigitizeClick={() => setShowDigitizeModal(true)}
          onSettingsClick={() => setShowSettingsModal(true)}
          onUpdatePage={scannedPages.updatePage}
          onDeletePage={scannedPages.deletePage}
        />
      ) : (
        <Dashboard
          onDigitizeClick={() => setShowDigitizeModal(true)}
          onLibraryClick={() => navigate('/library')}
          onSettingsClick={() => setShowSettingsModal(true)}
        />
      )}

      <DigitizeModal
        isOpen={showDigitizeModal}
        ocrConfig={ocrConfig.config}
        onSaveScan={handleSaveScan}
        onClose={() => setShowDigitizeModal(false)}
      />

      {showSettingsModal && (
        <SettingsModal
          config={ocrConfig.config}
          onSave={handleSettingsSave}
          onCancel={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
