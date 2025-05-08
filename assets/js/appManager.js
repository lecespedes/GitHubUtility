// File: appManager.js

import { initComponents } from './domComponents.js';
import { createDomConfig } from './domConfig.js';
import { getCacheManager } from './cacheManager.js';

// Module-level variables so we can export functions aware of the DOM and domConfig
let DOM = null; 
let domConfig = {};
/**
 * Initializes the application by setting up DOM elements, event listeners, and cache.
 * @param {Object} appSettings - Application settings for initialization.
 * @param {Object} appState - Application state (e.g., activeProfile).
 * @param {Object} uiFunctions - UI functions (e.g., LoadPaths, DisplayPopUp).
 * @param {Object} dom - The DOM object to store element references.
 * @returns {void}
 */
export function createAppManager(appSettings, appState, uiFunctions, dom) {
    DOM = dom;
    const cacheMan = getCacheManager(appState);
    // Create domConfig
    createDomConfig(uiFunctions, appSettings, appState, cacheMan, domConfig, DOM);
    
    // Initialize DOM and attach listeners
    createDom();
    refreshDom();
    attachEventListeners();
    initComponents(appSettings, DOM, cacheMan);
    cacheMan.migrateCache();
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
                    const el = elmt === 'document' ? document : document.getElementById(elmt);
                if (!el && elmt !== 'document') {
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
                                if (typeof handler === 'function') {
                                    element.addEventListener(event, handler);
                                    console.log(`Successfully attached ${event} to ${variable}`);
                                } else {
                                    console.warn(`Skipping invalid handler for ${variable} on event ${event}: ${handler}`);
                                }
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
     * Sets DOM elements to their initial state based on config properties.
     * Handles both static (e.g., textContent, style.whiteSpace) and dynamic (e.g., selProfile.value) props.
     * Used by createDomManager and selProfile event listener to reset DOM state.
     * @returns {void}
     */
 export function refreshDom() {
    console.log('Refreshing DOM');
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
}