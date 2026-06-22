# Distribution Playbook — 30 Days of Posting, Across All Four Labs

_Written 2026-06-20. The point of this document: stop building, start the feedback loop you've been starving. One post = content-vetting + distribution in the same motion._

---

## Part 1 — The diagnosis (the gaps, named)

The whole ecosystem (PAL, MSL, GenAI, the new PSL, and the `job-search-system` Career OS) shares **one failure pattern**, and everything else is a symptom of it:

> You keep building because building is safe and in your control. You avoid the one scary thing — putting a name and an email next to a single real user and watching whether they come back.

The specific gaps that flow from that:

1. **Ghost-collector architecture.** All labs are localStorage-only. Someone spends four hours in a lab and stays permanently unreachable. Zero identified users, zero emails, zero re-engagement. PostHog gives you events, not people.
2. **Surface over depth.** The instinct is to add a fourth/fifth lab (PSL) before the first three have a single identified user or GitHub star. Widening surface area is avoidance dressed as progress.
3. **The spine trap.** Writing STATUS / LINEAGE / DECISIONS / AUDITS md files *feels* like work, ships nothing, reaches no human. The most seductive trap because it looks productive. (Yes — including the spine work we nearly did. Worth doing, but not instead of distribution.)
4. **Flywheel before fuel.** Building the full Career OS loop (assess→plan→verify→résumé→apply) before validating anyone wants even one node.
5. **Vanity metrics.** Scoring yourself by "155+ cases, 300+ scenarios, 222+ posts" instead of "how many humans came back."
6. **Free-forever anchoring.** "Free forever" badges train your most-engaged users to expect zero, then you'll try to charge them later.
7. **No ICP.** Serving analysts + ML/DS/DE + AI engineers + data-people-becoming-engineers + all job seekers at once means no single human feels "this was built for me."

The cliff: 30 days of building, 0 days of distribution.

---

## Part 2 — Why you keep circling (read this when you freeze)

You've made vetting a **precondition** for distribution: _"I can't post until I know the content is good — but I can't know it's good without posting — so I freeze."_

That loop has **no exit from the inside**, because the only instrument that can answer "is this good?" is a reader, and a reader is outside the loop. Spinning it in private is not diligence. It *is* the circling.

**The break:** collapse vetting and distribution into one action.

