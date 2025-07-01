import HelloWorldScene from "./scenes/HelloWorldScene.js";
import PuntuacionesScene from './scenes/PuntuacionesScene.js';
import ManualScene from './scenes/ManualScene.js';
import CreditosScene from './scenes/CreditosScene.js';
import MenuScene from "./scenes/MenuScene.js"; 

// Configuración del juego Phaser
const config = {
  type: Phaser.AUTO,
  width: 1440,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 800, height: 600 },
    max: { width: 1440, height: 1080 },
  },

  input: {
    gamepad: true
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  scene: [MenuScene, HelloWorldScene, PuntuacionesScene, ManualScene, CreditosScene], 
};

// Cargar fuente Joystix Monospace
const fontJoystix = new FontFace('Joystix Monospace', 'url(./public/assets/fonts/joystix-monospace.otf)');
fontJoystix.load().then(() => {
  document.fonts.add(fontJoystix);
  console.log('Fuente Joystix Monospace cargada correctamente.');
}).catch((error) => {
  console.error('Error cargando la fuente Joystix Monospace:', error);
});

// Cargar fuente Public Pixel
const fontPublicPixel = new FontFace('Public Pixel', 'url(./public/assets/fonts/PublicPixel.otf)');
fontPublicPixel.load().then(() => {
  document.fonts.add(fontPublicPixel);
  console.log('Fuente Public Pixel cargada correctamente.');
}).catch((error) => {
  console.error('Error cargando la fuente Public Pixel:', error);
});

// Crear juego una vez cargadas las fuentes
Promise.all([fontJoystix.load(), fontPublicPixel.load()]).then(() => {
  window.game = new Phaser.Game(config);

  const gameCanvas = document.querySelector('canvas');
  window.addEventListener("keydown", (e) => {
    const teclasQueMolestan = ['ArrowUp', 'ArrowDown', ' '];
    if (teclasQueMolestan.includes(e.key) && document.activeElement === gameCanvas) {
      e.preventDefault();
    }
  }, false);
});