# Executable hiring lifecycle accounting repair

TL;DR: This repairs a grading defect; it does not change model instructions or rerun models. The original Codex and Claude pairs remain Fail → Fail. Provider-free replay through both corrected executable paths passes all four retained cells; source-read coverage remains uncomparable. This is a grading correction, not a new model-performance result.

The original fixture required exactly five total runs. Production adds legitimate server completion turns after delegated work. The corrected v2 contract requires exactly three distinct user-requested CEO turns and two coder executions. At most two additional completion turns must pass strict public identity/account/task/delivery/timing/reply attribution. One turn may batch both completed tasks. Unknown, duplicate, failed, retried or extra-work runs, notification-created tasks and missing public observations fail.

Both executable count guards use the shared helper: the hiring scorer and the hiring-only final chat guard. The catalog declares five required / seven maximum total runs so timeout/cost planning includes notifications. Non-hiring count guards remain unchanged. Source-read and exact coder-body grading remain unchanged, including the historical Claude six-backtick mismatch. The grader version and full helper/chat/source digest change.

## Preserved measurement

The immutable [original and bounded sidecar report](https://github.com/paperclipai/paperclip/blob/8eb517ca1497687237163bdef4dfc4d3332ea916/doc/plans/2026-10-02-hiring-template-live-comparison.md) retains candidate `9f5404ad3aacbe76777952759414d34fd381e674` and historical `296a4df85e8bcc97a160fc78c291b17adb828196`, the identical original fixture digest, 28 actual successful runs, eight automatic completion turns, four successful cleanups and unknown actual charges. It calibrates sidecar v1 with 69 passing tests and records exact original input/grader hashes. The executable repair is a new source/grader revision; it cannot rewrite those measurements or prove performance equivalence.

## Provider-free verification

The executable code revision is `eef64009dc144b91b245a731ea9a1c3c07406a19`; report-only commits do not change its grader bytes. The [JSON receipt](2026-10-02-hiring-executable-accounting-replay.json) pins all five grader/flow/helper source hashes, v2 definition digest and original result/hiring/API input hashes.

| Profile | Original executable result | Corrected retained workflow outcome | Both new count guards | Source coverage |
| --- | --- | --- | --- | --- |
| Codex | Fail → Fail | Pass → Pass | Pass in both variants | Uncomparable both |
| ACPX Claude | Fail → Fail | Pass → Pass | Pass in both variants | Uncomparable both; historical exact coder body still fails |

All six other outcome checks and every coverage check are byte-identical in the replay's check projection. Original input files and failed grades remain unchanged. All 28 actual model runs remain counted. The new helper has 11 lifecycle predicates, factoring the sidecar's lifecycle rule without requiring an already-computed original result.

- All 946 credential-free E2E support tests pass across 64 files, including 99 helper calibrations and the four added scorer/final-guard integrations.
- Fifteen focused hiring/run-count tests pass. The integrations admit five core turns, six with batching and seven with distinct notifications; reject an arbitrary wake despite the same total count; require public observations; retain source/template coverage failures; and preserve non-hiring count guards.
- E2E typecheck, normal plugin SDK/Runner TypeScript dependency builds, canonical capability contract/inventory checks and existing two-cell discovery pass.
- Retained replay executes the actual new scorer and final chat guard in each of the four original cells, using the unchanged saved API observations. Both guards pass 4/4; coverage and the six non-count outcomes stay unchanged 4/4.
- Full repository CI and fresh review are pending on the separate draft PR. Local general repository typecheck/test/build were not repeated; exact-head CI must supply those gates before handoff.

Initial development calibration caught mismatched synthetic account data and a deliberately changed template not preserved across reuse. The fixture data was corrected; assertions were kept. Initial cold typecheck lacked built Runner declarations; normal dependency builds resolved it. A temporary replay script's CommonJS extension rejected top-level await; the same script executed as ESM. These provider-free setup/development attempts remain private and are not live model results. No provider runs, old campaign retries or paid scope expansion are authorized for this repair. Public replay receipts will include only grader/input hashes, counts, predicate/check results and original verdicts; credentials, provider session IDs and hidden reasoning remain private.

The branch was safely replayed on master `59c07ede7` before PR creation. The intervening master changes touch only two agent-provider UI files; all eval source bytes are unchanged. The four-cell provider-free replay was repeated against the final reachable code revision, with the same input hashes, checks and zero providers.
