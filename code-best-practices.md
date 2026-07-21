# Production Code Standards — Instructions for AI Agents

> **Purpose:** These are ordered, language-agnostic, framework-agnostic instructions for writing maintainable, readable, collaboration-ready production code. Follow them in sequence: earlier rules constrain later ones. When two rules conflict, the lower-numbered rule wins.

---

## 0. Prime Directive

**Optimize for the next human reader, not the machine and not yourself.**
Code is read 10x more often than it is written. Every decision below flows from this. If a choice makes code faster to write but harder to read, reject it.

---

## 1. Understand Before You Write

1.1. **Read the existing codebase first.** Identify its conventions — naming style, file layout, error-handling patterns, test structure. Match them. Consistency with the existing codebase beats personal or "objectively better" style.

1.2. **Restate the requirement before implementing.** If the task is ambiguous, state your assumption explicitly in code comments, commit messages, or your response — never silently guess.

1.3. **Prefer modifying existing code over adding parallel new code.** Duplication of concepts (two ways to do the same thing) is worse than imperfect single implementations.

1.4. **Do not refactor and add features in the same change.** One change = one intent.

---

## 2. Naming — The Cheapest Documentation

2.1. **Names must reveal intent.** A reader should not need to open a function to know what it does. `getUserById` not `fetch`, `retryDelayMs` not `delay`.

2.2. **Encode units and types in names when the language doesn't.** `timeoutMs`, `sizeBytes`, `priceInCents`, `createdAtUtc`.

2.3. **Use the vocabulary of the domain, consistently.** If the business says "invoice," never call it "bill" in code. One concept = one word across the entire codebase.

2.4. **Length proportional to scope.** Loop index `i` is fine for 3 lines; a module-level variable needs a full descriptive name.

2.5. **Booleans read as predicates:** `isActive`, `hasPermission`, `canRetry`. Avoid negated names (`isNotReady`) — they create double negatives at call sites.

2.6. **No abbreviations except industry-universal ones** (`id`, `url`, `db`, `config`, `ctx`). `usrMgrSvc` is a code smell.

---

## 3. Functions & Units of Logic

3.1. **One function, one job, one level of abstraction.** A function should either orchestrate steps or perform a step — not both.

3.2. **Keep functions short enough to hold in your head** (guideline: ~20–40 lines). If you need a comment to separate "sections" inside a function, extract those sections into named functions instead.

3.3. **Minimize parameters** (guideline: ≤3). More than that, pass a named object/struct so call sites are self-documenting.

3.4. **No hidden side effects.** A function named `validateEmail` must not also send a welcome email. Side effects belong in names (`saveAndNotify`) or, better, in separate functions.

3.5. **Prefer pure functions.** Same input → same output, no external state mutation. Push I/O, time, randomness, and global state to the edges of the system.

3.6. **Return early.** Use guard clauses to handle invalid/edge cases at the top, keeping the happy path unindented. Avoid deep nesting (guideline: ≤2–3 levels).

3.7. **Avoid boolean flag parameters** (`render(data, true)`). Split into two named functions or use an enum/named option.

---

## 4. Structure & Architecture of Files

4.1. **Organize by feature/domain, not by technical layer**, once a project grows beyond trivial. `orders/` containing its handlers, logic, and tests beats a global `controllers/`, `services/`, `utils/` split.

4.2. **Dependency direction flows inward:** UI/transport → application logic → domain → nothing. Core business logic must not import framework, database, or HTTP concerns.

4.3. **Keep files focused.** A file with 800 lines and 12 exports is a module boundary failure. Split by responsibility.

4.4. **`utils`/`helpers`/`common` are quarantine zones, not destinations.** If a helper has a domain, move it there and name it properly.

4.5. **Make illegal states unrepresentable.** Use the type system / data modeling to prevent invalid combinations (e.g., a `PaidOrder` type that cannot exist without a payment reference) instead of runtime checks scattered everywhere.

---

## 5. Simplicity Rules (YAGNI, KISS, DRY — in that order)

5.1. **YAGNI:** Do not build abstractions, config options, plugin systems, or generic layers for hypothetical future needs. Build for today's requirement; refactor when the second real use case arrives.

5.2. **KISS:** Prefer the boring, obvious solution. Cleverness (dense one-liners, metaprogramming, exotic patterns) is a cost paid by every future reader.

5.3. **DRY — but only for knowledge, not for lines.** Deduplicate *business rules* aggressively. Do NOT merge two code blocks that look similar but represent different concepts — that coupling is worse than duplication. **Rule of three:** tolerate duplication twice; abstract on the third occurrence.

5.4. **Delete dead code immediately.** No commented-out blocks, no `_old` files, no unreachable branches. Version control is the archive.

---

## 6. Errors & Edge Cases

6.1. **Fail fast and loud.** Validate inputs at system boundaries (API handlers, message consumers, CLI entry points). Reject bad data at the door; interior code then trusts its inputs.

6.2. **Never swallow errors.** An empty catch block or ignored error return is a production incident waiting to happen. Every error is either: handled meaningfully, transformed and re-raised with context, or propagated.

6.3. **Add context when propagating:** wrap "connection refused" into "failed to save order 4521: connection refused." Preserve the original cause/stack.

6.4. **Distinguish expected failures from bugs.** "User not found" is a domain outcome (return a result/typed error). Null-pointer dereference is a bug (crash loudly, alert). Do not handle both the same way.

6.5. **Error messages must be actionable:** what failed, with what input, and what the caller can do about it. Never leak secrets or internal stack details to end users.

---

## 7. Comments & Documentation

