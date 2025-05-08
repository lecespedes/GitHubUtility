import * as domComponents from './domComponents.js';
import { refreshDom } from './appManager.js';
const appManager = { refreshDom };  //just to keep the function in the appManager namespace.
/**
 * Creates the DOM configuration object for the application.
 * @module domConfig
 * @param {Object} appManager - DOM manager with refreshDom, updateDom methods.
 * @param {Object} uiFunctions - UI functions (e.g., LoadPaths, DisplayPopUp).
 * @param {Object} appState - Application state (e.g., activeProfile).
 * @param {Object} cacheMan - Cache manager for file list options.
 * @param {Object} DOM - DOM elements for UI interaction.
 * @returns {Object} DOM configuration object with element definitions and event listeners.
 */
export function createDomConfig(uiFunctions, appSettings, appState, cacheMan, domConfig, DOM) {
    Object.assign(domConfig, {
        documents: [
            {
                var: 'document',
                elmt: 'document',
                eventListeners: [
                    {
                        event: 'dataResult',
                        handler: (event) => {
                            appManager.refreshDom();
                            DOM.divResult.textContent = event.detail.resultMessage;
                            uiFunctions.DisplayPopUp(event.detail.popupMessage);
                        }
                    },
                    {
                        event: 'FilesLoaded',
                        handler: (event) => {
                            domComponents.populateSelectOptions(DOM.selFileList, event.detail.options, item => item.value, item => item.text, 'All');
                        }
                    }
                ]
            }
        ],
        buttons: [
            { var: 'btnLoadFiles', elmt: 'load-files-directory', props: {}, 
                eventListeners: [{ event: 'click', handler: async () => { await uiFunctions.LoadPaths(); appManager.refreshDom(); } }] },
            { var: 'btnLoadCode', elmt: 'load-code', props: {}, 
                eventListeners: [{ event: 'click', handler: async () => { await uiFunctions.DisplayFileContent(); appManager.refreshDom(); } }] },
            { var: 'btnClearCache', elmt: 'clear-cache', props: {}, 
                eventListeners: [{ event: 'click', handler: cacheMan.clearCache }] },
            { var: 'btnJsonViewer', elmt: 'json-viewer-button', props: {}, 
                eventListeners: [{ event: 'click', handler: () => {
                    const jsonUrl = uiFunctions.createJsonBlobUrl(document.getElementById('directory-structure-output').textContent);
                    window.open(jsonUrl, '_blank');
                } }] },
            { var: 'fileListCopy', elmt: 'file-list-copy', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard('file-list-output') }] },
            { var: 'fileListSave', elmt: 'file-list-save', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.savePathsAsJson('file-list-output') }] },
            { var: 'directoryCopy', elmt: 'directory-copy', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard('directory-structure-output') }] },
            { var: 'directorySave', elmt: 'directory-save', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.savePathsAsJson('directory-structure-output') }] },
            { var: 'codeCopy', elmt: 'code-copy', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard('code-output') }] }
        ],
        checkboxes: [
            { var: 'ckbFullPaths', elmt: 'full-paths', props: { checked: appSettings.DEFAULT_FULL_PATHS }, 
                eventListeners: [{ event: 'change', handler: appManager.refreshDom }] },
            { var: 'ckbFilterExtensions', elmt: 'filter-extensions', props: { checked: appSettings.DEFAULT_FILTER_EXTENSIONS } }
        ],
        inputs: [
            { var: 'inpCustomRoot', elmt: 'custom-root', props: { value: '' }, 
                eventListeners: [{ event: 'input', handler: appManager.refreshDom }] }
        ],
        divs: [
            { var: 'divError', elmt: 'error' },
            { var: 'divResult', elmt: 'result' },
            { var: 'divPopupMessage', elmt: 'popup-message' },
            { var: 'divFileListOutput', elmt: 'file-list-output', props: { 
                textContent: () => uiFunctions.getFilePanel(), style: { whiteSpace: 'pre' } } },
            { var: 'divDirectoryOutput', elmt: 'directory-structure-output', props: { 
                textContent: () => uiFunctions.getDirectoryPanel(), style: { whiteSpace: 'pre' } } },
            { var: 'divCodeOutput', elmt: 'code-output', props: { 
                textContent: 'Click <Load Code> to load the data.', style: { whiteSpace: '' } } },
            { var: 'divCacheOutput', elmt: 'cache-output', props: { 
                textContent: () => cacheMan.getCachePanel(), 
                style: { whiteSpace: 'pre' } } },
            { var: 'divSettingsOutput', elmt: 'settings-output', props: { textContent: JSON.stringify(appSettings, null, 2), style: { whiteSpace: 'pre' } } }
        ],
        spans: [
            { var: 'spnFileFilter', elmt: 'filter-types', props: {
                textContent: () => appState.activeProfile.extensionsToFilter.join(', ')
            } },
            { var: 'spnExcludeDirPaths', elmt: 'excluded-paths', props: {
                textContent: () => appState.activeProfile.EXCLUDE.join(', ')
            } },
            { var: 'spnRateLimit', elmt: 'rate-limit-info', props: { 
                textContent: () => `API Limit: ${appState.apiLimit} until ${appState.apiLimitResetDate}`
            } },
            { var: 'spnCacheSummary', elmt: 'cache-summary', props: { 
                textContent: () => `Cached: ${cacheMan.getCacheRecordCount()} paths, ${cacheMan.getCacheKeyCount()} files, ${cacheMan.getCacheSize()} bytes`
            } }
        ],
        selects: [
            { var: 'selProfile', elmt: 'profile', props: { value: () => appState.activeProfileIndex }, 
                eventListeners: [{ event: 'change', handler: (event) => { 
                    uiFunctions.handleProfileChange(event);
                    appManager.refreshDom();
                } }] },
            { var: 'selFileType', elmt: 'file-type', eventListeners: [{ event: 'change', handler: () => {
                appState.selectedFileType = DOM.selFileType.value;
                uiFunctions.updateCodeOutput();
            } }] },
            { var: 'selFileList', elmt: 'file-list', props: { }, eventListeners: [{ event: 'change', handler: uiFunctions.updateCodeOutput }] }
        ],
        a: [
            { var: 'githubLink', elmt: 'github-link', 
                props: { href: () => `https://github.com/${appState.activeProfile.OWNER}/${appState.activeProfile.REPO}/tree/${appState.activeProfile.BRANCH}` }         
            }
        ]
    });
}