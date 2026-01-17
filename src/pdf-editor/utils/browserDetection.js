/**
 * Detect browser name and version
 */
export function detectBrowser() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    return {
      name: 'Chrome',
      version: match ? match[1] : 'Unknown'
    };
  } else if (userAgent.includes('Firefox')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    return {
      name: 'Firefox',
      version: match ? match[1] : 'Unknown'
    };
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    return {
      name: 'Safari',
      version: match ? match[1] : 'Unknown'
    };
  } else if (userAgent.includes('Edg')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    return {
      name: 'Edge',
      version: match ? match[1] : 'Unknown'
    };
  } else if (userAgent.includes('OPR')) {
    const match = userAgent.match(/OPR\/(\d+)/);
    return {
      name: 'Opera',
      version: match ? match[1] : 'Unknown'
    };
  }
  
  return {
    name: 'Unknown',
    version: 'Unknown'
  };
}

/**
 * Detect device type
 */
export function detectDevice() {
  const userAgent = navigator.userAgent;
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'Tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'Mobile';
  } else {
    return 'Desktop';
  }
}

/**
 * Get browser and device info as a formatted string
 */
export function getBrowserInfo() {
  const browser = detectBrowser();
  return `${browser.name}${browser.version !== 'Unknown' ? ` ${browser.version}` : ''}`;
}
