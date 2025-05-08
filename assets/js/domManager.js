// File: domManager.js

import { initComponents } from './domComponents.js';

/**
 * Creates a DOM manager with functions to manipulate DOM elements based on a configuration.
 * @param {Object} domConfig - The configuration object containing element definitions.
 * @param {Object} DOM - The DOM object to store element references.
 * @param {Object} appSettings - Application settings for initialization.
 * @returns {Object} An object containing functions to manage the DOM: createDom, setDom, updateDom, attachEventListeners, attachDynEventListeners.
 */
export function createDomManager(domConfig,DOM, appSettings) {
    createDom();
    refreshDom();
    attachEventListeners();
    initComponents(appSettings,DOM);
    
    // Return only the DOM management functions needed
    return {
        refreshDom,
        populateFileList,
        updateDom
    };
     
    /**
     * Creates DOM element references from the configuration and stores them in the DOM object.
     * @param {Object} domConfig - The configuration object containing element definitions.
     * @param {Object} DOM - The DOM object to store element references.
     * @returns {void}
     */
    function createDom() {
        console.log('Creating DOM');
        Object.values(domConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, elmt }) => {
                    const el = document.getElementById(elmt);
                    if (!el) {
                        console.warn(`Element not found: ${elmt}`);
                        return;
                    }
                    DOM[variable] = el;
                });
            }
        });
        console.log('DOM created:', Object.keys(DOM));
    }

    /**
     * Sets DOM elements to their initial state based on config properties.
     * Handles both static (e.g., textContent, style.whiteSpace) and dynamic (e.g., selProfile.value) props.
     * Used by createDomManager and selProfile event listener to reset DOM state.
     * @returns {void}
     */
    function refreshDom() {
        console.log('Setting DOM properties');
        Object.values(domConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, elmt, props }) => {
                    const el = DOM[variable];
                    if (!el) {
                        console.warn(`Element not found: ${elmt}`);
                        return;
                    }
                    if (props) {
                        Object.entries(props).forEach(([key, value]) => {
                            if (key === 'style') {
                                Object.assign(el.style, value); // Apply style props (e.g., whiteSpace: '')
                            } else {
                                el[key] = typeof value === 'function' ? value() : value; // Handle dynamic/static props
                            }
                        });
                    }
                });
            }
        });
        console.log('Props set:', DOM.btnLoadCode.disabled);
    }

     /**
     * Updates DOM elements with dynamic properties from the config object.
     * Currently unused in direct approach but retained for future scalability.
     * @returns {void}
     */
    function updateDom() {
        console.log('Updating dynamic DOM elements');
        Object.values(domConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, props }) => {
                    const element = DOM[variable];
                    if (element && props) {
                        Object.entries(props).forEach(([key, value]) => {
                            if (typeof value === 'function') {
                                element[key] = value();
                            }
                        });
                    }
                });
            }
        });
        console.log('Dynamic DOM updated');
    }

    /**
     * Attaches event listeners to DOM elements based on config.
     * @returns {void}
     */
    function attachEventListeners() {
        console.log('Attaching event listeners');
        Object.values(domConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, eventListeners }) => {
                    if (eventListeners && eventListeners.length) {
                        const element = DOM[variable];
                        if (element) {
                            eventListeners.forEach(({ event, handler }) => {
                                element.addEventListener(event, handler);
                            });
                        } else {
                            console.warn(`Element not found in DOM: ${variable}`);
                        }
                    }
                });
            }
        });
        console.log('Event listeners attached');
    }
    function populateSelectOptions(selectElement, items, valueField, label, selectedItem) {
        console.log(`Populating select options for: ${selectElement.id}`);
        selectElement.innerHTML = '';
        items.forEach((item, index) => {
            const option = document.createElement('option');
            const value = typeof valueField === 'function' ? valueField(item, index) : item[valueField];
            const text = typeof label === 'function' ? label(item) : item[label];
            option.value = value;
            option.textContent = text;
            if (value === selectedItem) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        });
    }
    
    /**
     * Populates the file list select element with cached paths and an "All" option.
     * @returns {void} No return value.
     * Used on app startup and triggered by `DisplayFileContent` or `dataResult` event.
     */
    function populateFileList() {
        console.log('Populating file list');
        const select = DOM.selFileList;

        // Use cached paths
        const cachedPaths = cacheMan.getCachePaths();
        if (!cachedPaths || Array.isArray(cachedPaths)) {
            select.innerHTML = '';
            return;
        }
        const paths = cachedPaths.paths;

        // Prepare options with "All" first
        const options = [
            { value: 'All', text: 'All' },
            ...paths.map(path => ({ value: path, text: path }))
        ];

        // Populate select with options and set default to "All"
        populateSelectOptions(
            select,
            options,
            item => item.value,
            item => item.text,
            'All'
        );
    }
}

    //** For future use */
    /**
     * Attaches dynamic event listeners for future CMS-driven functionality.
     * Currently unused but retained for scalability.
     * @param {Object} uiFunctions - UI functions for event handling.
     * @returns {void}
     */
    function attachDynEventListeners(domConfig, DOM, uiFunctions) {
        console.log('Attaching event listeners');
        Object.values(domConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, eventListeners }) => {
                    if (DOM[variable] && eventListeners) {
                        eventListeners.forEach(({ event, handler }) => {
                            if (handler) {
                                let eventHandler = null;
                                // Check if handler is a function
                                if (typeof handler === 'function') {
                                    eventHandler = handler;
                                } else {
                                    // Convert to string and resolve from uiFunctions
                                    const handlerName = String(handler); // e.g., "updateCodeOutput"
                                    eventHandler = uiFunctions && uiFunctions[handlerName];
                                }
                                // Attach handler or throw error
                                if (typeof eventHandler === 'function') {
                                    DOM[variable].addEventListener(event, eventHandler);
                                } else {
                                    throw new Error(`Invalid handler for ${variable} on event ${event}: ${handler}`);
                                }
                            }
                        });
                    }
                });
            }
        });
    }