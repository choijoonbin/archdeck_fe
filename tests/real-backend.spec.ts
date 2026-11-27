import { test, expect } from "@playwright/test";
import fs from "node:fs";
const envFile =
  process.env.ARCHDECK_REAL_ENV_FILE ||
  "../ArchDeck_BE/output/integration-env.json";
async function login(page: any) {
  test.skip(
    process.env.ARCHDECK_REAL_E2E !== "true" || !fs.existsSync(envFile),
    "Run backend integration bootstrap first",
  );
  const secret = JSON.parse(fs.readFileSync(envFile, "utf8"));
  await page.goto(process.env.ARCHDECK_REAL_URL || "http://127.0.0.1:5175");
  await page
    .getByLabel("아이디", { exact: true })
    .fill(process.env.ARCHDECK_REAL_USERNAME || "archdeck-admin");
  await page
    .getByLabel("비밀번호", { exact: true })
    .fill(secret.ARCHDECK_TEST_NEW_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "이해하고, 비교하고, 설계하세요." }),
  ).toBeVisible();
}
test("PostgreSQL session login and account-scoped note journey", async ({
  page,
}) => {
  await login(page);
  await page
    .locator("nav")
    .getByRole("button", { name: "아키텍처", exact: true })
    .click();
  await page.getByRole("button", { name: "내 학습 메모", exact: true }).click();
  const note = page.getByPlaceholder(/우리 프로젝트에서는 BFF/);
  await note.fill("브라우저 통합 회귀 검증");
  await page.getByRole("button", { name: "메모 저장", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: "내 학습 메모", exact: true }).click();
  await expect(note).toHaveValue("브라우저 통합 회귀 검증");
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(
    page.getByRole("button", { name: "로그인", exact: true }),
  ).toBeVisible();
});

test("PostgreSQL graph metadata drives SVG steps and PKCE rejection branch", async ({
  page,
}) => {
  await login(page);
  const response = await page.request.get(
    new URL("/api/topics", page.url()).toString(),
  );
  expect(response.ok()).toBeTruthy();
  const topics = await response.json();
  const topic = topics.find((t: any) =>
    t.diagramEdges?.some((e: any) => e.type === "error"),
  );
  expect(topic).toBeTruthy();
  expect(
    topic.diagramNodes.some(
      (n: any) => Number.isFinite(n.x) && Number.isFinite(n.y) && n.trustZone,
    ),
  ).toBeTruthy();
  const errorEdge = topic.diagramEdges.find((e: any) => e.type === "error");
  const errorStep = topic.flowSteps.find((step: any) =>
    step.activeEdgeIds?.includes(errorEdge.id),
  );
  expect(errorStep).toBeTruthy();
  await page
    .locator("nav")
    .getByRole("button", { name: "아키텍처", exact: true })
    .click();
  await page.goto(
    new URL(`/topics/${encodeURIComponent(topic.id)}`, page.url()).toString(),
  );
  await expect(page.locator(".diagram-edge")).toHaveCount(
    topic.diagramEdges.length,
  );
  await expect(page.locator(".diagram-zone")).not.toHaveCount(0);
  await page
    .getByRole("button", {
      name: `단계 ${errorStep.step}: ${errorStep.title}`,
      exact: true,
    })
    .click();
  await expect(
    page.locator(`[data-edge-id="${errorEdge.id}"]`),
  ).toHaveAttribute("data-active", "true");
  await expect(page.locator(`[data-edge-id="${errorEdge.id}"]`)).toHaveClass(
    /error/,
  );
  await page.getByRole("button", { name: "전체 흐름", exact: true }).click();
  await expect(page.locator('.diagram-edge[data-active="true"]')).toHaveCount(
    topic.diagramEdges.length,
  );
  for (const width of [1440, 1280, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
    await page.screenshot({
      path: `artifacts/actual-graph-${width}.png`,
      fullPage: true,
    });
    if (width === 320) {
      for (let i = 0; i < 14; i++)
        await page
          .getByRole("button", { name: "흐름도 확대", exact: true })
          .click();
      await expect(page.getByLabel("흐름도 배율")).toHaveText("800%");
      const canvas = page.getByRole("group", {
        name: "인터랙티브 아키텍처 흐름도",
        exact: true,
      });
      await canvas.focus();
      await page.keyboard.press("ArrowLeft");
      await page.screenshot({
        path: "artifacts/actual-graph-320-zoom800.png",
        fullPage: true,
      });
      await page
        .getByRole("button", { name: "화면 맞춤", exact: true })
        .click();
      await expect(page.getByLabel("흐름도 배율")).toHaveText("100%");
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => (document.documentElement.style.zoom = "2"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/actual-graph-zoom200.png",
    fullPage: true,
  });
});

test("PostgreSQL topic revision candidate renders canonical field differences", async ({
  page,
}) => {
  test.skip(
    !process.env.ARCHDECK_REAL_CANDIDATE_ID,
    "Provide prepared integration revision candidate",
  );
  await login(page);
  const id = process.env.ARCHDECK_REAL_CANDIDATE_ID!;
  const response = await page.request.get(
    new URL(`/api/research/candidates/${id}/diff`, page.url()).toString(),
  );
  expect(response.ok()).toBeTruthy();
  const diff = await response.json();
  expect(diff.proposalKind).toBe("topic_revision");
  expect(diff.changes.length).toBeGreaterThan(0);
  const candidates = await (
    await page.request.get(
      new URL("/api/research/candidates", page.url()).toString(),
    )
  ).json();
  const candidate = candidates.find((item: any) => item.id === id);
  expect(candidate).toBeTruthy();
  await page
    .locator("nav")
    .getByRole("button", { name: "리서치 에이전트", exact: true })
    .click();
  const card = page.locator(`[data-candidate-id="${id}"]`);
  await expect(
    card.getByRole("region", { name: "토픽 개정 비교" }),
  ).toBeVisible();
  await expect(card.locator(".revision-diff")).toHaveCount(diff.changes.length);
  for (const change of diff.changes)
    await expect(
      card.locator(".revision-diff").filter({
        has: page.getByRole("heading", { name: change.path, exact: true }),
      }),
    ).toBeVisible();
  const publish = card.getByRole("button", {
    name: "승인하고 게시",
    exact: true,
  });
  await expect(publish).toBeDisabled();
  await page.screenshot({
    path: "artifacts/actual-topic-revision.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 1000 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "artifacts/actual-topic-revision-mobile.png",
    fullPage: true,
  });
});
