/**
 * Module-level state for application settings, state, and DOM elements.
 * @module appFunctions
 */
let appState = null;
let appSettings = null;
let DOM = null;

import { getCacheManager } from './cacheManager.js';
import { getApiFunctions } from './apiFunctions.js';

/**
 * Initializes and returns application functions with provided settings, state, and DOM.
 * @param {Object} settings - Application settings (e.g., API_BASE, profiles).
 * @param {Object} state - Application state (e.g., activeProfile, fileContents).
 * @param {Object} dom - DOM elements for UI interaction.
 * @returns {Object} Object containing application functions.
 * Used in `appController.js` to initialize functions.
 */
export function getAppFunctions(settings, state, dom) {
    appSettings = settings;
    appState = state;
    DOM = dom;
    const cacheMan = getCacheManager(appState);
    const api = getApiFunctions(settings, state);

    return {
        LoadPaths,
        DisplayFileContent,
        createJsonBlobUrl,
        copyPathsToClipboard,
        savePathsAsJson,
        handleProfileChange,
        updateCodeOutput,
        getFilePanel,
        getDirectoryPanel,
        DisplayPopUp
    };

    /**
     * Returns formatted content for the File List panel from cache.
     * @returns {string} Formatted paths or default message if cache is empty.
     * Used in `config.divs` for `divFileListOutput`.
     */
    function getFilePanel() {
        console.log('Entering getFilePanel');
        const cachedPaths = cacheMan.getCachePaths();
        if (!cachedPaths) {
            return 'Click <Load Files & Directory> to load the data.';
        }
        try {
            const paths = Array.isArray(cachedPaths) ? cachedPaths : cachedPaths.paths;
            let filteredPaths = paths;
            if (DOM.ckbFilterExtensions.checked) {
                filteredPaths = paths.filter(path => !appState.activeProfile.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
            }
            DOM.divResult.textContent = `${filteredPaths.length} items returned. ${paths.length - filteredPaths.length} items filtered out.`;
            return filteredPaths.join('\n');
        } catch (error) {
            const errorMessage = `Error in Function getFilePanel: ${error.message}`;
            console.error(errorMessage);
            DOM.divError.textContent = errorMessage;
            return errorMessage;
        }
    }

    /**
     * Returns formatted content for the Directory Structure panel from cache.
     * @returns {string} Formatted directory structure or error message if cache contains errors, or default message if cache is empty.
     * Used in `config.divs` for `divDirectoryOutput`.
     */
    function getDirectoryPanel() {
        console.log('Entering getDirectoryPanel');
        const cachedPaths = cacheMan.getCachePaths();
        if (!cachedPaths) {
            return 'Click <Load Files & Directory> to load the data.';
        }
        try {
            if (Array.isArray(cachedPaths)) {
                return cachedPaths.join('\n');
            }
            let paths = cachedPaths.paths;
            if (DOM.ckbFilterExtensions.checked) {
                paths = paths.filter(path => !appState.activeProfile.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
            }
            const structure = buildJsonStructure(paths, appState.activeProfile.root, DOM.ckbFullPaths.checked);
            return JSON.stringify(structure, null, 2);
        } catch (error) {
            const errorMessage = `Error in Function getDirectoryPanel: ${error.message}`;
            console.error(errorMessage);
            DOM.divError.textContent = errorMessage;
            return errorMessage;
        }
    }

    /**
     * Fetches and displays file contents in the Code panel.
     * @returns {Promise<void>} No return value.
     * Used by `btnLoadCode`, `selFileType` event listeners.
     */
    async function DisplayFileContent() {
        try {
            DOM.btnLoadCode.disabled = true;
            DOM.divCodeOutput.textContent = '';
            DOM.selFileList.innerHTML = '';
            appState.fileContents = [];
            DOM.divError.textContent = '';
            //DOM.divLoading.style.display = 'block';

            await LoadPaths();

            const cachedPaths = cacheMan.getCachePaths();
            if (Array.isArray(cachedPaths)) {
                DOM.divError.textContent = cachedPaths.join('\n');
                return; 
            }
            let paths = cachedPaths.paths;
            let filteredPaths = paths;
            if (DOM.ckbFilterExtensions.checked) {
                filteredPaths = paths.filter(path => !appState.activeProfile.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
            }
            filteredPaths = paths.filter(path => path.toLowerCase().endsWith(appState.selectedFileType));

            const errors = [];
            let fetchedFromApi = false;
            for (let i = 0; i < filteredPaths.length; i++) {
                const path = filteredPaths[i];
                //DOM.divLoading.textContent = `Fetching file ${i + 1} of ${filteredPaths.length}`;
                let content = cacheMan.getCacheFile(path);
                if (!content) {
                    content = await api.fetchFileContent(path);
                    cacheMan.setCacheFile(path, content);
                    fetchedFromApi = true;
                }
                appState.fileContents.push({ path, content });
                if (content.startsWith('Error')) {
                    errors.push(`Error fetching ${path}: ${content}`);
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (fetchedFromApi) {
                const options = cacheMan.getFileList();
                document.dispatchEvent(new CustomEvent('FilesLoaded', {
                    detail: { options }
                }));
            }

            updateCodeOutput();
            if (errors.length > 0) {
                DOM.divError.textContent = errors.join('\n');
            }
            //DOM.divLoading.textContent = 'Loading...';
            const rateLimitElement = document.getElementById('rate-limit-info');
            rateLimitElement.textContent = `API Limit: ${appState.apiLimit} until ${appState.apiLimitResetDate}`;
            DOM.divResult.textContent = `${filteredPaths.length} items loaded. ${errors.length} items failed.`;
        } catch (error) {
            const errorMessage = `Error in Function DisplayFileContent: ${error.message}`;
            console.error(errorMessage);
            DOM.divCodeOutput.textContent = errorMessage;
            DOM.divCodeOutput.style.whiteSpace = '';
            DOM.divError.textContent = errorMessage;
            DOM.selFileList.innerHTML = '';
        } finally {
           //DOM.divLoading.style.display = 'none';
            DOM.btnLoadCode.disabled = false;
            console.log('Exiting DisplayFileContent');
        }
    }

    /**
     * Updates the Code panel with selected file content.
     * @returns {void} No return value.
     * Used by `selFileList`, `selFileType` event listeners, `DisplayFileContent`.
     */
    function updateCodeOutput() {
        console.log('Updating code output');
        const selectedFile = DOM.selFileList.value;
        if (!appState.fileContents.length) {
            DOM.divCodeOutput.textContent = 'Click <Load Code> to load the data.';
            DOM.divCodeOutput.style.whiteSpace = '';
            return;
        }
        DOM.divCodeOutput.style.whiteSpace = 'pre';
        if (selectedFile === 'All') {
            DOM.divCodeOutput.textContent = appState.fileContents.map(fc => `********** ${fc.path} **********\n${fc.content}\n---`).join('\n');
        } else {
            const file = appState.fileContents.find(fc => fc.path === selectedFile);
            DOM.divCodeOutput.textContent = file ? `********** ${file.path} **********\n${file.content}` : 'File not found.';
        }
    }

    /**
     * Fetches and displays file paths and directory structure in their panels.
     * @returns {Promise<void>} No return value.
     * Used by `btnLoadFiles` event listener.
     */
    async function LoadPaths() {
        console.log('Entering DisplayPathsAndDirectory');
        DOM.btnLoadFiles.disabled = true;
        try {
            const cachedPaths = cacheMan.getCachePaths();
            DisplayPopUp(cachedPaths && !Array.isArray(cachedPaths) ? 'Loading paths from cache' : 'Loading paths from GitHub');
            let result = cachedPaths && !Array.isArray(cachedPaths) ? cachedPaths : await api.fetchFilePaths();
            let paths = Array.isArray(result) ? result : result.paths;
            if (!cachedPaths || Array.isArray(cachedPaths)) {
                cacheMan.setCachePaths(result);
            }
        } catch (error) {
            const errorMessage = `Error in Function DisplayPathsAndDirectory: ${error.message}`;
            console.error(errorMessage);
            DOM.divError.textContent = errorMessage;
        } 
        DOM.btnLoadFiles.disabled = false;
        console.log('Exiting DisplayPathsAndDirectory');
    }

    /**
     * Builds a JSON structure for directory display.
     * @param {string[]|string} paths - Array of file paths or error message.
     * @param {string} customRoot - Custom root path for file paths.
     * @param {boolean} useFullPaths - Whether to use full paths in the structure.
     * @returns {Object} JSON structure representing the directory hierarchy.
     * Used in `DisplayDirectory`.
     */
    function buildJsonStructure(paths, customRoot, useFullPaths) {
        console.log('Building JSON structure');
        const effectiveRoot = DOM.inpCustomRoot.value.trim() || customRoot || appState.activeProfile.REPO;
        const root = [];
        paths.forEach(path => {
            const segments = path.split('/');
            let current = root;
            for (let i = 0; i < segments.length - 1; i++) {
                const segment = segments[i];
                let dirObj = current.find(item => typeof item === 'object' && Object.keys(item)[0] === segment);
                if (!dirObj) {
                    dirObj = { [segment]: [] };
                    current.push(dirObj);
                }
                current = dirObj[segment];
            }
            const fileName = segments[segments.length - 1];
            const filePath = useFullPaths ? `${effectiveRoot}/${path}` : fileName;
            current.push(filePath);
        });
        function sortStructure(node) {
            if (!Array.isArray(node)) return node;
            const dirs = node.filter(item => typeof item === 'object');
            const files = node.filter(item => typeof item === 'string');
            dirs.sort((a, b) => Object.keys(a)[0].localeCompare(Object.keys(b)[0]));
            files.sort();
            for (const dir of dirs) {
                const key = Object.keys(dir)[0];
                dir[key] = sortStructure(dir[key]);
            }
            return [...dirs, ...files];
        }
        const sorted = sortStructure(root);
        return { [effectiveRoot]: sorted };
    }

    /**
     * Creates a temporary JSON blob URL from a string.
     * @param {string} json - JSON string to convert.
     * @returns {string} URL for the JSON blob.
     * Used by `btnJsonViewer` event listener.
     */
    function createJsonBlobUrl(json) {
        console.log('Creating JSON blob URL');
        let jsonContent;
        try {
            const parsed = JSON.parse(json);
            if (typeof parsed === 'object' && parsed !== null) {
                jsonContent = JSON.stringify(parsed, null, 2);
            } else {
                jsonContent = JSON.stringify({ content: json }, null, 2);
            }
        } catch {
            jsonContent = JSON.stringify({ content: json }, null, 2);
        }
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const jsonUrl = URL.createObjectURL(blob);
        setTimeout(() => URL.revokeObjectURL(jsonUrl), 1000);
        return jsonUrl;
    }

    /**
     * Copies panel content to the clipboard.
     * @param {string} elementId - ID of the DOM element containing content.
     * @returns {Promise<void>} No return value.
     * Used by `fileListCopy`, `directoryCopy`, `codeCopy` event listeners.
     */
    async function copyPathsToClipboard(elementId) {
        console.log(`Copying paths to clipboard: ${elementId}`);
        const outputElement = document.getElementById(elementId);
        try {
            await navigator.clipboard.writeText(outputElement.textContent);
            const message = elementId === 'code-output' ? 'Code copied to clipboard!' : 'Paths copied to clipboard!';
            DOM.divError.className = 'success';
            DOM.divError.textContent = message;
            setTimeout(() => {
                DOM.divError.textContent = '';
                DOM.divError.className = '';
            }, 3000);
        } catch (error) {
            console.error(`Error copying to clipboard: ${error.message}`);
            DOM.divError.className = 'error';
            DOM.divError.textContent = `Error copying to clipboard: ${error.message}`;
        }
    }

    /**
     * Saves panel content as a JSON file.
     * @param {string} elementId - ID of the DOM element containing content.
     * @returns {Promise<void>} No return value.
     * Used by `fileListSave`, `directorySave` event listeners.
     */
    async function savePathsAsJson(elementId) {
        console.log(`Saving paths as JSON: ${elementId}`);
        const outputElement = document.getElementById(elementId);
        const text = outputElement.textContent;
        if (!text || text === 'Click <Load Files & Directory> to load the data.') {
            DOM.divError.textContent = 'Error: No paths to save.';
            console.error('No paths to save');
            return;
        }
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${elementId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        DOM.divError.className = 'success';
        DOM.divError.textContent = 'Paths saved as JSON!';
        setTimeout(() => {
            DOM.divError.textContent = '';
            DOM.divError.className = '';
        }, 3000);
    }

    /**
     * Handles profile changes and updates UI/state.
     * @returns {void} No return value.
     * Used by `selProfile` event listener.
     */
    function handleProfileChange(event) {
        const newIndex = parseInt(event.target.value);
        if (newIndex === appState.activeProfileIndex) return;
        const newProfile = appSettings.profiles[newIndex];
        if (confirm(`Switch to profile ${newProfile.OWNER}/${newProfile.REPO}/${newProfile.BRANCH}?`)) {
            appState.activeProfileIndex = newIndex;
            appState.activeProfile = newProfile;
            appState.fileContents = [];
        }
    }

    /**
     * Displays a temporary popup message in the popup-message div for 3 seconds.
     * @param {string} _message - The message to display.
     * @returns {void} No return value.
     * Used by `dataResult` event listener in `appController.js`.
     */
    function DisplayPopUp(_message) {
        console.log('Displaying popup message:', _message);
        DOM.divPopupMessage.textContent = _message;
        DOM.divPopupMessage.style.display = 'block';
        setTimeout(() => {
            DOM.divPopupMessage.textContent = '';
            DOM.divPopupMessage.style.display = 'none';
        }, 3000);
    }
}