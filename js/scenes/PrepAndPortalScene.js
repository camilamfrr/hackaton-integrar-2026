import { registerPixelAssets } from "../pixelSprites.js";
import { PlayerController } from "../playerController.js";
import { evaluatePortalAccess } from "../gameState.js";

export class PrepAndPortalScene extends Phaser.Scene {
  constructor() {
    super({ key: "PrepAndPortalScene" });
    this.transitioning = false;
    this.lastBlockFeedbackAt = 0;
  }

  create() {
    registerPixelAssets(this);
    this.transitioning = false;

    const { width, height } = this.scale;
    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");

    // Terreno pixel art
    this.add.tileSprite(width / 2, height / 2, width, height, "grass_human").setScale(2);

    // Sendero empedrado desde el punto de inicio hasta el portal
    for (let x = 160; x <= 620; x += 32) {
      this.add.image(x, height / 2, "path_tile").setScale(2);
      this.add.image(x, height / 2 + 32, "path_tile").setScale(2);
    }

    // Obstáculos con colisión (árboles y hongos)
    this.obstacles = this.physics.add.staticGroup();
    const treeCoords = [
      [75, 80], [220, 75], [400, 70], [720, 85],
      [75, 445], [270, 450], [490, 445], [725, 445],
      [350, 155], [470, 385],
    ];
    for (const [tx, ty] of treeCoords) {
      const tree = this.obstacles.create(tx, ty, "tree_magic");
      tree.setScale(2.5);
      tree.refreshBody();
      tree.body.setSize(34, 24);
      tree.body.setOffset(13, 40);
      tree.setDepth(ty);
    }

    // Flores decorativas
    const flowerCoords = [
      [140, 180], [290, 210], [510, 165], [180, 360], [560, 355],
    ];
    for (const [fx, fy] of flowerCoords) {
      this.add.image(fx, fy, "flower_glow").setScale(2);
    }

    // Portal Interdimensional en el lado derecho
    this.portalX = 655;
    this.portalY = height / 2 + 8;
    this.portal = this.physics.add.staticSprite(this.portalX, this.portalY, "portal", 0);
    this.portal.setScale(2.7);
    this.portal.refreshBody();
    this.portal.body.setSize(58, 44);
    this.portal.body.setOffset(35, 62);
    this.portal.setDepth(8);

    // Partículas de energía del portal (activas cuando se abre)
    this.portalParticles = this.add.particles(this.portalX, this.portalY - 8, "sparkle", {
      speed: { min: 15, max: 55 },
      scale: { start: 1.8, end: 0 },
      lifespan: 750,
      frequency: 110,
      emitting: false,
    });
    this.portalParticles.setDepth(12);

    this.portalLabel = this.add
      .text(this.portalX, this.portalY - 76, "PORTAL SELLADO", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "13px",
        color: "#f6d37a",
        backgroundColor: "rgba(9, 20, 15, 0.85)",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Repartidor controlable
    this.player = new PlayerController(this, 155, height / 2 + 12, state.wingsEquipped);
    this.physics.add.collider(this.player.sprite, this.obstacles);

    // Zona de detección del portal
    this.portalZone = this.add.zone(this.portalX, this.portalY + 10, 72, 72);
    this.physics.world.enable(this.portalZone, Phaser.Physics.Arcade.STATIC_BODY);

    this.physics.add.overlap(this.player.sprite, this.portalZone, () => {
      this.handlePortalCollision();
    });

    // Sincronizar con UI externa
    this.syncPortalVisuals();
    this.player.setMovementLocked(uiBridge.isModalOpen());

    this.events.on("wings-equipped", () => {
      this.player.setWingsEquipped(true, true);
      this.syncPortalVisuals();
    });

    this.events.on("portal-updated", () => {
      this.syncPortalVisuals();
    });

    this.events.on("modal-toggled", (isOpen) => {
      this.player.setMovementLocked(isOpen);
    });

    this.cameras.main.fadeIn(350, 9, 20, 15);
  }

  syncPortalVisuals() {
    const state = this.registry.get("missionState");
    if (state.portalOpen) {
      this.portal.anims.play("portal-active", true);
      this.portalParticles.start();
      this.portalLabel.setText("¡PORTAL ABIERTO! CRUZÁ");
      this.portalLabel.setColor("#7de2b8");
    } else {
      this.portal.anims.play("portal-closed", true);
      this.portalParticles.stop();
      this.portalLabel.setText("PORTAL SELLADO");
      this.portalLabel.setColor("#f6d37a");
    }
  }

  handlePortalCollision() {
    if (this.transitioning) return;

    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");
    const access = evaluatePortalAccess(state);

    if (!access.allowed) {
      const now = this.time.now;
      if (now - this.lastBlockFeedbackAt > 1200) {
        this.lastBlockFeedbackAt = now;
        uiBridge.showToast(access.message, "error");
        // Pequeño empuje hacia atrás para evitar quedar pegado al trigger
        this.player.sprite.x -= 22;
      }
      return;
    }

    // Transición al Reino Fae
    this.transitioning = true;
    this.player.setMovementLocked(true);
    state.inFaeRealm = true;
    uiBridge.onEnterFaeRealm();

    this.cameras.main.flash(350, 125, 226, 184);
    this.cameras.main.fadeOut(450, 9, 20, 15);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("FaeRealmScene");
    });
  }

  update() {
    this.player.update();
  }
}
