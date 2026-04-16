# Publicis Sapient Design System — Presentations

This file defines how the PS presentation theme should behave in the deck engine.
It governs layout choice, visual hierarchy, image behavior, slide rhythm, and brand-safe composition.

This is not a generic presentation system.
It must produce slides that feel unmistakably Publicis Sapient:
clean, structured, modern, outcome-led, and operationally credible.

---

## 1) Brand principles for presentations

### Core visual behavior
- Lead with clarity, not decoration.
- Use black and white as the primary system for structure, rhythm, and readability.
- Use Radiant Red sparingly and intentionally to direct attention, signal importance, and create momentum.
- Red should never flood every slide by default.
- Every slide should feel resolved, deliberate, and built.

### Color rules
- Primary accent color: Radiant Red `#E90130`
- Base colors: white and black
- Chart accents may be used when needed, but should never overpower Radiant Red
- In co-branded contexts, client colors may appear, but Publicis Sapient red remains the primary signal color

### Footer behavior
- On **red background slides** (title-hero, section-divider, agenda-list): footer text is **white**
- On **white background slides** (all other layouts): footer text is **Radiant Red** (`#E90130`)
- Footer contains: page number (left), client/project label (center), Publicis Sapient (right)
- Footer uses Roboto Mono, small size, consistent across all slides

### Typography rules
- Headlines: Lexend Deca SemiBold
- Subheads / impactful callouts: Lexend Deca SemiBold
- Body copy: Roboto Regular
- Annotations / large numbers / graph labels / footers / technical markers: Roboto Mono Medium
- Do not use Roboto for headlines
- Do not over-style type; hierarchy should come from scale, spacing, and restraint

### Shape rules
- Shapes are architectural, schematic, grid-driven
- Shapes are framing devices, not decoration
- Shapes should organize, crop, focus, or signpost
- Never distort shapes
- Never use random abstract AI blobs or decorative motifs

### Photography rules
- Every image must either include Radiant Red or show technology in real use — ideally both
- Photography should feel intentional, graphic, and architectural, with a nod to humanity
- Show people working with technology, not technology isolated from people
- Avoid generic stock
- Avoid staged people looking into camera
- Avoid AI-generated humans
- Avoid fear, anxiety, dystopian tech imagery, lens flares, or refraction effects
- Avoid placing important text over images unless contrast is excellent

### Accessibility rules
- Prefer simpler layouts when in doubt
- Use built-in logical layout structures
- Ensure each slide has a unique, descriptive title
- Maintain strong text/background contrast
- Avoid grouping important text into decorative containers
- All charts and meaningful images must be alt-textable
- Reading order must remain logical

---

## 2) Slide rhythm rules

A deck should not feel like the same slide repeated 30 times.

Use visual rhythm:
- Start strong
- Alternate density
- Insert breathing space after dense slides
- Use section divider slides to reset attention
- Use stat or callout slides to create pace
- Use image-led slides selectively, not constantly

Default rhythm pattern:
- Title / opener
- Executive summary or framing
- Divider
- Content progression with alternating density
- Divider when section changes
- Heavy proof / solution sections may contain multiple content slides, but must vary layout
- End with a proper closing slide, not an appendix-style fadeout

Do not:
- Use image-right text-left layout for every slide
- Use red-background slides too frequently
- Make every slide equally dense

---

## 3) Layout selection logic

Every slide must be assigned a `layoutType`.
Layout choice is determined by:
1. slide intent
2. section role
3. tone of voice
4. content density
5. whether an image / chart / table is truly necessary

### Intent → layout defaults
- title / opener → `title-hero`
- agenda / contents → `agenda-list`
- section divider → `section-divider`
- narrative framing → `one-column-narrative`
- comparison / paired argument → `two-column-content`
- solution overview → `solution-hero`
- pillar / concept explanation → `pillar-detail`
- architecture / system explanation → `architecture-diagram`
- proof / case study → `case-study-psi`
- quantified impact → `stat-impact`
- table-heavy content → `table-structured`
- chart-heavy content → `chart-insight`
- image-led statement → `image-headline`
- quote / provocation / manifesto line → `headline-only`
- closing / ask / next step → `closing-commitment`

### Tone influence
- Data-driven: increase `stat-impact`, `chart-insight`, `table-structured`
- Visionary: increase `title-hero`, `solution-hero`, `image-headline`, `headline-only`
- Executive: use fewer layouts overall; prefer `title-hero`, `section-divider`, `stat-impact`, `closing-commitment`
- Punchy: shorten text and increase `headline-only`, `stat-impact`, `image-headline`
- Warm & human: increase `image-headline`, `one-column-narrative`, `case-study-psi`

