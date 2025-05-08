/**
 * Creates API functions for fetching GitHub repository data.
 * @module apiFunctions
 * @param {Object} settings - Application settings (e.g., API_BASE, HEADERS).
 * @param {Object} state - Application state (e.g., activeProfile, apiLimit).
 * @returns {Object} API functions for fetching file paths and contents.
 */
export function getApiFunctions(settings, state) {
    /**
     * Fetches file paths from the GitHub API for the active profile.
     * @returns {Promise<{ paths: string[] }|string[]>} Object with paths or array of error messages.
     */
    async function fetchFilePaths() {
        console.log(`Entering fetchFilePaths`);
        try {
            const treeUrl = `${settings.API_BASE}/repos/${state.activeProfile.OWNER}/${state.activeProfile.REPO}/git/trees/${state.activeProfile.BRANCH}?recursive=1`;
            const response = await fetch(treeUrl, { headers: settings.HEADERS });
            state.apiLimit = parseInt(response.headers.get('X-RateLimit-Remaining') || '60');
            state.apiLimitResetDate = parseInt(response.headers.get('X-RateLimit-Reset') || '0') 
                ? new Date(parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000).toLocaleString() 
                : 'unknown';
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || 'Unknown';
                console.error(`Fetch error: ${response.status} ${response.statusText}, Message: ${message}`);
                if (response.status === 403 && message.includes('API Limit exceeded')) {
                    const ip = message.match(/for (\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
                    return [`Error in Function FileFetchPaths: API Limit exceeded for IP ${ip}. Reset at ${state.apiLimitResetDate}. Try disabling VPN/proxy.`];
                }
                return [`Error in Function FileFetchPaths: Tree fetch error: ${response.status} ${response.statusText}. Message: ${message}`];
            }
            const treeData = await response.json();
            let paths = treeData.tree
                .filter(item => item.type === 'blob')
                .map(item => item.path)
                .filter(path => !state.activeProfile.EXCLUDE.some(exclude => path === exclude || path.startsWith(exclude)))
                .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            return { paths };
        } catch (error) {
            console.error(`Fetch error: ${error.message}`);
            return [`Error in Function FileFetchPaths: ${error.message}`];
        }
    }

    /**
     * Fetches file content from the GitHub API for a given path.
     * @param {string} path - File path to fetch.
     * @returns {Promise<string>} File content or error message.
     */
    async function fetchFileContent(path) {
        console.log(`Entering fetchFileContent: ${path}`);
        try {
            const fileUrl = `${settings.API_BASE}/repos/${state.activeProfile.OWNER}/${state.activeProfile.REPO}/contents/${path}?ref=${state.activeProfile.BRANCH}`;
            const response = await fetch(fileUrl, { headers: settings.HEADERS });
            state.apiLimit = parseInt(response.headers.get('X-RateLimit-Remaining') || '60');
            state.apiLimitResetDate = parseInt(response.headers.get('X-RateLimit-Reset') || '0') 
                ? new Date(parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000).toLocaleString() 
                : 'unknown';
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = errorData.message || 'Unknown';
                console.error(`Fetch error for ${path}: ${response.status} ${response.statusText}, Message: ${message}`);
                if (response.status === 404) {
                    return `Error in Function fetchFileContent: File not found: ${path}`;
                } else if (response.status === 403 && message.includes('API Limit exceeded')) {
                    const ip = message.match(/for (\d+\.\d+\.\d+\.\d+)/)?.[1] || 'unknown';
                    return `Error in Function fetchFileContent: API Limit exceeded for IP ${ip}. Reset at ${state.apiLimitResetDate}. Try disabling VPN/proxy.`;
                }
                return `Error in Function fetchFileContent: Failed to fetch file: ${response.status} ${response.statusText}. Message: ${message}`;
            }
            const fileData = await response.json();
            const content = atob(fileData.content);
            return content;
        } catch (error) {
            console.error(`Fetch error for ${path}: ${error.message}`);
            return `Error in Function fetchFileContent: ${error.message}`;
        }
    }

    return {
        fetchFilePaths,
        fetchFileContent
    };
}