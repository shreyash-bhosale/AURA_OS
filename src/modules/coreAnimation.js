/**
 * AURA Core — Central Intelligence Visualization
 * Sophisticated HTML5 Canvas 2D engine with 3D perspective projection,
 * orbiting luminous rings, translucent layered core, flowing neural particles,
 * and mouse-tracking parallax.
 */

export function initAuraCore() {
  const canvas = document.getElementById('aura-core-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let animationFrameId;

  // State
  let time = 0;
  let speed = 1.0;
  let pulseIntensity = 1.0;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let isHovered = false;

  // Particle and Node configurations
  const NUM_NODES = 36;
  const nodes = [];
  const rings = [
    { radius: 110, tiltX: 0.65, tiltZ: 0.35, speed: 0.8, color: 'rgba(99, 102, 241, 0.45)' },
    { radius: 155, tiltX: -0.45, tiltZ: 0.75, speed: -0.6, color: 'rgba(56, 189, 248, 0.4)' },
    { radius: 200, tiltX: 0.85, tiltZ: -0.25, speed: 0.4, color: 'rgba(168, 85, 247, 0.35)' }
  ];

  // Initialize Nodes in 3D sphere distribution
  for (let i = 0; i < NUM_NODES; i++) {
    const phi = Math.acos(-1 + (2 * i) / NUM_NODES);
    const theta = Math.sqrt(NUM_NODES * Math.PI) * phi;
    const r = 120 + Math.random() * 60;

    nodes.push({
      x: r * Math.cos(theta) * Math.sin(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(phi),
      baseR: r,
      size: 1.8 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      orbitSpeed: (0.4 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1)
    });
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  // Mouse Parallax
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      isHovered = true;
      mouse.targetX = ((e.clientX - rect.left) / width - 0.5) * 1.2;
      mouse.targetY = ((e.clientY - rect.top) / height - 0.5) * 1.2;
    } else {
      isHovered = false;
      mouse.targetX = 0;
      mouse.targetY = 0;
    }
  });

  // Interactive HUD Buttons
  const btnPulse = document.getElementById('core-btn-pulse');
  const btnSpeed = document.getElementById('core-btn-speed');

  if (btnPulse) {
    btnPulse.addEventListener('click', () => {
      pulseIntensity = pulseIntensity === 1.0 ? 1.8 : 1.0;
      btnPulse.classList.toggle('active', pulseIntensity > 1.0);
    });
  }

  if (btnSpeed) {
    btnSpeed.addEventListener('click', () => {
      speed = speed === 1.0 ? 2.2 : 1.0;
      btnSpeed.classList.toggle('active', speed > 1.0);
      btnSpeed.textContent = speed > 1.0 ? 'Speed: 2x' : 'Speed: 1x';
    });
  }

  function render() {
    time += 0.015 * speed;

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const pulse = Math.sin(time * 2) * 0.12 * pulseIntensity;

    // 1. Draw Ambient Central Core Glow
    const coreGlow = ctx.createRadialGradient(
      centerX + mouse.x * 20,
      centerY + mouse.y * 20,
      10,
      centerX,
      centerY,
      170 * (1 + pulse)
    );
    coreGlow.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
    coreGlow.addColorStop(0.35, 'rgba(56, 189, 248, 0.20)');
    coreGlow.addColorStop(0.7, 'rgba(168, 85, 247, 0.08)');
    coreGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 180 * (1 + pulse), 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw Translucent Inner Glass Core Orb
    const innerOrbRadius = 48 * (1 + pulse * 0.5);
    const innerGradient = ctx.createRadialGradient(
      centerX - 12 + mouse.x * 15,
      centerY - 12 + mouse.y * 15,
      4,
      centerX,
      centerY,
      innerOrbRadius
    );
    innerGradient.addColorStop(0, '#FFFFFF');
    innerGradient.addColorStop(0.3, 'rgba(165, 180, 252, 0.9)');
    innerGradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.6)');
    innerGradient.addColorStop(1, 'rgba(56, 189, 248, 0.2)');

    ctx.save();
    ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
    ctx.shadowBlur = 24 * pulseIntensity;
    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerOrbRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Draw Orbiting Rings with 3D tilt
    rings.forEach((ring) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(ring.speed * time * 0.4 + mouse.x * 0.4);
      ctx.scale(1, ring.tiltX);

      ctx.beginPath();
      ctx.arc(0, 0, ring.radius * (1 + pulse * 0.2), 0, Math.PI * 2);
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Satellite particle traveling along each ring
      const satAngle = time * ring.speed * 2;
      const satX = Math.cos(satAngle) * ring.radius * (1 + pulse * 0.2);
      const satY = Math.sin(satAngle) * ring.radius * (1 + pulse * 0.2);

      ctx.beginPath();
      ctx.arc(satX, satY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = ring.color;
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.restore();
    });

    // 4. Update and Project 3D Connected Nodes
    const projected = [];
    const rotY = time * 0.5 + mouse.x * 0.8;
    const rotX = mouse.y * 0.8;

    nodes.forEach((node) => {
      // Rotation around Y axis
      let x1 = node.x * Math.cos(rotY) - node.z * Math.sin(rotY);
      let z1 = node.z * Math.cos(rotY) + node.x * Math.sin(rotY);

      // Rotation around X axis
      let y1 = node.y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = z1 * Math.cos(rotX) + node.y * Math.sin(rotX);

      // Perspective projection
      const cameraDistance = 380;
      const scale = cameraDistance / (cameraDistance + z2);
      const px = centerX + x1 * scale;
      const py = centerY + y1 * scale;
      const alpha = Math.max(0.15, Math.min(1, (z2 + 150) / 300));

      projected.push({ x: px, y: py, z: z2, scale, alpha, size: node.size * scale });
    });

    // Sort back to front for proper visual depth
    projected.sort((a, b) => a.z - b.z);

    // Draw Neural Links between nearby nodes
    ctx.lineWidth = 0.8;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].x - projected[j].x;
        const dy = projected[i].y - projected[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 64) {
          const lineAlpha = (1 - dist / 64) * 0.35 * projected[i].alpha;
          ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw Nodes
    projected.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 6;
      ctx.fill();
    });

    animationFrameId = requestAnimationFrame(render);
  }

  resize();
  window.addEventListener('resize', resize);
  animationFrameId = requestAnimationFrame(render);

  return () => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(animationFrameId);
  };
}
