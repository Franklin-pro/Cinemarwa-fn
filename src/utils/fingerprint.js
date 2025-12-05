// utils/fingerprint.js
export const generateDeviceFingerprint = () => {
    try {
        const fingerprint = {
            screenResolution: `${window.screen.width}x${window.screen.height}x${window.screen.pixelDepth || window.screen.colorDepth}`,
            colorDepth: window.screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language || navigator.userLanguage,
            languages: navigator.languages ? JSON.stringify(navigator.languages) : '',
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
            deviceMemory: navigator.deviceMemory || 'unknown',
            maxTouchPoints: navigator.maxTouchPoints || 0,
            cookieEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'unknown',
            vendor: navigator.vendor || '',
            product: navigator.product || '',
            productSub: navigator.productSub || '',
            appVersion: navigator.appVersion,
            // Browser capabilities
            hasLocalStorage: !!window.localStorage,
            hasSessionStorage: !!window.sessionStorage,
            hasIndexedDB: !!window.indexedDB,
            // Timestamp for uniqueness
            timestamp: Date.now(),
            // Generate canvas fingerprint
            canvasFingerprint: generateCanvasFingerprint(),
            // WebGL fingerprint
            webglFingerprint: generateWebGLFingerprint()
        };

        // Convert to string and hash
        const fingerprintString = JSON.stringify(fingerprint);
        return btoa(fingerprintString); // Base64 encode
    } catch (error) {
        console.error('Error generating fingerprint:', error);
        // Fallback to simpler fingerprint
        return generateFallbackFingerprint();
    }
};

const generateCanvasFingerprint = () => {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Draw text
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("Fingerprint", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("Fingerprint", 4, 17);
        
        // Add some complexity
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = "rgb(255,0,255)";
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        
        // Get the data URL
        return canvas.toDataURL().slice(22, 50); // Get part of the data URL for fingerprint
    } catch (e) {
        console.error('Error generating canvas fingerprint:', e);
        return 'canvas_not_supported';
    }
};

const generateWebGLFingerprint = () => {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            return 'webgl_not_supported';
        }
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR);
        const renderer = gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER);
        
        return `${vendor}-${renderer}`;
    } catch (e) {
        console.error('Error generating WebGL fingerprint:', e);
        return 'webgl_error';
    }
};

const generateFallbackFingerprint = () => {
    // Simple fallback fingerprint
    const fallbackData = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: Date.now()
    };
    
    // Create a simple hash
    let hash = 0;
    const str = JSON.stringify(fallbackData);
    
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `fallback_${Math.abs(hash).toString(36)}`;
};

// Store fingerprint in localStorage
export const getOrCreateDeviceFingerprint = () => {
    try {
        let fingerprint = localStorage.getItem('deviceFingerprint');
        let fingerprintTimestamp = localStorage.getItem('fingerprintTimestamp');
        
        // Regenerate fingerprint if it's older than 7 days or doesn't exist
        const shouldRegenerate = !fingerprint || 
            !fingerprintTimestamp || 
            (Date.now() - parseInt(fingerprintTimestamp) > 7 * 24 * 60 * 60 * 1000);
        
        if (shouldRegenerate) {
            fingerprint = generateDeviceFingerprint();
            localStorage.setItem('deviceFingerprint', fingerprint);
            localStorage.setItem('fingerprintTimestamp', Date.now().toString());
        }
        
        return fingerprint;
    } catch (error) {
        console.error('Error getting fingerprint:', error);
        return generateFallbackFingerprint();
    }
};

// Get device information for display
export const getDeviceInfo = () => {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
};