---

## 4) Layout catalog

### Layout 01 — `title-hero`
Use when:
- First slide of the deck
- Big opening statement
- Critical transition into the deck’s main proposition

Structure:
- Large title, 2–4 lines max
- Short subhead / setup line
- Optional hero image or placeholder
- Footer / date / page index handled by template system

Visual rules:
- **Always** uses Radiant Red (`#E90130`) background
- Logo positioned top-left in white
- Title in large white type, vertically positioned at ~40% of the slide (upper half)
- Subhead below the title in smaller white type with reduced opacity
- Footer in white text at bottom
- Never clutter with bullets
- This slide should feel definitive

Avoid:
- More than one supporting sentence
- Dense body copy
- Small imagery

---

### Layout 02 — `agenda-list`
Use when:
- Agenda or contents slide
- Section roadmap

Structure:
- Section list, numbered
- Minimal explanatory copy

Visual rules:
- **Radiant Red background** (`#E90130`) — red, not white
- Small "Agenda" label in Roboto Mono, white with reduced opacity, above the item list
- Items numbered with zero-padded Roboto Mono digits: `01`, `02`, `03`…
- Item text in white Lexend Deca, large and spaced vertically to fill the slide
- Items distribute evenly using vertical space (`justify-content: space-evenly`)
- Footer in white text

Avoid:
- Long descriptions per item
- White background on this layout
- Decorative imagery

---

### Layout 03 — `section-divider`
Use when:
- Beginning a new section
- Resetting the audience before a shift in argument

Structure:
- Section name (title)
- Optional one-line setup statement
- Section number if applicable

Visual rules:
- **Always Radiant Red background**
- Title positioned at the **top-left** of the slide (~top 10%, left 5%) — NOT centered vertically
- Title text is large, white, bold (Lexend Deca)
- Section number (e.g. `01`, `02`) displayed in **very large Roboto Mono** (7em+) at the **bottom-right** of the slide, white with opacity ~0.2 (ghost watermark effect)
- Footer in white text
- Minimal content — no bullets, no body copy

Avoid:
- Centering the title vertically (it belongs at top-left)
- Omitting the section number watermark when a number is provided
- Repeating the next slide’s body copy
- Bullet points
- Explanatory overload

---

### Layout 04 — `one-column-narrative`
Use when:
- Framing a problem
- Explaining a thesis
- Making a concise strategic argument

Structure:
- Headline
- Subhead
- 1 body block or 3–5 short bullets

Visual rules:
- White background preferred
- Wide margins
- Keep text area disciplined
- No image unless it truly strengthens the argument

Avoid:
- Turning this into a text wall
- Forcing a placeholder image if not needed

---

### Layout 05 — `two-column-content`
Use when:
- One side explains, the other supports
- Text plus image / diagram / proof / secondary content

Structure:
- Left: headline + body / bullets
- Right: image, diagram, stat group, quote, or visual support

Visual rules:
- Text column must stop before the visual zone
- Maintain clear gutter between columns
- Right-hand side must feel intentionally reserved, not leftover space

Avoid:
- Letting text run beneath the visual
- Filling both columns with equal text density

---

### Layout 06 — `solution-hero`
Use when:
- Introducing the core proposed solution
- Naming the platform / operating model / concept

Structure:
- Solution name
- One-sentence definition
- One short explanatory paragraph or 3 high-level bullets
- Strong hero visual / platform diagram / product mockup

Visual rules:
- This is a concept-introduction slide, not a details slide
- Needs more drama and whitespace than a normal content slide
- Visual should make the solution feel tangible and ownable

Avoid:
- Re-listing all components
- Turning this into a technical architecture slide

---

### Layout 07 — `pillar-detail`
Use when:
- Explaining one solution pillar
- Expanding one major conceptual building block

Structure:
- Pillar title
- One-line strategic framing
- 3–4 bullets maximum:
  - what it is
  - how it works
  - why it matters
- Optional “Value:” line at end if useful

Visual rules:
- Usually two-column
- Visual should reinforce only this pillar
- Use diagrams, flows, simple system visuals, or UI mockups

Avoid:
- Combining multiple pillars into one slide unless proposal size is lean
- Repeating language already used on the overview slide

---

### Layout 08 — `architecture-diagram`
Use when:
- Explaining system relationships
- Showing modules, flows, orchestration, infrastructure, data layers, or platform logic

Structure:
- Headline
- One-line framing statement
- Left or top: concise explanation
- Main visual area: architecture / system / flow / stack diagram

