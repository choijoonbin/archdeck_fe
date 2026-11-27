# ArchDeck Frontend

React 18·TypeScript·Tailwind·Vite 기반 기술 학습 프론트엔드다. 개발 브랜치는 dev다. 현재 홈·토픽·비교·용어·체크리스트·개인 기록과 기본 등록 기능을 기준선으로 보존했다. 로그인과 DWP형 헤더·사이드바·설정은 후속 구현이다.

## 실행

```sh
npm ci
npm run dev
npm run build
```

개발 포트는 5173, /api는 localhost:4000으로 전달한다. 별도 [백엔드 저장소](https://github.com/choijoonbin/archdeck_be/tree/dev)를 실행한다.

## 공통 기획

기획 원본은 백엔드 저장소 docs에 모아 관리한다.

- [제품 기획](https://github.com/choijoonbin/archdeck_be/blob/dev/docs/00-project-baseline.md)
- [메뉴·화면·설정](https://github.com/choijoonbin/archdeck_be/blob/dev/docs/02-product-and-navigation.md)
- [로그인·사내 공유](https://github.com/choijoonbin/archdeck_be/blob/dev/docs/04-auth-and-sharing.md)
- [누적 작업 계획](https://github.com/choijoonbin/archdeck_be/blob/dev/docs/05-implementation-plan.md)

현재 초기 콘텐츠는 번들에 내장되어 있다. 사내 인증 구현에서는 인증 API로 옮기는 작업을 함께 수행한다. 소스·package.json·package-lock.json·설정은 추적하고 node_modules·dist·tsbuildinfo·.env·비밀·로그는 제외한다.

## 구현과 검증

로그인·초기 비밀번호 변경·로그아웃, API 전용 콘텐츠 로딩, 브라우저·계정별 학습 기록, DWP형 메뉴·설정과 관리자 계정·스튜디오·리서치 화면을 구현했다. 내장 src/data는 번들에 import하지 않으며 서버 오류·미인증 상태에서 샘플 fallback하지 않는다. 기존 데이터 소스는 백엔드 이관 대조를 위해 보존한다.

```sh
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

테스트는 기본 모의 API를 사용한다. 실제 백엔드 통합 테스트는 백엔드 통합 bootstrap으로 생성된 Git 제외 output/integration-env.json과 4400번 백엔드, ARCHDECK_API_TARGET=http://127.0.0.1:4400으로 실행한 5175번 Vite가 필요하며 ARCHDECK_REAL_E2E=true로 명시 실행한다. 테스트는 해당 비밀번호를 출력하거나 저장소에 기록하지 않는다.

```sh
ARCHDECK_API_TARGET=http://127.0.0.1:4400 npm run dev -- --port 5175
ARCHDECK_REAL_E2E=true npx playwright test tests/real-backend.spec.ts
```

모의 API 5개 시나리오와 실제 PostgreSQL 세션 로그인·메모·로그아웃 시나리오를 통과했다. 1440·1280·390·320px, 200% 확대, 야간·우측·상단 메뉴를 점검하고 로컬 artifacts에 스크린샷을 보존했다. 회사망 Azure 호출 검증은 별도 환경에서 수행해야 한다.
