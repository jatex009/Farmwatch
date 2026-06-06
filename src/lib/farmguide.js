export const CROP_PROFILES = {
  maize: {
    name: 'Maize',

    seasons: ['long_rains', 'short_rains'],
    daysToMaturity: { min: 90, max: 120 },
    kc: 1.20,
    spacing: '75cm × 30cm (2–3 seeds per hole)',
    fertilizer: 'DAP at planting, CAN top-dress at knee-height',
    pests: ['Fall Armyworm', 'Stalk Borer', 'Aphids', 'Maize Streak Virus'],
    steps: [
      '1. Prepare seedbed — deep-till to 30cm and remove weeds',
      '2. Apply DAP (50kg/acre) in furrows before planting',
      '3. Plant 2–3 seeds per hole at 5cm depth; thin to 1 plant after emergence',
      '4. Top-dress with CAN (50kg/acre) when plants reach knee height',
      '5. Weed twice: at 3 weeks and 6 weeks after emergence',
      '6. Scout weekly for Fall Armyworm — spray Emamectin Benzoate if >10% leaf damage',
      '7. Withhold irrigation 2 weeks before harvest when husks turn brown',
      '8. Dry cobs to <13% moisture before storage; use hermetic bags',
    ],
    elevationRange: '0–2500m asl',
    expectedYield: '15–30 bags (90kg) per acre',
  },
  beans: {
    name: 'Beans',
    seasons: ['long_rains', 'short_rains'],
    daysToMaturity: { min: 60, max: 90 },
    kc: 1.05,
    spacing: '45cm × 15cm (2 seeds per hole)',
    fertilizer: 'DAP at planting; avoid excess nitrogen — beans fix their own',
    pests: ['Bean Fly', 'Aphids', 'Bean Bruchid', 'Angular Leaf Spot'],
    steps: [
      '1. Select certified seed — KALRO varieties KK8 or Lyamungu 85',
      '2. Inoculate seed with Rhizobium inoculant before planting',
      '3. Plant 2 seeds per hole at 3–4cm depth; thin to 1 plant per stand',
      '4. Apply phosphate fertilizer (DAP, 25kg/acre) in planting furrow',
      '5. Weed at 3 and 5 weeks — beans are sensitive to early competition',
      '6. Monitor for bean fly damage at base of stem; apply carbofuran if severe',
      '7. Harvest when 80% of pods are dry and yellow; avoid over-drying',
      '8. Sun-dry harvested pods for 3–5 days before threshing and storage',
    ],
    elevationRange: '1000–2200m asl',
    expectedYield: '4–8 bags (90kg) per acre',
  },
  tea: {
    name: 'Tea',
    seasons: ['perennial'],
    daysToMaturity: { min: 1095, max: 1825 },
    kc: 1.00,
    spacing: '1.2m × 0.75m (planted in rows)',
    fertilizer: 'CAN 4× per year; Sulphate of Ammonia annually',
    pests: ['Tea Mosquito Bug', 'Red Spider Mite', 'Blister Blight', 'Grey Blight'],
    steps: [
      '1. Source certified cuttings from KTDA nurseries; plant at onset of rains',
      '2. Dig planting holes 45cm deep; add top-soil and organic matter',
      '3. Shade young plants for first 6 months with banana leaves or shade nets',
      '4. Apply CAN (125kg/ha) quarterly starting from second year',
      '5. Prune back to 30cm height in year 3 to establish a flat plucking table',
      '6. Pluck 2 leaves and a bud every 7–14 days in peak season',
      '7. Maintain plucking table by pruning every 3–4 years',
      '8. Deliver green leaf to factory within 12 hours of harvest',
    ],
    elevationRange: '1500–2700m asl',
    expectedYield: '3000–4000 kg green leaf per acre per year',
  },
  coffee: {
    name: 'Coffee',
    seasons: ['perennial'],
    daysToMaturity: { min: 730, max: 1095 },
    kc: 1.00,
    spacing: '2.7m × 2.7m (Arabica SL28/SL34)',
    fertilizer: 'CAN + Sulphate of Potash annually; foliar feeds during berry filling',
    pests: ['Coffee Berry Borer', 'Antestia Bug', 'Coffee Leaf Rust', 'Berry Disease'],
    steps: [
      '1. Plant seedlings at start of long rains; dig 60cm × 60cm holes',
      '2. Incorporate 10kg of manure per planting hole before transplanting',
      '3. Mulch heavily (10cm) around the base; keep mulch away from stem',
      '4. Apply basal fertilizer in March and top-dress in October',
      '5. Prune to single stem for first 2 years; then apply selective pruning annually',
      '6. Spray copper-based fungicide before and after rains to prevent leaf rust',
      '7. Harvest only red ripe cherries (selective picking); avoid strip picking',
      '8. Deliver wet cherries within 24 hours to cooperative factory',
    ],
    elevationRange: '1400–2200m asl',
    expectedYield: '5–10 bags (60kg) clean coffee per acre',
  },
  wheat: {
    name: 'Wheat',
    seasons: ['long_rains'],
    daysToMaturity: { min: 120, max: 150 },
    kc: 1.15,
    spacing: '20cm row spacing; drill-sown at 100kg seed/ha',
    fertilizer: 'DAP at planting; CAN at tillering stage',
    pests: ['Stem Rust', 'Yellow Rust', 'Hessian Fly', 'Aphids'],
    steps: [
      '1. Select certified rust-resistant varieties (Robin, Fahari, Kenya Fahari)',
      '2. Plough deep and form fine seedbed; apply lime if pH below 5.5',
      '3. Drill seed at 100kg/ha with 20cm row spacing at 3–5cm depth',
      '4. Apply DAP (100kg/ha) in the furrow with seed at planting',
      '5. Top-dress with CAN (100kg/ha) at early tillering (3–4 weeks)',
      '6. Scout for rust pustules; spray Propiconazole at first sign',
      '7. Harvest when grain moisture is 14–16%; avoid late harvest (shatter loss)',
      '8. Thresh and clean grain; store in moisture-proof bags below 13% MC',
    ],
    elevationRange: '1800–2800m asl',
    expectedYield: '15–25 bags (90kg) per acre',
  },
  rice: {
    name: 'Rice',
    seasons: ['long_rains'],
    daysToMaturity: { min: 90, max: 120 },
    kc: 1.20,
    spacing: '20cm × 20cm transplanted; or broadcast in paddy',
    fertilizer: 'CAN split: at transplanting, tillering and panicle initiation',
    pests: ['Rice Blast', 'Brown Plant Hopper', 'Stalk-Eyed Fly', 'Rice Weevil (storage)'],
    steps: [
      '1. Prepare well-levelled paddy; bund to retain 5–10cm standing water',
      '2. Raise nursery for 21 days; flood nursery bed at 2cm after emergence',
      '3. Transplant seedlings 3 per hill at 20×20cm; keep 5cm flood depth',
      '4. Apply CAN (1st split 40kg/ha) 1 week after transplanting',
      '5. Maintain flooding until 2 weeks before harvest; then drain completely',
      '6. Apply 2nd CAN split (40kg/ha) at tillering; 3rd at panicle initiation',
      '7. Spray tricyclazole fungicide if blast lesions appear on leaves',
      '8. Harvest when 80% of panicle grains are golden; thresh and dry to 14% MC',
    ],
    elevationRange: '0–1200m asl',
    expectedYield: '20–35 bags (90kg) per acre (irrigated)',
  },
  sorghum: {
    name: 'Sorghum',
    seasons: ['long_rains', 'short_rains'],
    daysToMaturity: { min: 90, max: 120 },
    kc: 1.00,
    spacing: '75cm × 25cm (3–4 seeds; thin to 2)',
    fertilizer: 'DAP at planting; light CAN top-dress at tillering',
    pests: ['Shoot Fly', 'Stem Borer', 'Head Bug', 'Smut'],
    steps: [
      '1. Select drought-tolerant variety (Gadam, Seredo) for ASALs',
      '2. Plant at first reliable rains; avoid waterlogged soils',
      '3. Apply DAP (50kg/acre) in furrows at planting',
      '4. Thin to 2 plants per hill at 2 weeks after emergence',
      '5. Top-dress with CAN (25kg/acre) at tillering if rainfall is adequate',
      '6. Weed twice: at 3 and 6 weeks after emergence',
      '7. Cover panicles with mesh bags to protect from birds near harvest',
      '8. Harvest when grain is hard; dry before threshing and storage',
    ],
    elevationRange: '0–1800m asl',
    expectedYield: '8–18 bags (90kg) per acre',
  },
  millet: {
    name: 'Millet',
    seasons: ['long_rains', 'short_rains'],
    daysToMaturity: { min: 90, max: 120 },
    kc: 0.95,
    spacing: '45cm × 30cm (4–5 seeds; thin to 2)',
    fertilizer: 'Minimal — 25kg DAP/acre; millet thrives on low-fertility soils',
    pests: ['Stem Borer', 'Downy Mildew', 'Smut', 'Quelea Birds'],
    steps: [
      '1. Plant finger millet or pearl millet at first rains on well-drained soils',
      '2. Prepare a fine seedbed; broadcast or drill at shallow depth (2cm)',
      '3. Apply DAP (25kg/acre) at planting on low-fertility soils',
      '4. Thin to 2 seedlings per hill at 3 weeks to reduce competition',
      '5. Weed at 3 and 6 weeks — critical for establishment',
      '6. Intercrop with legumes (beans, cowpeas) to improve yield and soil',
      '7. Protect ripening grain from birds using noise deterrents or netting',
      '8. Harvest when grain is hard; thresh and store in dry, cool conditions',
    ],
    elevationRange: '0–2000m asl',
    expectedYield: '5–12 bags (90kg) per acre',
  },
  sugarcane: {
    name: 'Sugarcane',
    seasons: ['long_rains', 'short_rains'],
    daysToMaturity: { min: 365, max: 548 },
    kc: 1.25,
    spacing: '1.5m row spacing; setts 45–60cm apart',
    fertilizer: 'Triple Super Phosphate at planting; CAN at 3 and 6 months',
    pests: ['Sugarcane Borer', 'Termites', 'Ratoon Stunting Disease', 'Smut'],
    steps: [
      '1. Source disease-free setts from mill-approved nurseries (2-3 bud setts)',
      '2. Plough to 45cm; apply TSP (50kg/acre) before planting',
      '3. Lay setts in furrows end-to-end; cover with 5cm of soil',
      '4. Apply CAN top-dress at 3 months (50kg/acre) and again at 6 months',
      '5. Keep rows weed-free for first 4 months; mechanical cultivation after',
      '6. Earth-up rows at 4 months to prevent lodging',
      '7. Harvest at 12–18 months when Brix (sugar content) ≥18%; use bill hook',
      '8. Ratoon for 2–3 cycles; apply fertilizer after each harvest',
    ],
    elevationRange: '0–1500m asl',
    expectedYield: '35–45 tonnes of cane per acre',
  },
  horticulture: {
    name: 'Horticulture',
    seasons: ['long_rains', 'short_rains', 'perennial'],
    daysToMaturity: { min: 45, max: 90 },
    kc: 1.05,
    spacing: 'Varies by crop: kale 60×45cm, tomato 90×60cm, capsicum 60×45cm',
    fertilizer: 'CAN + foliar feeds (NPK 17:17:17) every 2 weeks',
    pests: ['Whitefly', 'Thrips', 'Blight (tomato)', 'Downy Mildew', 'Aphids'],
    steps: [
      '1. Select high-value crops suited to market: French beans, kale, tomatoes',
      '2. Raise seedlings in trays using sterilized media for 3–4 weeks',
      '3. Transplant in the afternoon or on cloudy days to reduce transplant shock',
      '4. Apply NPK basal fertilizer at transplanting; mulch to conserve moisture',
      '5. Install drip irrigation if available — critical for off-season production',
      '6. Begin foliar feeding every 2 weeks; alternate products to avoid resistance',
      '7. Scout twice weekly for pests; use IPM — sticky traps, biocontrol first',
      '8. Harvest at correct maturity stage; pre-cool and pack for market within 24h',
    ],
    elevationRange: '0–2500m asl',
    expectedYield: 'Varies: kale 3–5t/acre, French beans 4–6t/acre, tomatoes 10–20t/acre',
  },
}

