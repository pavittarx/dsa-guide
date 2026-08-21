---
order: 1
title: Hashing & counting
skill: Answer "have I seen this?", "how many of each?" and "where is it?" without re-scanning.
track: core
requires: [0]
guideSection: s6
incident: The profile endpoint issues one query, then two hundred more. Nobody wrote a loop of queries.
ladder: u01-lookup-service
varied:
  - u01-canonical-skus
  - u01-top-error
  - u01-active-streak
retrieval:
  - u00-first-repeat
  - u00-busiest-minute
transfer: u01-first-unique
inventory:
  - hash-map
  - counter
---

<div class="card watch">
  <span class="tag">14:05 · code review</span>
  <p>A colleague pastes a trace. One request, 201 database queries. The endpoint fetches 200 profiles, and then — somewhere — asks the database about each one individually.</p>
  <p>Nobody wrote a loop of queries. The loop is hiding inside an attribute access.</p>
</div>

## The invariant

Every problem in this unit rests on the same guarantee:

<div class="inv">
  <b>invariant</b>
  The map always holds the complete answer for everything I have already walked
  past — so I never need to look backwards.
</div>

The mechanic is always one pass, and at each element you either **query** the
map about the past or **record** the present into it. The order of those two
matters more than it looks: querying before recording is what stops an element
from pairing with itself.

## Two shapes, one skill

**Membership and indexing.** "Have I seen this?" and "where does this live?"
A set or a dict answers both in constant time, so a nested scan collapses into
a single pass.

**Counting and grouping.** "How many of each?" and "which of these belong
together?" You compute a key for every item and bucket by it. Grouping by
anagram is nothing more than `key = "".join(sorted(word))` — the insight is the
key, not the data structure.

Both are the same move: *pay memory once so you never re-derive.*

## Read

The reference guide goes deeper on this in
[§6 — the eight patterns](/dsa-guide/#s6), pattern ①. The gotchas that bite are
in [§8](/dsa-guide/#s8) — in particular that O(1) is an average, not a promise.

## Then

Four problems below. They look like four different jobs — an index lookup, a
grouping, a tally, and a walk over a set. They are one skill in four costumes,
and noticing that is the actual goal of this unit.
