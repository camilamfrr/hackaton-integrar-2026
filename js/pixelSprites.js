/**
 * Generador procedural de sprites y tiles en estilo Fantasy Pixel Art
 * utilizando CanvasTexture de Phaser 3 (pixelArt: true).
 */

function createCanvasTexture(scene, key, width, height, drawFn) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, width, height);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  drawFn(ctx, width, height);
  tex.refresh();
}

function createSpritesheetFromCanvas(scene, key, frameWidth, frameHeight, frameCount, drawFrameFn) {
  if (scene.textures.exists(key)) return;
  const canvas = document.createElement("canvas");
  canvas.width = frameWidth * frameCount;
  canvas.height = frameHeight;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  for (let i = 0; i < frameCount; i++) {
    ctx.save();
    ctx.translate(i * frameWidth, 0);
    drawFrameFn(ctx, i, frameWidth, frameHeight);
    ctx.restore();
  }

  scene.textures.addSpriteSheet(key, canvas, {
    frameWidth,
    frameHeight,
  });
}

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/**
 * Dibuja la mochila térmica roja de "PedidosYa" en pixel art sobre el canvas 32x32.
 */
function drawPedidosYaBag(ctx, x, y, w, h, showText) {
  px(ctx, x, y, w, h, "#c91c2b"); // Rojo PedidosYa
  px(ctx, x + 1, y + 1, w - 2, 2, "#eb3646"); // Tapa superior iluminada
  px(ctx, x, y + h - 2, w, 2, "#8f111c"); // Base sombreada
  px(ctx, x + 1, y + 3, w - 2, 1, "#ffffff"); // Franja blanca superior

  if (showText) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 5px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PedidosYa", x + w / 2, y + h - 3);
  }
}

/**
 * Dibuja un frame del repartidor/a humano/a (32x32).
 * Frames:
 * 0,1 = abajo | 2,3 = arriba | 4,5 = izquierda | 6,7 = derecha
 */
