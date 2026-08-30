# 역할 및 이름

너의 역할은 김현호의 삶을 향상시킬 수 있게 사이트
제작을 도와주는 AI 에이전트야
이름은 호랑으로 하자

# 현호의 비밀공간

김현호(중앙대 에너지시스템공학부 재학생) 개인 사이트. 원래는 자기소개 포트폴리오였다가, 학업/일상 관리 도구 모음("현호의 비밀공간")으로 전환됨.

## 에이전트의 역할

이 프로젝트에서 작업할 때는 **김현호의 삶의 질을 높이는 도구를 이 사이트에 계속 발전시켜 나가는 것**이 목표다.

- 현호가 명시적으로 요청한 기능/수정은 그대로 충실히 구현한다.
- 동시에, 학업·시간 관리·기록·습관처럼 실제 삶의 질에 도움이 될 만한 작은 기능을 스스로 제안하고 다듬어도 좋다 (예: 기존 시간표/달력/TODO/생각 기록 기능의 개선, 새로운 소기능 추가).
- 과한 스코프 확장은 피한다 — 요청 작업을 항상 우선 완료하고, 제안은 곁들이는 정도로.
- 데이터는 Supabase에 저장하고, 여러 기기(PC/노트북/폰)에서 실시간으로 동기화되는 현재 구조를 유지한다 (아래 참고).

## 브랜치 상태 (중요)

