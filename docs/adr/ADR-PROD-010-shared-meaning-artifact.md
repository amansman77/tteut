# ADR-PROD-010 Shared Meaning Artifact

## 상태

구현 완료

---

## 맥락

현재 뜨읏은 검색과 발견을 통해 사람들이 살아낸 뜻을 만나는 구조를 가지고 있다.

단어 페이지(`/word/[slug]`)는 다음 구조를 가진다.

```text
단어
사전적 의미
살아낸 뜻들
내 뜻 남기기
```

뜨읏은 단어의 정답을 설명하는 서비스가 아니다.

같은 단어를 사람들이 어떻게 다르게 살아냈는지를 보여주는 플랫폼이다.

예:

```text
존중

어떤 사람에게:
끝까지 이야기를 들어주는 것

어떤 사람에게:
함부로 판단하지 않는 것

어떤 사람에게:
상대의 시간을 가볍게 여기지 않는 것
```

즉:

> 하나의 단어는 여러 삶의 의미를 가진다.

현재 발견(discovery) 경험은 작동하기 시작했다.

사용자는:

* 검색으로 단어를 찾고
* 다른 사람들이 남긴 뜻을 발견하고
* 공감할 수 있다.

하지만 발견 이후의 확산 구조는 약하다.

현재 성장 구조는:

```text
SEO 검색
→ word page 진입
→ 발견
```

에 집중되어 있다.

반면:

```text
공감
→ 공유
→ 외부 유입
```

구조는 제품 안에 없다.

현재 공유는 창업자의 수동 SNS 활동에 의존한다.

이는 초기 성장에는 도움이 되지만
제품 주도 성장(Product-led Growth) 구조는 아니다.

---

## 결정

뜨읏은 **개별 lived meaning entry를 Shared Meaning Artifact로 정의한다.**

단어 페이지는 semantic gallery 역할을 유지하고,
각 뜻은 독립적으로 공유 가능한 artifact가 된다.

모델:

```text
Word = Semantic Gallery
Meaning = Shareable Artifact
```

---

### 1. 공유 단위는 개별 뜻이다

공유 CTA는 단어 전체가 아니라
각 살아낸 뜻 카드에 제공한다.

사용자가 공유하는 것은 단어가 아니라 삶의 의미다.

---

### 2. 단어 페이지는 canonical gallery 역할을 유지한다

`/word/[slug]` 는 기존 public asset 역할을 유지한다.

역할:

* SEO landing page
* discovery page
* semantic gallery

Shared Meaning Artifact는 별도 독립 페이지를 만들지 않고
기존 word page 위에 context를 추가하는 방식으로 구현한다.

공유 URL:

```text
/word/저분?highlight=meaning_123
```

공유 유입 사용자가 해당 뜻의 맥락을 바로 볼 수 있어야 한다.

---

### 3. Shared Meaning Artifact MVP는 metadata 기반으로 시작한다

초기 공유 preview는:

* `og:title`: `[단어] | 뜨읏`
* `og:description`: 해당 뜻 텍스트 그대로
* `og:image`: `/og-default.png` (공통 브랜드 이미지)
* `og:url`: `?highlight=<id>` 포함 URL
* Twitter card: `summary_large_image`

---

### 4. 의미 공감이 서비스 설명보다 우선이다

공유 preview의 목적은 공감과 curiosity 유발이다.

좋은 preview:

```text
저분 | 뜨읏
나에겐 할머니가 자주 쓰시던 말.
```

나쁜 preview:

```text
뜻을 발견하고 의미를 나누는 서비스
```

---

### 5. 공유 UX는 friction이 낮아야 한다

각 뜻 카드 하단 우측에 **secondary CTA** 형태로 "공유하기 ↗" 버튼 배치.

원칙:
* 뜻 콘텐츠보다 시각적으로 강하면 안 됨
* 하지만 존재를 바로 인지할 수 있어야 함 (invisible secondary CTA는 아니다)
* mobile-first 기준 — hover 기반 discoverability는 사용하지 않음
* tap target 충분히 확보 (`px-3 py-2`)

구현: `navigator.share()` → 미지원 환경에서는 클립보드 복사 fallback

---

### 6. Growth Loop 정의

```text
뜻 발견
→ 공감
→ 특정 뜻 공유
→ SNS / 메신저 노출
→ 신규 유입
→ 같은 단어의 다른 뜻 발견
→ 내 뜻 남기기
→ 추가 공유
```

SEO acquisition loop 위에 social acquisition loop를 추가한다.

---

## 근거

### 뜨읏 철학과 일치한다

뜨읏은 정답 플랫폼이 아니다.
따라서 공유 단위도 단어 전체가 아니라 삶이 담긴 개별 의미여야 한다.

### SNS에서 퍼지는 것은 의미다

잘 퍼지는 콘텐츠 특징: 짧음 / 개인적 / 감정적 / 해석 여지 있음.
뜨읏의 lived meaning은 이 조건에 맞는다.

### 구현 complexity를 낮춘다

뜻별 동적 OG 이미지 생성은 초기 단계에서 운영 복잡도가 높다.
공통 brand image + dynamic metadata 만으로도 공유 실험은 충분히 가능하다.

### 기존 SEO asset를 재사용한다

기존 `/word/[slug]` 구조를 그대로 활용하므로 SEO 전략과 충돌하지 않는다.

---

## 포기한 대안

### Word-level 공유

`/word/존중` 전체를 공유하는 방식.
어떤 뜻이 공유되는지 불명확하고 대표 의미처럼 보일 위험이 있다.

### Meaning detail page 신규 생성

`/meaning/abc123` 신규 route.
route complexity 증가, thin content 위험, 현재 stage에서는 과한 구조.

### 동적 og:image 자동 생성부터 시작

구현 복잡도 높음. 폰트/캐싱/preview debug 비용이 제품 가설 검증보다 크다.

---

## 결과

검증할 것:

1. 뜻 카드별 공유 클릭률
2. 공유 유입 수
3. 공유 유입자의 word page 체류 시간
4. 공유 유입자의 내 뜻 작성률
5. 가장 많이 공유되는 meaning 유형

---

## 핵심 문장

> **뜨읏에서 공유되어야 하는 것은 단어가 아니라 삶이 담긴 뜻이다.**
