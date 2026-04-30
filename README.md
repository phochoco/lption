# LPtion (Light Pollution Action) 🌌

> **시민과 전문가를 위한 스마트폰 기반 빛공해 측정·기록 PWA (Progressive Web App)**

LPtion은 고가의 전문 장비 없이도 스마트폰 카메라를 활용해 일상 속 빛공해(Light Pollution)의 심각성을 측정하고, 기록하며, 공유할 수 있도록 돕는 웹 애플리케이션입니다. 시민 과학(Citizen Science)의 일환으로 기획되었으며, 신뢰감 있고 정밀한 데이터 시각화를 위해 **Fathom Information Design** 철학을 따릅니다.

---

## 🌟 주요 기능 (Key Features)

- 📸 **디바이스 온디바이스(On-device) 이미지 분석**: 서버로 이미지를 전송하지 않고 기기 자체에서 Canvas API를 활용해 휘도(Luminance, cd/m²)를 근사 분석합니다.
- 🗺 **메타데이터 자동 추출**: EXIF 데이터를 분석하여 촬영 시각, 위치(GPS 좌표), 셔터스피드, ISO 등의 노출 정보를 자동으로 기록합니다.
- 🌡 **가시적인 히트맵(Heatmap) 생성**: 이미지 내에서 과노출(빛공해 유발) 영역과 저노출 영역을 시각적으로 렌더링합니다.
- 🏛 **정밀한 UI/UX**: 장식적 요소를 배제하고 과학적 서사와 정보 전달에 집중한 스위스 폰트, 그리드 기반의 라이트 테마를 적용했습니다.

## 🛠 기술 스택 (Tech Stack)

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (CSS Modules) + CSS Variables (Fathom Theme)
- **PWA**: Next-PWA (Manifest & Service Worker)
- **Icons**: Lucide React

## 🚀 로컬 실행 방법 (Getting Started)

프로젝트를 로컬 환경에서 실행하는 방법입니다.

```bash
# 1. 패키지 설치
npm install

# 2. PC 환경에서 개발 서버 실행 (빠른 HMR 적용)
npm run dev

# 3. 실제 모바일 기기(iOS/Android)에서 테스트 서버 실행 
# (주의: 모바일 사파리 환경의 Hydration/WebSocket 충돌 방지를 위해 프로덕션 빌드로 실행됩니다)
npm run dev:mobile
```

> 모바일 기기 테스트 시 터미널에 표시되는 `Network: http://<당신의-로컬-IP>:3000` 주소를 모바일 브라우저에 입력하여 접속하세요. (PC와 모바일이 동일한 Wi-Fi 환경에 있어야 합니다)

## 🎨 디자인 철학 (Design Philosophy)

LPtion은 화려함보다 **"데이터의 신뢰성"**과 **"과학적 서사"**를 중시합니다. (참조: [Huashu Design](https://github.com/alchaincyf/huashu-design) - 04. Fathom Information Design)

- **색상**: 깊은 네이비(Deep Navy) 텍스트와 퓨어 화이트/라이트 그레이 배경을 사용합니다.
- **타이포그래피**: `text-wrap: pretty` 및 굵고 거대한 숫자를 통해 측정된 데이터를 명확하게 전달합니다.
- **상태**: 에러나 경고(과노출 등)는 명확한 클래식 블루 및 레드 등 객관적인 액센트 색상으로만 표현됩니다.

## ⚠️ 면책 조항 (Disclaimer)

이 애플리케이션에서 도출된 밝기(휘도) 데이터는 스마트폰 카메라 센서의 특성과 자동 노출 보정 등에 의해 실제 전문 휘도계(Luminance Meter)로 측정한 값과 차이가 있을 수 있습니다.
따라서 이 데이터는 법적 분쟁의 증거나 절대적인 기준으로 사용될 수 없으며, **빛공해 모니터링을 위한 참고용(Reference)**으로만 활용해야 합니다.

## 🤝 기여 (Contributing)

이 프로젝트는 빛공해 문제를 알리고 개선하기 위한 공공의 목적으로 제작되었습니다.
버그 제보, 기능 개선, 그리고 휘도 분석 알고리즘 고도화를 위한 PR(Pull Request)은 언제나 환영합니다.

---
*Let's protect our starry night sky.* 🌃
