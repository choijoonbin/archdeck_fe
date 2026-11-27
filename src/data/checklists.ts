import { ChecklistItem } from '../types';

export const initialChecklists: ChecklistItem[] = [
  {
    id: 'chk-xss-1',
    category: 'XSS Defense',
    title: 'Access/Refresh Token의 localStorage 저장 완전 금지',
    description: '브라우저의 localStorage나 sessionStorage에 토큰을 저장하면 단 한 번의 XSS 취약점으로도 모든 인증 정보가 공격자 C2 서버로 즉시 탈취됩니다.',
    priority: 'CRITICAL',
    verificationMethod: '개발자 도구 Application > Local Storage 탭을 확인하여 id_token, access_token, refresh_token 키가 영구 저장되지 않고 메모리나 HttpOnly 쿠키로 유지되는지 검증.',
    codeExample: `// ❌ 절대 금지:
localStorage.setItem('access_token', token);

//  권장 (인메모리 클로저 또는 React Context):
authStore.setTokenInMemory(token);`,
    relatedTermIds: ['xss', 'pkce']
  },
  {
    id: 'chk-xss-2',
    category: 'XSS Defense',
    title: 'Content-Security-Policy (CSP) Level 3 헤더 강제 적용',
    description: "인라인 스크립트 실행과 신뢰되지 않은 외부 스크립트 로드를 브라우저 엔진 차원에서 원천 차단합니다. 'unsafe-inline'과 'unsafe-eval'을 허용하지 마십시오.",
    priority: 'HIGH',
    verificationMethod: "curl -I https://your-domain.io 명령으로 응답 헤더에 Content-Security-Policy가 올바르게 설정되어 있는지 점검.",
    codeExample: `// Nginx 또는 Cloudflare 헤더 설정:
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-random123'; object-src 'none'; base-uri 'self';" always;`,
    relatedTermIds: ['xss']
  },
  {
    id: 'chk-csrf-1',
    category: 'CSRF Defense',
    title: '모든 인증/세션 쿠키에 SameSite 속성 및 __Host- 접두사 적용',
    description: 'SameSite=Lax 또는 Strict를 지정하여 서드파티 사이트에서의 위조 요청 시 쿠키가 전송되지 않도록 강제하고, __Host- 프리픽스로 서브도메인 조작을 방어합니다.',
    priority: 'CRITICAL',
    verificationMethod: 'Set-Cookie 응답 헤더에 SameSite=Lax (또는 Strict), Secure, HttpOnly, Path=/ 가 빠짐없이 존재하는지 확인.',
    codeExample: `// Express 쿠키 설정:
res.cookie('__Host-ArchSession', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: 7200000
});`,
    relatedTermIds: ['csrf', 'token-relay']
  },
  {
    id: 'chk-csrf-2',
    category: 'CSRF Defense',
    title: '상태 변경 API(POST, PUT, DELETE)에 CSRF 토큰(Double Submit) 헤더 검증 강제',
    description: '프론트엔드가 요청 시 X-XSRF-TOKEN 커스텀 헤더를 동봉하게 하고, 서버에서 일치 여부를 검증하여 쿠키 자동 첨부 공격을 완전히 무력화합니다.',
    priority: 'HIGH',
    verificationMethod: 'Postman이나 피싱 모의 페이지에서 쿠키만 보내고 커스텀 헤더를 누락했을 때 403 Forbidden 응답이 반환되는지 확인.',
    codeExample: `// Axios 글로벌 헤더 설정:
axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';`,
    relatedTermIds: ['csrf']
  },
  {
    id: 'chk-pkce-1',
    category: 'OIDC & Token',
    title: 'PKCE S256 해시 알고리즘 강제 및 Plain 모드 비활성화',
    description: 'Public Client에서 인가 코드를 교환할 때 반드시 암호학적 해시(S256)를 사용해야 하며, 평문 verifier를 사용하는 Plain 방식은 인증 서버 설정에서 차단해야 합니다.',
    priority: 'CRITICAL',
    verificationMethod: 'Keycloak Client Settings > Advanced > Proof Key for Code Exchange Code Challenge Method가 S256으로 설정되어 있는지 확인.',
    codeExample: `// 인가 요청 쿼리 파라미터 점검:
&code_challenge_method=S256
&code_challenge=E9Mel-2VzpWAHgzBQN56_...`,
    relatedTermIds: ['pkce', 'client-types']
  },
  {
    id: 'chk-pkce-2',
    category: 'OIDC & Token',
    title: 'Refresh Token Rotation (RTR) 및 일회용 재사용 감지 활성화',
    description: '토큰 갱신 시마다 새 Refresh Token을 발행하고 구버전 토큰 재사용 시 해당 클라이언트의 모든 세션을 즉시 무효화하여 토큰 복제 공격을 무력화합니다.',
    priority: 'HIGH',
    verificationMethod: '동일한 Refresh Token으로 두 번 /token 엔드포인트를 호출했을 때 두 번째 호출에서 400 Bad Request 및 전체 세션 파기가 일어나는지 테스트.',
    codeExample: `// Keycloak Realm Settings > Tokens:
Revoke Refresh Token: ON
Refresh Token Max Reuse: 0 (재사용 불허)`,
    relatedTermIds: ['token-rotation', 'stateless-infinispan']
  },
  {
    id: 'chk-bff-1',
    category: 'BFF & Session',
    title: 'BFF 세션 스토어(Redis) 고가용성(HA) 및 Sentinel/클러스터 이중화',
    description: 'BFF가 세션 기반으로 동작하므로 Redis 단일 장애점(SPOF)이 발생하지 않도록 마스터-슬레이브 복제 및 자동 페일오버(Sentinel/Cluster)를 반드시 구성해야 합니다.',
    priority: 'HIGH',
    verificationMethod: 'Redis 마스터 노드를 강제 종료했을 때 3초 이내에 슬레이브가 마스터로 승격되고 로그인 세션이 유실되지 않는지 점검.',
    codeExample: `// IORedis Sentinel 연결 구성:
const redis = new Redis({
  sentinels: [{ host: 'redis-s1', port: 26379 }, { host: 'redis-s2', port: 26379 }],
  name: 'mymaster',
  password: process.env.REDIS_PASSWORD
});`,
    relatedTermIds: ['token-relay', 'stateless-infinispan', 'kill-switch']
  },
  {
    id: 'chk-bff-2',
    category: 'BFF & Session',
    title: '이상 징후 발생 시 실시간 세션 만료 킬 스위치 (Kill Switch) 파이프라인 검증',
    description: '보안 침해 계정이나 퇴사자 발생 시 Keycloak 백채널 로그아웃 웹훅 또는 관리자 API를 통해 Redis의 해당 유저 활성 세션을 1초 이내에 파기할 수 있어야 합니다.',
    priority: 'CRITICAL',
    verificationMethod: 'BFF의 /api/admin/kill-switch/:userId 엔드포인트 호출 즉시 해당 유저의 기존 쿠키 요청이 401 Unauthorized로 거부되는지 확인.',
    codeExample: `// O(1) 원격 파기 실행:
await redis.del(\`session:\${targetSessionId}\`);`,
    relatedTermIds: ['kill-switch', 'back-channel']
  },
  {
    id: 'chk-iam-1',
    category: 'Infra & IAM',
    title: '백엔드 마이크로서비스의 JWKS 공개키 로컬 캐싱 및 서명 무상태 검증',
    description: '리소스 서버가 토큰 검증을 위해 매번 Keycloak을 호출하지 않고, 사전에 캐시된 JWKS 공개키로 RS256/ES256 서명을 자체 검증하여 무상태 고속 처리를 유지해야 합니다.',
    priority: 'HIGH',
    verificationMethod: 'Keycloak 네트워크를 일시적으로 차단한 상태에서도 이미 발급된 유효한 JWT를 가진 API 호출이 로컬 검증을 거쳐 정상 처리되는지 확인.',
    codeExample: `// JWKS 캐시 TTL 및 서명 알고리즘 RS256 강제:
jwksClient({ jwksUri: '.../certs', cache: true, cacheMaxAge: 600000 });`,
    relatedTermIds: ['jwks', 'stateless-infinispan']
  }
];
