
import {appState} from './appState.js';
/**
 * Creates a cache manager object with properties and methods for cache access.
 * @param {Object} appState - Application state object containing activeProfileIndex.
 * @returns {Object} Cache manager with properties (cacheSize, paths, files, fileCount, pathCount, errors) and methods.
 */
export function getCacheManager() {
    // Unified cache prefix for path and file keys
    const CACHE_PREFIX = "GitHub:";
    // Prefixes for path and file keys
    const PATH_PREFIX = "Path_";
    const FILE_PREFIX = "File_";

    const cacheMan = {
        /**
         * Total size of cached data (paths and files) in bytes.
         * @returns {number}
         */
        get cacheSize() {
            let totalSize = 0;
            const pathsData = this.paths;
            if (pathsData && pathsData !== null) {
                totalSize += JSON.stringify(pathsData).length;
            }
            const fileKeys = Object.keys(localStorage).filter(key => key.startsWith(`${CACHE_PREFIX}${FILE_PREFIX}${appState.activeProfileIndex}:`));
            fileKeys.forEach(key => {
                const item = localStorage.getItem(key);
                if (item) {
                    totalSize += item.length;
                }
            });
            return totalSize;
        },

        /**
         * Cached paths object, error array, or null.
         * @returns {{ paths: string[] }|string[]|null}
         */
        get paths() {
            const PATH_KEY = CACHE_PREFIX + PATH_PREFIX + appState.activeProfileIndex;
            const item = localStorage.getItem(PATH_KEY);
            if (!item) return null;
            return JSON.parse(item);
        },

        /**
         * Array of cached file paths from localStorage keys.
         * @returns {string[]}
         */
        get files() {
            console.log('Getting cache file paths');
            const FILE_KEY = CACHE_PREFIX + FILE_PREFIX + appState.activeProfileIndex + ":";
            return Object.keys(localStorage).filter(key => key.startsWith(FILE_KEY)).map(key => key.slice(FILE_KEY.length));
        },

        /**
         * Number of cached file keys.
         * @returns {number}
         */
        get fileCount() {
            return this.files.length;
        },

        /**
         * Number of cached paths or 0 for errors/null.
         * @returns {number}
         */
        get pathCount() {
            const pathsData = this.paths;
            if (!pathsData || Array.isArray(pathsData)) return 0;
            return pathsData.paths ? pathsData.paths.length : 0;
        },

        /**
         * Retrieves cached file record for a specific path.
         * @param {string} path - File path (e.g., 'src/main.js').
         * @returns {Object|null} File record (e.g., { content, timestamp }) or null.
         */
        getFile(path) {
            const FILE_KEY = CACHE_PREFIX + FILE_PREFIX + appState.activeProfileIndex + ":";
            const item = localStorage.getItem(`${FILE_KEY}${path}`);
            return item ? JSON.parse(item) : null;
        },

        /**
         * Stores path array or error array for the active profile.
         * @param {string[]|{ paths: string[] }} data - Array of file paths/errors or paths object to cache.
         * @returns {void}
         */
        setPaths(data) {
            const PATH_KEY = CACHE_PREFIX + PATH_PREFIX + appState.activeProfileIndex;
            localStorage.setItem(PATH_KEY, JSON.stringify(data));
        },

        /**
         * Stores file record for a specific path.
         * @param {string} path - File path (e.g., 'src/main.js').
         * @param {Object} value - File record (e.g., { content, timestamp }).
         * @returns {void}
         */
        setFile(path, value) {
            const FILE_KEY = CACHE_PREFIX + FILE_PREFIX + appState.activeProfileIndex + ":";
            localStorage.setItem(`${FILE_KEY}${path}`, JSON.stringify(value));
        },

        /**
         * Clears outdated cache entries and dispatches a dataResult event if any were removed.
         * @returns {void}
         */
        migrateCache() {
            console.log('Migrating cache');
            let removedKeys = false;
            Object.keys(localStorage).forEach(key => {
                if (key.match(/^GitPath_.+/) || key.match(/^GitFiles:.+/) || key.match(/^Path_.+/) || key.match(/^Files_.+/)) {
                    console.log(`Removing outdated key: ${key}`);
                    localStorage.removeItem(key);
                    removedKeys = true;
                }
            });
            if (removedKeys) {
                document.dispatchEvent(new CustomEvent('dataResult', {
                    detail: {
                        resultMessage: 'Outdated cache entries removed. Please reload data.',
                        popupMessage: 'Cache Migrated'
                    }
                }));
            }
        },

         /**
         * Clears the cache for the active profile and dispatches a dataResult event.
         * @returns {void}
         */
         clearCache() {
            console.log('Clearing cache');
            console.log(`Clearing cache for profileKey: ${appState.activeProfileIndex}`);
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(`${CACHE_PREFIX}${PATH_PREFIX}${appState.activeProfileIndex}`) || 
                    key.startsWith(`${CACHE_PREFIX}${FILE_PREFIX}${appState.activeProfileIndex}:`)) {
                    console.log(`Removing key: ${key}`);
                    localStorage.removeItem(key);
                }
            });
            document.dispatchEvent(new CustomEvent('dataResult', {
                detail: {
                    resultMessage: 'Cache and data cleared. Please reload data.',
                    popupMessage: 'Cache Cleared'
                }
            }));
        }
    };
    
    return cacheMan;
}