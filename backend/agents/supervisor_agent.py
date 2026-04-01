class SupervisorAgent:
    def __init__(self, document_agent, faq_agent):
        self.document_agent = document_agent
        self.faq_agent = faq_agent

    def classify_intent(self, query: str) -> str:
        lowered = query.lower()
        faq_keywords = ["hello", "hi", "contact", "admission", "help"]
        doc_keywords = [
            "syllabus",
            "fee",
            "deadline",
            "policy",
            "hostel",
            "exam",
            "attendance",
            "scholarship",
            "department",
            "calendar",
            "page",
        ]

        if any(keyword in lowered for keyword in doc_keywords):
            return "document"
        if any(keyword in lowered for keyword in faq_keywords):
            return "faq"
        return "document"

    def route(self, query: str):
        intent = self.classify_intent(query)
        if intent == "faq":
            response = self.faq_agent.handle(query)
        else:
            response = self.document_agent.handle(query)
        response["intent"] = intent
        return response
