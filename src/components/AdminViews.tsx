import React, { useState, useEffect } from "react";
import { ArchitectureDiagram, validateDiagram } from "./ArchitectureDiagram";
import { CandidateReview } from "./CandidateReview";
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
  const graphErrors =
    kind === "topics" && parsed ? validateDiagram(parsed) : [];
  const save = async () => {
    if (!parsed || graphErrors.length) {
      msg(
        graphErrors.length
          ? graphErrors.join(" ")
          : "JSON 형식을 확인해 주세요.",
      );
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
            aria-label="JSON 편집"
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
              {kind === "topics" &&
                (graphErrors.length ? (
                  <div role="alert">
                    {graphErrors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                ) : (
                  <ArchitectureDiagram
                    nodes={parsed.diagramNodes}
                    edges={parsed.diagramEdges || []}
                    activeStep={
                      parsed.flowSteps[0] || {
                        activeNodes: [],
                        activeEdgeIds: [],
                      }
                    }
                  />
                ))}
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
  const { topics, refresh: refreshContent } = useLearning();
  const policies = useList("/research/policies"),
    runs = useList("/research/runs"),
    candidates = useList("/research/candidates");
  const [policyTarget, setPolicyTarget] = useState("");
  const [policyEditorOpen, setPolicyEditorOpen] = useState(false);
  const [policy, setPolicy] = useState(""),
    [message, msg] = useState(""),
    [busy, setBusy] = useState(false),
    [config, setConfig] = useState("");
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
        <button
          disabled={busy || !policy}
          onClick={() => {
            const selected = policies.items.find((item) => item.id === policy);
            if (selected) {
              const { version, ...value } = selected;
              setConfig(JSON.stringify(value, null, 2));
              setPolicyTarget(selected.targetContentId || "");
              setPolicyEditorOpen(true);
            }
          }}
        >
          선택한 정책 편집
        </button>
        <span className="muted">
          자동 게시 없음 · 서버 설정의 예산과 출처 규칙 적용
        </span>
      </div>
      {policy && (
        <p className="muted">
          {policies.items.find((p) => p.id === policy)?.targetContentId
            ? `기존 토픽 개정 · 대상 ${policies.items.find((p) => p.id === policy)?.targetContentId} · 기준 v${policies.items.find((p) => p.id === policy)?.targetBaseLockVersion}`
            : "새 인사이트 수집 정책"}
        </p>
      )}
      <details
        className="surface"
        open={policyEditorOpen}
        onToggle={(e) => setPolicyEditorOpen(e.currentTarget.open)}
      >
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
        <label>
          수집 결과의 대상
          <select
            aria-label="수집 결과의 대상"
            value={policyTarget}
            onChange={(e) => setPolicyTarget(e.target.value)}
          >
            <option value="">신규 인사이트</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title} 개정 · v{topic.lockVersion ?? "?"}
              </option>
            ))}
          </select>
        </label>
        {policyTarget && (
          <p>
            기존 토픽 개정 수집 · targetContentId: {policyTarget} · 기준 버전:{" "}
            {topics.find((topic) => topic.id === policyTarget)?.lockVersion ??
              "확인 필요"}
            . 실행 시 서버가 토픽 원본을 고정하며 게시 전에 차이를 검토합니다.
          </p>
        )}
        <button
          disabled={busy}
          onClick={() => {
            try {
              const value = JSON.parse(config);
              delete value.targetContentId;
              delete value.targetBaseLockVersion;
              if (policyTarget) {
                const topic = topics.find((item) => item.id === policyTarget);
                if (topic?.lockVersion === undefined)
                  throw new Error("대상 버전 없음");
                value.targetContentId = policyTarget;
                value.targetBaseLockVersion = topic.lockVersion;
              }
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
      {!candidates.items.length && (
        <div className="empty-state">
          실행 후 생성된 후보가 이곳에 표시됩니다.
        </div>
      )}
      {candidates.items.map((c) => (
        <CandidateReview
          key={c.id}
          candidate={c}
          topics={topics}
          refresh={async () => {
            await candidates.refresh();
            await refreshContent();
          }}
        />
      ))}
    </section>
  );
}
