export const UNICODE = {
  star: "\u2605", // ★ Primary
  reflect: "\u25E7", // ◧ Complementary
  circled_y: "\u24CE", // Ⓨ SplitComplementary
  triangle: "\u25B2", // ▲ Triad
  filled_square: "\u25A0", // ■ Tetrad
  angle: "\u2220", // ∠ Adjacent
  eye: "\u{1F441}", // 👁 Eye
  theta: "\u03B8",
  phi: "\u03C6",
  palette: "\u{E2B1}",
  sun: "\uE284",
  gear: "\uE115",
  rainbow: "\u{1F308}\u{FE0E}"
};

export const colorRelationships = {
  primary: [{ offset: 0, name: 'Primary' }],
  complementary: [{ offset: 180, name: 'Complementary' }],
  splitComplementary: [
    { offset: 150, name: 'Split-Complementary' },
    { offset: 210, name: 'Split-Complementary' }
  ],
  triad: [
    { offset: 120, name: 'Triad' },
    { offset: 240, name: 'Triad' }
  ],
  tetrad: [
    { offset: 90, name: 'Tetrad' },
    { offset: 270, name: 'Tetrad' }
  ],
  adjacent: [
    { offset: 30, name: 'Adjacent' },
    { offset: -30, name: 'Adjacent' }
  ]
};

export const relationshipOrder = [
  { key: 'complementary', index: 0, offset: 180, name: 'Complementary', symbol: UNICODE.reflect, group: 'complementary' },
  { key: 'splitComplementary-2', index: 1, offset: 210, name: '2nd Split-Complementary', symbol: UNICODE.circled_y, group: 'splitComplementary' },
  { key: 'triad-2', index: 1, offset: 240, name: '2nd Triad', symbol: UNICODE.triangle, group: 'triad' },
  { key: 'tetrad-2', index: 1, offset: 270, name: '2nd Tetrad', symbol: UNICODE.filled_square, group: 'tetrad' },
  { key: 'adjacent-2', index: 1, offset: -30, name: '2nd Adjacent', symbol: UNICODE.angle, group: 'adjacent' },
  { key: 'primary', index: 0, offset: 0, name: 'Primary', symbol: UNICODE.star, group: 'primary' },
  { key: 'adjacent-1', index: 0, offset: 30, name: '1st Adjacent', symbol: UNICODE.angle, group: 'adjacent' },
  { key: 'tetrad-1', index: 0, offset: 90, name: '1st Tetrad', symbol: UNICODE.filled_square, group: 'tetrad' },
  { key: 'triad-1', index: 0, offset: 120, name: '1st Triad', symbol: UNICODE.triangle, group: 'triad' },
  { key: 'splitComplementary-1', index: 0, offset: 150, name: '1st Split-Complementary', symbol: UNICODE.circled_y, group: 'splitComplementary' }
];

export function getAngleFromValue(_value, _range) {
  const value = parseFloat(_value);
  if (value === 1) return parseFloat(2 * Math.PI);
  if (value === 0) return 0;
  const sinValue = parseFloat(2 * value - 1);
  if (Math.abs(sinValue) > 1) return 0;
  const angle = parseFloat((_range / Math.PI) * Math.asin(sinValue) + Math.PI / 2);
  return angle;
}

export function getValueFromAngle(_theta, _range) {
  const theta = parseFloat(_theta);
  const value = parseFloat((Math.sin((theta / (_range / Math.PI)) - (Math.PI / 2)) + 1) / 2);
  return value;
}

export function toDegrees(radians) {
  return parseFloat((radians * (180 / Math.PI)) % 360);
}

export function toRadians(degrees) {
  return parseFloat((degrees % 360) * (Math.PI / 180));
}

