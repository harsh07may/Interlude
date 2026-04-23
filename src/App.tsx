import { useEffect, useState } from 'react';
import { useOCRConfig } from './hooks/useOCRConfig';
import { useScannedPages } from './hooks/useScannedPages';
import { Dashboard } from './components/Dashboard';
import { DigitizeModal } from './components/DigitizeModal';
import { LibraryPage } from './components/LibraryPage';
import { SettingsModal } from './components/SettingsModal';
import type { OCRConfig, OCRExtraction } from './types';
import { ROUTE_HOME, ROUTE_LIBRARY } from './constants';
import './App.css';

type Route = typeof ROUTE_HOME | typeof ROUTE_LIBRARY;

// Called both as a lazy initializer (useState(getRoute)) and inside the
// popstate listener (setRoute(getRoute())). Both paths are intentional.
function getRoute(): Route {
  return window.location.pathname === ROUTE_LIBRARY ? ROUTE_LIBRARY : ROUTE_HOME;
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

  const handleSaveScan = (extraction: OCRExtraction, title: string, tags: string[]) => {
    scannedPages.addPage(extraction, title, tags);
    setShowDigitizeModal(false);
    navigate(ROUTE_LIBRARY);
  };

  return (
    <div className="app">
      {route === ROUTE_LIBRARY ? (
        <LibraryPage
          pages={scannedPages.pages}
          onBackHome={() => navigate(ROUTE_HOME)}
          onDigitizeClick={() => setShowDigitizeModal(true)}
          onSettingsClick={() => setShowSettingsModal(true)}
          onUpdatePage={scannedPages.updatePage}
          onDeletePage={scannedPages.deletePage}
        />
      ) : (
        <Dashboard
          onDigitizeClick={() => setShowDigitizeModal(true)}
          onLibraryClick={() => navigate(ROUTE_LIBRARY)}
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
