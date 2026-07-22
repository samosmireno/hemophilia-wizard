# CONTEXT — Hemophilia Treatment Wizard (HM-85L)

Canonical domain/content reference for this project. Everything here was extracted
from the client source files in `documents/`. **Every fact is tagged with the source
file it came from** so it can be re-verified and updated.

> This is the repo's domain doc per `docs/agents/domain.md`. Use the vocabulary in the
> [Glossary](#glossary) when naming domain concepts elsewhere (issues, ADRs, tests).

## Maintenance

- **Last reviewed:** 2026-07-22
- **How to update:** when a source file changes, update the affected section and keep its
  source tag. If a fact spans multiple sources that disagree, record both and note which
  one we treat as authoritative (see [Data quality & conflicts](#data-quality--conflicts)).
- **Source tags:**
  | Tag | File | Notes |
  |-----|------|-------|
  | `[XLSX]` | `documents/Treatment wizard grid.xlsx` | 5 sheets; refer to sheets as **S1–S5** (see below) |
  | `[PDF]` | `documents/HM-85L Hemophilia Treatment Wizard_V2.pdf` | Raster blueprint (one large canvas) |
  | `[PDF-V]` | `documents/HM-85L Hemophilia Treatment Wizard_V2_Vector.pdf` | **Vector** version of the same blueprint — selectable text, highest fidelity; prefer this for exact wording |
  | `[PPTX]` | `documents/HM-85L treatment wizard slides.pptx` | 7 slides; slide 7 = same master diagram, slides 1–6 = scenario/education slides |
  | `[BUILD]` | code in `src/data/` + `treatment-wizard-demo.html` | What we've implemented from the above |

`[PDF]` and `[PDF-V]` are the **same blueprint**; cite `[PDF-V]` for exact text.

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

- 🟡 (near "Explore therapy options for HA/HB", above a table image) — *"Nicole: should
  these be displayed as separate p[op-ups]… **Is there a way that we can launch the table
  from the app so users can filter on each column?**"* → **This is the origin of `Treatment
  wizard grid.xlsx`**: the grid is the example of the filterable table.
- 🟣 — *"These pop up information sheets can be displayed however you determine is best —
  ideas include separate pop ups from the buttons in the dark green boxes or as tabs such
  as in the example below."*
- Repeated on each wizard leaf: *"Note: Please add a button for each drug which will pop up
  to an information sheet."*

---

## 4. Treatment Wizard flow (MAIN engine) `[PDF-V]` `[BUILD]`

Entry node (purple diamond): **"Explore Novel Prophylactic Therapy Options for Your Patient."**

1. **Q1 — "Does the patient have Hemophilia A or Hemophilia B?"**
2. **Q2 — "Does the patient have inhibitors?"** (Yes / No)
3. **Q3 — Primary reason for switching therapy?** one of:
   `improving bleeding control` · `increased adherence` · `reduced treatment burden` ·
   `reduced monitoring requirement`
4. **Leaf** — a curated set of novel therapies + a reason-specific considerations note
   ([§4.2](#42-reason-specific-considerations-notes)). Each recommended drug links to its
   info sheet ([§6](#6-drug-information-sheets)).

4 scenarios total (A/B × ±inhibitors); each has its own slide `[PPTX]` slides 1–4:
"Hemophilia A Without/With Inhibitors", "Hemophilia B Without/With Inhibitors".

Blueprint layout note: on the canvas the **top half = Hemophilia B**, **bottom half =
Hemophilia A** (recovered from text coordinates). `[PDF-V]`

### 4.1 Recommendation matrix (scenario × reason → agents) `[PDF-V]`

**Authored lookup — NOT a computed filter.** Lists are hand-picked in the source and are
intentionally not derivable by filtering.

| Reason ↓ / Scenario → | A, no inhib | A, inhib | B, no inhib | B, inhib |
|---|---|---|---|---|
| **Improving bleeding control** | Emi, Dene, Conci, Mars, Fitu | Emi, Dene, Conci, Mars, Fitu | Conci, Mars, Fitu | Conci, Mars, Fitu |
| **Increased adherence** | Emi, Dene, Conci, Mars, Fitu | Emi, Dene, Conci, Mars, Fitu | Conci, Mars, Fitu, **Gene** | Conci, Mars, Fitu |
| **Reduced treatment burden** | Emi, Dene, Conci, Mars, Fitu | Emi, Dene, Conci, Mars, Fitu | Conci, Mars, Fitu, **Gene** | Conci, Mars, Fitu |
| **Reduced monitoring requirement** | Emi, Dene | Emi, Dene | Conci, Mars, Fitu | Conci, Mars, Fitu |

Abbreviations: Emi = Emicizumab, Dene = Denecimig, Conci = Concizumab, Mars = Marstacimab,
Fitu = Fitusiran, Gene = Etranacogene dezaparvovec-drlb (gene therapy).

**Authored nuances (why it's not a filter):**
- Hemophilia A + *reduced monitoring* → **only the two FVIIIa mimetics** (rebalancing agents
  need AT/plasma monitoring).
- **Gene therapy** appears **only** for Hemophilia B *without* inhibitors, under adherence &
  treatment burden (Etranacogene is HB, no-inhibitor, adults only).
- FVIIIa mimetics (Emi, Dene) never appear in Hemophilia B branches (they are HA-only).

Encoded in `[BUILD]` `src/data/wizard.ts` → `RECOMMENDATIONS[scenario][reason]`, resolver
`recommend(type, hasInhibitors, reason)`.

### 4.2 Reason-specific considerations notes `[PDF-V]`

Shown alongside recommendations; attached to the **reason** (shared across scenarios).
Full text in `[BUILD]` `src/data/wizard.ts` → `REASON_NOTES`. Titles:

- **Bleeding control:** "Considerations for Improving Bleeding Control"
- **Adherence:** "Considerations for Improving Treatment Adherence"
- **Treatment burden:** "Considerations for Reducing Treatment Burden and Improving QoL"
- **Monitoring:** "Considerations and Strategies for Reducing Monitoring Requirement"

---

## 5. "Explore therapy options" table (SECONDARY engine) `[XLSX]` `[PDF-V]` `[BUILD]`

The filterable comparison table the yellow sticky note asks for. Columns (S1 headers `[XLSX]`;
`[PDF-V]` embeds a near-identical table titled with a "Toxicity & Monitoring" column):

`Treatment class · Agent · MOA · Hemophilia Type · Indicated with inhibitors · Patient Age ·
Administration Route · Schedule · Monitoring & Safety`

Three columns are dropdown **filters**: Treatment class, Hemophilia Type (A / B / A + B),
Indicated with inhibitors (Yes / No). "A + B" means eligible for both.

### 5.1 Treatment roster (9 rows, S1 verbatim) `[XLSX]`

| Agent | Class | MOA | Type | Inhib | Age | Route | Schedule |
|---|---|---|:--:|:--:|:--:|---|---|
| SHL | Clotting factor replacement | Standard half-life | A + B | No | 0+ | IV | 3X/week |
| EHL | Clotting factor replacement | Extended half-life | A + B | No | 0+ | IV | ~2X/week |
| Efanesoctocog alfa | Clotting factor replacement | Ultralong half-life | A | No | 0+ | IV | Weekly |
| Emicizumab | Factor VIIIa mimetic | FVIIIa-mimetic BsAb | A | Yes | 0+ | SC (vial/syringe) | Monthly, bimonthly, weekly |
| Denecimig | Factor VIIIa mimetic (emerging/investigational) | FVIIIa-mimetic BsAb | A | Yes | TBD (>1 yr) | SC (prefilled pen) | Monthly, weekly |
| Concizumab | Hemostatic rebalancing agent | TFPI mAB | A + B | Yes | 12+ | SC (prefilled pen) | Daily |
| Marstacimab | Hemostatic rebalancing agent | TFPI mAB | A + B | Yes | 6+ | SC (prefilled pen) | Weekly |
| Fitusiran | Hemostatic rebalancing agent | AT-directed siRNA | A + B | Yes | 12+ | SC (prefilled pen or vial/syringe)ᴬ | Every 1-2 months |
| Etranacogene dezaparvovec-drlb | Gene therapy | AAV vector | B | No | Adults | IV | Single infusion |

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
Monitoring · Clinical Trials). **Not yet in a data file** — candidate `src/data/drugSheets.ts` `[BUILD-TODO]`.

**Efanesoctocog alfa** — *Class:* clotting factor replacement, ultralong half-life.
*Indications:* adults & pediatric HA; routine prophylaxis; on-demand bleed control;
perioperative management. *Dosage:* IV, 50 IU/kg once weekly; optimize via plasma FVIII
(aPTT one-stage assay). *Monitoring:* hypersensitivity/anaphylaxis; neutralizing antibodies
(inhibitors); ADAs. *Trials:* Study 1 (NCT04161495), Study 2 (NCT04759193).

**Emicizumab** — *Class/Target:* FVIIIa-mimetic, FIXa×FX BsAb. *Indication:* HA ±inhibitors,
newborn & older. *Dosage:* SC (vial & syringe); load 3 mg/kg weekly ×4 wks; maintenance
1.5 mg/kg weekly, 3 mg/kg q2wks, or 6 mg/kg monthly. *Monitoring:* injection-site reactions;
lab coagulation test interference (don't use intrinsic-pathway clotting tests — ACT, Bethesda,
aPTT-based — for FVIII inhibitor titers); thrombotic microangiopathy/thrombotic events; aPCC
interaction; ADAs. *Trials:* HAVEN 3 (NCT02847637), HAVEN 4 (NCT03020160), HAVEN 2 (NCT02795767).

**Denecimig (emerging/investigational)** — *Class/Target:* FVIIIa-mimetic BsAb, FIXa×FX.
*Indication:* TBD (FDA); trials in HA ±inhibitors, patients >1 yr. *Dosage:* SC prefilled pen
w/ attachable syringe; no washout when switching from emicizumab. *Monitoring:* TBD (phase 3):
mostly mild transient injection-site reactions; no thromboembolic/TMA events; no
hypersensitivity; no clinically relevant lab findings. *Trials:* FRONTIER2 (NCT05053139),
FRONTIER3 (NCT05306418), FRONTIER4 (NCT05685238), FRONTEIR5 (NCT05878938).

**Concizumab** — *Class/Target:* hemostatic rebalancing agent, TFPI mAB. *Indication:* routine
prophylaxis, ≥12 yrs, HA/HB ±inhibitors. *Dosage:* SC prefilled pen; D1 load 1 mg/kg; D2 daily
0.2 mg/kg until individualized maintenance; optimize after 4 wks via concizumab plasma
concentration (ELISA). *Monitoring:* hypersensitivity; routine plasma concentrations;
thromboembolic events; ↑ fibrin D-dimer & prothrombin fragment; ADAs. *Trials:* Explorer7
(NCT04083781), Explorer8 (NCT04082429).

**Marstacimab** — *Class/Target:* hemostatic rebalancing agent, TFPI mAB. *Indication:* routine
prophylaxis, ≥6 yrs, HA/HB ±inhibitors. *Dosage:* SC (prefilled pen or syringe); load 300 mg
(two 150 mg); maintenance 150 mg weekly (start 1 wk after load); consider 300 mg weekly if
>50 kg. *Monitoring:* hypersensitivity; thromboembolic events; ↑ fibrin D-dimer & prothrombin
fragment; ADAs. *Trials:* BASIS (NCT03938792), BASIS KIDS (NCT05611801).

**Fitusiran** — *Class/Target:* hemostatic rebalancing agent, AT-directed siRNA. *Indication:*
routine prophylaxis, ≥12 yrs, HA/HB ±inhibitors. *Dosage:* SC (prefilled pen, or syringe & vial
for lower dose); start 50 mg once every 2 months; monitor AT activity (FDA-cleared test),
maintain AT 15–35% by adjusting dose/frequency. *Monitoring:* thrombotic events; AT levels;
acute/recurrent gallbladder disease; hepatotoxicity (LFTs baseline, monthly >6 mo, after dose
↑, periodically); ADAs. *Trials:* ATLAS-INH (NCT03417102), ATLAS-A/B (NCT03417245), ATLAS-OLE
(NCT03754790).

**Etranacogene dezaparvovec-drlb** — *Class/Target:* AAV vector-based gene therapy.
*Indication:* adults with HB **without** FIX inhibitors. *Dosage:* single IV infusion,
2×10¹³ genome copies/kg. *Monitoring:* eligibility (LFTs, hepatic ultrasound/elastography,
hepatitis B/C, hepatologist consult); hypersensitivity; hepatotoxicity (LFTs weekly ×3 mo then
monthly ×1 yr); immune-mediated neutralizing antibodies to AAV5 capsid; FIX inhibitor
observation; plasma FIX activity (e.g. weekly ×3 mo, aPTT one-stage assay). *Trial:*
prospective open-label study (NCT03569891).

---

## 7. Education content `[PDF-V]`

- **Personalized therapy for HA/HB** — growing landscape enables individualized therapy but
  adds decision-making complexity.
- **Hemophilia disease background & severity** `[PPTX]` slide 6: severity by FVIII/IX level —
  Mild >5–<40%, Moderate 1–5%, Severe <1%; bleeding manifestations by severity.
- **Non-factor replacement therapies (NFTs)** — *Benefits:* SC administration, stable thrombin
  generation, long half-life, shifts disease severe→mild, effective regardless of inhibitor
  status. *Challenges:* thrombotic risk, ADA development, complex MOA, no standardized lab
  monitoring, major-surgery management, use in older populations.
- **Hemostatic rebalancing agents** — enhance thrombin generation by targeting endogenous
  anticoagulant pathways (TFPI, AT, APC/protein S). Anti-TFPI mAbs (concizumab, marstacimab)
  bind TFPI K2 domain; AT-directed siRNA (fitusiran) reduces hepatic AT via RNAi.
- **Investigational FVIIIa mimetics in early development:** NXT007, Inno8.
- Click-throughs referenced: bleeding manifestations in males/females with HA/HB; MOA within
  the coagulation cascade; benefits/challenges of NFTs; hemophilia severity & bleeding patterns.

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
AAV adeno-associated virus · ADA anti-drug antibody · aPCC activated prothrombin complex
concentrate · APC activated protein C · aPTT activated partial thromboplastin time ·
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
  - *Clinical guidelines & recommendations:* NBDF MASAC Document 267; WFH AAV Gene Therapy
    Guidelines (Haemophilia 2026;32:20-54); ISTH treatment guideline (J Thromb Haemost
    2024;22:2629-2652); Young et al. "Deconstructing the ISTH Hemophilia Guidelines"; Srivastava
    et al. (Res Pract Thromb Haemost 2025;9:102879).
  - *Review articles:* Mehta & Reddivari (StatPearls); AJMC treatment-landscape; Eduarda Alves de
    Jesus et al. (Expert Rev Clin Pharmacol 2026); Lim et al. (J Thromb Haemost 2026;24:2341-2354);
    Lewandowska et al. (J Blood Med 2025;16:95-115); Makris & O'Mahony "Paradox of Choice"; Ozelo
    et al.; Young "Nonfactor Therapies for Hemophilia."
  - *Tools for clinical practice:* Coffin et al. WFH Shared Decision-Making Tool development;
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

1. *"This tool helped me better understand novel and emerging prophylaxis options for
   hemophilia."* — Strongly agree / Agree / Neutral / Disagree / Strongly disagree.
2. *"This tool helped me compare treatment options based on hemophilia type, inhibitor status,
   treatment goals, monitoring requirements, and treatment burden."* — same 5-point scale.
3. *"How do you plan to use this tool?"* — For general education / To assist with treatment
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

| Piece | File | Status |
|---|---|---|
| Comparison-table data + filter engine | `src/data/treatments.ts` | ✅ built, type-checks |
| Wizard branching model + notes | `src/data/wizard.ts` | ✅ built, type-checks |
| Interactive demo (both engines) | `treatment-wizard-demo.html` (repo root) | ✅ standalone; logic mirrors the TS modules |
| Per-drug info sheets data | `src/data/drugSheets.ts` | ⬜ not built (content ready in [§6](#6-drug-information-sheets)) |
| React UI (wizard + table + sheets) | — | ⬜ not built |

**Open decisions:**
- Denecimig age is "TBD (>1 yr)" → parsed to provisional min-age 1 → currently counts as eligible.
  Confirm whether TBD-age agents should be eligible, flagged, or excluded.
- Confirm the top=B / bottom=A scenario mapping reads correctly against clinical intent.
