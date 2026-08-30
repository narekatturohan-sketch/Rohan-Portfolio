const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ---- Interactive Python-symbol particle field ----
(() => {
  const canvas = document.getElementById("python-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let width, height, dpr;
  let particles = [];
  let mouse = { x: -9999, y: -9999 };

  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#c8ff39";

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildParticles();
  }

  // Two intertwined sine curves, evoking the Python logo's two linked
  // shapes, as anchor paths for the particles to loosely orbit.
  function curveY(x, phase, ampRatio) {
    const amp = height * ampRatio;
    const freq = (Math.PI * 2.4) / width;
    return height / 2 + Math.sin(x * freq + phase) * amp;
  }

  function buildParticles() {
    particles = [];
    const isSmall = width < 700;
    const spacing = isSmall ? 42 : 30;
    const count = Math.floor(width / spacing);

    for (let i = 0; i < count; i++) {
      const x = (i / count) * width;
      [
        { phase: 0, ampRatio: 0.16, curve: 0 },
        { phase: Math.PI, ampRatio: 0.16, curve: 1 },
      ].forEach(({ phase, ampRatio, curve }) => {
        const y = curveY(x, phase, ampRatio);
        particles.push({
          baseX: x,
          baseY: y,
          x, y,
          curve,
          driftSeed: Math.random() * Math.PI * 2,
          r: curve === 0 ? 2.6 : 2,
        });
      });
    }
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    // connecting lines along each curve
    [0, 1].forEach((curveIdx) => {
      const pts = particles.filter((p) => p.curve === curveIdx);
      ctx.beginPath();
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = curveIdx === 0 ? "rgba(200,255,57,0.22)" : "rgba(17,17,17,0.10)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    particles.forEach((p) => {
      const drift = Math.sin(time / 1800 + p.driftSeed) * 6;
      let targetX = p.baseX;
      let targetY = p.baseY + drift;

      const dx = targetX - mouse.x;
      const dy = targetY - mouse.y;
      const dist = Math.hypot(dx, dy);
      const repelRadius = 90;
      if (dist < repelRadius) {
        const force = (repelRadius - dist) / repelRadius;
        targetX += (dx / (dist || 1)) * force * 26;
        targetY += (dy / (dist || 1)) * force * 26;
      }

      p.x += (targetX - p.x) * 0.12;
      p.y += (targetY - p.y) * 0.12;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.curve === 0 ? accent : "rgba(17,17,17,0.55)";
      ctx.fill();
    });

    if (!prefersReducedMotion) requestAnimationFrame(draw);
  }

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener("mouseleave", () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener("resize", resize);
  resize();

  if (prefersReducedMotion) {
    draw(0);
  } else {
    requestAnimationFrame(draw);
  }
})();

document.addEventListener("mousedown", (e) => {
  if (e.detail > 1) e.preventDefault();
});

const menu = document.querySelector(".menu");
const nav = document.querySelector(".nav nav");
menu?.addEventListener("click", () => {
  const open = nav.style.display === "flex";
  nav.style.display = open ? "" : "flex";
  if (!open) {
    nav.style.position = "absolute";
    nav.style.top = "76px";
    nav.style.left = "0";
    nav.style.right = "0";
    nav.style.padding = "20px 24px";
    nav.style.background = "var(--bg)";
    nav.style.flexDirection = "column";
    nav.style.gap = "16px";
  }
});