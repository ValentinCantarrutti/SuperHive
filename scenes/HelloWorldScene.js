export default class HelloWorldScene extends Phaser.Scene {
  constructor() {
    // key of the scene
    // the key will be used to start the scene by other scenes
    super("Escenarondas");
  }

  preload() {
    // Imagenes estaticas y tilemap
  this.load.tilemapTiledJSON("hud", "./public/assets/tilemap/hud.json");
  this.load.image("hud", "./public/assets/New Piskel.png");
  this.load.image("Abejas", "./public/assets/Ninja.png");
  this.load.image("bala", "./public/assets/abejasbala.png");
  this.load.image("moscaBala", "./public/assets/moscasbala.png");
  this.load.image("finjuego", "./public/assets/1.png");
  this.load.image("marcoHUD", "./public/assets/2.png");
  this.load.image("marcoHUD2", "./public/assets/3.png");
  this.load.image('iconoPolen', './public/assets/polen.png');
  this.load.image('iconoPuntos', './public/assets/puntos.png');
  this.load.image("salirboton", "./public/assets/salirboton.png");
  this.load.image("fondoJuego", "./public/assets/fondojuego.png");
  this.load.audio('disparoAbeja', './public/assets/Sounds/Disparoabeja.mp3');
  this.load.audio('moscaImpacto', './public/assets/Sounds/Moscadañada.mp3');
  this.load.audio('abejaDañada', './public/assets/Sounds/Abejadañada.mp3');
  this.load.audio('vidaGanada', './public/assets/Sounds/Vidaganada.mp3');
  this.load.audio('disparoMosca', './public/assets/Sounds/Disparomosca.mp3');
  this.load.audio('clickeoBotones', './public/assets/Sounds/Clickeobotones.mp3');
  this.load.audio('musicaInicio', './public/assets/Soundtrack/Super Hive - Juego inicia.mp3');
  //

  // Imagenes con frames
  this.load.spritesheet("abeja", "./public/assets/abeja1.png", {
    frameWidth: 9,
    frameHeight: 8
  });

  this.load.spritesheet("mosca", "./public/assets/mosca1.png", {
    frameWidth: 9,
    frameHeight: 8
  });
  //
  }

  create() {
  this.sys.game.canvas.style.imageRendering = 'pixelated'; // Modifica el estilo de escalado de imagenes a pixel.
  this.sys.game.canvas.style['-webkit-font-smoothing'] = 'none'; // Modifica el estilo de fuentes a nítido y no borroso

  //Añadido fondo del juego
  const fondo = this.add.image(720, 540, "fondoJuego");
  fondo.setOrigin(0.5);
  fondo.setDepth(0); // Lo pone en lo más al fondo
  fondo.setScrollFactor(0); // Evita que la camara se mueva 
  //

  const map = this.make.tilemap({ key: "hud" }); //Creado tilemap y implementado en el juego
  const tileset = map.addTilesetImage("paredes", "hud"); //Se vincula el tileset
  const belowLayer = map.createLayer("Capa de patrones 1", tileset, 0, 0); //Se crea una capa usando el tileset
  belowLayer.setDepth(2); //Se da profundidad de 2

  //Se definen variables offsetX y offsetY
  const offsetX = 80;
  const offsetY = 80;
  //
  //Se definen los limites fisicos del mundo
  this.physics.world.setBounds(offsetX, offsetY, 920, 920);
  //

  //Se definen variables
  this.rondaActual = 1;
  this.moscasPorRonda = 20;
  this.moscasDestruidas = 0;
  this.polen = 0;
  this.puntos = 0;
  this.totalMoscasGeneradas = 0;
  this.vidasExtra = 0;
  this.vidasMaximas = 4;
  this.umbralVidaExtra = 2000;
  this.polenAnterior = 0; // para llevar control del incremento
  this.iconosVidas = [];
  this.juegoTerminado = false;
  this.abejaInmune = false;
  //

  this.puntuaciones = []; // Array vacío para guardar puntuaciones (ej. {puntos: 500, ronda: 3})
  this.maxPuntuaciones = 10; // máximo número de puntuaciones guardadas

  //Jugador
  //Se implementa el sprite y animacion de la abeja junto a sus fisicas
  this.player = this.physics.add.sprite(540, 540, "Abejas");
  this.player.setScale(0.120);
  this.player.setCollideWorldBounds(true);
  this.player.setDamping(false);
  this.player.setDrag(0);
  this.player.setMaxVelocity(200);

  this.anims.create({
    key: "abeja-vuela",
    frames: this.anims.generateFrameNumbers("abeja", { start: 0, end: 3 }),
    frameRate: 24,
    repeat: -1
  });
  //
  //Se implementa el sprite de la abeja sobre el jugador y se inicia la animación

  this.abeja = this.physics.add.sprite(this.player.x, this.player.y - 30, "abeja");
  this.abeja.play("abeja-vuela");
  this.abeja.setScale(6.4);
  this.abeja.body.setCircle(2.5, 2.5, 1); // hitbox circular
  //
  //

  //Moscas
  //Se implementa el sprite de la mosca y se inicia la animación
  this.anims.create({
    key: "mosca-vuela",
    frames: this.anims.generateFrameNumbers("mosca", { start: 0, end: 3 }),
    frameRate: 24,
    repeat: -1
  });
  //

  //Se da maximo a las moscas por etapa y se asigna un tiempo para que aparezcan
  this.moscas = this.physics.add.group({
    maxSize: 20
  });

  this.temporizadorMoscas = this.time.addEvent({
    delay: Phaser.Math.Between(1000, 3000), // entre 1 y 3 segundos
    callback: () => this.generarMoscaAleatoria(),
    loop: true
  });
  //

  //Si moscas tocan abeja esta se destruye y se activa la derrota
  this.physics.add.overlap(this.moscas, this.abeja, () => {
  if (this.abejaInmune || this.juegoTerminado) return;

  if (this.vidasExtra > 0) {
    this.vidasExtra--;
    this.actualizarIconosVidas();
    this.sonidoAbejaDañada.play();
    this.activarInmunidad();
  } else {
    this.sonidoAbejaDañada.play();
    this.derrota();
  }
  }, null, this);  //
  //

  //Balas de abejas
  //Creado grupo de balas de abejas
  this.proyectiles = this.physics.add.group({
    defaultKey: "bala"
  });
  //

  //Se asigna que si la bala toca la mosca ambas son eliminadas, se suman los puntos y polen.
  this.physics.add.overlap(this.proyectiles, this.moscas, (bala, mosca) => {
  bala.destroy();
  mosca.destroy();
  this.sonidoMoscaImpacto.play();

  this.puntos += 250;

  if (this.vidasExtra < this.vidasMaximas) {
  this.polen += 200;

  const umbralesActuales = Math.floor(this.polen / this.umbralVidaExtra);
  const umbralesPrevios = Math.floor(this.polenAnterior / this.umbralVidaExtra);

  if (umbralesActuales > umbralesPrevios) {
    this.vidasExtra++;
    this.actualizarIconosVidas();
    this.sonidoVidaGanada.play();
    this.polen = 0;
  }

  this.polenAnterior = this.polen;
  } else {
  this.polen = 0;
  this.polenAnterior = 0;
  }

  if (this.polen >= this.umbralVidaExtra && this.vidasExtra < this.vidasMaximas) {
  this.vidasExtra++;
  this.polen = 0;
  this.actualizarIconosVidas();
  this.sonidoVidaGanada.play();
  }

  const umbralesActuales = Math.floor(this.polen / this.umbralVidaExtra);
  const umbralesPrevios = Math.floor(this.polenAnterior / this.umbralVidaExtra);

  if (umbralesActuales > umbralesPrevios && this.vidasExtra < this.vidasMaximas) {
    this.vidasExtra++;
    this.actualizarIconosVidas();
    this.sonidoVidaGanada.play(); 
  }

  this.polenAnterior = this.polen;

  this.moscasDestruidas++;

  if (this.moscasDestruidas >= this.moscasPorRonda && !this.juegoTerminado) {
    this.rondaActual++;
    this.moscasPorRonda += 2;
    this.moscasDestruidas = 0;
    this.totalMoscasGeneradas = 0;
    this.mostrarTextoRonda(this.rondaActual);
  }
  }, null, this);

  //Si la bala de abejas y moscas toca el borde se destruye
 this.physics.world.on("worldbounds", (body) => {
  const bala = body.gameObject;

  // Bala del jugador
  if (this.proyectiles.contains(bala)) {
    bala.destroy();
  }
 //
  // Bala de mosca
  if (this.proyectilesEnemigos.contains(bala)) {
    bala.destroy();
  }
  });
  //

  //Implementado fondo para textos de puntos y polen.
  const fondoHUD = this.add.image(1198, 224, 'marcoHUD');
  fondoHUD.setOrigin(0.5);
  fondoHUD.setScale(7.2); // Ajustá según el tamaño de tu imagen
  fondoHUD.setDepth(50); // Por debajo de los textos, que están en 100
  //

  //Se implementa textos en la esquina
  const baseX = 1068;
  let baseY = 105;

  this.textoEtapa = this.add.text(baseX, baseY, `ETAPA ${this.rondaActual}`, {
  fontFamily: 'Joystix Monospace',
  fontSize: '30px',
  color: '#ffffff',
  stroke: '#000',
  strokeThickness: 2
  }).setScrollFactor(0).setDepth(100);

  baseY += 52;

  this.add.text(baseX, baseY, 'PUNTUACIÓN:', {
  fontFamily: 'Joystix Monospace',
  fontSize: '26px',
  color: '#ffff00',
  stroke: '#000',
  strokeThickness: 2
  }).setOrigin(0, 0.5).setDepth(100);

  baseY += 32;

  this.textoPuntos = this.add.text(baseX, baseY, '', {
  fontFamily: 'Joystix Monospace',
  fontSize: '32px',
  color: '#ffff00',
  stroke: '#000',
  strokeThickness: 2
  }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

  baseY += 38;

  this.add.text(baseX, baseY, 'POLEN:', {
  fontFamily: 'Joystix Monospace',
  fontSize: '26px',
  color: '#ffb6ff',
  stroke: '#000',
  strokeThickness: 2
  }).setOrigin(0, 0.5).setDepth(100);

  baseY += 32;

  this.textoPolen = this.add.text(baseX, baseY, '', {
  fontFamily: 'Joystix Monospace',
  fontSize: '32px',
  color: '#ffb6ff',
  stroke: '#000000',
  strokeThickness: 2
  }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

  baseY += 38;

this.add.text(baseX, baseY, 'VIDAS:', {
  fontFamily: 'Joystix Monospace',
  fontSize: '26px',
  color: '#66ccff',
  stroke: '#000',
  strokeThickness: 2
  }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);

baseY += 32;

this.slotVidasTexto = [];
this.iconosVidas = [];
//
for (let i = 0; i < this.vidasMaximas; i++) {
  const x = baseX + i * 34; // alineados al inicio
  const slot = this.add.text(x, baseY, '-', {
    fontFamily: 'Joystix Monospace',
    fontSize: '32px',
    color: '#66ccff',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(100);
  this.slotVidasTexto.push(slot);
  }
  //
  this.mostrarTextoRonda(this.rondaActual);

  this.cursors = this.input.keyboard.createCursorKeys(); //Creada teclas de flechas
  this.teclaZ = this.input.keyboard.addKey("Z"); //Añadida la tecla Z

  this.sonidoDisparo = this.sound.add('disparoAbeja');
  this.sonidoMoscaImpacto = this.sound.add('moscaImpacto');
  this.sonidoAbejaDañada = this.sound.add('abejaDañada');
  this.sonidoVidaGanada = this.sound.add('vidaGanada');
  this.sonidoDisparoMosca = this.sound.add('disparoMosca');
  this.sonidoClickeo = this.sound.add('clickeoBotones');

  //Balas de moscas
  this.proyectilesEnemigos = this.physics.add.group(); //Creado grupo de balas de moscas

  //Añadido que se puedan interceptar las balas de moscas con balas de abejas y sumen puntos
  this.physics.add.overlap(this.proyectiles, this.proyectilesEnemigos, (balaAbeja, balaMosca) => {
  this.sonidoMoscaImpacto.play();
  balaAbeja.destroy();
  balaMosca.destroy();

  this.puntos += 20;
  if (this.vidasExtra < this.vidasMaximas) {
  this.polen += 50;

  const umbralesActuales = Math.floor(this.polen / this.umbralVidaExtra);
  const umbralesPrevios = Math.floor(this.polenAnterior / this.umbralVidaExtra);

  if (umbralesActuales > umbralesPrevios) {
    this.vidasExtra++;
    this.actualizarIconosVidas();
    this.sonidoVidaGanada.play();
    this.polen = 0;
  }

  this.polenAnterior = this.polen;
  } else {
  this.polen = 0;
  this.polenAnterior = 0;
  }

  if (this.polen >= this.umbralVidaExtra && this.vidasExtra < this.vidasMaximas) {
  this.vidasExtra++;
  this.polen = 0;
  this.actualizarIconosVidas();
  this.sonidoVidaGanada.play();
  }

  const umbralesActuales = Math.floor(this.polen / this.umbralVidaExtra);
  const umbralesPrevios = Math.floor(this.polenAnterior / this.umbralVidaExtra);

  if (umbralesActuales > umbralesPrevios && this.vidasExtra < this.vidasMaximas) {
    this.vidasExtra++;
  }

  this.polenAnterior = this.polen;
  }, null, this);
  //

  //Añadido que las balas de moscas puedan destruir las abejas
  this.physics.add.overlap(this.proyectilesEnemigos, this.abeja, () => {
  if (this.abejaInmune || this.juegoTerminado) return;

  if (this.vidasExtra > 0) {
    this.vidasExtra--;
    this.actualizarIconosVidas();
    this.sonidoAbejaDañada.play();
    this.activarInmunidad();
  } else {
    this.sonidoAbejaDañada.play();
    this.derrota();
  }
}, null, this);
this.actualizarIconosVidas();
//
//Mostrar texto "ETAPA X" y reproducir música de inicio una sola vez
this.textoEtapaInicial = this.add.text(564, 505, `ETAPA ${this.rondaActual}`, {
  fontFamily: 'Joystix Monospace',
  fontSize: '56px',
  color: '#fff',
  stroke: '#000',
  strokeThickness: 2
}).setOrigin(0.5).setDepth(300);

//Evitá superposiciones: detiene y eliminá si ya existe
const existente = this.sound.get('musicaInicio');
if (existente) {
  existente.stop();
  this.sound.remove(existente);
}

//Reproduce música de inicio y eliminá al terminar
this.musicaInicio = this.sound.add('musicaInicio');
this.musicaInicio.play({
  volume: 0.6,
  onComplete: () => {
    this.sound.remove(this.musicaInicio);
  }
});

//Delay antes de arrancar físicas
this.physics.world.pause();

this.time.delayedCall(2000, () => {
  this.physics.world.resume();
  this.textoEtapaInicial.destroy(); // Oculta texto
}, [], this);
//
  }


update() {
if (this.physics.world.isPaused && !this.juegoTerminado) return;

  if (this.juegoTerminado && this.ingresandoNombre) {
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.posicionLetra = Phaser.Math.Clamp(this.posicionLetra - 1, 0, 3);
      this.actualizarColoresLetras();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.posicionLetra = Phaser.Math.Clamp(this.posicionLetra + 1, 0, 3);
      this.actualizarColoresLetras();
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.cambiarLetra(1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.cambiarLetra(-1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.teclaZ) && this.zDisponible) {
      this.sonidoClickeo.play(); //Sonido al confirmar nombre
      const nombreFinal = this.nombreActual.join("");
      this.agregarPuntuacion({
     nombre: nombreFinal,
      puntuacionMax: this.puntos,
      etapaMax: this.rondaActual
    });
      this.ingresandoNombre = false;
      this.scene.start('Menu');
    }

    return;
  }

  if (this.juegoTerminado && !this.ingresandoNombre) {
    if (Phaser.Input.Keyboard.JustDown(this.teclaZ)) {
      this.scene.start('Menu');
    }
    return;
  }

  if (this.textoPuntos) {
  const puntosFormateados = this.puntos.toString().padStart(7, '0');
  this.textoPuntos.setText(puntosFormateados);
}

  if (this.textoPolen) {
  const polenFormateado = this.polen.toString().padStart(4, '0');
  this.textoPolen.setText(`${polenFormateado}/${this.umbralVidaExtra}`);
  }


  // Movimientos de la abeja
  // Rotación con izquierda y derecha
  if (this.cursors.left.isDown) {
  this.player.setAngularVelocity(-300);
  } else if (this.cursors.right.isDown) {
  this.player.setAngularVelocity(300);
  } else {
  this.player.setAngularVelocity(0);
  }

  // Movimiento hacia adelante y atrás
  if (this.cursors.up.isDown) {
  this.physics.velocityFromRotation(this.player.rotation - Math.PI / 2, 200, this.player.body.velocity);
  } else if (this.cursors.down.isDown) {
  this.physics.velocityFromRotation(this.player.rotation - Math.PI / 2, -200, this.player.body.velocity);
  } else {
  this.player.setVelocity(0, 0);
  }

  //

  const distancia = 0; // separación vertical
  this.abeja.x = this.player.x + Math.cos(this.player.rotation - Math.PI / 2) * distancia;
  this.abeja.y = this.player.y + Math.sin(this.player.rotation - Math.PI / 2) * distancia;
  this.abeja.rotation = this.player.rotation;
  //

  //Si se aprieta z se dispara
  if (Phaser.Input.Keyboard.JustDown(this.teclaZ)) {
    this.disparar();
  } 
  //


  //Si las moscas estan fuera de la zona se ocultan y si estan dentro se ven
 this.moscas.children.each((mosca) => {
  if (!mosca.active) return;

  const dentroZonaVisible =
    mosca.x > 100 && mosca.x < 980 &&
    mosca.y > 100 && mosca.y < 980;

  if (!mosca.entroAntes && dentroZonaVisible) {
    mosca.entroAntes = true;

    // Dispara solo cuando entra
    const probabilidadDisparo = Math.min(0.2 + 0.05 * (this.rondaActual - 1), 1);
  if (Phaser.Math.FloatBetween(0, 1) <= probabilidadDisparo) {
      this.time.delayedCall(Phaser.Math.Between(200, 700), () => {
        if (!mosca.active || !this.abeja.active) return;

        const bala = this.proyectilesEnemigos.create(mosca.x, mosca.y, "moscaBala");
        bala.setScale(6.5);
        bala.setRotation(mosca.rotation);

        const velX = mosca.body.velocity.x * 2;
        const velY = mosca.body.velocity.y * 2;
        bala.setVelocity(velX, velY);
        bala.setCollideWorldBounds(true);
        bala.body.onWorldBounds = true;

        this.sonidoDisparoMosca.play(); // 🔊 ¡Ahora sí zumba!
      });
    }

  } else if (!dentroZonaVisible) {
    // Si sale, reseteamos para que pueda volver a disparar al entrar
    mosca.entroAntes = false;
  }

  // Profundidad para visibilidad
  if (dentroZonaVisible && mosca.depth !== 3) {
    mosca.setDepth(3);
  } else if (!dentroZonaVisible && mosca.depth !== 1) {
    mosca.setDepth(1);
  }

  }, this);

  // Teletransportar moscas cuando llegan al borde
  this.moscas.children.each((mosca) => {
  if (!mosca.active) return;

  const minX = 80;
  const maxX = 80 + 920;
  const minY = 80;
  const maxY = 80 + 920;

  // Si ya se teletransportó, espera a que salga del borde
  if (mosca.justTeleported) {
    if (mosca.x > minX && mosca.x < maxX && mosca.y > minY && mosca.y < maxY) {
      mosca.justTeleported = false;
    }
    return; // no hacer nada más
  }

  let fueTeletransportada = false;

  if (mosca.x < minX) {
    mosca.x = maxX;
    fueTeletransportada = true;
  } else if (mosca.x > maxX) {
    mosca.x = minX;
    fueTeletransportada = true;
  }

  if (mosca.y < minY) {
    mosca.y = maxY;
    fueTeletransportada = true;
  } else if (mosca.y > maxY) {
    mosca.y = minY;
    fueTeletransportada = true;
  }

  if (fueTeletransportada) {
    mosca.justTeleported = true;

    const dx = this.player.x - mosca.x;
    const dy = this.player.y - mosca.y;
    const angulo = Math.atan2(dy, dx);
    mosca.setRotation(angulo + Math.PI / 2);

    // Mirar mantener velocidad constante
    const speed = mosca.body.velocity.length();
    mosca.setVelocity(Math.cos(angulo) * speed, Math.sin(angulo) * speed);
  }
  }, this);
    
  //Bala de moscas destruida si sale de la zona
  this.proyectilesEnemigos.children.each((bala) => {
  if (bala.x < 0 || bala.x > 1440 || bala.y < 0 || bala.y > 1080) {
    bala.destroy();
  }
  });
  //

  if (this.juegoTerminado && this.ingresandoNombre) {
  if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
    this.posicionLetra = Phaser.Math.Clamp(this.posicionLetra - 1, 0, 3);
    this.actualizarColoresLetras();
  }

  if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
    this.posicionLetra = Phaser.Math.Clamp(this.posicionLetra + 1, 0, 3);
    this.actualizarColoresLetras();
  }

  if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
    this.cambiarLetra(1);
  }

  if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
    this.cambiarLetra(-1);
  }

  if (Phaser.Input.Keyboard.JustDown(this.teclaZ)) {
    const nombreFinal = this.nombreActual.join("");
    this.agregarPuntuacion({
      nombre: nombreFinal,
      puntuacionMax: this.puntos,
      etapaMax: this.rondaActual
    });
    this.ingresandoNombre = false;
  }

  return;
  }

  }

  //Se crea el disparo de abejas
  disparar() {
  if (this.juegoTerminado) return;

  const bala = this.proyectiles.get();
  if (bala) {
    const offset = 20;
    const spawnX = this.abeja.x + Math.cos(this.abeja.rotation - Math.PI / 2) * offset;
    const spawnY = this.abeja.y + Math.sin(this.abeja.rotation - Math.PI / 2) * offset;

    bala.enableBody(true, spawnX, spawnY, true, true);
    bala.setScale(5);
    bala.setRotation(this.abeja.rotation);
    this.physics.velocityFromRotation(this.abeja.rotation - Math.PI / 2, 400, bala.body.velocity);
    bala.setCollideWorldBounds(true);
    bala.body.onWorldBounds = true;
    this.sonidoDisparo.play();
    this.sound.add('disparoAbeja', { volume: 0.6 }); // valor entre 0 y 1
  }
  }
  //

  //Se crea la generacion de moscas
  generarMoscaAleatoria() {
  if (this.totalMoscasGeneradas >= this.moscasPorRonda || this.juegoTerminado) return;

  const lados = ["arriba", "abajo", "izquierda", "derecha"];
  const lado = Phaser.Utils.Array.GetRandom(lados);

  let x, y;
  const margen = 50;

  if (lado === "arriba") {
    x = Phaser.Math.Between(260, 1180);
    y = 80 - margen;
  } else if (lado === "abajo") {
    x = Phaser.Math.Between(260, 1180);
    y = 1000 + margen;
  } else if (lado === "izquierda") {
    x = 80 - margen;
    y = Phaser.Math.Between(80, 1000);
  } else {
    x = 1000 + margen;
    y = Phaser.Math.Between(80, 1000);
  }

  const mosca = this.moscas.get(x, y, "mosca");
  if (!mosca) return;

  this.totalMoscasGeneradas++;

  mosca.enableBody(true, x, y, true, true);
  mosca.play("mosca-vuela");
  mosca.setScale(5);
  mosca.setDepth(1); 
  const radio = 3.4;
  mosca.body.setCircle(radio, (9 - radio * 2) / 2, (8 - radio * 2) / 2);  mosca.setCollideWorldBounds(false);
  mosca.body.allowGravity = false;

  
  const dx = this.player.x - x;
  const dy = this.player.y - y;
  const angulo = Math.atan2(dy, dx);
  mosca.setRotation(angulo + Math.PI / 2);
  const velocidadBase = 100; // las moscas tienen una velocidad base de 100
  const velocidad = velocidadBase + (this.rondaActual - 1) * 10; // Aumenta 10 la velocidad de las moscas por ronda
  mosca.setVelocity(Math.cos(angulo) * velocidad, Math.sin(angulo) * velocidad);


  mosca.puedeDisparar = false;

  // Esperar delay antes de que pueda disparar
  this.time.delayedCall(600, () => {
    if (mosca.active) {
      mosca.puedeDisparar = true;
    }
  });

  
//
}
//

activarInmunidad() {
  this.abejaInmune = true;
  this.abeja.setAlpha(0.25); // 25% opaca
  this.player.setPosition(540, 540);
  this.abeja.setPosition(540, 540);

  this.time.delayedCall(2000, () => {
    this.abejaInmune = false;
    this.abeja.setAlpha(1); // vuelve a ser visible
  });
}

actualizarIconosVidas() {
  this.iconosVidas.forEach(icono => icono.destroy());
  this.iconosVidas = [];

  for (let i = 0; i < this.vidasMaximas; i++) {
    const slot = this.slotVidasTexto[i];
    if (i < this.vidasExtra) {
      const abeja = this.add.image(slot.x + 12, slot.y + 2, 'abeja', 0)
        .setScale(2.8)
        .setOrigin(0.5)
        .setDepth(100);
      this.iconosVidas.push(abeja);
      slot.setText(''); // Oculta el guión
    } else {
      slot.setText('-');
    }
  }
}

  cambiarLetra(direccion) {
  const letras = this.caracteresDisponibles;
  const indexActual = letras.indexOf(this.nombreActual[this.posicionLetra]);
  const nuevoIndex = (indexActual + direccion + letras.length) % letras.length;
  this.nombreActual[this.posicionLetra] = letras[nuevoIndex];
  this.letrasTexto[this.posicionLetra].setText(this.nombreActual[this.posicionLetra]);
  }

  actualizarColoresLetras() {
  this.letrasTexto.forEach((letraText, index) => {
    letraText.setColor(index === this.posicionLetra ? '#ffff00' : '#00ffff');
  });
  }

  agregarPuntuacion(entry) {
  const ranking = JSON.parse(localStorage.getItem("ranking")) || [];

  const existente = ranking.find(e => e.nombre === entry.nombre);

  if (existente) {
    existente.puntuacionMax = Math.max(existente.puntuacionMax, entry.puntuacionMax);
    existente.etapaMax = Math.max(existente.etapaMax, entry.etapaMax);
  } else {
    ranking.push(entry);
  }

  const top10 = ranking
    .sort((a, b) => b.puntuacionMax - a.puntuacionMax)
    .slice(0, 10);

  localStorage.setItem("ranking", JSON.stringify(top10));
  }

  //Actualizar los textos
  mostrarTextoRonda(ronda) {
  // Actualizar el texto permanente en la esquina
  if (this.textoEtapa) {
    this.textoEtapa.setText(`ETAPA ${ronda}`);
  }

  // Texto grande temporal centrado en pantalla
  const textoGrande = this.add.text(564, 505, `ETAPA ${this.rondaActual}`, {
    fontFamily: 'Joystix Monospace',
    fontSize: '56px',
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(300);

  // Destruir texto grande después de 2 segundos
  this.time.delayedCall(2000, () => textoGrande.destroy());
  }
  //
  //Creada derrota
  derrota() {

   if (this.juegoTerminado) return;
  this.juegoTerminado = true;


  this.abeja.setVisible(false);
  this.player.destroy();

  //Textos derrota
  this.add.text(540, 428, '¡Fin del juego!', {
    fontFamily: 'Public Pixel',
    fontSize: '25px',
    color: '#32CD32',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(200);

  this.add.text(545, 470, `ETAPA ${this.rondaActual}`, {
    fontFamily: 'Joystix Monospace',
    fontSize: '32px',
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(200);

  this.add.text(442, 512, 'Puntos:', {
    fontFamily: 'Joystix Monospace',
    fontSize: '32px',
    color: '#ffff00',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(200);

 this.add.text(634, 512, this.puntos.toString().padStart(7, '0'), {
  fontFamily: 'Joystix Monospace',
  fontSize: '32px',
  color: '#ffff00',
  stroke: '#000',
  strokeThickness: 2
}).setOrigin(0.5).setDepth(200);

  this.add.text(545, 574, 'Ingrese nombre:', {
    fontFamily: 'Public Pixel',
    fontSize: '28px',
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(200);


  this.zDisponible = false; // deshabilita temporalmente Z
  this.time.delayedCall(2000, () => {
  this.zDisponible = true;
  });

  this.ingresandoNombre = true;


  this.caracteresDisponibles = "ABCDEFGHIJKLMNOPQRSTUVWXYZÑ0123456789".split("");
  this.nombreActual = ["A", "A", "A", "A"];
  this.posicionLetra = 0;
  this.letrasTexto = [];

  const posicionBaseX = 540; // centro horizontal deseado
  const espacioEntreLetras = 40;
  const posicionY = 616; // vertical más arriba que 640

  for (let i = 0; i < 4; i++) {
  const letra = this.add.text(posicionBaseX + (i - 1.5) * espacioEntreLetras, posicionY, this.nombreActual[i], {
    fontFamily: 'Public Pixel',
    fontSize: '32px',
    color: '#00ffff'
  }).setOrigin(0.5).setDepth(300);

  this.letrasTexto.push(letra);
  }

  this.actualizarColoresLetras();

  this.add.text(545, 658, 'Presione Z para ingresar', {
    fontFamily: 'Public Pixel',
    fontSize: '19px',
    color: '#fff',
    stroke: '#000',
    strokeThickness: 2
  }).setOrigin(0.5).setDepth(200);

  this.cursors = this.input.keyboard.createCursorKeys();
  this.teclaZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

  this.temporizadorMoscas.remove();

  this.moscas.children.each((mosca) => {
    mosca.setVelocity(0, 0);
    mosca.anims.pause();
  });
  //
  
  this.physics.pause(); //Fisicas pausadas

  // Mostrar la imagen "finjuego"
  const finJuegoSprite = this.add.sprite(540, 540, "finjuego");
  finJuegoSprite.setScale(8);
  finJuegoSprite.setOrigin(0.5);
  finJuegoSprite.setDepth(150);


  }
  //

}