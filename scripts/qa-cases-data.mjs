/**
 * QA case catalog — synced from Cursor canvas via alloys/tools/_extract-qa-cases-from-canvas.mjs
 * Do not hand-edit; regenerate then: node scripts/build-cases.mjs
 */
export const DEPLOY = "build/server-deploy/world/datapacks/Alloys.zip";
export const DATAPACK_VERSION = "1.0.43";

export const GEAR = [
  "pickaxe", "shovel", "axe", "sword", "hoe", "bow", "crossbow",
  "helmet", "chestplate", "leggings", "boots",
];

export const SUITES = [
  { id: "smoke", label: "Smoke" },
  { id: "ingots", label: "Ingots +" },
  { id: "fragments", label: "Fragments" },
  { id: "gear-positive", label: "Gear +" },
  { id: "gear-negative", label: "Gear −" },
  { id: "mixed", label: "Mixed" },
  { id: "effects", label: "Effects" },
  { id: "ops", label: "Unlocks / ore / ops" },
  { id: "signoff", label: "Sign-off" },
];

export const ALLOYS = [
  {
    id: "tin",
    display: "Tin",
    carrier: "firework_star",
    craftHint: "3 copper ingots + 1 clay ball",
  },
  {
    id: "bronze",
    display: "Bronze",
    carrier: "firework_rocket",
    craftHint: "3 copper ingots + 2 bricks",
  },
  {
    id: "silver",
    display: "Silver",
    carrier: "quartz",
    craftHint: "2 iron + 1 coal + 1 copper",
  },
  {
    id: "steel",
    display: "Steel",
    carrier: "iron_nugget",
    craftHint: "2 iron + 2 coal + 1 brick",
  },
  {
    id: "cobalt",
    display: "Cobalt",
    carrier: "copper_nugget",
    craftHint: "2 iron + 2 lapis + 1 coal",
    fragmentBase: "amethyst_shard",
  },
  {
    id: "nickel",
    display: "Nickel",
    carrier: "gold_nugget",
    craftHint: "2 iron + 1 gold + 1 copper",
    fragmentBase: "prismarine_shard",
  },
  {
    id: "platinum",
    display: "Platinum",
    carrier: "prismarine_shard",
    craftHint: "2 gold + 1 iron + 2 amethyst shards",
  },
  {
    id: "mythril",
    display: "Mythril",
    carrier: "prismarine_crystals",
    craftHint: "2 gold + 1 emerald + 1 diamond",
    fragmentBase: "glowstone_dust",
  },
  {
    id: "adamantine",
    display: "Adamantine",
    carrier: "glowstone_dust",
    craftHint: "catalog craft materials (see recipe)",
    fragmentBase: "echo_shard",
  },
  {
    id: "astral",
    display: "Astral",
    carrier: "nether_star",
    craftHint: "8 diamonds + 1 netherite scrap",
  },
];

const WORLD = [
  "Paper 26.2 server",
  `Alloys.zip at ${DEPLOY} enabled`,
  "World restarted after zip replace (not only /reload)",
  "Cheats / operator allowed",
];

function sticksOrString(gear) {
  if (gear === "bow" || gear === "crossbow") return "string (vanilla layout)";
  if (
    gear === "helmet" ||
    gear === "chestplate" ||
    gear === "leggings" ||
    gear === "boots"
  ) {
    return "armor layout only (no sticks)";
  }
  return "sticks (vanilla tool layout)";
}

function refundLine(gear, carrier) {
  if (gear === "bow" || gear === "crossbow") {
    return `Unfinished paper token cleared within ~1 tick; refund ${carrier} + string; red tellraw`;
  }
  if (
    gear === "helmet" ||
    gear === "chestplate" ||
    gear === "leggings" ||
    gear === "boots"
  ) {
    return `Unfinished paper token cleared within ~1 tick; refund ${carrier}; red tellraw`;
  }
  return `Unfinished paper token cleared within ~1 tick; refund ${carrier} + sticks; red tellraw`;
}

function pendingTokenLine(a, g) {
  return `Immediate table output: paper token "${a.display} ${g} (unfinished)" (alloys_pending + alloys_material/alloys_gear)`;
}

