# scripts/update_db.py (최종 검증 버전)

import os
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore

# --- 1. 설정 및 환경 변수 로드 ---
print("스크립트 실행을 시작합니다. 환경 변수를 설정합니다.")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_name = "my-blog"

# LangChain 라이브러리가 Pinecone에 접속할 수 있도록 API 키를 환경 변수로 설정합니다.
# 이것이 공식적으로 권장되는 방식입니다.
os.environ["PINECONE_API_KEY"] = pinecone_api_key

# --- 2. 문서 로드 및 분할 ---
print("마크다운 문서를 로드하고 분할합니다...")
loader = DirectoryLoader('./_posts', glob="**/*.md", loader_cls=UnstructuredMarkdownLoader)
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
split_docs = text_splitter.split_documents(docs)
print(f"총 {len(split_docs)}개의 문서 조각을 준비했습니다.")

# --- 3. Pinecone에 업로드 (가장 중요한 부분) ---
# LangChain의 공식 PineconeVectorStore 통합 기능을 사용합니다.
# 이 함수는 Pinecone의 '통합 임베딩' 기능을 사용하도록 특별히 설계되었습니다.
# 'embedding' 인자를 전달하지 않으면, LangChain이 알아서 Pinecone에게
# 'text' 필드의 내용을 기반으로 벡터를 생성하라고 요청합니다.
print("Pinecone에 데이터 업로드를 시작합니다...")
vectorstore = PineconeVectorStore.from_documents(
    documents=split_docs,
    index_name=pinecone_index_name,
    embedding=None, # None으로 설정하여 Pinecone의 내장 임베딩 모델을 사용하도록 명시
    text_key="text" # Pinecone 인덱스 설정의 'Field map'과 일치시켜야 함
)

print("Pineone 벡터 DB 업데이트가 성공적으로 완료되었습니다.")
