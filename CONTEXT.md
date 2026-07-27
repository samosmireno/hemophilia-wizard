# CONTEXT — Hemophilia Treatment Wizard (HM-85L)

Canonical domain/content reference for this project. Everything here was extracted
from the client source files in `documents/`. **Every fact is tagged with the source
file it came from** so it can be re-verified and updated.

> This is the repo's domain doc per `docs/agents/domain.md`. Use the vocabulary in the
> [Glossary](#glossary) when naming domain concepts elsewhere (issues, ADRs, tests).

## Maintenance

- **Last reviewed:** 2026-07-27 (full re-scan of `[PDF-V]` as a diagram, not just text — traced
  branch connections, color-coding, and all 32 pop-up notes, see [§4](#4-treatment-wizard-flow-main-engine);
  plus a `[PPTX]` re-scan that completed the education content in [§7](#7-education-content))
- **How to update:** when a source file changes, update the affected section and keep its
  source tag. If a fact spans multiple sources that disagree, record both and note which
  one we treat as authoritative (see [Data quality & conflicts](#data-quality--conflicts)).
- **Source tags:**
  | Tag       | File                                                          | Notes                                                                                                                                                                                                                                                                                                                                          |
  | --------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `[XLSX]`  | `documents/Treatment wizard grid_V2.xlsx`                     | 5 sheets; refer to sheets as **S1–S5** (see below)                                                                                                                                                                                                                                                                                             |
  | `[PDF]`   | _(removed)_ — was `HM-85L Hemophilia Treatment Wizard_V2.pdf` | Raster blueprint; deleted with the V2 files. Same blueprint as `[PDF-V]`; historical facts tagged `[PDF]` now live in the vector                                                                                                                                                                                                               |
  | `[PDF-V]` | `documents/HM-85L Hemophilia Treatment Wizard_V3_Vector.pdf`  | **Vector** blueprint (current, only surviving PDF) — selectable text, highest fidelity; prefer this for wording                                                                                                                                                                                                                                |
  | `[PPTX]`  | `documents/HM-85L treatment wizard slides.pptx`               | 7 slides (re-scanned 2026-07-27): 1–4 = per-scenario therapeutic-class panels, 5 = hemostatic rebalancing agents, **6 = severity & bleeding table** ([§7.2](#72-hemophilia-disease-background)), **7 = "Treatment Options" class matrix** ([§7.3](#73-treatment-options-overview-class-matrix-pptx-slide-7)) + the master wizard diagram image |
  | `[BUILD]` | code in `src/data/` + `treatment-wizard-demo.html`            | What we've implemented from the above                                                                                                                                                                                                                                                                                                          |

`[PDF]` (raster, now removed) and `[PDF-V]` are the **same blueprint**; the vector `[PDF-V]` is the sole surviving copy — cite it for exact text.

### XLSX sheet map `[XLSX]`

S1 = "All treatments for HA and HB" (all rows visible — **source of truth**);
S2 = "FVIII mimetics"; S3 = "Hemostatic Rebalancing Agents"; S4 = "Clotting factor replacement";
S5 = "Gene Therapy". **S2–S5 are S1 with out-of-class rows _hidden_** — i.e. saved
per-class filtered views, not separate data.

---

## 1. What this project is `[PDF-V]` `[PPTX]`

An **interactive medical-education "Treatment Wizard" web app** (activity code **HM-85L**)
for clinicians, on **novel & emerging prophylaxis for hemophilia A and B** — chiefly
non-factor therapies (NFTs). It is an accredited-CME-style activity: evidence-based, fully
referenced, with a curated resource library and a **post-use outcomes survey**. It is
educational/decision-support — not a prescriptive dosing calculator.

Two complementary engines (confirmed with the client):

1. **Guided wizard (MAIN)** — a branching decision tree that walks
   `type → inhibitors → reason for switching` to a **clinically curated** list of novel
   therapies. `[PDF-V]`
2. **"Explore therapy options" table (SECONDARY)** — a filterable comparison table of all
   treatments, launched on demand. `[XLSX]`

---

## 2. Information architecture (blueprint layout) `[PDF-V]` `[PDF]`

Left → right on one canvas:

1. **Education blocks** — disease background, severity & bleeding patterns, NFT
   benefits/challenges, mechanisms of rebalancing agents, glossary. See [§7](#7-education-content).
2. **Treatment Wizard** — the branching flow. See [§4](#4-treatment-wizard-flow-main-engine).
3. **Per-drug pop-up information sheets** — grouped by class as tabs. See [§6](#6-drug-information-sheets).
4. **"Explore therapy options for HA/HB"** button → the filterable table. See [§5](#5-explore-therapy-options-table-secondary-engine).
5. **Resources, References, Glossary, Survey.** See [§7](#7-education-content)–[§10](#10-outcomes-survey).

---

## 3. Client / developer notes on the blueprint `[PDF-V]`

Visible annotations left by the author for the developer (verbatim):

- 🟡 (near "Explore therapy options for HA/HB", above a table image) — _"Nicole: should
  these be displayed as separate p[op-ups]… **Is there a way that we can launch the table
  from the app so users can filter on each column?**"_ → **This is the origin of `Treatment
wizard grid.xlsx`**: the grid is the example of the filterable table.
- 🟣 — _"These pop up information sheets can be displayed however you determine is best —
  ideas include separate pop ups from the buttons in the dark green boxes or as tabs such
  as in the example below."_
- Repeated on each wizard leaf: _"Note: Please add a button for each drug which will pop up
  to an information sheet."_

**New annotations added in V3 (2026-07-25):** `[PDF-V]`

- **Considerations/Strategies tabs** — _"For each of the 4 boxes (Improve bleeding control,
  Reduce monitoring requirement, Increase adherence, Reduce treatment burden) in each section
  (2 green and 2 pink) add 2 buttons or tabs called 'Considerations' and 'Strategies' to launch
  the text in the light blue boxes to the right."_ → each reason box has **two** blocks in the
  source light-blue boxes: a "Considerations for …" list **and** a "Strategies for …" list.
  **Resolved in the 2026-07-27 re-scan:** the source carries **32 distinct pop-up notes**
  (4 scenarios × 4 reasons × {Considerations, Strategies}) — the notes are **scenario-specific,
  not shared per reason** (e.g. the "Improving Bleeding Control" text differs between HB and HA,
  and between ±inhibitors). Both the Considerations **and** the Strategies bullets are now
  transcribed in full in `[PDF-V]`'s raw dump (`documents/out_raw.txt`, CENTER band) and are now
  encoded scenario-specifically in the data model (`[BUILD]` `wizard.ts` → `SCENARIO_NOTES`, with
  both Considerations and Strategies per (scenario, reason)); see
  [§4.2](#42-scenario-specific-considerations--strategies-notes).
- **Reference list overhaul** — _"Updated the entire reference list — please superscript all
  trademarks (ie, ®)."_ The bibliography was reformatted (abbreviated author lists/journals,
  "PI" for Prescribing Information, `®`/`™` superscripted). Content/citations are essentially
  unchanged; see [§9](#9-references--resources).
- **Image updated** — _"Note: Image has been updated from the previous version."_
- **Table updated** — _"Table updated: FVIII mimetic / Denecimig"_ → the comparison table's
  Denecimig row changed schedule to `Monthly, bimonthly, weekly` (already applied `[XLSX]`/`[BUILD]`).

---

## 4. Treatment Wizard flow (MAIN engine) `[PDF-V]` `[BUILD]`

Entry node (purple diamond): **"Explore Novel Prophylactic Therapy Options for Your Patient."**

1. **Q1 — "Does the patient have Hemophilia A or Hemophilia B?"**
2. **Q2 — "Does the patient have inhibitors?"** (Yes / No)
3. **Q3 — Primary reason for switching therapy?** one of:
   `improving bleeding control` · `increased adherence` · `reduced treatment burden` ·
   `reduced monitoring requirement`
4. **Leaf** — a curated set of novel therapies + the scenario-specific Considerations & Strategies
   note pair ([§4.2](#42-scenario-specific-considerations--strategies-notes)). Each recommended drug links to its
   info sheet ([§6](#6-drug-information-sheets)).

4 scenarios total (A/B × ±inhibitors); each has its own slide `[PPTX]` slides 1–4:
"Hemophilia A Without/With Inhibitors", "Hemophilia B Without/With Inhibitors".

Blueprint layout note (verified 2026-07-27 by rendering the diagram): the canvas is split by a
**dashed horizontal midline explicitly labelled "hemophilia B" (top) / "hemophilia A" (bottom)** —
so **top half = Hemophilia B**, **bottom half = Hemophilia A** is confirmed (was previously only
inferred from text coordinates). `[PDF-V]`

**Branch structure & color code `[PDF-V]`.** Within each half the inhibitor question (green
diamond, Yes/No) splits into two scenario bands, ordered top→bottom **+inhibitors then
−inhibitors**, and the bands are color-coded: **GREEN background = _with_ inhibitors, PINK
background = _without_ inhibitors** (consistent across both halves). Full top→bottom order of the
four scenario bands: `HB +inhib (green)` · `HB −inhib (pink)` · `HA +inhib (green)` ·
`HA −inhib (pink)`.

Each scenario band opens with a **"Therapeutic classes to consider"** box (class-level guidance,
shown before the reason question) `[PDF-V]`:

| Scenario      | Therapeutic classes box                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **HB +inhib** | Hemostatic rebalancing agents. _Note: Bypassing agents (aPCC, rFVIIa) can manage breakthrough bleeds in patients with inhibitors, but sustained prophylaxis with these agents remains challenging._ |
| **HB −inhib** | Hemostatic rebalancing agents · FIX prophylaxis · Gene therapy                                                                                                                                      |
| **HA +inhib** | Factor VIIIa mimetic · Hemostatic rebalancing agent                                                                                                                                                 |
| **HA −inhib** | Recombinant FVIII concentrates · Factor VIIIa mimetics · Hemostatic rebalancing agents                                                                                                              |

Each box carries the annotation _"Click on the box(es) below to learn more about each type of
therapy"_ and links to the class-level education pop-ups. Encoded in `[BUILD]` `src/data/wizard.ts`
→ `CLASSES_TO_CONSIDER[scenario]` (`{ classes: string[]; caveat? }`, verbatim labels — not the
`TreatmentClass` enum, since the source phrases the same class differently per scenario).

### 4.1 Recommendation matrix (scenario × reason → agents) `[PDF-V]`

**Authored lookup — NOT a computed filter.** Lists are hand-picked in the source and are
intentionally not derivable by filtering.

| Reason ↓ / Scenario →              | A, no inhib                  | A, inhib                     | B, no inhib                 | B, inhib          |
| ---------------------------------- | ---------------------------- | ---------------------------- | --------------------------- | ----------------- |
| **Improving bleeding control**     | Emi, Dene, Conci, Mars, Fitu | Emi, Dene, Conci, Mars, Fitu | Conci, Mars, Fitu           | Conci, Mars, Fitu |
| **Increased adherence**            | Emi, Dene, Conci, Mars, Fitu | Emi, Dene, Conci, Mars, Fitu | Conci, Mars, Fitu, **Gene** | Conci, Mars, Fitu |
| **Reduced treatment burden**       | Emi, Dene, Conci, Mars, Fitu | Emi, Dene, Conci, Mars, Fitu | Conci, Mars, Fitu, **Gene** | Conci, Mars, Fitu |
| **Reduced monitoring requirement** | Emi, Dene                    | Emi, Dene                    | Conci, Mars, Fitu           | Conci, Mars, Fitu |

Abbreviations: Emi = Emicizumab, Dene = Denecimig, Conci = Concizumab, Mars = Marstacimab,
Fitu = Fitusiran, Gene = Etranacogene dezaparvovec-drlb (gene therapy).

**Authored nuances (why it's not a filter):**

- Hemophilia A + _reduced monitoring_ → **only the two FVIIIa mimetics** (rebalancing agents
  need AT/plasma monitoring).
- **Gene therapy** appears **only** for Hemophilia B _without_ inhibitors, under adherence &
  treatment burden (Etranacogene is HB, no-inhibitor, adults only).
- FVIIIa mimetics (Emi, Dene) never appear in Hemophilia B branches (they are HA-only).

Encoded in `[BUILD]` `src/data/wizard.ts` → `RECOMMENDATIONS[scenario][reason]`, resolver
`recommend(type, hasInhibitors, reason)`.

### 4.2 Scenario-specific Considerations & Strategies notes `[PDF-V]`

**Corrected 2026-07-27.** Each leaf shows a light-blue pop-up pair — a **Considerations** list and
a **Strategies** list — plus a _"Novel therapies to consider if [reason] is the primary reason for
switching therapies:"_ header with the recommended-drug list ([§4.1](#41-recommendation-matrix-scenario--reason--agents)).
The source has **32 notes = 4 scenarios × 4 reasons × {Considerations, Strategies}**, and the copy
is **scenario-specific**, not shared per reason. Examples of the divergence:

- _Improving Bleeding Control_ — **HB** notes open "Hemostatic rebalancing agents for HB
  prophylaxis represent a major advance…"; **HA +inhib** opens "NFTs for hemophilia prophylaxis…
  Patients with inhibitors often have inadequate bleeding control with bypassing agents… guidelines
  recommend prophylaxis with emicizumab over bypassing agents…"; the **HA** Strategies add a
  "washout period of 3 to 5 half-lives of factor therapy before starting anti-TFPI" bullet absent
  from HB.
- _Reduce Treatment Burden / Adherence_ — the **HB −inhib** notes add gene-therapy bullets
  (post-infusion monitoring, one-time IV) that the other scenarios omit.

**Title variants across scenarios (verbatim, source is inconsistent):**

- Bleeding control: "Considerations/Strategies for Improving Bleeding Control" (all 4).
- Adherence: "Considerations/Strategies for Improving Treatment Adherence" (all 4).
- Treatment burden: "Considerations/Strategies for Reducing Treatment Burden and Improving QoL" (all 4).
- Monitoring: "…for Reducing Monitoring Requirement**s**" (HB +inhib) · "…for Reducing Monitoring
  Requirement" (HB −inhib, HA −inhib) · "…**to Reduce Monitoring**" (HA +inhib).

**Full verbatim text** for all 32 notes is in `documents/out_raw.txt` (CENTER band), grouped by the
four scenario bands top→bottom.

**Data-model status `[BUILD]`.** Implemented 2026-07-27: `src/data/wizard.ts` → `SCENARIO_NOTES`
is `Record<ScenarioKey, Record<SwitchReason, { considerations, strategies }>>` (32 notes,
verbatim), `recommend()` returns the scenario's note pair, and `treatment-wizard-demo.html` mirrors
it. The old shared per-reason `REASON_NOTES` is gone.

---

## 5. "Explore therapy options" table (SECONDARY engine) `[XLSX]` `[PDF-V]` `[BUILD]`

The filterable comparison table the yellow sticky note asks for. Columns (S1 headers `[XLSX]`;
`[PDF-V]` embeds a near-identical table titled with a "Toxicity & Monitoring" column):

`Treatment class · Agent · MOA · Hemophilia Type · Indicated with inhibitors · Patient Age ·
Administration Route · Schedule · Monitoring & Safety`

Three columns are dropdown **filters**: Treatment class, Hemophilia Type (A / B / A + B),
Indicated with inhibitors (Yes / No). "A + B" means eligible for both.

The `[PDF-V]` embedded copy of the table fills in the **"Toxicity & Monitoring"** column per row
(the S1 header calls it "Monitoring & Safety"), transcribed 2026-07-27 in `documents/out_raw.txt`
(RIGHT band). Representative values: SHL/EHL/UHL → _"FVIII/FIX monitoring; PK-guided dose
optimization; peak/trough levels as needed"_ (UHL adds hypersensitivity + FVIII inhibitor
development); Emicizumab → _"Thrombotic events in pts on aPCC at high doses"_; Denecimig → _"TBD"_;
Concizumab/Marstacimab → _"Thrombotic events, hypersensitivity reactions, increased lab values of
fibrin D-dimer and prothrombin fragment"_; Fitusiran → _"Thrombotic events; liver enzymes, gall
bladder disease, anti-thrombin monitoring"_; Etranacogene → _"Infusion reactions, liver function
monitoring, requires immunosuppressive therapy; supply shortage"_. These are terser than the
per-drug sheet Monitoring fields in [§6](#6-drug-information-sheets) — the sheets are authoritative
for detail.

### 5.1 Treatment roster (9 rows, S1 verbatim) `[XLSX]`

| Agent                          | Class                                           | MOA                 | Type  | Inhib |     Age     | Route                               | Schedule                   |
| ------------------------------ | ----------------------------------------------- | ------------------- | :---: | :---: | :---------: | ----------------------------------- | -------------------------- |
| SHL                            | Clotting factor replacement                     | Standard half-life  | A + B |  No   |     0+      | IV                                  | 3X/week                    |
| EHL                            | Clotting factor replacement                     | Extended half-life  | A + B |  No   |     0+      | IV                                  | ~2X/week                   |
| Efanesoctocog alfa             | Clotting factor replacement                     | Ultralong half-life |   A   |  No   |     0+      | IV                                  | Weekly                     |
| Emicizumab                     | Factor VIIIa mimetic                            | FVIIIa-mimetic BsAb |   A   |  Yes  |     0+      | SC (vial/syringe)                   | Monthly, bimonthly, weekly |
| Denecimig                      | Factor VIIIa mimetic (emerging/investigational) | FVIIIa-mimetic BsAb |   A   |  Yes  | TBD (>1 yr) | SC (prefilled pen)                  | Monthly, bimonthly, weekly |
| Concizumab                     | Hemostatic rebalancing agent                    | TFPI mAB            | A + B |  Yes  |     12+     | SC (prefilled pen)                  | Daily                      |
| Marstacimab                    | Hemostatic rebalancing agent                    | TFPI mAB            | A + B |  Yes  |     6+      | SC (prefilled pen)                  | Weekly                     |
| Fitusiran                      | Hemostatic rebalancing agent                    | AT-directed siRNA   | A + B |  Yes  |     12+     | SC (prefilled pen or vial/syringe)ᴬ | Every 1-2 months           |
| Etranacogene dezaparvovec-drlb | Gene therapy                                    | AAV vector          |   B   |  No   |   Adults    | IV                                  | Single infusion            |

ᴬ Fitusiran route: enriched from S3 / `[PDF-V]` (`…pen or vial/syringe`); S1 had `…pen` only —
the one deliberate departure from S1 (see [Data quality](#data-quality--conflicts)).

### 5.2 Filter logic `[BUILD]`

`src/data/treatments.ts` — computed eligibility filter: `evaluateTreatments(criteria)` /
`filterTreatments(criteria)`. Rules: type ∈ typesServed · (hasInhibitors ⇒ inhibitors=="Yes")
· age ≥ minAge · optional class. Age parse: `0+→0, 6+→6, 12+→12, Adults→18, "TBD >1yr"→1
(provisional)`. `filterTreatments({treatmentClass})` reproduces the S2–S5 per-class tabs.

---

## 6. Drug information sheets `[PDF-V]`

Per-drug pop-up content (fields: Class/Target · Indication · Dosage & Administration ·
Monitoring · Clinical Trials). **Built `[BUILD]`** as `src/data/drug-sheets.ts` → `DRUG_SHEETS`
(7 sheets, keyed by verbatim `agent`; `sheetFor(agent)` accessor; `trials` structured as
`{ name, id, citation? }`). **No SHL/EHL sheet** — the source authored none (they are generic
class rows in the comparison table, not branded agents), so the acceptance criterion is "every
agent the wizard can **recommend** has a sheet" (all 6 novel `AGENTS` + Efanesoctocog covered).

**Efanesoctocog alfa** — _Class:_ clotting factor replacement, ultralong half-life.
_Indications:_ adults & pediatric HA; routine prophylaxis; on-demand bleed control;
perioperative management. _Dosage:_ IV, 50 IU/kg once weekly; optimize via plasma FVIII
(aPTT one-stage assay). _Monitoring:_ hypersensitivity/anaphylaxis; neutralizing antibodies
(inhibitors); ADAs. _Trials:_ Study 1 (NCT04161495), Study 2 (NCT04759193).

**Emicizumab** — _Class/Target:_ FVIIIa-mimetic, FIXa×FX BsAb. _Indication:_ HA ±inhibitors,
newborn & older. _Dosage:_ SC (vial & syringe); load 3 mg/kg weekly ×4 wks; maintenance
1.5 mg/kg weekly, 3 mg/kg q2wks, or 6 mg/kg monthly. _Monitoring:_ injection-site reactions;
lab coagulation test interference (don't use intrinsic-pathway clotting tests — ACT, Bethesda,
aPTT-based — for FVIII inhibitor titers); thrombotic microangiopathy/thrombotic events; aPCC
interaction; ADAs. _Trials:_ HAVEN 3 (NCT02847637), HAVEN 4 (NCT03020160), HAVEN 2 (NCT02795767).

**Denecimig (emerging/investigational)** — _Class/Target:_ FVIIIa-mimetic BsAb, FIXa×FX.
_Indication:_ TBD (FDA); trials in HA ±inhibitors, patients >1 yr. _Dosage:_ SC prefilled pen
w/ attachable syringe; no washout when switching from emicizumab. _Monitoring:_ TBD (phase 3):
mostly mild transient injection-site reactions; no thromboembolic/TMA events; no
hypersensitivity; no clinically relevant lab findings. _Trials (with the conference/journal
citation tails the sheet carries, verbatim):_ FRONTIER2 (NCT05053139) — _See Mancuso NEJM 2026_;
FRONTIER3 (NCT05306418) — _See Mahlangu EAHAD 2025_; FRONTIER4 (NCT05685238) — _See Windyga ISTH
2026_; FRONTEIR5 (NCT05878938) — _See Oldenburg ISTH 2026_. _(Source spells "FRONTEIR5" and
"Oldenburg"; the trial-program abstracts are also listed in the left education band.)_

**Concizumab** — _Class/Target:_ hemostatic rebalancing agent, TFPI mAB. _Indication:_ routine
prophylaxis, ≥12 yrs, HA/HB ±inhibitors. _Dosage:_ SC prefilled pen; D1 load 1 mg/kg; D2 daily
0.2 mg/kg until individualized maintenance; optimize after 4 wks via concizumab plasma
concentration (ELISA). _Monitoring:_ hypersensitivity; routine plasma concentrations;
thromboembolic events; ↑ fibrin D-dimer & prothrombin fragment; ADAs. _Trials:_ Explorer7
(NCT04083781), Explorer8 (NCT04082429).

**Marstacimab** — _Class/Target:_ hemostatic rebalancing agent, TFPI mAB. _Indication:_ routine
prophylaxis, ≥6 yrs, HA/HB ±inhibitors. _Dosage:_ SC (prefilled pen or syringe); load 300 mg
(two 150 mg); maintenance 150 mg weekly (start 1 wk after load); consider 300 mg weekly if

> 50 kg. _Monitoring:_ hypersensitivity; thromboembolic events; ↑ fibrin D-dimer & prothrombin
> fragment; ADAs. _Trials:_ BASIS (NCT03938792), BASIS KIDS (NCT05611801).

**Fitusiran** — _Class/Target:_ hemostatic rebalancing agent, AT-directed siRNA. _Indication:_
routine prophylaxis, ≥12 yrs, HA/HB ±inhibitors. _Dosage:_ SC (prefilled pen, or syringe & vial
for lower dose); start 50 mg once every 2 months; monitor AT activity (FDA-cleared test),
maintain AT 15–35% by adjusting dose/frequency. _Monitoring:_ thrombotic events; AT levels;
acute/recurrent gallbladder disease; hepatotoxicity (LFTs baseline, monthly >6 mo, after dose
↑, periodically); ADAs. _Trials:_ ATLAS-INH (NCT03417102), ATLAS-A/B (NCT03417245), ATLAS-OLE
(NCT03754790).

**Etranacogene dezaparvovec-drlb** — _Class/Target:_ AAV vector-based gene therapy.
_Indication:_ adults with HB **without** FIX inhibitors. _Dosage:_ single IV infusion,
2×10¹³ genome copies/kg. _Monitoring:_ eligibility (LFTs, hepatic ultrasound/elastography,
hepatitis B/C, hepatologist consult); hypersensitivity; hepatotoxicity (LFTs weekly ×3 mo then
monthly ×1 yr); immune-mediated neutralizing antibodies to AAV5 capsid; FIX inhibitor
observation; plasma FIX activity (e.g. weekly ×3 mo, aPTT one-stage assay). _Trial:_
prospective open-label study (NCT03569891).

---

## 7. Education content `[PDF-V]` `[PPTX]`

The left third of the blueprint is a set of **education blocks**, mostly authored as
**"Click here:" click-through pop-ups** (see [§7.7](#77-click-through-pop-up-index)). Full verbatim
text is in `documents/out_raw.txt` (LEFT band). Fields below feed issue 11 (education-blocks).
Content is `[PDF-V]` unless tagged `[PPTX]`.

### 7.1 The evolving landscape / personalized therapy

- Framing block **"The Future Is Now: Personalizing Hemophilia Prophylaxis in an Era of Novel
  Agents."** The hemophilia treatment landscape is rapidly evolving; novel therapies improve bleed
  protection, reduce treatment burden, and enable individualized treatment. Increased
  personalization adds complexity to clinical decision-making and optimal treatment selection.
- **Novel therapeutic classes:** FVIIIa-mimetic BsAbs (HA) · Hemostatic rebalancing agents (HA/HB)
  · Gene therapy (HB).

### 7.2 Hemophilia disease background

- **Disease mechanism.** HA and HB are rare but debilitating congenital bleeding disorders from
  **X-linked recessive** inheritance of clotting-factor deficiencies. **HA:** FVIII deficiency due
  to _F8_ gene mutation; **HB:** FIX deficiency due to _F9_ gene mutation. Deficiency/absence of
  FVIII or FIX → inadequate thrombin generation → increased bleeding.
- **Diagnosis.** Laboratory evaluation showing **prolonged aPTT with normal PT and fibrinogen**,
  confirmed by testing for FVIII/FIX deficiency, and further characterized by _F8_/_F9_ genetic
  testing. (Click-through: "Diagnostic algorithm for HA/HB.")
- **Severity by FVIII/IX level** `[PPTX]` slide 6:

  | Severity     | Factor level | Bleeding manifestation                                                                                                      |
  | ------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
  | **Mild**     | >5% – <40%   | Rare spontaneous bleeding; prolonged bleeding with major trauma or surgery                                                  |
  | **Moderate** | 1% – 5%      | Occasional spontaneous bleeding; prolonged bleeding with minor trauma or surgery                                            |
  | **Severe**   | <1%          | Frequent hemorrhages in joints, muscles, and soft tissues; life-threatening bleeding episodes (eg, intracranial hemorrhage) |

  Related click-throughs: "Disease severity and bleeding in [males/females]", "Typical bleeding
  manifestations in males and females with HA/HB."

### 7.3 Treatment-options overview (class matrix) `[PPTX]` slide 7

Class-level comparison distinct from the [§5](#5-explore-therapy-options-table-secondary-engine)
agent table:

| Treatment option        | Mechanism of action                                                                 | Population                    | Indication                                              | Route |
| ----------------------- | ----------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------- | :---: |
| FVIII/FIX concentratesᵃ | ↑ FVIII by 2 IU/dL per IU/kg; ↑ FIX by 1 IU/dL per IU/kg                            | HA/HB without inhibitors      | Prophylaxis; treatment of bleeding episodes and surgery |  IV   |
| FVIII mimeticsᵇ         | Mimics FVIII activity; 1st-generation equivalent to FVIII ~10–12 IU/dL              | HA with/without inhibitors    | Prophylaxis                                             |  SC   |
| Rebalancing: siRNAᵇ     | Reduces antithrombin; increases thrombin generation                                 | HA/HB with/without inhibitors | Prophylaxis                                             |  SC   |
| Rebalancing: anti-TFPIᵇ | Inhibits TFPI; increases thrombin generation                                        | HA/HB with/without inhibitors | Prophylaxis                                             |  SC   |
| AAV gene therapyᶜ       | Recombinant AAV vector delivers a functional copy of the _F9_ gene into hepatocytes | HB without inhibitors         | Long-term prophylaxis / treatment break                 |  IV   |

ᵃ EHL recombinant factors use pegylation or fusion to albumin or Fc fragments to extend half-life
(fusion proteins ↑ half-life 1.5–6-fold). ᵇ Breakthrough bleeds: without inhibitors → treat with
FVIII/FIX concentrates; with inhibitors → treat with bypassing agents. ᶜ Responses show
inter-individual variability and uncertain duration.

### 7.4 Clotting factor replacement therapy

- Historically HA/HB were managed with clotting factor replacement, given prophylactically to
  prevent bleeding or episodically to manage bleeds. **Prophylactic treatment is recommended over
  episodic** to control bleeding in patients with **moderately severe/severe** hemophilia.
  Prophylaxis greatly reduces bleeding risk with minimal toxicity; recommendations for prophylaxis
  **may apply even for FVIII plasma levels ≥2 IU/dL**.
- **Benefits & Challenges Associated with Clotting Factor Replacement Therapies** (SHL, EHL, UHL
  FVIII/FIX products):
  - _Benefits:_ initiation and amplification of the clotting cascade; dosing frequency varies by
    product and patient need; well-understood long-term safety and efficacy.
  - _Challenges:_ IV administration, infusion preparation, venous access, and ongoing
    dosing/monitoring (FVIII/FIX monitoring, PK-guided dose optimization, peak/trough levels);
    development of neutralizing antibodies (inhibitors) to FVIII/FIX can reduce efficacy and
    increase risk of breakthrough bleeding and joint damage.

### 7.5 FVIIIa-mimetic BsAbs (approved & emerging agents for HA)

- **Class.** BsAbs simultaneously target two antigens; FVIIIa-mimetic BsAbs are engineered to
  **bridge FIXa and FX**, mimicking FVIII cofactor function and triggering the coagulation cascade.
  Emicizumab established FVIIIa-mimetic therapy as a **first-in-class SC nonfactor prophylaxis**
  option for HA; emerging agents (denecimig/Mim8) aim to further optimize hemostatic activity and
  dosing convenience.
- **Emicizumab (FDA-approved).** Recombinant humanized BsAb; **IgG4** immunoglobulin combining two
  binding fragments for FIXa and FX. FDA-approved for prophylaxis of HA ±inhibitors in newborns or
  older; SC monthly/bimonthly/weekly. MOA: binds activated FIXa and FX, enhancing catalytic
  efficiency of FIXa in converting FX on activated platelets.
- **Denecimig (Mim8, investigational — under FDA review).** Monovalent anti-FIXa arm enhances FIXa
  proteolytic activity to facilitate FX activation, thrombin generation, and clot formation.
  Pre-clinical: **Mim8 potency up to 18-fold greater** than an emicizumab-equivalent analog.
  **Tiered dosing by body weight** avoids dose calculations, reduces burden, minimizes waste. BLA
  submitted for routine prophylaxis in adult & pediatric HA ±inhibitors, supported by the phase 3
  **FRONTIER** program: FRONTIER2 (SC monthly/weekly, >12 yr), FRONTIER3 (monthly/weekly, >1 yr),
  FRONTIER4 (OLE). See also drug sheet [§6](#6-drug-information-sheets).

### 7.6 Non-factor replacement therapies (NFTs) & hemostatic rebalancing agents

- **NFT benefits/challenges** (block "Non-factor Replacement Therapies"): _Benefits:_ SC
  administration, stable thrombin generation, long half-life, shifts disease **severe → mild**,
  effective regardless of inhibitor status. _Challenges:_ increased thrombotic risk, ADA
  development, complex MOA, lack of standardized lab monitoring, management of major surgery, use in
  older populations.
- **Hemostatic rebalancing agents in treatment of HA/HB** — enhance thrombin generation by
  targeting endogenous anticoagulant pathways (**TFPI, AT, and the APC/protein S system**).
  - _Anti-TFPI mAbs:_ TFPI limits coagulation by inhibiting FXa and the tissue factor–FVIIa
    complex; **concizumab and marstacimab** selectively bind the **K2 domain of TFPI**, reducing
    TFPI-mediated inhibition of FXa and enabling FXa generation via the FVIIa–TF pathway.
  - _AT-directed siRNA:_ AT neutralizes thrombin and FXa; **fitusiran** uses RNA interference to
    reduce hepatic AT production, restoring thrombin generation and rebalancing hemostasis.
  - Figure: "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade" (image; APC =
    activated protein C, AT = antithrombin, TFPI = tissue factor pathway inhibitor).
- **Investigational FVIIIa-mimetic therapies in early-stage development:**
  - **NXT007** — next-generation BsAb engineered by modifying emicizumab (derived from emicizumab
    heavy-chain regions with two distinct light chains carrying charged-residue mutations to
    optimize chain pairing/cofactor activity). In vitro, NXT007-treated plasma achieved coagulation
    activity equivalent to **100 IU/dL FVIII** in a TF-triggered thrombin-generation assay. Trials:
    NXTAGE (jRCT2080224835), WP44714 (NCT05987449).
  - **Inno8** — novel **VHH-based, once-daily oral** FVIIIa-mimetic for HA; under evaluation in the
    nonrandomized open-label phase 1 **VOYAGER2** trial (NCT07220564).

### 7.7 Click-through pop-up index `[PDF-V]`

Education is navigated via "Click here:" buttons. Targets seen in the blueprint: _Disease mechanism
for HA/HB_ · _Diagnostic algorithm for HA/HB_ · _Disease severity and bleeding in males/females_ ·
_Typical bleeding manifestations in males and females with HA/HB_ · _Benefits and challenges of
clotting-factor replacement therapies_ · _Benefits and challenges of NFTs_ · _Novel therapy classes
for HA/HB_ · _Mechanisms of hemostatic rebalancing agents within the coagulation cascade_ ·
_Emicizumab Overview_ · _Denecimig/Mim8 Overview_.

> **Image-borne content (not in any text layer):** the PDF embeds **24 figures** — MOA/coagulation-
> cascade diagrams, the NXT007 BsAb structure, Inno8 MOA, the severity/bleeding schematics, and the
> per-scenario therapeutic-class illustration panels. These are assets, not extractable text; a
> Phase-1 education screen that surfaces them needs the image files plus the captions above.

---

## 8. Glossary `[PDF-V]`

Use this vocabulary in issues/ADRs/tests. Definitions (abridged from source):

- **Bispecific antibody** — engineered antibody binding two distinct antigens simultaneously.
- **Breakthrough bleeding** — a bleed occurring despite ongoing prophylaxis.
- **Bypassing agent** — hemostatic therapy promoting clot formation without needing FVIII/FIX.
- **Factor VIIIa-mimetic bispecific antibody** — NFT bridging FIXa and FX to mimic FVIIIa cofactor activity.
- **Factor replacement therapy** — IV FVIII/FIX concentrates to restore deficient clotting factor.
- **Gene therapy** — AAV vector-based therapy delivering a functional clotting-factor transgene.
- **Hemophilia A** — congenital bleeding disorder from deficient/dysfunctional factor VIII.
- **Hemophilia B** — congenital bleeding disorder from deficient/dysfunctional factor IX.
- **Hemostatic rebalancing agent** — NFT enhancing thrombin generation by targeting endogenous anticoagulant pathways.
- **Inhibitors** — neutralizing alloantibodies that reduce/eliminate response to factor replacement.
- **Nonfactor therapy (NFT)** — improves hemostasis without directly replacing FVIII/FIX (mimetics, rebalancing agents).

### Acronyms `[PDF-V]`

AAV adeno-associated virus · ACT activated clotting time · ADA anti-drug antibody · aPCC activated
prothrombin complex concentrate · APC activated protein C · aPTT activated partial thromboplastin time ·
AT antithrombin · BLA Biologics License Application · BsAb bispecific antibody · D day ·
ELISA enzyme-linked immunosorbent assay · Fab fragment antigen-binding · FDA US Food and Drug
Administration · FIX(a) (activated) factor IX · FVIIa activated factor VII · FVIII(a)
(activated) factor VIII · FX(a) (activated) factor X · HA hemophilia A · HB hemophilia B ·
IV intravenous · LFT liver function test · mAb monoclonal antibody · MOA mechanism of action ·
NFT non-factor therapy · OLE open-label extension · PK pharmacokinetic · PT prothrombin time ·
QoL quality of life · rFVIIa recombinant activated factor VII · SC subcutaneous · siRNA short
interfering RNA · TF tissue factor · TFPI tissue factor pathway inhibitor · VERITAS-Pro
Validated Hemophilia Regimen Treatment Adherence Scale–Prophylaxis · VWD von Willebrand disease
· VWF(:Act/:Ag) von Willebrand factor (activity/antigen).

---

## 9. References & resources `[PDF-V]`

- **References** — a full bibliography (~40 citations: prescribing information, FDA labels,
  guidelines, clinical-trial publications) sits in the bottom-left teal block of the blueprint.
  Transcribe from `[PDF-V]` when a specific citation is needed.
- **Curated "Resources" panel** (far right), categorized:
  - _Clinical guidelines & recommendations:_ NBDF MASAC Document 267; WFH AAV Gene Therapy
    Guidelines (Haemophilia 2026;32:20-54); ISTH treatment guideline (J Thromb Haemost
    2024;22:2629-2652); Young et al. "Deconstructing the ISTH Hemophilia Guidelines"; Srivastava
    et al. (Res Pract Thromb Haemost 2025;9:102879).
  - _Review articles:_ Mehta & Reddivari (StatPearls); AJMC treatment-landscape; Eduarda Alves de
    Jesus et al. (Expert Rev Clin Pharmacol 2026); Lim et al. (J Thromb Haemost 2026;24:2341-2354);
    Lewandowska et al. (J Blood Med 2025;16:95-115); Makris & O'Mahony "Paradox of Choice"; Ozelo
    et al.; Young "Nonfactor Therapies for Hemophilia."
  - _Tools for clinical practice:_ Coffin et al. WFH Shared Decision-Making Tool development;
    Duncan et al. VERITAS-Pro adherence measure; Molinari et al. Delphi monitoring tool; WFH SDM
    Tool & Workbook (https://sdm.wfh.org/).
  - **URLs accessed July 14, 2026.**
- **Shared decision-making (SDM) conclusion node** — "Leverage multidisciplinary care and SDM
  with patient, emphasizing consideration of risks, benefits, alternative treatment options, and
  patient goals/preferences." Focus on what matters to patients/families; empower participation;
  improve understanding; support adherence, quality of care, satisfaction.

---

## 10. Outcomes survey `[PDF]` `[PDF-V]`

Post-use survey (note: source labels two items "Question 2" — likely a typo for Q2/Q3):

1. _"This tool helped me better understand novel and emerging prophylaxis options for
   hemophilia."_ — Strongly agree / Agree / Neutral / Disagree / Strongly disagree.
2. _"This tool helped me compare treatment options based on hemophilia type, inhibitor status,
   treatment goals, monitoring requirements, and treatment burden."_ — same 5-point scale.
3. _"How do you plan to use this tool?"_ — For general education / To assist with treatment
   decisions / During discussion with a patient / I do not plan to use this tool.

---

## 11. Data quality & conflicts `[XLSX]`

- **Hidden rows = intentional filters.** S2–S5 hide out-of-class rows; this is by design. Do
  **not** resurface hidden content as data. `[PPTX]` has **no** hidden slides.
- **Cross-sheet conflicts exist but every eligibility-relevant one is in a _hidden_ row**, so it
  never surfaces (e.g. Efanesoctocog & Denecimig ages listed 12+ only on S3, where those rows are
  hidden). We treat **S1 as authoritative**.
- **Only genuine visible divergence:** Fitusiran route — S1 `SC (single-use prefilled pen)` vs S3
  `…pen or vial/syringe`; we chose the richer S3 value (user decision).
- Minor whitespace/typo variants across sheets (EHL schedule, Emicizumab route, header labels on
  S3) — cosmetic only.

---

## 12. Implementation status `[BUILD]`

| Piece                                 | File                                                 | Status                                                                                  |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Comparison-table data + filter engine | `src/data/treatments.ts`                             | ✅ built, type-checks                                                                   |
| Wizard branching model + notes        | `src/data/wizard.ts`                                 | ✅ built, type-checks (scenario-specific `SCENARIO_NOTES`; `CLASSES_TO_CONSIDER` boxes) |
| Interactive demo (both engines)       | `treatment-wizard-demo.html` (repo root)             | ✅ standalone; logic mirrors the TS modules (incl. `CLASSES_TO_CONSIDER`)               |
| Per-drug info sheets data             | `src/data/drug-sheets.ts`                            | ✅ built, type-checks (7 sheets; see [§6](#6-drug-information-sheets))                  |
| Education / glossary / refs / survey  | `src/data/{education,glossary,references,survey}.ts` | ✅ built, type-checks (issue 00)                                                        |
| Content join/coverage tests           | `src/data/content.test.ts`                           | ✅ 12 tests pass                                                                        |
| React UI (wizard + table + sheets)    | —                                                    | ⬜ not built                                                                            |

**Open decisions:**

- Denecimig age is "TBD (>1 yr)" → parsed to provisional min-age 1 → currently counts as eligible.
  Confirm whether TBD-age agents should be eligible, flagged, or excluded.

**Resolved by the 2026-07-27 re-scan:**

- ~~Confirm the top=B / bottom=A scenario mapping.~~ **Confirmed** — the diagram's dashed midline is
  explicitly labelled "hemophilia B" (top) / "hemophilia A" (bottom); green bands = +inhibitors,
  pink = −inhibitors ([§4](#4-treatment-wizard-flow-main-engine)).
- ~~Are the Considerations notes shared per-reason or scenario-specific?~~ **Scenario-specific** —
  32 distinct notes (4 scenarios × 4 reasons × Considerations/Strategies). `REASON_NOTES` in
  `wizard.ts` is a per-reason simplification; extend in issue 00 ([§4.2](#42-scenario-specific-considerations--strategies-notes)).
