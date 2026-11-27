# ArchDeck Frontend

React 18·TypeScript·Tailwind·Vite 기반 기술 학습 프론트엔드다. 개발 브랜치는 dev다. 로그인과 DWP형 헤더·사이드바·설정, 기술 학습과 관리자 검토 도구를 제공한다.

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

콘텐츠는 인증된 백엔드 API에서 조회한다. 소스·package.json·package-lock.json·설정은 추적하고 node_modules·dist·tsbuildinfo·.env·비밀·로그는 제외한다.

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

기존 모의 API 5개 시나리오와 실제 PostgreSQL 세션 로그인·메모·로그아웃 시나리오를 통과했다. 1440·1280·390·320px, 200% 확대, 야간·우측·상단 메뉴를 점검하고 로컬 artifacts에 스크린샷을 보존했다. 회사망 Azure 호출 검증은 별도 환경에서 수행해야 한다.

## 흐름도와 토픽 개정

토픽의 `diagramNodes`에 선택 좌표 `x/y`와 `trustZone`, `diagramEdges`에 `id/source/target/type/label/protocol/trustBoundary`, 단계에 `activeEdgeIds`를 넣으면 방향 연결선과 단계 강조에 반영된다. 연결 유형은 request/response/internal/event/error다. 좌표가 없으면 자동 배치하며, 연결 데이터가 없을 때 통신 관계를 추측하지 않는다. 스튜디오에서 참조를 검증하고 실제 흐름도를 미리 볼 수 있다. 단계·전체 전환, 최대 8배 확대·축소·맞춤, 드래그·방향키·Home, 텍스트 대체 흐름을 지원한다.

리서치 정책에서 신규 인사이트 또는 기존 토픽 개정을 선택한다. 후보의 근거를 확인하고 개정 필드를 작성한 뒤 기존/제안 값을 비교한다. 사유와 승인 후에만 게시할 수 있으며, 버전 충돌은 승인을 해제하고 최신 차이를 다시 불러온다. 충돌 시 최신 토픽을 기준으로 제안을 다시 작성하고 재검토해야 한다. 수집과 후보 작성은 자동 게시하지 않는다.

`tests/remaining-workflows.spec.ts`는 그래프 방향·단계·신뢰 영역·카메라·모바일·테마·확대, 개정 요청·필드 차이·409 재검토, READER 메뉴를 모의 API로 검증한다. 실제 서버 검증과 모의 API 검증을 구분한다. 스크린샷은 추적하지 않는 `artifacts/`에 저장한다.

실제 통합 검증은 `ARCHDECK_REAL_USERNAME`, `ARCHDECK_REAL_URL`, `ARCHDECK_REAL_ENV_FILE`로 계정·서버·Git 제외 비밀 파일을 지정할 수 있다. 준비한 미게시 개정 후보의 `ARCHDECK_REAL_CANDIDATE_ID`를 주면 실제 필드 비교 화면을 읽기 전용으로 검증하며 게시하지 않는다. V8 적용 PostgreSQL 서버와 fixture Agent에서 실제 세션·학습 기록, 그래프 메타데이터·PKCE 거부 분기, 개정 후보 비교 3개를 통과했다. 이 검사는 Azure 실연결을 의미하지 않는다.