function drawPlayerFrame(ctx, frame) {
  const dir = Math.floor(frame / 2); // 0: down, 1: up, 2: left, 3: right
  const step = frame % 2;

  // Sombra
  px(ctx, 8, 28, 16, 3, "rgba(0,0,0,0.35)");

  // Si va de frente (dir === 0), la mochila térmica sobresale por detrás de los hombros
  if (dir === 0) {
    drawPedidosYaBag(ctx, 7, 10, 18, 11, false);
  }

  // Piernas / Pantalón y calzado con paso alternado
  const leftLegY = step === 0 ? 22 : 24;
  const rightLegY = step === 0 ? 24 : 22;
  px(ctx, 10, 21, 4, 6, "#253652");
  px(ctx, 18, 21, 4, 6, "#253652");
  px(ctx, 9, leftLegY + 2, 5, 3, "#3b2316");
  px(ctx, 18, rightLegY + 2, 5, 3, "#3b2316");

  // Uniforme de delivery (chaqueta verde bosque con detalles dorados)
  px(ctx, 9, 13, 14, 9, "#245b42");
  px(ctx, 11, 14, 10, 7, "#2f7455");

  // Brazos animados al caminar
  const armOffset = step === 0 ? 0 : 1;
  if (dir === 0 || dir === 1) {
    px(ctx, 6, 14 + armOffset, 3, 7, "#245b42");
    px(ctx, 23, 14 + (1 - armOffset), 3, 7, "#245b42");
    px(ctx, 6, 20 + armOffset, 3, 2, "#f2cbb0");
    px(ctx, 23, 20 + (1 - armOffset), 3, 2, "#f2cbb0");
  }

  // Correas de la mochila al frente
  if (dir === 0) {
    px(ctx, 10, 13, 2, 8, "#a81825");
    px(ctx, 20, 13, 2, 8, "#a81825");
    px(ctx, 15, 13, 2, 7, "#f6d37a");
  }

  // Cabeza y gorra de delivery
  px(ctx, 10, 4, 12, 9, "#f2cbb0");
  px(ctx, 9, 2, 14, 4, "#1f4d3a");
  px(ctx, 11, 1, 10, 2, "#d4a24c");

  if (dir === 0) {
    px(ctx, 10, 5, 12, 2, "#163829"); // visera frente
    px(ctx, 12, 8, 2, 2, "#241a12"); // ojo izq
    px(ctx, 18, 8, 2, 2, "#241a12"); // ojo der
  } else if (dir === 2) {
    px(ctx, 6, 4, 4, 2, "#163829"); // visera izq
    px(ctx, 12, 8, 2, 2, "#241a12");
  } else if (dir === 3) {
    px(ctx, 22, 4, 4, 2, "#163829"); // visera der
    px(ctx, 18, 8, 2, 2, "#241a12");
  }

  // Mochila térmica roja PedidosYa bien visible en espalda y costados
  if (dir === 1) {
    // Espalda: mochila completa con marca y texto PedidosYa
    drawPedidosYaBag(ctx, 5, 11, 22, 13, true);
  } else if (dir === 2) {
    // Mirando izquierda: mochila en la espalda (lado derecho)
    drawPedidosYaBag(ctx, 17, 11, 12, 13, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 4px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PY", 23, 21);
  } else if (dir === 3) {
    // Mirando derecha: mochila en la espalda (lado izquierdo)
    drawPedidosYaBag(ctx, 3, 11, 12, 13, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 4px monospace";
    ctx.textAlign = "center";
    ctx.fillText("PY", 9, 21);
  }
}

/**
 * Alitas de cotillón desplegadas hacia los costados (44x24, 2 frames)
 * con espacio central libre para no tapar la mochila de PedidosYa.
 */
function drawWingsFrame(ctx, frame) {
  const offset = frame === 0 ? 0 : 2;
  // Ala izquierda bien abierta hacia afuera
  px(ctx, 1, 3 + offset, 11, 9, "#f2b8b4");
  px(ctx, 3, 5 + offset, 7, 5, "#fff0e6");
  px(ctx, 4, 12 + offset, 8, 6, "#e39894");
  px(ctx, 0, 3 + offset, 2, 9, "#f6d37a");

  // Ala derecha bien abierta hacia afuera
  px(ctx, 32, 3 + offset, 11, 9, "#f2b8b4");
  px(ctx, 34, 5 + offset, 7, 5, "#fff0e6");
  px(ctx, 32, 12 + offset, 8, 6, "#e39894");
  px(ctx, 42, 3 + offset, 2, 9, "#f6d37a");
}

/**
 * Hada Lumina (20x20, 2 frames de flotación/aleteo).
 */
function drawFairyFrame(ctx, frame) {
  const bob = frame === 0 ? 0 : 1;
  px(ctx, 6, 17, 8, 2, "rgba(0,0,0,0.28)");

  px(ctx, 1, 5 + bob, 5, 5, "#f5c4bf");
  px(ctx, 14, 5 + bob, 5, 5, "#f5c4bf");
  px(ctx, 2, 6 + bob, 3, 3, "#fff6d1");
  px(ctx, 15, 6 + bob, 3, 3, "#fff6d1");

  px(ctx, 6, 9 + bob, 8, 6, "#2c6b4f");
  px(ctx, 5, 13 + bob, 10, 2, "#3a8764");
  px(ctx, 8, 9 + bob, 4, 2, "#f6d37a");

  px(ctx, 6, 3 + bob, 8, 6, "#5a3228");
  px(ctx, 7, 4 + bob, 6, 5, "#f7dac4");
  px(ctx, 7, 2 + bob, 2, 2, "#c98986");
  px(ctx, 9, 2 + bob, 2, 2, "#f6d37a");
  px(ctx, 11, 2 + bob, 2, 2, "#c98986");
  px(ctx, 8, 6 + bob, 1, 1, "#241a12");
  px(ctx, 11, 6 + bob, 1, 1, "#241a12");

  px(ctx, 14, 10 + bob, 3, 1, "#d4a24c");
  px(ctx, 16, 8 + bob, 2, 2, "#fff6d1");
}

/**
 * Portal interdimensional (48x48, 4 frames: 0-1 cerrado, 2-3 abierto).
 */
function drawPortalFrame(ctx, frame) {
  const isOpen = frame >= 2;
  const pulse = frame % 2 === 1;

  px(ctx, 10, 38, 28, 8, "#3e4742");
  px(ctx, 12, 39, 24, 5, "#546059");
  px(ctx, 8, 10, 32, 30, "#2d3833");
  px(ctx, 10, 6, 28, 34, "#46544d");
  px(ctx, 13, 9, 22, 28, "#0f1c16");

  const runeColor = isOpen ? (pulse ? "#fff6d1" : "#f6d37a") : "#6f634c";
  px(ctx, 10, 14, 2, 3, runeColor);
  px(ctx, 10, 22, 2, 3, runeColor);
  px(ctx, 10, 30, 2, 3, runeColor);
  px(ctx, 36, 14, 2, 3, runeColor);
  px(ctx, 36, 22, 2, 3, runeColor);
  px(ctx, 36, 30, 2, 3, runeColor);
  px(ctx, 22, 6, 4, 2, runeColor);

  if (isOpen) {
    px(ctx, 14, 11, 20, 24, "#1f5f47");
    px(ctx, 16, 13, 16, 20, "#4ec496");
    px(ctx, 19, 16, 10, 14, pulse ? "#fff6d1" : "#9df0cf");
    px(ctx, 22, 20, 4, 6, "#ffffff");
  } else {
    px(ctx, 15, 13, 18, 20, "#15261e");
    px(ctx, 19, 18, 10, 10, "#1d352a");
  }
}

export function registerPixelAssets(scene) {
  createSpritesheetFromCanvas(scene, "player", 32, 32, 8, drawPlayerFrame);
  createSpritesheetFromCanvas(scene, "wings", 44, 24, 2, drawWingsFrame);
  createSpritesheetFromCanvas(scene, "fairy", 20, 20, 2, drawFairyFrame);
  createSpritesheetFromCanvas(scene, "portal", 48, 48, 4, drawPortalFrame);

  // Lata de Coca-Cola pixel art (16x22)
  createCanvasTexture(scene, "coca_cola", 16, 22, (ctx) => {
    px(ctx, 3, 19, 10, 2, "rgba(0,0,0,0.32)");
    // Tapa y base metálica
    px(ctx, 4, 2, 8, 2, "#cfd8dc");
    px(ctx, 5, 1, 6, 1, "#eceff1");
    px(ctx, 4, 18, 8, 2, "#b0bec5");
    // Cuerpo rojo
    px(ctx, 3, 4, 10, 14, "#d91c24");
    px(ctx, 4, 5, 2, 12, "#f2444b"); // brillo lateral
    // Franja blanca característica
    px(ctx, 3, 9, 4, 2, "#ffffff");
    px(ctx, 6, 10, 4, 2, "#ffffff");
    px(ctx, 9, 9, 4, 2, "#ffffff");
  });

  // Helecho mágico (32x32) para la transformación al cruzar sin alitas
  createCanvasTexture(scene, "fern", 32, 32, (ctx) => {
    px(ctx, 8, 27, 16, 3, "rgba(0,0,0,0.35)");
    // Base/tallo
    px(ctx, 14, 21, 4, 7, "#24573d");
    px(ctx, 13, 25, 6, 3, "#4f3727");
    // Frondas laterales
    px(ctx, 4, 17, 10, 4, "#2f855a");
    px(ctx, 18, 17, 10, 4, "#2f855a");
    px(ctx, 6, 13, 8, 4, "#3ca370");
    px(ctx, 18, 13, 8, 4, "#3ca370");
    // Fronda central alta
    px(ctx, 13, 6, 6, 16, "#3ca370");
    px(ctx, 10, 9, 12, 4, "#52c488");
    px(ctx, 14, 4, 4, 3, "#7de2b8");
    // Detalles de hojitas y destello
    px(ctx, 5, 16, 2, 2, "#7de2b8");
    px(ctx, 25, 16, 2, 2, "#7de2b8");
  });

  // Objeto coleccionable de alitas de cotillón en el suelo (24x20)
  createCanvasTexture(scene, "wings_pickup", 24, 20, (ctx) => {
    px(ctx, 4, 16, 16, 3, "rgba(0,0,0,0.3)");
    px(ctx, 2, 3, 8, 8, "#f2b8b4");
    px(ctx, 4, 5, 4, 4, "#fff0e6");
    px(ctx, 14, 3, 8, 8, "#f2b8b4");
    px(ctx, 16, 5, 4, 4, "#fff0e6");
    px(ctx, 1, 3, 1, 8, "#f6d37a");
    px(ctx, 22, 3, 1, 8, "#f6d37a");
    px(ctx, 10, 7, 4, 3, "#d4a24c");
  });

  createCanvasTexture(scene, "grass_human", 16, 16, (ctx) => {
    px(ctx, 0, 0, 16, 16, "#274736");
    px(ctx, 2, 3, 2, 1, "#325944");
    px(ctx, 10, 7, 2, 1, "#325944");
    px(ctx, 6, 12, 2, 1, "#1e382a");
    px(ctx, 13, 14, 1, 1, "#3c6950");
  });

  createCanvasTexture(scene, "path_tile", 16, 16, (ctx) => {
    px(ctx, 0, 0, 16, 16, "#6b5a45");
    px(ctx, 1, 1, 6, 6, "#857158");
    px(ctx, 9, 2, 6, 5, "#7d6a52");
    px(ctx, 2, 9, 5, 5, "#7a664e");
    px(ctx, 9, 9, 6, 6, "#8a765c");
  });

  createCanvasTexture(scene, "grass_fae", 16, 16, (ctx) => {
    px(ctx, 0, 0, 16, 16, "#193b34");
    px(ctx, 3, 4, 2, 1, "#26574c");
    px(ctx, 11, 2, 1, 1, "#7de2b8");
    px(ctx, 8, 11, 2, 1, "#26574c");
    px(ctx, 13, 13, 1, 1, "#c98986");
  });

  createCanvasTexture(scene, "tree_magic", 24, 28, (ctx) => {
    px(ctx, 6, 23, 12, 4, "rgba(0,0,0,0.35)");
    px(ctx, 9, 16, 6, 10, "#5c3d28");
    px(ctx, 10, 17, 2, 8, "#734e35");
    px(ctx, 3, 7, 18, 12, "#1c4a35");
    px(ctx, 5, 3, 14, 12, "#29694b");
    px(ctx, 7, 1, 10, 6, "#378560");
    px(ctx, 7, 7, 2, 2, "#f6d37a");
    px(ctx, 15, 11, 2, 2, "#c98986");
  });

  createCanvasTexture(scene, "mushroom_giant", 20, 22, (ctx) => {
    px(ctx, 5, 18, 10, 3, "rgba(0,0,0,0.32)");
    px(ctx, 7, 10, 6, 10, "#ebd9b7");
    px(ctx, 2, 5, 16, 7, "#b85552");
    px(ctx, 4, 3, 12, 4, "#cf6c68");
    px(ctx, 5, 6, 2, 2, "#fff3d1");
    px(ctx, 10, 4, 2, 2, "#fff3d1");
    px(ctx, 13, 8, 2, 2, "#fff3d1");
  });

  createCanvasTexture(scene, "flower_glow", 12, 12, (ctx) => {
    px(ctx, 5, 6, 2, 5, "#377d56");
    px(ctx, 3, 3, 6, 4, "#e6a4a0");
    px(ctx, 5, 4, 2, 2, "#fff6d1");
  });

  createCanvasTexture(scene, "fae_house", 36, 36, (ctx) => {
    px(ctx, 4, 30, 28, 5, "rgba(0,0,0,0.35)");
    px(ctx, 6, 16, 24, 16, "#e8d5b5");
    px(ctx, 8, 18, 20, 12, "#d6be96");
    px(ctx, 15, 22, 6, 10, "#694127");
    px(ctx, 16, 23, 4, 9, "#875636");
    px(ctx, 8, 21, 4, 4, "#f6d37a");
    px(ctx, 24, 21, 4, 4, "#f6d37a");
    px(ctx, 2, 10, 32, 8, "#8c3d46");
    px(ctx, 5, 5, 26, 6, "#a84c56");
    px(ctx, 10, 2, 16, 4, "#bd5e68");
    px(ctx, 9, 8, 3, 2, "#f6d37a");
    px(ctx, 22, 7, 3, 2, "#f6d37a");
  });

  createCanvasTexture(scene, "pancho_item", 16, 16, (ctx) => {
    px(ctx, 4, 2, 2, 5, "#f7da84");
    px(ctx, 7, 1, 2, 6, "#f4ca64");
    px(ctx, 10, 2, 2, 5, "#f7da84");
    px(ctx, 2, 7, 12, 6, "#d99d4e");
    px(ctx, 1, 8, 14, 3, "#b84333");
    px(ctx, 3, 9, 10, 1, "#f6d37a");
  });

  createCanvasTexture(scene, "sparkle", 6, 6, (ctx) => {
    px(ctx, 2, 0, 2, 6, "#fff6d1");
    px(ctx, 0, 2, 6, 2, "#fff6d1");
  });

  if (!scene.anims.exists("player-down")) {
    scene.anims.create({
      key: "player-down",
      frames: scene.anims.generateFrameNumbers("player", { start: 0, end: 1 }),
      frameRate: 7,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-up",
      frames: scene.anims.generateFrameNumbers("player", { start: 2, end: 3 }),
      frameRate: 7,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-left",
      frames: scene.anims.generateFrameNumbers("player", { start: 4, end: 5 }),
      frameRate: 7,
      repeat: -1,
    });
    scene.anims.create({
      key: "player-right",
      frames: scene.anims.generateFrameNumbers("player", { start: 6, end: 7 }),
      frameRate: 7,
      repeat: -1,
    });
    scene.anims.create({
      key: "wings-flap",
      frames: scene.anims.generateFrameNumbers("wings", { start: 0, end: 1 }),
      frameRate: 8,
      repeat: -1,
    });
    scene.anims.create({
      key: "fairy-idle",
      frames: scene.anims.generateFrameNumbers("fairy", { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1,
    });
    scene.anims.create({
      key: "portal-closed",
      frames: scene.anims.generateFrameNumbers("portal", { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1,
    });
    scene.anims.create({
      key: "portal-active",
      frames: scene.anims.generateFrameNumbers("portal", { start: 2, end: 3 }),
      frameRate: 5,
      repeat: -1,
    });
  }
}
