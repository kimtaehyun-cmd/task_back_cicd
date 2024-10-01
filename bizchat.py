import os
import sys
import io
from langchain import hub
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_community.document_loaders import DirectoryLoader
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from collections import Counter
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()
os.getenv("OPENAI_API_KEY")

# 한글 출력 인코딩 설정
sys.stdout = io.TextIOWrapper(sys.stdout.detach(), encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.detach(), encoding='utf-8')

# 문서 로드
class UTF8TextLoader(DirectoryLoader):
    def __init__(self, file_path: str):
        super().__init__(file_path, encoding="utf-8")

loader = DirectoryLoader("./data", glob="*.txt", loader_cls=UTF8TextLoader)
documents = loader.load()

# 텍스트 분할
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
texts = text_splitter.split_documents(documents)

# OpenAI Embeddings 생성
embedding = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(documents=texts, embedding=embedding)
retriever = vectorstore.as_retriever()

# OpenAI Chat 모델 설정
llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=1)

# 프롬프트 템플릿 설정
from langchain_core.prompts import PromptTemplate
prompt = PromptTemplate.from_template(
    """당신은 질문-답변(Question-Answering)을 수행하는 AI 어시스턴트입니다. 주어진 문맥(context)과 질문(question)에 답변하세요.
    
    질문:
    {question}
    
    문맥:
    {context}
    
    답변:"""
)

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

from langchain_teddynote.messages import stream_response

# Node.js에서 질문을 받음
if __name__ == "__main__":
    received_question = sys.argv[1]
    answer = rag_chain.stream(received_question)
    stream_response(answer)
