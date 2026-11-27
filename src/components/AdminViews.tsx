import React, { useState, useEffect } from "react";
import { request } from "../services/apiClient";
import { useLearning } from "../context/LearningContext";
function useList(path: string) {
  const [items, set] = useState<any[]>([]),
    [error, err] = useState("");
  const refresh = async () => {
    try {
      const data = await request(path);
      set(Array.isArray(data) ? data : []);
      err("");
    } catch (e) {
      err((e as Error).message);
    }
  };
  useEffect(() => {
    refresh();
  }, [path]);
  return { items, error, refresh };
}
export function Insights() {
  const { items, error } = useList("/insights");
  return (
    <section>
      <div className="page-title">
        <span className="eyebrow">REVIEWED KNOWLEDGE</span>
        <h1>트렌드·인사이트</h1>
        <p>출처를 검토한 변화와 설계에 미치는 영향을 살펴보세요.</p>
      </div>
      {error && <p role="alert">{error}</p>}
      {!items.length && (
        <div className="empty-state">
          아직 게시된 인사이트가 없습니다. 검토가 끝난 지식이 이곳에 표시됩니다.
        </div>
      )}
      <div className="content-grid">
        {items.map((item) => (
          <article className="surface" key={item.id}>
            <span className="eyebrow">{item.publishedAt?.slice(0, 10)}</span>
            <h2>{item.title}</h2>
            <p>{item.summary}</p>
            {item.claims?.map((c: any, i: number) => (
              <p key={i}>{c.text}</p>
            ))}
            {item.sources?.map((s: any, i: number) => (
              <a key={i} href={s.url || s} target="_blank" rel="noreferrer">
                근거 {i + 1} ↗
              </a>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
export function Users() {
  const { items, error, refresh } = useList("/admin/users");
  const [message, setMessage] = useState("");
  const [resetUser, setResetUser] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [form, set] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "READER",
  });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await request("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      set({ ...form, password: "", username: "", displayName: "" });
      setMessage("계정을 생성했습니다. 첫 로그인 시 비밀번호를 변경합니다.");
      refresh();
    } catch (e) {
      setMessage((e as Error).message);
    }
  };
  const update = async (id: string, body: any) => {
    try {
      await request("/admin/users/" + id, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      refresh();
      setMessage("변경했습니다.");
    } catch (e) {
      setMessage((e as Error).message);
    }
  };
  return (
    <section>
      <div className="page-title">
        <span className="eyebrow">ADMINISTRATION</span>
        <h1>계정 관리</h1>
        <p>사내 열람 계정과 관리자 권한을 관리합니다.</p>
      </div>
      <p role="status">{message || error}</p>
      <form className="surface form-grid" onSubmit={submit}>
        <h2>계정 추가</h2>
        {[
          ["username", "아이디"],
          ["displayName", "표시 이름"],
          ["password", "초기 비밀번호"],
        ].map(([key, label]) => (
          <label key={key}>
            {label}
            <input
              required
              type={key === "password" ? "password" : "text"}
              value={form[key]}
              minLength={key === "password" ? 15 : undefined}
              autoComplete={key === "password" ? "new-password" : "off"}
              onChange={(e) => set({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label>
          권한
          <select
            value={form.role}
            onChange={(e) => set({ ...form, role: e.target.value })}
          >
            <option>READER</option>
            <option>ADMIN</option>
          </select>
        </label>
        <button className="primary-button">계정 만들기</button>
      </form>
      {resetUser && (
        <form
          className="surface form-grid"
          onSubmit={async (e) => {
            e.preventDefault();
            await update(resetUser, { password: resetPassword });
            setResetUser("");
            setResetPassword("");
          }}
        >
          <h2>초기 비밀번호 재설정</h2>
          <label>
            새 초기 비밀번호
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={15}
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />
          </label>
          <div className="toolbar">
            <button className="primary-button">재설정</button>
            <button
              type="button"
              onClick={() => {
                setResetUser("");
                setResetPassword("");
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>이름 / 아이디</th>
              <th>권한</th>
              <th>사용 상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.displayName}
                  <small>{u.username}</small>
                </td>
                <td>
                  <select
                    aria-label={u.username + " 권한"}
                    value={u.role}
                    onChange={(e) => update(u.id, { role: e.target.value })}
                  >
                    <option>READER</option>
                    <option>ADMIN</option>
                  </select>
                </td>
                <td>{u.enabled ? "사용 중" : "중지"}</td>
                <td>
                  <button onClick={() => update(u.id, { enabled: !u.enabled })}>
                    {u.enabled ? "사용 중지" : "활성화"}
                  </button>
                  <button
                    onClick={() => {
                      setResetUser(u.id);
                      setResetPassword("");
                    }}
                  >
                    비밀번호 초기화
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export function Studio() {
  const { refresh } = useLearning();
  const [kind, setKind] = useState("topics"),
    [text, setText] = useState('{\n  "title": "",\n  "summary": ""\n}'),
    [message, msg] = useState(""),
    [preview, setPreview] = useState(false);
  const [list, setList] = useState<any[]>([]);
  const [selected, select] = useState("");
  useEffect(() => {
    request("/" + kind)
      .then(setList)
      .catch(() => setList([]));
  }, [kind]);
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {}
  const save = async () => {
    if (!parsed) {
      msg("JSON 형식을 확인해 주세요.");
      return;
    }
    try {
      await request("/" + kind + (selected ? "/" + selected : ""), {
        method: selected ? "PUT" : "POST",
        body: JSON.stringify(parsed),
      });
      msg("서버에 저장했습니다.");
      refresh();
      setList(await request("/" + kind));
    } catch (e) {
      msg((e as Error).message);
    }
  };
  return (
    <section>
      <div className="page-title">
        <span className="eyebrow">CONTENT STUDIO</span>
        <h1>콘텐츠 스튜디오</h1>
        <p>구조화된 콘텐츠를 편집하고 검토한 뒤 저장하세요.</p>
      </div>
      <div className="toolbar">
        <label>
          콘텐츠 유형
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              select("");
            }}
          >
            {[
              ["topics", "아키텍처"],
              ["comparisons", "비교"],
              ["glossary", "용어"],
              ["checklists", "체크리스트"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          편집 대상
          <select
            value={selected}
            onChange={(e) => {
              select(e.target.value);
              const item = list.find((i) => i.id === e.target.value);
              if (item) setText(JSON.stringify(item, null, 2));
            }}
          >
            <option value="">새 콘텐츠</option>
            {list.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title || i.term}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="studio-grid">
        <label className="surface">
          JSON 편집
          <textarea
            className="code-editor"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
        </label>
        <article className="surface">
          <h2>미리보기</h2>
          {parsed ? (
            <>
              <h3>{parsed.title || parsed.term || "제목 없음"}</h3>
              <p>{parsed.summary || parsed.shortDef}</p>
              <p className="preserve-lines">
                {parsed.overview || parsed.fullDef || parsed.description}
              </p>
              <details>
                <summary>전체 구조 보기</summary>
                <pre>{JSON.stringify(parsed, null, 2)}</pre>
              </details>
            </>
          ) : (
            <p>유효한 JSON을 입력해 주세요.</p>
          )}
        </article>
      </div>
      <div className="toolbar">
        <button className="primary-button" onClick={save}>
          검증하고 서버 저장
        </button>
        <button
          onClick={() => {
            const url = URL.createObjectURL(
              new Blob([text], { type: "application/json" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = kind + ".json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          JSON 내보내기
        </button>
        {selected && (
          <button
            onClick={async () => {
              if (confirm("이 콘텐츠를 보관 처리할까요?")) {
                try {
                  await request("/" + kind + "/" + selected, {
                    method: "DELETE",
                  });
                  msg("보관했습니다.");
                  refresh();
                } catch (e) {
                  msg((e as Error).message);
                }
              }
            }}
          >
            보관
          </button>
        )}
      </div>
      <p role="status">{message}</p>
    </section>
  );
}
export function Research() {
  const policies = useList("/research/policies"),
    runs = useList("/research/runs"),
    candidates = useList("/research/candidates");
  const [policy, setPolicy] = useState(""),
    [message, msg] = useState(""),
    [busy, setBusy] = useState(false),
    [config, setConfig] = useState("");
  const [reviewReason, setReviewReason] = useState("");
  const [publishConfirmed, setPublishConfirmed] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => {
      runs.refresh();
      candidates.refresh();
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const act = async (path: string, body: any) => {
    setBusy(true);
    try {
      await request(path, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
        body: JSON.stringify(body),
      });
      msg("처리했습니다.");
      await runs.refresh();
      await candidates.refresh();
    } catch (e) {
      msg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section>
      <div className="page-title">
        <span className="eyebrow">RESEARCH OPERATIONS</span>
        <h1>리서치 에이전트</h1>
        <p>
          Azure OpenAI로 수집 자료를 지식 후보로 만듭니다. 게시 전 관리자의 근거
          검토가 필요합니다.
        </p>
      </div>
      <p role="status">
        {message || policies.error || runs.error || candidates.error}
      </p>
      <div className="surface toolbar">
        <label>
          수집 정책
          <select value={policy} onChange={(e) => setPolicy(e.target.value)}>
            <option value="">정책 선택</option>
            {policies.items.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.domainId}
              </option>
            ))}
          </select>
        </label>
        <button
          className="primary-button"
          disabled={busy || !policy}
          onClick={() => act("/research/runs", { policyId: policy })}
        >
          수동 실행
        </button>
        <span className="muted">
          자동 게시 없음 · 서버 설정의 예산과 출처 규칙 적용
        </span>
      </div>
      <details className="surface">
        <summary>분야·출처·규칙 편집</summary>
        <label>
          정책 JSON
          <textarea
            rows={8}
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            placeholder={
              '{"name":"인증 보안","domainId":"identity-security","sources":[{"host":"www.keycloak.org","publisher_group":"keycloak","reuse_allowed":true,"feed_url":"https://www.keycloak.org/rss.xml"}],"lookbackDays":14,"maxDocuments":5,"maxInputCharacters":10000}'
            }
          />
        </label>
        <button
          disabled={busy}
          onClick={() => {
            try {
              const value = JSON.parse(config);
              act("/research/policies", value).then(policies.refresh);
            } catch {
              msg("정책 JSON을 확인해 주세요.");
            }
          }}
        >
          정책 저장
        </button>
      </details>
      <h2>실행 이력</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>실행</th>
              <th>상태</th>
              <th>시작 시각</th>
              <th>결과</th>
            </tr>
          </thead>
          <tbody>
            {runs.items.map((r) => (
              <tr key={r.id}>
                <td>{r.id.slice(0, 8)}</td>
                <td>{r.status}</td>
                <td>{r.createdAt}</td>
                <td>{r.error || r.result?.status || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>지식 검토함</h2>
      <label>
        검토 사유
        <input
          value={reviewReason}
          onChange={(e) => setReviewReason(e.target.value)}
          placeholder="근거 확인 결과와 판단을 남기세요"
        />
      </label>
      <label className="setting-toggle">
        <span>출처와 주장을 검토했으며 게시를 승인합니다.</span>
        <input
          type="checkbox"
          checked={publishConfirmed}
          onChange={(e) => setPublishConfirmed(e.target.checked)}
        />
      </label>
      {!candidates.items.length && (
        <div className="empty-state">
          실행 후 생성된 후보가 이곳에 표시됩니다.
        </div>
      )}
      {candidates.items.map((c) => (
        <article className="surface" key={c.id}>
          <span className="eyebrow">
            {c.status} · v{c.candidateVersion}
          </span>
          <h3>{c.title}</h3>
          <p>{c.summary}</p>
          {c.claims?.map((cl: any, i: number) => (
            <div className="evidence" key={i}>
              <strong>{cl.text}</strong>
              {cl.evidence?.map((e: any, j: number) => (
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
          {["awaiting_review", "needs_review", "pending"].includes(
            c.status,
          ) && (
            <div className="toolbar">
              <button
                className="primary-button"
                disabled={
                  busy ||
                  c.issues?.length > 0 ||
                  !publishConfirmed ||
                  !reviewReason.trim()
                }
                onClick={() => {
                  if (publishConfirmed)
                    act("/research/candidates/" + c.id + "/publish", {
                      candidateVersion: c.candidateVersion,
                      baseLockVersion: c.baseLockVersion,
                      reason: reviewReason,
                    });
                }}
              >
                승인하고 게시
              </button>
              <button
                disabled={busy}
                onClick={() =>
                  act("/research/candidates/" + c.id + "/review", {
                    action: "reject",
                    reason: reviewReason || "관리자 검토 후 반려",
                  })
                }
              >
                반려
              </button>
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
