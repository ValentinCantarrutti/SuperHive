export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  preload() {
    this.load.image('menu-bg', './public/assets/Super Hive.png');
    this.load.image('menu-fondo', './public/assets/menufondo.png');
    this.load.audio('seleccionBotones', './public/assets/Sounds/Seleccionbotones.mp3');
    this.load.audio('clickeoBotones', './public/assets/Sounds/Clickeobotones.mp3');
    this.load.audio('musicaMenu', './public/assets/Soundtrack/Super Hive - Menu abeja.mp3');
  }

  create() {
      const centerX = this.cameras.main.centerX;
  const centerY = this.cameras.main.centerY - 45;

  this.opciones = ['Jugar', 'Puntuaciones', 'Manual', 'Créditos', 'Salir'];
  this.textos = [];
  this.primerInicio = !localStorage.getItem("tutorialVisto");

  const volverDeSubmenu = this.registry.get('volverDesde') === true;
  this.indiceSeleccionado = this.primerInicio ? 2 : volverDeSubmenu ? 0 : 0;

  this.musicaYaIniciada = false;

  // 🎵 Si no es el primer inicio, intentamos reproducir automáticamente
  if (!this.primerInicio) {
    this.sound.once('unlocked', () => {
      this.iniciarMusicaMenu();
    });

    if (!this.sound.locked) {
      this.iniciarMusicaMenu();
    }
  }

  if (volverDeSubmenu) this.registry.set('volverDesde', false);

  this.add.image(0, 0, 'menu-fondo')
    .setOrigin(0)
    .setDepth(-1)
    .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

  this.add.image(centerX, centerY - 325, 'menu-bg')
    .setOrigin(0.5)
    .setScale(1);

  const espaciado = 100;
  this.opciones.forEach((opcion, i) => {
    const textoInicial = this.primerInicio && opcion === 'Manual'
      ? '> Manual <'
      : (i === this.indiceSeleccionado && !this.primerInicio ? `> ${opcion} <` : opcion);

    const colorInicial = this.primerInicio
      ? (opcion === 'Manual' ? '#ffd34a' : '#cc8400')
      : (i === this.indiceSeleccionado ? '#ffd34a' : '#ffa500');

    const texto = this.add.text(centerX, centerY + i * espaciado, textoInicial, {
      fontFamily: 'Public Pixel',
      fontSize: '48px',
      color: colorInicial,
      align: 'center',
    }).setOrigin(0.5);

    this.textos.push(texto);
  });

  this.textos[0].x -= 12;
  this.textos[3].x -= 8;
  this.textos[4].x -= 12;

  if (this.primerInicio) {
    this.tweens.add({
      targets: this.textos[2],
      scale: { from: 1.20, to: 1.10 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  this.input.keyboard.on('keydown-Z', this.seleccionar, this);
  this.input.keyboard.on('keydown-ENTER', this.seleccionar, this);

  this.sonidoSeleccion = this.sound.add('seleccionBotones');
  this.sonidoClickeo = this.sound.add('clickeoBotones');

  this.ultimoMovimientoMenu = 0;
  this.delayMovimientoMenu = 200;

  this.actualizarSeleccion();

  // 🎧 Si aún no sonó, activamos con cualquier tecla útil o click
  const teclasActivadoras = [
    this.input.keyboard.addKey('UP'),
    this.input.keyboard.addKey('DOWN'),
    this.input.keyboard.addKey('LEFT'),
    this.input.keyboard.addKey('RIGHT'),
    this.input.keyboard.addKey('Z'),
    this.input.keyboard.addKey('ENTER')
  ];

  teclasActivadoras.forEach(tecla => {
    tecla.once('down', this.iniciarMusicaMenu, this);
  });

  this.input.once('pointerdown', this.iniciarMusicaMenu, this);
  }

iniciarMusicaMenu() {
  if (this.musicaYaIniciada) return; // Previene múltiples disparos
  this.musicaYaIniciada = true;

  const existente = this.sound.get('musicaMenu');

  if (!existente) {
    this.musicaMenu = this.sound.add('musicaMenu', {
      loop: true,
      volume: 0.5
    });

    const intento = this.musicaMenu.play();

    if (intento && typeof intento.catch === 'function') {
      intento.catch(() => {
        this.musicaYaIniciada = false; // Desbloquea si el navegador lo bloquea
      });
    }
  } else {
    this.musicaMenu = existente;
    if (!this.musicaMenu.isPlaying) this.musicaMenu.play();
  }
}

  moverArriba() {
    this.indiceSeleccionado = (this.indiceSeleccionado - 1 + this.opciones.length) % this.opciones.length;
    this.actualizarSeleccion();
    this.sonidoSeleccion.play();
  }

  moverAbajo() {
    this.indiceSeleccionado = (this.indiceSeleccionado + 1) % this.opciones.length;
    this.actualizarSeleccion();
    this.sonidoSeleccion.play();
  }

  update(time) {
  const arriba = this.input.keyboard.checkDown(this.input.keyboard.addKey('UP'));
  const abajo = this.input.keyboard.checkDown(this.input.keyboard.addKey('DOWN'));

  if (time - this.ultimoMovimientoMenu > this.delayMovimientoMenu) {
    if (arriba) {
      this.moverArriba();
      this.ultimoMovimientoMenu = time;
    } else if (abajo) {
      this.moverAbajo();
      this.ultimoMovimientoMenu = time;
    }
  }
}

  actualizarSeleccion() {
    const bloqueadas = this.primerInicio ? ['Jugar', 'Puntuaciones', 'Créditos', 'Salir'] : [];

    this.textos.forEach((texto, i) => {
      const opcion = this.opciones[i];
      const esSeleccionado = i === this.indiceSeleccionado;
      const estaBloqueado = bloqueadas.includes(opcion);

      let color = '#ffc285';
      if (esSeleccionado) color = '#ffd34a';
      else if (estaBloqueado) color = '#cc8400';

      texto.setStyle({ color });

      if (esSeleccionado) {
        texto.setText(this.primerInicio && opcion === 'Manual'
          ? '> Manual <'
          : `> ${opcion} <`);
      } else {
        texto.setText(opcion);
      }

      texto.setScale(1);
      if (!this.primerInicio || opcion !== 'Manual' || !esSeleccionado) {
        if (esSeleccionado) {
          this.tweens.add({
            targets: texto,
            scale: 1.20,
            duration: 150,
            ease: 'Power1',
          });
        }
      }
    });
  }

  seleccionar() {
    this.sonidoClickeo.play(); // 🔊 reproducir clic al seleccionar
    
    const opcion = this.opciones[this.indiceSeleccionado];

    if (this.primerInicio && opcion !== 'Manual') return;
    if (this.primerInicio && opcion === 'Manual') {
      localStorage.setItem("tutorialVisto", true);
    }

    if (opcion === 'Jugar') {
if (opcion === 'Jugar') {
  this.sound.get('musicaMenu')?.stop();
  this.scene.start('Escenarondas');
}
      this.scene.start('Escenarondas');
    } else if (opcion === 'Puntuaciones') {
      this.registry.set('volverDesde', true);
      this.scene.start('Puntuaciones');
    } else if (opcion === 'Manual') {
      this.registry.set('volverDesde', true);
      this.scene.start('Manual');
    } else if (opcion === 'Créditos') {
      this.registry.set('volverDesde', true);
      this.scene.start('Creditos');
    } else if (opcion === 'Salir') {
      window.close();
    }
  }
}