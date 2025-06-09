import { ModelManager, UNICODE, colorRelationships, relationshipOrder, getAngleFromValue, getValueFromAngle, toDegrees, toRadians, normRadians } from './ModelManager.js';
//import { ModelManager, UNICODE, colorRelationships, relationshipOrder, getAngleFromValue, getValueFromAngle, toDegrees, toRadians, normRadians } from 'https://cdn.jsdelivr.net/gh/lecespedes/GitHubUtility@main/ModelManager.js?v=1.0';

export class PaletteManager {
  constructor(containerElement) {
    this.containerElement = containerElement;
    this.modelManager = null;
    this.dom = {
      paletteControls: null,
      layoutToggle: null,
      saturationControls: null,
      visibilityControls: null,
      visibilityButton: null,
      visibilityDropdown: null,
      settingsControls: null,
      settingsButton: null,
      settingsDropdown: null,
      paletteSwatches: null,
      startAngleInput: null,
      endAngleInput: null,
      angleStepInput: null,
      satStartAngleInput: null,
      satEndAngleInput: null,
      satAngleStepInput: null
    };
    this.initializeElements();
  }

  setModelManager(modelManager) {
    this.modelManager = modelManager;
  }

  initializeElements() {
    this.containerElement.style.display = 'flex';
    this.containerElement.style.justifyContent = 'center';
    
    const paletteColumn = document.createElement('div');
    paletteColumn.style.display = 'flex';
    paletteColumn.style.flexDirection = 'column';
    paletteColumn.style.alignItems = 'center';
    paletteColumn.style.gap = '10px';
    
    const paletteHeader = document.createElement('div');
    paletteHeader.className = 'palette-header';
    paletteHeader.style.display = 'flex';
    paletteHeader.style.flexDirection = 'column';
    paletteHeader.style.alignItems = 'center';
    paletteHeader.style.gap = '10px';

    paletteColumn.appendChild(paletteHeader);
    
    const paletteControls = document.createElement('div');
    paletteControls.className = 'palette-controls';
    paletteControls.style.display = 'flex';
    paletteControls.style.alignItems = 'end';
    paletteControls.style.gap = '1rem';
    this.dom.paletteControls = paletteControls;

    paletteControls.appendChild(createSaturationControls(this));
    paletteControls.appendChild(createVisibilityControl(this));
    paletteControls.appendChild(createSettingsControl(this));
    
    paletteHeader.appendChild(createLayoutToggle(this));
    paletteHeader.appendChild(paletteControls);

    const paletteSwatches = document.createElement('div');
    paletteSwatches.className = 'palette-swatches';
    this.dom.paletteSwatches = paletteSwatches;
    
    paletteColumn.appendChild(paletteSwatches);

    this.containerElement.appendChild(paletteColumn);

    function createLayoutToggle(_this) {
      const switchContainer = document.createElement('div');
      switchContainer.className = 'palette-switch-container';
      switchContainer.style.display = 'flex';
      switchContainer.style.alignItems = 'center';
      const rowsLabel = document.createElement('span');
      rowsLabel.className = 'switch-label';
      rowsLabel.textContent = 'Rows ';
      const switchLabel = document.createElement('label');
      switchLabel.className = 'switch';
      switchLabel.style.margin = '0 5px';
      const switchInput = document.createElement('input');
      switchInput.type = 'checkbox';
      switchInput.id = 'layout-toggle';
      const slider = document.createElement('span');
      slider.className = 'slider';
      switchLabel.appendChild(switchInput);
      switchLabel.appendChild(slider);
      const columnsLabel = document.createElement('span');
      columnsLabel.className = 'switch-label';
      columnsLabel.textContent = ' Columns';
      switchContainer.appendChild(rowsLabel);
      switchContainer.appendChild(switchLabel);
      switchContainer.appendChild(columnsLabel);

      switchInput.addEventListener('change', () => {
        if (_this.modelManager) {
          _this.modelManager.state.isVerticalLayout = switchInput.checked;
          _this.createPalette();
        }
      });
      _this.dom.layoutToggle = switchInput;
      return switchContainer;
    }

    function createSettingsControl(_this) {
      const settingsControls = document.createElement('div');
      settingsControls.className = 'settings-controls';
      const settingsButton = document.createElement('button');
      settingsButton.className = 'settings-button symbols';
      settingsButton.textContent = UNICODE.gear;
      settingsButton.title = "Settings";
      const settingsDropdown = document.createElement('div');
      settingsDropdown.className = 'settings-dropdown';

      const createLightnessSettings = () => {
        const angularLightnessGroup = document.createElement('div');
        angularLightnessGroup.className = 'settings-group';

        const angularLightnessTitle = document.createElement('span');
        angularLightnessTitle.textContent = 'Angular Lightness Settings';
        angularLightnessGroup.appendChild(angularLightnessTitle);

        const startAngleGroup = document.createElement('div');
        startAngleGroup.className = 'palette-input-group';
        const startAngleLabel = document.createElement('label');
        startAngleLabel.htmlFor = 'start-angle';
        startAngleLabel.textContent = 'Start Angle';
        const startAngleInput = document.createElement('input');
        startAngleInput.type = 'number';
        startAngleInput.id = 'start-angle';
        startAngleInput.min = '0';
        startAngleInput.max = '360';
        startAngleInput.value = '75';
        const startAngleRange = document.createElement('span');
        startAngleRange.textContent = '(0-360°)';
        startAngleGroup.appendChild(startAngleLabel);
        startAngleGroup.appendChild(startAngleInput);
        startAngleGroup.appendChild(startAngleRange);
        angularLightnessGroup.appendChild(startAngleGroup);

        const endAngleGroup = document.createElement('div');
        endAngleGroup.className = 'palette-input-group';
        const endAngleLabel = document.createElement('label');
        endAngleLabel.htmlFor = 'end-angle';
        endAngleLabel.textContent = 'End Angle';
        const endAngleInput = document.createElement('input');
        endAngleInput.type = 'number';
        endAngleInput.id = 'end-angle';
        endAngleInput.min = '0';
        endAngleInput.max = '360';
        endAngleInput.value = '300';
        const endAngleRange = document.createElement('span');
        endAngleRange.textContent = '(0-360°)';
        endAngleGroup.appendChild(endAngleLabel);
        endAngleGroup.appendChild(endAngleInput);
        endAngleGroup.appendChild(endAngleRange);
        angularLightnessGroup.appendChild(endAngleGroup);

        const angleStepGroup = document.createElement('div');
        angleStepGroup.className = 'palette-input-group';
        const angleStepLabel = document.createElement('label');
        angleStepLabel.htmlFor = 'angle-step';
        angleStepLabel.textContent = 'Angle Step';
        const angleStepInput = document.createElement('input');
        angleStepInput.type = 'number';
        angleStepInput.id = 'angle-step';
        angleStepInput.min = '5';
        angleStepInput.max = '90';
        angleStepInput.value = '45';
        const angleStepRange = document.createElement('span');
        angleStepRange.textContent = '(5-90°)';
        angleStepGroup.appendChild(angleStepLabel);
        angleStepGroup.appendChild(angleStepInput);
        angleStepGroup.appendChild(angleStepRange);
        angularLightnessGroup.appendChild(angleStepGroup);

        _this.dom.startAngleInput = startAngleInput;
        _this.dom.endAngleInput = endAngleInput;
        _this.dom.angleStepInput = angleStepInput;

        startAngleInput.addEventListener('input', () => {
          if (_this.modelManager) {
            _this.modelManager.state.startAngle = ModelManager.parseInput(startAngleInput.value, 360, 75);
            _this.createPalette();
          }
        });

        endAngleInput.addEventListener('input', () => {
          if (_this.modelManager) {
            _this.modelManager.state.endAngle = ModelManager.parseInput(endAngleInput.value, 360, 300);
            _this.createPalette();
          }
        });

        angleStepInput.addEventListener('input', () => {
          if (_this.modelManager) {
            _this.modelManager.state.angleStep = ModelManager.parseInput(angleStepInput.value, 90, 45);
            _this.createPalette();
          }
        });

        return angularLightnessGroup;
      };

      const createSaturationSettings = () => {
        const angularSaturationGroup = document.createElement('div');
        angularSaturationGroup.className = 'settings-group';

        const angularSaturationTitle = document.createElement('span');
        angularSaturationTitle.textContent = 'Angular Saturation Settings';
        angularSaturationGroup.appendChild(angularSaturationTitle);

        const satStartAngleGroup = document.createElement('div');
        satStartAngleGroup.className = 'palette-input-group';
        const satStartAngleLabel = document.createElement('label');
        satStartAngleLabel.htmlFor = 'sat-start-angle';
        satStartAngleLabel.textContent = 'Start Angle';
        const satStartAngleInput = document.createElement('input');
        satStartAngleInput.type = 'number';
        satStartAngleInput.id = 'sat-start-angle';
        satStartAngleInput.min = '0';
        satStartAngleInput.max = '360';
        satStartAngleInput.value = '90';
        const satStartAngleRange = document.createElement('span');
        satStartAngleRange.textContent = '(0-360°)';
        satStartAngleGroup.appendChild(satStartAngleLabel);
        satStartAngleGroup.appendChild(satStartAngleInput);
        satStartAngleGroup.appendChild(satStartAngleRange);
        angularSaturationGroup.appendChild(satStartAngleGroup);

        const satEndAngleGroup = document.createElement('div');
        satEndAngleGroup.className = 'palette-input-group';
        const satEndAngleLabel = document.createElement('label');
        satEndAngleLabel.htmlFor = 'sat-end-angle';
        satEndAngleLabel.textContent = 'End Angle';
        const satEndAngleInput = document.createElement('input');
        satEndAngleInput.type = 'number';
        satEndAngleInput.id = 'sat-end-angle';
        satEndAngleInput.min = '0';
        satEndAngleInput.max = '360';
        satEndAngleInput.value = '270';
        const satEndAngleRange = document.createElement('span');
        satEndAngleRange.textContent = '(0-360°)';
        satEndAngleGroup.appendChild(satEndAngleLabel);
        satEndAngleGroup.appendChild(satEndAngleInput);
        satEndAngleGroup.appendChild(satEndAngleRange);
        angularSaturationGroup.appendChild(satEndAngleGroup);

        const satAngleStepGroup = document.createElement('div');
        satAngleStepGroup.className = 'palette-input-group';
        const satAngleStepLabel = document.createElement('label');
        satAngleStepLabel.htmlFor = 'sat-angle-step';
        satAngleStepLabel.textContent = 'Angle Step';
        const satAngleStepInput = document.createElement('input');
        satAngleStepInput.type = 'number';
        satAngleStepInput.id = 'sat-angle-step';
        satAngleStepInput.min = '5';
        satAngleStepInput.max = '90';
        satAngleStepInput.value = '30';
        const satAngleStepRange = document.createElement('span');
        satAngleStepRange.textContent = '(5-90°)';
        satAngleStepGroup.appendChild(satAngleStepLabel);
        satAngleStepGroup.appendChild(satAngleStepInput);
        satAngleStepGroup.appendChild(satAngleStepRange);
        angularSaturationGroup.appendChild(satAngleStepGroup);

        _this.dom.satStartAngleInput = satStartAngleInput;
        _this.dom.satEndAngleInput = satEndAngleInput;
        _this.dom.satAngleStepInput = satAngleStepInput;

        satStartAngleInput.addEventListener('input', () => {
          if (_this.modelManager) {
            _this.modelManager.state.satStartAngle = ModelManager.parseInput(satStartAngleInput.value, 360, 90);
            _this.createPalette();
          }
        });

        satEndAngleInput.addEventListener('input', () => {
          if (_this.modelManager) {
            _this.modelManager.state.satEndAngle = ModelManager.parseInput(satEndAngleInput.value, 360, 270);
            _this.createPalette();
          }
        });

        satAngleStepInput.addEventListener('input', () => {
          if (_this.modelManager) {
            _this.modelManager.state.satAngleStep = ModelManager.parseInput(satAngleStepInput.value, 90, 30);
            _this.createPalette();
          }
        });

        return angularSaturationGroup;
      };

      settingsControls.appendChild(settingsButton);
      settingsControls.appendChild(settingsDropdown);
      settingsDropdown.appendChild(createLightnessSettings());
      settingsDropdown.appendChild(createSaturationSettings());

      _this.dom.settingsControls = settingsControls;
      _this.dom.settingsButton = settingsButton;
      _this.dom.settingsDropdown = settingsDropdown;

      settingsButton.addEventListener('click', () => {
        _this.dom.settingsDropdown.classList.toggle('active');
        _this.dom.visibilityDropdown.classList.remove('active');
      });

      settingsControls.addEventListener('mouseleave', () => {
        _this.dom.settingsDropdown.classList.remove('active');
      });

      return settingsControls;
    }

    function createVisibilityControl(_this) {
      const visibilityControls = document.createElement('div');
      visibilityControls.className = 'visibility-controls';
      const visibilityButton = document.createElement('button');
      visibilityButton.className = 'visibility-button symbols';
      visibilityButton.textContent = UNICODE.eye;
      visibilityButton.title = "Show/Hide Colors";
      const visibilityDropdown = document.createElement('div');
      visibilityDropdown.className = 'visibility-dropdown';

      visibilityControls.appendChild(visibilityButton);
      visibilityControls.appendChild(visibilityDropdown);

      _this.dom.visibilityControls = visibilityControls;
      _this.dom.visibilityButton = visibilityButton;
      _this.dom.visibilityDropdown = visibilityDropdown;

      visibilityButton.addEventListener('click', () => {
        _this.dom.visibilityDropdown.classList.toggle('active');
        _this.dom.settingsDropdown.classList.remove('active');
      });

      visibilityControls.addEventListener('mouseleave', () => {
        _this.dom.visibilityDropdown.classList.remove('active');
      });

      return visibilityControls;
    }

    function createSaturationControls(_this) {
      const groupSatCtrls = document.createElement('div');
      groupSatCtrls.style.display = 'flex';
      groupSatCtrls.style.flexDirection = 'column';
      groupSatCtrls.style.gap = '10px';
      const groupSatCtrls_Title = document.createElement('span');
      groupSatCtrls_Title.textContent = 'Color Relationship Group Saturation (0-100%)';
      groupSatCtrls.appendChild(groupSatCtrls_Title);

      const saturationControls = document.createElement('div');
      saturationControls.className = 'saturation-controls';
      _this.dom.saturationControls = saturationControls;
      groupSatCtrls.appendChild(saturationControls);
      return groupSatCtrls;
    }
  }

