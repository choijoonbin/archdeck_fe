import React, { useEffect, useState } from "react";
import { ApiError, request } from "../services/apiClient";
import type { Topic } from "../types";

type Diff = {
  candidateVersion: number;
  targetContentId: string;
  baseLockVersion: number;
  currentLockVersion: number;
  conflict: boolean;
  before: unknown;
  after: unknown;
  changes: { path: string; before: unknown; after: unknown }[];
};
const format = (value: unknown) =>
  value === undefined
    ? "(없음)"
    : typeof value === "string"
      ? value
      : JSON.stringify(value, null, 2);
export function CandidateReview({
  candidate: c,
  topics,
  refresh,
}: {
  candidate: any;
  topics: Topic[];
  refresh: () => Promise<void>;
}) {
  const [reason, setReason] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false),
    [target, setTarget] = useState(""),
    [patch, setPatch] = useState("");
  const [diff, setDiff] = useState<Diff | null>(null),
    [diffError, setDiffError] = useState("");
  const revision = c.proposalKind === "topic_revision";
  const pending = ["awaiting_review", "needs_review", "pending"].includes(
    c.status,
  );
  const loadDiff = async () => {
    setConfirmed(false);
    setDiff(null);
    setDiffError("");
    try {
      setDiff(await request<Diff>(`/research/candidates/${c.id}/diff`));
    } catch (e) {
      setDiffError((e as Error).message);
    }
  };
  useEffect(() => {
    setConfirmed(false);
    if (revision) loadDiff();
  }, [c.id, c.candidateVersion, revision]);
  const mutate = async (action: string, body: unknown) => {
    setBusy(true);
    setMessage("");
    try {
      await request(`/research/candidates/${c.id}/${action}`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      setConfirmed(false);
      setEditing(false);
      setMessage(action === "publish" ? "게시했습니다." : "처리했습니다.");
      await refresh();
    } catch (e) {
      setConfirmed(false);
      if (e instanceof ApiError && e.status === 409) {
        setMessage(
          "다른 변경이 발견되었습니다. 최신 버전과 변경 내용을 다시 검토해 주세요.",
        );
        if (revision) await loadDiff();
        await refresh();
      } else setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const choose = (id: string) => {
    setTarget(id);
    const topic = topics.find((t) => t.id === id);
    setPatch(
      topic
        ? JSON.stringify(
            {
              title: topic.title,
              summary: topic.summary,
              overview: topic.overview,
              keyTakeaways: topic.keyTakeaways,
            },
            null,
            2,
          )
        : "",
    );
  };
  const targetTopic = topics.find((t) => t.id === target);
  return (
    <article
      className="surface"
      data-candidate-id={c.id}
      aria-label={`후보: ${c.title}`}
    >
      <span className="eyebrow">
        {c.status} · v{c.candidateVersion} ·{" "}
        {revision ? "기존 토픽 개정" : "새 인사이트"}
      </span>
      <h3>{c.title}</h3>
      <p>{c.summary}</p>
      {c.claims?.map((claim: any, i: number) => (
        <div className="evidence" key={i}>
          <strong>{claim.text}</strong>
          {claim.evidence?.map((e: any, j: number) => (
            <blockquote key={j}>
              {e.quote}
              <small>출처 ID: {e.source_id || e.sourceId}</small>
            </blockquote>
          ))}
        </div>
      ))}
      <details>
        <summary>수집 근거와 검증 결과</summary>
        <pre>
          {JSON.stringify(
            { documents: c.documents, issues: c.issues },
            null,
            2,
          )}
        </pre>
      </details>
      {revision && (
        <section className="revision-review" aria-label="토픽 개정 비교">
          <h4>필드별 변경 비교</h4>
          {diff && (
            <>
              <p>
                대상:{" "}
                {topics.find((t) => t.id === diff.targetContentId)?.title ||
                  diff.targetContentId}{" "}
                · 기준 v{diff.baseLockVersion} / 현재 v
                {diff.currentLockVersion ?? "—"}
              </p>
              {diff.conflict && pending && (
                <p className="review-conflict" role="alert">
                  기준 버전과 현재 토픽이 다릅니다. 최신 토픽으로 개정 제안을
                  다시 작성한 뒤 검토해야 합니다.
                </p>
              )}
              {diff.changes.length === 0 && <p>변경된 필드가 없습니다.</p>}
              {diff.changes.map((change) => (
                <div className="revision-diff" key={change.path}>
                  <h4>{change.path}</h4>
                  <div>
                    <strong>기존</strong>
                    <pre>{format(change.before)}</pre>
                  </div>
                  <div>
                    <strong>개정 제안</strong>
                    <pre>{format(change.after)}</pre>
                  </div>
                </div>
              ))}
            </>
          )}
          {!diff && !diffError && (
            <p role="status">변경 내용을 불러오는 중입니다.</p>
          )}
          {diffError && <p role="alert">{diffError}</p>}
          <button disabled={busy} onClick={loadDiff}>
            최신 변경 비교 다시 조회
          </button>
        </section>
      )}
      {pending && (
        <>
          <button
            disabled={busy}
            onClick={() => {
              setEditing(!editing);
              setConfirmed(false);
            }}
          >
            {revision ? "개정 제안 다시 작성" : "기존 토픽 개정 제안"}
          </button>
          {editing && (
            <form
              className="revision-review form-grid"
              onSubmit={(e) => {
                e.preventDefault();
                try {
                  const revisionPatch = JSON.parse(patch);
                  if (!targetTopic || targetTopic.lockVersion === undefined)
                    throw new Error(
                      "대상 토픽의 버전을 불러올 수 없습니다. 콘텐츠를 새로고침해 주세요.",
                    );
                  mutate("revision", {
                    candidateVersion: c.candidateVersion,
                    targetContentId: target,
                    baseLockVersion: targetTopic.lockVersion,
                    revisionPatch,
                  });
                } catch (error) {
                  setMessage((error as Error).message);
                }
              }}
            >
              <label>
                개정 대상 토픽
                <select
                  aria-label="개정 대상 토픽"
                  required
                  value={target}
                  onChange={(e) => choose(e.target.value)}
                >
                  <option value="">토픽 선택</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title} · v{topic.lockVersion ?? "?"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                개정 필드 JSON (title, summary, overview, keyTakeaways)
                <textarea
                  required
                  spellCheck={false}
                  value={patch}
                  onChange={(e) => setPatch(e.target.value)}
                />
              </label>
              <p className="muted">
                선택한 토픽의 최신 버전을 기준으로 제안합니다. 저장 후 필드
                비교와 근거를 다시 검토해 주세요.
              </p>
              <button className="primary-button" disabled={busy || !target}>
                개정 제안 저장
              </button>
            </form>
          )}
          <label>
            검토 사유
            <input
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setConfirmed(false);
              }}
              placeholder="근거 확인 결과와 판단을 남기세요"
            />
          </label>
          <label className="setting-toggle">
            <span>출처와 주장을 검토했으며 게시를 승인합니다.</span>
            <input
              type="checkbox"
              checked={confirmed}
              disabled={
                revision &&
                (!diff ||
                  diff.conflict ||
                  diff.candidateVersion !== c.candidateVersion)
              }
              onChange={(e) => setConfirmed(e.target.checked)}
            />
          </label>
          <div className="toolbar">
            <button
              className="primary-button"
              disabled={
                busy ||
                c.issues?.length > 0 ||
                !confirmed ||
                !reason.trim() ||
                (revision &&
                  (!diff ||
                    diff.conflict ||
                    !diff.changes.length ||
                    diff.candidateVersion !== c.candidateVersion))
              }
              onClick={() =>
                mutate("publish", {
                  candidateVersion: c.candidateVersion,
                  baseLockVersion: revision
                    ? diff?.baseLockVersion
                    : c.baseLockVersion,
                  reason,
                })
              }
            >
              승인하고 게시
            </button>
            <button
              disabled={busy}
              onClick={() =>
                mutate("review", {
                  action: "reject",
                  candidateVersion: c.candidateVersion,
                  reason: reason || "관리자 검토 후 반려",
                })
              }
            >
              반려
            </button>
          </div>
        </>
      )}
      {message && <p role="status">{message}</p>}
    </article>
  );
}
