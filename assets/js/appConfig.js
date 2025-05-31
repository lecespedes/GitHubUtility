import {appSettings} from './appSettings.js';
import {appState} from './appState.js';
import { getAppFunctions } from './appFunctions.js';
import { refreshApp } from './app.js';
/**
 * Creates the DOM configuration object for the application.
 * @module domConfig
 * @param {Object} cacheMan - Cache manager for file list options.
 * @param {Object} DOM - DOM elements for UI interaction.
 * @returns {Object} DOM configuration object with element definitions and event listeners.
 */
export function createAppConfig(cacheMan, DOM) {
    const uiFunctions = getAppFunctions(appSettings, appState, DOM);
    return { 
        documents: [
            {var: 'document', elmt: 'document', eventListeners: [
                    {event: 'dataResult', handler: (event) => {
                            refreshApp();
                            DOM.divResult.textContent = event.detail.resultMessage;
                            uiFunctions.DisplayPopUp(event.detail.popupMessage);}},
                    {event: 'FilesLoaded', handler: (event) => {
                        DOM.selFileList.innerHTML = uiFunctions.getSelectOptionsHTML(uiFunctions.getFileList(),'All');
                        }},
                    {event: 'FileLoaded', handler: (event) => {
                            uiFunctions.DisplayPopUp(event.detail.popupMessage);}}]}
        ],
        buttons: [
            { var: 'btnLoadFiles', elmt: 'load-files-directory', props: {}, 
                eventListeners: [{ event: 'click', handler: async () => { await uiFunctions.LoadPaths(); refreshApp();}}]},
            { var: 'btnLoadCode', elmt: 'load-code', props: {}, 
                eventListeners: [{ event: 'click', handler: async () => { await uiFunctions.LoadCode(); refreshApp();}}]},
            { var: 'btnClearCache', elmt: 'clear-cache', props: {}, 
                eventListeners: [{ event: 'click', handler: cacheMan.clearCache}]},
            { var: 'btnJsonViewer', elmt: 'json-viewer-button', props: {}, 
                eventListeners: [{ event: 'click', handler: () => {
                    const jsonUrl = uiFunctions.createJsonBlobUrl(DOM.divDirectoryOutput.textContent); window.open(jsonUrl, '_blank');}}]},
            { var: 'fileListCopy', elmt: 'file-list-copy', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard(DOM.divFileListOutput)}]},
            { var: 'fileListSave', elmt: 'file-list-save', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.savePathsAsJson(DOM.divFileListOutput)}]},
            { var: 'directoryCopy', elmt: 'directory-copy', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard(DOM.divDirectoryOutput)}]},
            { var: 'directorySave', elmt: 'directory-save', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.savePathsAsJson(DOM.divDirectoryOutput)}]},
            { var: 'codeCopy', elmt: 'code-copy', props: {}, 
                eventListeners: [{ event: 'click', handler: () => uiFunctions.copyPathsToClipboard(DOM.divCodeOutput)}]}
        ],
        checkboxes: [
            { var: 'ckbFullPaths', elmt: 'full-paths', props: { checked: () => appState.fullPathsChecked }, 
                eventListeners: [{ event: 'change', handler:(event) => {
                    appState.fullPathsChecked = event.target.checked;
                    refreshApp();
                } }] },
            { var: 'ckbFilterExtensions', elmt: 'filter-extensions', props: { checked: ()=> appState.filterExtensionsChecked }, 
                eventListeners: [{ 
                    event: 'change', handler: (event) => {
                        appState.filterExtensionsChecked = event.target.checked;
                        refreshApp();}}]}
        ],
        inputs: [
            { var: 'inpCustomRoot', elmt: 'custom-root', 
                eventListeners: [{ event: 'input', handler: refreshApp}]}
        ],
        selects: [
            { var: 'selProfile', elmt: 'profile', props: {
                innerHTML: () => uiFunctions.getSelectOptionsHTML(uiFunctions.getProfileOptions(), appSettings.DEFAULT_PROFILE_INDEX)
            },
            staticProps: true, 
            eventListeners: [{ event: 'change', handler: async (event) => { 
                    uiFunctions.handleProfileChange(event);
                    await uiFunctions.LoadPaths(); // Load paths for the new profile
                    //DOM.selFileList.innerHTML = uiFunctions.getSelectOptionsHTML(uiFunctions.getFileList(),'All');
                    refreshApp();}}]},
            { var: 'selFileType', elmt: 'file-type', props: {
                innerHTML: () => uiFunctions.getSelectOptionsHTML(uiFunctions.getFileTypeOptions(), appSettings.DEFAULT_FILE_TYPE)
            },
            staticProps: true,
            eventListeners: [{ event: 'change', handler: () => {
                appState.selectedFileType = DOM.selFileType.value;}}]},
            { var: 'selFileList', elmt: 'file-list',  props: {
                innerHTML: () => uiFunctions.getSelectOptionsHTML(uiFunctions.getFileList(),'All')
            },
            staticProps: false,
            eventListeners: [{ event: 'change', handler: ()=>refreshApp() }] }
        ],
        divs: [
            { var: 'divError', elmt: 'error' },
            { var: 'divResult', elmt: 'result' },
            { var: 'divPopupMessage', elmt: 'popup-message' },
            { var: 'divTabFileList', elmt: 'tab-file-list', eventListeners: [{ event: 'click', 
                handler: () => {uiFunctions.selectTab('tab-ctrl-main', 0)}}]},
            { var: 'divTabDirectory', elmt: 'tab-directory', eventListeners: [{ event: 'click', 
                handler: () => {uiFunctions.selectTab('tab-ctrl-main', 1)}}]},
            { var: 'divTabCode', elmt: 'tab-code', eventListeners: [{ event: 'click', 
                handler: () => {uiFunctions.selectTab('tab-ctrl-main', 2)}}]},
            { var: 'divTabCache', elmt: 'tab-cache', eventListeners: [{ event: 'click', 
                handler: () => {uiFunctions.selectTab('tab-ctrl-main', 3)}}]}, 
            { var: 'divTabSettings', elmt: 'tab-settings', eventListeners: [{ event: 'click', 
                handler: () => {uiFunctions.selectTab('tab-ctrl-main', 4)}}]},
            { var: 'divFileListOutput', elmt: 'file-list-output', props: { 
                textContent: () => uiFunctions.getFilePanel(), style: { whiteSpace: 'pre' } } },
            { var: 'divDirectoryOutput', elmt: 'directory-structure-output', props: { 
                textContent: () => uiFunctions.getDirectoryPanel(), style: { whiteSpace: 'pre' } } },
            { var: 'divCodeOutput', elmt: 'code-output', props: { 
                textContent: () => uiFunctions.getCodePanel(DOM.selFileList.value), style: { whiteSpace: 'pre' } } },
            { var: 'divCacheOutput', elmt: 'cache-output', props: { 
                textContent: () => uiFunctions.getCachePanel(), style: { whiteSpace: 'pre' } } },
            { var: 'divSettingsOutput', elmt: 'settings-output', props: { textContent: JSON.stringify(appSettings, null, 2), style: { whiteSpace: 'pre' } } }
        ],
        spans: [
            { var: 'spnFileFilter', elmt: 'filter-types', props: {
                textContent: () => appState.activeProfile.extensionsToFilter.join(', ')}},
            { var: 'spnExcludeDirPaths', elmt: 'excluded-paths', props: {
                textContent: () => appState.activeProfile.EXCLUDE.join(', ')}},
            { var: 'spnRateLimit', elmt: 'rate-limit-info', props: { 
                textContent: () => `API Limit: ${appState.apiLimit} until ${appState.apiLimitResetDate}`}},
            { var: 'spnCacheSummary', elmt: 'cache-summary', props: { 
                textContent: () => `Cached: ${cacheMan.pathCount} paths, ${cacheMan.fileCount} files, ${cacheMan.cacheSize} bytes`}}
        ],
        a: [
            { var: 'githubLink', elmt: 'github-link', 
                props: { href: () => `https://github.com/${appState.activeProfile.OWNER}/${appState.activeProfile.REPO}/tree/${appState.activeProfile.BRANCH}` }         
            }
        ]
    };
}