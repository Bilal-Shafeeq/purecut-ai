export const getFingerprint = async (): Promise<string> => {
  const navigator_info = [
    navigator.userAgent,
    navigator.language,
    (screen.colorDepth || ''),
    (screen.width || '') + 'x' + (screen.height || ''),
    (new Date().getTimezoneOffset() || ''),
    (!!window.sessionStorage),
    (!!window.localStorage),
    (!!window.indexedDB),
    (typeof navigator.cpuClass),
    (navigator.platform),
    (navigator.doNotTrack || ''),
  ].join('###');

  // Using a simple SHA-256 hash if available, or a fallback
  if (crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(navigator_info);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  // Simple fallback hash
  let hash = 0;
  for (let i = 0; i < navigator_info.length; i++) {
    const char = navigator_info.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'fallback-' + Math.abs(hash).toString(16);
};