7.1. **Comments explain WHY, never WHAT.** The code says what it does; comments capture intent, constraints, trade-offs, and links to tickets/specs. `// increment i` is noise; `// Stripe rate-limits at 100 req/s, hence the batching` is gold.

7.2. **If you feel the urge to comment WHAT the code does, rewrite the code** (better names, extracted functions) until the comment is unnecessary.

7.3. **Document at the boundary:** every public module/API gets a short doc — purpose, inputs, outputs, failure modes. Internal private functions rarely need docs if named well.

7.4. **Every repo gets a README covering:** what it does, how to run it locally, how to run tests, and how to deploy. Assume the reader is a competent developer with zero project context.

7.5. **Record significant decisions** (why Postgres over Mongo, why polling over webhooks) in short Architecture Decision Records (ADRs) or a `DECISIONS.md`. Future maintainers need the *why*, not just the result.

7.6. **Comments rot.** When changing code, update or delete adjacent comments. A wrong comment is worse than no comment.

---

## 8. Testing

8.1. **Test behavior, not implementation.** Assert on observable outcomes (return values, state changes, emitted events), not on internal call sequences. Tests coupled to internals break on every refactor and train teams to ignore them.

8.2. **Every test follows Arrange–Act–Assert** and its name states the scenario and expectation: `rejects_expired_coupon`, not `test3`.

8.3. **Tests must be deterministic and independent.** No shared mutable state between tests, no reliance on execution order, no real clocks/network/randomness — inject them.

8.4. **Prioritize by risk:** business-critical logic and money paths get dense coverage; trivial glue code gets little. Coverage percentage is a signal, not a goal.

8.5. **Every bug fix ships with a regression test** that fails before the fix and passes after.

8.6. **Fast tests get run; slow tests get skipped.** Keep the core suite runnable in minutes locally. Push slow integration/E2E suites to CI, but keep them green — a flaky test suite is functionally no test suite.

---

## 9. Version Control & Change Hygiene

9.1. **Small, atomic commits.** One logical change per commit. A reviewer should be able to hold the entire diff in their head.

9.2. **Commit messages state intent:** short imperative summary ("Fix retry loop exhausting connection pool"), plus a body explaining *why* when non-obvious. Follow the repo's convention (e.g., Conventional Commits) if one exists.

9.3. **Never commit:** secrets, credentials, `.env` files, generated artifacts, personal IDE config, or debug prints. Use `.gitignore` and secret managers.

9.4. **Keep PRs/changesets small** (guideline: <400 lines of meaningful diff). Large changes get rubber-stamped, not reviewed. Split by logical unit.

9.5. **The main branch is always deployable.** Broken main blocks the whole team; fixing it is the top priority over any feature work.

---

## 10. Collaboration & Review

10.1. **Write code for review.** Anticipate reviewer questions and answer them preemptively — in naming, structure, comments, or PR description. A PR description states: what changed, why, how it was tested, and any risk.

10.2. **In review, critique code, never people.** Ask questions ("what happens if this list is empty?") instead of issuing verdicts. Distinguish blocking issues from preferences ("nit:").

10.3. **Automate style debates away.** Formatters and linters are non-negotiable and run in CI. Humans should never spend review time on whitespace or import order.

10.4. **Boy Scout Rule:** leave code slightly better than you found it — a renamed variable, a deleted dead branch — but keep such cleanups small and separable from the main change (see 1.4).

10.5. **When you disagree with an existing pattern, raise it — don't fork it.** Introducing a second competing convention silently is the fastest way to an unmaintainable codebase.

---

## 11. Production Readiness

11.1. **Configuration comes from the environment, never hardcoded.** All environment-specific values (URLs, credentials, feature flags) are injected. The same build artifact runs in every environment.

11.2. **Log for the 3 a.m. debugger.** Structured logs (key-value/JSON) with: what happened, relevant IDs (request, user, order), and outcome. Log at boundaries and failures — not every line. Never log secrets or PII.

11.3. **Every external call gets a timeout.** Network calls without timeouts are outages waiting for a slow dependency. Add retries with backoff *only* for idempotent operations.

11.4. **Design operations to be idempotent** where possible — retries, replays, and duplicate messages are facts of distributed life.

11.5. **Ship observability with the feature:** health checks, key metrics (rate, errors, duration), and alerts on user-facing symptoms. If you can't tell it's broken, it's broken.

11.6. **Migrations and rollouts must be reversible.** Prefer backward-compatible schema changes (expand → migrate → contract). Every deploy has a known rollback path.

11.7. **Dependencies are liabilities.** Before adding one, check: maintenance activity, license, size, and whether 30 lines of your own code would suffice. Pin versions; update deliberately and regularly, not never.

11.8. **Security is a default, not a feature:** validate all external input, parameterize all queries, least-privilege for every credential, encrypt data in transit, and never build your own crypto/auth primitives.

---

## 12. Continuous Judgment (Meta-Rules)

12.1. **All guidelines above are defaults, not laws.** Break them deliberately, locally, and with a comment explaining why — never silently or habitually.

12.2. **Perfect is the enemy of shipped; shipped garbage is the enemy of the team.** Aim for the pragmatic middle: correct, readable, tested where it matters, boring everywhere possible.

12.3. **When uncertain, choose the option that is easiest to change later.** Reversible decisions can be made fast; irreversible ones (public APIs, data schemas, event contracts) deserve slow, explicit deliberation.

---

*Grounded in community consensus: Clean Code (Martin), The Pragmatic Programmer (Hunt/Thomas), Code Complete (McConnell), A Philosophy of Software Design (Ousterhout), the Twelve-Factor App, Google Engineering Practices, and SRE principles.*
