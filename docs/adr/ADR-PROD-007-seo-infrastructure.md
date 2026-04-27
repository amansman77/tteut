# ADR-PROD-007 sitemap.xml / robots.txt / canonical / metadata 기반 검색엔진 인덱싱 구조

## 상태

승인

## 맥락

뜨읏은 `/word/[slug]` 공개 페이지를 통해 SEO 기반 성장 구조를 시작했다.
이제 Google이 이 페이지들을 빠르고 정확하게 인식하도록 만드는 것이 중요하다.

현재는 `/word/[slug]`는 존재하지만 sitemap.xml 자동 관리, robots.txt 정책,
canonical URL 정의, metadata 최적화가 부족하다.

## 결정

### 1. sitemap.xml 자동 생성

모든 `/word/[slug]` 페이지를 포함하는 sitemap.xml을 자동 생성한다.
DB에서 단어 목록을 쿼리해 동적으로 생성.

### 2. robots.txt 설정

```
Allow: /word/
Disallow: /seed
Disallow: /auth
Sitemap: https://tteut.yetimates.com/sitemap.xml
```

### 3. canonical URL 정의

각 `/word/[slug]` 페이지에 canonical URL 명시.

### 4. metadata 최적화

```
Title: 존중 뜻 | 뜨읏
Description: 누군가에게 존중은... (첫 번째 살아낸 뜻 기반)
og:title, og:description 동적 생성
```

## 근거

sitemap → 발견 / robots → 정책 / canonical → 대표 URL / metadata → 노출 품질은
SEO의 최소 운영 인프라다.

검색 유입은 나중에 붙이는 기능이 아니라 처음부터 설계해야 하는 시스템이다.

## 결과

(운영 후 기록)

- sitemap 인덱싱 성공 여부
- Search Console 등록 상태
- `/word/*` 크롤링 수
- 검색 노출 수(impression)
- CTR 변화
