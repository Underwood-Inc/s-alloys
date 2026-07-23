import './styles/main.scss';
import './atoms/asset-image/assetImage.js';
import { preloadAssetManifest } from './lib/assetUrl.js';
import { ensureTooltipPointerTracking } from './molecules/viewport-tooltip/tooltipPointerDismiss.js';
import './organisms/ambient-background/ambient-background.js';
import './organisms/game-tooltip-host/game-tooltip-host.js';
import { ensureGameTooltipHost } from './organisms/game-tooltip-host/game-tooltip-host.js';
import './app/alloys-app.js';

void preloadAssetManifest();
ensureTooltipPointerTracking();

function mountAmbientBackground() {
  if (document.querySelector('alloys-ambient-background')) return;
  const ambient = document.createElement('alloys-ambient-background');
  document.body.prepend(ambient);
}

mountAmbientBackground();
ensureGameTooltipHost();
