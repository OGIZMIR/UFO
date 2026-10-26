(function () {
  const canvas = document.getElementById('game');
  const menu = document.getElementById('message');

  const crosshair = document.createElement('div');
  crosshair.id = 'customCrosshair';

  const horizontal = document.createElement('span');
  horizontal.className = 'crosshairHorizontal';

  const vertical = document.createElement('span');
  vertical.className = 'crosshairVertical';

  const dot = document.createElement('span');
  dot.className = 'crosshairDot';

  crosshair.appendChild(horizontal);
  crosshair.appendChild(vertical);
  crosshair.appendChild(dot);
  document.body.appendChild(crosshair);

  const style = document.createElement('style');
  style.textContent = `
    #customCrosshair {
      position: fixed;
      left: 50%;
      top: 50%;
      width: 46px;
      height: 46px;
      display: none;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(127, 239, 255, 0.95);
      border-radius: 50%;
      box-shadow:
        0 0 8px rgba(0, 217, 255, 0.95),
        inset 0 0 6px rgba(0, 217, 255, 0.55);
    }

    #customCrosshair::before,
    #customCrosshair::after {
      content: "";
      position: absolute;
      background: #b9f8ff;
      box-shadow: 0 0 7px #00d9ff;
    }

    #customCrosshair::before {
      left: 50%;
      top: -8px;
      width: 2px;
      height: 62px;
      transform: translateX(-50%);
    }

    #customCrosshair::after {
      left: -8px;
      top: 50%;
      width: 62px;
      height: 2px;
      transform: translateY(-50%);
    }

    #customCrosshair .crosshairHorizontal {
      position: absolute;
      left: 8px;
      right: 8px;
      top: 50%;
      height: 6px;
      transform: translateY(-50%);
      background: #01030c;
      z-index: 1;
    }

    #customCrosshair .crosshairVertical {
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: 50%;
      width: 6px;
      transform: translateX(-50%);
      background: #01030c;
      z-index: 1;
    }

    #customCrosshair .crosshairDot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 5px;
      height: 5px;
      z-index: 2;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #ff3b3b;
      box-shadow: 0 0 8px #ff0000;
    }
  `;
  document.head.appendChild(style);

  function gameIsRunning() {
    return menu && getComputedStyle(menu).display === 'none';
  }

  function updateMode() {
    const playing = gameIsRunning();

    crosshair.style.display = playing ? 'block' : 'none';

    if (canvas) {
      canvas.style.cursor = playing ? 'none' : 'default';
    }

    document.body.style.cursor = playing ? 'none' : 'default';
  }

  document.addEventListener('pointermove', function (event) {
    updateMode();

    if (!gameIsRunning()) {
      return;
    }

    crosshair.style.left = event.clientX + 'px';
    crosshair.style.top = event.clientY + 'px';
  });

  document.addEventListener('pointerdown', updateMode);

  if (menu) {
    new MutationObserver(updateMode).observe(menu, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  window.setInterval(updateMode, 250);
  updateMode();
})();

const hud = document.getElementById('hud');

if (hud) {
  hud.addEventListener('mouseenter', () => {
    if (crosshair) crosshair.style.display = 'none';
    document.body.style.cursor = 'default';
  });

  hud.addEventListener('mouseleave', () => {
    const menu = document.getElementById('message');

    if (menu && getComputedStyle(menu).display === 'none') {
      if (crosshair) crosshair.style.display = 'block';
      document.body.style.cursor = 'none';
    }
  });
}

document.querySelectorAll('button').forEach(btn => {

  btn.addEventListener('mouseenter', () => {
    const c = document.getElementById('customCrosshair');
    if (c) c.style.display = 'none';
    document.body.style.cursor = 'default';
  });

  btn.addEventListener('mouseleave', () => {
    const c = document.getElementById('customCrosshair');
    const menu = document.getElementById('message');

    if (
      c &&
      menu &&
      getComputedStyle(menu).display === 'none'
    ) {
      c.style.display = 'block';
      document.body.style.cursor = 'none';
    }
  });

});
