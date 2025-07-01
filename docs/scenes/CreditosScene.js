export default class CreditosScene extends Phaser.Scene {
  constructor() {
    super('Creditos');
  }

  preload() {
    this.load.image('menu-fondo', './public/assets/menufondo.png');
    this.load.audio('clickeoBotones', './public/assets/Sounds/Clickeobotones.mp3');
  }

  create() {
    const centerX = this.cameras.main.centerX;

    this.add.image(0, 0, 'menu-fondo')
      .setOrigin(0)
      .setDepth(-1)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // Título
    this.add.text(centerX, 100, 'Créditos', {
      fontFamily: 'Public Pixel',
      fontSize: '56px',
      color: '#ffd34a',
    }).setOrigin(0.5);

    // Créditos agrupados
    const secciones = [
      // Bloque 1: Desarrollador principal
      { texto: 'Programación, Arte, Música y FX', y: 230, color: '#fff4e2', size: 32 },
      { texto: 'Valentín Cantarrutti', y: 280, color: '#ffc285', size: 32 },

      // Bloque 2: Tester
      { texto: 'Tester', y: 370, color: '#fff4e2', size: 32 },
      { texto: 'Nahuel Cantarrutti', y: 420, color: '#ffc285', size: 32 },

      // Bloque 3: Institución
      { texto: 'Desarrollado en UNRAF', y: 520, color: '#fff4e2', size: 28 }
    ];

    secciones.forEach(({ texto, y, color, size }) => {
      this.add.text(centerX, y, texto, {
        fontFamily: 'Public Pixel',
        fontSize: `${size}px`,
        color,
        align: 'center',
      }).setOrigin(0.5);
    });

    // Texto de volver
    this.add.text(centerX, this.cameras.main.height - 50, 'Presiona X para volver', {
      fontFamily: 'Public Pixel',
      fontSize: '24px',
      color: '#fff4e2',
    }).setOrigin(0.5);

    this.sonidoClickeo = this.sound.add('clickeoBotones');

    this.input.keyboard.on('keydown-X', () => {
      this.scene.start('Menu');
      this.sonidoClickeo.play();
    });
  }
}