export function normRadians(radians) {
  return parseFloat(((radians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
}

const ELEMENTS = {
  controls: {
    type: "div",
    className: "",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      alignItems: "center",
      marginTop: "20px",
    },
  },
  urlGroup: {
    type: "div",
    className: "",
    style: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
    },
  },
  urlLabel: {
    type: "label",
    className: "",
    textContent: "Import URL",
    style: {
      fontSize: "0.9rem",
      fontWeight: "bold",
      color: "#333",
    },
  },
  urlInput: {
    type: "input",
    id: "import-url",
    className: "",
    typeAttr: "text",
    placeholder: "Enter URL (e.g., JSON, HTML, CSS)",
    style: {
      width: "200px",
      padding: "0.5rem",
      border: "1px solid #aaa",
      borderRadius: "4px",
      fontSize: "0.9rem",
      backgroundColor: "#fff",
    },
  },
  fileGroup: {
    type: "div",
    className: "",
    style: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
    },
  },
  fileLabel: {
    type: "label",
    className: "",
    textContent: "Import File",
    style: {
      fontSize: "0.9rem",
      fontWeight: "bold",
      color: "#333",
    },
  },
  fileInput: {
    type: "input",
    id: "file-input",
    className: "",
    typeAttr: "file",
    accept: "*/*",
    style: {
      width: "200px",
      padding: "0.5rem",
      border: "1px solid #aaa",
      borderRadius: "4px",
      fontSize: "0.9rem",
      backgroundColor: "#fff",
    },
  },
  buttonGroup: {
    type: "div",
    className: "",
    style: {
      display: "flex",
      gap: "10px",
    },
  },
  importButton: {
    type: "button",
    id: "import-data",
    className: "",
    textContent: "Import Colors",
    style: {
      padding: "0.5rem 1rem",
      border: "1px solid #aaa",
      borderRadius: "4px",
      background: "#eee",
      cursor: "pointer",
      fontSize: "0.9rem",
      color: "#333",
    },
  },
  clearButton: {
    type: "button",
    id: "clear-data",
    className: "",
    textContent: "Clear Data",
    style: {
      padding: "0.5rem 1rem",
      border: "1px solid #aaa",
      borderRadius: "4px",
      background: "#eee",
      cursor: "pointer",
      fontSize: "0.9rem",
      color: "#333",
    },
  },
  error: {
    type: "div",
    id: "error",
    className: "",
    style: {
      color: "red",
      fontSize: "0.9rem",
    },
  },
  inputContainer: {
    type: "div",
    className: "",
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "1rem",
      justifyContent: "center",
    },
  },
  inputGroup: {
    type: "div",
    className: "input-group",
    style: {
      display: "flex",
      flexDirection: "column",
      textAlign: "center",
    },
  },
  inputLabel: {
    type: "label",
    className: "",
    style: {
      fontSize: "0.9rem",
      fontWeight: "bold",
      color: "#333",
    },
  },
  input: {
    type: "input",
    className: "",
    style: {
      padding: "0.5rem",
      border: "1px solid #aaa",
      borderRadius: "4px",
      fontSize: "0.9rem",
      backgroundColor: "#fff",
      width: "100px",
    },
  },
  swatches: {
    type: "div",
    className: "swatches",
    style: {
      marginTop: "0.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
  },
  axisSwatchGroup: {
    type: "div",
    className: "axis-swatch-group",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      position: "relative",
    },
  },
  swatchGroupLabel: {
    type: "label",
    className: "",
    style: {
      fontSize: "0.9rem",
      fontWeight: "bold",
      width: "20px",
      color: "#333",
    },
  },
  swatchLine: {
    type: "div",
    className: "",
    style: {
      display: "flex",
    },
  },
  swatch: {
    type: "div",
    className: "swatch",
    style: {
      height: "1rem",
      cursor: "pointer",
      borderRight: "1px solid #f5f5f5",
      position: "relative",
    },
  },
  caret: {
    type: "div",
    className: "caret",
    style: {
      position: "absolute",
      top: "1rem",
      left: "50%",
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderBottom: "5px solid #333",
      transform: "translateX(-50%)",
      display: "none",
    },
  },
  hexText: {
    type: "span",
    className: "hex-text",
    style: {
      fontSize: "0.9rem",
    },
  },
};

