import { test, expect } from "@playwright/test";
const topic = {
  id: "topic-1",
  slug: "topic-1",
  title: "Architecture reference",
  koreanTitle: "아키텍처 참조",
  category: "IAM & Auth",
  summary: "인증 흐름과 설계 판단을 위한 설명입니다.",
  overview: "개념과 적용 조건을 확인합니다.",
  badges: ["OIDC"],
  readingTimeMinutes: 5,
  diagramNodes: [],
  flowSteps: [],
  keyTakeaways: ["관심사 분리"],
  tradeOffs: { pros: [], cons: [] },
  codeSnippets: [],
  securityChecklistIds: [],
  relatedTermIds: [],
  relatedTopicIds: [],
};
async function setup(page: any) {
  let logged = false;
  await page.route("**/api/**", async (route: any) => {
    const path = new URL(route.request().url()).pathname;
    let data: any = [];
    if (path === "/api/auth/csrf")
      data = { token: "fixture-csrf", headerName: "X-CSRF-TOKEN" };
    else if (path === "/api/auth/login") {
      logged = true;
      data = {};
    } else if (path === "/api/auth/logout") {
      logged = false;
      return route.fulfill({ status: 204 });
    } else if (path === "/api/auth/me") {
      if (!logged) return route.fulfill({ status: 401, json: {} });
      data = {
        id: "reader-1",
        username: "reader",
        displayName: "테스트 사용자",
        role: "ADMIN",
        mustChangePassword: false,
      };
    } else if (path === "/api/topics") data = [topic];
    else if (path === "/api/comparisons")
      data = [
        {
          id: "spa-vs-bff",
          title: "SPA vs BFF",
          subtitle: "아키텍처 비교",
          subjects: [],
          dimensions: [],
          decisionGuide: [],
        },
      ];
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.getByLabel("아이디", { exact: true }).fill("reader");
  await page.getByLabel("비밀번호", { exact: true }).fill("fixture-password");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "이해하고, 비교하고, 설계하세요." }),
  ).toBeVisible();
}
test("login, empty-flow P0, settings persistence, logout clears content", async ({
  page,
}) => {
  await setup(page);
  await page.getByRole("button", { name: "아키텍처", exact: true }).click();
  await expect(
    page.getByText("이 문서는 단계 흐름 없이 개념과 적용 조건을 설명합니다."),
  ).toBeVisible();
  await page.getByRole("button", { name: "화면 설정" }).click();
  await page.getByRole("button", { name: "야간", exact: true }).click();
  await page.getByRole("button", { name: "오른쪽", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.keyboard.press("Escape");
  await expect(page.locator(".workspace")).toHaveClass(/placement-right/);
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(
    page.getByRole("button", { name: "로그인", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("아키텍처 참조", { exact: true })).toHaveCount(0);
});
test("responsive shell across widths and themes", async ({ page }) => {
  await setup(page);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const width of [1440, 1280, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.getByRole("button", { name: "화면 설정" }).click();
    await page
      .getByRole("button", { name: width % 2 ? "야간" : "주간", exact: true })
      .click();
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/workspace-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => (document.documentElement.style.zoom = "2"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/workspace-zoom200.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("API failure shows retry without bundled content fallback", async ({
  page,
}) => {
  await setup(page);
  await page.route("**/api/topics", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "지식을 불러오지 못했습니다." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "다시 시도" })).toBeVisible();
});

test("personal notes survive reload and settings keyboard escape restores focus", async ({
  page,
}) => {
  await setup(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "아키텍처", exact: true })
    .click();
  await page.getByRole("button", { name: "내 학습 메모", exact: true }).click();
  await page
    .getByPlaceholder(/우리 프로젝트에서는 BFF/)
    .fill("이 계정만의 검증 메모");
  await page.getByRole("button", { name: "메모 저장", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "내 학습 메모", exact: true }).click();
  await expect(page.getByPlaceholder(/우리 프로젝트에서는 BFF/)).toHaveValue(
    "이 계정만의 검증 메모",
  );
  await page.getByRole("button", { name: "화면 설정" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "화면 설정" })).toBeFocused();
});

test("research publication requires explicit reason and approval", async ({
  page,
}) => {
  await setup(page);
  let published = false;
  await page.route("**/api/research/candidates", (route) =>
    route.fulfill({
      json: [
        {
          id: "candidate-1",
          runId: "run-1",
          title: "검토할 기술 변화",
          summary: "근거를 확인하고 게시합니다.",
          claims: [
            {
              text: "확인할 주장",
              evidence: [{ source_id: "source-1", quote: "검토할 근거" }],
            },
          ],
          documents: [],
          issues: [],
          status: "needs_review",
          candidateVersion: 1,
          baseLockVersion: null,
        },
      ],
    }),
  );
  await page.route(
    "**/api/research/candidates/candidate-1/publish",
    (route) => {
      const body = route.request().postDataJSON();
      expect(body.candidateVersion).toBe(1);
      expect(body.reason).toBe("출처와 날짜 확인 완료");
      published = true;
      return route.fulfill({ json: { status: "published" } });
    },
  );
  await page
    .locator("nav")
    .getByRole("button", { name: "리서치 에이전트", exact: true })
    .click();
  const publish = page.getByRole("button", {
    name: "승인하고 게시",
    exact: true,
  });
  await expect(publish).toBeDisabled();
  await page
    .getByLabel("검토 사유", { exact: true })
    .fill("출처와 날짜 확인 완료");
  await page.getByLabel("출처와 주장을 검토했으며 게시를 승인합니다.").check();
  await publish.click();
  await expect.poll(() => published).toBeTruthy();
});
