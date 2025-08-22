# scripts/update_db.py (최종 수정 버전)

import os
import pinecone
# 1. DeprecationWarning 해결: langchain_community에서 직접 import 하도록 수정
from langchain_community.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 환경 변수에서 정보 로드
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_host = os.getenv("PINECONE_INDEX_HOST")
pinecone_index_name = "my-blog"

# Pinecone 클라이언트 및 인덱스 초기화
pc = pinecone.Pinecone(api_key=pinecone_api_key)
index = pc.Index(host=pinecone_index_host)

# 마크다운 문서 로드 및 분할
loader = DirectoryLoader('./_posts', glob="**/*.md", loader_cls=UnstructuredMarkdownLoader)
docs = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
split_docs = text_splitter.split_documents(docs)

# Pinecone에 업로드할 데이터 형태로 변환
vectors_to_upsert = []
for i, doc in enumerate(split_docs):
    vector_id = f"{doc.metadata['source']}-{i}"

    # Pinecone이 text 필드를 보고 벡터를 생성하므로, metadata에 반드시 포함
    metadata = {
        "source": doc.metadata.get('source', ''),
        "text": doc.page_content
    }

    # 2. ListConversionException 해결: record에서 'values' 키를 완전히 제거
    # Pinecone Serverless가 metadata의 'text'를 보고 'values'를 자동으로 생성합니다.
    record = {
        "id": vector_id,
        "metadata": metadata
    }
    vectors_to_upsert.append(record)

# Pinecone에 데이터 저장 (Upsert)
print(f"총 {len(vectors_to_upsert)}개의 레코드를 Pinecone에 업로드합니다.")
batch_size = 100
for i in range(0, len(vectors_to_upsert), batch_size):
    batch = vectors_to_upsert[i:i+batch_size]
    index.upsert(vectors=batch)

print("Pinecone 벡터 DB 업데이트가 완료되었습니다.")
print(index.describe_index_stats())
