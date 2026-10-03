import assert from "node:assert/strict";
import { it } from "vitest";
import { gradeHiringTemplateTurns, HIRING_TEMPLATE_TURN_ACCOUNTING_VERSION,
  type HiringTemplateTurnPredicateId } from "./hiring-template-turn-accounting.js";
import { createHiringTemplateTurnFixture as fixture, hiringTurnFixtureTimestamp as timestamp } from "./hiring-template-turn-fixture.js";

type Fixture = ReturnType<typeof fixture>;
type FixtureContext = Fixture["evidence"]["runs"][number]["contextSnapshot"];
const e = (f: Fixture) => f.evidence;
const notification = (f: Fixture) => e(f).runs.find(r => r.id === "notify-1")!;
const worker = (f: Fixture) => e(f).runs.find(r => r.id === "worker-first")!;
const request = (f: Fixture) => e(f).runs.find(r => r.id === "lead-first")!;
const sync = (f: Fixture) => { f.apiState.runs = structuredClone(e(f).runs); return f; };
const fails = (f: { evidence: unknown; apiState: unknown }, predicate?: HiringTemplateTurnPredicateId) => {
  const result = gradeHiringTemplateTurns(f);
  assert.equal(result.passed, false);
  assert.equal(result.predicates.length, 11);
  if (predicate) assert.equal(result.predicates.find(p => p.id === predicate)?.passed, false, predicate);
};

// Public positive and negative lifecycle cases ported from the published v1
// retained-evidence sidecar. Its original-grade/provenance wrapper stays separate.
for (const [count, label] of [[0, "five exact work turns"], [1, "six runs with one batched completion"], [2, "seven runs with distinct completions"]] as const) {
  it(`accepts ${label} while counting every run toward costs`, () => {
    const result = gradeHiringTemplateTurns(fixture(count));
    assert.equal(result.passed, true);
    assert.equal(result.version, HIRING_TEMPLATE_TURN_ACCOUNTING_VERSION);
    assert.equal(result.predicates.length, 11);
    assert.ok(result.predicates.every(predicate => predicate.passed));
    assert.deepEqual(result.counts, { requiredWorkTurns: 5, maximumCompletionTurns: 2, maximumTotalTurns: 7,
      requestedLeadTurns: 3, coderTurns: 2, completionTurns: count, unclassifiedTurns: 0,
      snapshotRunCount: 5 + count, actualRunCount: 5 + count, costAccountingRunCount: 5 + count });
    assert.deepEqual(Object.keys(result).sort(), ["counts", "passed", "predicates", "version"]);
  });
}

