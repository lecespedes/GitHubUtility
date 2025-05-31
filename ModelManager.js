import { ColorModel, RGBCube } from '.ColorModels.js';

export class ModelManager {
  constructor() {
    this.models = new Map();
    this.state = { rgb: { r: 255, g: 0, b: 0 }, hsl: { h: 0, s: 100, l: 50 } };
    this.dom = { colorSwatch: null };
    this.swatchControlsElements = { rgb: null, hsl: null };
    this.inputControlsElements = { rgb: null, hsl: null };
  }

  registerModel(id, model, width, height) {
    model.modelManager = this;
    this.models.set(id, { model, width, height });
  }

  update() {
    this.models.forEach(({ model }) => {
      if (model instanceof RGBCube) {
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

  updateFromInput(mode) {
    const parseInput = (value, max) => {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : Math.max(0, Math.min(max, num));
    };

    const values = {
      r: parseInput(this.inputControlsElements.rgb?.querySelector('.input-r')?.value || this.state.rgb.r, 255),
      g: parseInput(this.inputControlsElements.rgb?.querySelector('.input-g')?.value || this.state.rgb.g, 255),
      b: parseInput(this.inputControlsElements.rgb?.querySelector('.input-b')?.value || this.state.rgb.b, 255),
      h: parseInput(this.inputControlsElements.hsl?.querySelector('.input-h')?.value || this.state.hsl.h, 359),
      s: parseInput(this.inputControlsElements.hsl?.querySelector('.input-s')?.value || this.state.hsl.s, 100),
      l: parseInput(this.inputControlsElements.hsl?.querySelector('.input-l')?.value || this.state.hsl.l, 100)
    };
    let hex;
    if (mode === 'rgb') {
      this.state.rgb = { r: values.r, g: values.g, b: values.b };
      hex = ColorModel.rgbToHex(values.r, values.g, values.b);
      this.state.hsl = ColorModel.hexToHSL(hex);
      this.state.hsl.h = parseFloat(this.state.hsl.h);
      if (isNaN(this.state.hsl.h)) this.state.hsl.h = values.h;
    } else {
      this.state.hsl = { h: values.h, s: values.s, l: values.l };
      this.state.rgb = ColorModel.hslToRGB(values.h, values.s, values.l);
      hex = ColorModel.rgbToHex(this.state.rgb.r, this.state.rgb.g, this.state.rgb.b);
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
      const hsl = ColorModel.hexToHSL(hex);
      const swatchLightness = parseFloat(hsl.l);
      const textLightness = swatchLightness > 70 ? 0 : 100;
      const textRGB = ColorModel.hslToRGB(0, 0, textLightness);
      this.dom.colorSwatch.style.backgroundColor = hex;
      this.dom.colorSwatch.querySelector('.hex-text').textContent = hex.toUpperCase();
      this.dom.colorSwatch.querySelector('.hex-text').style.color = ColorModel.rgbToHex(textRGB.r, textRGB.g, textRGB.b);
    }

    this.updateSwatches();
    this.update();
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
      swatchLine.style.width = `${475}px`;
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

    const swatchCtrlLength = Math.max(100, 475);
    const numSwatches = (100 / 2) + 1;
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
          const normalizedVal = i * 2;
          const val = (scales[index] * normalizedVal) / 100;
          const colorValues = { ...values };
          colorValues[comp] = Math.round(val);
          const rgb = type === 'rgb'
            ? colorValues
            : ColorModel.hslToRGB(colorValues.h, colorValues.s, colorValues.l);
          const hex = ColorModel.rgbToHex(Math.round(rgb.r), Math.round(rgb.g), Math.round(rgb.b));
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