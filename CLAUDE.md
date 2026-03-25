# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

강사 관리 CRM - 강사 정보를 등록·수정·조회하고 현황을 대시보드로 파악하는 관리자 시스템. **Convex 백엔드 연동** (인증, CRUD, 파일 스토리지 포함).

## 명령어

```bash
npm run dev      # 개발 서버 (Vite)
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run preview  # 빌드 결과 미리보기
```

타입 체크만 실행: `npx tsc -b`

## 기술 스택

- React 19 + Vite 6 + TypeScript (strict mode)
- **Convex** (백엔드, 인증, 파일 스토리지)
- @convex-dev/auth (이메일/비밀번호 인증)
- Tailwind CSS 3 + shadcn/ui (Radix UI 기반)
- Recharts (차트), react-hook-form (폼), react-router-dom v7 (라우팅)
- Lucide React (아이콘)
- `@` path alias → `./src/` (vite.config.ts + tsconfig.app.json)

## 아키텍처

### 라우팅 (`src/App.tsx`)

- `PublicRoute` 래퍼: `/login`, `/signup` — 인증 상태면 홈(`/`)으로 리다이렉트
- `ProtectedRoute` + `Layout` 래퍼: `/` (대시보드), `/instructors` (리스트), `/instructors/new` (생성), `/instructors/:id/edit` (수정), `/fields` (분야 관리), `/grades` (등급 관리) — 미인증 시 로그인으로 리다이렉트

### 레이아웃 구조

- `Layout.tsx` — 68px 아이콘 사이드바 (`Sidebar.tsx`) + 상단 헤더바 + `<Outlet />`
- 인증 페이지는 좌측 브랜딩 + 우측 폼 분할 레이아웃

### 백엔드 (`convex/`)

- `schema.ts` — DB 스키마 (instructors, fields, grades, regions + authTables)
- `instructors.ts` — 강사 CRUD (list, getById, stats, create, update, remove)
- `fields.ts`, `grades.ts`, `regions.ts` — 분야/등급/지역 CRUD
- `files.ts` — Convex 파일 스토리지 (프로필 이미지, 이력서 등)
- `seed.ts` — 기초 데이터 시드 (분야 30개, 지역 17개, 등급 4개). `npx convex run seed:run`
- `auth.ts`, `auth.config.ts` — @convex-dev/auth 이메일/비밀번호 인증 설정

### 프론트엔드 데이터 (`src/data/`)

- `constants.ts` — `GRADE_LABELS`, `GRADE_COLORS`, `BANKS`, `GENDERS` 등 UI용 상수
- `types.ts` — 프론트엔드 타입 정의

### UI 컴포넌트 (`src/components/ui/`)

shadcn/ui 패턴으로 작성된 컴포넌트. `cn()` 유틸리티(`src/lib/utils.ts`)로 클래스 병합. 새 UI 컴포넌트 추가 시 동일 패턴(forwardRef, cn, cva) 따를 것.

### 디자인 토큰

- Primary color: teal-600 (`--primary: 172 65% 36%`)
- 사이드바: `hsl(215, 28%, 17%)`
- CSS 변수: `src/index.css`의 `:root`
- 폰트: Inter

### 주요 공유 컴포넌트

- `InstructorForm.tsx` — 강사 생성/수정 공통 폼. `mode: "create" | "edit"` + `defaultValues?` props.
- `Sidebar.tsx` — `navigation` 배열에 메뉴 추가 시 아이콘+href+name 객체 추가. Radix Tooltip 사용.

## 컨벤션

- 페이지 컴포넌트: `src/pages/XxxPage.tsx` (default export)
- 상태 관리: Convex useQuery/useMutation + React useState/useMemo
- CRUD는 Convex mutation/query로 처리 (실시간 반영)
- 인증: `useConvexAuth()` (인증 상태), `useAuthActions()` (로그인/로그아웃)
- 한국어 UI (라벨, 플레이스홀더, 메시지 모두 한국어)

## QA
- agent-brower 통해서 실행
- github: https://github.com/vercel-labs/agent-browser
- 예시
1. agent-browser open example.com
2. agent-browser snapshot                    # Get accessibility tree with refs
3. agent-browser click @e2                   # Click by ref from snapshot
4. agent-browser fill @e3 "test@example.com" # Fill by ref
5. agent-browser get text @e1                # Get text by ref
6. agent-browser screenshot page.png
7. agent-browser close