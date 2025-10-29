/* =========================================
   3D Dice Module — Dual Dice (Green + Red)
   - maps numeric result -> cube rotation
   - keeps random extra spins for realism
   - exposes init(container) and rollBoth()
   ========================================= */
const Dice3D = (function () {
  let greenDie = null, redDie = null; // objects { wrapper, cube }
  let onRollDoneCallback = null;

  function init(container) {
    if (!container) {
      console.error("Dice3D.init: container not found");
      return;
    }

    const root = document.createElement("div");
    root.id = "dice3d-container";
root.style.position = "absolute";
root.style.top = "50%";
root.style.left = "20px";
root.style.transform = "translateY(-50%)";
root.style.display = "flex";
root.style.flexDirection = "column";
root.style.alignItems = "center";
root.style.gap = "16px";
root.style.zIndex = "6000"; // يعلو فوق كل شيء آخر
    container.appendChild(root);

    greenDie = createDie("green");
    redDie = createDie("red");

    root.appendChild(greenDie.wrapper);
    root.appendChild(redDie.wrapper);

    // small accessible numeric readout (for screen readers)
    const sr = document.createElement("div");
    sr.style.position = "absolute";
    sr.style.left = "-9999px";
    sr.setAttribute("aria-hidden", "true");
    root.appendChild(sr);

    // make sure wrapper sizes are consistent via CSS (styles added separately)
    console.log("🎲 Dice3D initialized");
	  // 🌀 تحديث الزهر تلقائيًا عند تغيير حجم الشاشة
  window.addEventListener("resize", () => {
    const parent = document.getElementById("dice3d-container");
    if (!parent) return;

    // امسح الزهر القديم
    parent.innerHTML = "";

    // أعد إنشاء النردين
    greenDie = createDie("green");
    redDie = createDie("red");
    parent.appendChild(greenDie.wrapper);
    parent.appendChild(redDie.wrapper);
  });
  }

// === REPLACE: function createDie(color) { ... } ===
function createDie(color) {
  const wrapper = document.createElement("div");
  wrapper.className = "dice3d-wrapper";

  // ✅ حجم النرد يعتمد على عرض الخريطة وليس عرض الشاشة فقط
  const mapEl = document.querySelector(".map");
  const mapWidth = mapEl ? mapEl.getBoundingClientRect().width : window.innerWidth;
  const diceSize = Math.round(Math.max(26, Math.min(88, mapWidth * 0.08)));

  wrapper.style.width = `${diceSize}px`;
  wrapper.style.height = `${diceSize}px`;
  wrapper.style.perspective = `${Math.max(400, diceSize * 8)}px`;
  wrapper.style.position = "relative";
  wrapper.style.userSelect = "none";

  const cube = document.createElement("div");
  cube.className = "dice3d-cube";
  cube.style.width = "100%";
  cube.style.height = "100%";
  cube.style.position = "absolute";
  cube.style.transformStyle = "preserve-3d";
  cube.style.transition = "transform 1.2s cubic-bezier(.2,.9,.2,1)";
  cube.style.transform = "rotateX(0deg) rotateY(0deg)";

  // ✅ تدرج لوني بدل اللون الفلات، بدون خطوط أو ظلال
  const baseColor =
    color === "green"
      ? "radial-gradient(circle at 30% 30%, #7cff86, #008f28)"
      : "radial-gradient(circle at 30% 30%, #ff8888, #a00000)";
  const half = Math.round(diceSize / 2);

  // ✅ حجم النقطة الديناميكي: يتراوح 2–8px حسب الحجم
  const dotSize = Math.max(2, Math.min(8, Math.round(diceSize * 0.10)));
  const dotOffset = Math.round(dotSize / 2);

  for (let i = 1; i <= 6; i++) {
    const face = document.createElement("div");
    face.className = "dice3d-face";
    face.style.background = baseColor;
    face.style.border = "none";             // 🔥 لا حدود
    face.style.boxShadow = "none";          // 🔥 لا ظل
    face.style.width = "100%";
    face.style.height = "100%";
    face.style.position = "absolute";
    face.style.display = "block";
    face.style.borderRadius = Math.max(4, Math.round(diceSize * 0.12)) + "px";
    face.style.boxSizing = "border-box";

    switch (i) {
      case 1: face.style.transform = `rotateY(0deg) translateZ(${half}px)`; break;
      case 2: face.style.transform = `rotateY(180deg) translateZ(${half}px)`; break;
      case 3: face.style.transform = `rotateY(90deg) translateZ(${half}px)`; break;
      case 4: face.style.transform = `rotateY(-90deg) translateZ(${half}px)`; break;
      case 5: face.style.transform = `rotateX(90deg) translateZ(${half}px)`; break;
      case 6: face.style.transform = `rotateX(-90deg) translateZ(${half}px)`; break;
    }

    // ✅ نقاط النرد (صغيرة وواضحة)
    const dots = getDotsForSide(i);
    dots.forEach(([x, y]) => {
      const dot = document.createElement("div");
      dot.className = "dice3d-dot";
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.borderRadius = "50%";
      dot.style.background = "#fff";
      dot.style.position = "absolute";
      dot.style.left = `calc(${x}% - ${dotOffset}px)`;
      dot.style.top = `calc(${y}% - ${dotOffset}px)`;
      dot.style.boxShadow = "0 0 1px rgba(0,0,0,0.2)";
      face.appendChild(dot);
    });

    cube.appendChild(face);
  }

  wrapper.appendChild(cube);
  wrapper._diceSize = diceSize;
  return { wrapper, cube };
}

  function getDotsForSide(num) {
    const center = [[50, 50]];
    const diagTLBR = [[28, 28], [72, 72]];
    const diagTRBL = [[72, 28], [28, 72]];
    const fourCorners = [[28, 28], [72, 28], [28, 72], [72, 72]];
    const sixDots = [
      [28, 20], [72, 20],
      [28, 50], [72, 50],
      [28, 80], [72, 80]
    ];
    switch (num) {
      case 1: return center;
      case 2: return diagTLBR;
      case 3: return [...diagTLBR, [50, 50]];
      case 4: return fourCorners;
      case 5: return [...fourCorners, [50, 50]];
      case 6: return sixDots;
      default: return [];
    }
  }

  // mapping of desired face → rotation (X, Y)
  // These rotations make the corresponding face point outward (face 1 at front, etc).
  const faceRotations = {
    1: { x: 0, y: 0 },     // front
    2: { x: 0, y: 180 },   // back
    3: { x: 0, y: -90 },   // left
    4: { x: 0, y: 90 },    // right
    5: { x: -90, y: 0 },   // top
    6: { x: 90, y: 0 }     // bottom
  };

  function _applyRotation(cube, faceNumber) {
    const rot = faceRotations[faceNumber] || { x: 0, y: 0 };
    // add a couple of full spins for realism
    const extraX = 360 * (Math.floor(Math.random() * 3) + 1);
    const extraY = 360 * (Math.floor(Math.random() * 3) + 1);
    const tx = rot.x + extraX;
    const ty = rot.y + extraY;
    cube.style.transform = `rotateX(${tx}deg) rotateY(${ty}deg)`;
  }

  // rollBoth: apply animation and return numeric results
  function rollBoth() {
    const greenRoll = Math.floor(Math.random() * 6) + 1;
    const redRoll = Math.floor(Math.random() * 6) + 1;

    if (greenDie && greenDie.cube) _applyRotation(greenDie.cube, greenRoll);
    if (redDie && redDie.cube) _applyRotation(redDie.cube, redRoll);

    // If a callback is registered, call it after animation duration (1.2s)
    if (onRollDoneCallback) {
      try { setTimeout(() => onRollDoneCallback({ green: greenRoll, red: redRoll }), 1300); } catch(e) {}
    }

    return { green: greenRoll, red: redRoll };
  }

  // optionally register a callback called when the visual spin finishes
  function onRollDone(cb) { onRollDoneCallback = cb; }

  return { init, rollBoth, onRollDone };
})();