Visual rules:
- This layout privileges structure over prose
- Diagram area should dominate
- Use Roboto Mono style cues for labels / technical annotations if needed
- Keep supporting text short

Avoid:
- Long narrative paragraphs
- Repeating pillar descriptions
- Turning architecture into generic capability bullets

---

### Layout 09 — `stat-impact`
Use when:
- Quantified proof
- ROI / commercial value / KPI outcomes
- Before/after or target-state metrics

Structure:
- Headline
- 1–2 large stats maximum
- Short supporting labels
- Optional short bullet list beneath

Visual rules:
- **White background** with thin red top bar
- Left column (~55%): headline, subhead, and short supporting bullet points (Lexend Deca body)
- Right column (~40%): large stat numbers in **Radiant Red** (`#E90130`), Roboto Mono or Lexend Deca, with small label below each in grey
- Stats are the hero — numbers dominate the right column
- Lots of whitespace
- Footer uses Radiant Red text on white

Avoid:
- More than 2 major stats in the right column
- Tiny annotations everywhere
- Fake precision when data is directional
- Red background (this layout uses white)

---

### Layout 10 — `case-study-psi`
Use when:
- Problem / Solution / Impact
- Reference architecture in action
- Proof through example

Structure:
- Client / context label (Roboto Mono, small red, above headline)
- Headline
- Three structured PSI blocks (stacked vertically):
  - **The problem** — 1–2 lines describing the challenge
  - **The solution** — 1–2 lines describing the approach
  - **The impact** — 1–2 lines describing the outcome
- Optional right column (~35%) with 2–3 large metric stats if quantified outcomes are available

Visual rules:
- **White background** with thin red top bar
- PSI block labels (“The problem”, “The solution”, “The impact”) in **Radiant Red**, Roboto Mono, small caps style
- Each block has its content in Lexend Deca body text beneath the label
- If stats are present: right column shows large red numbers (Roboto Mono) with small grey label beneath each
- The three PSI blocks fill the left 60% of the content area
- Needs clear hierarchy between label and content within each block
- Can include logo / image if real and relevant

Avoid:
- Generic “we helped a client transform” language
- Omitting quantified impact when the slide's purpose is to prove value
- Forcing a right stats column when no metrics are available

---

### Layout 11 — `table-structured`
Use when:
- Commercial model
- Comparison matrices
- Requirements mapping
- Phased scopes
- Governance / ownership models

Structure:
- Headline
- Short subhead
- Table as primary content

Visual rules:
- **White background — no red top bar** on this layout
- Table has a bold **Radiant Red top border** and **Radiant Red bottom border**
- Header row uses red fill with white bold text (Roboto Mono or Lexend Deca)
- Body rows alternate between white and very light grey
- Keep rows readable and spacious
- Footer uses Radiant Red text on white

