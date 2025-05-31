// File: app.js

import { createAppConfig } from './appConfig.js';
import { getCacheManager } from './cacheManager.js';

// Module-level variables so we can export functions aware of the DOM and appConfig
    let DOM = {}; 
    const cacheMan = getCacheManager();
    const appConfig = createAppConfig(cacheMan, DOM);

    createApp();
    refreshApp(true);
    attachEventListeners();
    cacheMan.migrateCache();

    /**
     * Creates DOM element references from the configuration and stores them in the DOM object.
     * @param {Object} appConfig - The configuration object containing element definitions.
     * @param {Object} DOM - The DOM object to store element references.
     * @returns {void}
     */
    function createApp() {
        Object.values(appConfig).forEach(group => {
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
    }

    /**
     * Attaches event listeners to DOM elements based on config.
     * @returns {void}
     */
    function attachEventListeners() {
        Object.values(appConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, eventListeners }) => {
                    if (eventListeners && eventListeners.length) {
                        const element = DOM[variable];
                        if (element) {
                            eventListeners.forEach(({ event, handler }) => {
                                if (typeof handler === 'function') {
                                    element.addEventListener(event, handler);
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
    }

    //** For future use */
    /**
     * Attaches dynamic event listeners for future CMS-driven functionality.
     * Currently unused but retained for scalability.
     * @param {Object} uiFunctions - UI functions for event handling.
     * @returns {void}
     */
    function attachDynEventListeners(appConfig, DOM, uiFunctions) {
        console.log('Attaching event listeners');
        Object.values(appConfig).forEach(group => {
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

    /**
     * Updates DOM elements with dynamic properties from the config object.
     * Currently unused in direct approach but retained for future scalability.
     * @returns {void}
     */
    function updateApp() {
    console.log('Updating dynamic DOM elements');
    Object.values(appConfig).forEach(group => {
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
    export function refreshApp(staticRefresh = false) {
        console.log('Refreshing DOM');
        Object.values(appConfig).forEach(group => {
            if (Array.isArray(group)) {
                group.forEach(({ var: variable, elmt, props, staticProps}) => {
                    //console.log('refreshDom: Processing', variable, 'staticProps=', staticProps, 'staticRefresh=', staticRefresh);
                    const el = DOM[variable];
                    if (!el) {
                        console.warn(`Element not found: ${elmt}`);
                        return;
                    }
                    if (props && (staticRefresh || !staticProps)) {
                        //console.log(variable+": staticRefresh: "+staticRefresh+" staticProps: "+staticProps);
                        Object.entries(props).forEach(([key, value]) => {
                            if (key === 'style') {
                                Object.assign(el.style, value); // Apply style props (e.g., whiteSpace: '')
                            } else {
                                //el[key] = typeof value === 'function' ? value() : value; // Handle dynamic/static props
                                if (typeof value === 'function') {
                                    //console.log(`${variable}:${key} calling function ${value.name}, value:`);
                                    //console.log(value());
                                    el[key] = value();
                                } else {
                                    //console.log(`${variable}, property '${key}', value: ${value}`);
                                    el[key] = value;
                                }
                            }
                        });
                    }
                });
            }
        });
    }