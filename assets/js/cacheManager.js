// File: cacheManager.js

/**
 * Creates cache manager with access to app state.
 * @param {Object} appState - Application state object containing activeProfileIndex and fileContents.
 * @returns {Object} Cache manager functions with appState bound.
 */
export function getCacheManager(appState) {
    // Procedural code (none currently)

    // Return cache functions
    return {
        getFileList,
        getCachePaths,
        getCacheFile,
        setCachePaths,
        setCacheFile,
        getCacheKeyCount,
        getCacheRecordCount,
        getCacheSize,
        getCachePanel,
        migrateCache,
        clearCache
    };

    /**
     * Retrieves and formats file list options from cached paths.
     * @returns {Array} Array of option objects with value and text properties.
     */
    function getFileList() {
        console.log('Getting file list options');
        const cachedPaths = getCachePaths();
        if (!cachedPaths || Array.isArray(cachedPaths)) {
            return [];
        }
        const paths = cachedPaths.paths;
        return [
            { value: 'All', text: 'All' },
            ...paths.map(path => ({ value: path, text: path }))
        ];
    }
    /**
     * Retrieves cached path array for the active profile.
     * @returns {string[]|null} Array of paths or null if not found.
     * Used in `getCacheRecordCount`, `getCacheSize`, `getCachePanel`, `updateDirectoryFromCache`, `fetchFilePaths`, `DisplayPathsAndDirectory`.
     */
    function getCachePaths() {
        console.log(`Getting cache: Path_${appState.activeProfileIndex}`);
        const item = localStorage.getItem(`Path_${appState.activeProfileIndex}`);
        return item ? JSON.parse(item) : null;
    }

    /**
     * Retrieves cached file record for a specific path in the active profile.
     * @param {string} path - File path (e.g., 'src/main.js').
     * @returns {Object|null} File record (e.g., { content, timestamp }) or null if not found.
     * Used in `fetchFileContent`, `DisplayFileContent`.
     */
    function getCacheFile(path) {
        console.log(`Getting cache: Files_${appState.activeProfileIndex}:${path}`);
        const item = localStorage.getItem(`Files_${appState.activeProfileIndex}:${path}`);
        return item ? JSON.parse(item) : null;
    }

    /**
     * Stores path array for the active profile.
     * @param {string[]} paths - Array of paths to cache.
     * @returns {void} No return value.
     * Used in `fetchFilePaths`, `DisplayPathsAndDirectory`.
     */
    function setCachePaths(paths) {
        console.log(`Caching key: Path_${appState.activeProfileIndex}`);
        localStorage.setItem(`Path_${appState.activeProfileIndex}`, JSON.stringify(paths));
    }

    /**
     * Stores file record for a specific path in the active profile.
     * @param {string} path - File path (e.g., 'src/main.js').
     * @param {Object} value - File record (e.g., { content, timestamp }).
     * @returns {void} No return value.
     * Used in `fetchFileContent`, `DisplayFileContent`.
     */
    function setCacheFile(path, value) {
        console.log(`Caching key: Files_${appState.activeProfileIndex}:${path}`);
        localStorage.setItem(`Files_${appState.activeProfileIndex}:${path}`, JSON.stringify(value));
    }

    /**
     * Returns the number of cached file keys for a profile.
     * @returns {number} Number of cached file keys.
     * Used by `config` for `spnCacheSummary.textContent` and `getCachePanel`.
     */
    function getCacheKeyCount() {
        return Object.keys(localStorage).filter(key => key.startsWith(`Files_${appState.activeProfileIndex}:`)).length;
    }

    /**
     * Returns the number of cached path records for a profile.
     * @returns {number} Number of cached path records.
     * Used by `config` for `spnCacheSummary.textContent` and `getCachePanel`.
     */
    function getCacheRecordCount() {
        const paths = getCachePaths();
        return paths ? paths.length : 0;
    }

    /**
     * Returns the total size of cached data (paths and files) in bytes for a profile.
     * @returns {number} Total size in bytes.
     * Used by `config` for `spnCacheSummary.textContent`.
     */
    function getCacheSize() {
        const paths = getCachePaths();
        const fileKeys = Object.keys(localStorage).filter(key => key.startsWith(`Files_${appState.activeProfileIndex}:`));
        let totalSize = 0;
        if (paths) {
            totalSize += JSON.stringify(paths).length;
        }
        fileKeys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;
            }
        });
        return totalSize;
    }

    /**
     * Returns the formatted output for the cache panel for a profile.
     * @returns {string} Formatted cache data string.
     * Used by `config` for `divCacheOutput.textContent`.
     */
    function getCachePanel() {
        const paths = getCachePaths();
        const fileKeys = Object.keys(localStorage).filter(key => key.startsWith(`Files_${appState.activeProfileIndex}:`));
        return [
            'Cached Paths:',
            paths ? JSON.stringify(paths, null, 2) : 'None',
            '',
            'Cached Files:',
            fileKeys.length > 0 ? fileKeys.map(key => key.replace(`Files_${appState.activeProfileIndex}:`, '')).join('\n') : 'None'
        ].join('\n');
    }

    /**
     * Clears outdated cache entries from previous app versions and dispatches a dataResult event if any were removed.
     * Sets a persistent result message in divResult and a temporary popup in cache-message.
     * @returns {void} No return value.
     * Used by `initApp` to clean up legacy cache keys on startup.
     */
    function migrateCache() {
        console.log('Migrating cache');
        let removedKeys = false;
        Object.keys(localStorage).forEach(key => {
            if (key.match(/GitPath_.+/) || key.match(/GitFiles:.+/) || 
                key.match(/Path_.+/) || key.match(/Files_.+/)) {
                console.log(`Removing outdated key: ${key}`);
                localStorage.removeItem(key);
                removedKeys = true;
            }
        });
        if (removedKeys) {
            const options = getFileList(); // Empty array after clearing
            document.dispatchEvent(new CustomEvent('FilesLoaded', {
                detail: { options }
            }));
            document.dispatchEvent(new CustomEvent('dataResult', {
                detail: {
                    resultMessage: 'Outdated cache entries removed. Please reload data.',
                    popupMessage: 'Cache Migrated'
                }
            }));
        }
    }

    /**
     * Clears the cache for a profile and dispatches a dataResult event.
     * Sets a persistent result message in divResult and a temporary popup in cache-message.
     * @returns {void} No return value.
     * Used by `btnClearCache` event listener to clear profile-specific cache.
     */
    function clearCache() {
        console.log('Clearing cache');
        console.log(`Clearing cache for profileKey: ${appState.activeProfileIndex}`);
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(`Path_${appState.activeProfileIndex}`) || key.startsWith(`Files_${appState.activeProfileIndex}:`)) {
                console.log(`Removing key: ${key}`);
                localStorage.removeItem(key);
            }
            // Clean stale keys from old format
            if (key.startsWith(`GitPath_${appState.activeProfileIndex}`) || (key.startsWith(`GitFiles:`) && key.endsWith(`_${appState.activeProfileIndex}`))) {
                console.log(`Removing old-format key: ${key}`);
                localStorage.removeItem(key);
            }
            if (key.startsWith(`GitFiles:`) && !key.endsWith(`_${appState.activeProfileIndex}`)) {
                console.log(`Cleaning stale key: ${key}`);
                localStorage.removeItem(key);
            }
        });
        const options = getFileList(); // Empty array after clearing
        document.dispatchEvent(new CustomEvent('FilesLoaded', {
            detail: { options }
        }));
        document.dispatchEvent(new CustomEvent('dataResult', {
            detail: {
                resultMessage: 'Cache and data cleared. Please reload data.',
                popupMessage: 'Cache Cleared'
            }
        }));
    }
}