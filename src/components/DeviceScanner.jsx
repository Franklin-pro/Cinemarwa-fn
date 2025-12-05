// components/DeviceScanner.js
import React, { useState, useEffect } from 'react';
import { 
  Fingerprint, Cpu, Monitor, Globe, Shield, 
  RefreshCw, Scan, CheckCircle, AlertCircle, 
  Smartphone, Tablet, CpuIcon, MemoryStick
} from 'lucide-react';
import { 
  getOrCreateDeviceFingerprint, 
  regenerateFingerprint, 
  getFingerprintInfo, 
  getDeviceInfo 
} from '../utils/fingerprint';

function DeviceScanner({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [fingerprintInfo, setFingerprintInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [scanComponents, setScanComponents] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    loadExistingFingerprint();
  }, []);

  const loadExistingFingerprint = () => {
    const fpInfo = getFingerprintInfo();
    const deviceData = getDeviceInfo();
    
    setFingerprintInfo(fpInfo);
    setDeviceInfo(deviceData);
    
    if (fpInfo.fingerprint) {
      setScanHistory(prev => [...prev, {
        timestamp: new Date().toLocaleString(),
        action: 'Loaded existing fingerprint',
        fingerprint: fpInfo.fingerprint.substring(0, 20) + '...'
      }]);
    }
  };

  const performScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanComponents([]);

    const scanSteps = [
      { name: 'Browser Analysis', icon: <Cpu className="w-4 h-4" />, duration: 500 },
      { name: 'Screen Detection', icon: <Monitor className="w-4 h-4" />, duration: 400 },
      { name: 'Hardware Scan', icon: <MemoryStick className="w-4 h-4" />, duration: 600 },
      { name: 'Font Detection', icon: <Globe className="w-4 h-4" />, duration: 300 },
      { name: 'WebGL Test', icon: <Shield className="w-4 h-4" />, duration: 700 },
      { name: 'Canvas Analysis', icon: <Fingerprint className="w-4 h-4" />, duration: 800 },
      { name: 'Final Security Check', icon: <Shield className="w-4 h-4" />, duration: 400 },
    ];

    for (let i = 0; i < scanSteps.length; i++) {
      const step = scanSteps[i];
      setScanProgress(Math.floor((i / scanSteps.length) * 100));
      setScanComponents(prev => [...prev, step]);
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
    }

    // Generate new fingerprint
    const newFingerprint = regenerateFingerprint();
    const newFpInfo = getFingerprintInfo();
    const newDeviceInfo = getDeviceInfo();

    setFingerprintInfo(newFpInfo);
    setDeviceInfo(newDeviceInfo);
    setIsScanning(false);
    setScanProgress(100);

    // Add to scan history
    setScanHistory(prev => [{
      timestamp: new Date().toLocaleString(),
      action: 'New fingerprint generated',
      fingerprint: newFingerprint.substring(0, 20) + '...'
    }, ...prev.slice(0, 4)]);

    // Notify parent
    if (onScanComplete) {
      onScanComplete(newFingerprint);
    }

    // Reset progress after delay
    setTimeout(() => {
      setScanProgress(0);
      setScanComponents([]);
    }, 2000);
  };

  const getDeviceIcon = () => {
    if (!deviceInfo) return <Smartphone className="w-5 h-5" />;
    
    const ua = deviceInfo.userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    } else {
      return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Fingerprint className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Device Scanner</h2>
            <p className="text-sm text-gray-400">Generate unique device identifier</p>
          </div>
        </div>
        
        <button
          onClick={performScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-semibold rounded-lg transition-all"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Scan className="w-4 h-4" />
              Scan Device
            </>
          )}
        </button>
      </div>

      {/* Current Device Info */}
      {deviceInfo && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getDeviceIcon()}
              <div>
                <div className="font-medium">{deviceInfo.platform}</div>
                <div className="text-sm text-gray-400">{deviceInfo.userAgent.split(' ').slice(-2).join(' ')}</div>
              </div>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full ${
              fingerprintInfo?.fingerprint ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {fingerprintInfo?.fingerprint ? 'Fingerprint Ready' : 'No Fingerprint'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-400">Screen</div>
              <div className="font-medium">{deviceInfo.screenResolution}</div>
            </div>
            <div>
              <div className="text-gray-400">Language</div>
              <div className="font-medium">{deviceInfo.language}</div>
            </div>
            <div>
              <div className="text-gray-400">Timezone</div>
              <div className="font-medium">{deviceInfo.timezone}</div>
            </div>
            <div>
              <div className="text-gray-400">Browser</div>
              <div className="font-medium truncate">{deviceInfo.userAgent.split('/')[0]}</div>
            </div>
          </div>
        </div>
      )}

      {/* Scanning Progress */}
      {isScanning && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Creating device fingerprint...</span>
              <span className="text-blue-400 font-semibold">{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Scan Components */}
          <div className="grid grid-cols-2 gap-2">
            {scanComponents.map((component, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg"
              >
                <div className="text-blue-400">{component.icon}</div>
                <div className="text-sm">{component.name}</div>
                <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fingerprint Result */}
      {fingerprintInfo?.fingerprint && !isScanning && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div className="font-medium">Fingerprint Generated</div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Fingerprint ID</div>
              <div className="font-mono text-sm bg-black/30 p-3 rounded-lg break-all">
                {fingerprintInfo.fingerprint}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Generated</div>
                <div className="font-medium">{fingerprintInfo.timestamp}</div>
              </div>
              <div>
                <div className="text-gray-400">Age</div>
                <div className="font-medium">{fingerprintInfo.age}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <div className="text-sm font-medium mb-2">Recent Scans</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {scanHistory.map((scan, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-900/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-3 h-3 text-blue-400" />
                  <div className="text-xs">{scan.action}</div>
                </div>
                <div className="text-xs text-gray-400">{scan.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeviceScanner;