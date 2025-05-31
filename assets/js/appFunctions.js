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
 * Used in `appConfig.js` to initialize functions.
 */
export function getAppFunctions(settings, state, dom) {
    appSettings = settings;
    appState = state;
    DOM = dom;
    const cacheMan = getCacheManager(appState);
    const api = getApiFunctions(settings, state);

    return {
        LoadPaths,
        LoadCode,
        getFilePanel,
        getDirectoryPanel,
        getCodePanel,
        createJsonBlobUrl,
        copyPathsToClipboard,
        savePathsAsJson,
        handleProfileChange,
        DisplayPopUp,
        getFileList,
        getProfileOptions,
        getFileTypeOptions,
        getSelectOptionsHTML,
        getCachePanel,
        selectTab
    };

    /**
     * Selects a tab and updates the UI.
     * @param {string} tabClass - Class name of tab controls.
     * @param {number} index - Index of the tab to select.
     * @returns {void}
     */
    function selectTab(tabClass, index) {
        const tabs = document.querySelectorAll(`.${tabClass}.tab-ctrl-btn`);
        const panels = document.querySelectorAll(`.${tabClass}.tab-content`);
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tabs[index].classList.add('active');
        panels[index].classList.add('active');
    }
    /**
     * Returns a list of files for the select element.
     * @returns {Object} Object mapping file paths to display labels, including 'All' option.
     */
    function getFileList() {
        const filePaths = cacheMan.files;
        const data = { 'All': 'All' };
        filePaths.forEach(path => {data[path] = path;});
        return data;
    }

    /**
     * Prepares data for selProfile select options.
     * @returns {Object} Object mapping profile indices to display names.
     */
    function getProfileOptions() {
        const data = {};
        appSettings.profiles.forEach((profile, index) => {
            data[index] = `${profile.OWNER}/${profile.REPO}/${profile.BRANCH}`;
        });
        return data;
    }

    /**
     * Prepares data for selFileType select options.
     * @returns {Object} Object mapping file extensions to themselves.
     */
    function getFileTypeOptions() {
        return Object.fromEntries(appSettings.fileTypes.map(ext => [ext, ext]));
    }

    /**
     * Generates HTML for select element options.
     * @param {HTMLSelectElement} element - The select element to populate.
     * @param {Object} data - Object with key/value pairs for option values and labels.
     * @param {string} [defaultValue=''] - The default selected value.
     * @returns {string} HTML string of option elements.
     */
    function getSelectOptionsHTML(data, defaultValue = '') {
        const options = Object.entries(data).map(([value, label]) => 
            `<option value="${value}"${value == defaultValue ? ' selected' : ''}>${label}</option>`
        );
        return options.join('');
    }

    /**
     * Returns formatted content for the Cache panel from cache state.
     * @returns {string} Formatted cache data string.
     * Used in `config.divs` for `divCacheOutput`.
     */
    function getCachePanel() {
        const pathsData = cacheMan.paths;
        const filePaths = cacheMan.files;
        const paths = Array.isArray(pathsData) ? pathsData : pathsData?.paths || [];
        return [
            'Cached Paths:',
            paths.length > 0 ? JSON.stringify(paths, null, 2) : 'None',
            '',
            'Cached Files:',
            filePaths.length > 0 ? filePaths.join('\n') : 'None'
        ].join('\n');
    }


     /**
     * Fetches and displays file paths and directory structure in their panels.
     * @returns {Promise<void>} No return value.
     * Used by `btnLoadFiles` event listener.
     */
     async function LoadPaths() {
        DOM.btnLoadFiles.disabled = true;
        try {
            const cachedPaths = cacheMan.paths;
            DisplayPopUp(cachedPaths ? 'Loading paths from cache' : 'Loading paths from GitHub');
            let result = cachedPaths || await api.fetchFilePaths();
            if (!cachedPaths) {
                cacheMan.setPaths(result);
            }
        } catch (error) {
            const errorMessage = `Error in Function LoadPaths: ${error.message}`;
            console.error(errorMessage);
            DOM.divError.textContent = errorMessage;
        } 
        DOM.btnLoadFiles.disabled = false;
    }
     /**
     * Fetches and displays file contents in the Code panel.
     * @returns {Promise<void>} No return value.
     * Used by `btnLoadCode`, `selFileType` event listeners.
     */
    async function LoadCode() {
        DOM.btnLoadCode.disabled = true;
        try {
            await LoadPaths();

            const cachedPaths = cacheMan.paths;
            if (Array.isArray(cachedPaths)) {
                DOM.divError.textContent = cachedPaths.join('\n');
                return; 
            }
            let filteredPaths = cachedPaths.paths;
            if (DOM.ckbFilterExtensions.checked) {
                filteredPaths = filteredPaths.filter(path => !appState.activeProfile.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
            }
            filteredPaths = filteredPaths.filter(path => path.toLowerCase().endsWith(appState.selectedFileType));

            let fetchedFromApi = false;
            for (let i = 0; i < filteredPaths.length; i++) {
                const path = filteredPaths[i];
                document.dispatchEvent(new CustomEvent('FileLoaded', {
                    detail: { popupMessage: `Fetching file ${i + 1} of ${filteredPaths.length}` }
                }));
                let content = cacheMan.getFile(path);
                if (!content) {
                    content = await api.fetchFileContent(path);
                    cacheMan.setFile(path, content);
                    fetchedFromApi = true;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            if (fetchedFromApi) {
                const options = getFileList();
                document.dispatchEvent(new CustomEvent('FilesLoaded', {detail: { options }}));
            }

        } catch (error) {
            const errorMessage = `Error in Function LoadCode: ${error.message}`;
            console.error(errorMessage);
            DOM.divError.textContent = errorMessage;
        } 
        DOM.btnLoadCode.disabled = false;
    }

    /**
     * Returns formatted content for the File List panel from cache.
     * @returns {string} Formatted paths or default message if cache is empty.
     * Used in `config.divs` for `divFileListOutput`.
     */
    function getFilePanel() {
        const cachedPaths = cacheMan.paths;
        if (Array.isArray(cachedPaths)) {
            return cachedPaths.join('\n');
        }
        if (!cachedPaths || !cachedPaths.paths) {
            return 'Click <Load Files & Directory> to load the data.';
        }
        try {
            let filteredPaths = cachedPaths.paths;
            if (DOM.ckbFilterExtensions.checked) {
                filteredPaths = cachedPaths.paths.filter(path => !appState.activeProfile.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
            }
            DOM.divResult.textContent = `${filteredPaths.length} items returned. ${cachedPaths.paths.length - filteredPaths.length} items filtered out.`;
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
        const cachedPaths = cacheMan.paths;
        if (Array.isArray(cachedPaths)) {
            return cachedPaths.join('\n');
        }
        if (!cachedPaths || !cachedPaths.paths) {
            return 'Click <Load Files & Directory> to load the data.';
        }
        try {
            let paths = cachedPaths.paths;
            if (DOM.ckbFilterExtensions.checked) {
                paths = cachedPaths.paths.filter(path => !appState.activeProfile.extensionsToFilter.some(ext => path.toLowerCase().endsWith(ext)));
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
     * Returns formatted content for the Code panel from cache.
     * @param {string} selectedFile - The selected file path or 'All'.
     * @returns {string} Formatted file content or error message.
     * Used in `divCodeOutput` props.textContent.
     */
    function getCodePanel(selectedFile) {
        const filePaths = cacheMan.files;
        console.log("Get CodePanel for: "+selectedFile);
        if (!selectedFile || filePaths.length === 0) {return 'Click <Load Code> to load the data.';}

        if (selectedFile === 'All') {
            const filesContent = filePaths
                .map(path => {
                    const content = cacheMan.getFile(path);
                    return content ? `********** ${path} **********\n${content}\n---` : null;
                })
                .filter(Boolean)
                .join('\n');
            return filesContent || 'No files found in cache.';
        } else {
            const content = cacheMan.getFile(selectedFile);
            return content ? `********** ${selectedFile} **********\n${content}` : 'File not found.';
        }
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
        try {
            await navigator.clipboard.writeText(elementId.textContent);
            DisplayPopUp(elementId.id +' copied to clipboard!');
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
        DisplayPopUp( 'Paths saved as JSON!');
    }

    /**
     * Handles profile changes and updates UI/state.
     * @returns {void} No return value.
     * Used by `selProfile` event listener.
     */
    async function handleProfileChange(event) {
        const newIndex = parseInt(event.target.value);
        if (newIndex === appState.activeProfileIndex) return;
        const newProfile = appSettings.profiles[newIndex];
        if (confirm(`Switch to profile ${newProfile.OWNER}/${newProfile.REPO}/${newProfile.BRANCH}?`)) {
            appState.activeProfileIndex = newIndex;
            appState.activeProfile = newProfile;
            DOM.selProfile.value = newIndex.toString();
        }
    }

    /**
     * Displays a temporary popup message in the popup-message div for 3 seconds.
     * @param {string} message - The message to display.
     * @returns {void} No return value.
     * Used by `dataResult` event listener and other functions.
     */
    function DisplayPopUp(message) {
        // Clear existing timeout if active
        if (appState.popupTimeoutId) {
            clearTimeout(appState.popupTimeoutId);
            appState.popupTimeoutId = null;
        }

        // Update message and show popup
        DOM.divPopupMessage.textContent = message;
        DOM.divPopupMessage.style.display = 'block';

        // Set new timeout to hide popup
        appState.popupTimeoutId = setTimeout(() => {
            DOM.divPopupMessage.textContent = '';
            DOM.divPopupMessage.style.display = 'none';
            appState.popupTimeoutId = null;
        }, 3000);
    }
}