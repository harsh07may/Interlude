import { useState } from 'react';
import { useOCRConfig } from './hooks/useOCRConfig';
import { Dashboard } from './components/Dashboard';
import { DigitizeModal } from './components/DigitizeModal';
import { SettingsModal } from './components/SettingsModal';
import type { OCRConfig } from './types';
import './App.css';

function App() {
  const ocrConfig = useOCRConfig();
  const [showDigitizeModal, setShowDigitizeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSettingsSave = (newConfig: OCRConfig) => {
    ocrConfig.setConfig(newConfig);
    setShowSettingsModal(false);
  };

  return (
    <div className="app">
      <Dashboard
        onDigitizeClick={() => setShowDigitizeModal(true)}
        onSettingsClick={() => setShowSettingsModal(true)}
      />

      <DigitizeModal
        isOpen={showDigitizeModal}
        ocrConfig={ocrConfig.config}
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
