import { ComparisonMatrix } from '../types';

export const initialComparisons: ComparisonMatrix[] = [
  {
    id: 'spa-vs-bff',
    title: 'SPA + PKCE 직접 연동 vs BFF (Backend for Frontend) 패턴',
    subtitle: '보안 등급, 토큰 노출도, 인프라 비용에 따른 아키텍처 의사결정 매트릭스',
    category: 'Architecture Comparison',
    subjects: [
      {
        id: 'spa-pkce',
        name: 'SPA + PKCE 직접 연동',
        tag: 'Public Client',
        iconName: 'Layout',
        recommendedFor: '신속한 MVP 개발, 낮은 인프라 예산, 사내 관리자 도구, 정적 CDN 호스팅',
        description: 'React/Vue 프론트엔드가 Keycloak 등 OIDC 서버와 브라우저 단에서 직접 Authorization Code + PKCE(S256)로 토큰을 교환하고 메모리에 유지하는 방식'
      },
      {
        id: 'bff-pattern',
        name: 'BFF 패턴 + Token Relay',
        tag: 'Confidential Client (Recommended)',
        iconName: 'ShieldCheck',
        recommendedFor: '금융/핀테크, 개인정보 취급 시스템, 대규모 MSA, 긴급 세션 취소(Kill Switch) 필수 환경',
        description: '프론트엔드 전담 백엔드(BFF)가 기밀 클라이언트 시크릿으로 백채널 토큰 교환을 수행하고, 브라우저는 HttpOnly 쿠키만 보유하며 내부 마이크로서비스로 토큰을 주입하는 방식'
      }
    ],
    dimensions: [
      {
        key: 'client-type',
        name: '클라이언트 유형 (OAuth 2.0)',
        description: 'RFC 6749에 따른 클라이언트 보안 기밀성 분류',
        values: {
          'spa-pkce': {
            text: 'Public Client (시크릿 은닉 불가)',
            status: 'warning',
            detail: '브라우저 소스 코드가 공개되므로 Client Secret을 절대 저장할 수 없으며 PKCE가 필수입니다.'
          },
          'bff-pattern': {
            text: 'Confidential Client (시크릿 완전 은닉)',
            status: 'positive',
            detail: 'BFF 서버 환경 변수에 Client Secret 및 mTLS 키를 안전하게 보관하여 고신뢰 인증을 수행합니다.'
          }
        }
      },
      {
        key: 'token-location',
        name: 'Access/Refresh Token 보관 위치',
        description: '원천 JWT 크레덴셜이 상주하는 물리적/논리적 메모리 영역',
        values: {
          'spa-pkce': {
            text: '브라우저 자바스크립트 런타임 메모리',
            status: 'warning',
            detail: 'JS 변수/클로저에 보관. localStorage 저장은 OWASP 금지 사항이며, 메모리 덤프 위험 잔존.'
          },
          'bff-pattern': {
            text: '서버 측 세션 스토어 (Redis 등)',
            status: 'positive',
            detail: '브라우저에는 토큰이 1비트도 도달하지 않으며, 서버의 고속 인메모리 DB에만 격리 보관됩니다.'
          }
        }
      },
      {
        key: 'browser-credential',
        name: '브라우저 ↔ API 인증 수단',
        description: '프론트엔드가 네트워크 요청 시 동봉하는 자격 증명 형태',
        values: {
          'spa-pkce': {
            text: 'Authorization: Bearer <JWT>',
            status: 'neutral',
            detail: '프론트엔드 코드가 명시적으로 HTTP 요청 헤더에 JWT 문자열을 조립해 전송합니다.'
          },
          'bff-pattern': {
            text: 'HttpOnly; Secure; SameSite 쿠키',
            status: 'positive',
            detail: '자바스크립트(document.cookie)가 접근할 수 없는 암호화된 브라우저 전용 쿠키를 사용합니다.'
          }
        }
      },
      {
        key: 'xss-vulnerability',
        name: 'XSS 공격 시 토큰 탈취 위험',
        description: '악성 스크립트 실행 취약점 발생 시 피해 심각도',
        values: {
          'spa-pkce': {
            text: '위험 (메모리 가로채기 및 API 무단 호출 가능)',
            status: 'negative',
            detail: '악성 스크립트가 fetch()를 오버라이드하거나 토큰 보유 클로저를 탐색하여 토큰을 외부 C2로 전송 가능.'
          },
          'bff-pattern': {
            text: '매우 안전 (토큰 탈취 불가능)',
            status: 'positive',
            detail: '브라우저 내에 토큰 자체가 존재하지 않고 쿠키가 HttpOnly이므로 토큰 파일 자체를 훔칠 수 없습니다.'
          }
        }
      },
      {
        key: 'csrf-vulnerability',
        name: 'CSRF 공격 노출도 및 방어책',
        description: '사이트 간 요청 위조에 대한 근본적인 취약 여부',
        values: {
          'spa-pkce': {
            text: '면역 (CSRF 위험 없음)',
            status: 'positive',
            detail: '쿠키가 아닌 Authorization Bearer 헤더를 사용하므로 브라우저가 자동으로 자격 증명을 보내지 않습니다.'
          },
          'bff-pattern': {
            text: '방어책 필수 (SameSite + X-XSRF-TOKEN)',
            status: 'warning',
            detail: '쿠키 기반이므로 SameSite=Lax/Strict 속성과 Double Submit Cookie 헤더 검증 레이어가 반드시 필요합니다.'
          }
        }
      },
      {
        key: 'session-kill-switch',
        name: '즉시 세션 만료 (Kill Switch) 지원',
        description: '보안 위협 시 모든 장치의 로그인을 1초 내에 강제 동결하는 능력',
        values: {
          'spa-pkce': {
            text: '어려움 (토큰 Expire 시간까지 유효)',
            status: 'negative',
            detail: '순수 무상태 JWT는 발급 후 중앙 회수가 어려우며, 토큰 블랙리스트를 마이크로서비스마다 전파해야 함.'
          },
          'bff-pattern': {
            text: '즉시 가능 (Redis 세션 키 O(1) 삭제)',
            status: 'positive',
            detail: 'Redis에서 사용자의 세션 키를 삭제하는 즉시 모든 디바이스의 후속 토큰 릴레이가 100% 차단됩니다.'
          }
        }
      },
      {
        key: 'page-refresh',
        name: '새로고침(F5) 시 세션 복원 및 ITP 영향',
        description: '브라우저 새로고침이나 탭 이동 시 로그인 유지 매끄러움',
        values: {
          'spa-pkce': {
            text: '복잡함 (Iframe 새로고침 or 번들 리셋)',
            status: 'warning',
            detail: '메모리가 날아가므로 백그라운드 재인증이 필요하며, Safari ITP로 인해 히든 아이프레임이 막힐 수 있음.'
          },
          'bff-pattern': {
            text: '매우 매끄러움 (쿠키 자동 동봉)',
            status: 'positive',
            detail: '표준 웹 세션 쿠키가 브라우저에 의해 자동 유지되므로 깜빡임이나 서드파티 쿠키 차단 이슈가 전혀 없음.'
          }
        }
      },
      {
        key: 'infra-complexity',
        name: '인프라 및 운영 복잡도',
        description: '유지보수해야 하는 서버, 데이터베이스 및 데브옵스 오버헤드',
        values: {
          'spa-pkce': {
            text: '매우 낮음 (Static Web Hosting)',
            status: 'positive',
            detail: 'Vercel, Cloudflare, S3/CloudFront에 정적 빌드 파일만 배포하면 되며 서버 관리가 불필요합니다.'
          },
          'bff-pattern': {
            text: '중간~높음 (BFF 컨테이너 + Redis HA 클러스터)',
            status: 'warning',
            detail: 'BFF 전담 Node/Go 서버 오토스케일링 및 고가용성 Redis Sentinel/Cluster 인프라 구축과 모니터링 필요.'
          }
        }
      }
    ],
    decisionGuide: [
      {
        condition: '전자금융거래법, ISMS-P 등 강력한 보안 규제나 개인 식별 정보(PII)를 다루는 서비스',
        recommendation: 'BFF 패턴 필수 채택',
        reason: '브라우저에 토큰을 노출하지 않는 정책과 즉각적인 세션 만료(Kill Switch)가 규정 준수에 필수적입니다.'
      },
      {
        condition: '초기 스타트업의 신속한 MVP 검증 또는 개발 리소스가 프론트엔드 위주일 때',
        recommendation: 'SPA + PKCE 직접 연동 권장',
        reason: '인프라 비용과 백엔드 운영 부담 없이 가장 빠른 속도로 OIDC 표준 로그인을 구현할 수 있습니다.'
      },
      {
        condition: 'Next.js, Remix, Nuxt.js 등 풀스택 SSR 프레임워크를 이미 도입 중인 경우',
        recommendation: 'Next.js Route Handler / Server Actions를 BFF로 활용',
        reason: '별도의 추가 서버 없이 프론트엔드 프레임워크의 서버 런타임을 자연스럽게 BFF 레이어로 승격할 수 있습니다.'
      }
    ]
  },
  {
    id: 'xss-vs-csrf',
    title: 'XSS (크로스 사이트 스크립팅) vs CSRF (사이트 간 요청 위조)',
    subtitle: '공격 원리와 침해 범위의 근본적 차이 및 프론트/백엔드 실무 방어 전략',
    category: 'Security Comparison',
    subjects: [
      {
        id: 'xss-attack',
        name: 'XSS (Cross-Site Scripting)',
        tag: 'Script Execution Vulnerability',
        iconName: 'AlertOctagon',
        recommendedFor: '웹 UI 전반의 렌더링 파이프라인, 에디터 및 사용자 입력 폼',
        description: '공격자가 신뢰받는 웹사이트에 악의적인 스크립트를 삽입하여 사용자의 브라우저 컨텍스트 내에서 실행되게 만드는 공격'
      },
      {
        id: 'csrf-attack',
        name: 'CSRF (Cross-Site Request Forgery)',
        tag: 'Request Impersonation Vulnerability',
        iconName: 'ShieldAlert',
        recommendedFor: '쿠키 기반 인증을 사용하는 모든 상태 변경 API (POST, PUT, DELETE)',
        description: '사용자가 로그인된 세션을 가진 상태에서 공격자가 만든 피싱 페이지를 통해 사용자의 의지와 무관하게 위조된 요청을 서버로 보내는 공격'
      }
    ],
    dimensions: [
      {
        key: 'attack-mechanism',
        name: '공격의 핵심 메커니즘',
        description: '공격이 실현되는 근본적인 원리와 트리거',
        values: {
          'xss-attack': {
            text: '사용자 입력값을 신뢰하여 브라우저가 스크립트로 파싱/실행',
            status: 'negative',
            detail: 'HTML 태그 미이스케이프, eval(), dangerouslySetInnerHTML 등을 통해 악성 JS가 실행됩니다.'
          },
          'csrf-attack': {
            text: '브라우저가 대상 도메인으로 요청 시 쿠키를 무조건 자동 첨부하는 특성 악용',
            status: 'negative',
            detail: '공격자의 가짜 웹사이트에서 피해자의 은행/서비스 API로 폼을 자동 전송(Form Auto-Submit)합니다.'
          }
        }
      },
      {
        key: 'attacker-capability',
        name: '공격자의 권한 및 침해 범위',
        description: '공격이 성공했을 때 공격자가 획득하는 통제 수준',
        values: {
          'xss-attack': {
            text: 'DOM, 스토리지, 세션 완전 장악 (최고 위험도)',
            status: 'negative',
            detail: 'localStorage 덤프, 키로깅, 사용자 대신 화면 조작, 임의의 API 호출 등 클라이언트 상의 모든 행동 가능.'
          },
          'csrf-attack': {
            text: '서버 상태 변경만 강제 (응답 본문은 SOP로 열람 불가)',
            status: 'warning',
            detail: '비밀번호 변경, 송금 등의 명령을 강제하지만, 동일 출처 정책(SOP)으로 인해 응답 결과 데이터는 읽지 못함.'
          }
        }
      },
      {
        key: 'target-credential',
        name: '공격 대상이 되는 인증 정보',
        description: '공격자가 목표로 삼는 크레덴셜 형태',
        values: {
          'xss-attack': {
            text: 'localStorage/세션 내의 JWT, API 키, DOM 내부 정보',
            status: 'warning',
            detail: '자바스크립트로 접근 가능한 모든 토큰과 비밀값이 즉시 도난당합니다.'
          },
          'csrf-attack': {
            text: '브라우저에 저장된 세션 쿠키 (HttpOnly 쿠키 포함)',
            status: 'warning',
            detail: '공격자가 쿠키 값을 직접 보지는 못하지만, 브라우저가 알아서 쿠키를 실어 날라주므로 공격이 성립합니다.'
          }
        }
      },
      {
        key: 'frontend-defense',
        name: '프론트엔드 핵심 방어 기법',
        description: 'UI/클라이언트 레이어에서 반드시 구축해야 할 수칙',
        values: {
          'xss-attack': {
            text: '컨텍스트 이스케이프 + DOMPurify + 토큰 메모리 격리',
            status: 'positive',
            detail: 'React JSX의 기본 텍스트 바인딩 신뢰, 위험한 HTML 삽입 시 살균, 민감 토큰은 절대 localStorage에 금지.'
          },
          'csrf-attack': {
            text: '커스텀 헤더 주입 (X-XSRF-TOKEN 등)',
            status: 'positive',
            detail: '모든 상태 변경 API 호출 시 자바스크립트로 CSRF 방어 토큰을 Authorization/X-XSRF-TOKEN 헤더에 동봉.'
          }
        }
      },
      {
        key: 'backend-defense',
        name: '백엔드/인프라 핵심 방어 기법',
        description: '서버 및 HTTP 응답 헤더 차원에서 강제해야 할 정책',
        values: {
          'xss-attack': {
            text: "Content-Security-Policy (CSP) & HttpOnly 쿠키",
            status: 'positive',
            detail: "엄격한 CSP 헤더로 외부 인라인 스크립트 차단, 세션 쿠키에 HttpOnly를 걸어 JS 접근을 차단."
          },
          'csrf-attack': {
            text: 'SameSite=Lax/Strict 쿠키 & 서버 측 CSRF 토큰 일치 검증',
            status: 'positive',
            detail: '서드파티 사이트로부터의 교차 요청 시 브라우저가 쿠키를 보내지 않도록 차단하고, 헤더 토큰을 대조.'
          }
        }
      }
    ],
    decisionGuide: [
      {
        condition: 'XSS와 CSRF 중 무엇을 먼저 막아야 하는가?',
        recommendation: 'XSS 방어가 무조건 최우선 선결 과제입니다.',
        reason: 'XSS가 뚫려서 악성 자바스크립트가 브라우저 내에서 실행되면, CSRF 토큰을 DOM에서 직접 탈취하여 CSRF 방어선까지 무력화할 수 있기 때문입니다.'
      },
      {
        condition: 'BFF나 쿠키 기반 아키텍처를 도입할 때 가장 핵심적인 CSRF 방어 조합은?',
        recommendation: 'SameSite=Lax 쿠키 속성 + Double Submit Cookie(X-XSRF-TOKEN) 결합',
        reason: '모던 브라우저의 기본 SameSite 보호망 위에, 구형 브라우저 및 정밀 상태 변경 요청 검증을 이중으로 방어할 수 있습니다.'
      }
    ]
  },
  {
    id: 'iam-solutions',
    title: '글로벌 오픈소스 IAM 솔루션 심층 비교',
    subtitle: 'Keycloak, authentik, ZITADEL, Ory Kratos의 아키텍처 특성과 엔지니어링 고려사항',
    category: 'IAM Comparison',
    subjects: [
      {
        id: 'keycloak',
        name: 'Keycloak (Red Hat)',
        tag: 'Enterprise Standard (Java/Quarkus)',
        iconName: 'Shield',
        recommendedFor: '대기업/엔터프라이즈, 기존 LDAP/Active Directory 연동, 완벽한 SAML2/OIDC 풀스택 지원 필요 시',
        description: 'CNCF 및 Red Hat이 주도하는 사실상 오픈소스 IAM의 절대 표준. 풍부한 기능, 강력한 RBAC/ABAC, Infinispan 분산 세션 내장.'
      },
      {
        id: 'authentik',
        name: 'authentik',
        tag: 'Modern & Flexible (Python/Go)',
        iconName: 'Layers',
        recommendedFor: '스타트업, 세련된 웹 관리자 UI 필요 시, 직관적인 Flow/Stage 기반 커스텀 파이프라인 구축 시',
        description: '현대적인 UI와 유연한 Execution Flow/Stage 개념을 제공하여 빠른 온보딩과 모던 인프라 친화성을 갖춘 급성장 IAM.'
      },
      {
        id: 'zitadel',
        name: 'ZITADEL',
        tag: 'Cloud Native & Multi-Tenant (Go)',
        iconName: 'Cloud',
        recommendedFor: 'B2B SaaS 멀티테넌시, 쿠버네티스 네이티브 Go 스택, 이벤트 소싱 아키텍처 선호 조직',
        description: 'Go 언어로 작성된 경량 클라우드 네이티브 IAM. 강력한 B2B 조직(Organization) 분리와 감사 이벤트를 기본 제공.'
      },
      {
        id: 'ory-kratos',
        name: 'Ory (Kratos & Hydra)',
        tag: 'Headless / API-First (Go)',
        iconName: 'Terminal',
        recommendedFor: '100% 자체 커스텀 브랜딩 UI, 제로 프론트엔드 오버헤드, 마이크로서비스 헤드리스 인증 구성 시',
        description: 'UI를 전혀 제공하지 않는 순수 API-First 헤드리스 IAM. 완벽한 커스텀 UI 자유도와 초경량 Go 바이너리 제공.'
      }
    ],
    dimensions: [
      {
        key: 'runtime-tech',
        name: '기술 스택 및 런타임',
        description: '서버 구동 언어 및 프레임워크',
        values: {
          'keycloak': { text: 'Java 21 / Quarkus', status: 'neutral', detail: 'Quarkus 전환으로 부팅 속도 대폭 개선, 메모리 500MB~1GB 필요' },
          'authentik': { text: 'Python (Django) + Go Proxy', status: 'neutral', detail: 'Worker + Server 분리 구조, PostgreSQL + Redis 기반' },
          'zitadel': { text: 'Pure Go', status: 'positive', detail: '단일 Go 바이너리로 실행되며 메모리 점유율이 100MB 미만으로 매우 가벼움' },
          'ory-kratos': { text: 'Pure Go (Micro-binaries)', status: 'positive', detail: 'Kratos(인증), Hydra(OAuth2) 등 도메인별 초경량 Go 모듈' }
        }
      },
      {
        key: 'clustering-session',
        name: '클러스터링 및 세션 동기화',
        description: '멀티 인스턴스 HA 환경에서의 세션 관리 방식',
        values: {
          'keycloak': { text: '내장 Infinispan 분산 캐시', status: 'positive', detail: 'JGroups 기반 노드 자동 디스커버리 및 크로스 DC 복제 지원' },
          'authentik': { text: 'Redis 캐시 + PostgreSQL DB', status: 'neutral', detail: '표준 Redis 클러스터로 세션 및 작업 큐를 공유' },
          'zitadel': { text: 'CockroachDB / PostgreSQL 이벤트 소싱', status: 'positive', detail: '분산 SQL DB 기반 이벤트 소싱으로 무결성 보장' },
          'ory-kratos': { text: 'RDBMS (PostgreSQL / MySQL)', status: 'neutral', detail: '무상태 노드들이 중앙 RDBMS를 공유하여 세션 질의' }
        }
      },
      {
        key: 'b2b-multitenancy',
        name: 'B2B 멀티테넌시(조직 분리) 지원',
        description: '기업 고객별 도메인, 브랜딩, IdP 격리 기능',
        values: {
          'keycloak': { text: 'Realm 단위 물리적 격리', status: 'positive', detail: '각 Realm이 완벽히 독립된 가상 IAM처럼 동작' },
          'authentik': { text: 'Brand & Tenant 설정', status: 'neutral', detail: '도메인 기반 테넌트 분리 및 조직 플로우 분기 지원' },
          'zitadel': { text: 'Organization 네이티브 설계', status: 'positive', detail: '처음부터 B2B SaaS 멀티테넌시를 최우선으로 설계' },
          'ory-kratos': { text: '애플리케이션 레이어 직접 구현', status: 'warning', detail: '헤드리스 특성상 조직 분리 로직을 서비스 레벨에서 조합해야 함' }
        }
      }
    ],
    decisionGuide: [
      {
        condition: '사내 레거시 시스템(LDAP, Active Directory)과 복합 SSO를 해야 하는 전사 IAM 구축',
        recommendation: 'Keycloak 선택',
        reason: '수십 년간 축적된 엔터프라이즈 커넥터와 성숙한 레퍼런스를 보유하고 있습니다.'
      },
      {
        condition: 'B2B SaaS 프로덕트에 고객사별 SSO/SAML2 연동 기능을 빠르게 탑재하고 싶을 때',
        recommendation: 'ZITADEL 선택',
        reason: 'Organization 개념이 내장되어 있어 멀티테넌트 B2B IAM을 가장 직관적으로 풀어나갈 수 있습니다.'
      },
      {
        condition: '자체 디자인 시스템에 100% 일치하는 완전한 커스텀 UI 화면을 프론트엔드가 주도하고 싶을 때',
        recommendation: 'Ory Kratos 선택',
        reason: '헤드리스 API-First 방식으로 프론트엔드가 로그인 폼을 완전히 제어할 수 있습니다.'
      }
    ]
  }
];
