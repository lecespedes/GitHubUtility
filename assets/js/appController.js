// File: appController.js

import { createDomManager } from './domManager.js';
import { getAppFunctions } from './appFunctions.js';
import { getCacheManager } from './cacheManager.js';

export function initApp({ appSettings, appState}) {
    let DOM={};
    const uiFunctions = getAppFunctions(appSettings, appState, DOM);
    const cacheMan = getCacheManager(appState);
    const domManager = createDomManager(domConfig, DOM, appSettings);
    
    const domConfig = {
        documents: [
            {var: 'document', elmt: 'document', eventListeners: [{
                event: 'DOMContentLoaded', handler: () => domManager.populateFileList() },
                {event: 'dataResult', handler: (event) => {
                            domManager.refreshDom();
                            DOM.divResult.textContent = event.detail.resultMessage;
                            uiFunctions.DisplayPopUp(event.detail.popupMessage);
                } }]} ],
        buttons: [
            { var: 'btnLoadFiles', elmt: 'load-files-directory', props: {}, 
                eventListeners: [{ event: 'click', handler: async () => {await uiFunctions.LoadPaths(); domManager.refreshDom();} }] },
            { var: 'btnLoadCode', elmt: 'load-code', props: {}, 
                eventListeners: [{ event: 'click', handler: async () => {await uiFunctions.DisplayFileContent();domManager.refreshDom();} }] },
            
            { var: 'btnClearCache', elmt: 'clear-cache', props: {}, 
                eventListeners: [{ event: 'click', handler: cacheMan.clearCache }] },
            { var: 'btnJsonViewer', elmt: 'json-viewer-button', props: {}, 
                eventListeners: [{ event: 'click', handler: () => {
                const jsonUrl = uiFunctions.createJsonBlobUrl(document.getElementById('directory-structure-output').textContent);
                window.open(jsonUrl, '_blank'); } } ] },
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
            { var: 'ckbFullPaths', elmt: 'full-paths', props: { checked: appSettings.DEFAULT_FULL_PATHS }, eventListeners: [{ event: 'change', handler: domManager.refreshDom }] },
            { var: 'ckbFilterExtensions', elmt: 'filter-extensions', props: { checked: appSettings.DEFAULT_FILTER_EXTENSIONS } }
        ],
        inputs: [
            { var: 'inpCustomRoot', elmt: 'custom-root', props: { value: '' }, eventListeners: [{ event: 'input', handler: domManager.refreshDom }] }
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
                textContent: () => uiFunctions.getCachePanel(), 
                style: { whiteSpace: 'pre' } } },
            { var: 'divSettingsOutput', elmt: 'settings-output', props: { textContent: JSON.stringify(appSettings, null, 2), style: { whiteSpace: 'pre' } } },

        ],
        spans: [
            { var: 'spnFileFilter', elmt: 'filter-types', props: {
                textContent:()=>appState.activeProfile.extensionsToFilter.join(', ')} },
            { var: 'spnExcludeDirPaths', elmt: 'excluded-paths', props: {
                textContent: ()=>appState.activeProfile.EXCLUDE.join(', ')} },
            { var: 'spnRateLimit', elmt: 'rate-limit-info', props: { 
                textContent: () => `API Limit: ${appState.apiLimit} until ${appState.apiLimitResetDate}`
            } }
            { var: 'spnCacheSummary', elmt: 'cache-summary', props: { 
                textContent: () => `Cached: ${uiFunctions.getCachePathRecordCount()} paths, ${uiFunctions.getCacheFileKeyCount()} files, ${uiFunctions.getCacheSize()} bytes`
            } }
        ],
        selects: [
            { var: 'selProfile', elmt: 'profile', props: { value: () => appState.activeProfileIndex }, 
                eventListeners: [{ event: 'change', handler: (event) => { 
                    uiFunctions.handleProfileChange(event);
                    domManager.resetDom();
                } }] },
            { var: 'selFileType', elmt: 'file-type', eventListeners: [{ event: 'change', handler: () => {
                appState.selectedFileType = DOM.selFileType.value;
                uiFunctions.updateCodeOutput();
            }}] },
            { var: 'selFileList', elmt: 'file-list', props: { }, eventListeners: [{ event: 'change', handler: uiFunctions.updateCodeOutput }] }
        ],
        a: [
            {var: 'githubLink', elmt: 'github-link', 
                props: {href:()=>`https://github.com/${appState.activeProfile.OWNER}/${appState.activeProfile.REPO}/tree/${appState.activeProfile.BRANCH}`}, 
                eventListeners:[{}]}
        ]
    };

    cacheMan.migrateCache();
}