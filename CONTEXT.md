# CONTEXT — Hemophilia Treatment Wizard (HM-85L)

Canonical domain/content reference for this project. Everything here was extracted
from the client source files in `documents/`. **Every fact is tagged with the source
file it came from** so it can be re-verified and updated.

> This is the repo's domain doc per `docs/agents/domain.md`. Use the vocabulary in the
> [Glossary](#glossary) when naming domain concepts elsewhere (issues, ADRs, tests).

## Maintenance

- **Last reviewed:** 2026-08-04 (the `/explore` artboard: the route is §9's SDM conclusion node, not
  the §5 table — see §5, §9 and `docs/adr/0007-explore-is-the-sdm-conclusion.md`; §9's four bullets
  recovered verbatim where they had been abridged, and the seven-agent class index recorded on §5);
  previously 2026-08-04 (the two `/wizard/therapies` artboards: the leaf's one-open
  Considerations/Strategies accordion, and the §4.2 nesting correction recovered from `out.txt`'s
  column positions — see §4 and §4.2); previously 2026-08-03 (the four `/wizard/scenario` artboards: per-scenario titles, leads
  and captions, and the plural "rebalancing agents" on HA +inhib — see §4); previously 2026-08-03
  (the `/wizard` artboard: Q1/Q3 renamed on screen, the flow split
  into three routes — see §4); previously 2026-08-03 (the NXT007 artboard split `nxt007-structure` off the overview and
  dropped the agent prefix from its bullets — see §7.5); previously 2026-08-03 (the Denecimig
  artboard split `denecimig-moa` off the overview and
  authored a class-level MOA bullet §7.5 files under emicizumab — see §7.5); previously 2026-07-31
  (the `fviii-mimetics` artboard refiled §7.6's two investigational
  agents onto §7.5 — see both sections); previously 2026-07-27 (full re-scan of `[PDF-V]` as a diagram, not just text — traced
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

> **Not in the blueprint:** the app adds a **landing page at `/`** (net-new — the blueprint
> canvas has no home/landing screen; title only so far, reusing the §7.1 framing line). See
> `.scratch/app-buildout/spec.md` and issue 17. The per-drug sheets (item 3 above) are built as
> a `?drug=<id>` **modal overlay on the current route**, not a standalone `/drugs/:id` page
> (see [§6](#6-drug-information-sheets) / issue 10).
>
> **App navigation & the Resources/References/Glossary split:** the app is a **linear
> walkthrough** (sidebar Prev/Next through a fixed section order), and the blueprint's single
> "Resources / References / Glossary" block (items 4–5 above) is split into **four** app
> routes — `/resources` (curated panel, in the linear flow) plus **off-line** always-accessible
> pages `/references`, `/glossary`, and `/acronyms` (the latter pulled out of the [§8](#8-glossary)
> acronym list). This is an app-structure decision, not a change to the source content; rationale
> in `docs/adr/0001-linear-walkthrough-navigation.md`.

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

> **The app renames Q1 and Q3 `[BUILD]`.** The `/wizard` artboard sets the questions as
> **"Disease type"**, **"Does the patient have inhibitors"** (no question mark) and **"What is
> the primary reason for considering a treatment option?"**, and its four answer buttons in the
> imperative — _Improve_ bleeding control, _Increase_ adherence, _Reduce_ treatment burden,
> _Reduce_ monitoring requirement — laid out 2×2 in the order bleeding · monitoring · adherence
> · burden. The blueprint wording above stays the domain vocabulary and is what
> [§4.2](#42-scenario-specific-considerations--strategies-notes)'s 32 note titles are written
> against ("…is the primary reason for **switching therapies**"); both forms are carried in
> `wizard.ts` → `SWITCH_REASONS[].label` (artboard, rendered) and `.sourceLabel` (blueprint).
> This is a copy decision on one screen, not a change to the source content.
>
> **The flow is three app routes `[BUILD]`.** `/wizard` collects the three answers behind a
> Submit button; `/wizard/scenario` is the "Therapeutic classes to consider" box below;
> `/wizard/therapies` the leaf ([§4.1](#41-recommendation-matrix-scenario--reason--agents)–4.2).
> All three are walkthrough steps, and the answers are held for the browsing session only —
> rationale in `docs/adr/0003-session-scoped-wizard-answers.md`.
>
> **The leaf renders its note pair as a one-open accordion `[BUILD]`.** Two `/wizard/therapies`
> artboards were delivered for the same leaf, one per open block, and both draw exactly one open:
> the open header crimson, the closed one lagoon, and the arch below pinned at the same y whichever
> is showing. Considerations opens on mount; the open header cannot be collapsed. Rationale, and
> why the source's own "tabs" wording did **not** become ARIA tabs, in
> `docs/adr/0005-one-open-leaf-accordion.md`. The `+` buttons beside each recommended agent are
> drawn but open nothing — issue 10's `?drug=` overlay is unbuilt.

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
| **HA +inhib** | Factor VIII mimetic ᶜ · Hemostatic rebalancing agents ᴮ                                                                                                                                             |
| **HA −inhib** | Recombinant FVIII concentrates · Factor VIIIa mimetics · Hemostatic rebalancing agents                                                                                                              |

ᴮ `[BUILD]` **the artboard sets this one plural where `[PDF-V]` sets it singular** ("Hemostatic
rebalancing agent"). The app renders the plural, on the standing rule that the artboard is the
filing authority where the two disagree — the same call recorded for the `fviii-mimetics` cards'
copy. Note the first item in the same list _is_ singular on both, deliberately.

ᶜ `[CLIENT]` 2026-08-05 copy edit — the "a" was dropped from "Factor VIIIa mimetic" on this screen
only. `HA −inhib` keeps the activated form the artboards and `[PDF-V]` draw, so the two screens now
diverge on purpose.

Each box carries the annotation _"Click on the box(es) below to learn more about each type of
therapy"_ and links to the class-level education pop-ups. Encoded in `[BUILD]` `src/data/wizard.ts`
→ `CLASSES_TO_CONSIDER[scenario]` (verbatim labels — not the `TreatmentClass` enum, since the
source phrases the same class differently per scenario).

> **The four scenario screens carry copy the blueprint has no equivalent of `[BUILD]`.** Each
> `/wizard/scenario` artboard states its scenario as the page title ("Hemophilia B with
> inhibitors"), opens with a lead sentence, and captions the illustration boxes — so
> `CLASSES_TO_CONSIDER[scenario]` gained `title`, `lead` and `caption` beside `classes` and
> `caveat`. They are transcribed rather than templated, because the four disagree:
>
> - **HB +inhib leads with "Therapeutic _options_ for prophylaxis of HB _with_ inhibitors"**,
>   where the other three read "Therapeutic _classes to consider_ for prophylaxis of …" — its
>   list is a single class rather than a choice among several.
> - **HB +inhib also replaces the shared caption** with the app's "Click here:" idiom, naming the
>   class outright: _"Click here: information on hemostatic rebalancing agents"_. The blueprint
>   hedged with "box(es)"; the artboard rewrote the sentence instead. The other three share one
>   caption verbatim.
> - **The polarity word is italic on all four leads** — `_with_` / `_without_`, which is the one
>   word distinguishing two otherwise near-identical sentences. Carried as inline markup in the
>   string and rendered through `formatInline`; see
>   `docs/adr/0004-inline-emphasis-in-transcribed-copy.md`.
>
> Where the caption is _drawn_ is not in the data: above the boxes on the three multi-box screens,
> below the single one. That is a layout fact and lives on the page.
>
> **The boxes open nothing.** They ship as reserved rectangles at the drawn size. The
> per-scenario therapeutic-class illustration panels are image-borne
> ([§7.7](#77-click-through-pop-up-index)) and no asset exists for any of them, and of the five
> distinct class labels only two — FVIIIa mimetics and hemostatic rebalancing agents — have an
> education chapter to point at; "Gene therapy" has no chapter, pop-up or authored copy anywhere.
> So the caption is an instruction that does not yet work, the same state
> `education/rebalancing-agents` is in. Wiring needs the designer to say what a box opens.

`[BUILD]` **Known drift:** `treatment-wizard-demo.html` mirrors `CLASSES_TO_CONSIDER` and still
carries the singular "Hemostatic rebalancing agent", plus none of the three new fields. The demo
composes its own headings and does not render these screens, so it was left alone deliberately.

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

**Nesting correction, 2026-08-04 `[PDF-V]` `[BUILD]`.** Four of the 32 notes carry a **second
bullet level**, which the earlier transcription flattened. In all four scenarios the
_Reducing Treatment Burden_ **Considerations** open a lead-in ending in a colon — _"Frequent IV
therapy is particularly challenging for children:"_ — and subordinate their age-restriction
bullets to it:

| scenario  | children of the lead-in                                                     |
| --------- | --------------------------------------------------------------------------- |
| HA −inhib | Emicizumab (…>1 year **of age**) · Marstacimab · Other FDA-approved options |
| HA +inhib | Emicizumab (…>1 year) · Marstacimab · Other FDA-approved options            |
| HB −inhib | Marstacimab · Concizumab and fitusiran                                      |
| HB +inhib | Marstacimab · Concizumab and fitusiran                                      |

The nesting is **measured, not inferred from the colon**. `documents/out_raw.txt` cannot show it —
its `[x=…]` headers are page regions, and the lead-in and its children land in different bands at
the same nominal x. `documents/out.txt` is layout-preserving and does: the top-level bullets of
those notes start at **column 1755**, the age bullets at **1763**.

**`[CLIENT]` copy edit of 2026-08-05, scoped to the HB +inhib _Reduce Treatment Burden_ note.**
Two changes, both departures from `[PDF-V]`:

1. Its two age bullets read **`≥`** where the source types a bare `>` — the edit asked for the `>`
   to be underlined, the slide-deck drawing of "greater than or equal to", and the sense the
   indications carry. Set as the character for the same reasons as `denecimig-overview`'s FRONTIER
   bullets (see §7.5): the codebase already writes the symbol that way, and it is what a screen
   reader announces. The identical bullets in the other three scenarios keep the bare `>` — the
   edit named this one, and the table above still records the source's form.
2. Its **Strategies** are now the three bullets the two **HA** scenarios carry ("less frequent or
   more convenient SC dosing" · "less burdensome dosing … for younger patients" · "Plan follow-up
   and education …"), supplied verbatim by the client. The HB wording they replace ("convenient SC
   administration and alternative dosing schedules", two bullets) survives only in HB −inhib, so
   that pair is no longer identical across the two HB scenarios.

That measurement is also what keeps HB −inhib's trailing _"Gene therapy may reduce long-term
treatment burden…"_ bullet **out** of the nest — it sits back at 1755, and on content grounds it is
about gene therapy rather than about children, so a mechanical "group everything after the colon"
rule would have swallowed it.

`NoteBlock.points` is therefore `Bullet[]` (reusing `education.ts`'s `NestedBullet`), not
`string[]`; `BulletList` renders the nesting as markup so a screen reader announces the sub-list's
depth and count. `treatment-wizard-demo.html` was updated to match.

---

## 5. "Explore therapy options" table (SECONDARY engine) `[XLSX]` `[PDF-V]` `[BUILD]`

The filterable comparison table the yellow sticky note asks for. Columns (S1 headers `[XLSX]`;
`[PDF-V]` embeds a near-identical table titled with a "Toxicity & Monitoring" column):

`Treatment class · Agent · MOA · Hemophilia Type · Indicated with inhibitors · Patient Age ·
Administration Route · Schedule · Monitoring & Safety`

Three columns are dropdown **filters**: Treatment class, Hemophilia Type (A / B / A + B),
Indicated with inhibitors (Yes / No). "A + B" means eligible for both.

> **The table is a pop-up, not a page `[BUILD]`.** Issue 09 specified `/explore` as the table
> itself; the `/explore` artboard makes that route the [§9](#9-references--resources) SDM
> conclusion node and launches the table from a button on it. Rationale in
> `docs/adr/0007-explore-is-the-sdm-conclusion.md`. **The card is built and its body is not** —
> the filters and the grid are still issue 09's scope, and `Popup` needs a wide variant or an
> inner scroll region before nine columns will fit (docs/styling.md open item 27).
>
> **The same page indexes the [§6](#6-drug-information-sheets) sheets by class `[BUILD]`.** Below
> the SDM copy the artboard draws three arched segments holding all seven agents that have a
> sheet, under four verbatim class labels — "FVIII mimetics" (drawn "FVIIIa mimetics"; the `a`
> was dropped 2026-08-05) · "Hemostatic rebalancing agents" ·
> "UHL clotting factor replacement" · "Gene therapy". Three of the four disagree with the
> `TreatmentClass` enum in `treatments.ts` (plural where it is singular; "UHL" is a half-life the
> enum has no term for), so they are transcribed rather than derived — the same call
> `CLASSES_TO_CONSIDER` records. Encoded as `src/data/explore.ts` → `EXPLORE_SEGMENTS`. The two
> generic SHL/EHL rows are **not** drawn, consistent with their having no sheet by design.

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
`{ name, id }`). **No SHL/EHL sheet** — the source authored none (they are generic
class rows in the comparison table, not branded agents), so the acceptance criterion is "every
agent the wizard can **recommend** has a sheet" (all 6 novel `AGENTS` + Efanesoctocog covered).

**The card is built `[BUILD]`** as `src/components/DrugSheetPopup.tsx` — `Popup`'s crimson band
wearing the sheet's name, then the five sections as crimson `<h3>`s over disc lists, in that
fixed order. Seven artboards, one per sheet; measurements in `docs/styling.md` §16. It is
component state rather than issue 10's `?drug=` overlay — `docs/adr/0006-component-state-drug-sheets.md`.
Wired from `/wizard/therapies` (all 6 recommendable agents) **and from `/explore`, which draws all
seven** — so Efanesoctocog alfa's sheet, built with no caller since the sheets landed, is reachable
at last. See [§5](#5-explore-therapy-options-table-secondary-engine).

Two per-sheet deviations the card reads as optional fields, both transcription:

- **`title`** — Denecimig alone. The card is headed _"Denecimig (emerging/investigational)"_ where
  the button says "Denecimig", the caption/title split §7.5's agent cards already use.
- **`classHeading`** — Efanesoctocog alfa alone, whose section is headed _"Class"_ (it names a
  class with no molecular target) where the other six read _"Class/Target"_.

A third, `monitoringHeading`, is **gone as of 2026-08-05 `[CLIENT]`** — see the Denecimig edits
below. It held Denecimig's whole-section qualifier and had no other user, so the field went with
the copy.

**Trial citations cut, 2026-08-04 `[CLIENT]`.** Direction: _"Delete the colon and everything after
on each bullet (ie, only the clinical trials name (NCT…) would be kept."_ Only Denecimig's four
entries carried a tail; they were drawn as blue links but the source supplied no URL for any of
them. `ClinicalTrial` therefore has no `citation` field, every trial renders `Name (NCTxxxxx)`, and
the card contains no link at all. The four tails are recorded below and remain in
`documents/out_raw.txt`, but are stored nowhere in the code.

**"Factor VIIIa–mimetic" → "Factor VIII mimetic", 2026-08-05 `[CLIENT]`.** The Class/Target line of
the two mimetic sheets drops the activated form's "a" and the dash — Denecimig's first, Emicizumab's
a step later, so the two sheets agree. It is the same terminology pass §7.5 records (see the note
under that heading); the artboards and `[PDF-V]` still draw the activated form, and the class labels
elsewhere in this file are unaffected except where footnoted.

**Two more edits on the Denecimig sheet, 2026-08-05 `[CLIENT]`.** (1) Its Indication reads
_"patients ≥1 year"_ where the source writes a bare `>` — the direction asked for the `>` to be
underlined, which is the slide-deck drawing of "greater than or equal to". Scoped to this sheet:
Concizumab's and Marstacimab's _">12 years"_ are untouched, and §7.5 records the same edit reaching
`denecimig-overview` a step earlier. (2) The whole-section Monitoring qualifier _"TBD; based on
phase 3 clinical trial data"_ is deleted, so the sheet is headed plain _"Monitoring:"_ like the
other six; the Indication's own _"TBD based on FDA approval"_ was not part of the direction and
stands.

Etranacogene's dose is stored `"2 × 10¹³ genome copies/kg body weight"` in Unicode — the earlier
`10^13` renders literally, and a dose reading as ten-thousand-and-thirteen is a hazard rather than
a typo.

**Efanesoctocog alfa** — _Class:_ clotting factor replacement, ultralong half-life.
_Indications:_ adults & pediatric HA; routine prophylaxis; on-demand bleed control;
perioperative management. _Dosage:_ IV, 50 IU/kg once weekly; optimize via plasma FVIII
(aPTT one-stage assay). _Monitoring:_ hypersensitivity/anaphylaxis; neutralizing antibodies
(inhibitors); ADAs. _Trials:_ Study 1 (NCT04161495), Study 2 (NCT04759193).

**Emicizumab** — _Class/Target:_ Factor VIII mimetic, FIXa×FX BsAb. _Indication:_ HA ±inhibitors,
newborn & older. _Dosage:_ SC (vial & syringe); load 3 mg/kg weekly ×4 wks; maintenance
1.5 mg/kg weekly, 3 mg/kg q2wks, or 6 mg/kg monthly. _Monitoring:_ injection-site reactions;
lab coagulation test interference (don't use intrinsic-pathway clotting tests — ACT, Bethesda,
aPTT-based — for FVIII inhibitor titers); thrombotic microangiopathy/thrombotic events; aPCC
interaction; ADAs. _Trials:_ HAVEN 3 (NCT02847637), HAVEN 4 (NCT03020160), HAVEN 2 (NCT02795767).

**Denecimig (emerging/investigational)** — _Class/Target:_ Factor VIII mimetic BsAb, FIXa×FX.
_Indication:_ TBD (FDA); trials in HA ±inhibitors, patients ≥1 yr. _Dosage:_ SC prefilled pen
w/ attachable syringe; no washout when switching from emicizumab. _Monitoring:_
mostly mild transient injection-site reactions; no thromboembolic/TMA events; no
hypersensitivity; no clinically relevant lab findings. _Trials:_ FRONTIER2 (NCT05053139);
FRONTIER3 (NCT05306418); FRONTIER4 (NCT05685238); FRONTEIR5 (NCT05878938). _(Source spells
"FRONTEIR5"; the trial-program abstracts are also listed in the left education band.)_ The
sheet's four citation tails — _See Mancuso NEJM 2026_ / _See Mahlangu EAHAD 2025_ / _See Windyga
ISTH 2026_ / _See Oldenburg ISTH 2026_, in that order, source spelling "Oldenburg" — are **cut by
client direction 2026-08-04** and are recorded here only; see the section head.

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
2 × 10¹³ genome copies/kg. _Monitoring:_ eligibility (LFTs, hepatic ultrasound/elastography,
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

**Architecture (per issue 01 / issue 11):** education is a **multi-chapter module** built as
`/education/:section` subroutes, **not** a single page. The §7.x content below maps to five
chapters:

| Chapter subroute       | Source subsections                                                |
| ---------------------- | ----------------------------------------------------------------- |
| `disease-background`   | §7.2                                                              |
| `treatment-landscape`  | §7.1, §7.3, §7.4 (first bullet + benefits/challenges)             |
| `rebalancing-agents`   | §7.6 NFTs + rebalancing agents (wizard cross-link target)         |
| `fviii-mimetics`      | §7.5, incl. the investigational agents (wizard cross-link target) |
| `prophylaxis-guidance` | §7.4 prophylaxis guidance (last chapter)                          |

The §7.7 "Click here:" figures are **in-chapter local-state pop-ups** — not routes, and not the
`?drug=<id>` overlay (that param is reserved for drug sheets, [§6](#6-drug-information-sheets) /
issue 10). Glossary ([§8](#8-glossary)) is a separate entry point (issue 12).

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
  - _Benefits:_ dosing frequency varies by product and patient need; well-understood long-term
    safety and efficacy.
  - _Challenges:_ IV administration, infusion preparation, venous access, and ongoing
    dosing/monitoring (FVIII/FIX monitoring, PK-guided dose optimization, peak/trough levels);
    development of neutralizing antibodies (inhibitors) to FVIII/FIX can reduce efficacy and
    increase risk of breakthrough bleeding and joint damage.

### 7.5 FVIIIa-mimetic BsAbs (approved & emerging agents for HA)

`[BUILD]` **the chapter says "FVIII mimetic" where this section says "FVIIIa-mimetic"**, on a
client copy edit of 2026-08-05: the `a` and the hyphen come out of every string the app paints on
`/education/fviii-mimetics` — the `<h1>`, all four chapter bullets, both MOA bullets, the panel
heading, and the Inno8 band. This section keeps `[PDF-V]`'s wording below, because that is what
the source says and this is the transcription of it. Two strings in the app were held back at
first — `denecimig-moa.title` and the quoted heading in `DENECIMIG_FIGURE_ALT` quote the line
baked into `denecimig.webp`'s pixels rather than copy the app sets — and the client then supplied
a re-export painting "FVIII MIMETIC BSAB", so both now quote that and the hold is spent. The route
slug, the topic ids and the component name are unaffected — `fviii-mimetics` is contractual
(issue 08 cross-links to it). Elsewhere in the app the source's wording still stands: `/explore`'s
"FVIIIa mimetics" column, the glossary, and the §7.7 wizard notes were outside the edit.

`[BUILD]` **two more client edits of 2026-08-05, both scoped to the Denecimig pop-up.** (1) The
FRONTIER age limits are set with `≥` where this section transcribes the source's bare `>` — the
edit asked for the `>` to be underlined, which is the slide-deck drawing of "greater than or equal
to", and the symbol is what this codebase already writes elsewhere (`prophylaxis-guidance`'s
"levels ≥2 IU/dL"). It reached `denecimig-overview` first and the §6 Denecimig sheet a step later,
on the same direction; the §7.7 wizard notes and the other six sheets keep the bare `>`.
(2) `denecimig-moa`'s pre-clinical bullet reads
"denecimig (Mim8) potency" where the source writes "Mim8 potency" flat.

- **Class.** BsAbs simultaneously target two antigens; FVIIIa-mimetic BsAbs are engineered to
  **bridge FIXa and FX**, mimicking FVIII cofactor function and triggering the coagulation cascade.
  Emicizumab established FVIIIa-mimetic therapy as a **first-in-class SC nonfactor prophylaxis**
  option for HA; emerging agents (denecimig/Mim8) aim to further optimize hemostatic activity and
  dosing convenience.
- **Emicizumab (FDA-approved).** Recombinant humanized BsAb; **IgG4** immunoglobulin combining two
  binding fragments for FIXa and FX. FDA-approved for prophylaxis of HA ±inhibitors in newborns or
  older; SC monthly/bimonthly/weekly. MOA: binds activated FIXa and FX, enhancing catalytic
  efficiency of FIXa in converting FX on activated platelets. `[BUILD]` the MOA sentence is
  modelled as its own topic (`emicizumab-moa`, titled with the figure caption below), because the
  card draws the other three bullets beside the diagram and this one under it — the same split as
  `rebalancing-mechanisms`. Figure: "Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa"
  (image), which the card shows as a thumbnail that enlarges over the card when clicked.
- **Denecimig (Mim8, investigational — under FDA review).** Monovalent anti-FIXa arm enhances FIXa
  proteolytic activity to facilitate FX activation, thrombin generation, and clot formation.
  Pre-clinical: **Mim8 potency up to 18-fold greater** than an emicizumab-equivalent analog.
  **Tiered dosing by body weight** avoids dose calculations, reduces burden, minimizes waste. BLA
  submitted for routine prophylaxis in adult & pediatric HA ±inhibitors, supported by the phase 3
  **FRONTIER** program: FRONTIER2 (SC monthly/weekly, >12 yr), FRONTIER3 (monthly/weekly, >1 yr),
  FRONTIER4 (OLE). See also drug sheet [§6](#6-drug-information-sheets).
  `[BUILD]` the first two sentences are modelled as their own topic (`denecimig-moa`, titled with
  the figure caption below), because the card draws them under the diagram and the rest beside it —
  the same split as `emicizumab-overview`/`emicizumab-moa`. The FRONTIER trials are modelled as a
  nested level under the bullet that introduces them, which is how both this section and the card
  subordinate them. Figure: "Mechanism of Action for Denecimig (Mim8): FVIIIa-mimetic BsAb"
  (image), shown as a thumbnail that enlarges bare over the card; **its heading is baked into the
  raster**, so unlike the emicizumab diagram the caption is image-borne text and reachable only
  through `alt`.
  `[BUILD]` **the card opens with a bullet this section does not author** — "FVIIIa-mimetic BsAb:
  Binds to activated FIXa and FX, enhancing catalytic efficiency of FIXa in converting FX on
  activated platelets", which is verbatim the sentence §7.5 gives _emicizumab_. The artboard draws
  it as a class-level statement of what a FVIIIa-mimetic BsAb does, and the artboard is the filing
  authority where it and `[PDF-V]` disagree — the same call recorded for the investigational panel
  below. Transcribed into `denecimig-overview` rather than shared with `emicizumab-moa` as one
  constant: two agents state the same class fact from two sources, and a card reading the _other_
  agent's topic would let an edit to emicizumab's copy silently rewrite this one.
- **Investigational FVIIIa-mimetic therapies in early-stage development** (moved here from §7.6,
  2026-07-31): the source lists these under the NFT block, but the `fviii-mimetics` artboard
  draws them on this chapter — in its own corner panel, with a separate click-through per agent —
  which is the filing the app follows. `[BUILD]` models them as one topic per agent
  (`nxt007-overview`, `inno8-overview`).
  - **NXT007** — next-generation BsAb engineered by modifying emicizumab (derived from emicizumab
    heavy-chain regions with two distinct light chains carrying charged-residue mutations to
    optimize chain pairing/cofactor activity). In vitro, NXT007-treated plasma achieved coagulation
    activity equivalent to **100 IU/dL FVIII** in a TF-triggered thrombin-generation assay. Trials:
    NXTAGE (jRCT2080224835), WP44714 (NCT05987449) — **superseded in the app**, see the `[BUILD]`
    note below; kept here as what the source states.
    `[BUILD]` the "derived from emicizumab" sentence is modelled as its own topic
    (`nxt007-structure`, titled with the figure caption below), because Pop up 12 draws it under the
    diagram and the rest beside it — the same split as `emicizumab-overview`/`emicizumab-moa`. The
    id does not end `-moa` because the figure is a **structure**, not a mechanism. The two trials
    are modelled as a nested level under the bullet that introduces them, which is how both the
    source and the card subordinate them. Figure: "NXT007 BsAb Structure" (image), shown as a
    thumbnail that enlarges bare over the card; **its heading is baked into the raster**, as
    denecimig's is, so the caption is image-borne text — reached through `alt`, and since the
    2026-08-06 note below quoted by the chapter literal that names the control.
    `[BUILD]` **the card drops the "NXT007" prefix** the source puts in front of two of these
    bullets ("NXT007: Next-generation BsAb…", "NXT007 ongoing clinical trials:"). The band above
    already names the agent, and the artboard is the filing authority where it and `[PDF-V]`
    disagree — the same call recorded for the panel itself and for the denecimig card's opening
    bullet. `inno8-overview` sheds its own two the same way; see below.
    `[BUILD]` **the agent displays as "Zemocimig (NXT007)"** — the INN ahead of the code name, a
    client-directed label change of 2026-08-05, where both the source and the artboard draw the
    code name alone. It is on the panel's button and on Pop up 12's band, held as one chapter
    literal: this is the one agent whose caption and card heading agree, so a second copy could
    drift. It also opens the sentence under the structure diagram, which is the one place the INN
    reaches the data module ("Zemocimig (NXT007) is derived from emicizumab heavy-chain
    regions…"). Both `title`s still transcribe the bare "NXT007", as does the prose above and the
    "NXT007-treated plasma" bullet beside the diagram. The source and the artboard draw the code
    name throughout.
    `[BUILD]` **the figure raster carries the INN as well, and the control that opens it follows**
    (2026-08-06). The re-export in 029caec repainted the baked heading as "ZEMOCIMIG (NXT007) BsAb
    structure" where it read "NXT007 BsAb STRUCTURE", and rewrote two more lines with it: the
    subtitle is "Emicizumab-derived heavy chains" for "Further optimized Hch of emicizumab", and
    both arm labels are "Novel light chain" for "Non-common Lch". All three are image-borne and
    are transcribed in `alt`. The figure's trigger and its enlargement are named by a **second
    chapter literal**, "Zemocimig (NXT007) BsAb structure", where they read `nxt007-structure.title`
    until then — the thumbnail is decorative, so "Expand …" is the button's whole accessible name,
    and the painted heading is the only text a reader can see to say it by. The topic's `title` is
    unchanged and stays the source's, which is the split above holding rather than an omission.
    `[BUILD]` **the trials bullet carries the client's phase 3 program, not the source's** (same
    2026-08-05 pass): "Initiated in phase 3 trials:" over **ZEBRHA 1 (NCT07416526)** and **ZEBRHA 2
    (NCT07416604)**, replacing the NXTAGE/WP44714 pair transcribed above. Two children under a
    colon either way, so the artboard's nesting is untouched; the phase moved into the parent
    bullet, so the children drop the "study" the source's names carried.
  - **Inno8** — novel **VHH-based, once-daily oral** FVIIIa-mimetic for HA; under evaluation in the
    nonrandomized open-label phase 1 **VOYAGER2** trial (NCT07220564).
    `[BUILD]` **no figure topic is split off this overview**, unlike the other three agents': Pop up
    13 draws its two bullets across the top and the panel beneath them, with no prose under the
    picture, so there is nothing to move. The figure's caption stays in `figures` and the chapter
    states its own title for the control.
    `[BUILD]` **the card drops the "Inno8" prefix** the source puts in front of both bullets
    ("Inno8: Novel VHH-based…", "Inno8 is currently under evaluation…") — the same call as NXT007's
    and on the same authority, since the band above reads "Inno8: Oral FVIII Mimetic for HA".
    `[BUILD]` **the app calls VOYAGER2 a phase 1/2 trial**, where the source says phase 1 — a client
    copy edit of 2026-08-05, in the same pass as the `a`/hyphen edit noted at the head of this
    section. "1/2" is the span of phases as the client wrote it, not a fraction, and is not to be
    set as one.
    Figure: "Inno8 Mechanism of Action" (image), shown as a thumbnail that enlarges bare over the
    card; **its heading is baked into the raster** as denecimig's and NXT007's are, and here the
    painted line ("Inno8: Novel Factor VIII Mimetic Bispecific Binder Engineered for Oral
    Administration") is both longer than the caption and the card's only statement of the
    mechanism — so `alt` carries the whole three-panel drawing.
    `[SOURCE DEFECT]` the figure labels **both** VHH arms "Anti-FIXa VHH", where the right-hand one
    annotates the anti-FX arm ("binds to FX activation peptide → FXa release upon activation"). It
    is image-borne, so it cannot be corrected without re-drawing the asset; the `alt` transcribes it
    as drawn rather than silently repairing it, so a reader comparing the two finds them the same.
    Worth raising with the designer.

### 7.6 Non-factor replacement therapies (NFTs) & hemostatic rebalancing agents

- **NFT benefits/challenges** (block "Non-factor Replacement Therapies"): _Benefits:_ SC
  administration, stable thrombin generation, long half-life, shifts disease **severe → mild**,
  effective regardless of inhibitor status. _Challenges:_ increased thrombotic risk, ADA
  development, complex MOA, lack of standardized lab monitoring, management of major surgery, use in
  older populations.
- **Hemostatic rebalancing agents in treatment of HA/HB** — enhance thrombin generation by
  targeting endogenous anticoagulant pathways (**TFPI, AT, and the APC/protein S system**).
  - _Anti-TFPI mAbs:_ TFPI limits coagulation by inhibiting FXa and the TF–FVIIa
    complex; **concizumab and marstacimab** selectively bind the **K2 domain of TFPI**, reducing
    TFPI-mediated inhibition of FXa and enabling FXa generation via the FVIIa–TF pathway.
  - _AT-directed siRNA:_ AT neutralizes thrombin and FXa; **fitusiran** uses RNA interference to
    reduce hepatic AT production, restoring thrombin generation and rebalancing hemostasis.
  - Figure: "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade" (image; APC =
    activated protein C, AT = antithrombin, TFPI = tissue factor pathway inhibitor).
- **Investigational FVIIIa-mimetic therapies in early-stage development** — the source lists NXT007
  and Inno8 in this block, but they are FVIIIa mimetics, not rebalancing agents, and the design
  files them on the §7.5 chapter. Moved to [§7.5](#75-fviiia-mimetic-bsabs-approved--emerging-agents-for-ha)
  (2026-07-31); this line records where they came from.

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
  patient goals/preferences."

  `[BUILD]` **This node is the `/explore` page** — see
  [§5](#5-explore-therapy-options-table-secondary-engine) and
  `docs/adr/0007-explore-is-the-sdm-conclusion.md`. The `/explore` artboard renders it as the
  page's `<h1>`, and continues the sentence past where the blueprint stops with "…when making
  treatment decisions". **The app ships neither long form**: on 2026-08-05 the client cut the
  heading back to its opening clause, "Leverage multidisciplinary care and SDM with patients"
  (plural). The enumeration it drops is covered by the lead and bullets below.

  Its four bullets were previously recorded here abridged ("Focus on what matters to
  patients/families; empower participation; improve understanding; support adherence, quality of
  care, satisfaction"). The artboard supplies them in full:

  - "Focus on what matters most to patients, families, and caregivers"
  - "Empower patients and caregivers to actively participate in education and decision-making
    around treatment selection"
  - "Improves understanding of treatment options and engages patients in their care"
  - "Supports improved adherence, quality of care, and patient satisfaction"

  Note the tense shift the source makes: the first two are imperatives addressed to the clinician,
  the last two are statements about what SDM does.

  `[BUILD]` **The client rewrote this set on 2026-08-05**, and the rewrite is what ships. The two
  statements are folded into one sentence that now sits between the `<h1>` and the list
  (`src/data/explore.ts` → `SDM_LEAD`), leaving three bullets that are all imperatives
  (→ `SDM_POINTS`):

  > "SDM engages patients in their care, improves quality of care, and increases patient
  > satisfaction"
  - "Focus on what matters most to patients, families, and caregivers"
  - "Empower patients and caregivers to actively participate in education and treatment decisions"
  - "Utilize SDM to support improved adherence"

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

| Piece                                 | File                                                 | Status                                                                                                                      |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Comparison-table data + filter engine | `src/data/treatments.ts`                             | ✅ built, type-checks                                                                                                       |
| Wizard branching model + notes        | `src/data/wizard.ts`                                 | ✅ built, type-checks (scenario-specific `SCENARIO_NOTES`; `CLASSES_TO_CONSIDER` boxes)                                     |
| Interactive demo (both engines)       | `treatment-wizard-demo.html` (repo root)             | ✅ standalone; logic mirrors the TS modules (incl. `CLASSES_TO_CONSIDER`)                                                   |
| Per-drug info sheets data             | `src/data/drug-sheets.ts`                            | ✅ built, type-checks (7 sheets; see [§6](#6-drug-information-sheets))                                                      |
| Education / glossary / refs / survey  | `src/data/{education,glossary,references,survey}.ts` | ✅ built, type-checks (issue 00)                                                                                            |
| `/explore` SDM copy + class index     | `src/data/explore.ts`                                | ✅ built, type-checks (§9's node verbatim; `EXPLORE_SEGMENTS`, see [§5](#5-explore-therapy-options-table-secondary-engine)) |
| Content join/coverage tests           | `src/data/content.test.ts`                           | ✅ 21 tests pass                                                                                                            |
| React UI (wizard + sheets + explore)  | `src/routes/`                                        | 🟡 wizard, education, landing and `/explore` built; the §5 comparison table is not                                          |

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
