import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

// Global configuration
const config = {
  CUBE_SIZE: 360,
  CYLINDER_SIZE: 300,
  CAMERA_DISTANCE_RATIO: 1.67,
  AXIS_THICKNESS: 5,
  swatchCtrlLength: 475,
  swatchCtrlStep: 2,
  AXIS_SEGMENTS: 50,
  FONT_SIZE: 96,
  DASH_SIZE: 4,
  LABEL_DISTANCE: 30,
  MARKER_RADIUS: 5,
  MARKER_LINE_DASH_SIZE: 2,
  INNER_WALL_COLOR: '#d3d3d3',
  PLOT_POINT_RADIUS: 3,
  CONE_RADIUS: 10,
  CONE_HEIGHT: 15
};

// Color relationships
const colorRelationships = {
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

export class ColorModel {
  constructor(canvas, width, height) {
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(width || 500, height || 400);
    this.controls = null;
    this.marker = null;
    this.axesGroup = null;
    this.markerLinesGroup = null;
    this.plotGroups = {};
    this.color = null;
    this.modelManager = null;
  }

  static createAxis(start, end, colorFunc, segments = config.AXIS_SEGMENTS) {
    const axisGroup = new THREE.Group();
    for (let i = 0; i < segments; i++) {
      const t = i / (segments - 1);
      const rgb = colorFunc(t);
      const color = (rgb.r << 16) | (rgb.g << 8) | rgb.b;
      const x = start.x + t * (end.x - start.x);
      const y = start.y + t * (end.y - start.y);
      const z = start.z + t * (end.z - start.z);
      const path = new THREE.LineCurve3(
        new THREE.Vector3(x, y, z),
        new THREE.Vector3(x + (end.x - start.x) / segments, y + (end.y - start.y) / segments, z + (end.z - start.z) / segments)
      );
      const tubeGeometry = new THREE.TubeGeometry(path, 1, config.AXIS_THICKNESS, 8, false);
      const tubeMaterial = new THREE.MeshBasicMaterial({ color: color });
      const tubeSegment = new THREE.Mesh(tubeGeometry, tubeMaterial);
      axisGroup.add(tubeSegment);
    }
    return axisGroup;
  }

  static createLabel(text, position, color, fontFamily = 'Helvetica, Arial, sans-serif', fontWeight = 400, fontSize = config.FONT_SIZE) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.textAlign = 'left';
    context.textBaseline = 'middle';
    context.fillText(text, 10, 128);
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.scale.set(40, 40, 1);
    return sprite;
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

  initializeElements() {
    throw new Error('initializeElements must be implemented by subclass');
  }

  updateColor(color) {
    throw new Error('updateColor must be implemented by subclass');
  }

  plot(type, enabled) {
    throw new Error('plot must be implemented by subclass');
  }

  getPlotSettings() {
    throw new Error('getPlotSettings must be implemented by subclass');
  }

  setPlotSetting(type, enabled) {
    throw new Error('setPlotSetting must be implemented by subclass');
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export class Cube extends ColorModel {
  constructor(type, canvas, width, height) {
    super(canvas, width, height);
    this.type = type; // 'rgb' or 'hsl'
    this.plotSettings = {};
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, config.CUBE_SIZE * 5);
    this.camera.position.set(config.CUBE_SIZE, config.CYLINDER_SIZE * 1.5, config.CUBE_SIZE * 3);
    this.camera.lookAt(config.CUBE_SIZE / 2, config.CUBE_SIZE / 2, config.CUBE_SIZE / 2);
    this.camera.updateProjectionMatrix();
    this.renderer.setClearColor(0xffffff, 1);
    this.markerGeometry = new THREE.SphereGeometry(config.MARKER_RADIUS, 32, 32);
    this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.plotPointGeometry = new THREE.SphereGeometry(config.PLOT_POINT_RADIUS, 8, 8);
  }

  initializeElements() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 800;
    this.controls.target.set(config.CUBE_SIZE / 2, config.CUBE_SIZE / 2, config.CUBE_SIZE / 2);

    const cubeGeometry = new THREE.BoxGeometry(config.CUBE_SIZE, config.CUBE_SIZE, config.CUBE_SIZE);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
    const innerWallMaterial = new THREE.MeshBasicMaterial({
      color: config.INNER_WALL_COLOR,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const edgeMaterial = new THREE.LineDashedMaterial({
      color: 0x000000,
      linewidth: 1,
      scale: 1,
      dashSize: config.DASH_SIZE,
      gapSize: config.DASH_SIZE,
      depthWrite: false
    });

    const cubeWalls = new THREE.Mesh(cubeGeometry, innerWallMaterial);
    cubeWalls.position.set(config.CUBE_SIZE / 2, config.CUBE_SIZE / 2, config.CUBE_SIZE / 2);
    this.scene.add(cubeWalls);

    const cubeEdgesLines = new THREE.LineSegments(cubeEdges, edgeMaterial);
    cubeEdgesLines.computeLineDistances();
    cubeEdgesLines.position.set(config.CUBE_SIZE / 2, config.CUBE_SIZE / 2, config.CUBE_SIZE / 2);
    this.scene.add(cubeEdgesLines);

    this.marker = new THREE.Mesh(this.markerGeometry, this.markerMaterial);
    this.scene.add(this.marker);

    this.axesGroup = new THREE.Group();
    this.axesGroup.name = `${this.type}Axes`;
    this.scene.add(this.axesGroup);

    this.markerLinesGroup = new THREE.Group();
    this.markerLinesGroup.name = `${this.type}MarkerLines`;
    this.scene.add(this.markerLinesGroup);
  }

  updateMarkerLines() {
    this.markerLinesGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.markerLinesGroup.clear();

    const axes = this.type === 'rgb' ? ['r', 'g', 'b'] : ['h', 's', 'l'];
    const maxCoord = config.CUBE_SIZE;
    axes.forEach((axis, index) => {
      const coord = this.marker.position.getComponent(index);
      const plane0 = 0;
      const plane1 = maxCoord;
      const dist0 = Math.abs(coord - plane0);
      const dist1 = Math.abs(coord - plane1);
      const isActive = dist0 <= dist1;
      const start = this.marker.position.clone();
      const end = this.marker.position.clone();
      if (index === 0) start.x = isActive ? plane0 : plane1;
      else if (index === 1) start.y = isActive ? plane0 : plane1;
      else start.z = isActive ? plane0 : plane1;
      if (start.distanceTo(end) > 0.001) {
        const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
        const material = new THREE.LineDashedMaterial({
          color: 0x000000,
          linewidth: 1,
          dashSize: config.MARKER_LINE_DASH_SIZE,
          gapSize: config.MARKER_LINE_DASH_SIZE
        });
        const line = new THREE.Line(geometry, material);
        line.computeLineDistances();
        this.markerLinesGroup.add(line);
      }
    });
    this.scene.add(this.markerLinesGroup);
  }
}

export class RGBCube extends Cube {
  constructor(canvas, width, height) {
    super('rgb', canvas, width, height);
    this.color = { r: 255, g: 0, b: 0 };
    this.plotSettings = { h: false, s: false, l: false };
    this.initializeElements();
    this.updateColor(this.color);
    this.render();
  }

  getPlotSettings() {
    return { ...this.plotSettings };
  }

  setPlotSetting(type, enabled) {
    if (['h', 's', 'l'].includes(type)) {
      this.plotSettings[type] = enabled;
      this.plot(type, enabled);
    }
  }

  updateColor(color) {
    this.color = { ...color };
    const hex = ColorModel.rgbToHex(color.r, color.g, color.b);
    this.markerMaterial.color.set(hex);
    this.marker.position.set(
      color.r * config.CUBE_SIZE / 255,
      color.g * config.CUBE_SIZE / 255,
      color.b * config.CUBE_SIZE / 255
    );

    // Update axes
    this.axesGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.axesGroup.clear();

    const axisConfigs = [
      { label: 'R', end: new THREE.Vector3(config.CUBE_SIZE, 0, 0), colorFunc: t => ({ r: Math.round(t * 255), g: color.g, b: color.b }) },
      { label: 'G', end: new THREE.Vector3(0, config.CUBE_SIZE, 0), colorFunc: t => ({ r: color.r, g: Math.round(t * 255), b: color.b }) },
      { label: 'B', end: new THREE.Vector3(0, 0, config.CUBE_SIZE), colorFunc: t => ({ r: color.r, g: color.g, b: Math.round(t * 255) }) }
    ];

    axisConfigs.forEach(({ label, end, colorFunc }, index) => {
      const axis = ColorModel.createAxis(new THREE.Vector3(0, 0, 0), end, colorFunc);
      this.axesGroup.add(axis);
      const labelPos = end.clone().add(
        new THREE.Vector3(
          index === 0 ? config.LABEL_DISTANCE : 0,
          index === 1 ? config.LABEL_DISTANCE : 0,
          index === 2 ? config.LABEL_DISTANCE : 0
        )
      );
      const labelSprite = ColorModel.createLabel(label, labelPos, '#000000');
      this.axesGroup.add(labelSprite);
    });
    this.scene.add(this.axesGroup);

    this.updateMarkerLines();

    // Update plots
    ['h', 's', 'l'].forEach(type => {
      if (this.plotSettings[type]) this.plot(type, true);
    });
  }

  plot(type, enabled) {
    const groupKey = `${type}PlotGroup`;
    if (this.plotGroups[groupKey]) {
      this.plotGroups[groupKey].children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.plotGroups[groupKey]);
      this.plotGroups[groupKey] = null;
    }
    if (!enabled) return;

    this.plotGroups[groupKey] = new THREE.Group();
    this.plotGroups[groupKey].name = `${type}PlotPoints`;
    const numSwatches = (100 / config.swatchCtrlStep) + 1;
    const { h = 0, s = 0, l = 0 } = ColorModel.hexToHSL(ColorModel.rgbToHex(this.color.r, this.color.g, this.color.b));

    if (type === 'h') {
      for (let i = 0; i < numSwatches; i++) {
        const normalizedVal = i * config.swatchCtrlStep;
        const hVal = (359 * normalizedVal) / 100;
        const rgb = ColorModel.hslToRGB(hVal, s, l);
        const material = new THREE.MeshBasicMaterial();
        material.color.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        const point = new THREE.Mesh(this.plotPointGeometry, material);
        point.position.set(
          rgb.r * config.CUBE_SIZE / 255,
          rgb.g * config.CUBE_SIZE / 255,
          rgb.b * config.CUBE_SIZE / 255
        );
        this.plotGroups[groupKey].add(point);
      }
    } else if (type === 's') {
      for (let i = 0; i < numSwatches; i++) {
        const normalizedVal = i * config.swatchCtrlStep;
        const sVal = (100 * normalizedVal) / 100;
        const rgb = ColorModel.hslToRGB(h, sVal, l);
        const material = new THREE.MeshBasicMaterial();
        material.color.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        const point = new THREE.Mesh(this.plotPointGeometry, material);
        point.position.set(
          rgb.r * config.CUBE_SIZE / 255,
          rgb.g * config.CUBE_SIZE / 255,
          rgb.b * config.CUBE_SIZE / 255
        );
        this.plotGroups[groupKey].add(point);
      }
    } else if (type === 'l') {
      for (let i = 0; i < numSwatches; i++) {
        const normalizedVal = i * config.swatchCtrlStep;
        const lVal = (100 * normalizedVal) / 100;
        const rgb = ColorModel.hslToRGB(h, s, lVal);
        const material = new THREE.MeshBasicMaterial();
        material.color.setRGB(rgb.r / 255, rgb.g / 255, rgb.b / 255);
        const point = new THREE.Mesh(this.plotPointGeometry, material);
        point.position.set(
          rgb.r * config.CUBE_SIZE / 255,
          rgb.g * config.CUBE_SIZE / 255,
          rgb.b * config.CUBE_SIZE / 255
        );
        this.plotGroups[groupKey].add(point);
      }
    }
    this.scene.add(this.plotGroups[groupKey]);
  }
}

export class HSLCube extends Cube {
  constructor(canvas, width, height) {
    super('hsl', canvas, width, height);
    this.color = { h: 0, s: 100, l: 50 };
    this.plotSettings = { r: false, g: false, b: false };
    this.initializeElements();
    this.updateColor(this.color);
    this.render();
  }

  getPlotSettings() {
    return { ...this.plotSettings };
  }

  setPlotSetting(type, enabled) {
    if (['r', 'g', 'b'].includes(type)) {
      this.plotSettings[type] = enabled;
      this.plot(type, enabled);
    }
  }

  updateColor(color) {
    this.color = { ...color };
    const hex = ColorModel.rgbToHex(
      ColorModel.hslToRGB(color.h, color.s, color.l).r,
      ColorModel.hslToRGB(color.h, color.s, color.l).g,
      ColorModel.hslToRGB(color.h, color.s, color.l).b
    );
    this.markerMaterial.color.set(hex);
    this.marker.position.set(
      color.h * config.CUBE_SIZE / 359,
      color.s * config.CUBE_SIZE / 100,
      color.l * config.CUBE_SIZE / 100
    );

    // Update axes
    this.axesGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.axesGroup.clear();

    const axisConfigs = [
      { label: 'H', end: new THREE.Vector3(config.CUBE_SIZE, 0, 0), colorFunc: t => ColorModel.hslToRGB(t * 359, color.s, color.l) },
      { label: 'S', end: new THREE.Vector3(0, config.CUBE_SIZE, 0), colorFunc: t => ColorModel.hslToRGB(color.h, t * 100, color.l) },
      { label: 'L', end: new THREE.Vector3(0, 0, config.CUBE_SIZE), colorFunc: t => ColorModel.hslToRGB(color.h, color.s, t * 100) }
    ];

    axisConfigs.forEach(({ label, end, colorFunc }, index) => {
      const axis = ColorModel.createAxis(new THREE.Vector3(0, 0, 0), end, colorFunc);
      this.axesGroup.add(axis);
      const labelPos = end.clone().add(
        new THREE.Vector3(
          index === 0 ? config.LABEL_DISTANCE : 0,
          index === 1 ? config.LABEL_DISTANCE : 0,
          index === 2 ? config.LABEL_DISTANCE : 0
        )
      );
      const labelSprite = ColorModel.createLabel(label, labelPos, '#000000');
      this.axesGroup.add(labelSprite);
    });
    this.scene.add(this.axesGroup);

    this.updateMarkerLines();

    // Update plots
    ['r', 'g', 'b'].forEach(type => {
      if (this.plotSettings[type]) this.plot(type, true);
    });
  }

  plot(type, enabled) {
    const groupKey = `${type}PlotGroup`;
    if (this.plotGroups[groupKey]) {
      this.plotGroups[groupKey].children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.plotGroups[groupKey]);
      this.plotGroups[groupKey] = null;
    }
    if (!enabled) return;

    this.plotGroups[groupKey] = new THREE.Group();
    this.plotGroups[groupKey].name = `${type}PlotPoints`;
    const numSwatches = (100 / config.swatchCtrlStep) + 1;
    const rgb = ColorModel.hslToRGB(this.color.h, this.color.s, this.color.l);
    const { r = 0, g = 0, b = 0 } = rgb;

    if (type === 'r') {
      for (let i = 0; i < numSwatches; i++) {
        const normalizedVal = i * config.swatchCtrlStep;
        const rVal = (255 * normalizedVal) / 100;
        const hex = ColorModel.rgbToHex(Math.round(rVal), Math.round(g), Math.round(b));
        const hsl = ColorModel.hexToHSL(hex);
        const material = new THREE.MeshBasicMaterial();
        material.color.setRGB(rVal / 255, g / 255, b / 255);
        const point = new THREE.Mesh(this.plotPointGeometry, material);
        point.position.set(
          parseFloat(hsl.h) * config.CUBE_SIZE / 359,
          parseFloat(hsl.s) * config.CUBE_SIZE / 100,
          parseFloat(hsl.l) * config.CUBE_SIZE / 100
        );
        this.plotGroups[groupKey].add(point);
      }
    } else if (type === 'g') {
      for (let i = 0; i < numSwatches; i++) {
        const normalizedVal = i * config.swatchCtrlStep;
        const gVal = (255 * normalizedVal) / 100;
        const hex = ColorModel.rgbToHex(Math.round(r), Math.round(gVal), Math.round(b));
        const hsl = ColorModel.hexToHSL(hex);
        const material = new THREE.MeshBasicMaterial();
        material.color.setRGB(r / 255, gVal / 255, b / 255);
        const point = new THREE.Mesh(this.plotPointGeometry, material);
        point.position.set(
          parseFloat(hsl.h) * config.CUBE_SIZE / 359,
          parseFloat(hsl.s) * config.CUBE_SIZE / 100,
          parseFloat(hsl.l) * config.CUBE_SIZE / 100
        );
        this.plotGroups[groupKey].add(point);
      }
    } else if (type === 'b') {
      for (let i = 0; i < numSwatches; i++) {
        const normalizedVal = i * config.swatchCtrlStep;
        const bVal = (255 * normalizedVal) / 100;
        const hex = ColorModel.rgbToHex(Math.round(r), Math.round(g), Math.round(bVal));
        const hsl = ColorModel.hexToHSL(hex);
        const material = new THREE.MeshBasicMaterial();
        material.color.setRGB(r / 255, g / 255, bVal / 255);
        const point = new THREE.Mesh(this.plotPointGeometry, material);
        point.position.set(
          parseFloat(hsl.h) * config.CUBE_SIZE / 359,
          parseFloat(hsl.s) * config.CUBE_SIZE / 100,
          parseFloat(hsl.l) * config.CUBE_SIZE / 100
        );
        this.plotGroups[groupKey].add(point);
      }
    }
    this.scene.add(this.plotGroups[groupKey]);
  }
}

export class Cylinder extends ColorModel {
  constructor(canvas, width, height) {
    super(canvas, width, height);
    this.color = { h: 0, s: 100, l: 50 };
    this.plotSettings = { r: false, g: false, b: false, h: true };
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, config.CYLINDER_SIZE * 5);
    this.camera.position.set(config.CYLINDER_SIZE, config.CYLINDER_SIZE * 2, config.CYLINDER_SIZE * 2.5);
    this.camera.lookAt(0, config.CYLINDER_SIZE / 2, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.setClearColor(0xffffff, 1);
    this.markerGeometry = new THREE.SphereGeometry(config.MARKER_RADIUS, 32, 32);
    this.markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.plotPointGeometry = new THREE.SphereGeometry(config.PLOT_POINT_RADIUS, 8, 8);
    this.coneGeometry = new THREE.ConeGeometry(config.CONE_RADIUS, config.CONE_HEIGHT, 32);
    this.shapeMaterial = new THREE.LineBasicMaterial({ color: 0x999999, linewidth: 1 });
    this.hueLabelsGroup = null;
    this.relationshipGroups = {};
    this.tetradSquare = null;
    this.triadTriangle = null;
    this.raycaster = null;
    this.mouse = null;
    this.importedData = [];
    this.importedMeshes = [];
    this.importedGroup = null;
    this.initializeElements();
    this.initializeMouseEvents();
    this.updateColor(this.color);
    this.render();
  }

  getPlotSettings() {
    return { ...this.plotSettings };
  }

  setPlotSetting(type, enabled) {
    if (['r', 'g', 'b'].includes(type)) {
      this.plotSettings[type] = enabled;
      this.plot(type, enabled);
    }
    // H plot is always on
  }

  plotHSLData(data) {
    this.clearImportedData();
    this.importedData = data;

    this.importedGroup = new THREE.Group();
    this.importedGroup.name = 'importedPoints';
    data.forEach((item, index) => {
      const { hsl: { h, s, l }, hex, code } = item;
      const radius = (s / 100) * config.CYLINDER_SIZE; // Scale saturation to cylinder radius
      const theta = (h * Math.PI) / 180; // Hue in radians
      const x = radius * Math.cos(theta);
      const y = (l / 100) * config.CYLINDER_SIZE; // Lightness as height
      const z = radius * Math.sin(theta);

      const geometry = new THREE.SphereGeometry(config.PLOT_POINT_RADIUS, 8, 8);
      const material = new THREE.MeshBasicMaterial({ color: hex });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.userData = { code, hsl: { h, s, l }, hex };
      this.importedGroup.add(mesh);
      this.importedMeshes.push(mesh);
    });
    this.scene.add(this.importedGroup);
  }

  clearImportedData() {
    if (this.importedGroup) {
      this.importedGroup.children.forEach(child => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scene.remove(this.importedGroup);
      this.importedGroup = null;
    }
    this.importedMeshes = [];
    this.importedData = [];
  }

  initializeElements() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 50;
    this.controls.maxDistance = 1000;
    this.controls.target.set(0, config.CYLINDER_SIZE / 2, 0);

    const innerWallMaterial = new THREE.MeshBasicMaterial({
      color: config.INNER_WALL_COLOR,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide
    });
    const edgeMaterial = new THREE.LineDashedMaterial({
      color: 0x000000,
      linewidth: 1,
      scale: 1,
      dashSize: config.DASH_SIZE,
      gapSize: config.DASH_SIZE,
      depthWrite: false
    });

    const cylinderGeometry = new THREE.CylinderGeometry(config.CYLINDER_SIZE, config.CYLINDER_SIZE, config.CYLINDER_SIZE, 24, 1, true);
    const cylinderEdges = new THREE.EdgesGeometry(cylinderGeometry);
    const cylinderCapsGeometry = new THREE.CylinderGeometry(config.CYLINDER_SIZE, config.CYLINDER_SIZE, 0.1, 24);
    const cylinderCapsWireframe = new THREE.WireframeGeometry(cylinderCapsGeometry);

    const hslCylinderWalls = new THREE.Mesh(cylinderGeometry, innerWallMaterial);
    hslCylinderWalls.position.set(0, config.CYLINDER_SIZE / 2, 0);
    this.scene.add(hslCylinderWalls);

    const hslCylinderWireFrameTop = new THREE.LineSegments(cylinderCapsWireframe, edgeMaterial);
    hslCylinderWireFrameTop.computeLineDistances();
    hslCylinderWireFrameTop.position.set(0, config.CYLINDER_SIZE, 0);
    this.scene.add(hslCylinderWireFrameTop);

    const hslCylinderWireFrameBottom = new THREE.LineSegments(cylinderCapsWireframe, edgeMaterial);
    hslCylinderWireFrameBottom.computeLineDistances();
    hslCylinderWireFrameBottom.position.set(0, 0, 0);
    this.scene.add(hslCylinderWireFrameBottom);

    const hslCylinderWallEdges = new THREE.LineSegments(cylinderEdges, edgeMaterial);
    hslCylinderWallEdges.computeLineDistances();
    hslCylinderWallEdges.position.set(0, config.CYLINDER_SIZE / 2, 0);
    this.scene.add(hslCylinderWallEdges);

    this.hueLabelsGroup = new THREE.Group();
    this.hueLabelsGroup.name = 'hueLabels';
    for (let angle = 15; angle < 360; angle += 15) {
      const theta = (angle * Math.PI) / 180;
      const labelPos = new THREE.Vector3(
        310 * Math.cos(theta),
        0,
        310 * Math.sin(theta)
      );
      const label = ColorModel.createLabel(angle.toString(), labelPos, '#000000');
      this.hueLabelsGroup.add(label);
    }
    this.scene.add(this.hueLabelsGroup);

    Object.keys(colorRelationships).forEach(relKey => {
      this.relationshipGroups[relKey] = new THREE.Group();
      this.relationshipGroups[relKey].name = `${relKey}Markers`;
      this.relationshipGroups[relKey].position.set(0, 0, 0);
      colorRelationships[relKey].forEach((rel, index) => {
        const isPrimary = relKey === 'primary';
        const geometry = isPrimary
          ? new THREE.OctahedronGeometry(config.CONE_RADIUS)
          : this.coneGeometry;
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const marker = new THREE.Mesh(geometry, material);
        if (!isPrimary) marker.rotation.x = Math.PI;
        const theta = (rel.offset * Math.PI) / 180;
        marker.position.set(
          config.CYLINDER_SIZE * Math.cos(theta),
          config.CYLINDER_SIZE + 45,
          config.CYLINDER_SIZE * Math.sin(theta)
        );
        marker.userData = { relationship: rel.name, offset: rel.offset };
        this.relationshipGroups[relKey].add(marker);
      });
      this.scene.add(this.relationshipGroups[relKey]);
    });

    this.tetradSquare = new THREE.Group();
    this.tetradSquare.name = 'tetradSquare';
    this.scene.add(this.tetradSquare);

    this.triadTriangle = new THREE.Group();
    this.triadTriangle.name = 'triadTriangle';
    this.scene.add(this.triadTriangle);

    const originGeometry = new THREE.SphereGeometry(config.MARKER_RADIUS, 8, 8);
    const originMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const originMarker = new THREE.Mesh(originGeometry, originMaterial);
    originMarker.position.set(0, 0, 0);
    this.scene.add(originMarker);

    this.marker = new THREE.Mesh(this.markerGeometry, this.markerMaterial);
    this.scene.add(this.marker);

    this.axesGroup = new THREE.Group();
    this.axesGroup.name = 'hslCylinderAxes';
    this.scene.add(this.axesGroup);

    this.markerLinesGroup = new THREE.Group();
    this.markerLinesGroup.name = 'hslCylinderMarkerLines';
    this.scene.add(this.markerLinesGroup);
  }

  initializeMouseEvents() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.renderer.domElement.addEventListener('mousemove', (event) => {
      event.preventDefault();
      if (!this.tooltip || this.renderer.domElement.style.display === 'none') return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      let intersected = false;

      // Check imported points first
      if (this.importedMeshes.length > 0) {
        const intersects = this.raycaster.intersectObjects(this.importedMeshes);
        if (intersects.length > 0) {
          const mesh = intersects[0].object;
          const { code, hsl, hex } = mesh.userData;
          this.tooltip.textContent = `${code}\nHSL(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)\n${hex.toUpperCase()}`;
          this.tooltip.style.display = 'block';
          this.tooltip.style.left = `${event.clientX + 10}px`;
          this.tooltip.style.top = `${event.clientY + 10}px`;
          intersected = true;
        }
      }

      // Check relationship markers if no imported points intersected
      if (!intersected) {
        for (const relKey in this.relationshipGroups) {
          const intersects = this.raycaster.intersectObject(this.relationshipGroups[relKey], true);
          if (intersects.length > 0) {
            const mesh = intersects[0].object;
            const relHue = (this.color.h + mesh.userData.offset) % 360;
            const relRGB = ColorModel.hslToRGB(relHue, this.color.s, this.color.l);
            const relHex = ColorModel.rgbToHex(relRGB.r, relRGB.g, relRGB.b);
            this.tooltip.textContent = `${mesh.userData.relationship}\n(${relHex.toUpperCase()})`;
            this.tooltip.style.display = 'block';
            this.tooltip.style.left = `${event.clientX + 10}px`;
            this.tooltip.style.top = `${event.clientY + 10}px`;
            intersected = true;
            break;
          }
        }
      }

      if (!intersected) {
        this.tooltip.style.display = 'none';
      }
    });
  }

  updateColor(color) {
    this.color = { ...color };
    const hex = ColorModel.rgbToHex(
      ColorModel.hslToRGB(color.h, color.s, color.l).r,
      ColorModel.hslToRGB(color.h, color.s, color.l).g,
      ColorModel.hslToRGB(color.h, color.s, color.l).b
    );
    this.markerMaterial.color.set(hex);
    const hRad = (color.h * Math.PI * 2) / 360;
    const s = color.s * config.CYLINDER_SIZE / 100;
    this.marker.position.set(
      s * Math.cos(hRad),
      color.l * config.CYLINDER_SIZE / 100,
      s * Math.sin(hRad)
    );

    Object.keys(this.relationshipGroups).forEach(relKey => {
      this.relationshipGroups[relKey].children.forEach((cone, index) => {
        const offset = colorRelationships[relKey][index].offset;
        const relHue = (color.h + offset) % 360;
        const relRGB = ColorModel.hslToRGB(relHue, color.s, color.l);
        const relColor = (relRGB.r << 16) | (relRGB.g << 8) | relRGB.b;
        const theta = (relHue * Math.PI) / 180;
        const relPos = new THREE.Vector3(
          config.CYLINDER_SIZE * Math.cos(theta),
          config.CYLINDER_SIZE + 45,
          config.CYLINDER_SIZE * Math.sin(theta)
        );
        cone.material.color.set(relColor);
        cone.position.copy(relPos);
      });
    });

    this.tetradSquare.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.tetradSquare.clear();
    this.tetradSquare = new THREE.Group();
    this.tetradSquare.name = 'tetradSquare';
    const tetradOffsets = [
      colorRelationships.primary[0].offset,
      colorRelationships.tetrad[0].offset,
      colorRelationships.complementary[0].offset,
      colorRelationships.tetrad[1].offset
    ];
    const tetradPoints = tetradOffsets.map(offset => {
      const relHue = (color.h + offset) % 360;
      const theta = (relHue * Math.PI) / 180;
      return new THREE.Vector3(
        config.CYLINDER_SIZE * Math.cos(theta),
        config.CYLINDER_SIZE + 45,
        config.CYLINDER_SIZE * Math.sin(theta)
      );
    });
    const squareGeometry = new THREE.BufferGeometry().setFromPoints(tetradPoints);
    const square = new THREE.LineLoop(squareGeometry, this.shapeMaterial);
    square.computeLineDistances();
    this.tetradSquare.add(square);
    this.scene.add(this.tetradSquare);

    this.triadTriangle.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.triadTriangle.clear();
    this.triadTriangle = new THREE.Group();
    this.triadTriangle.name = 'triadTriangle';
    const triadOffsets = [
      colorRelationships.primary[0].offset,
      colorRelationships.triad[0].offset,
      colorRelationships.triad[1].offset
    ];
    const triadPoints = triadOffsets.map(offset => {
      const relHue = (color.h + offset) % 360;
      const theta = (relHue * Math.PI) / 180;
      return new THREE.Vector3(
        config.CYLINDER_SIZE * Math.cos(theta),
        config.CYLINDER_SIZE + 45,
        config.CYLINDER_SIZE * Math.sin(theta)
      );
    });
    const triangleGeometry = new THREE.BufferGeometry().setFromPoints(triadPoints);
    const triangle = new THREE.LineLoop(triangleGeometry, this.shapeMaterial);
    triangle.computeLineDistances();
    this.triadTriangle.add(triangle);
    this.scene.add(this.triadTriangle);

    this.axesGroup.children.forEach(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
    this.axesGroup.clear();
    this.axesGroup = new THREE.Group();
    this.axesGroup.name = 'hslCylinderAxes';
    const axisConfigs = [
      { label: 'S', end: new THREE.Vector3(config.CYLINDER_SIZE, 0, 0), colorFunc: t => ColorModel.hslToRGB(color.h, t * 100, color.l) },
      { label: 'L', end: new THREE.Vector3(0, config