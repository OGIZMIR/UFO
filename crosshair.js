const crosshair = document.createElement('div');

crosshair.style.position = 'fixed';
crosshair.style.width = '70px';
crosshair.style.height = '70px';
crosshair.style.border = '3px solid #7fefff';
crosshair.style.borderRadius = '50%';
crosshair.style.pointerEvents = 'none';
crosshair.style.zIndex = '999999';
crosshair.style.boxShadow = '0 0 20px #00d9ff, inset 0 0 15px #00d9ff';
crosshair.style.transform = 'translate(-50%, -50%)';

document.body.appendChild(crosshair);

document.addEventListener('mousemove', (e) => {
  crosshair.style.left = e.clientX + 'px';
  crosshair.style.top = e.clientY + 'px';
});
