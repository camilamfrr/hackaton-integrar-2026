import { registerPixelAssets } from "../pixelSprites.js";
import { PlayerController } from "../playerController.js";
import {
  collectWings,
  evaluatePortalAccess,
  STABILITY_PROBABILITY,
  toggleWings,
} from "../gameState.js";

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

    // Obstáculos con colisión (árboles)
    this.obstacles = this.physics.add.staticGroup();
    const treeCoords = [
      [75, 80], [285, 75], [440, 70], [720, 85],
      [75, 445], [270, 450], [490, 445], [725, 445],
      [370, 155], [470, 385],
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
      [140, 180], [240, 125], [510, 165], [180, 360], [560, 355],
    ];
    for (const [fx, fy] of flowerCoords) {
      this.add.image(fx, fy, "flower_glow").setScale(2);
    }

    // Objeto de Alitas de Cotillón en el escenario (solo si aún no se recogió)
    this.wingsX = 185;
    this.wingsY = 128;
    this.wingsPickup = null;
    this.wingsPrompt = null;

    if (!state.wingsCollected) {
      this.wingsPickup = this.add
        .image(this.wingsX, this.wingsY, "wings_pickup")
        .setScale(2.2)
        .setDepth(8);

      this.tweens.add({
        targets: this.wingsPickup,
        y: this.wingsY - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      this.wingsPrompt = this.add
        .text(this.wingsX, this.wingsY - 34, "E — RECOGER ALITAS", {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "12px",
          color: "#09140f",
          backgroundColor: "#f6d37a",
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setDepth(25)
        .setVisible(false);
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

    // Indicador de estabilidad dimensional junto al portal (estética pixel art / fantasía)
    const stabilityBox = this.add
      .rectangle(this.portalX, this.portalY + 80, 174, 34, 0x09140f, 0.92)
      .setStrokeStyle(2, 0xd4a24c)
      .setDepth(19);
    this.stabilityBadgeText = this.add
      .text(stabilityBox.x, stabilityBox.y, `Estabilidad: ${STABILITY_PROBABILITY}`, {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "12px",
        color: "#f6d37a",
      })
      .setOrigin(0.5)
      .setDepth(20);

    // Repartidor controlable (inicia sin alitas)
    this.player = new PlayerController(this, 155, height / 2 + 12, state.wingsEquipped);
    this.physics.add.collider(this.player.sprite, this.obstacles);

    // Zona de detección del portal
    this.portalZone = this.add.zone(this.portalX, this.portalY + 10, 72, 72);
    this.physics.world.enable(this.portalZone, Phaser.Physics.Arcade.STATIC_BODY);

    this.physics.add.overlap(this.player.sprite, this.portalZone, () => {
      this.handlePortalCollision();
    });

    // Tecla E para recoger y equipar/quitar alitas
    this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Sincronizar con UI externa
    this.syncPortalVisuals();
    this.player.setMovementLocked(uiBridge.isModalOpen());

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

  handleWingsInteraction() {
    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");
    if (uiBridge.isModalOpen() || this.transitioning) return;

    // Caso 1: Todavía no fueron recogidas -> solo recoger si está suficientemente cerca
    if (!state.wingsCollected) {
      if (!this.wingsPickup) return;
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        this.wingsX,
        this.wingsY
      );
      if (dist <= 75) {
        collectWings(state);
        this.wingsPickup.destroy();
        this.wingsPickup = null;
        if (this.wingsPrompt) {
          this.wingsPrompt.destroy();
          this.wingsPrompt = null;
        }

        const burst = this.add.particles(this.wingsX, this.wingsY, "sparkle", {
          speed: { min: 30, max: 85 },
          scale: { start: 1.8, end: 0 },
          lifespan: 450,
          quantity: 12,
          emitting: false,
        });
        burst.setDepth(20);
        burst.explode(12);
        this.time.delayedCall(500, () => burst.destroy());

        uiBridge.onWingsUpdated();
        uiBridge.showToast("¡Encontraste las alitas de cotillón! Presioná E para equiparlas.", "success");
      }
      return;
    }

    // Caso 2: Ya están en el inventario -> equipar o quitar con E
    const result = toggleWings(state);
    if (result.changed) {
      this.player.setWingsEquipped(result.equipped, result.equipped);
      this.syncPortalVisuals();
      uiBridge.onWingsUpdated();
      uiBridge.showToast(
        result.equipped
          ? "Alitas equipadas en tu espalda. ¡Lucen geniales!"
          : "Te quitaste las alitas y las guardaste en la mochila.",
        result.equipped ? "success" : "info"
      );
    }
  }

  handlePortalCollision() {
    if (this.transitioning) return;

    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");
    const access = evaluatePortalAccess(state);

    if (!access.allowed) {
      const now = this.time.now;
      this.player.sprite.x -= 28;
      if (now - this.lastBlockFeedbackAt > 600) {
        this.lastBlockFeedbackAt = now;
        uiBridge.openRejectionModal(access);
      }
      return;
    }

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

    const state = this.registry.get("missionState");
    const uiBridge = this.registry.get("uiBridge");

    // Proximidad al objeto de alitas en el suelo
    if (!state.wingsCollected && this.wingsPickup && this.wingsPrompt) {
      const dist = Phaser.Math.Distance.Between(
        this.player.sprite.x,
        this.player.sprite.y,
        this.wingsX,
        this.wingsY
      );
      this.wingsPrompt.setVisible(dist <= 75 && !uiBridge.isModalOpen());
    }

    if (Phaser.Input.Keyboard.JustDown(this.eKey)) {
      this.handleWingsInteraction();
    }
  }
}
