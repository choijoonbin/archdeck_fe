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
