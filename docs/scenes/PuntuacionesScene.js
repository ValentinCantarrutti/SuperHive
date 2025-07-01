export default class PuntuacionesScene extends Phaser.Scene {
  constructor() {
    super('Puntuaciones');
  }

  preload() {
  this.load.image('menu-fondo', './public/assets/menufondo.png');
  this.load.audio('clickeoBotones', './public/assets/Sounds/Clickeobotones.mp3');
  }

  create() {
  const centerX = this.cameras.main.centerX;
  const startY = 204; // antes 150
  const lineHeight = 52; // antes 40

  this.add.image(0, 0, 'menu-fondo')
      .setOrigin(0)
      .setDepth(-1)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  // Título
    this.add.text(centerX, 100, 'Puntuaciones', {
      fontFamily: 'Public Pixel',
      fontSize: '56px',
      color: '#ffd34a', // amarillo de selección
      align: 'center',
    }).setOrigin(0.5);

    const ranking = JSON.parse(localStorage.getItem("ranking")) || [];
    ranking.sort((a, b) => b.puntuacionMax - a.puntuacionMax);
    const top10 = ranking.slice(0, 10);

    const colNombreX = centerX - 300;
    const colEtapaX = centerX - 50;
    const colPuntX = centerX + 150;
    const colPosX = centerX + 350;

    // Estilos
    const cabeceraStyle = {
      fontFamily: 'Public Pixel',
      fontSize: '32px',
      color: '#fff4e2', // beige claro
    };

    const filaStyle = {
      fontFamily: 'Public Pixel',
      fontSize: '28px',
      color: '#ffc285', // naranja durazno claro
    };

    // Cabeceras
    this.add.text(colNombreX, startY, 'NOMBRE', cabeceraStyle).setOrigin(0.5);
    this.add.text(colEtapaX, startY, 'ETAPA', cabeceraStyle).setOrigin(0.5);
    this.add.text(colPuntX, startY, 'PUNTOS', cabeceraStyle).setOrigin(0.5);
    this.add.text(colPosX, startY, 'POS.', cabeceraStyle).setOrigin(0.5);

    // Filas de puntuación
    top10.forEach((entry, i) => {
      const y = startY + lineHeight * (i + 1);

      this.add.text(colNombreX, y, entry.nombre || "DSTC", filaStyle).setOrigin(0.5);
      this.add.text(colEtapaX, y, entry.etapaMax.toString(), filaStyle).setOrigin(0.5);
      this.add.text(colPuntX, y, entry.puntuacionMax.toString(), filaStyle).setOrigin(0.5);
      this.add.text(colPosX, y, (i + 1).toString(), filaStyle).setOrigin(0.5);
    });

    this.sonidoClickeo = this.sound.add('clickeoBotones');

    this.input.keyboard.on('keydown-X', () => {
      this.sonidoClickeo.play();
      this.scene.start('Menu');
    });

    // Texto "Presiona X"
    this.add.text(centerX, this.cameras.main.height - 50, 'Presiona X para volver', {
      fontFamily: 'Public Pixel',
      fontSize: '24px',
      color: '#fff4e2', // beige claro que resalta sobre gris
    }).setOrigin(0.5);
  }
}