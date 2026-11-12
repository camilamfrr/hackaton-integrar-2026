/**
 * Controlador del personaje repartidor (movimiento top-down, Flechas/WASD,
 * normalización diagonal, animaciones y alitas de cotillón equipables).
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
    this.facing = "down";

    this.sprite = scene.physics.add.sprite(x, y, "player", 0);
    this.sprite.setScale(3);
    this.sprite.setDepth(10);
    this.sprite.setCollideWorldBounds(true);

    // Hitbox compacta en los pies para colisiones naturales en top-down
    this.sprite.body.setSize(10, 8);
    this.sprite.body.setOffset(3, 8);

    // Overlay de alitas de cotillón
    this.wings = scene.add.sprite(x, y - 4, "wings", 0);
    this.wings.setScale(3);
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
    if (equipped && playBurst) {
      // Animación/destello al equipar alitas
      this.scene.tweens.add({
        targets: [this.sprite, this.wings],
        scaleX: 3.45,
        scaleY: 3.45,
        duration: 140,
        yoyo: true,
        ease: "Quad.easeOut",
      });

      const particles = this.scene.add.particles(this.sprite.x, this.sprite.y, "sparkle", {
        speed: { min: 45, max: 110 },
        scale: { start: 2.2, end: 0 },
        lifespan: 450,
        quantity: 14,
        emitting: false,
      });
      particles.setDepth(20);
      particles.explode(14);
      this.scene.time.delayedCall(500, () => particles.destroy());
    }
  }

  setMovementLocked(locked) {
    this.movementLocked = Boolean(locked);
    if (this.movementLocked) {
      this.sprite.setVelocity(0, 0);
      this.sprite.anims.stop();
    }
  }

  update() {
    // Sincronizar posición y profundidad de las alitas con el repartidor
    const wingYOffset = this.facing === "up" ? 2 : -4;
    this.wings.setPosition(this.sprite.x, this.sprite.y + wingYOffset);
    this.wings.setDepth(this.facing === "up" ? 11 : 9);

    if (this.movementLocked) {
      return;
    }

    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) vx -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) vx += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) vy -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) vy += 1;

    // Movimiento diagonal controlado (vector normalizado)
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
