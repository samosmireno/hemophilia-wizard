# Ping-pong the landing footage instead of looping it

**Status:** accepted

`src/assets/landing-loop.mp4` is the delivered footage **concatenated with its own
reverse** — 382 frames where the source has 192, playing forward then backward. That is
deliberate, and it is the reason the file is 16 seconds long and twice the size it
otherwise needs to be.

## Why

The delivered clip does not loop. It is a continuous dolly-in: frame 0 is a wide shot
with the subject at roughly a quarter of the frame, frame 191 a close-up of the same cell
filling it. Mean absolute difference between the two is **46.5/255**, max channel
difference 187/255 — nowhere near a match.

A plain `<video loop>` therefore cuts hard from close-up back to wide every 8 seconds.
That matters more than it would for most decorative assets, because motion is the _only_
thing this layer contributes over a static image: the 77%-opaque gradient washed over it
(`docs/styling.md` §7) suppresses colour and detail, so a periodic jump-cut is the single
most eye-catching event on the landing page.

Ping-ponging removes it by construction. Dropping the frames that would be duplicated at
each join, the two seams measure **6.57** and **5.43** mean difference — against a
**4.70** baseline for ordinary adjacent frames mid-clip. The joins are, by measurement,
indistinguishable from normal motion.

The content tolerates reversal because nothing in frame has a direction of time. It is
abstract cell imagery; a slow push-in becomes a slow push-out, and the drifting
corpuscles simply drift back.

## What we rejected

**Cross-fading the tail into the head.** The conventional fix, and it keeps motion
unidirectional. But the two ends differ by roughly 4× in subject scale, so the dissolve
reads as a morph rather than a cut — softer than the jump, not invisible, and it costs
footage at both ends.

**Accepting the cut.** Free, and the wash mutes it somewhat. Rejected for the reason
above: on a page whose backdrop exists to move, the one moment it jumps is the moment
everyone looks.

**Re-shooting or re-rendering.** The correct answer, and unavailable — this is a
client-supplied asset.

## Costs

- **The file doubles**, 0.95 MB → 1.90 MB at 720p CRF 30. Still 79% under the 8.99 MB
  source, so this was not the binding constraint.
- **The reversal is its own event.** Motion decelerates to zero at the midpoint and
  changes direction. On a 16-second cycle under a heavy wash this reads as a breath
  rather than a glitch, but it is a taste call, not a fact.
- **It is a workaround.** Tracked as open item 8 in `docs/styling.md` §9: if the designer
  can supply an 8–12 second clip that loops cleanly, that supersedes this — halving the
  asset and removing the reversal. Reversing this decision needs new footage, which is
  why it is written down rather than left as an unexplained 16-second palindrome.
