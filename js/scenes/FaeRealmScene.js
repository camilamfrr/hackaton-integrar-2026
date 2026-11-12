import { registerPixelAssets } from "../pixelSprites.js";
import { PlayerController } from "../playerController.js";

export class FaeRealmScene extends Phaser.Scene {
  constructor() {
    super({ key: "FaeRealmScene" });
  }

  create() {
    registerPixelAssets(this);

    const worldWidth = 1120;
    const worldHeight = 720;
    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Terreno del Reino Fae
    this.add.tileSprite(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, "grass_fae").setScale(2);

    // Sendero mágico serpentino desde el portal de llegada hasta el claro del hada
    for (let x = 130; x <= 520; x += 32) {
      this.add.image(x, 360, "path_tile").setScale(2);
      this.add.image(x, 392, "path_tile").setScale(2);
    }
    for (let y = 260; y <= 392; y += 32) {
      this.add.image(520, y, "path_tile").setScale(2);
      this.add.image(552, y, "path_tile").setScale(2);
    }
    for (let x = 552; x <= 900; x += 32) {
      this.add.image(x, 260, "path_tile").setScale(2);
      this.add.image(x, 292, "path_tile").setScale(2);
    }

    // Portal de llegada (oeste)
    this.arrivalPortal = this.add.sprite(115, 365, "portal", 2).setScale(2.5).setDepth(7);
    this.arrivalPortal.play("portal-active");

    // Obstáculos con colisión (árboles, hongos gigantes, casas fantásticas)
    this.obstacles = this.physics.add.staticGroup();

    const trees = [
      [80, 95], [260, 85], [470, 90], [720, 80], [1030, 95],
      [90, 620], [310, 635], [620, 630], [890, 625], [1045, 580],
      [330, 230], [670, 440],
    ];
    for (const [tx, ty] of trees) {
      const tree = this.obstacles.create(tx, ty, "tree_magic");
      tree.setScale(2.6);
      tree.refreshBody();
      tree.body.setSize(34, 24);
      tree.body.setOffset(14, 42);
      tree.setDepth(ty);
    }

    const mushrooms = [
      [210, 220], [420, 500], [740, 175], [820, 470],
    ];
    for (const [mx, my] of mushrooms) {
      const shroom = this.obstacles.create(mx, my, "mushroom_giant");
      shroom.setScale(2.6);
      shroom.refreshBody();
      shroom.body.setSize(32, 24);
      shroom.body.setOffset(10, 28);
      shroom.setDepth(my);
    }

    const houses = [
      [260, 500],
      [930, 145],
    ];
    for (const [hx, hy] of houses) {
      const house = this.obstacles.create(hx, hy, "fae_house");
      house.setScale(2.8);
      house.refreshBody();
      house.body.setSize(72, 42);
      house.body.setOffset(14, 52);
      house.setDepth(hy);
    }

    // Flores luminosas decorativas
    const flowers = [
      [175, 310], [360, 320], [490, 220], [620, 210],
      [790, 330], [875, 225], [965, 345], [560, 520],
    ];
    for (const [fx, fy] of flowers) {
      this.add.image(fx, fy, "flower_glow").setScale(2.2);
    }

    // Partículas ambientales del Reino Fae
    this.add.particles(worldWidth / 2, worldHeight / 2, "sparkle", {
      x: { min: -worldWidth / 2, max: worldWidth / 2 },
      y: { min: -worldHeight / 2, max: worldHeight / 2 },
      speedY: { min: -12, max: -4 },
      speedX: { min: -6, max: 6 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 3200,
      frequency: 160,
    }).setDepth(18);

    // Hada Lumina esperando su pedido en el claro este
    this.fairyX = 915;
    this.fairyY = 278;
    this.fairy = this.physics.add.staticSprite(this.fairyX, this.fairyY, "fairy", 0);
    this.fairy.setScale(2.8);
    this.fairy.refreshBody();
    this.fairy.body.setSize(34, 34);
    this.fairy.body.setOffset(11, 14);
    this.fairy.setDepth(12);
    this.fairy.play("fairy-idle");

    this.fairyNameTag = this.add
      .text(this.fairyX, this.fairyY - 46, state.fairyName, {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "13px",
        color: "#f6d37a",
        backgroundColor: "rgba(9, 20, 15, 0.85)",
        padding: { x: 8, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(22);

    this.interactPrompt = this.add
      .text(this.fairyX, this.fairyY + 46, "Presioná ESPACIO para interactuar", {
        fontFamily: "Crimson Pro, Georgia, serif",
        fontSize: "14px",
        color: "#09140f",
        backgroundColor: "#f6d37a",
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(25)
      .setVisible(false);

    // Repartidor con alitas ya equipadas
    this.player = new PlayerController(this, 190, 376, state.wingsEquipped);
    this.physics.add.collider(this.player.sprite, this.obstacles);
    this.physics.add.collider(this.player.sprite, this.fairy);

    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    // Tecla ESPACIO para interactuar
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.nearFairy = false;

    // Eventos desde la UI de entrega
    this.events.on("modal-toggled", (isOpen) => {
      this.player.setMovementLocked(isOpen);
    });

    this.events.on("pancho-delivered", () => {
      this.playDeliveryAnimation();
    });

    this.events.on("mission-completed", () => {
      this.playVictoryBurst();
    });

    this.cameras.main.fadeIn(450, 9, 20, 15);
    uiBridge.showToast("¡Llegaste al Reino Fae! Seguí el sendero hasta el Hada Lumina.", "info");
  }

  playDeliveryAnimation() {
    const pancho = this.add
      .image(this.player.sprite.x, this.player.sprite.y - 16, "pancho_item")
      .setScale(2.4)
      .setDepth(30);

    this.tweens.add({
      targets: pancho,
      x: this.fairyX,
      y: this.fairyY - 10,
      scale: 1.6,
      duration: 380,
      ease: "Quad.easeOut",
      onComplete: () => {
        pancho.destroy();
        const burst = this.add.particles(this.fairyX, this.fairyY, "sparkle", {
          speed: { min: 30, max: 90 },
          scale: { start: 1.8, end: 0 },
          lifespan: 450,
          quantity: 10,
          emitting: false,
        });
        burst.setDepth(30);
        burst.explode(10);
        this.time.delayedCall(500, () => burst.destroy());
      },
    });
  }

  playVictoryBurst() {
    const burst = this.add.particles(this.fairyX, this.fairyY, "sparkle", {
      speed: { min: 50, max: 160 },
      scale: { start: 2.5, end: 0 },
      lifespan: 900,
      quantity: 32,
      emitting: false,
    });
    burst.setDepth(35);
    burst.explode(32);
    this.time.delayedCall(1000, () => burst.destroy());
  }

  update() {
    this.player.update();

    const dist = Phaser.Math.Distance.Between(
      this.player.sprite.x,
      this.player.sprite.y,
      this.fairyX,
      this.fairyY
    );

    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");
    this.nearFairy = dist <= 105 && !state.missionCompleted && !uiBridge.isModalOpen();
    this.interactPrompt.setVisible(this.nearFairy);

    if (this.nearFairy && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      uiBridge.openDeliveryModal();
    }
  }
}
