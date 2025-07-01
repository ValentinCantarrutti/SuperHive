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
    const COLOR_A = '#94db92';
    const COLOR_X = '#849aff';
    const COLOR_JOYSTICK = '#dab9ff';

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

    // 🍑 Subtítulo movimiento
    this.add.text(60, y, 'CONTROLES DE ABEJA - MOVIMIENTO:', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: COLOR_DURAZNO
    });

    y += 40;
    this.renderInput('Moverse', ['↑ ↓'], ['↑ ↓'], y, COLOR_TECLA, COLOR_JOYSTICK);

    y += 32;
    this.renderInput('Rotar', ['← →'], ['← →'], y, COLOR_TECLA, COLOR_JOYSTICK);

    y += 50;

    // 🍑 Subtítulo disparo
    this.add.text(60, y, 'CONTROLES DE ABEJA - DISPARO:', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: COLOR_DURAZNO
    });

    y += 40;
    this.renderInput('Disparar', ['Z'], ['🅐 Botón A'], y, COLOR_TECLA, COLOR_A);

    y += 32;
    this.renderInput('Confirmar', ['Enter / Z'], ['🅐 Botón A'], y, COLOR_TECLA, COLOR_A);

    y += 50;

    // 🍑 Subtítulo selecciones
    this.add.text(60, y, 'SELECCIONES:', {
      fontFamily: 'Public Pixel',
      fontSize: '22px',
      color: COLOR_DURAZNO
    });

    y += 40;
    this.renderInput('Mover menú', ['↑ ↓'], ['↑ ↓'], y, COLOR_TECLA, COLOR_JOYSTICK);

    y += 32;
    this.renderInput('Aceptar', ['Z / Enter'], ['🅐 Botón A'], y, COLOR_TECLA, COLOR_A);

    y += 32;
    this.renderInput('Volver', ['X'], ['🅧 Botón X'], y, COLOR_TECLA, COLOR_X);

    y += 32;
    this.renderInput('Ingresar nombre',
      ['↑ ↓ ← →', ' y ', 'Z'],
      ['↑ ↓', ' y ', '🅐'],
      y,
      COLOR_TECLA,
      COLOR_JOYSTICK,
      COLOR_TEXTO
    );

    y += 60; // más controlado

    // 🟨 MECÁNICAS DEL JUEGO
    this.add.text(60, y, 'MECÁNICAS DEL JUEGO:', {
      fontFamily: 'Public Pixel',
      fontSize: '26px',
      color: COLOR_AMARILLO
    });

    y += 40;
    this.add.text(80, y,
      '• Dispará a las moscas para ganar puntos y polen.\n'
    + '• Por cada 20.000 de polen obtenés 1 vida extra.\n'
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

  renderInput(label, teclado, joystick, yOffset, colorTeclado, colorJoystick, labelColor = '#fff4e2') {
    const xLabel = 60;
    const xTeclado = 420;
    const xJoystick = 800;

    this.add.text(xLabel, yOffset, label, {
      fontFamily: 'Public Pixel',
      fontSize: '18px',
      color: '#fff4e2'
    });

    let x = xTeclado;
    teclado.forEach(part => {
      this.add.text(x, yOffset, part, {
        fontFamily: 'Public Pixel',
        fontSize: '18px',
        color: part === ' y ' ? labelColor : colorTeclado
      });
      x += part.length * 16 + 6;
    });

    x = xJoystick;
    joystick.forEach(part => {
      this.add.text(x, yOffset, part, {
        fontFamily: 'Public Pixel',
        fontSize: '18px',
        color: part === ' y ' ? labelColor : colorJoystick
      });
      x += part.length * 16 + 6;
    });
  }
}