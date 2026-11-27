import { test, expect } from "@playwright/test";
const topic = {
  id: "topic-1",
  slug: "topic-1",
  lockVersion: 3,
  title: "Authentication flow",
  koreanTitle: "인증 흐름",
  category: "IAM & Auth",
  summary: "기존 인증 설명",
  overview: "기존 개요",
  badges: ["OIDC"],
  readingTimeMinutes: 5,
  diagramNodes: [
    {
      id: "browser",
      label: "Browser",
      subLabel: "SPA",
      type: "client",
      icon: "Laptop",
      trustZone: "Browser",
    },
    {
      id: "iam",
      label: "IAM",
      subLabel: "Authorization server",
      type: "auth",
      icon: "Shield",
      trustZone: "Server",
    },
  ],
  diagramEdges: [
    {
      id: "req",
      source: "browser",
      target: "iam",
      label: "Authorization",
      protocol: "HTTPS",
      type: "request",
      trustBoundary: "Public Internet",
    },
    {
      id: "res",
      source: "iam",
      target: "browser",
      label: "Code response",
      type: "response",
    },
    {
      id: "denied",
      source: "iam",
      target: "browser",
      label: "PKCE mismatch",
      type: "error",
    },
  ],
  flowSteps: [
    {
      step: 1,
      title: "요청",
      actor: "Browser",
      target: "IAM",
      protocol: "HTTPS",
      action: "인증 요청",
      description: "인증 요청 설명",
      activeNodes: ["browser", "iam"],
      activeEdgeIds: ["req"],
    },
    {
      step: 2,
      title: "응답",
      actor: "IAM",
      target: "Browser",
      protocol: "HTTPS",
      action: "코드 응답",
      description: "코드 응답 설명",
      activeNodes: ["iam"],
      activeEdgeIds: ["res"],
    },
    {
      step: 3,
      title: "예외: PKCE 거부",
      actor: "IAM",
      target: "Browser",
      protocol: "HTTPS",
      action: "인가 거부",
      description: "검증 실패 시 토큰을 발급하지 않습니다.",
      activeNodes: ["iam", "browser"],
      activeEdgeIds: ["denied"],
    },
  ],
  keyTakeaways: ["기존 핵심"],
  tradeOffs: { pros: [], cons: [] },
  codeSnippets: [],
  securityChecklistIds: [],
  relatedTermIds: [],
  relatedTopicIds: [],
};
const candidate = {
  id: "c1",
  title: "인증 개정 근거",
  summary: "공식 근거 기반",
  candidateVersion: 1,
  proposalKind: "insight",
  status: "needs_review",
  issues: [],
  claims: [
    { text: "새 규칙", evidence: [{ quote: "공식 자료", source_id: "s1" }] },
  ],
};
async function setup(page: any, revision = false, reader = false) {
  let logged = false,
    current: any = {
      ...candidate,
      ...(revision
        ? {
            proposalKind: "topic_revision",
            targetContentId: "topic-1",
            baseLockVersion: 3,
          }
        : {}),
    },
    conflict = false;
  const calls: any[] = [];
  const policies: any[] = [];
  await page.route("**/api/**", async (route: any) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    let data: any = [];
    if (path.endsWith("/auth/csrf"))
      data = { token: "fixture", headerName: "X-CSRF-TOKEN" };
    else if (path.endsWith("/auth/login")) {
      logged = true;
      data = {};
    } else if (path.endsWith("/auth/me")) {
      if (!logged) return route.fulfill({ status: 401 });
      data = {
        id: "u1",
        username: "user",
        displayName: "사용자",
        role: reader ? "READER" : "ADMIN",
        mustChangePassword: false,
      };
    } else if (path === "/api/topics")
      data = [{ ...topic, lockVersion: conflict ? 4 : 3 }];
    else if (path === "/api/research/policies") {
      if (req.method() === "POST") {
        const body = req.postDataJSON();
        calls.push(body);
        policies.push({ ...body, id: "p1" });
        data = policies[0];
      } else data = policies;
    } else if (path === "/api/research/runs" && req.method() === "POST") {
      calls.push(req.postDataJSON());
      data = { id: "r1", status: "queued" };
    } else if (path === "/api/research/candidates") data = [current];
    else if (path.endsWith("/c1/revision")) {
      const body = req.postDataJSON();
      calls.push(body);
      current = {
        ...current,
        proposalKind: "topic_revision",
        candidateVersion: 2,
        targetContentId: body.targetContentId,
        baseLockVersion: body.baseLockVersion,
      };
      data = current;
    } else if (path.endsWith("/c1/diff"))
      data = {
        candidateVersion: current.candidateVersion,
        proposalKind: "topic_revision",
        targetContentId: "topic-1",
        baseLockVersion: 3,
        currentLockVersion: conflict ? 4 : 3,
        conflict,
        before: topic,
        after: { ...topic, summary: "새 인증 설명" },
        changes: [
          { path: "summary", before: "기존 인증 설명", after: "새 인증 설명" },
        ],
      };
    else if (path.endsWith("/c1/publish")) {
      calls.push(req.postDataJSON());
      conflict = true;
      return route.fulfill({ status: 409, json: {} });
    }
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.getByLabel("아이디", { exact: true }).fill("user");
  await page.getByLabel("비밀번호", { exact: true }).fill("fixture-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "이해하고, 비교하고, 설계하세요." }),
  ).toBeVisible();
  return calls;
}
test("directed graph steps, trust zones, keyboard camera and accessible nodes", async ({
  page,
}) => {
  await setup(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "아키텍처", exact: true })
    .click();
  await expect(page.locator('[data-edge-id="req"]')).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.locator('[data-edge-id="res"]')).toHaveAttribute(
    "data-active",
    "false",
  );
  await expect(page.locator(".diagram-zone")).toHaveCount(2);
  await page.getByRole("button", { name: "단계 2: 응답", exact: true }).click();
  await expect(page.locator('[data-edge-id="req"]')).toHaveAttribute(
    "data-active",
    "false",
  );
  await expect(page.locator('[data-edge-id="res"]')).toHaveAttribute(
    "data-active",
    "true",
  );
  await page.getByRole("button", { name: "전체 흐름", exact: true }).click();
  await expect(page.locator('.diagram-edge[data-active="true"]')).toHaveCount(
    3,
  );
  const canvas = page.getByRole("group", {
    name: "인터랙티브 아키텍처 흐름도",
    exact: true,
  });
  await canvas.focus();
  await page.keyboard.press("+");
  await expect(page.getByLabel("흐름도 배율")).toHaveText("120%");
  const beforePan = await canvas
    .locator(":scope > g")
    .getAttribute("transform");
  await page.keyboard.press("ArrowRight");
  expect(await canvas.locator(":scope > g").getAttribute("transform")).not.toBe(
    beforePan,
  );
  await page.keyboard.press("Home");
  await expect(page.getByLabel("흐름도 배율")).toHaveText("100%");
  await page
    .getByRole("button", {
      name: "IAM, Authorization server, 현재 표시",
      exact: true,
    })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".diagram-selection")).toContainText(
    "IAM · Authorization server · 신뢰 영역: Server",
  );
  await page
    .getByText("텍스트로 흐름 읽기 (3개 연결)", { exact: true })
    .click();
  await expect(page.locator(".diagram-text")).toContainText("Browser → IAM");
  await page.getByRole("button", { name: "현재 단계", exact: true }).click();
  await page
    .getByRole("button", { name: "단계 3: 예외: PKCE 거부", exact: true })
    .click();
  await expect(page.locator('[data-edge-id="denied"]')).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.locator('[data-edge-id="denied"]')).toHaveClass(/error/);
  await expect(page.locator('[data-edge-id="req"]')).toHaveAttribute(
    "data-active",
    "false",
  );
  await expect(
    page.getByText("검증 실패 시 토큰을 발급하지 않습니다.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/flow-desktop.png", fullPage: true });
});
test("graph mobile, themes, drag, fit and 200 percent zoom remain usable", async ({
  page,
}) => {
  await setup(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "아키텍처", exact: true })
    .click();
  for (const width of [1440, 1280, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("button", { name: "화면 설정" }).click();
    await page
      .getByRole("button", {
        name: width === 390 ? "야간" : "주간",
        exact: true,
      })
      .click();
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "흐름도 확대", exact: true })
      .click();
    await page.getByRole("button", { name: "화면 맞춤", exact: true }).click();
    await expect(page.getByLabel("흐름도 배율")).toHaveText("100%");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/flow-${width}.png`,
      fullPage: true,
    });
  }
  for (let i = 0; i < 14; i++)
    await page
      .getByRole("button", { name: "흐름도 확대", exact: true })
      .click();
  await expect(page.getByLabel("흐름도 배율")).toHaveText("800%");
  const beforeDrag = await page
    .locator(".diagram-canvas > g")
    .getAttribute("transform");
  const box = await page.locator(".diagram-canvas").boundingBox();
  await page.mouse.move(box!.x + 30, box!.y + 30);
  await page.mouse.down();
  await page.mouse.move(box!.x + 70, box!.y + 50);
  await page.mouse.up();
  expect(
    await page.locator(".diagram-canvas > g").getAttribute("transform"),
  ).not.toBe(beforeDrag);
  await page.getByRole("button", { name: "화면 맞춤", exact: true }).click();
  await expect(page.getByLabel("흐름도 배율")).toHaveText("100%");
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => (document.documentElement.style.zoom = "2"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({ path: "artifacts/flow-zoom200.png", fullPage: true });
});
test("existing topic revision field comparison and stale publish force fresh review", async ({
  page,
}) => {
  const calls = await setup(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "리서치 에이전트", exact: true })
    .click();
  await page
    .getByRole("button", { name: "기존 토픽 개정 제안", exact: true })
    .click();
  await page
    .getByLabel("개정 대상 토픽", { exact: true })
    .selectOption("topic-1");
  await page
    .getByLabel("개정 필드 JSON", { exact: false })
    .fill(JSON.stringify({ summary: "새 인증 설명" }));
  await page
    .getByRole("button", { name: "개정 제안 저장", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "토픽 개정 비교", exact: true }),
  ).toBeVisible();
  expect(calls[0]).toMatchObject({
    candidateVersion: 1,
    targetContentId: "topic-1",
    baseLockVersion: 3,
    revisionPatch: { summary: "새 인증 설명" },
  });
  await expect(page.locator(".revision-diff")).toContainText("기존 인증 설명");
  await expect(page.locator(".revision-diff")).toContainText("새 인증 설명");
  await page
    .getByLabel("검토 사유", { exact: true })
    .fill("공식 근거와 차이 확인 완료");
  await page.getByLabel("출처와 주장을 검토했으며 게시를 승인합니다.").check();
  await page
    .getByRole("button", { name: "승인하고 게시", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "기준 버전과 현재 토픽이 다릅니다",
  );
  await expect(
    page.getByRole("button", { name: "승인하고 게시", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByLabel("출처와 주장을 검토했으며 게시를 승인합니다."),
  ).not.toBeChecked();
  expect(calls[1]).toMatchObject({
    candidateVersion: 2,
    baseLockVersion: 3,
    reason: "공식 근거와 차이 확인 완료",
  });
  await page.screenshot({
    path: "artifacts/revision-conflict.png",
    fullPage: true,
  });
});
test("reader navigation exposes learning and excludes research administration", async ({
  page,
}) => {
  await setup(page, false, true);
  await expect(
    page
      .locator("nav")
      .getByRole("button", { name: "리서치 에이전트", exact: true }),
  ).toHaveCount(0);
  await page
    .locator("nav")
    .getByRole("button", { name: "아키텍처", exact: true })
    .click();
  await expect(page.locator(".diagram-edge")).toHaveCount(3);
});

test("topic revision collection policy can be saved and started from the screen", async ({
  page,
}) => {
  const calls = await setup(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "리서치 에이전트", exact: true })
    .click();
  await page.getByText("분야·출처·규칙 편집", { exact: true }).click();
  await page.getByLabel("정책 JSON", { exact: true }).fill(
    JSON.stringify({
      name: "인증 개정",
      domainId: "identity",
      sources: [
        {
          host: "www.keycloak.org",
          publisher_group: "keycloak",
          reuse_allowed: true,
          feed_url: "https://www.keycloak.org/rss.xml",
        },
      ],
    }),
  );
  await page
    .getByLabel("수집 결과의 대상", { exact: true })
    .selectOption("topic-1");
  await page.getByRole("button", { name: "정책 저장", exact: true }).click();
  await expect.poll(() => calls.length).toBe(1);
  expect(calls[0]).toMatchObject({
    targetContentId: "topic-1",
    targetBaseLockVersion: 3,
  });
  await page.getByRole("combobox").first().selectOption("p1");
  await page.getByRole("button", { name: "수동 실행", exact: true }).click();
  await expect.poll(() => calls.length).toBe(2);
  expect(calls[1]).toMatchObject({ policyId: "p1" });
});
test("studio previews explicit graph and rejects broken node references", async ({
  page,
}) => {
  await setup(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "콘텐츠 스튜디오", exact: true })
    .click();
  const editor = page.getByLabel("JSON 편집", { exact: true });
  await editor.fill(JSON.stringify(topic));
  await expect(page.locator(".diagram-edge")).toHaveCount(3);
  await editor.fill(
    JSON.stringify({
      ...topic,
      diagramEdges: [
        { id: "bad", source: "missing", target: "iam", type: "request" },
      ],
    }),
  );
  await expect(page.getByRole("alert")).toContainText(
    "연결의 id, source, target, type을 확인하세요",
  );
  await page
    .getByRole("button", { name: "검증하고 서버 저장", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "연결의 id, source, target, type을 확인하세요",
  );
});
