FAQ_RESPONSES = {
    "admission": "Admissions typically require application submission, eligibility verification, and document review. Please ask a more specific question for document-backed guidance.",
    "contact": "You can usually find contact details in the uploaded college handbook, prospectus, or official circulars.",
    "courses": "Course information depends on the uploaded academic documents. Ask about a department, semester, or syllabus for a targeted answer.",
}


class FAQAgent:
    def handle(self, query: str):
        lowered = query.lower()
        for keyword, response in FAQ_RESPONSES.items():
            if keyword in lowered:
                return {"answer": response, "sources": [], "agent": "faq"}
        return {
            "answer": "I can help with admissions, contacts, course details, schedules, fees, and policy questions. Ask a specific question and I will route it appropriately.",
            "sources": [],
            "agent": "faq",
        }
