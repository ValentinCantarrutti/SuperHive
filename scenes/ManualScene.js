export default class ManualScene extends Phaser.Scene {
  constructor() {
    super('Manual');
  }

  preload() {
    this.load.audio('clickeoBotones', './public/assets/Sounds/Clickeobotones.mp3');
    this.load.image('menu-fondo', './public/assets/menufondo.png');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const alto = this.cameras.main.height;

    this.add.image(0, 0, 'menu-fondo')
      .setOrigin(0)
      .setDepth(-1)
      .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

    // 🎨 Paleta de colores
    const COLOR_AMARILLO = '#ffd34a';
    const COLOR_DURAZNO = '#ffc285';
    const COLOR_TEXTO = '#fff4e2';
    const COLOR_TECLA = '#b0e3ff';

    let y = 60;

    // 🟨 Título principal
    this.add.text(centerX, y, 'Manual', {
      fontFamily: 'Public Pixel',
      fontSize: '56px',
      color: COLOR_AMARILLO
    }).setOrigin(0.5);

    y += 80;

    // 🟨 HISTORIA
    this.add.text(60, y, 'HISTORIA:', {
      fontFamily: 'Public Pixel',
      fontSize: '26px',
      color: COLOR_AMARILLO
    });

    y += 40;

    this.add.text(60, y,
      '¡Las moscas están atacando el panal, quieren llevarse la miel!\n\n'
    + 'Tu misión será sobrevivir a los asaltos de las moscas,\n'
    + 'proteger la miel y recuperar un poco del polen robado.',
      {
        fontFamily: 'Public Pixel',
        fontSize: '18px',
        color: COLOR_TEXTO,
        lineSpacing: 8
      }
    );

    y += 130;

    // 🟨 CONTROLES
    this.add.text(60, y, 'CONTROLES:', {
      fontFamily: 'Public Pixel',
      fontSize: '26px',
      color: COLOR_AMARILLO
    });

    y += 40;

    this.add.text(60, y, 'MOVIMIENTO:', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: COLOR_DURAZNO
    });

    y += 40;
    this.renderInput('Moverse', ['↑ ↓'], y, COLOR_TECLA);
    y += 32;
    this.renderInput('Rotar', ['← →'], y, COLOR_TECLA);

    y += 50;
    this.add.text(60, y, 'DISPARO:', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: COLOR_DURAZNO
    });

    y += 40;
    this.renderInput('Disparar', ['Z'], y, COLOR_TECLA);
    y += 32;
    this.renderInput('Confirmar', ['Enter / Z'], y, COLOR_TECLA);

    y += 50;
    this.add.text(60, y, 'MENÚS Y NOMBRE:', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: COLOR_DURAZNO
    });

    y += 40;
    this.renderInput('Mover menú', ['↑ ↓'], y, COLOR_TECLA);
    y += 32;
    this.renderInput('Aceptar', ['Z / Enter'], y, COLOR_TECLA);
    y += 32;
    this.renderInput('Volver', ['X'], y, COLOR_TECLA);
    y += 32;
    this.renderInput('Ingresar nombre', ['↑ ↓ ← →', ' y ', 'Z'], y, COLOR_TECLA, COLOR_TEXTO);

    y += 60;

    // 🟨 MECÁNICAS DEL JUEGO
    this.add.text(60, y, 'MECÁNICAS DEL JUEGO:', {
      fontFamily: 'Public Pixel',
      fontSize: '26px',
      color: COLOR_AMARILLO
    });

    y += 40;
    this.add.text(80, y,
      '• Dispará a las moscas para ganar puntos y polen.\n'
    + '• Por cada 2.000 de polen obtenés 1 vida extra.\n'
    + '• Avanzá por etapas y sobreviví lo máximo posible.',
      {
        fontFamily: 'Public Pixel',
        fontSize: '18px',
        color: COLOR_TEXTO,
        lineSpacing: 10
      }
    );

    // 🔙 Presiona X
    this.add.text(centerX, alto - 40, 'Presiona X para volver', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: '#fff4e2'
    }).setOrigin(0.5);

    this.sonidoClickeo = this.sound.add('clickeoBotones');
    this.input.keyboard.on('keydown-X', () => {
      this.sonidoClickeo.play();
      this.scene.start('Menu');
    });
  }

  renderInput(label, teclas, yOffset, colorTecla, labelColor = '#fff4e2') {
    const xLabel = 60;
    const xTecla = 420;

    this.add.text(xLabel, yOffset, label, {
      fontFamily: 'Public Pixel',
      fontSize: '18px',
      color: labelColor
    });

    let x = xTecla;
    teclas.forEach(part => {
      this.add.text(x, yOffset, part, {
        fontFamily: 'Public Pixel',
        fontSize: '18px',
        color: part === ' y ' ? labelColor : colorTecla
      });
      x += part.length * 16 + 6;
    });
  }
}