/**
 * Controlador del personaje repartidor (movimiento top-down, Flechas/WASD,
 * normalización diagonal, animaciones, mochila PedidosYa y alitas equipables).
 */

export class PlayerController {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {boolean} wingsEquipped
   */
  constructor(scene, x, y, wingsEquipped = false) {
    this.scene = scene;
    this.speed = 185;
    this.movementLocked = false;
    this.isFern = false;
    this.facing = "down";

    // Sprite 32x32 escalado x2 = 64x64px
    this.sprite = scene.physics.add.sprite(x, y, "player", 0);
    this.sprite.setScale(2);
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);

    // Hitbox compacta en los pies para colisiones naturales en top-down
    this.sprite.body.setSize(18, 12);
    this.sprite.body.setOffset(7, 19);

    // Overlay de alitas de cotillón (siempre detrás del cuerpo/mochila para no tapar PedidosYa)
    this.wings = scene.add.sprite(x, y - 2, "wings", 0);
    this.wings.setScale(2);
    this.wings.setDepth(9);
    this.wings.play("wings-flap");
    this.setWingsEquipped(wingsEquipped, false);

    // Controles: Flechas + WASD
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  setWingsEquipped(equipped, playBurst = false) {
    this.wings.setVisible(Boolean(equipped));
    if (playBurst) {
      this.scene.tweens.add({
        targets: [this.sprite, this.wings],
        scaleX: 2.22,
        scaleY: 2.22,
        duration: 130,
        yoyo: true,
        ease: "Quad.easeOut",
      });

      const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, "sparkle", {
        speed: { min: 40, max: 95 },
        scale: { start: 1.8, end: 0 },
        lifespan: 400,
        quantity: 12,
        emitting: false,
      });
      particles.setDepth(20);
      particles.explode(12);
      this.scene.time.delayedCall(450, () => particles.destroy());
    }
  }

  setMovementLocked(locked) {
    this.movementLocked = Boolean(locked);
    if (this.movementLocked) {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.stop();
    }
  }

  /**
   * Transforma visualmente al repartidor en un helecho o restaura su forma humana.
   */
  setFernForm(isFern, wingsEquipped = false) {
    this.isFern = Boolean(isFern);
    if (this.isFern) {
      this.sprite.anims.stop();
      this.sprite.setTexture("fern");
      this.wings.setVisible(false);

      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 2.35,
        scaleY: 2.35,
        duration: 140,
        yoyo: true,
        ease: "Quad.easeOut",
      });

      const burst = this.scene.add.particles(this.sprite.x, this.sprite.y, "sparkle", {
        speed: { min: 35, max: 95 },
        scale: { start: 2, end: 0 },
        lifespan: 450,
        quantity: 14,
        emitting: false,
      });
      burst.setDepth(20);
      burst.explode(14);
      this.scene.time.delayedCall(500, () => burst.destroy());
      return;
    }

    const frameByFacing = { down: 0, up: 2, left: 4, right: 6 };
    this.sprite.setTexture("player", frameByFacing[this.facing] ?? 0);
    this.wings.setVisible(Boolean(wingsEquipped));
  }

  update() {
    // Las alitas se mantienen detrás del repartidor (depth 9 < 10) para no tapar la mochila PedidosYa
    this.wings.setPosition(this.sprite.x, this.sprite.y - 2);
    this.wings.setDepth(9);

    if (this.movementLocked) {
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

    if (vx !== 0 && vy !== 0) {
      const invSqrt2 = Math.SQRT1_2;
      vx *= invSqrt2;
      vy *= invSqrt2;
    }

    this.sprite.setVelocity(vx * this.speed, vy * this.speed);

    if (vx === 0 && vy === 0) {
      this.sprite.anims.stop();
      return;
    }

    if (Math.abs(vx) > Math.abs(vy)) {
      this.facing = vx < 0 ? "left" : "right";
    } else {
      this.facing = vy < 0 ? "up" : "down";
    }

    this.sprite.anims.play(`player-${this.facing}`, true);
  }
}
