import { useEffect, useRef, useState } from "react";
import { HiMiniMicrophone, HiPaperAirplane } from "react-icons/hi2";

import ChatBubble from "../components/ChatBubble";
import Loader from "../components/Loader";
import api from "../services/api";

const SpeechRecognitionApi = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      message: "Ask about fees, hostel rules, exam policies, departments, or any topic covered in the uploaded college PDFs.",
      meta: { sources: [] },
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || isLoading) {
      return;
    }

    const userMessage = { id: crypto.randomUUID(), role: "user", message: content };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/chat", { message: content });
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          message: data.answer,
          meta: { sources: data.sources || [], agent: data.agent, intent: data.intent },
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeech = () => {
    if (!SpeechRecognitionApi) {
      setError("Web Speech API is not available in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionApi();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => {
        setIsListening(false);
        setError("Voice recognition failed. Please try again.");
      };
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
  };

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-6">
      <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Student Chatbot</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-white">Document-grounded college assistant</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Every answer is routed through the supervisor and, when appropriate, grounded against the current FAISS knowledge base built from admin-uploaded PDFs.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            Voice search enabled
          </div>
        </div>
      </section>

      <section className="flex flex-1 flex-col rounded-[32px] border border-white/10 bg-slate-950/35 p-4 backdrop-blur-2xl sm:p-6">
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((item) => (
            <ChatBubble key={item.id} role={item.role} message={item.message} meta={item.meta} />
          ))}
          {isLoading ? <Loader label="Retrieving knowledge and drafting response..." /> : null}
          <div ref={endRef} />
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

        <form
          className="mt-5 flex items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            sendMessage(input);
          }}
        >
          <div className="flex-1 rounded-[28px] border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-xl">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={1}
              placeholder="Ask a question from the uploaded documents..."
              className="max-h-40 w-full resize-none bg-transparent text-sm leading-7 text-white outline-none placeholder:text-slate-500"
            />
          </div>
          <button
            type="button"
            onClick={handleSpeech}
            className={`rounded-2xl border px-4 py-4 transition ${
              isListening
                ? "border-emerald-300 bg-emerald-300/15 text-emerald-100"
                : "border-white/10 bg-white/6 text-slate-200 hover:bg-white/10"
            }`}
          >
            <HiMiniMicrophone className="text-xl" />
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-2xl bg-cyan-400 px-4 py-4 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <HiPaperAirplane className="text-xl" />
          </button>
        </form>
      </section>
    </div>
  );
}