const negatives: Array<[string, (f: Fixture) => void, HiringTemplateTurnPredicateId]> = [
  ["an eighth run", f => { e(f).runs.push({ ...structuredClone(notification(f)), id: "extra" }); }, "exact-five-required-work-turns"],
  ["a duplicate run ID", f => { e(f).runs.push(structuredClone(notification(f))); }, "complete-public-run-ledger"],
  ["an arbitrary chat wake", f => { notification(f).contextSnapshot.wakeReason = "heartbeat_timer"; }, "exact-five-required-work-turns"],
  ["a completion label on a coder run", f => { notification(f).agentId = "coder"; }, "exact-five-required-work-turns"],
  ["an extra requested lead turn", f => { e(f).runs.push({ ...structuredClone(request(f)), id: "lead-extra" }); }, "exact-five-required-work-turns"],
  ["an extra coder execution", f => { e(f).runs.push({ ...structuredClone(worker(f)), id: "worker-extra" }); }, "exact-five-required-work-turns"],
  ["a missing requested lead turn", f => { e(f).runs = e(f).runs.filter(r => r.id !== "lead-status"); }, "exact-five-required-work-turns"],
  ["a missing coder execution", f => { e(f).runs = e(f).runs.filter(r => r.id !== "worker-first"); }, "exact-five-required-work-turns"],
  ["a missing production lead identity", f => { e(f).agents[0].id = "other"; }, "known-fixture-context"],
  ["a failed notification", f => { notification(f).status = "failed"; }, "successful-native-without-retries"],
  ["a legacy notification runtime", f => { notification(f).runtimeMode = "legacy"; }, "successful-native-without-retries"],
  ["a retried notification", f => { notification(f).retryOfRunId = "prior"; }, "successful-native-without-retries"],
  ["hidden process retries", f => { notification(f).processLossRetryCount = 1; }, "successful-native-without-retries"],
  ["a scheduled retry", f => { notification(f).scheduledRetryAttempt = 1; }, "successful-native-without-retries"],
  ["a continuation run", f => { notification(f).continuationAttempt = 1; }, "successful-native-without-retries"],
  ["a run in another company", f => { notification(f).companyId = "other"; }, "resolved-company-account-and-identity"],
  ["a wrong managed account", f => { notification(f).contextSnapshot.aiConnection.connectionId = "other"; }, "resolved-company-account-and-identity"],
  ["a wrong provider", f => { worker(f).contextSnapshot.aiConnection.provider = "other"; }, "resolved-company-account-and-identity"],
  ["a wrong auth method", f => { worker(f).contextSnapshot.aiConnection.method = "host"; }, "resolved-company-account-and-identity"],
  ["a wrong responsible-user binding", f => { notification(f).contextSnapshot.aiConnection.responsibleUserId = "other"; }, "resolved-company-account-and-identity"],
  ["a wrong run responsible user", f => { request(f).responsibleUserId = "other"; }, "resolved-company-account-and-identity"],
  ["an accepted foreign identity", f => { notification(f).identityHistory[0].responsibleUserId = "other"; }, "resolved-company-account-and-identity"],
  ["an identity receipt for another run", f => { notification(f).identityHistory[0].runId = "other"; }, "resolved-company-account-and-identity"],
  ["a missing instruction receipt", f => { request(f).identityHistory.pop(); }, "three-distinct-requested-chat-turns"],
  ["a rejected instruction receipt", f => { request(f).identityHistory[1].status = "rejected"; }, "three-distinct-requested-chat-turns"],
  ["a wrong instruction comment", f => { request(f).identityHistory[1].messageId = "other"; }, "three-distinct-requested-chat-turns"],
  ["a forged request author", f => { f.apiState.comments[0].authorUserId = "other"; }, "three-distinct-requested-chat-turns"],
  ["an additional user request", f => { f.apiState.comments.push({ ...f.apiState.comments[0], id: "request-extra" }); }, "three-distinct-requested-chat-turns"],
  ["two runs for one request comment", f => { e(f).runs.find(r => r.id === "lead-reuse")!.contextSnapshot.wakeCommentId = "request-1"; }, "three-distinct-requested-chat-turns"],
  ["a different requested chat generation", f => { request(f).contextSnapshot.conversationSessionGeneration = 1; }, "three-distinct-requested-chat-turns"],
  ["a worker assigned to another agent", f => { e(f).tasks[0].assigneeAgentId = "other"; }, "one-coder-execution-per-known-task"],
  ["a task outside the selected project", f => { e(f).tasks[0].projectId = "other"; }, "one-coder-execution-per-known-task"],
  ["a notification-created task", f => { e(f).tasks[0].originRunId = notification(f).id; }, "no-notification-created-extra-tasks"],
  ["a task created by the status-only turn", f => { e(f).tasks[0].originRunId = "lead-status"; }, "task-origins-are-first-two-requested-turns"],
  ["an extra task without an execution", f => { e(f).tasks.push({ ...e(f).tasks[0], id: "extra-task" }); }, "no-notification-created-extra-tasks"],
  ["a wake without delivery IDs", f => { delete notification(f).contextSnapshot.chatCompletionDeliveryIds; }, "bounded-server-completion-receipts"],
  ["a wake without task updates", f => { delete notification(f).contextSnapshot.chatCompletionUpdates; }, "bounded-server-completion-receipts"],
  ["mismatched receipt cardinality", f => { notification(f).contextSnapshot.chatCompletionDeliveryIds!.push("extra-delivery"); }, "bounded-server-completion-receipts"],
  ["a duplicate delivery across runs", f => { e(f).runs.find(r => r.id === "notify-2")!.contextSnapshot.chatCompletionDeliveryIds = notification(f).contextSnapshot.chatCompletionDeliveryIds; }, "bounded-server-completion-receipts"],
  ["a duplicate task notification with a fresh delivery ID", f => { e(f).runs.find(r => r.id === "notify-2")!.contextSnapshot.chatCompletionUpdates = structuredClone(notification(f).contextSnapshot.chatCompletionUpdates); }, "bounded-server-completion-receipts"],
  ["an unknown notified task", f => { notification(f).contextSnapshot.chatCompletionUpdates![0].id = "unknown"; }, "bounded-server-completion-receipts"],
  ["a pre-completion wake", f => { notification(f).startedAt = timestamp(10); }, "bounded-server-completion-receipts"],
  ["a false completedAt receipt", f => { notification(f).contextSnapshot.chatCompletionUpdates![0].completedAt = timestamp(10); }, "bounded-server-completion-receipts"],
  ["a false task identifier", f => { notification(f).contextSnapshot.chatCompletionUpdates![0].identifier = "OTHER-1"; }, "bounded-server-completion-receipts"],
  ["a wrong task link", f => { notification(f).contextSnapshot.chatCompletionUpdates![0].url = "/issues/OTHER-1"; }, "bounded-server-completion-receipts"],
  ["a false task status", f => { notification(f).contextSnapshot.chatCompletionUpdates![0].status = "in_progress"; }, "bounded-server-completion-receipts"],
  ["a task without a saved result", f => { notification(f).contextSnapshot.chatCompletionUpdates![0].hasSavedDocuments = false; }, "bounded-server-completion-receipts"],
  ["a stale completion generation", f => { notification(f).contextSnapshot.conversationSessionGeneration = 1; }, "bounded-server-completion-receipts"],
  ["a manually invoked completion label", f => { notification(f).invocationSource = "on_demand"; }, "bounded-server-completion-receipts"],
  ["a mixed request/completion wake", f => { notification(f).contextSnapshot.wakeCommentId = "request-1"; }, "bounded-server-completion-receipts"],
  ["a missing completion dispatch identity", f => { notification(f).identityHistory = []; }, "bounded-server-completion-receipts"],
  ["a missing completion reply", f => { f.apiState.comments = f.apiState.comments.filter(c => c.id !== "reply-1"); }, "completion-runs-have-attributed-chat-replies"],
  ["a reply attributed to a different run", f => { f.apiState.comments.find(c => c.id === "reply-1")!.createdByRunId = "lead-first"; }, "completion-runs-have-attributed-chat-replies"],
  ["a reply by another agent", f => { f.apiState.comments.find(c => c.id === "reply-1")!.authorAgentId = "coder"; }, "completion-runs-have-attributed-chat-replies"],
  ["a reply in another chat", f => { f.apiState.comments.find(c => c.id === "reply-1")!.issueId = "other"; }, "completion-runs-have-attributed-chat-replies"],
  ["a reply before task completion", f => { f.apiState.comments.find(c => c.id === "reply-1")!.createdAt = timestamp(10); }, "completion-runs-have-attributed-chat-replies"],
];
for (const [label, mutate, predicate] of negatives) it(`rejects ${label}`, () => {
  const f = fixture(); mutate(f); fails(sync(f), predicate);
});
it("rejects extra runs present only in the final public ledger and counts their cost", () => {
  const f = fixture(); f.apiState.runs.push({ ...structuredClone(notification(f)), id: "extra" });
  fails(f, "complete-public-run-ledger");
  assert.equal(gradeHiringTemplateTurns(f).counts.costAccountingRunCount, 8);
});
it("rejects an account discrepancy between retained ledgers", () => {
  const f = fixture(); f.apiState.runs[0]!.contextSnapshot.aiConnection.method = "host";
  fails(f, "complete-public-run-ledger");
});
it("does not require a prior grade, artifact outcome, source coverage or report provenance", () => {
  const f = fixture();
  assert.equal(gradeHiringTemplateTurns({ ...f, result: { outcomePassed: false, comparisonStatus: "uncomparable" } } as typeof f).passed, true);
  assert.deepEqual(Object.keys(f).sort(), ["apiState", "evidence"]);
});
it("does not modify observations or expose opaque run content", () => {
  const f = fixture(); notification(f).nativeSessionId = "PRIVATE_SESSION";
  notification(f).hiddenReasoning = "PRIVATE_REASONING"; notification(f).credential = "PRIVATE_CREDENTIAL";
  const before = JSON.stringify(f), result = gradeHiringTemplateTurns(f);
  assert.equal(JSON.stringify(f), before);
  assert.equal(result.version, HIRING_TEMPLATE_TURN_ACCOUNTING_VERSION);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_|"company"|"board"|"account"|"notify-1"|"lead-first"/);
});

