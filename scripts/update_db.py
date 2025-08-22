# scripts/update_db.py (2025-08-22 최종 완성 버전)

import os
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
# PineconeEmbeddings를 import하여 Pinecone의 내장 모델을 지정할 수 있도록 합니다.
from langchain_pinecone import PineconeVectorStore, PineconeEmbeddings

# --- 1. 설정 및 환경 변수 로드 ---
print("스크립트 실행을 시작합니다. 환경 변수를 설정합니다.")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_name = "my-blog"

# LangChain 라이브러리가 Pinecone에 접속할 수 있도록 API 키를 환경 변수로 설정합니다.
os.environ["PINECONE_API_KEY"] = pinecone_api_key

# --- 2. 문서 로드 및 분할 ---
print("마크다운 문서를 로드하고 분할합니다...")
loader = DirectoryLoader('./_posts', glob="**/*.md", loader_cls=UnstructuredMarkdownLoader)
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
split_docs = text_splitter.split_documents(docs)
print(f"총 {len(split_docs)}개의 문서 조각을 준비했습니다.")

# --- 3. Pinecone 내장 임베딩 모델 지정 (핵심 변경점) ---
# Pinecone UI에서 선택했던 바로 그 모델을 LangChain에 알려줍니다.
# 이제 embedding 인수는 더 이상 None이 아닙니다.
print("Pinecone의 내장 임베딩 모델을 설정합니다...")
embeddings = PineconeEmbeddings(model="llama-text-embed-v2")

# --- 4. Pinecone에 업로드 ---
# from_documents 함수에 위에서 만든 embedding 객체를 전달합니다.
print("Pinecone에 데이터 업로드를 시작합니다...")
vectorstore = PineconeVectorStore.from_documents(
    documents=split_docs,
    index_name=pinecone_index_name,
    embedding=embeddings, # None 대신, Pinecone 모델 리모컨을 전달
    text_key="text"
)

print("Pinecone 벡터 DB 업데이트가 성공적으로 완료되었습니다.")
