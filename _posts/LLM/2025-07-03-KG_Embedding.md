---
title: 지식 그래프(KG) 임베딩 - LLM과 지식 그래프를 연결하는 방법
description: 지식 그래프를 LLM이 다룰 수 있도록 만드는 방법에 대해 알아봅니다.
author: janghyunroh
date: 2025-07-03 16:42 +0900
categories: [연구, 랩미팅]
tags: [공부, 대학원, LLM]
math: true
mermaid: true
image:
  path: /assets/img/2025-07-03-KG/d9svj8c1zq지식그래프 LLM-3.png
---

 &nbsp;이 포스팅은 25년도 광주과학기술원(GIST) 석사과정을 진행하는 제 연구 주제와 관련된 정리글입니다.

---

## 지식 그래프(Knowledge Graph)란?

 지식 그래프(KG)는 현실 세계의 개체(Entity)와 그 관계(Relation)를 트리플 형태 `(head, relation, tail)`로 표현하는 구조화된 지식 베이스이다. 예를 들어 `(아인슈타인, 출생지, 독일)`처럼 사실 정보를 노드와 엣지로 구성한 그래프로 저장한다.

 Freebase, Wikidata, YAGO, DBpedia 등이 대표적인 대규모 지식 그래프이며, 의료(SNOMED-CT, UMLS), 금융, 법률 등 도메인 특화 KG도 활발히 구축되고 있다.

 LLM 기반 시스템에서 KG는 구조화된 사실 정보를 외부 지식으로 제공하는 역할을 한다. 비구조적 텍스트만으로 학습된 LLM이 갖는 사실 오류(Hallucination)를 줄이고, 최신 또는 도메인 특화 지식을 보완하는 데 유용하다.


## Knowledge Intensive Task

 Knowledge Intensive Task는 광범위한 외부 지식 없이는 정확한 답변을 생성하기 어려운 NLP 태스크를 말한다. Open-Domain QA, Relation Extraction, Entity Linking, Fact Verification 등이 대표적이다.

 이 태스크들에서 지식 그래프는 특히 강력한 외부 지식 소스가 된다. 구조화된 관계 정보는 단순 문서 검색보다 정밀한 사실 추론을 가능하게 하며, 그래프 경로를 따라 멀티-홉 추론(Multi-hop Reasoning)도 수행할 수 있다.

 그러나 KG는 기본적으로 이산적(discrete)이고 심볼릭(symbolic)한 구조이기 때문에, 연속적인 벡터 공간에서 작동하는 LLM과 직접 연결하기 어렵다. 이를 해결하기 위해 KG를 연속 벡터 공간에 매핑하는 **KG 임베딩(KG Embedding)** 기법이 등장하였다.


## KG 임베딩(KG Embedding) 기법

 KG 임베딩은 그래프의 노드(Entity)와 엣지(Relation)를 저차원 밀집 벡터로 표현하는 기법이다. 학습된 임베딩은 유사한 개체끼리 벡터 공간에서 가깝게 위치하도록 최적화되어, 관계 추론 및 링크 예측 등에 활용된다.

 대표적인 KG 임베딩 모델들은 다음과 같다:

| 모델 | 방식 | 특징 |
|------|------|------|
| **TransE** | $h + r \approx t$ | 관계를 벡터 이동으로 표현, 단순하고 효율적 |
| **TransR** | Entity/Relation 공간 분리 | 관계마다 별도의 공간에서 임베딩 |
| **RotatE** | 복소수 공간에서 회전 | 대칭·반대칭 등 다양한 관계 패턴 처리 |
| **ComplEx** | 복소수 벡터 임베딩 | 비대칭 관계 학습 가능 |
| **RGCN** | Graph Convolutional Network 기반 | 이웃 노드 정보를 집계하여 임베딩 |

 LLM과의 통합 관점에서 KG 임베딩은 세 가지 방식으로 활용된다:

1. **Pre-training 단계 통합**: KG 트리플을 텍스트로 변환하거나, 임베딩 손실(Loss)을 추가하여 LLM 파라미터에 지식을 내재화.
2. **Fine-tuning 단계 통합**: 특정 태스크에서 KG 임베딩을 보조 피처로 사용하여 LLM을 파인튜닝.
3. **Inference 단계 통합**: 추론 시 KG에서 관련 서브그래프를 검색하고 텍스트화하여 컨텍스트로 제공(RAG와 유사한 방식).
