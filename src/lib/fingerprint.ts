export const getFingerprint = async (): Promise<string> => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return 'server-fallback-' + Math.random().toString(36).substr(2, 9);
    }

    // Collect browser fingerprint data
    const navigator_info = [
      typeof navigator !== 'undefined' ? navigator.userAgent : '',
      typeof navigator !== 'undefined' ? navigator.language : '',
      typeof screen !== 'undefined' ? (screen.colorDepth || '') : '',
      typeof screen !== 'undefined' ? ((screen.width || '') + 'x' + (screen.height || '')) : '',
      (new Date().getTimezoneOffset() || ''),
      (!!window.sessionStorage),
      (!!window.localStorage),
      (!!window.indexedDB),
      (typeof (navigator as any).cpuClass),
      (typeof navigator !== 'undefined' ? navigator.platform : ''),
      (typeof navigator !== 'undefined' ? (navigator.doNotTrack || '') : ''),
    ].join('###');

    // Try to use crypto.subtle for SHA-256 hashing
    try {
      const cryptoObj = (window as any).crypto;
      if (cryptoObj && cryptoObj.subtle) {
        const msgBuffer = new TextEncoder().encode(navigator_info);
        const hashBuffer = await cryptoObj.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      }
    } catch (cryptoError) {
      console.warn('Crypto API not available, using fallback hash:', cryptoError);
    }

    // Fallback hash implementation
    let hash = 0;
    for (let i = 0; i < navigator_info.length; i++) {
      const char = navigator_info.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'fallback-' + Math.abs(hash).toString(16);
  } catch (error) {
    console.error('Error generating fingerprint:', error);
    return 'error-fallback-' + Math.random().toString(36).substr(2, 9);
  }
};