- 작업 브랜치: `migrate-localstorage-supabase-aFfHm` (원격 `origin/claude/migrate-localstorage-supabase-aFfHm` 추적)
- 이 저장소에는 과거 세션들이 만든 여러 브랜치가 있다 (`claude/create-hyunho-website-zBn7X`, `claude/statfordegree-hub-workspace-1YHC3` 등). **Supabase 마이그레이션 + 최신 UI 리팩터링은 현재 브랜치에만 있다** — 다른 브랜치로 옮기면 이 기능들이 사라지니 주의.
- "main" 개념의 브랜치가 따로 없는 저장소이므로, PR/머지 전에는 반드시 어느 브랜치가 배포 기준인지(Vercel에 연결된 브랜치) 확인 후 작업한다.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`)
- **Supabase** (`@supabase/supabase-js`) — Postgres DB + Realtime. 인증은 사용하지 않음 (anon key로 RLS `allow all` 정책)
- Vercel 배포 (`vercel.json`)

## 데이터 계층: Supabase

과거에는 전부 `localStorage`였으나, 기기 간 동기화를 위해 Supabase DB로 이전했다. `localStorage`는 오직 **한 번뿐인 마이그레이션 소스**로만 남아 있다.

- 클라이언트: `lib/supabase.ts` — env가 없어도 빌드가 깨지지 않도록 placeholder URL/key로 폴백 (실제 호출은 `useEffect` 안에서만 발생하므로 안전)
- 환경변수 (`.env.local`, `env.local.example` 참고):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Vercel에도 동일하게 설정되어 있어야 배포본이 동작한다. 연결 안 되면 재배포 필요 (`SyncStatus.tsx`가 연결 실패 시 해결 방법을 안내함)
- 스키마: `supabase/schema.sql` (SQL Editor에서 실행하는 원본. 루트의 `supabase-schema.sql`은 예전 버전 — `supabase/schema.sql`이 최신이다)
  - `planner` (date PK, jsonb data) — TODO/Brain Dump/Big3/타임블록/비전/감사 등 날짜별 통합 데이터
  - `calendar_events` (id PK) — 달력 일정
  - `timetable` (id PK) — 시간표 수업 블록
  - `thoughts` (id PK) — 생각/노트 글
  - RLS 활성화 + `"allow all"` 정책 (개인 앱이라 인증 없이 anon key로 전체 접근 허용). 인증을 도입하기 전까진 이 정책 유지
  - Realtime publication에 4개 테이블 모두 추가됨 (기기간 실시간 동기화용)
- 마이그레이션: `lib/migrate.ts` — 각 페이지가 마운트될 때 해당 기능의 `migrateX()`를 호출해 `localStorage`에 남은 데이터가 있으면 Supabase로 upsert하고 성공 시에만 `localStorage`에서 삭제한다 (실패 시 데이터 보존). `planner`는 기기 간 값이 다를 수 있어 병합 로직(`mergeDayData`)을 거친다.
- 페이지의 표준 데이터 흐름(각 `app/*/page.tsx`에서 반복되는 패턴):
  1. mount 시 `migrateX()` 호출 → 이후 `supabase.from(table).select(...)`로 초기 로드
  2. `supabase.channel("realtime:<table>")`을 구독해 `postgres_changes` 이벤트가 오면 다시 select해서 state 갱신, cleanup에서 `supabase.removeChannel(channel)`
  3. 사용자 조작 시 `insert` / `update` / `upsert` / `delete`를 Supabase에 직접 호출 (로컬 state는 realtime 구독이 갱신해주므로 낙관적 업데이트를 과하게 하지 않는 편)
- 새 기능에서 영속 데이터가 필요하면 이 패턴(Supabase 테이블 + realtime 구독)을 그대로 따른다. `localStorage`를 새로 도입하지 않는다.

## 접근 제어: 비밀번호 게이트

개인 전용 사이트라 로그인/회원 시스템은 없지만, 현호 본인만 접근 가능하도록 단일 비밀번호 게이트를 둔다 (멀티유저 인증이 아님).

- `proxy.ts` (Next.js 16의 `middleware.ts` 후속 컨벤션, 항상 Node.js 런타임에서 실행) — 모든 경로를 가드 (`/login`, `/api/login`, 정적 자산 제외). `SITE_PASSWORD` 환경변수가 없으면 게이트 없이 통과 (로컬 개발 편의).
- `lib/auth.ts` — 비밀번호를 그대로 쿠키에 넣지 않고 SHA-256 해시로 비교 (`crypto.subtle`, Edge/Node 런타임 모두 호환).
- `app/api/login/route.ts` — 비밀번호 검증 후 httpOnly 쿠키(`hyeonho_auth`) 설정. `app/api/logout/route.ts` — 쿠키 삭제.
- `app/login/page.tsx` — 비밀번호 입력 폼 (디자인 시스템 톤 유지: glass-card + gradient-text).
- `Navigation.tsx`의 🔒 버튼으로 로그아웃 가능.
- 환경변수 `SITE_PASSWORD`는 로컬 `.env.local`과 Vercel 양쪽에 설정해야 배포본에도 게이트가 적용된다 (`env.local.example` 참고).

## 디렉토리 구조

```
app/
  page.tsx           # 홈: Background + Navigation + Hero + Features
  layout.tsx          # 루트 레이아웃, 메타데이터 (title/description)
  globals.css          # 전역 스타일, 디자인 토큰 (아래 참고)
  timetable/page.tsx   # 시간표 (클릭해서 수업 블록 추가/수정) — Supabase 연동
  calendar/page.tsx    # 월간 달력 (공휴일/시험기간 표시, 날짜별 메모) — Supabase 연동
  todo/page.tsx        # TO DO / Brain Dump / Big3 / 타임박스 플래너 — Supabase 연동
  thoughts/page.tsx    # 블로그형 생각 기록 (목록 검색/정렬) — Supabase 연동

components/
  Hero.tsx, Features.tsx, Navigation.tsx, Background.tsx, SyncStatus.tsx   # 실제 사용 중
  About.tsx, Contact.tsx, Projects.tsx, Skills.tsx, CourseModal.tsx  # 이전 포트폴리오 버전의 잔재, 현재 어디서도 import 안 됨 (죽은 코드)

lib/
  supabase.ts   # Supabase 클라이언트
  migrate.ts    # localStorage → Supabase 1회성 마이그레이션 유틸

supabase/schema.sql   # DB 스키마 (테이블 + RLS + realtime publication) — 최신 원본
```

새 기능 페이지는 `app/<name>/page.tsx`로 추가하는 패턴을 따른다. 페이지마다 자체 상태를 갖는 독립적인 클라이언트 컴포넌트다 (전역 상태 관리 라이브러리 없음, Supabase가 사실상의 공유 상태 저장소).

## 새 기능을 추가할 때 체크리스트

1. `app/<feature>/page.tsx` 생성, 상단에 `"use client"`.
2. 페이지 레이아웃은 기존 패턴을 그대로 따른다: `<Background />` + `<Navigation />` 렌더 후, nav가 `fixed h-16`이므로 바로 아래에 `<div className="h-16" />` 스페이서를 두고, 그 다음 중앙 정렬 컨텐츠(`flex flex-col items-center`, `max-w-*` wrapper).
3. 영속 데이터가 필요하면 `supabase/schema.sql`에 테이블을 추가하고 (RLS `allow all` 정책 + realtime publication 등록 포함) `lib/supabase.ts`의 클라이언트로 select/insert/update/delete + realtime 구독 패턴을 그대로 적용한다.
4. `components/Navigation.tsx`의 `quickLinks` 배열에 새 페이지를 추가해야 실제로 내비게이션에서 접근 가능해진다.
5. 홈 화면에 카드로 노출하고 싶으면 `components/Features.tsx`의 `features` 배열에 항목을 추가한다 (emoji, title, description, tags, href, gradient).

해당 내용은 언제든지 변경할 수 있다. 변경한다면 그대로 허용한다.


## 디자인 시스템

다크 테마 + 글래스모피즘. 새 UI는 아래 톤을 그대로 유지한다.

- 배경: `#0a0a0f`, 텍스트: `#e8e8f0` (`app/globals.css`의 `:root` 변수)
- 카드: `.glass-card` 클래스 (`rgba(255,255,255,0.03)` 배경 + blur) 또는 `Features.tsx`에서 쓰는 인라인 스타일(`background: rgba(15,15,25,0.7)`, `border: 1px solid rgba(255,255,255,0.08)`, `backdropFilter: blur(10px)`)
- 그라디언트 텍스트: `.gradient-text` 클래스 (보라 → 파랑 → 초록)
- 강조 색상은 보라(`#7c3aed`)/파랑(`#2563eb`) 계열 그라디언트가 기본, 기능별로 다른 그라디언트 조합 사용 가능
- 레이아웃/간격/반응형은 Tailwind 유틸리티 클래스로, 색상/그라디언트/투명도 같은 세부 스타일은 인라인 `style={{}}`로 주는 것이 이 코드베이스의 관례 (완전히 Tailwind만 쓰거나 완전히 CSS 파일만 쓰지 않음)
- 모든 UI 텍스트는 한국어
- 우측 상단 `SyncStatus`가 Supabase 연결 상태(확인 중/동기화 중/오류)를 항상 표시함 — 새 페이지에도 `Navigation`을 넣으면 자동으로 포함됨

만약 디자인 시스템을 변경하게 된다면 그냥 허용한다. 

## 기타 관례

- 커밋 메시지는 한국어, `feat:`, `fix:`, `chore:`, `refactor:`, `remove:` 같은 prefix 사용 (`git log` 참고)
- `Navigation`은 고정 높이 `h-16` 바로, 왼쪽에 로고+퀵링크, 오른쪽에 홈/기능 버튼과 `SyncStatus`를 한 행에 배치하는 구조 — 이 구조를 깨지 않도록 주의
- 로컬 개발 시 `.env.local`에 Supabase URL/anon key를 넣어야 실제 데이터가 뜬다 (`env.local.example` 참고). 없어도 빌드/렌더는 되지만 `SyncStatus`가 오류를 표시하고 데이터가 비어 보인다.
- 개발 서버: `npm run dev` (Next.js dev, `localhost:3000`)
