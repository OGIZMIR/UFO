(function () {
  'use strict';

  const canvas = document.getElementById('game');
  const menu = document.getElementById('message');
  const hud = document.getElementById('hud');

  const crosshair = document.createElement('div');
  crosshair.id = 'customCrosshair';
  crosshair.innerHTML = `
    <span class="crosshairLine crosshairLineTop"></span>
    <span class="crosshairLine crosshairLineRight"></span>
    <span class="crosshairLine crosshairLineBottom"></span>
    <span class="crosshairLine crosshairLineLeft"></span>
    <span class="crosshairDot"></span>
  `;
  document.body.appendChild(crosshair);

  const style = document.createElement('style');
  style.textContent = `
    #customCrosshair {
      position: fixed;
      left: 50%;
      top: 50%;
      width: 42px;
      height: 42px;
      display: none;
      pointer-events: none;
      z-index: 999999;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(127, 239, 255, 0.95);
      border-radius: 50%;
      box-shadow:
        0 0 8px rgba(0, 217, 255, 0.95),
        inset 0 0 5px rgba(0, 217, 255, 0.45);
    }

    #customCrosshair .crosshairLine {
      position: absolute;
      display: block;
      background: #c9fbff;
      box-shadow: 0 0 6px #00d9ff;
    }

    #customCrosshair .crosshairLineTop {
      left: 50%;
      top: -9px;
      width: 2px;
      height: 14px;
      transform: translateX(-50%);
    }

    #customCrosshair .crosshairLineRight {
      right: -9px;
      top: 50%;
      width: 14px;
      height: 2px;
      transform: translateY(-50%);
    }

    #customCrosshair .crosshairLineBottom {
      left: 50%;
      bottom: -9px;
      width: 2px;
      height: 14px;
      transform: translateX(-50%);
    }

    #customCrosshair .crosshairLineLeft {
      left: -9px;
      top: 50%;
      width: 14px;
      height: 2px;
      transform: translateY(-50%);
    }

    #customCrosshair .crosshairDot {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 5px;
      height: 5px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: #ff3737;
      box-shadow: 0 0 7px #ff0000;
    }

    body.gameAimMode,
    body.gameAimMode canvas {
      cursor: none !important;
    }

    body.hudPointerMode,
    body.hudPointerMode canvas,
    body.hudPointerMode #hud,
    body.hudPointerMode #hud * {
      cursor: default !important;
    }

    body.hudPointerMode #pause,
    body.hudPointerMode #quit {
      cursor: pointer !important;
    }

    #hud,
    #hud * {
      position: relative;
      z-index: 1000000;
    }
  `;
  document.head.appendChild(style);

  function gameIsRunning() {
    return menu && getComputedStyle(menu).display === 'none';
  }

  function isInHudZone(clientX, clientY) {
    if (!hud) return false;

    const rect = hud.getBoundingClientRect();
    const safety = 12;

    return (
      clientX >= rect.left - safety &&
      clientX <= rect.right + safety &&
      clientY >= rect.top - safety &&
      clientY <= rect.bottom + safety
    );
  }

  function setHudMode() {
    crosshair.style.display = 'none';
    document.body.classList.remove('gameAimMode');
    document.body.classList.add('hudPointerMode');

    if (canvas) {
      canvas.style.cursor = 'default';
    }
  }

  function setMenuMode() {
    crosshair.style.display = 'none';
    document.body.classList.remove('gameAimMode');
    document.body.classList.remove('hudPointerMode');

    if (canvas) {
      canvas.style.cursor = 'default';
    }

    document.body.style.cursor = 'default';
  }

  function setAimMode(clientX, clientY) {
    crosshair.style.left = clientX + 'px';
    crosshair.style.top = clientY + 'px';
    crosshair.style.display = 'block';

    document.body.classList.remove('hudPointerMode');
    document.body.classList.add('gameAimMode');

    document.body.style.cursor = 'none';

    if (canvas) {
      canvas.style.cursor = 'none';
    }
  }

  function updatePointer(event) {
    if (!gameIsRunning()) {
      setMenuMode();
      return;
    }

    if (isInHudZone(event.clientX, event.clientY)) {
      setHudMode();
      return;
    }

    setAimMode(event.clientX, event.clientY);
  }

  document.addEventListener('pointermove', updatePointer, true);
  document.addEventListener('mousemove', updatePointer, true);

  if (hud) {
    hud.addEventListener('pointerenter', setHudMode, true);
    hud.addEventListener('mouseenter', setHudMode, true);

    hud.querySelectorAll('button').forEach(function (button) {
      button.addEventListener('pointerenter', setHudMode, true);
      button.addEventListener('mouseenter', setHudMode, true);
      button.addEventListener('focus', setHudMode, true);
    });
  }

  if (menu) {
    new MutationObserver(function () {
      if (!gameIsRunning()) {
        setMenuMode();
      }
    }).observe(menu, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  window.addEventListener('blur', function () {
    crosshair.style.display = 'none';
  });

  document.addEventListener('mouseleave', function () {
    crosshair.style.display = 'none';
  });

  setMenuMode();
})();
