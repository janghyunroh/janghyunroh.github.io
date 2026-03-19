---
title: 정보 이론(Information Theory) 개요
description: 정보 이론의 핵심 개념들을 정리합니다. 엔트로피, 상호 정보량, 채널 용량 등을 다룹니다.
author: janghyunroh
date: 2025-09-13 09:00 +0900
categories: [스터디, 정보이론]
tags: [공부, 대학원, AI, 정보이론]
math: true
mermaid: true
image:
  path:
---

 &nbsp;이 포스팅은 정보 이론(Information Theory)의 핵심 개념들을 정리한 글입니다. Claude Shannon이 1948년 제안한 수학적 프레임워크를 기반으로, 정보의 정량화, 압축, 전송의 원리를 다룹니다.

---

## 1. 정보 이론이란?

 정보 이론은 **정보의 정량화, 저장, 전송**에 대한 수학적 이론이다. Claude Shannon이 1948년 발표한 논문 *"A Mathematical Theory of Communication"* 에서 처음 체계화되었다.

 핵심 질문은 다음과 같다:
- 어떤 메시지에 담긴 **정보량**은 얼마인가?
- 데이터를 **최소한의 비트**로 압축하는 한계는 어디인가?
- 잡음이 있는 채널에서 **오류 없이** 전송할 수 있는 최대 속도는 얼마인가?

---

## 2. 자기 정보(Self-Information)

 어떤 사건 $x$가 발생했을 때의 정보량은 그 사건이 얼마나 **놀라운가**에 비례한다. 발생 확률이 낮을수록 더 많은 정보를 담고 있다.

$$
I(x) = -\log_2 P(x) \quad \text{[bits]}
$$

- $P(x) = 1$이면 $I(x) = 0$: 항상 일어나는 사건은 정보가 없다.
- $P(x) = 0.5$이면 $I(x) = 1$ bit: 동전 하나를 던진 결과.
- $P(x) = 0.125$이면 $I(x) = 3$ bits: 8면체 주사위 하나의 결과.

---

## 3. 엔트로피(Entropy)

 **엔트로피(Entropy)** $H(X)$는 확률 변수 $X$의 **평균 정보량**이다. 불확실성이 클수록 엔트로피가 높다.

$$
H(X) = -\sum_{x \in \mathcal{X}} P(x) \log_2 P(x)
$$

### 성질
- **비음수성**: $H(X) \ge 0$
- **최대 엔트로피**: 균등 분포일 때 최대, $H(X) = \log_2 |\mathcal{X}|$
- **결합 엔트로피**: $H(X, Y) \le H(X) + H(Y)$ (독립일 때 등호 성립)

### 예시: 공정한 동전

$$
H(X) = -\frac{1}{2}\log_2\frac{1}{2} - \frac{1}{2}\log_2\frac{1}{2} = 1 \text{ bit}
$$

---

## 4. 조건부 엔트로피(Conditional Entropy)

 $Y$를 알고 있을 때 $X$의 불확실성:

$$
H(X \mid Y) = -\sum_{y} P(y) \sum_{x} P(x \mid y) \log_2 P(x \mid y)
$$

**연쇄 법칙(Chain Rule)**:

$$
H(X, Y) = H(X) + H(Y \mid X) = H(Y) + H(X \mid Y)
$$

---

## 5. 상호 정보량(Mutual Information)

 **상호 정보량(Mutual Information)** $I(X; Y)$는 $X$와 $Y$가 서로 얼마나 많은 정보를 공유하는지를 나타낸다.

$$
I(X; Y) = H(X) - H(X \mid Y) = H(Y) - H(Y \mid X)
$$

$$
I(X; Y) = \sum_{x,y} P(x, y) \log_2 \frac{P(x, y)}{P(x)P(y)}
$$

- $X$와 $Y$가 독립이면 $I(X; Y) = 0$
- 상호 정보량은 대칭: $I(X; Y) = I(Y; X)$

---

## 6. KL 발산(KL Divergence)

 두 확률 분포 $P$와 $Q$ 사이의 **정보 손실**을 측정한다.

$$
D_{KL}(P \| Q) = \sum_x P(x) \log_2 \frac{P(x)}{Q(x)}
$$

- 항상 $D_{KL}(P \| Q) \ge 0$ (Gibbs 부등식)
- 비대칭: $D_{KL}(P \| Q) \neq D_{KL}(Q \| P)$
- $P = Q$일 때만 $D_{KL} = 0$

 딥러닝에서 KL 발산은 모델 분포 $Q$를 실제 분포 $P$에 가깝게 학습시키는 손실 함수로 자주 사용된다.

---

## 7. 크로스 엔트로피(Cross Entropy)

$$
H(P, Q) = -\sum_x P(x) \log_2 Q(x) = H(P) + D_{KL}(P \| Q)
$$

 분류 문제에서 손실 함수(Cross-Entropy Loss)로 사용된다. $P$는 실제 레이블 분포, $Q$는 모델의 예측 분포이다.

---

## 8. 채널 용량(Channel Capacity)

 잡음이 있는 통신 채널에서 오류 없이 전송할 수 있는 **최대 정보 전송률**:

$$
C = \max_{P(X)} I(X; Y)
$$

**Shannon의 채널 코딩 정리**: 전송 속도 $R < C$이면 오류를 임의로 작게 만들 수 있는 부호화 방식이 존재한다. $R > C$이면 신뢰성 있는 전송이 불가능하다.

### AWGN 채널

가우시안 잡음이 있는 채널에서의 용량 (Shannon-Hartley 공식):

$$
C = B \log_2\left(1 + \frac{S}{N}\right) \quad \text{[bps]}
$$

- $B$: 대역폭 (Hz)
- $S/N$: 신호 대 잡음비 (SNR)

---

## 9. 소스 코딩(Source Coding)

 **Shannon의 소스 코딩 정리**: 무손실 압축의 한계는 엔트로피 $H(X)$이다. 즉, 평균 부호 길이는 반드시 $H(X)$ 이상이어야 한다.

$$
L \ge H(X)
$$

 허프만 코딩(Huffman Coding)은 이 하한에 근접하는 대표적인 가변 길이 부호화 기법이다.

---

## 10. 정보 이론과 머신러닝

 정보 이론의 개념은 현대 머신러닝 전반에 깊이 적용된다:

| 개념 | 머신러닝 적용 |
|------|--------------|
| 엔트로피 | 의사결정 트리의 분할 기준 (Information Gain) |
| 크로스 엔트로피 | 분류 문제의 손실 함수 |
| KL 발산 | VAE의 정규화 항, 모델 학습 |
| 상호 정보량 | 특징 선택(Feature Selection), 표현 학습 |
| 채널 용량 | Semantic Communication 설계 기준 |

---

## 참고 문헌

- Shannon, C. E. (1948). *A Mathematical Theory of Communication*. Bell System Technical Journal.
- Cover, T. M., & Thomas, J. A. (2006). *Elements of Information Theory* (2nd ed.). Wiley.
