import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Server-side price authority — client sends item_id only, we look up the price here.
// Keep in sync with src/constants/shopItems.ts on the mobile side.
const ITEM_PRICES: Record<string, number> = {
  "banner_abyssal_gate": 9000, "banner_aurora": 3500, "banner_blood": 1500,
  "banner_blood_sigil": 8000, "banner_celestial_divide": 10000, "banner_christmas_night": 3000,
  "banner_cosmic": 6000, "banner_deep_ocean": 1800, "banner_fallen_angel": 9500,
  "banner_frost": 1600, "banner_golden_age": 7500, "banner_infernal_rite": 10500,
  "banner_inferno": 3200, "banner_midnight": 400, "banner_neon": 1200,
  "banner_neural_storm": 7000, "banner_phantom_monarch": 8500, "banner_rose_void": 3000,
  "banner_sakura": 2800, "banner_shadow_realm": 3800, "banner_shattered_void": 8500,
  "banner_solar_flare": 5500, "banner_starfield": 4000, "banner_storm_emperor": 8000,
  "banner_toxic": 2000, "banner_void_fire": 6500, "banner_void_serpent": 9500,
  "bg_abyssal_eye": 10000, "bg_accretion_disk": 11000, "bg_after_rain": 2600,
  "bg_amber_storm": 4200, "bg_ancient_runes": 8800, "bg_angel_sigil": 8500,
  "bg_antimatter": 10500, "bg_aurora": 4500, "bg_aurora_pulse": 4200,
  "bg_aurora_storm": 4800, "bg_bioluminescent": 3800, "bg_blizzard": 2800,
  "bg_blood_moon": 2800, "bg_blood_rain": 5400, "bg_bullet_time": 5500,
  "bg_celestial_clock": 11000, "bg_chaos_gate": 12500, "bg_christmas_ornament": 3200,
  "bg_cipher_grid": 5200, "bg_coffin_rite": 5600, "bg_cosmic_iris": 10000,
  "bg_crimson_waltz": 5000, "bg_crystal_forest": 5000, "bg_crystal_void": 3800,
  "bg_dark_lattice": 3600, "bg_dark_lotus": 4600, "bg_dark_matter_web": 10000,
  "bg_deep_sea": 2200, "bg_demon_awakening": 10500, "bg_demon_gate": 8500,
  "bg_divine_light": 9500, "bg_drowned": 5800, "bg_eclipse": 7000,
  "bg_electric_spiral": 9500, "bg_empty_room": 4000, "bg_eternal_embrace": 8000,
  "bg_fading_signal": 2400, "bg_fire_tornado": 8000, "bg_flower_of_life": 9500,
  "bg_frozen_lake": 2800, "bg_frozen_peak": 2600, "bg_galaxy_core": 9000,
  "bg_gamma_burst": 11000, "bg_ghost_realm": 5200, "bg_gift_void": 4200,
  "bg_grey_morning": 1000, "bg_haunted_static": 5200, "bg_impact_crater": 5200,
  "bg_infernal_crown": 9500, "bg_last_light": 8500, "bg_lightning_burst": 5200,
  "bg_love_letter": 2200, "bg_lunar_tide": 4600, "bg_magma_rift": 5200,
  "bg_mirror_dimension": 5800, "bg_nebula": 2500, "bg_neon_city": 5000,
  "bg_neon_storm": 6500, "bg_neutron_jets": 9000, "bg_northern_star": 4400,
  "bg_overdrive": 8500, "bg_parasite": 9000, "bg_petal_storm": 2400,
  "bg_phantom_signal": 4500, "bg_plasma_core": 8000, "bg_plasma_storm": 5600,
  "bg_power_rings": 9500, "bg_prism_break": 7500, "bg_quantum_collapse": 8000,
  "bg_red_giant": 5500, "bg_rose_garden": 2400, "bg_rose_mandala": 5000,
  "bg_sakura_night": 2200, "bg_shadow_forge": 3000, "bg_shadow_wings": 9000,
  "bg_shockwave": 5800, "bg_solar_flare": 4000, "bg_solar_prominence": 4800,
  "bg_solstice_fire": 7500, "bg_spirit_ward": 5500, "bg_stellar_nursery": 5000,
  "bg_storm_vortex": 4400, "bg_sunflower": 2600, "bg_supernova": 8500,
  "bg_system_overload": 9000, "bg_thorn_garden": 4800, "bg_three_am": 4600,
  "bg_tornado": 5500, "bg_toxic_bloom": 3200, "bg_twin_hearts": 2800,
  "bg_twin_moons": 3400, "bg_twin_suns": 8500, "bg_valentine": 4800,
  "bg_void_cathedral": 6500, "bg_void_emperor": 12000, "bg_void_maelstrom": 6000,
  "bg_void_rift": 4800, "bg_void_singularity": 13000, "bg_void_stare": 10500,
  "bg_void_temple": 5800, "bg_volcanic_fury": 5800, "bg_wendigo": 10000,
  "bg_wildflower": 1200, "bg_wormhole": 11500, "bg_zero_hour": 9500,
  "frame_phantom_smoke": 4600,
  "frame_abyss": 3500, "frame_ancient_gold": 2000, "frame_blossom_cat": 2200,
  "frame_christmas_wreath": 3500, "frame_crystal": 8000, "frame_dark_halo": 4200,
  "frame_dark_pentagram": 11000, "frame_dark_rose": 4500, "frame_ember": 1800,
  "frame_forbidden_genome": 4800, "frame_frost_wreath": 800, "frame_inferno": 4000,
  "frame_jade_garden": 2800, "frame_moonlight": 600, "frame_neon": 1500,
  "frame_neon_plasma": 4500, "frame_phantom": 1800, "frame_purple_circuit": 3000,
  "frame_purple_rose": 9000, "frame_rose_garden": 1600, "frame_sakura": 3000,
  "frame_sakura_blossom": 4000, "frame_sakura_dna": 3200, "frame_shadow_king": 5000,
  "frame_solstice": 5500, "frame_spirit_ward": 9500, "frame_violet_rose": 3200,
  "frame_void_cat": 3800, "frame_void_crown": 7500, "frame_void_eclipse": 10000,
  "name_alchemist": 4000, "name_aligned": 300, "name_amethyst": 2200,
  "name_ancient": 8000, "name_angel": 6000, "name_annotated": 400,
  "name_arctic": 1300, "name_asterism": 1000, "name_aurora": 9500,
  "name_blades": 1200, "name_blood": 900, "name_bloom_mark": 350,
  "name_chosen_one": 6500, "name_command": 1100, "name_corrupted": 3800,
  "name_cyber_emperor": 11000, "name_dagaz": 2600, "name_dagger": 1500,
  "name_deity": 8000, "name_demon": 3000, "name_echo_signal": 280,
  "name_encoded": 2600, "name_eternal": 7000, "name_fehu": 6500,
  "name_flame": 1000, "name_fleur": 2400, "name_flora": 750,
  "name_florette": 320, "name_galaxy": 7000, "name_ghost": 300,
  "name_glitch": 2800, "name_hexcore": 2200, "name_infinity": 800,
  "name_lozenge": 1000, "name_moonphase": 950, "name_navigator": 2000,
  "name_neon": 800, "name_nova_star": 1400, "name_orbit": 950,
  "name_phantom": 3200, "name_plague": 3400, "name_prism": 850,
  "name_reaper_mark": 7000, "name_royal": 5000, "name_runic": 2200,
  "name_sakura": 350, "name_severed": 2800, "name_shadow": 250,
  "name_signal": 1200, "name_spirit_mark": 3200, "name_stardust": 1800,
  "name_therefore": 350, "name_thunder": 1500, "name_tiwaz": 2800,
  "name_venom": 1100, "name_void": 2500, "name_vortex_mark": 3500,
  "name_zenith": 1100,
  "skin_blood_hunter": 8000, "skin_void_shadow": 7000,
  "theme_abyss_teal": 3800, "theme_abyssal": 3500, "theme_alchemist": 5000,
  "theme_ancient_seal": 8500, "theme_arctic_night": 2200, "theme_arctic_void": 2000,
  "theme_autumn_ember": 2800, "theme_blood": 3200, "theme_blood_night": 2500,
  "theme_bloom": 2000, "theme_chosen": 9000, "theme_clay": 150,
  "theme_clover": 900, "theme_crimson_fest": 1800, "theme_crimson_void": 4500,
  "theme_crystal_glass": 300, "theme_crystal_prism": 6500, "theme_cyber": 500,
  "theme_cyber_wave": 2600, "theme_deep_space": 7500, "theme_demon_fire": 7000,
  "theme_demon_pact": 5500, "theme_echo": 800, "theme_electric_storm": 3000,
  "theme_ember_glow": 1500, "theme_ember_night": 2200, "theme_florette": 1800,
  "theme_forest": 1600, "theme_frost_kingdom": 2400, "theme_glacial": 1600,
  "theme_golden_crown": 9000, "theme_golden_empire": 8000, "theme_infernal_rose": 4800,
  "theme_inferno_core": 5000, "theme_jade": 3000, "theme_liquid_resin": 300,
  "theme_lunar_eclipse": 2000, "theme_midnight_reign": 2500, "theme_nebula_heart": 7500,
  "theme_neon_operator": 3800, "theme_neon_pulse": 7000, "theme_nova_burst": 3000,
  "theme_phantom_glass": 3500, "theme_phantom_violet": 3200, "theme_reaper": 7500,
  "theme_redacted": 3800, "theme_rose_heart": 1800, "theme_rose_velvet": 4500,
  "theme_sakura_haze": 2800, "theme_sakura_realm": 2500, "theme_shadow_realm": 4200,
  "theme_shadow_sakura": 2800, "theme_signal": 2400, "theme_snow_petal": 1400,
  "theme_solstice": 6500, "theme_spirit": 4200, "theme_stardust": 2600,
  "theme_stellar_drift": 8500, "theme_synthwave": 1600, "theme_thunder_strike": 4000,
  "theme_toxic_acid": 2200, "theme_toxic_realm": 3600, "theme_twilight": 4000,
  "theme_violet_storm": 4200, "theme_void_black": 6000, "theme_void_fracture": 4000,
  "theme_void_jade": 2200, "theme_vortex": 4600,
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") ?? "";
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!checkRateLimit(`shop:${authUser.id}`, 20, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Slow down." }, { status: 429 });
    }

    const { item_id } = await request.json();
    if (!item_id || typeof item_id !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const price = ITEM_PRICES[item_id];
    if (price === undefined) {
      return NextResponse.json({ error: "Unknown item" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin.rpc("purchase_item", {
      p_user_id: authUser.id,
      p_item_id: item_id,
      p_price_marks: price,
    });

    if (error) {
      console.error("[mobile/shop/purchase] rpc error:", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    const result = data as { error?: string; balance?: number; success?: boolean; new_balance?: number };

    if (result.error === "insufficient_marks") {
      return NextResponse.json({ error: "insufficient_marks", balance: result.balance }, { status: 402 });
    }
    if (result.error === "already_owned") {
      return NextResponse.json({ error: "already_owned" }, { status: 409 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, new_balance: result.new_balance });
  } catch (err: any) {
    console.error("[mobile/shop/purchase]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