function gearPositive(a, g) {
  return {
    id: `P-${a.id}-${g}`,
    suite: "gear-positive",
    kind: "positive",
    alloy: a.id,
    title: `${a.display} ${g} — alloy craft`,
    objective: `Named ${a.display} ${g} via validate → mark legit → resolve (1t).`,
    severity: "blocker",
    preconditions: [
      ...WORLD,
      `Datapack ${DATAPACK_VERSION}+ deployed`,
      `/function alloys:give/${a.id}`,
      "/function alloys:player/sync_unlocks",
    ],
    input: [
      `Recipe id: alloys:${a.id}_${g}`,
      `Ingot slots: ${a.display} Ingot (carrier ${a.carrier} WITH alloys_material custom_data)`,
      `Other slots: ${sticksOrString(g)}`,
      pendingTokenLine(a, g),
    ],
    steps: [
      "Open crafting table.",
      `Place alloy kit ingredients for ${g}.`,
      "Take the output (brief gray unfinished paper is OK for ≤1 tick).",
      "Wait 1–2 ticks (craft/dispatch → craft/resolve).",
    ],
    expect: [
      `Named ${a.display} ${g} from loot table (full alloy components).`,
      "Unfinished paper token removed from inventory.",
      "Item has alloy custom_data / enchant glint as designed.",
      "No plain-craft refund tellraw.",
    ],
    mustNot: [
      "Unfinished paper token left in inventory after resolve.",
      `Named ${a.display} ${g} missing while paper was cleared.`,
      "Refund of ingredients after a successful alloy craft.",
    ],
  };
}

function gearNegative(a, g) {
  return {
    id: `N-${a.id}-${g}`,
    suite: "gear-negative",
    kind: "negative",
    alloy: a.id,
    title: `${a.display} ${g} — plain ${a.carrier} only`,
    objective: `Plain ${a.carrier} → unfinished paper only; resolve refunds plain mats.`,
    severity: "blocker",
    preconditions: [
      ...WORLD,
      `Datapack ${DATAPACK_VERSION}+ deployed`,
      `Clear alloy ${a.display} ingots from inventory`,
      `/give @s minecraft:${a.carrier} 64`,
      `/recipe give @s alloys:${a.id}_${g}`,
      `Also give sticks/string if the layout needs them`,
    ],
    input: [
      `Recipe id: alloys:${a.id}_${g}`,
      `Ingot slots: PLAIN minecraft:${a.carrier} (no alloys_material custom_data)`,
      `Other slots: ${sticksOrString(g)}`,
      pendingTokenLine(a, g),
    ],
    steps: [
      "Craft and take the unfinished paper token.",
      "Wait 1–2 ticks (craft/dispatch → craft/resolve).",
      "Inspect inventory and chat.",
    ],
    expect: [
      refundLine(g, a.carrier),
      "No unfinished paper token remains.",
    ],
    mustNot: [
      `Named ${a.display} ${g} in inventory`,
      "Unfinished paper token stuck in inventory",
      "Permanent loss of plain ingredients with no refund",
    ],
  };
}

