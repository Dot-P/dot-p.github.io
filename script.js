const canvas = document.querySelector(".vision-field");
const ctx = canvas.getContext("2d");
const rollingRobot = document.querySelector(".rolling-robot");
const heroRobot = document.querySelector(".robot-showcase");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0.5, y: 0.5 };
let scrollTicking = false;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(110, Math.max(54, Math.floor(width / 13)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 0.8 + 0.2,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
  }));
}

function drawField() {
  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;

  particles.forEach((point, index) => {
    const dx = (pointer.x - 0.5) * point.z * 1.4;
    const dy = (pointer.y - 0.5) * point.z * 1.4;
    point.x += point.vx + dx;
    point.y += point.vy + dy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;

    for (let j = index + 1; j < particles.length; j += 1) {
      const other = particles[j];
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 105) {
        ctx.strokeStyle = `rgba(78, 231, 198, ${0.16 * (1 - distance / 105)})`;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = point.z > 0.58 ? "rgba(244, 198, 93, 0.72)" : "rgba(103, 168, 255, 0.62)";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.2 + point.z * 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  requestAnimationFrame(drawField);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -50% 0px", threshold: 0.01 }
);

sections.forEach((section) => navObserver.observe(section));

window.addEventListener("mousemove", (event) => {
  pointer = {
    x: event.clientX / Math.max(width, 1),
    y: event.clientY / Math.max(height, 1),
  };
});

function updateRobotMotion() {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const progress = window.scrollY / maxScroll;
  const angle = progress * Math.PI * 2.4 - Math.PI / 2;
  const depth = Math.sin(angle);
  const horizontal = Math.cos(angle);
  const heroX = horizontal * Math.min(width * 0.15, 88);
  const heroY = depth * Math.min(height * 0.08, 46);
  const heroScale = 0.82 + ((depth + 1) / 2) * 0.34;
  const heroYaw = horizontal * -22;
  const orbitX = horizontal * Math.min(width * 0.32, 260);
  const orbitY = depth * Math.min(height * 0.18, 130);
  const orbitScale = 0.58 + ((depth + 1) / 2) * 0.42;
  const orbitYaw = horizontal * -28;

  if (rollingRobot) {
    rollingRobot.style.setProperty("--rolling-opacity", window.scrollY > 90 ? "1" : "0");
    rollingRobot.style.setProperty("--rolling-orbit-x", `${orbitX}px`);
    rollingRobot.style.setProperty("--rolling-orbit-y", `${orbitY}px`);
    rollingRobot.style.setProperty("--rolling-orbit-scale", orbitScale.toFixed(3));
    rollingRobot.style.setProperty("--rolling-orbit-yaw", `${orbitYaw.toFixed(2)}deg`);
    rollingRobot.style.zIndex = depth > 0 ? "18" : "3";
  }

  if (heroRobot) {
    heroRobot.style.setProperty("--hero-orbit-x", `${heroX}px`);
    heroRobot.style.setProperty("--hero-orbit-y", `${heroY}px`);
    heroRobot.style.setProperty("--hero-orbit-scale", heroScale.toFixed(3));
    heroRobot.style.setProperty("--hero-orbit-yaw", `${heroYaw.toFixed(2)}deg`);
    heroRobot.style.setProperty("--hero-orbit-z", depth > 0 ? "2" : "0");
  }

  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(updateRobotMotion);
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateRobotMotion();
drawField();
