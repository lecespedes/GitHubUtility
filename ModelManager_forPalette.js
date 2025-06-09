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
export class ModelManager {
  constructor(paletteManager = null) {
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
      visibilityControls: null
    };
    this.swatchControlsElements = { rgb: null, hsl: null };
    this.inputControlsElements = { rgb: null, hsl: null };
    this.swatchCtrlLength = 475;
    this.swatchCtrlStep = 2;
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

  updateFromInput(mode) {
    const values = {
      r: ModelManager.parseInput(this.inputControlsElements.rgb?.querySelector('.input-r')?.value || this.state.rgb.r, 255),
      g: ModelManager.parseInput(this.inputControlsElements.rgb?.querySelector('.input-g')?.value || this.state.rgb.g, 255),
      b: ModelManager.parseInput(this.inputControlsElements.rgb?.querySelector('.input-b')?.value || this.state.rgb.b, 255),
      h: ModelManager.parseInput(this.inputControlsElements.hsl?.querySelector('.input-h')?.value || this.state.hsl.h, 359),
      s: ModelManager.parseInput(this.inputControlsElements.hsl?.querySelector('.input-s')?.value || this.state.hsl.s, 100),
      l: ModelManager.parseInput(this.inputControlsElements.hsl?.querySelector('.input-l')?.value || this.state.hsl.l, 100)
    };
    let hex;
    if (mode === 'rgb') {
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

    // Reset saturation overrides when primary color changes
    Object.keys(this.state.saturationOverrides).forEach(key => {
      this.state.saturationOverrides[key] = this.state.hsl.s;
    });
    this.state.individualSaturationOverrides = {};

    this.updateSwatches();
    if (this.paletteManager) {
      this.paletteManager.update();
    }
  }

  swatchControls(type, element) {
    element.innerHTML = '';
    this.swatchControlsElements[type] = element;
    const components = type === 'rgb' ? ['r', 'g', 'b'] : ['h', 's', 'l'];
    const scales = type === 'rgb' ? [255, 255, 255] : [359, 100, 100];
    const labels = type === 'rgb' ? ['R', 'G', 'B'] : ['H', 'S', 'L'];

    components.forEach((comp, index) => {
      const group = document.createElement('div');
      group.className = 'axis-swatch-group';
      const label = document.createElement('label');
      label.textContent = labels[index];
      const swatchLine = document.createElement('div');
      swatchLine.className = `swatch-line swatch-${comp}`;
      swatchLine.style.width = `${this.swatchCtrlLength}px`;
      group.appendChild(label);
      group.appendChild(swatchLine);
      element.appendChild(group);
    });

    this.updateSwatches();

    components.forEach(comp => {
      const swatchLine = element.querySelector(`.swatch-${comp}`);
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
    const components = type === 'rgb' ? ['r', 'g', 'b'] : ['h', 's', 'l'];
    const labels = type === 'rgb' ? ['Red', 'Green', 'Blue'] : ['Hue', 'Saturation', 'Lightness'];
    const maxValues = type === 'rgb' ? [255, 255, 255] : [359, 100, 100];
    const ranges = type === 'rgb' ? ['(0–255)', '(0–255)', '(0–255)'] : ['(0–359°)', '(0–100%)', '(0–100%)'];

    components.forEach((comp, index) => {
      const group = document.createElement('div');
      group.className = 'input-group';
      const label = document.createElement('label');
      label.textContent = labels[index];
      const input = document.createElement('input');
      input.type = 'number';
      input.className = `input-${comp}`;
      input.min = '0';
      input.max = maxValues[index];
      input.value = type === 'rgb' ? this.state.rgb[comp] : this.state.hsl[comp];
      input.addEventListener('input', () => this.updateFromInput(type));
      const range = document.createTextNode(ranges[index]);
      group.appendChild(label);
      group.appendChild(input);
      group.appendChild(range);
      element.appendChild(group);
    });
  }

  currentSwatch(element) {
    this.dom.colorSwatch = element;
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
          const swatch = document.createElement('div');
          swatch.className = 'swatch';
          swatch.style.backgroundColor = hex;
          swatch.style.width = `${swatchWidth}px`;
          swatch.title = Math.round(val);
          swatch.dataset[comp] = Math.round(val);
          const caret = document.createElement('div');
          caret.className = 'caret';
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