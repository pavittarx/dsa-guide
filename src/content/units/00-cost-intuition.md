---
order: 0
title: Cost intuition
skill: Estimate what an approach costs before you write it, and know when the slow one is right.
track: core
requires: []
guideSection: s3
incident: A handler that never changed got slow anyway. Nothing was deployed.
ladder: u00-flag-check
varied:
  - u00-first-repeat
retrieval: []
transfer: u00-busiest-minute
inventory:
  - hash-map
  - counter
---

<div class="card watch">
  <span class="tag">09:40 · first week</span>
  <p>Someone drops a graph in the channel. One endpoint's p99 has gone from 40&nbsp;ms to 4&nbsp;seconds over three months. The last deploy to that file was in March.</p>
  <p>Nobody changed the code. The data changed.</p>
</div>

## The one number

Everything in this course hangs off a single anchor:

<div class="card win">
  <span class="tag">the anchor</span>
  <p>A machine does roughly <strong>10<sup>7</sup> simple operations per second in Python</strong> — about 10<sup>8</sup>–10<sup>9</sup> in C, Rust, or Java. Memorise that and you can estimate the rest on your fingers.</p>
</div>

The gap that matters is not between "fast" and "slow". It is between costs that
grow at different rates. A linear scan over a million items is a tenth of a
second. Checking every pair of a million items is fourteen hours. Same data,
same machine, and nothing in the source code announces the difference.

That is why this bug always ships: it was correct **and** fast in every test
you ran, because your test had fifty rows.

## The three moves

Almost every speed-up in this course is one of three moves. Naming them gives
you something to reach for when a pattern name will not come.

<div class="card">
  <span class="tag">move 1 — remember</span>
  <p><strong>Spend memory so you never compute the same thing twice.</strong> Symptom: the inner loop is re-deriving a fact the outer loop already knew.</p>
</div>

<div class="card">
  <span class="tag">move 2 — order</span>
  <p><strong>Impose structure once, then exploit it many times.</strong> Symptom: you keep asking for the smallest, the nearest, or the next larger thing.</p>
</div>

<div class="card">
  <span class="tag">move 3 — once</span>
  <p><strong>Arrange to touch each element a bounded number of times.</strong> Symptom: nested loops where the inner one never needs to go backwards.</p>
</div>

This unit is about the first one, and about the judgement of when not to bother.

## Read

The reference guide covers the scale table in
[§3 — Cost intuition](/dsa-guide/#s3). Skim it, then come back — the code below
is where it sticks.