Avoid:
- Tiny unreadable tables
- Decorative visuals competing with the table
- Red bar at top (the table's own red borders handle the accent)

---

### Layout 12 — `chart-insight`
Use when:
- Trends, comparisons, performance charts, adoption curves, benchmarks

Structure:
- Headline
- Subhead that tells the takeaway
- Chart as primary element
- Optional 1–2 bullets with implication

Visual rules:
- **White background — no red top bar** on this layout
- Chart area occupies the majority of the slide (~65% height), with a visible 1px border in light grey
- Headline and subhead above the chart
- Chart placeholder label ("DATA VISUALIZATION") inside the chart area when no data is available
- Use Radiant Red as primary chart accent color — not rainbow clutter
- Footer uses Radiant Red text on white

Avoid:
- A chart without a takeaway headline / subhead
- More than one complex chart per slide unless very simple
- Red bar at top (the chart area border handles the structure)

---

### Layout 13 — `image-headline`
Use when:
- Big statement supported by a strong visual
- Emotional or conceptual transition slide
- Future-state or aspiration moment

Structure:
- Headline
- Short subhead
- Large image area

Visual rules:
- Use only if image is strong enough
- Text over image only when contrast is excellent
- Shape cropping may be used if it adds focus

Avoid:
- Weak placeholder-driven slides
- Literal stock images

---

### Layout 14 — `headline-only`
Use when:
- Provocative statement
- Sharp transition
- Bold summary line
- Manifesto / framing moment
- Pull quote or sourced statement

Structure:
- Headline only (or a quoted statement)
- Optional tiny subhead or attribution

Visual rules:
- **White background** — this layout is NOT red
- Headline rendered in large **Radiant Red** (`#E90130`) text (Lexend Deca SemiBold, ~2.6em)
- Maximum whitespace — headline should breathe
- Strong typographic confidence; scale creates the drama
- **If the headline exceeds ~60 characters** (i.e. it is a long quote or manifesto sentence rather than a short punchline): render it inside a Roboto Mono quote box with a left border in Radiant Red and slightly smaller text (~1.4em), white background
- Footer uses Radiant Red text on white

Avoid:
- Red background (this layout relies on the red TYPE for contrast, not the background)
- Using this layout repeatedly
- Long explanation text after the headline

---

### Layout 15 — `closing-commitment`
Use when:
- Final slide
- Recommendation
- Ask
- Closing statement
- Partnership close

Structure:
- Final headline
- Closing body statement
- Optional next step / recommendation / commitment line

Visual rules:
- **White background**
- A **Radiant Red horizontal bar** spans the full width at the top of the content area (4–6px thick)
- A **Radiant Red vertical stripe** runs down the left edge of the main content (4–6px wide, full height)
- These two red elements create an “L-bracket” feel — purposeful, clean, conclusive
- Headline in large Lexend Deca, dark/black
- Body text in Roboto Regular, dark grey
- Must feel intentional and conclusive
- Footer uses Radiant Red text

Avoid:
- Red background (this is always white)
- Ending on team bios
- Ending on appendix
- Ending on generic “thank you”
- Making it look like an unresolved content slide

---

## 5) Image placeholder behavior

If an image is needed but not yet generated:
- Place the placeholder exactly in the image zone of the selected layout
- Never place image placeholders as a generic bottom bar
- Placeholder must preserve the actual layout footprint so the user can judge composition
- If a slide does not need an image, do not insert an image placeholder

Placeholder labels should reflect the visual intent:
- HERO PHOTO
- DATA VIZ
- PRODUCT MOCKUP
- ARCHITECTURE DIAGRAM
- LIFESTYLE
- CASE STUDY VISUAL

---

## 6) Content density rules by layout

### Sparse layouts (red bg: title-hero, section-divider, agenda-list)
- title-hero — red bg, white type
- section-divider — red bg, white type, ghost section number
- agenda-list — red bg, white Roboto Mono numbered list
- headline-only — white bg, large red headline
- image-headline — white or image bg

### Medium-density layouts
- one-column-narrative
- two-column-content
- solution-hero
- pillar-detail
- closing-commitment

### Dense layouts
- architecture-diagram
- case-study-psi
- table-structured
- chart-insight

Do not place dense copy into sparse layouts.

If content exceeds a layout:
- first compress
- then change layout
- then split into a second slide if needed

Never silently overflow.

---

## 7) Layout expansion behavior

When a section is especially important — especially `our solution`:
- solution overview gets 1 hero slide
- each strong pillar may become its own `pillar-detail` slide
- architecture may become 1 dedicated `architecture-diagram` slide
- value may become 1 dedicated `stat-impact` or `chart-insight` slide

Do not expand:
- team
- appendix
- summary / next steps
- generic retrieval sections

The solution section should usually be the deepest section in proposal-sized decks.

---

## 8) Section-by-section preferred layouts

### Executive Summary
Prefer:
- title-hero
- stat-impact
- one-column-narrative
- closing-commitment

### Challenge / Current State
Prefer:
- section-divider
- one-column-narrative
- two-column-content
- chart-insight

### Future State / Vision
Prefer:
- image-headline
- solution-hero
- headline-only
- two-column-content

### Our Solution
Prefer:
- solution-hero
- pillar-detail
- architecture-diagram
- stat-impact
- chart-insight

### Why Publicis Sapient
Prefer:
- one-column-narrative
- two-column-content
- case-study-psi
- stat-impact

### Delivery / Roadmap / Governance
Prefer:
- two-column-content
- table-structured
- chart-insight
- one-column-narrative

### Commercial
Prefer:
- stat-impact
- table-structured
- chart-insight

### Closing
Prefer:
- closing-commitment
- headline-only
- image-headline

---

## 9) Anti-patterns

Never do the following:
- use the same text-left image-right layout for most of the deck
- make every section look identical
- flood the deck with red backgrounds
- add image placeholders to slides that do not need visuals
- let body text run beneath a visual area
- use decorative AI imagery
- use generic stock people
- use random shape ornaments
- build slides that feel busier than the underlying point requires
- end on an appendix slide unless the appendix is clearly outside the core narrative

---

## 10) Rendering priorities

When choosing between beauty and clarity:
1. clarity
2. hierarchy
3. accessibility
4. brand expression
5. visual flourish

If a layout feels complicated, simplify it.

Publicis Sapient should look confident, not crowded.