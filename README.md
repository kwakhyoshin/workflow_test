# Firewall Request System (Pilot)

사내 임직원이 출발지/도착지 IP·포트만 입력하면 CMDB·네트워크 토폴로지를 분석해 **방화벽 신청** / **라우팅 작업** 필요 여부를 자동 판정해 주는 파일럿 웹앱.

**Live**: https://kwakhyoshin.github.io/workflow_test/

## Tech

- Vite + React 18 + TypeScript
- Tailwind CSS
- Firebase Firestore (CMDB · 토폴로지 데이터)
- GitHub Pages (Actions 자동 배포)

## 개발

```bash
npm install
npm run dev    # http://localhost:5173/workflow_test/
npm run build
```

## 배포

`main` 브랜치에 push하면 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)이 자동으로 빌드·배포한다.

**최초 1회 설정**: GitHub repo → Settings → Pages → Source = **GitHub Actions** 선택.

## 폴더 구조

```
firewall-request-pilot/
├── docs/PRD.md              제품 요구사항 문서
├── scripts/                 Firestore Seed 스크립트
├── public/topology.html     네트워크 토폴로지 다이어그램
├── src/
│   ├── components/          React 컴포넌트
│   ├── lib/                 Firebase, 판정 로직
│   └── hooks/
└── .github/workflows/       CI/CD
```
