# 개발 환경 준비

## 지금 필요한 것
- 설치형 Codex에서 로컬 폴더 접근 및 코드 실행 가능 여부 확인
- Git, 현재 안정적인 Node.js LTS와 선택한 패키지 관리자(기존 lockfile 우선)
- Python 가상환경: AI worker 단계에 준비
- GitHub 저장소: 사용자 지정 실제 URL 사용. 아직 이 앱 저장소는 연결되지 않았다.
- 웹 프로토타입은 Supabase/API 키 없이 시작 가능

## 연동 단계에 필요한 것
- Supabase 프로젝트 URL, 클라이언트 공개 키, 서버용 secret/service-role 키
- 실제 비밀값은 채팅·문서·Git에 적지 말고 로컬 .env 또는 배포 비밀 설정에 저장
- 웹 VITE_* 및 모바일 EXPO_PUBLIC_* 값은 배포 후 노출되는 값임. 서버 비밀키를 넣지 않는다.
- 소셜 로그인 제공자와 redirect URL, 이메일 로그인 사용 시 SMTP 준비
- GPU 기종/VRAM/드라이버/가용 메모리 측정. 특정 모델 실행 가능 여부를 사전 단정하지 않는다.
- Apple/Google/Chrome 개발자 계정, 도메인, 개인정보/지원 페이지는 배포 단계 준비
- iOS 빌드 방식은 macOS/Xcode 또는 지원되는 빌드 서비스와 비용을 확인 후 선택

## 권장 폴더(구현 시 생성)
apps/web, apps/mobile, apps/extension, packages/domain, packages/api, supabase/migrations, services/ai-worker, docs.
새 프로젝트가 아니라면 기존 구조와 충돌하지 않게 조정한다.

## 환경변수 이름 예시(실제 값 없음)
웹: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
모바일: EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
서버/worker 전용: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
현재 SDK/키 체계를 확인해 이름을 확정한다. 이 문서만으로 설정 완료가 되지 않는다.

## Git 제외 대상
.env 및 실제 비밀 설정, node_modules, 빌드 결과, 사용자 업로드, 모델 가중치, 로그, 서명 키, 인증서. .env.example에는 placeholder만 넣는다.
공개 저장소에 디자인 PNG/기획서를 올릴지 사용자 의도를 확인한다. 로컬 기능 개발은 원격 push 없이 가능하다.
