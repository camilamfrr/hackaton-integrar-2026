/**
 * Sistema liviano de partículas mágicas flotantes (polvo de estrellas y luciérnagas).
 * Respeta prefers-reduced-motion y escala según el viewport.
 */

export function initMagicParticles(canvas) {
  if (!canvas) return () => {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let animationFrameId = null;
  let particles = [];

  const PARTICLE_COLORS = [
    "rgba(246, 211, 122, 0.78)", // Dorado cálido
    "rgba(201, 137, 134, 0.65)", // Rosa empolvado
    "rgba(125, 226, 184, 0.6)",  // Esmeralda feérico
  ];

  function createParticles(count) {
    return Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.1 + Math.random() * 2.1,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.15 - Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
    }));
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targetCount = Math.min(48, Math.max(20, Math.floor((width * height) / 32000)));
    particles = createParticles(targetCount);
  }

  function drawFrame(animate) {
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      if (animate) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.025;

        if (p.y < -12) p.y = height + 12;
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;
      }

      const twinkle = 0.55 + 0.45 * Math.sin(p.phase);
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  function loop() {
    if (motionQuery.matches) {
      drawFrame(false);
      return;
    }
    drawFrame(true);
    animationFrameId = window.requestAnimationFrame(loop);
  }

  function start() {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    resize();
    loop();
  }

  window.addEventListener("resize", start);
  motionQuery.addEventListener("change", start);
  start();

  return () => {
    if (animationFrameId !== null) {
      window.cancelAnimationFrame(animationFrameId);
    }
    window.removeEventListener("resize", start);
    motionQuery.removeEventListener("change", start);
  };
}