const missingObservations = [
  "evidence.agents", "evidence.tasks", "evidence.runs", "evidence.first", "evidence.second", "evidence.binding", "evidence.connectionId",
  "apiState.issue", "apiState.runs", "apiState.comments", "apiState.issue.companyId", "apiState.issue.conversationUserId",
  "apiState.issue.conversationAgentId", "apiState.issue.conversationSessionGeneration",
  "evidence.runs.0.identityHistory", "evidence.runs.0.contextSnapshot.aiConnection", "evidence.runs.0.startedAt", "evidence.runs.0.finishedAt",
  "evidence.tasks.0.completedAt", "evidence.tasks.0.originRunId", "apiState.comments.0.createdAt", "apiState.comments.3.createdByRunId",
];
for (const path of missingObservations) it(`fails closed without ${path}`, () => {
  const f = fixture(), keys = path.split(".");
  let target = f as unknown as Record<string, unknown>;
  for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>;
  delete target[keys.at(-1)!];
  fails(f);
});
for (const [label, value] of [["null", null], ["undefined", undefined], ["string", "bad"], ["number", 42], ["boolean", true], ["array", []]] as const) {
  it(`rejects ${label} evidence without throwing`, () => fails({ evidence: value, apiState: fixture().apiState }));
  it(`rejects ${label} API state without throwing`, () => fails({ evidence: fixture().evidence, apiState: value }));
}
it("fails closed on unstringifiable accounting fields", () => {
  for (const value of [1n, Object.assign({}, { nested: {} })]) {
    const f = fixture();
    if (typeof value === "object") value.nested = value;
    notification(f).contextSnapshot = { ...notification(f).contextSnapshot, chatCompletionUpdates: value } as unknown as FixtureContext;
    fails(sync(f), "complete-public-run-ledger");
  }
});
it("retains the observed public cost count when evidence getters throw", () => {
  const f = fixture();
  const evidence = new Proxy(f.evidence, { get() { throw new Error("Malformed observation"); } });
  const result = gradeHiringTemplateTurns({ evidence, apiState: f.apiState });
  assert.equal(result.passed, false);
  assert.equal(result.counts.costAccountingRunCount, 7);
});