- Wrong unit: vet *the lab* before distributing *the lab*. (You'll circle forever.)
- Right unit: **one post, one insight.** You don't need 700 modules vetted. You need *one* sharp idea good enough to stand alone.
- Decouple value from promotion. The thing that's "stupid if it's not good" is posting a *link*. The safe thing is posting the *insight itself* — no link, no product mention. Just teach the one thing.
  - If it lands (saves, comments, "where do I learn this?") → that's your vetting signal **and** your distribution.
  - If it flops → you learned it for free, zero product exposure, zero embarrassment.

Either way the loop breaks, because "is it good?" finally got handed to the only thing that can answer it.

**Channel order:** LinkedIn first (forgiving room). Reddit later, value-first by answering in-niche questions before any link — Reddit punishes weak/promotional content hardest, so your fear of it is *correct*; don't vet there.

**Reframe the stakes:** this is not a "trial by fire." It's a conversation you've refused to start. A post that flops costs nothing — no one remembers it, you go again Thursday. It's darts, not skydiving: throw a lot, most miss, each throw is free, you only need a few to stick. The first one carries all the accumulated weight; the fourth one won't.

---

## Part 3 — The instruction each lab runs to find its best 10

Drop this prompt into a session inside each lab repo (PAL, MSL, GenAI). It self-audits and returns a ranked shortlist.

### The extraction prompt (reusable)

> Audit this lab's content (rooms, cases, modules, articles, PrepLab/trainer questions). Surface the **10 most post-worthy pieces** for a no-link, value-first LinkedIn post aimed at a senior practitioner. Score each candidate against these criteria:
>
> 1. **Counterintuitive** — contains an "I was wrong / most people get this wrong" moment, not just a fact.
> 2. **Standalone** — teachable in under 200 words with zero product or lab context.
> 3. **Specific mistake** — names a concrete error a real practitioner actually makes on the job.
> 4. **Visceral hook** — has a vivid, visual, or "watch it break" angle.
> 5. **Save-worthy** — a senior person would save or share it to look smart / help their team.
>
> For each of the 10, output: **(a) title**, **(b) the one-sentence hook**, **(c) the 2–4 sentence insight**, **(d) source module/case**, **(e) "why it lands" note**, **(f) score /25**. Rank descending. Do not invent content — every item must trace to a real module in this repo.

### Per-lab notes (where the gold already is)

**PAL — Product Analytics Lab.** Richest content. Mine: Spot-the-Flaw (SRM, peeking, Simpson's Paradox, novelty effect, p-hacking, regression-to-mean), the RCA cases with the SQL validation step, the A/B readout "Ship/Rollback/Investigate" calls, and the estimation walkthroughs. These are catnip for analysts and PMs on LinkedIn.

**MSL — ML Systems Lab.** Mine: Bug Hunt (one buried flaw per snippet), Spot-the-Flaw adversarial analyses, the StaffLayer IC3→IC5→Staff reveals (post the *gap* between the levels — that's the hook), silent-model-degradation and drift scenarios, calibration failures. "Here's production ML code with one bug — find it" is a proven format.

**GenAI — GenAI Systems Lab.** Mine: the six RAG failure scenarios (stale doc, top_k=1, prompt injection), context-overflow / compaction, agent-loop-gone-wrong, eval design. "An engineer set top_k=1 and shipped a confident wrong answer — here's why" is a strong opener.

**PSL — Production Systems Lab (no shipped content yet).** PSL's "best 10" is different: it has nothing built, so its posts are **build-in-public teasers of the glass-box concepts**. This validates PSL *before* you build it. Candidate posts: watch your list eat RAM (generator vs list), Pandas copy-vs-view / SettingWithCopyWarning's real cause, `merge` as a hash-join, mutable default args, aliasing arrows, `in list` vs `in set` race, reading a traceback like an engineer. If these land, you've pre-vetted PSL's curriculum with zero code written. If they don't, you saved yourself a month.

---

## Part 4 — The 30-day calendar

Cadence: **4 posts/week**, one per lab on rotation. ~17 posts in 30 days. Sustainable for one person.

- **Weeks 1–2 — pure value, NO links.** Teach the insight. Measure resonance only.
- **Weeks 3–4 — value + soft link** on posts that already proved they land. ("I built a free lab for this →") Only attach links to *winners* from weeks 1–2.

| Day | Lab | Mode |
|-----|-----|------|
| Mon | PAL | value, no link |
| Tue | MSL | value, no link |
| Thu | GenAI | value, no link |
| Fri | PSL (build-in-public) | value, no link |
| _(repeat wks 1–2)_ | | |
| Wks 3–4 Mon/Thu | top performers | value + soft link |
| Wks 3–4 Tue/Fri | new value posts | value, no link |

Weekend = off (and Reddit value-comments in-niche, no links, optional).

---

## Part 5 — The post template

```
HOOK        One line. A claim that makes a practitioner stop scrolling.
            ("Most analysts call a 3% lift a win. Here's how SRM made it fake.")
SETUP       2–3 lines. The scenario / the trap.
TURN        The "watch it break" or "here's what's actually happening" moment.
LESSON      1–2 lines. The transferable judgment.
ASK         A question that invites a reply. (Replies > likes for the algorithm
            and for finding your people.)
(no link in weeks 1–2)
```

Keep it under ~150 words. White space. One idea per post.

---

## Part 6 — How we automate it (next 30 days)

What can and can't be automated, honestly:

- **Drafting — automated.** A scheduled task runs each weekday morning, pulls the next item from that lab's ranked-10 queue, and produces a finished post draft using the template above, dropped where you'll see it.
- **Posting — manual, by you.** LinkedIn auto-posting violates ToS and risks the account (consistent with the JSS decision that "LinkedIn stays manual"). You paste and post. 60 seconds.
- **Review — weekly.** Every Friday, a scheduled task asks you for the week's numbers (which posts got saves/comments/DMs) and re-ranks the queue so winners get the week-3 link treatment.

### Setup steps
1. Run the Part 3 extraction prompt inside PAL, MSL, and GenAI → save each lab's ranked 10 as `CONTENT_QUEUE.md` in that repo.
2. For PSL, write the 7–10 glass-box teaser drafts directly (no repo audit needed — concepts listed in Part 3).
3. Stand up a daily-draft scheduled task and a Friday-review scheduled task.
4. Post the first one **today**. Pick the single sharpest piece, no link.

---

## Part 7 — Success metrics (humans, not modules)

For the next 30 days, you are allowed to track exactly these. Nothing about module counts.

- **Posts shipped** (target: ~17). The only input metric. You control it.
- **Replies + DMs** per post. Signal that you found a person, not a like.
- **"Where do I learn this?" comments.** The buy-signal before any product exists.
- **Emails captured** once links go live in weeks 3–4. The first time a visitor stops being a ghost.

If at day 30 you have shipped 17 posts and have even 20 real humans who replied or asked for more, you have broken the pattern. That is the win — not a fifth lab.

---

_Rule of the month: enough building. The building was you guessing what's good. Posting is you finding out._