export function buildCases() {
  const cases = [];

  cases.push(
    {
      id: "SM-01",
      suite: "smoke",
      kind: "smoke",
      title: "Datapack enabled",
      objective: "Confirm Alloys.zip is loaded.",
      severity: "blocker",
      preconditions: WORLD,
      input: ["Command: /datapack list"],
      steps: ["Run the command in chat or console."],
      expect: ["file/Alloys.zip listed as enabled"],
      mustNot: ["Alloys missing or disabled"],
    },
    {
      id: "SM-02",
      suite: "smoke",
      kind: "smoke",
      title: "No gear recipe parse errors",
      objective: "Server accepted all alloys:* gear recipes.",
      severity: "blocker",
      preconditions: WORLD,
      input: ["Server console log around datapack enable / world start"],
      steps: ["Search console for alloys: and Failed to parse."],
      expect: ["Zero parse failures for alloys:* gear recipes"],
      mustNot: ["Map entry … Failed to parse either (items+components keys)"],
    },
    {
      id: "SM-03",
      suite: "smoke",
      kind: "smoke",
      title: "Recipe register probe",
      objective: "A known gear recipe is registered.",
      severity: "blocker",
      preconditions: WORLD,
      input: ["/recipe give @s alloys:astral_helmet"],
      steps: ["Run the command as the test player."],
      expect: ["Success or already unlocked"],
      mustNot: ["Unknown recipe"],
    },
    {
      id: "SM-04",
      suite: "smoke",
      kind: "smoke",
      title: "Astral kit + unlocks",
      objective: "Give kit and sync unlocks work.",
      severity: "blocker",
      preconditions: WORLD,
      input: [
        "/function alloys:give/astral",
        "/function alloys:player/sync_unlocks",
      ],
      steps: ["Run both commands.", "Open inventory / recipe book."],
      expect: [
        "Astral kit items present",
        "Astral gear recipes available to craft",
      ],
      mustNot: ["Empty kit", "Gear recipes still locked with kit in hand"],
    },
    {
      id: "SM-05",
      suite: "smoke",
      kind: "smoke",
      title: "Happy path — Astral helmet",
      objective: "Alloy ingredients → named Astral Helmet after resolve.",
      severity: "blocker",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "SM-04 kit still available (or give/astral again)",
      ],
      input: [
        "Recipe: alloys:astral_helmet",
        "5× Astral Ingot (nether_star + alloys_material) in helmet layout",
        "Table output: unfinished paper token first",
      ],
      steps: [
        "Craft helmet with kit ingots.",
        "Take result (paper OK briefly).",
        "Wait 1–2 ticks for craft/resolve.",
      ],
      expect: ["Named Astral Helmet with alloy data", "Paper token cleared"],
      mustNot: [
        "Named Astral Helmet missing while paper remains",
        "Refund tellraw",
        "Stuck unfinished paper",
      ],
    },
    {
      id: "SM-06",
      suite: "smoke",
      kind: "smoke",
      title: "Negative — plain nether_star helmet",
      objective: "Plain stars → paper token only; resolve refunds stars.",
      severity: "blocker",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "No Astral Ingots in inventory",
        "/give @s minecraft:nether_star 16",
      ],
      input: [
        "Recipe: alloys:astral_helmet",
        "Plain nether_star only in helmet slots",
        "Table output: unfinished paper token",
      ],
      steps: ["Craft and take paper.", "Wait 1–2 ticks."],
      expect: [
        "Paper token cleared",
        "Nether stars refunded",
        "Red tellraw notice",
      ],
      mustNot: ["Named Astral Helmet", "Stuck unfinished paper"],
    },
    {
      id: "SM-07",
      suite: "smoke",
      kind: "smoke",
      title: "Happy path — Steel chestplate",
      objective: "Second alloy confirms resolve path (not bronze-only).",
      severity: "blocker",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "/function alloys:give/steel",
        "sync_unlocks",
      ],
      input: [
        "Recipe: alloys:steel_chestplate",
        "Alloy Steel Ingots (iron_nugget + alloys_material)",
        "Table output: unfinished paper token first",
      ],
      steps: ["Craft with kit.", "Take paper.", "Wait 1–2 ticks."],
      expect: ["Named Steel Chestplate", "Paper token cleared"],
      mustNot: ["Stuck unfinished paper", "Refund tellraw"],
    },
    {
      id: "SM-08",
      suite: "smoke",
      kind: "smoke",
      title: "Negative — plain iron_nugget chestplate",
      objective: "Plain nuggets → paper only; resolve refunds nuggets.",
      severity: "blocker",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "No Steel Ingots",
        "/give @s minecraft:iron_nugget 64",
      ],
      input: ["Recipe: alloys:steel_chestplate", "Plain iron_nugget only"],
      steps: ["Craft and take paper.", "Wait 1–2 ticks."],
      expect: [
        "Refund iron_nugget + tellraw",
        "Paper token cleared",
      ],
      mustNot: ["Named Steel Chestplate", "Stuck unfinished paper"],
    },
    {
      id: "SM-09",
      suite: "smoke",
      kind: "smoke",
      title: "Ingot craft — Steel",
      objective: "Ingot recipes still use full component results.",
      severity: "major",
      preconditions: WORLD,
      input: [
        "Recipe: alloys:craft_steel_ingot",
        "Materials: 2 iron + 2 coal + 1 brick",
      ],
      steps: ["Craft and take."],
      expect: ["Named Steel Ingot + glint + custom_data"],
      mustNot: ["Plain iron_nugget with no alloy data as the craft result"],
    },
    {
      id: "SM-10",
      suite: "smoke",
      kind: "smoke",
      title: "Trait probe — Steel Resistance",
      objective: "Wear effect renews while equipped.",
      severity: "major",
      preconditions: [...WORLD, "Named Steel Chestplate from SM-07"],
      input: ["Equip Steel Chestplate", "Wait 5–8 seconds"],
      steps: ["Equip.", "Wait.", "Check /effect or HUD.", "Unequip."],
      expect: ["Resistance while worn", "Effect ends after unequip"],
      mustNot: ["Permanent Resistance after unequip"],
    },
    {
      id: "SM-11",
      suite: "smoke",
      kind: "smoke",
      title: "Plugin is convenience only",
      objective: "Plugin does not own crafting exclusivity.",
      severity: "major",
      preconditions: WORLD,
      input: [
        "With plugin: /alloys give tin",
        "Without plugin: /function alloys:give/tin",
      ],
      steps: [
        "Compare kit contents.",
        "Repeat SM-05 style craft with and without plugin jar.",
      ],
      expect: [
        "Same give kit either path",
        "Same craft exclusivity without plugin",
      ],
      mustNot: ["Craft only works when plugin is installed"],
    },
    {
      id: "SM-12",
      suite: "smoke",
      kind: "smoke",
      title: "Token lifecycle — Bronze pickaxe",
      objective:
        "Confirm pending paper → resolve pipeline (all 110 gear recipes use this).",
      severity: "blocker",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "/function alloys:give/bronze",
        "sync_unlocks",
      ],
      input: [
        "Recipe: alloys:bronze_pickaxe",
        "3× Bronze Ingot + 2 sticks",
        "Functions: recipes/craft/mark → recipes/craft/resolve (via dispatch, 1t)",
      ],
      steps: [
        "Craft with alloy ingots; take unfinished paper if shown.",
        "Wait 1–2 ticks.",
        "Repeat with plain firework_rocket + sticks (no alloy ingots).",
      ],
      expect: [
        "Legit: Named Bronze Pickaxe; paper gone",
        "Fraud: paper gone; 3 rockets + 2 sticks refunded; red tellraw",
      ],
      mustNot: [
        "Stuck unfinished paper after resolve",
        "Named Bronze Pickaxe from plain rockets",
      ],
    },
  );

  for (const a of ALLOYS) {
    cases.push({
      id: `P-ingot-${a.id}`,
      suite: "ingots",
      kind: "positive",
      alloy: a.id,
      title: `Craft ${a.display} Ingot`,
      objective: `Named ${a.display} Ingot from plain materials.`,
      severity: "blocker",
      preconditions: WORLD,
      input: [
        `Recipe: alloys:craft_${a.id}_ingot`,
        `Materials: ${a.craftHint}`,
        `Result carrier id: ${a.carrier} (with full alloy components)`,
      ],
      steps: ["Place materials.", "Take result."],
      expect: [
        `Named ${a.display} Ingot`,
        "Enchant glint / custom_data present",
      ],
      mustNot: [`Plain ${a.carrier} with no alloy components`],
    });
  }

  for (const a of ALLOYS) {
    if (!a.fragmentBase) continue;
    cases.push(
      {
        id: `P-frag-${a.id}`,
        suite: "fragments",
        kind: "positive",
        alloy: a.id,
        title: `${a.display} from alloy fragments`,
        objective: `9 alloy fragments → named ${a.display} Ingot.`,
        severity: "blocker",
        preconditions: [
          ...WORLD,
          `Have 9 ${a.display} fragments (${a.fragmentBase} + alloy data)`,
        ],
        input: [
          `Recipe: alloys:craft_${a.id}_ingot_from_fragments`,
          `9× alloy ${a.fragmentBase}`,
        ],
        steps: ["Craft 3×3 fragments.", "Take result."],
        expect: [`Named ${a.display} Ingot`],
        mustNot: ["Craft fails with valid alloy fragments"],
      },
      {
        id: `N-frag-${a.id}`,
        suite: "fragments",
        kind: "observe",
        alloy: a.id,
        title: `${a.display} — plain ${a.fragmentBase} ×9`,
        objective: "Record soft-exclusivity behavior for plain bases.",
        severity: "minor",
        preconditions: [
          ...WORLD,
          `9× plain minecraft:${a.fragmentBase} (no alloy data)`,
        ],
        input: [
          `Recipe: alloys:craft_${a.id}_ingot_from_fragments`,
          `Plain ${a.fragmentBase} only`,
        ],
        steps: [
          "Attempt craft.",
          "Record whether named ingot appears, recipe lights, or nothing happens.",
        ],
        expect: [
          "Behavior documented in tester notes (observe case)",
        ],
        mustNot: [
          "Silent inventory corruption",
          "Crash / recipe parse error",
        ],
      },
    );
  }

  for (const a of ALLOYS) {
    for (const g of GEAR) {
      cases.push(gearPositive(a, g));
      cases.push(gearNegative(a, g));
    }
  }

  cases.push(
    {
      id: "M-01",
      suite: "mixed",
      kind: "negative",
      alloy: "steel",
      title: "Mixed Steel chestplate (7 alloy + 1 plain)",
      objective: "Partial plain stack must not mark legit; resolve refunds fraud.",
      severity: "major",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "give/steel kit",
        "1 extra plain iron_nugget",
      ],
      input: [
        "alloys:steel_chestplate",
        "7 alloy Steel Ingots + 1 plain iron_nugget in ingot slots",
      ],
      steps: ["Craft and take paper.", "Wait 1–2 ticks."],
      expect: [
        "No named Steel Chestplate",
        "Paper token cleared",
        "Plain stacks refunded as designed",
      ],
      mustNot: ["Named Steel Chestplate from mixed grid", "Stuck paper"],
    },
    {
      id: "M-02",
      suite: "mixed",
      kind: "negative",
      alloy: "astral",
      title: "Mixed Astral helmet (kit + 1 plain star)",
      objective: "One plain star prevents legit mark; resolve treats as fraud.",
      severity: "major",
      preconditions: [
        ...WORLD,
        `Datapack ${DATAPACK_VERSION}+`,
        "give/astral",
        "1 plain nether_star",
      ],
      input: [
        "alloys:astral_helmet",
        "Mix alloy Astral Ingots with one plain nether_star",
      ],
      steps: ["Craft and take paper.", "Wait 1–2 ticks."],
      expect: ["No Astral Helmet", "Paper cleared", "Plain stars refunded"],
      mustNot: ["Named Astral Helmet", "Stuck unfinished paper"],
    },
  );

  const effectCases = [
    {
      id: "E-silver-helmet",
      suite: "effects",
      kind: "effect",
      alloy: "silver",
      title: "Silver helmet — Night Vision",
      objective: "Wear effect while helmet equipped.",
      severity: "major",
      preconditions: [...WORLD, "Named Silver Helmet"],
      input: ["Equip Silver Helmet", "Wait 5–8s"],
      steps: ["Equip.", "Wait for traits renew.", "Unequip."],
      expect: ["Night Vision amplifier 0 while worn", "Ends after unequip"],
      mustNot: ["Night Vision while helmet is only in bag"],
    },
    {
      id: "E-silver-boots",
      suite: "effects",
      kind: "effect",
      alloy: "silver",
      title: "Silver boots — Swift step",
      objective: "Movement speed ×1.05 while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Silver Boots"],
      input: ["Equip Silver Boots"],
      steps: ["Equip.", "Check attributes / feel speed.", "Unequip."],
      expect: ["movement_speed add_multiplied_base 0.05 on feet"],
      mustNot: ["Bonus while boots unequipped"],
    },
    {
      id: "E-steel-chest",
      suite: "effects",
      kind: "effect",
      alloy: "steel",
      title: "Steel chestplate — Resistance",
      objective: "Resistance while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Steel Chestplate"],
      input: ["Equip", "Wait 5–8s"],
      steps: ["Equip.", "Confirm Resistance.", "Unequip."],
      expect: ["Resistance amp 0 while worn"],
      mustNot: ["Resistance from chestplate sitting in inventory"],
    },
    {
      id: "E-cobalt-tools",
      suite: "effects",
      kind: "effect",
      alloy: "cobalt",
      title: "Cobalt tools — Haste",
      objective: "Haste while holding mining tools.",
      severity: "major",
      preconditions: [...WORLD, "Cobalt pick/shovel/axe/hoe"],
      input: ["Hold each tool in mainhand 5–8s"],
      steps: ["Hold pickaxe.", "Confirm Haste.", "Repeat shovel/axe/hoe."],
      expect: ["Haste amp 0 for each listed tool"],
      mustNot: ["Haste when tool is not held"],
    },
    {
      id: "E-platinum-held",
      suite: "effects",
      kind: "effect",
      alloy: "platinum",
      title: "Platinum held — +1 Luck",
      objective: "Luck attribute while holding tools/weapons.",
      severity: "major",
      preconditions: [...WORLD, "Any Platinum tool/weapon/bow/crossbow"],
      input: ["Hold in mainhand"],
      steps: ["Hold.", "Check luck attribute.", "Switch away."],
      expect: ["+1 Luck (add_value) on mainhand"],
      mustNot: ["Luck while item is not held"],
    },
    {
      id: "E-mythril-sword",
      suite: "effects",
      kind: "effect",
      alloy: "mythril",
      title: "Mythril sword — Strength",
      objective: "Strength while sword held.",
      severity: "major",
      preconditions: [...WORLD, "Named Mythril Sword"],
      input: ["Hold Mythril Sword"],
      steps: ["Hold 5–8s.", "Confirm Strength.", "Switch away."],
      expect: ["Strength amp 0 while held"],
      mustNot: ["Strength while sword in offhand-only or bag (per design: mainhand hold)"],
    },
    {
      id: "E-mythril-chest",
      suite: "effects",
      kind: "effect",
      alloy: "mythril",
      title: "Mythril chestplate — Fire Resistance",
      objective: "Fire Resistance while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Mythril Chestplate"],
      input: ["Equip"],
      steps: ["Equip 5–8s.", "Confirm Fire Resistance.", "Unequip."],
      expect: ["Fire Resistance amp 0 while worn"],
      mustNot: ["Effect persists long after unequip"],
    },
    {
      id: "E-adamantine-chest",
      suite: "effects",
      kind: "effect",
      alloy: "adamantine",
      title: "Adamantine chestplate — Resistance + KB",
      objective: "Resistance and knockback resistance while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Adamantine Chestplate"],
      input: ["Equip"],
      steps: ["Equip 5–8s.", "Check Resistance + knockback_resistance 0.1."],
      expect: ["Resistance amp 0", "knockback_resistance +0.1 on chest"],
      mustNot: ["Bonuses while unequipped"],
    },
    {
      id: "E-astral-helmet",
      suite: "effects",
      kind: "effect",
      alloy: "astral",
      title: "Astral helmet — Water Breathing",
      objective: "Water Breathing while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Astral Helmet"],
      input: ["Equip"],
      steps: ["Equip 5–8s.", "Confirm Water Breathing.", "Unequip."],
      expect: ["Water Breathing amp 0 while worn"],
      mustNot: ["Effect while helmet unequipped"],
    },
    {
      id: "E-astral-chest",
      suite: "effects",
      kind: "effect",
      alloy: "astral",
      title: "Astral chestplate — Regeneration",
      objective: "Regeneration while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Astral Chestplate"],
      input: ["Equip"],
      steps: ["Equip 5–8s.", "Confirm Regeneration.", "Unequip."],
      expect: ["Regeneration amp 0 while worn"],
      mustNot: ["Effect while unequipped"],
    },
    {
      id: "E-astral-boots",
      suite: "effects",
      kind: "effect",
      alloy: "astral",
      title: "Astral boots — Swift step ×1.10",
      objective: "Movement speed ×1.10 while worn.",
      severity: "major",
      preconditions: [...WORLD, "Named Astral Boots"],
      input: ["Equip"],
      steps: ["Equip.", "Confirm movement_speed ×1.10.", "Unequip."],
      expect: ["movement_speed add_multiplied_base 0.10 on feet"],
      mustNot: ["Bonus while unequipped"],
    },
    {
      id: "E-tin-none",
      suite: "effects",
      kind: "effect",
      alloy: "tin",
      title: "Tin / Bronze / Nickel — no passives",
      objective: "Alloys without passive_traits add no potion effects.",
      severity: "minor",
      preconditions: [...WORLD, "Full Tin, Bronze, and Nickel sets"],
      input: ["Wear each full set 8s"],
      steps: ["Wear Tin set.", "Wear Bronze set.", "Wear Nickel set."],
      expect: ["No unexpected Alloys-driven potion effects"],
      mustNot: ["Haste / Resistance / etc. from these sets"],
    },
    {
      id: "E-N-01",
      suite: "effects",
      kind: "negative",
      alloy: "steel",
      title: "Steel chestplate in bag — no Resistance",
      objective: "Effects require wear/hold conditions.",
      severity: "major",
      preconditions: [...WORLD, "Steel Chestplate in inventory, not worn"],
      input: ["Chestplate in hotbar/bag only"],
      steps: ["Wait 8s.", "Check effects."],
      expect: ["No Alloys Resistance from unworn chestplate"],
      mustNot: ["Resistance applied from inventory"],
    },
    {
      id: "E-N-03",
      suite: "effects",
      kind: "negative",
      alloy: "mythril",
      title: "Unequip Mythril chest — Fire Res ends",
      objective: "Effects are not sticky.",
      severity: "major",
      preconditions: [...WORLD, "Fire Resistance active from Mythril chest"],
      input: ["Unequip Mythril Chestplate"],
      steps: ["Unequip.", "Wait a few seconds."],
      expect: ["Fire Resistance expires"],
      mustNot: ["Permanent Fire Resistance"],
    },
    {
      id: "EN-01",
      suite: "effects",
      kind: "effect",
      title: "Enchant alloy gear",
      objective: "Enchanting uses catalog enchantability; no crash.",
      severity: "minor",
      preconditions: [...WORLD, "Any named alloy tool or armor", "Enchanting table + lapis"],
      input: ["Place alloy gear in enchanting table"],
      steps: ["Open table.", "Apply an enchant."],
      expect: ["Enchant applies or offers options without crash"],
      mustNot: ["Server exception / item deletion"],
    },
  ];
  cases.push(...effectCases);

  cases.push(
    {
      id: "U-01",
      suite: "ops",
      kind: "ops",
      title: "Unlock via holding alloy ingot",
      objective: "has_ingot path unlocks gear recipes.",
      severity: "major",
      preconditions: WORLD,
      input: ["Hold any alloy ingot", "/function alloys:player/sync_unlocks"],
      steps: ["Hold ingot.", "Run sync.", "Check recipe book."],
      expect: ["Matching alloy gear recipes unlocked"],
      mustNot: ["Still locked with ingot held after sync"],
    },
    {
      id: "U-02",
      suite: "ops",
      kind: "ops",
      title: "Unlock via crafting the ingot",
      objective: "crafted_ingot path works (OR, not AND-only).",
      severity: "major",
      preconditions: [...WORLD, "Materials for one craft_*_ingot"],
      input: ["Craft alloys:craft_<alloy>_ingot", "Take result"],
      steps: ["Craft ingot.", "Check gear unlocks for that alloy."],
      expect: ["Gear recipes unlock after crafted_ingot"],
      mustNot: ["Requires both has_ingot AND crafted in the same tick (AND-only bug)"],
    },
    {
      id: "U-03",
      suite: "ops",
      kind: "ops",
      title: "Unlock JSON shape",
      objective: "requirements are OR groups.",
      severity: "minor",
      preconditions: ["Repo checkout available"],
      input: ["File: data/alloys/advancement/.../unlock/*_ingot.json"],
      steps: ["Open one unlock advancement.", "Read requirements."],
      expect: ['requirements: [["has_ingot","crafted_ingot"]]'],
      mustNot: ["AND of has_ingot with crafted_ingot as separate required criteria"],
    },
    {
      id: "O-01",
      suite: "ops",
      kind: "ops",
      title: "Ore bonus without Silk Touch",
      objective: "Vanilla loot preserved; fragment is optional extra.",
      severity: "major",
      preconditions: [...WORLD, "Host ore for a fragment alloy", "Pickaxe without Silk Touch"],
      input: ["Mine several host ore blocks"],
      steps: ["Mine.", "Compare drops to vanilla expectations."],
      expect: [
        "Vanilla ore drops always present",
        "Rare fragment possible (pool 2)",
      ],
      mustNot: ["Vanilla drops removed"],
    },
    {
      id: "O-02",
      suite: "ops",
      kind: "ops",
      title: "Ore with Silk Touch",
      objective: "No fragment bonus pool under Silk Touch.",
      severity: "major",
      preconditions: [...WORLD, "Silk Touch pickaxe", "Same host ore"],
      input: ["Mine with Silk Touch"],
      steps: ["Mine several blocks."],
      expect: ["Ore block / silk drops only — no fragment bonus"],
      mustNot: ["Fragment from Silk Touch mining"],
    },
    {
      id: "OP-01",
      suite: "ops",
      kind: "ops",
      title: "Zip replace + world restart",
      objective: "Clean load after deploy.",
      severity: "blocker",
      preconditions: ["New Alloys.zip built"],
      input: [`Copy to ${DEPLOY}`, "Stop world", "Start world"],
      steps: ["Replace zip.", "Restart world.", "Re-run SM-01 and SM-02."],
      expect: ["Clean enable", "No stale recipe errors"],
      mustNot: ["Assuming /reload alone is enough for function register"],
    },
    {
      id: "OP-03",
      suite: "ops",
      kind: "ops",
      title: "Crafting identical without plugin",
      objective: "Datapack owns exclusivity.",
      severity: "blocker",
      preconditions: WORLD,
      input: ["Server with plugin jar", "Server without plugin jar"],
      steps: ["Run SM-05 and SM-06 in both setups."],
      expect: ["Same pass/fail on craft exclusivity"],
      mustNot: ["Exclusivity only when plugin present"],
    },
    {
      id: "OP-04",
      suite: "ops",
      kind: "ops",
      title: "/alloys give forwards only",
      objective: "Plugin command is a thin forwarder.",
      severity: "minor",
      preconditions: [...WORLD, "Plugin installed"],
      input: ["/alloys give tin", "/function alloys:give/tin"],
      steps: ["Compare inventories from each command."],
      expect: ["Equivalent kits"],
      mustNot: ["Plugin rewriting recipes or canceling crafts"],
    },
  );

  cases.push(
    {
      id: "RC-smoke",
      suite: "signoff",
      kind: "signoff",
      title: "Sign-off — smoke suite",
      objective: "All SM-* cases passed on this build.",
      severity: "blocker",
      preconditions: ["Smoke suite executed"],
      input: ["Results for SM-01…SM-12"],
      steps: ["Confirm every smoke case is Pass in this canvas."],
      expect: ["12/12 smoke Pass"],
      mustNot: ["Any smoke Fail left unresolved"],
    },
    {
      id: "RC-ingots",
      suite: "signoff",
      kind: "signoff",
      title: "Sign-off — ingot crafts",
      objective: "All P-ingot-* passed.",
      severity: "blocker",
      preconditions: ["Ingot suite executed"],
      input: ["Results for 10 P-ingot-*"],
      steps: ["Confirm all Pass."],
      expect: ["10/10 Pass"],
      mustNot: ["Ship with failed ingot craft"],
    },
    {
      id: "RC-gear-p",
      suite: "signoff",
      kind: "signoff",
      title: "Sign-off — gear positives",
      objective: "All 110 P-* gear cases passed.",
      severity: "blocker",
      preconditions: ["Gear + suite executed"],
      input: ["110 P-<alloy>-<gear> results"],
      steps: ["Confirm 110/110 Pass."],
      expect: ["110/110 Pass"],
      mustNot: ["Any P Fail"],
    },
    {
      id: "RC-gear-n",
      suite: "signoff",
      kind: "signoff",
      title: "Sign-off — gear negatives",
      objective: "All 110 N-* gear cases passed.",
      severity: "blocker",
      preconditions: ["Gear − suite executed"],
      input: ["110 N-<alloy>-<gear> results"],
      steps: ["Confirm 110/110 Pass."],
      expect: ["110/110 Pass — never named alloy; paper cleared; refunds fire"],
      mustNot: ["Any N yielding named alloy gear (Sev-1)"],
    },
    {
      id: "RC-effects",
      suite: "signoff",
      kind: "signoff",
      title: "Sign-off — effects",
      objective: "All E-* / EN-* passed.",
      severity: "major",
      preconditions: ["Effects suite executed"],
      input: ["Effect case results"],
      steps: ["Confirm all Pass."],
      expect: ["Effects suite clean"],
      mustNot: ["Sticky effects after unequip"],
    },
    {
      id: "RC-datapack",
      suite: "signoff",
      kind: "signoff",
      title: "Sign-off — datapack-only attestation",
      objective: "No plugin craft gating used as the exclusivity fix.",
      severity: "blocker",
      preconditions: ["OP-03 reviewed"],
      input: ["Architecture check"],
      steps: [
        "Confirm gear table outputs pending paper tokens only.",
        "Confirm validate marks alloys.craft.legit.* and resolve (1t) swaps loot gear or refunds fraud.",
        "Confirm plugin has no prepare-craft / cancel.",
      ],
      expect: ["Attested datapack-owned"],
      mustNot: ["Java cancel used to paper over recipe design"],
    },
  );

  return cases;
}