  updateSaturationInputs() {
    if (!this.dom.saturationControls || !this.modelManager) return;
    this.dom.saturationControls.innerHTML = '';

    const groups = [...new Set(relationshipOrder.map(rel => rel.group).filter(g => g !== 'primary'))];
    groups.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'saturation-input-group';

      const label = document.createElement('label');
      const groupSymbol = relationshipOrder.find(rel => rel.group === group)?.symbol || '';
      label.textContent = `${groupSymbol}`;
      groupEl.appendChild(label);

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.max = '100';
      input.value = this.modelManager.state.saturationOverrides[group];
      input.dataset.group = group;
      input.addEventListener('input', () => {
        this.modelManager.state.saturationOverrides[group] = ModelManager.parseInput(input.value, 100, this.modelManager.state.hsl.s);
        relationshipOrder.forEach(rel => {
          if (rel.group === group) {
            delete this.modelManager.state.individualSaturationOverrides[rel.key];
          }
        });
        this.createPalette();
      });

      groupEl.appendChild(input);
      this.dom.saturationControls.appendChild(groupEl);
    });
  }

  updateVisibilityDropdown() {
    if (!this.dom.visibilityDropdown || !this.modelManager) return;
    this.dom.visibilityDropdown.innerHTML = '';

    relationshipOrder.forEach(rel => {
      const option = document.createElement('div');
      option.className = 'visibility-option';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.modelManager.state.visibleRelationships[rel.key];
      checkbox.dataset.key = rel.key;
      checkbox.addEventListener('change', () => {
        this.modelManager.state.visibleRelationships[rel.key] = checkbox.checked;
        this.createPalette();
      });

      const label = document.createElement('label');
      label.textContent = `${rel.symbol} ${rel.name}`;

      option.appendChild(label);
      option.appendChild(checkbox);

      this.dom.visibilityDropdown.appendChild(option);
    });
  }

  toggleDropdown(buttonEl) {
    const dropdown = buttonEl.closest('.palette-swatch-group').querySelector('.saturation-dropdown');
    const isActive = dropdown.classList.contains('active');
    document.querySelectorAll('.saturation-dropdown.active').forEach(el => {
      el.classList.remove('active');
    });
    if (!isActive) {
      dropdown.classList.add('active');
    }
  }

  createPalette() {
    if (!this.dom.paletteSwatches || !this.modelManager) return;
    this.dom.paletteSwatches.innerHTML = '';

    const { h, s, l } = this.modelManager.state.hsl;
    const isVertical = this.modelManager.state.isVerticalLayout;
    const startAngle = this.modelManager.state.startAngle || 75;
    const endAngle = this.modelManager.state.endAngle || 300;
    const angleStep = this.modelManager.state.angleStep || 45;
    const satStartAngle = this.modelManager.state.satStartAngle || 90;
    const satEndAngle = this.modelManager.state.satEndAngle || 270;
    const satAngleStep = this.modelManager.state.satAngleStep || 30;
    const range = 2 * Math.PI;

    const visibleRels = relationshipOrder.filter(rel => this.modelManager.state.visibleRelationships[rel.key]);
    this.dom.paletteSwatches.style.gridTemplateColumns = isVertical ? `repeat(${visibleRels.length}, minmax(150px, 1fr))` : 'auto';

    visibleRels.forEach(rel => {
      const group = document.createElement('div');
      group.className = 'palette-swatch-group';
      group.style.flexDirection = isVertical ? 'column' : 'row';

      const labelContainer = document.createElement('label');
      labelContainer.textContent = `${rel.symbol} ${rel.name}`;
      group.appendChild(labelContainer);

      const paletteButton = document.createElement('div');
      paletteButton.className = 'palette-button symbols';
      paletteButton.textContent = UNICODE.palette;
      group.appendChild(paletteButton);

      const wrapper = document.createElement('div');
      wrapper.className = 'swatch-and-dropdown-wrapper';

      const swatchContainer = document.createElement('div');
      swatchContainer.className = isVertical ? 'palette-swatch-column' : 'palette-swatch-line';

      const swatches = [];
      const relHue = (h + rel.offset) % 360;

      const lightnessSteps = [];
      let currentAngle = startAngle;
      const angles = [];

      while (currentAngle <= endAngle) {
        angles.push(currentAngle);
        currentAngle += angleStep;
      }

      angles.forEach(angle => {
        const theta = toRadians(angle);
        const normalizedValue = getValueFromAngle(theta, range);
        const lightness = Math.min(Math.max(normalizedValue * 100, 0), 100);
        lightnessSteps.push(Math.round(lightness));
      });

      if (lightnessSteps.length > 0) {
        const currentL = Math.round(l);
        const closestIndex = lightnessSteps.reduce((closestIdx, stepL, idx) => {
          return Math.abs(stepL - currentL) < Math.abs(lightnessSteps[closestIdx] - currentL) ? idx : closestIdx;
        }, 0);
        lightnessSteps[closestIndex] = currentL;
      }

      const uniqueLightnessSteps = [...new Set(lightnessSteps)].sort((a, b) => a - b);

      const saturation = this.modelManager.state.individualSaturationOverrides[rel.key] !== undefined ?
        this.modelManager.state.individualSaturationOverrides[rel.key] :
        rel.key === 'primary' ? s : this.modelManager.state.saturationOverrides[rel.group] || s;

      uniqueLightnessSteps.forEach(stepL => {
        const rgb = ModelManager.hslToRGB(relHue, saturation, stepL);
        const hex = ModelManager.rgbToHex(rgb.r, rgb.g, rgb.b);
        swatches.push({
          h: relHue,
          s: saturation,
          l: stepL,
          hex,
          isPrimary: rel.key === 'primary' && Math.abs(stepL - l) < 0.01,
          relName: rel.name
        });
      });

      swatches.forEach(swatch => {
        const swatchWrapper = document.createElement('div');
        swatchWrapper.className = 'swatch-wrapper';

        const swatchEl = document.createElement('div');
        swatchEl.className = 'palette-swatch';
        if (swatch.isPrimary) swatchEl.classList.add('primary');
        swatchEl.style.backgroundColor = swatch.hex;

        const hexCode = document.createElement('span');
        hexCode.className = 'hex-code';
        hexCode.textContent = swatch.hex.toUpperCase();
        const swatchLightness = swatch.l;
        const textLightness = swatchLightness > 60 ? 0 : 100;
        const textRGB = ModelManager.hslToRGB(0, 0, textLightness);
        hexCode.style.color = ModelManager.rgbToHex(textRGB.r, textRGB.g, textRGB.b);
        swatchEl.appendChild(hexCode);

        const tooltip = document.createElement('div');
        tooltip.className = 'palette-swatch-tooltip';
        tooltip.textContent = `${swatch.relName}\n${swatch.hex.toUpperCase()}\nhsl(${Math.round(swatch.h)}, ${Math.round(swatch.s)}%, ${Math.round(swatch.l)}%)`;
        swatchEl.appendChild(tooltip);

        const lightness = document.createElement('div');
        lightness.className = 'swatch-lightness';
        lightness.textContent = `${Math.round(swatch.l)}%`;
        swatchWrapper.appendChild(lightness);
        swatchWrapper.appendChild(swatchEl);

        swatchContainer.appendChild(swatchWrapper);
      });

      const infoEl = document.createElement('div');
      infoEl.className = 'swatch-info';
      const hueSpan = document.createElement('span');
      hueSpan.textContent = `H: ${Math.round(relHue)}°`;
      const satInputLabel = document.createElement('label');
      satInputLabel.textContent = `S: `;
      const satInput = document.createElement('input');
      satInput.type = 'number';
      satInput.min = '0';
      satInput.max = '100';
      satInput.value = Math.round(saturation);
      satInput.dataset.key = rel.key;
      satInput.addEventListener('input', () => {
        this.modelManager.state.individualSaturationOverrides[rel.key] = ModelManager.parseInput(satInput.value, 100, this.modelManager.state.saturationOverrides[rel.group] || s);
        this.createPalette();
      });
      satInputLabel.appendChild(satInput);
      infoEl.appendChild(hueSpan);
      infoEl.appendChild(satInputLabel);
      swatchContainer.appendChild(infoEl);

      wrapper.appendChild(swatchContainer);

      const saturationDropdown = document.createElement('div');
      saturationDropdown.className = 'saturation-dropdown';

      const saturationLevels = [];
      let currentSatAngle = satStartAngle;
      const satAngles = [];

      while (currentSatAngle <= satEndAngle) {
        satAngles.push(currentSatAngle);
        currentSatAngle += satAngleStep;
      }

      satAngles.forEach(angle => {
        const theta = toRadians(angle);
        const normalizedValue = getValueFromAngle(theta, range);
        const saturation = Math.min(Math.max(normalizedValue * 100, 0), 100);
        saturationLevels.push(Math.round(saturation));
      });

      const uniqueSaturationLevels = [...new Set(saturationLevels)];

      uniqueSaturationLevels.forEach(satLevel => {
        const satRow = document.createElement('div');
        satRow.className = 'saturation-row';
        satRow.dataset.saturation = satLevel;
        satRow.dataset.key = rel.key;

        const satSwatchContainer = document.createElement('div');
        satSwatchContainer.className = isVertical ? 'palette-swatch-column' : 'palette-swatch-line';

        uniqueLightnessSteps.forEach(stepL => {
          const rgb = ModelManager.hslToRGB(relHue, satLevel, stepL);
          const hex = ModelManager.rgbToHex(rgb.r, rgb.g, rgb.b);
          const swatchWrapper = document.createElement('div');
          swatchWrapper.className = 'swatch-wrapper';

          const swatchEl = document.createElement('div');
          swatchEl.className = 'palette-swatch';
          swatchEl.style.backgroundColor = hex;

          const hexCode = document.createElement('span');
          hexCode.className = 'hex-code';
          hexCode.textContent = hex.toUpperCase();
          const textLightness = stepL > 60 ? 0 : 100;
          const textRGB = ModelManager.hslToRGB(0, 0, textLightness);
          hexCode.style.color = ModelManager.rgbToHex(textRGB.r, textRGB.g, textRGB.b);
          swatchEl.appendChild(hexCode);

          const tooltip = document.createElement('div');
          tooltip.className = 'palette-swatch-tooltip';
          tooltip.textContent = `${rel.name}\n${hex.toUpperCase()}\nhsl(${Math.round(relHue)}, ${satLevel}%, ${Math.round(stepL)}%)`;
          swatchEl.appendChild(tooltip);

          swatchWrapper.appendChild(swatchEl);
          satSwatchContainer.appendChild(swatchWrapper);
        });

        const satInfoEl = document.createElement('div');
        satInfoEl.className = 'swatch-saturation-info';
        satInfoEl.textContent = `${satLevel}%`;
        satSwatchContainer.appendChild(satInfoEl);

        satRow.appendChild(satSwatchContainer);
        saturationDropdown.appendChild(satRow);

        satRow.addEventListener('click', () => {
          this.modelManager.state.individualSaturationOverrides[rel.key] = satLevel;
          this.createPalette();
        });
      });

      wrapper.appendChild(saturationDropdown);
      group.appendChild(wrapper);

      paletteButton.addEventListener('click', () => this.toggleDropdown(paletteButton));

      if (rel.key === 'primary') {
        const groupWrapper = document.createElement('div');
        groupWrapper.className = 'primary-container';
        groupWrapper.appendChild(group);
        this.dom.paletteSwatches.appendChild(groupWrapper);
      } else {
        this.dom.paletteSwatches.appendChild(group);
      }
    });
  }

  update() {
    this.updateSaturationInputs();
    this.updateVisibilityDropdown();
    this.createPalette();
  }
}