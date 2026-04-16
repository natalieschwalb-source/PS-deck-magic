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
- May use Radiant Red background or white background depending on tone
- If red background, text must be white and highly legible
- Logo top-left
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
- Clean white background preferred
- Typographic hierarchy only
- No hero image required

Avoid:
- Long descriptions
- Decorative imagery

---

### Layout 03 — `section-divider`
Use when:
- Beginning a new section
- Resetting the audience before a shift in argument

Structure:
- Section name
- Optional one-line setup statement
- Section number if applicable

Visual rules:
- Often full red or strong high-contrast layout
- Minimal content
- Must feel like a reset, not a content slide

Avoid:
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
- Stats are the hero
- Red can be used strongly here
- Large numbers may use Roboto Mono styling cues if appropriate
- Lots of whitespace

Avoid:
- More than 2 major stats
- Tiny annotations everywhere
- Fake precision when data is directional

---

### Layout 10 — `case-study-psi`
Use when:
- Problem / Solution / Impact
- Reference architecture in action
- Proof through example

Structure:
- Client / context
- The problem
- The solution
- The impact
- 2–3 measurable outcomes if available

Visual rules:
- Use structured blocks or bands
- Needs clear hierarchy
- Can include logo / image / product visual if real and relevant

Avoid:
- Generic “we helped a client transform” language
- No quantified impact if the slide is meant to prove value

---

### Layout 11 — `table-structured`
Use when:
- Commercial model
- comparison matrices
- requirements mapping
- phased scopes
- governance / ownership models

Structure:
- Headline
- Short subhead
- Table as primary content

Visual rules:
- White background preferred
- Strong table hierarchy
- Red only for emphasis, not full fill everywhere
- Keep rows readable and spacious

Avoid:
- Tiny unreadable tables
- Decorative visuals competing with the table

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
- Chart must be readable first
- Use brand-safe chart colors
- Use red as primary accent, not rainbow clutter

Avoid:
- A chart without a takeaway
- More than one complex chart per slide unless very simple

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
- provocative statement
- sharp transition
- bold summary line
- manifesto / framing moment

Structure:
- Headline only
- Optional tiny subhead

Visual rules:
- Maximum whitespace
- Strong typographic confidence
- Best used sparingly

Avoid:
- Using this repeatedly
- Long explanation text

---

### Layout 15 — `closing-commitment`
Use when:
- final slide
- recommendation
- ask
- closing statement
- partnership close

Structure:
- Final headline
- Closing body statement
- Optional next step / recommendation / commitment line

Visual rules:
- Must feel intentional and conclusive
- Can be red or white depending on deck tone
- No appendix feel
- No dead-end CTA with nowhere to click

Avoid:
- Ending on team bios
- Ending on appendix
- Ending on generic “thank you”

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

### Sparse layouts
- title-hero
- section-divider
- headline-only
- image-headline

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