export class ModelManager {
  constructor() {
    this.models = new Map();
    this.state = {
      rgb: { r: 255, g: 0, b: 0 },
      hsl: { h: 0, s: 100, l: 50 },
      lightnessSpread: 20,
      isVerticalLayout: false,
      saturationOverrides: {
        complementary: 100,
        splitComplementary: 100,
        triad: 100,
        tetrad: 100,
        adjacent: 100
      },
      individualSaturationOverrides: {},
      visibleRelationships: {
        primary: true,
        complementary: true,
        'splitComplementary-1': true,
        'splitComplementary-2': true,
        'triad-1': true,
        'triad-2': true,
        'tetrad-1': true,
        'tetrad-2': true,
        'adjacent-1': true,
        'adjacent-2': true
      }
    };
    this.dom = {
      colorSwatch: null,
      paletteSwatches: null,
      lightnessSpreadInput: null,
      layoutToggle: null,
      saturationControls: null,
      visibilityControls: null,
      importUrl: null,
      fileInput: null,
      error: null
    };
    this.swatchControlsElements = { rgb: null, hsl: null };
    this.inputControlsElements = { rgb: null, hsl: null, 'rgb-hex': null };
    this.swatchCtrlLength = 475;
    this.swatchCtrlStep = 2;
    this.paletteManager = null;
  }

  createElement(configName, overrides = {}) {
    const config = ELEMENTS[configName];
    if (!config) throw new Error(`Element config ${configName} not found`);

    const element = document.createElement(config.type);
    
    // Apply static properties
    if (config.className) element.className = config.className;
    if (config.id) element.id = config.id;
    if (config.textContent) element.textContent = config.textContent;
    if (config.typeAttr) element.type = config.typeAttr;
    if (config.placeholder) element.placeholder = config.placeholder;
    if (config.accept) element.accept = config.accept;

    // Apply styles
    Object.assign(element.style, config.style);

    // Apply overrides
    if (overrides.className) element.className += ` ${overrides.className}`;
    if (overrides.id) element.id = overrides.id;
    if (overrides.textContent) element.textContent = overrides.textContent;
    if (overrides.typeAttr) element.type = overrides.typeAttr;
    if (overrides.placeholder) element.placeholder = overrides.placeholder;
    if (overrides.accept) element.accept = overrides.accept;
    if (overrides.style) Object.assign(element.style, overrides.style);

    // Add hover effects for buttons
    if (configName === 'importButton' || configName === 'clearButton') {
      element.addEventListener('mouseover', () => {
        element.style.background = '#ddd';
      });
      element.addEventListener('mouseout', () => {
        element.style.background = '#eee';
      });
    }

    return element;
  }

  static parseHexColor(str) {
    const hexRegex = /#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{8})\b/g;
    return (str.match(hexRegex) || []).map(hex => {
      if (hex.length === 4 || hex.length === 5) {
        hex = '#' + hex.slice(1).split('').map(c => c + c).join('');
      }
      return hex.toLowerCase();
    });
  }

