# ArchDeck Frontend 작업 기준

원격은 https://github.com/choijoonbin/archdeck_fe.git, 개발 브랜치는 dev다.

공통 원본은 ../ArchDeck_BE/docs/00-project-baseline.md와 ../ArchDeck_BE/docs/05-implementation-plan.md, UX 기준은 02-product-and-navigation.md다. 단독 체크아웃에서는 https://github.com/choijoonbin/archdeck_be/tree/dev/docs 를 확인한다.

- React·TypeScript·Tailwind를 유지하며 DWP형 헤더·내비게이션·본문을 적용한다.
- 아이디·비밀번호 로그인, ADMIN·READER, 헤더 로그인 상태·로그아웃을 포함하며 알림은 제외한다.
- preset, 좌·우·상단, 접기, 주간·야간·시스템, 밀도·고대비·모션·초기화·보존이 필수다.
- 서버 인가와 메뉴 숨김을 구분한다. 공유 번들에 보호 콘텐츠를 넣지 않는다.
- 개인 기록은 serviceId와 불변 사용자 UUID로 분리하고 default_user 동기화를 사용하지 않는다.
- 빈 흐름·부분 API 실패·저장 실패를 처리하고 실제 결과와 성공 표시를 일치시킨다.
- 변경 화면은 1440·1280·390·320px, 200% 확대·키보드·초점·모션·테마·배치를 검증한다.
- 소스 변경은 npm run build와 해당 동작을 검증한다. 생성물·.env·비밀은 커밋하지 않는다.
- 공통 기획 변경은 백엔드 원본 문서에 반영하고 이 저장소에 사본을 만들지 않는다.
