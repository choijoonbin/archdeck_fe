import { GlossaryTerm } from '../types';

export const initialGlossaryTerms: GlossaryTerm[] = [
  {
    id: 'pkce',
    term: 'PKCE',
    koreanName: '작업 코드 교환용 증명 키 (Proof Key for Code Exchange)',
    category: 'Protocol & Spec',
    shortDef: '모바일 앱과 SPA 같은 Public Client에서 인가 코드 가로채기(Authorization Code Interception) 공격을 방지하기 위한 OAuth 2.0 보안 확장 규격(RFC 7636).',
    fullDef: `PKCE(Proof Key for Code Exchange, '픽시'로 발음)는 클라이언트 시크릿(Client Secret)을 안전하게 은닉할 수 없는 브라우저(SPA)나 네이티브 모바일 애플리케이션 환경을 위해 고안된 OAuth 2.0 보안 확장 규격(RFC 7636)입니다.
클라이언트는 인가 요청 시 무작위 문자열 \`code_verifier\`를 생성하고, 이를 SHA-256으로 해싱 및 Base64URL 인코딩한 \`code_challenge\`를 인증 서버에 보냅니다. 이후 인가 코드를 토큰으로 교환하는 백채널 요청 시 원본 \`code_verifier\`를 전송하여, 인가 코드가 중간에 가로채지더라도 verifier가 없으면 토큰을 교환할 수 없도록 강제합니다. 현재 OAuth 2.1에서는 모든 클라이언트 유형에 PKCE 사용이 필수로 지정되었습니다.`,
    keyPoints: [
      'code_verifier: 43~128자의 고엔트로피 암호학적 무작위 문자열',
      'code_challenge: code_verifier를 SHA-256 해시 후 Base64-URL 인코딩 (S256 방식 필수 권장)',
      '클라이언트 시크릿 유출 취약점을 수학적 일회용 암호 검증으로 해결',
      'OAuth 2.1 표준에서는 Public Client뿐 아니라 Confidential Client에도 기본 필수화'
    ],
    specRef: 'RFC 7636 / OAuth 2.1 Draft',
    securityRelevance: 'SPA나 모바일 클라이언트에서 PKCE를 생략하면 악성 앱이나 확장 프로그램에 의해 인가 코드가 가로채져 인증 세션이 완전히 탈취될 수 있습니다. Plain 방식은 절대 금지하고 반드시 S256을 강제해야 합니다.',
    tags: ['OAuth2', 'OIDC', 'RFC7636', 'S256', 'Public Client'],
    relatedTopicIds: ['spa-pkce-direct', 'bff-token-relay', 'spa-vs-bff-comparison']
  },
  {
    id: 'csrf',
    term: 'CSRF',
    koreanName: '사이트 간 요청 위조 (Cross-Site Request Forgery)',
    category: 'Security Attack & Defense',
    shortDef: '사용자가 인증된 세션(쿠키)을 보유한 상태에서, 공격자가 준비한 악성 사이트를 통해 사용자의 권한으로 서버에 원치 않는 위조 요청을 전송하게 만드는 웹 취약점.',
    fullDef: `CSRF(Cross-Site Request Forgery)는 브라우저가 특정 도메인으로 HTTP 요청을 보낼 때 쿠키(Cookie)를 자동으로 동봉하는 메커니즘을 악용하는 공격입니다.
피해자가 은행이나 관리자 사이트에 로그인된 상태에서 공격자가 만든 피싱 웹페이지에 접속하면, 해당 페이지의 숨겨진 스크립트나 폼이 피해자 브라우저로 하여금 '송금'이나 '비밀번호 변경' 같은 치명적인 요청을 은행 서버로 전송하도록 만듭니다. 서버는 요청에 포함된 세션 쿠키만 보고 사용자의 정당한 의도인지 구분하지 못해 요청을 처리하게 됩니다.`,
    keyPoints: [
      '공격 목적: 사용자의 인증된 권한으로 서버 상태 변경(State-Changing) 명령 강제 실행',
      '핵심 원인: 브라우저의 Ambient Credential(요청 시 쿠키 자동 전송 특성)',
      '핵심 방어책: SameSite=Lax/Strict 쿠키 속성, Double Submit Cookie 패턴, X-XSRF-TOKEN 커스텀 헤더 검증',
      'GET 메서드는 순수 조회(Idempotent)로만 사용하고, 상태 변경 요청(POST/PUT/DELETE)에 토큰 검증 적용'
    ],
    specRef: 'OWASP Top 10 A01:2021 / RFC 6265bis',
    securityRelevance: 'BFF 패턴에서 HttpOnly 쿠키 기반 세션을 채택할 경우 CSRF 위험에 노출되므로, 반드시 SameSite 쿠키 정책과 함께 프론트엔드가 요청 헤더에 삽입하는 CSRF Anti-Forgery Token 검증 계층을 구현해야 합니다.',
    tags: ['OWASP', 'Cookie', 'SameSite', 'CSRF Token', 'Security'],
    relatedTopicIds: ['xss-vs-csrf-defense', 'bff-token-relay', 'spa-vs-bff-comparison']
  },
  {
    id: 'xss',
    term: 'XSS',
    koreanName: '크로스 사이트 스크립팅 (Cross-Site Scripting)',
    category: 'Security Attack & Defense',
    shortDef: '검증되지 않은 사용자 입력값이 웹 브라우저 내에서 악성 자바스크립트 코드로 실행되어 세션 탈취, 키로깅, DOM 변조를 유발하는 웹 보안 취약점.',
    fullDef: `XSS(Cross-Site Scripting)는 공격자가 웹 애플리케이션에 악의적인 스크립트를 삽입하여 희생자의 브라우저 컨텍스트 내에서 실행되도록 하는 취약점입니다.
자바스크립트가 실행되는 순간 해당 오리진의 DOM 접근, \`localStorage\` 및 \`sessionStorage\` 내의 민감한 토큰 읽기, 키로깅, 사용자 대신 API 호출 등이 가능해집니다. 저장형(Stored XSS), 반사형(Reflected XSS), DOM 기반(DOM-based XSS)으로 분류됩니다.`,
    keyPoints: [
      '공격 목적: 클라이언트 자바스크립트 실행 권한을 탈취하여 데이터 열람, 토큰 도난, 세션 하이재킹',
      '위협: localStorage/sessionStorage에 저장된 JWT Access/Refresh Token 즉시 탈취 가능',
      '핵심 방어책: 컨텍스트 인지형 자동 HTML 이스케이프(React JSX 기본 제공), 엄격한 CSP(Content Security Policy) 적용, dangerouslySetInnerHTML 지양, DOMPurify 살균',
      '토큰 격리: 토큰을 JS가 읽을 수 없는 메모리 변수에 보관하거나 BFF의 HttpOnly 쿠키로 은닉'
    ],
    specRef: 'OWASP Top 10 A03:2021',
    securityRelevance: 'SPA가 Access Token을 브라우저의 localStorage에 영구 저장하는 순간, 단 한 줄의 XSS 취약점만으로도 인증 자격 증명이 완전히 유출됩니다. 토큰의 인메모리 보관 또는 BFF 쿠키 격리가 필수적인 이유입니다.',
    tags: ['OWASP', 'XSS', 'CSP', 'LocalStorage', 'DOMPurify'],
    relatedTopicIds: ['xss-vs-csrf-defense', 'spa-pkce-direct', 'spa-vs-bff-comparison']
  },
  {
    id: 'jwks',
    term: 'JWKS',
    koreanName: 'JSON 웹 키 집합 (JSON Web Key Set)',
    category: 'Identity & Cryptography',
    shortDef: '인증 서버가 JWT 서명에 사용하는 공개키(Public Key)들을 표준화된 JSON 형식으로 발행하는 엔드포인트 규격(RFC 7517).',
    fullDef: `JWKS(JSON Web Key Set, RFC 7517)는 인증 서버(Keycloak 등)가 비대칭 암호화 키 쌍으로 서명한 JWT(액세스 토큰, ID 토큰)를 백엔드 리소스 서버들이 자체적으로 검증할 수 있도록 공개키 세트를 배포하는 JSON 데이터 구조입니다.
일반적으로 \`/.well-known/openid-configuration\`에서 지정된 \`/protocol/openid-connect/certs\` 엔드포인트를 통해 제공됩니다. 각 키는 \`kid\`(Key ID), \`alg\`(알고리즘: RS256/ES256), \`kty\`(RSA 등), 모듈러스(\`n\`), 지수(\`e\`) 정보를 담고 있어, 백엔드는 인증 서버에 매번 인가 검증 요청을 보내지 않고도 로컬 캐시된 공개키로 무상태(Stateless) 고속 검증을 수행합니다.`,
    keyPoints: [
      'kid(Key ID): 토큰 헤더의 kid와 일치하는 공개키를 찾아 서명 검증 수행',
      '키 로테이션(Key Rotation): 비즈니스 중단 없이 주기적으로 신규 키를 추가하고 구버전 키 폐기 가능',
      '무상태 검증: 백엔드 API 서버가 인증 서버로 네트워크 I/O를 발생시키지 않아 높은 처리량 보장',
      '캐싱 원칙: JWKS를 로컬 메모리에 TTL 캐싱하되, 미인식 kid 발견 시 On-demand 1회 갱신 전략 권장'
    ],
    specRef: 'RFC 7517 / OpenID Connect Core 1.0',
    securityRelevance: '키 갱신 공격을 방지하기 위해 JWKS 재조회 요청에 레이트 리밋(Rate Limit)을 걸어야 하며, 알 수 없는 kid 요청이 쏟아져 인증 서버가 DoS 상태에 빠지지 않도록 백오프 제어가 필수적입니다.',
    tags: ['JWT', 'Crypto', 'RS256', 'Stateless', 'Public Key'],
    relatedTopicIds: ['keycloak-iam-overview', 'spa-pkce-direct', 'bff-token-relay']
  },
  {
    id: 'token-relay',
    term: 'Token Relay',
    koreanName: '토큰 릴레이 (Token Relay Pattern)',
    category: 'Architecture Pattern',
    shortDef: 'BFF(Backend for Frontend)나 API 게이트웨이가 클라이언트의 세션 쿠키를 받아 검증한 뒤, 마이크로서비스 내부 호출 시 실제 JWT Access Token을 Authorization 헤더에 자동 주입해 전달하는 아키텍처 패턴.',
    fullDef: `Token Relay 패턴은 외부 브라우저 클라이언트와 내부 분산 마이크로서비스 간의 인증 모델을 분리 결합하는 패턴입니다.
클라이언트는 보안성이 높은 암호화된 세션 쿠키(\`HttpOnly\`, \`SameSite=Lax\`)만을 BFF로 보냅니다. BFF는 세션 스토어(Redis 등)에서 세션 ID에 바인딩된 원본 JWT Access Token을 꺼낸 다음, 다운스트림 마이크로서비스로 요청을 프록시할 때 \`Authorization: Bearer <JWT>\` 헤더로 자동 주입(Relay)합니다. 이를 통해 브라우저는 원본 JWT를 알 필요가 없고, 내부 마이크로서비스들은 일관된 무상태 JWT 검증 파이프라인을 유지합니다.`,
    keyPoints: [
      '클라이언트 노출 차단: Access Token과 Refresh Token이 브라우저 스크립트에 절대 노출되지 않음',
      'BFF 자동 토큰 갱신: Access Token 만료 임박 시 BFF가 백채널로 IAM과 통신해 Refresh 자동 수행 후 릴레이',
      '마이크로서비스 호환성: 내부 서비스들은 표준 Bearer Token 기반 보안 필터를 그대로 사용',
      '세션-토큰 매핑: 세션 만료나 로그아웃 시 Redis 세션 삭제만으로 모든 하위 토큰 릴레이가 일괄 차단'
    ],
    specRef: 'OAuth 2.0 Token Exchange (RFC 8693) / Spring Cloud Gateway Token Relay',
    securityRelevance: '토큰 유출 가능성을 원천적으로 서버 내부 네트워크 안으로 제한할 수 있습니다. 단, BFF와 내부 서비스 간의 네트워크 구간 암호화(mTLS 또는 VPC 격리)가 뒷받침되어야 합니다.',
    tags: ['BFF', 'Microservices', 'Bearer Token', 'Gateway', 'Security'],
    relatedTopicIds: ['bff-token-relay', 'spa-vs-bff-comparison']
  },
  {
    id: 'back-channel',
    term: 'Back-Channel',
    koreanName: '백채널 통신 (Back-Channel Communication)',
    category: 'Architecture Pattern',
    shortDef: '사용자의 웹 브라우저나 프론트엔드를 거치지 않고 서버 대 서버(Server-to-Server) 간에 직접 암호화된 채널을 통해 민감한 인증 정보를 교환하는 통신 방식.',
    fullDef: `OAuth 2.0 및 OIDC 흐름은 크게 프론트채널(Front-Channel)과 백채널(Back-Channel)로 나뉩니다.
프론트채널은 사용자 브라우저의 리다이렉트(Query string, Form Post)를 경유하는 통신으로, 브라우저 히스토리, Referer 헤더, 브라우저 확장 프로그램 등 공격 표면에 노출될 위험이 큽니다.
반면 백채널은 서버와 서버(예: BFF 서버 ↔ Keycloak 서버) 간에 TLS/HTTPS로 직접 맺어지는 보안 연결입니다. Client Secret 전송, 토큰 발급/갱신(Token Endpoint), 백채널 로그아웃(Back-Channel Logout), 사용자 프로필 조회(UserInfo Endpoint) 등 민감한 작업은 반드시 백채널을 통해 안전하게 처리됩니다.`,
    keyPoints: [
      '프론트채널(Front-Channel): 사용자 브라우저 리다이렉트를 경유 (인가 코드 전달 등)',
      '백채널(Back-Channel): 서버 ↔ 인증 서버 간 직접 TLS 통신 (인가 코드 ↔ 토큰 교환, 토큰 갱신)',
      '보안성: 클라이언트 시크릿(Client Secret)은 오직 백채널에서만 안전하게 사용 가능',
      'Back-Channel Logout: 인증 서버가 세션 만료 시 각 클라이언트 서버의 웹훅을 직접 호출하여 강제 로그아웃'
    ],
    specRef: 'OpenID Connect Back-Channel Logout 1.0 / RFC 6749',
    securityRelevance: '브라우저 환경(SPA)은 백채널을 형성할 수 없으므로 시크릿 저장이 불가능합니다. BFF 패턴은 백채널을 완전히 확보하여 토큰 탈취 가능성을 최소화합니다.',
    tags: ['Security', 'OIDC', 'Server-to-Server', 'TLS', 'Logout'],
    relatedTopicIds: ['bff-token-relay', 'spa-pkce-direct', 'keycloak-iam-overview']
  },
  {
    id: 'client-types',
    term: 'Public vs Confidential Client',
    koreanName: '퍼블릭 클라이언트 vs 컨피덴셜 클라이언트',
    category: 'Protocol & Spec',
    shortDef: 'OAuth 2.0에서 클라이언트가 자격 증명(Client Secret)의 기밀성을 안전하게 보관할 수 있는 물리적/구조적 능력에 따른 핵심 분류.',
    fullDef: `OAuth 2.0(RFC 6749)은 클라이언트를 두 가지 유형으로 엄격히 구분합니다.
1. **Public Client (퍼블릭 클라이언트):**
브라우저 기반 단일 페이지 애플리케이션(SPA), 모바일 앱, 데스크톱 앱 등 사용자의 장치에서 실행되는 클라이언트입니다. 소스 코드가 역컴파일되거나 브라우저 개발자 도구로 노출되므로 \`Client Secret\`을 안전하게 보관할 수 없습니다. 따라서 PKCE 확장이 필수로 요구됩니다.
2. **Confidential Client (컨피덴셜 클라이언트):**
보안이 통제된 백엔드 서버(Node.js, Spring Boot 등)에서 실행되는 웹 애플리케이션입니다. 최종 사용자나 외부 공격자에게 소스 코드 및 환경 변수가 노출되지 않으므로, 고유한 \`Client Secret\` 또는 비대칭 개인키 인증서를 안전하게 보관하고 인증 서버와의 백채널 상호 인증에 활용할 수 있습니다.`,
    keyPoints: [
      'Public Client: SPA (React, Vue), 모바일 앱 → Client Secret 사용 금지, PKCE 필수',
      'Confidential Client: 백엔드 서버, BFF, 전통적인 SSR 웹앱 → Client Secret + PKCE 병행 권장',
      '보안 등급 차이: Confidential Client는 위조가 불가능한 강력한 클라이언트 인증 보장',
      'OAuth 2.1 트렌드: 클라이언트 유형과 관계없이 모든 Authorization Code 흐름에 PKCE 적용 의무화'
    ],
    specRef: 'RFC 6749 Section 2.1 / OAuth 2.1',
    securityRelevance: 'SPA 프론트엔드 환경 변수(.env)에 Client Secret을 하드코딩하는 실수는 매우 치명적입니다. 브라우저로 전송되는 모든 자산은 공개된 것으로 간주해야 합니다.',
    tags: ['OAuth2', 'RFC6749', 'Client Secret', 'Security', 'Architecture'],
    relatedTopicIds: ['spa-pkce-direct', 'bff-token-relay', 'spa-vs-bff-comparison']
  },
  {
    id: 'token-rotation',
    term: 'Refresh Token Rotation',
    koreanName: '리프레시 토큰 로테이션 (RTR)',
    category: 'Protocol & Spec',
    shortDef: '클라이언트가 Refresh Token을 사용해 새 Access Token을 발급받을 때마다, 기존 Refresh Token을 즉시 무효화하고 새로운 Refresh Token을 함께 발급하는 일회용 갱신 메커니즘.',
    fullDef: `Refresh Token Rotation(RTR)은 장기 유효 수명을 갖는 Refresh Token이 도난당했을 때 발생할 수 있는 지속적 세션 탈취 위험을 무력화하기 위한 핵심 보안 기법입니다.
새로운 Access Token을 요청할 때마다 인증 서버는 응답으로 완전히 새로운 Refresh Token을 발행하고 이전 토큰을 즉각 폐기합니다.
만약 공격자가 탈취한 구버전 Refresh Token으로 토큰 발급을 시도하면, 인증 서버는 '이미 소비된 일회용 토큰의 재사용 시도(Reuse Detection)'로 감지하고, 해당 사용자의 모든 세션과 연계된 유효 토큰 체인을 즉각 전체 무효화(Revoke All)합니다.`,
    keyPoints: [
      '일회용(One-time Use) 토큰: 한 번 사용된 Refresh Token은 즉각 블랙리스트 처리 또는 만료',
      '토큰 재사용 감지(Automatic Reuse Detection): 이미 교환된 토큰 재전송 시 공격 발생으로 판단',
      '가족 무효화(Family Revocation): 침해 감지 즉시 연관된 발급 토큰 일체를 자동 파기',
      'SPA 환경의 권장 수칙: Public Client에서는 짧은 수명의 RTR 정책과 브라우저 인메모리 격리가 필수'
    ],
    specRef: 'OAuth 2.0 Security Best Current Practice (BCP) Section 4.14.2',
    securityRelevance: 'RTR이 없는 정적 Refresh Token은 공격자에게 사실상 영구적인 백도어를 제공합니다. RTR과 세션 침해 자동 감지가 결합되어야 최소한의 안전망이 확보됩니다.',
    tags: ['OAuth2', 'Token Rotation', 'Keycloak', 'Security BCP', 'Zero Trust'],
    relatedTopicIds: ['spa-pkce-direct', 'keycloak-iam-overview', 'spa-vs-bff-comparison']
  },
  {
    id: 'stateless-infinispan',
    term: 'Stateless & Infinispan',
    koreanName: '무상태성 및 인피니스팬 클러스터링',
    category: 'Architecture Pattern',
    shortDef: '백엔드 API는 JWT를 이용해 무상태(Stateless)로 수평 확장하고, 인증 서버(Keycloak)는 내장 분산 인메모리 데이터 그리드(Infinispan)로 세션 동기화와 HA를 보장하는 아키텍처.',
    fullDef: `대규모 분산 시스템에서 인증 아키텍처는 무상태성과 상태 저장의 균형을 요구합니다.
1. **무상태(Stateless) 백엔드:**
마이크로서비스나 백엔드 API는 사용자 세션을 DB에 조회하지 않고, JWT 자체에 서명된 Claim과 JWKS 공개키만을 검증하여 무상태로 동작합니다. 이를 통해 수만 대의 컨테이너로 지연 없는 스케일아웃이 가능합니다.
2. **Keycloak & Infinispan 클러스터링:**
하지만 인증 서버 자체는 SSO 세션 정보, 로그인 실패 횟수(Brute force), 인가 코드(Code) 소비 상태 등을 유지해야 합니다. Keycloak은 엔터프라이즈급 오픈소스 분산 캐시 엔진인 Red Hat Infinispan을 기본 내장하여, 여러 Keycloak 노드 간에 교차 복제(Cross-datacenter replication)와 세션 페일오버를 고속으로 처리합니다.`,
    keyPoints: [
      'Resource Server: JWT 무상태 검증을 통해 DB I/O 제로, 무한 수평 확장 달성',
      'IAM Cluster: Keycloak 노드 간 Infinispan 분산 캐시로 실시간 사용자 세션 동기화',
      '고가용성(HA): 특정 Keycloak 파드가 다운되어도 사용자는 재로그인 없이 다른 노드에서 세션 유지',
      '분산 캐시 모드: Distributed(분산 저장) 및 Replicated(전체 복제) 캐시를 적재적소에 배치'
    ],
    specRef: 'Keycloak High Availability Guide / Infinispan Documentation',
    securityRelevance: '인증 서버 단일 장애점(SPOF) 방지를 위해 멀티 AZ에 걸친 Infinispan 클러스터링 구성이 필수적입니다. 무상태 API 서버와 상태 보존 IAM의 조화가 현대 아키텍처의 핵심입니다.',
    tags: ['Keycloak', 'Infinispan', 'Stateless', 'HA', 'Clustering'],
    relatedTopicIds: ['keycloak-iam-overview', 'spa-pkce-direct', 'bff-token-relay']
  },
  {
    id: 'kill-switch',
    term: 'Kill Switch',
    koreanName: '즉시 세션 만료 킬 스위치 (Instant Session Invalidation)',
    category: 'Security Attack & Defense',
    shortDef: '계정 탈취, 이상 징후 감지, 또는 긴급 퇴사 발생 시 분산된 모든 디바이스의 활성 로그인 세션을 1초 이내에 즉각 강제 만료시키는 비상 제어 기능.',
    fullDef: `순수 무상태 JWT 환경의 치명적인 약점은 한 번 발급된 토큰이 유효기간(Exp) 만료 전까지는 중앙에서 즉각 취소(Revoke)하기 어렵다는 점입니다.
BFF 패턴과 중앙 IAM(Keycloak)의 백채널 연동을 활용하면 강력한 'Kill Switch'를 구축할 수 있습니다.
관리자 콘솔이나 보안 관제 시스템에서 킬 스위치를 트리거하면:
1. Keycloak의 활성 SSO 사용자 세션 파기
2. BFF 세션 스토어(Redis)의 세션 키를 즉시 삭제 (\`DEL session:<userId>:*\`)
3. 이후 유입되는 모든 쿠키 요청은 401 Unauthorized로 즉각 차단되며, 마이크로서비스 내부로의 토큰 릴레이가 즉시 동결됩니다.`,
    keyPoints: [
      '순수 JWT의 한계 극복: 만료 시간까지 대기할 필요 없이 즉각적인 중앙 권한 회수 가능',
      'Redis O(1) 원격 폐기: 사용자 ID 기준의 인덱싱된 세션 키 일괄 삭제',
      'Back-Channel Logout 연동: Keycloak에서 관리자가 세션 종료 시 BFF로 웹훅 통지',
      '감사 로그 및 긴급 대응: 비인가 행위 발견 시 보안 운영팀(SOC)의 신속한 방어 조치 지원'
    ],
    specRef: 'OpenID Connect Back-Channel Logout / NIST SP 800-63B',
    securityRelevance: '금융, 핀테크, 엔터프라이즈 환경에서 컴플라이언스(보안 감사)를 통과하기 위한 필수 요건입니다. 순수 SPA+JWT 방식으로는 100% 실시간 킬 스위치 구현이 극도로 어렵습니다.',
    tags: ['Security', 'Redis', 'Session', 'BFF', 'Zero Trust'],
    relatedTopicIds: ['bff-token-relay', 'spa-vs-bff-comparison', 'keycloak-iam-overview']
  }
];