  static parseRGBColor(str) {
    const rgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+))?\s*\)/g;
    const matches = [];
    let match;
    while ((match = rgbRegex.exec(str)) !== null) {
      const [, r, g, b] = match;
      matches.push({ r: parseInt(r), g: parseInt(g), b: parseInt(b) });
    }
    return matches;
  }

  static parseHSLColor(str) {
    const hslRegex = /hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*(?:,\s*([\d.]+))?\s*\)/g;
    const matches = [];
    let match;
    while ((match = hslRegex.exec(str)) !== null) {
      const [, h, s, l] = match;
      matches.push({ h: parseInt(h), s: parseInt(s), l: parseInt(l) });
    }
    return matches;
  }

  static rgbToHSL(rgb) {
    return ModelManager.hexToHSL(ModelManager.rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  static extractColors(content) {
    const colors = [];
    let index = 1;

    ModelManager.parseHexColor(content).forEach(hex => {
      colors.push({
        code: `color${index++}`,
        hex,
        hsl: ModelManager.hexToHSL(hex)
      });
    });

    ModelManager.parseRGBColor(content).forEach(rgb => {
      colors.push({
        code: `color${index++}`,
        hex: ModelManager.rgbToHex(rgb.r, rgb.g, rgb.b),
        hsl: ModelManager.rgbToHSL(rgb)
      });
    });

    ModelManager.parseHSLColor(content).forEach(hsl => {
      colors.push({
        code: `color${index++}`,
        hex: ModelManager.rgbToHex(...Object.values(ModelManager.hslToRGB(hsl.h, hsl.s, hsl.l))),
        hsl
      });
    });

    const uniqueColors = [];
    const seenHex = new Set();
    colors.forEach(color => {
      if (!seenHex.has(color.hex)) {
        seenHex.add(color.hex);
        uniqueColors.push(color);
      }
    });

    return uniqueColors;
  }

  setPaletteManager(paletteManager) {
    this.paletteManager = paletteManager;
    if (paletteManager) {
      paletteManager.setModelManager(this);
    }
  }

  static parseInput(value, max, defaultValue = 0) {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : Math.max(0, Math.min(max, num));
  }

  static rgbToHex(r, g, b) {
    const toHex = x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  static hexToHSL(hex) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    h = h * 360;
    s = s * 100;
    l = l * 100;
    return { h, s, l };
  }

  static hslToRGB(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  static parseHexInput(value) {
    const cleanValue = value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 2).toUpperCase();
    if (!cleanValue.match(/^[0-9A-Fa-f]{2}$/)) return 0;
    return parseInt(cleanValue, 16);
  }

  static toHex(value) {
    const hex = Math.round(value).toString(16).toUpperCase();
    return hex.length === 1 ? '0' + hex : hex;
  }

  registerModel(id, model, width, height) {
    model.modelManager = this;
    const type = model.constructor.name;
    this.models.set(id, { model, width, height, type });
  }

  update() {
    this.models.forEach(({ model, type }) => {
      if (type === 'RGBCube') {
        model.updateColor(this.state.rgb);
      } else {
        model.updateColor(this.state.hsl);
      }
    });
  }

  animate() {
    try {
      requestAnimationFrame(this.animate.bind(this));
      this.models.forEach(({ model }) => {
        if (model.renderer.domElement.style.display === 'none') return;
        model.controls.update();
        model.render();
      });
    } catch (e) {
      console.error("Rendering failed:", e.message);
    }
  }

  createImportControls(containerElement) {
    containerElement.innerHTML = '';
    
    const controls = this.createElement('controls');
    const urlGroup = this.createElement('urlGroup');
    const urlLabel = this.createElement('urlLabel');
    const urlInput = this.createElement('urlInput');
    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(urlInput);
    controls.appendChild(urlGroup);

    const fileGroup = this.createElement('fileGroup');
    const fileLabel = this.createElement('fileLabel');
    const fileInput = this.createElement('fileInput');
    fileGroup.appendChild(fileLabel);
    fileGroup.appendChild(fileInput);
    controls.appendChild(fileGroup);

    const buttonGroup = this.createElement('buttonGroup');
    const importButton = this.createElement('importButton');
    const clearButton = this.createElement('clearButton');
    buttonGroup.appendChild(importButton);
    buttonGroup.appendChild(clearButton);
    controls.appendChild(buttonGroup);

    const error = this.createElement('error');
    controls.appendChild(error);

    containerElement.appendChild(controls);

    this.dom.importUrl = urlInput;
    this.dom.fileInput = fileInput;
    this.dom.error = error;

    importButton.addEventListener('click', async () => {
      this.dom.error.textContent = '';
      let content = '';

      if (this.dom.importUrl.value.trim()) {
        try {
          const response = await fetch(this.dom.importUrl.value);
          if (!response.ok) throw new Error('Failed to fetch file');
          content = await response.text();
        } catch (error) {
          this.dom.error.textContent = `Import error: ${error.message}`;
          return;
        }
      } else if (this.dom.fileInput.files.length > 0) {
        try {
          const file = this.dom.fileInput.files[0];
          content = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
          });
        } catch (error) {
          this.dom.error.textContent = `Import error: ${error.message}`;
          return;
        }
      } else {
        this.dom.error.textContent = 'Please provide a URL or select a file';
        return;
      }

      const data = ModelManager.extractColors(content);
      if (data.length === 0) {
        this.dom.error.textContent = 'No valid colors found in the file';
        return;
      }

      try {
        const hslCylinder = this.models.get('hslCylinder')?.model;
        if (!hslCylinder) throw new Error('HSL Cylinder model not found');
        hslCylinder.plotHSLData(data);
        this.dom.error.textContent = '';
      } catch (error) {
        this.dom.error.textContent = `Plotting error: ${error.message}`;
      }
    });

    clearButton.addEventListener('click', () => {
      const hslCylinder = this.models.get('hslCylinder')?.model;
      if (hslCylinder) hslCylinder.clearImportedData();
      this.dom.error.textContent = '';
      this.dom.importUrl.value = '';
      this.dom.fileInput.value = '';
    });
  }

  updateFromInput(mode) {
    const parseInput = (value, max) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : Math.max(0, Math.min(max, num));
    };

    const values = {
      r: mode === 'rgb-hex' ? 
        ModelManager.parseHexInput(this.inputControlsElements['rgb-hex']?.querySelector('.input-r')?.value || ModelManager.toHex(this.state.rgb.r)) :
        parseInput(this.inputControlsElements.rgb?.querySelector('.input-r')?.value || this.state.rgb.r, 255),
      g: mode === 'rgb-hex' ? 
        ModelManager.parseHexInput(this.inputControlsElements['rgb-hex']?.querySelector('.input-g')?.value || ModelManager.toHex(this.state.rgb.g)) :
        parseInput(this.inputControlsElements.rgb?.querySelector('.input-g')?.value || this.state.rgb.g, 255),
      b: mode === 'rgb-hex' ? 
        ModelManager.parseHexInput(this.inputControlsElements['rgb-hex']?.querySelector('.input-b')?.value || ModelManager.toHex(this.state.rgb.b)) :
        parseInput(this.inputControlsElements.rgb?.querySelector('.input-b')?.value || this.state.rgb.b, 255),
      h: parseInput(this.inputControlsElements.hsl?.querySelector('.input-h')?.value || this.state.hsl.h, 359),
      s: parseInput(this.inputControlsElements.hsl?.querySelector('.input-s')?.value || this.state.hsl.s, 100),
      l: parseInput(this.inputControlsElements.hsl?.querySelector('.input-l')?.value || this.state.hsl.l, 100)
    };
    let hex;
    if (mode === 'rgb' || mode === 'rgb-hex') {
      this.state.rgb = { r: values.r, g: values.g, b: values.b };
      hex = ModelManager.rgbToHex(values.r, values.g, values.b);
      this.state.hsl = ModelManager.hexToHSL(hex);
      this.state.hsl.h = parseFloat(this.state.hsl.h);
      if (isNaN(this.state.hsl.h)) this.state.hsl.h = values.h;
    } else {
      this.state.hsl = { h: values.h, s: values.s, l: values.l };
      this.state.rgb = ModelManager.hslToRGB(values.h, values.s, values.l);
      hex = ModelManager.rgbToHex(this.state.rgb.r, this.state.rgb.g, this.state.rgb.b);
    }

    if (this.inputControlsElements.rgb) {
      this.inputControlsElements.rgb.querySelector('.input-r').value = this.state.rgb.r;
      this.inputControlsElements.rgb.querySelector('.input-g').value = this.state.rgb.g;
      this.inputControlsElements.rgb.querySelector('.input-b').value = this.state.rgb.b;
    }
    if (this.inputControlsElements['rgb-hex']) {
      this.inputControlsElements['rgb-hex'].querySelector('.input-r').value = ModelManager.toHex(this.state.rgb.r);
      this.inputControlsElements['rgb-hex'].querySelector('.input-g').value = ModelManager.toHex(this.state.rgb.g);
      this.inputControlsElements['rgb-hex'].querySelector('.input-b').value = ModelManager.toHex(this.state.rgb.b);
    }
    if (this.inputControlsElements.hsl) {
      this.inputControlsElements.hsl.querySelector('.input-h').value = Math.round(this.state.hsl.h);
      this.inputControlsElements.hsl.querySelector('.input-s').value = Math.round(this.state.hsl.s);
      this.inputControlsElements.hsl.querySelector('.input-l').value = Math.round(this.state.hsl.l);
    }

    if (this.dom.colorSwatch) {
      const hsl = ModelManager.hexToHSL(hex);
      const swatchLightness = parseFloat(hsl.l);
      const textLightness = swatchLightness > 70 ? 0 : 100;
      const textRGB = ModelManager.hslToRGB(0, 0, textLightness);
      this.dom.colorSwatch.style.backgroundColor = hex;
      this.dom.colorSwatch.querySelector('.hex-text').textContent = hex.toUpperCase();
      this.dom.colorSwatch.querySelector('.hex-text').style.color = ModelManager.rgbToHex(textRGB.r, textRGB.g, textRGB.b);
    }

    if (this.paletteManager) {
      Object.keys(this.state.saturationOverrides).forEach(key => {
        this.state.saturationOverrides[key] = this.state.hsl.s;
      });
      this.state.individualSaturationOverrides = {};
      this.paletteManager.update();
    }

    this.updateSwatches();
    this.update();
  }

  swatchControls(type, element) {
    element.innerHTML = '';
    this.swatchControlsElements[type] = element;
    
    const swatches = this.createElement('swatches');
    element.appendChild(swatches);
    
    const components = type === 'rgb' ? ['r', 'g', 'b'] : ['h', 's', 'l'];
    const scales = type === 'rgb' ? [255, 255, 255] : [359, 100, 100];
    const labels = type === 'rgb' ? ['R', 'G', 'B'] : ['H', 'S', 'L'];

    components.forEach((comp, index) => {
      const group = this.createElement('axisSwatchGroup');
      const label = this.createElement('swatchGroupLabel');
      label.textContent = labels[index];
      const swatchLine = this.createElement('swatchLine', { className: `swatch-${comp}` });
      swatchLine.style.width = `${this.swatchCtrlLength}px`;
      group.appendChild(label);
      group.appendChild(swatchLine);
      swatches.appendChild(group);
    });

    this.updateSwatches();

    components.forEach(comp => {
      const swatchLine = swatches.querySelector(`.swatch-${comp}`);
      swatchLine.addEventListener('click', event => {
        if (event.target.classList.contains('swatch')) {
          const value = event.target.dataset[comp];
          const input = this.inputControlsElements[type]?.querySelector(`.input-${comp}`);
          if (input) {
            input.value = value;
            this.updateFromInput(type);
          }
        }
      });
    });
  }

  inputControls(type, element) {
    element.innerHTML = '';
    this.inputControlsElements[type] = element;
    
    const container = this.createElement('inputContainer');
    element.appendChild(container);

    let components, labels, maxValues, ranges;
    if (type === 'rgb' || type === 'rgb-hex') {
      components = ['r', 'g', 'b'];
      labels = ['Red', 'Green', 'Blue'];
      maxValues = [255, 255, 255];
      ranges = type === 'rgb' ? ['(0–255)', '(0–255)', '(0–255)'] : ['(00–FF)', '(00–FF)', '(00–FF)'];
    } else {
      components = ['h', 's', 'l'];
      labels = ['Hue', 'Saturation', 'Lightness'];
      maxValues = [359, 100, 100];
      ranges = ['(0–359°)', '(0–100%)', '(0–100%)'];
    }

    components.forEach((comp, index) => {
      const group = this.createElement('inputGroup');
      const label = this.createElement('inputLabel');
      label.textContent = labels[index];
      const input = this.createElement('input', { className: `input-${comp}` });
      if (type === 'rgb-hex') {
        input.type = 'text';
        input.pattern = '[0-9A-Fa-f]{2}';
        input.maxLength = 2;
        input.value = ModelManager.toHex(this.state.rgb[comp]);
      } else {
        input.type = 'number';
        input.min = '0';
        input.max = maxValues[index];
        input.value = type === 'rgb' ? this.state.rgb[comp] : this.state.hsl[comp];
      }
      input.addEventListener('input', () => this.updateFromInput(type));
      const range = document.createTextNode(ranges[index]);
      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(range);
      container.appendChild(group);
    });
  }

  currentSwatch(element) {
    this.dom.colorSwatch = element;
    const hexText = element.querySelector('.hex-text');
    if (hexText) {
      Object.assign(hexText.style, ELEMENTS.hexText.style);
    }
    this.updateFromInput('rgb');
  }

  updateSwatches() {
    const values = {
      r: this.state.rgb.r,
      g: this.state.rgb.g,
      b: this.state.rgb.b,
      h: this.state.hsl.h,
      s: this.state.hsl.s,
      l: this.state.hsl.l
    };

    const swatchCtrlLength = Math.max(100, this.swatchCtrlLength);
    const numSwatches = (100 / this.swatchCtrlStep) + 1;
    const swatchWidth = Math.round(swatchCtrlLength / numSwatches);

    ['rgb', 'hsl'].forEach(type => {
      const element = this.swatchControlsElements[type];
      if (!element) return;
      const components = type === 'rgb' ? ['r', 'g', 'b'] : ['h', 's', 'l'];
      const scales = type === 'rgb' ? [255, 255, 255] : [359, 100, 100];
      components.forEach((comp, index) => {
        const swatchLine = element.querySelector(`.swatch-${comp}`);
        if (!swatchLine) return;
        swatchLine.innerHTML = '';
        for (let i = 0; i < numSwatches; i++) {
          const normalizedVal = i * this.swatchCtrlStep;
          const val = (scales[index] * normalizedVal) / 100;
          const colorValues = { ...values };
          colorValues[comp] = Math.round(val);
          const rgb = type === 'rgb'
            ? colorValues
            : ModelManager.hslToRGB(colorValues.h, colorValues.s, colorValues.l);
          const hex = ModelManager.rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
          const swatch = this.createElement('swatch');
          swatch.style.backgroundColor = hex;
          swatch.style.width = `${swatchWidth}px`;
          swatch.title = Math.round(val);
          swatch.dataset[comp] = Math.round(val);
          const caret = this.createElement('caret');
          swatch.appendChild(caret);
          swatchLine.appendChild(swatch);
        }

        const swatches = swatchLine.querySelectorAll('.swatch');
        const step = scales[index] / (swatches.length - 1);
        swatches.forEach((swatchEl, i) => {
          const swatchValue = i * step;
          const caret = swatchEl.querySelector('.caret');
          const isActive = values[comp] >= swatchValue && values[comp] < (swatchValue + step) ||
            (i === swatches.length - 1 && values[comp] >= swatchValue);
          caret.style.display = isActive ? 'block' : 'none';
        });
      });
    });
  }
}