
/**
 * Generates a unique "Digital Fingerprint" for the device.
 * This combines hardware traits and canvas rendering to create a 
 * stable ID unique to this specific hardware/browser setup.
 */
export const getDeviceId = (): string => {
  const hardwareData = {
    ua: navigator.userAgent,
    lang: navigator.language,
    scr: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cores: navigator.hardwareConcurrency || 'unknown',
    mem: (navigator as any).deviceMemory || 'unknown',
    plat: navigator.platform
  };

  // Canvas Fingerprinting:
  // Different GPUs/drivers render text and shapes with slight pixel variations.
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let canvasHash = '';
  
  if (ctx) {
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("CreatorFlow-Fingerprint-v1", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("CreatorFlow-Fingerprint-v1", 4, 17);
    canvasHash = canvas.toDataURL();
  }

  const rawString = JSON.stringify(hardwareData) + canvasHash;
  
  // Simple hashing function to create a clean alphanumeric ID
  let hash = 0;
  for (let i = 0; i < rawString.length; i++) {
    const char = rawString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const finalId = `HWID-${Math.abs(hash).toString(16).toUpperCase()}`;
  
  // We still store it in localStorage for fast retrieval, 
  // but it's generated from the "Real" hardware traits.
  localStorage.setItem('cf_real_hwid', finalId);
  return finalId;
};
