export const getBrowserDetails = () => {
    const userAgent = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    let os = 'Unknown';

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        browserName = 'Chrome';
        const match = userAgent.match(/Chrome\/([0-9.]+)/);
        browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
        browserName = 'Firefox';
        const match = userAgent.match(/Firefox\/([0-9.]+)/);
        browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        browserName = 'Safari';
        const match = userAgent.match(/Version\/([0-9.]+)/);
        browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edg')) {
        browserName = 'Edge';
        const match = userAgent.match(/Edg\/([0-9.]+)/);
        browserVersion = match ? match[1] : 'Unknown';
    }

    if (userAgent.includes('Windows')) {
        os = 'Windows';
    } else if (userAgent.includes('Mac')) {
        os = 'macOS';
    } else if (userAgent.includes('Android')) {
        os = 'Android';
    } else if (userAgent.includes('Linux')) {
        os = 'Linux';
    } else if (userAgent.includes('iOS')) {
        os = 'iOS';
    }

    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        browser: `${browserName} ${browserVersion}`,
        os: os,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
    };
};
