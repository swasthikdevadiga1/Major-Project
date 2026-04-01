class DocumentAgent:
    def __init__(self, rag_service):
        self.rag_service = rag_service

    def handle(self, query: str):
        docs = self.rag_service.retrieve(query)
        answer = self.rag_service.answer_with_context(query, docs)
        answer["agent"] = "document"
        return answer