export function getSeasonStatus(date = new Date()) {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const dayOfYear = (m * 100) + d

  if (dayOfYear >= 301 && dayOfYear <= 415) {
    return { season: 'long_rains', label: 'Long Rains', phase: 'prime', note: 'Peak planting window — plant now' }
  }
  if (dayOfYear >= 416 && dayOfYear <= 515) {
    return { season: 'long_rains', label: 'Long Rains', phase: 'late', note: 'Late — fast-maturing varieties only' }
  }
  if (dayOfYear >= 516 && dayOfYear <= 930) {
    return { season: 'dry', label: 'Dry Season', phase: 'off', note: 'Dry season — irrigated farming only' }
  }
  if (dayOfYear >= 1001 && dayOfYear <= 1115) {
    return { season: 'short_rains', label: 'Short Rains', phase: 'prime', note: 'Peak planting window — plant now' }
  }
  if (dayOfYear >= 1116 && dayOfYear <= 1201) {
    return { season: 'short_rains', label: 'Short Rains', phase: 'late', note: 'Late — fast-maturing varieties only' }
  }
  return { season: 'dry', label: 'Dry Season', phase: 'off', note: 'Dry season — irrigated farming only' }
}

export function getPlantingStatus(cropKey, date = new Date()) {
  const profile = CROP_PROFILES[cropKey]
  if (!profile) return { status: 'off', label: 'Unknown', color: 'var(--text-3)', note: '' }

  if (profile.seasons.includes('perennial') && profile.seasons.length === 1) {
    return { status: 'perennial', label: 'Year-round', color: 'var(--leaf-lt)', note: 'Can be established at any time with adequate water' }
  }

  const season = getSeasonStatus(date)

  if (season.phase === 'off') {
    return { status: 'off', label: 'Off-season', color: 'var(--text-3)', note: season.note }
  }

  const cropMatchesSeason = profile.seasons.includes(season.season)

  if (!cropMatchesSeason) {
    return { status: 'off', label: 'Off-season', color: 'var(--text-3)', note: 'Not suited to current season' }
  }

  if (season.phase === 'prime') {
    return { status: 'prime', label: 'Plant Now', color: 'var(--ochre)', note: season.note }
  }
  if (season.phase === 'late') {
    return { status: 'late', label: 'Late Season', color: 'var(--amber)', note: season.note }
  }

  return { status: 'off', label: 'Off-season', color: 'var(--text-3)', note: season.note }
}
