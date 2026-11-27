import { test, expect } from "@playwright/test";
import fs from "node:fs";
test("PostgreSQL session login and account-scoped note journey", async ({
  page,
}) => {
  const file = "../ArchDeck_BE/output/integration-env.json";
  test.skip(
    process.env.ARCHDECK_REAL_E2E !== "true" || !fs.existsSync(file),
    "Run the backend integration bootstrap first",
  );
  const secret = JSON.parse(fs.readFileSync(file, "utf8"));
  await page.goto("http://127.0.0.1:5175");
  await page.getByLabel("아이디", { exact: true }).fill("archdeck-admin");
  await page
    .getByLabel("비밀번호", { exact: true })
    .fill(secret.ARCHDECK_TEST_NEW_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "이해하고, 비교하고, 설계하세요." }),
  ).toBeVisible();
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
