# Technical Architecture & AI Capability

## Purpose
A technically credible deck that explains how a system is designed, how it works, and why the architectural choices are sound. Used when the audience needs to trust the technical approach before approving it.

## Typical length
- Thin brief: 8–12 slides
- Standard brief: 12–18 slides
- Rich brief: 15–25 slides

## Typical audiences
CTOs, architects, technical leads, engineering directors, infrastructure owners. People who can spot a weak technical argument and will dismiss a deck that does not engage with the real constraints.

## Recommended section shape
- **Problem** — the technical or operational problem that drove this architectural approach
- **Architecture** — the system design: layers, components, data flows, key decisions (gets the most depth)
- **Capability** — relevant technical expertise and proven delivery track record (gets extra weight)
- **Integration** — how this connects to the client's existing systems and platforms (gets extra weight)
- **Governance** — technical governance, security, compliance, and operating model
- **Next Steps** — technical decisions required, proof-of-concept scope, next phase

The engine gives maximum weight to Architecture. Integration and Capability both get elevated depth.

## Storytelling guidance
Credibility-first. The audience wants to know: does this presenter understand our technical environment? Is this architecture appropriate for our constraints? Have they actually built something like this before?

Show understanding of the client's existing landscape before proposing the new one.

## Emphasis
- Architecture slides must describe real components, real data flows, and real integration points — not generic three-layer diagrams
- Capability slides should name specific technologies, specific environments, and specific outcomes delivered
- Integration slides should reference the client's named systems where known — not "legacy ERP" but "SAP S/4HANA"

## Avoid
- Starting with the proposed architecture before establishing the problem it solves
- Generic cloud or AI diagrams that could apply to any client in any industry
- Omitting governance and security — technical audiences expect them and their absence signals inexperience
- Oversimplifying architecture to make it look cleaner than the reality

## Proposal-size behavior
In full proposal mode, technical architecture lives inside the Platform section, with Integration and Governance as supporting synthesis sections. This standalone deck type goes deeper on architecture and technical specifics than the proposal format allows.

## Writing cues
- Architecture headlines should describe the design decision and its consequence: "Event-driven architecture decouples order processing from inventory — enabling 10x scale without rewriting downstream systems"
- Capability headlines should name the technology and the outcome: "Deployed on Azure across 14 production environments — 99.95% SLA maintained through two major releases"
- Integration headlines should name the systems involved: "Bi-directional sync between Salesforce and SAP eliminates the 48-hour data lag that currently breaks pricing"
- Avoid: "a modern, scalable architecture" — say what makes it modern and scalable for this client
