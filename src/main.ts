import './styles/main.scss';
import './organisms/ambient-background/ambient-background.js';
import './organisms/game-tooltip-host/game-tooltip-host.js';
import { ensureGameTooltipHost } from './organisms/game-tooltip-host/game-tooltip-host.js';
import './app/alloys-app.js';

function mountAmbientBackground() {
  if (document.querySelector('alloys-ambient-background')) return;
  const ambient = document.createElement('alloys-ambient-background');
  document.body.prepend(ambient);
}

mountAmbientBackground();
ensureGameTooltipHost();
