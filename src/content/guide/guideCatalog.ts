import { ALLOY_CATALOG } from '../../molecules/recipe-catalog/index.js';

export interface GuideArticle {
  slug: string;
  title: string;
  summary: string;
  cardImage: string;
  body: string;
}

export function renderGuideHtml(body: string, baseUrl: string): string {
  return body
    .replaceAll('{{base}}', baseUrl)
    .replace('{{recipe-explorer}}', `<recipe-explorer asset-base="${baseUrl}"></recipe-explorer>`);
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'install',
    title: 'Install Alloys',
    summary: 'Get the datapack and required resource pack running on Minecraft 26.2.',
    cardImage: 'guide/chapters/install.png',
    body: `
      <p>Alloys ships as a <strong>datapack</strong> plus a <strong>required resource pack</strong> for Minecraft <strong>26.2</strong>. Install both, restart your world fully, then play.</p>
      <h2>Datapack</h2>
      <ol>
        <li>Download the latest Alloys datapack release.</li>
        <li>Copy the zip into your world's <code>datapacks/</code> folder.</li>
        <li>Rename it <code>Alloys.zip</code> so the folder name is clean inside the world.</li>
        <li><strong>Quit and reopen the world.</strong> A full restart registers recipes and functions — <code>/reload</code> alone is not enough.</li>
      </ol>
      <h2>Resource pack (required)</h2>
      <ol>
        <li>Download the Alloys resource pack from the same release.</li>
        <li>In the main menu, open <strong>Options → Resource Packs</strong> and move Alloys to the selected column.</li>
        <li>Alloy ingots, fragments, and gear need this pack for their correct textures and models.</li>
        <li>On a server, place the pack in <code>resourcepacks/</code> and set <code>resource-pack=</code> in <code>server.properties</code> (use <code>require-resource-pack=true</code> if you want to block joins without it).</li>
      </ol>
      <h2>In-game help</h2>
      <ul>
        <li>New players receive a written guidebook once.</li>
        <li>On Paper servers with the optional plugin: <code>/alloys guidebook</code> or <code>/alloys help</code> for a recipe browser.</li>
        <li>Datapack kit commands: <code>/function alloys:give/&lt;alloy&gt;</code> gives materials, an ingot, tools, and armor for that metal.</li>
      </ul>
    `,
  },
  {
    slug: 'alloys',
    title: 'The ten alloys',
    summary: 'How each metal is found, crafted, or mined — with every recipe.',
    cardImage: 'guide/chapters/alloys.png',
    body: `
      <p>Alloys adds ten metals from early Tin through endgame Astral. Each has a full toolset and armor set with tier-appropriate stats.</p>
      <h2>Recipe explorer</h2>
      <p>Pick an ingot, then browse ingot crafts, fragment combines, and every gear recipe — the same layouts as vanilla, with alloy ingots in place of iron or gold.</p>
      {{recipe-explorer}}
      <h2>Fragments</h2>
      <p>Four alloys can drop matching fragments while you break vanilla ore blocks. Nine fragments of the same type combine into one ingot in a crafting grid. Fragments cannot be smelted.</p>
      <ul>
        <li><strong>Cobalt</strong> — coal, copper, and lapis veins</li>
        <li><strong>Nickel</strong> — iron veins</li>
        <li><strong>Mythril</strong> — redstone and emerald veins</li>
        <li><strong>Adamantine</strong> — diamond ore and ancient debris</li>
      </ul>
      <p>Every fragment alloy also has a shaped crafting recipe using common overworld materials, so you are never hard-locked to RNG.</p>
    `,
  },
  {
    slug: 'crafting',
    title: 'Crafting alloy gear',
    summary: 'What to expect when you turn ingots into tools and armor.',
    cardImage: 'guide/chapters/crafting.png',
    body: `
      <p>Alloy gear uses the <strong>same crafting layouts as vanilla</strong> tools and armor. Swap metal ingots for alloy ingots in those patterns.</p>
      <h2>Happy path</h2>
      <ul>
        <li>Place real alloy ingots in a standard pickaxe, sword, helmet, or other gear pattern.</li>
        <li>The result should be named alloy gear with material bonuses — not a plain vanilla item.</li>
        <li>Ingot recipes are shapeless in a crafting grid. Astral uses a special shaped layout (diamonds around netherite scrap).</li>
      </ul>
      <p>See the <a href="{{base}}guide/alloys">alloy recipe explorer</a> for every layout with live icons.</p>
      <h2>What should not work</h2>
      <ul>
        <li>Plain lookalike items must <strong>not</strong> become alloy gear. If the game cannot verify real alloy ingots, ingredients should be returned instead of keeping a fraudulent result.</li>
        <li>Vanilla iron, gold, and netherite recipes are untouched — Alloys only adds its own recipes alongside them.</li>
      </ul>
      <h2>If something looks wrong</h2>
      <p>If a craft briefly shows an unfinished item, wait a moment. Valid crafts should finish with proper alloy gear; invalid ones should refund your materials. Note what you placed in the grid and file feedback through the <a href="{{base}}checklist">test checklist</a>.</p>
    `,
  },
  {
    slug: 'checklist',
    title: 'Using the test checklist',
    summary: 'Run structured playtests and share progress with your team.',
    cardImage: 'guide/chapters/checklist.png',
    body: `
      <p>The <a href="{{base}}checklist">test checklist</a> is a lightweight playtest companion. Use it while you explore Alloys on a 26.2 world.</p>
      <h2>During a session</h2>
      <ol>
        <li>Open the checklist in your browser — it works offline once loaded.</li>
        <li>Walk through each case: install, crafting, fragments, gear stats, and edge cases.</li>
        <li>Mark each row <strong>Pass</strong>, <strong>Fail</strong>, or <strong>Skip</strong>, and add notes when something surprises you.</li>
      </ol>
      <h2>Sharing with teammates</h2>
      <ul>
        <li>Use <strong>Actions → Export CSV</strong> to save your results.</li>
        <li>Teammates can import the same CSV to continue where you left off.</li>
        <li>Progress lives in your browser until you export it — clearing site data resets local saves.</li>
      </ul>
      <h2>What we are looking for</h2>
      <p>Pass when behavior matches this guide. Fail when crafting, drops, naming, or refunds diverge. Skip only when a case truly does not apply to your setup.</p>
    `,
  },
];

export function getGuideArticle(slug: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((article) => article.slug === slug);
}

export { ALLOY_CATALOG };
