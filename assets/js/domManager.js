import { initComponents } from './domComponents.js';

export function initDom(domConfig,DOM, appSettings) {
  console.log('Creating DOM');
  //const DOM = {};
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
  setDom();
  attachEventListeners();
  initComponents(appSettings,DOM);
  
  function setDom() {
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
                            Object.assign(el.style, value);
                        } else {
                            el[key] = value;
                        }
                    });
                }
            });
        }
    });
    console.log('Props set:', DOM.btnLoadCode.disabled);
  }
  
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
}

//** For future use */
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