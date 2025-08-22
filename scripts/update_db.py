# scripts/update_db.py

import os
import pinecone
from langchain.document_loaders import DirectoryLoader, UnstructuredMarkdownLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

# 2단계에서 등록한 Secret을 환경 변수로 불러옵니다.
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_index_host = os.getenv("PINECONE_INDEX_HOST")
pinecone_index_name = "my-blog"

# Pinecone에 접속합니다.
pc = pinecone.Pinecone(api_key=pinecone_api_key)
index = pc.Index(host=pinecone_index_host)

# _posts 폴더와 그 하위 폴더의 모든 마크다운 파일을 읽어옵니다.
loader = DirectoryLoader('./_posts', glob="**/*.md", loader_cls=UnstructuredMarkdownLoader)
docs = loader.load()

# 읽어온 문서를 적절한 크기로 자릅니다.
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
split_docs = text_splitter.split_documents(docs)

# Pinecone에 업로드할 형태로 데이터를 가공합니다.
vectors_to_upsert = []
for i, doc in enumerate(split_docs):
    vector_id = f"{doc.metadata['source']}-{i}"
    metadata = { "source": doc.metadata.get('source', ''), "text": doc.page_content }
    record = { "id": vector_id, "values": { "text": doc.page_content }, "metadata": metadata }
    vectors_to_upsert.append(record)

# 가공된 데이터를 Pinecone DB에 업로드(Upsert)합니다.
print(f"총 {len(vectors_to_upsert)}개의 벡터를 Pinecone에 업로드합니다.")
batch_size = 100
for i in range(0, len(vectors_to_upsert), batch_size):
    batch = vectors_to_upsert[i:i+batch_size]
    index.upsert(vectors=batch)

print("Pinecone 벡터 DB 업데이트가 완료되었습니다.")
