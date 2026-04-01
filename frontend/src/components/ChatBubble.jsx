export default function ChatBubble({ role, message, meta }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-[fadeIn_.2s_ease-out]`}>
      <div
        className={`max-w-[85%] rounded-[24px] px-4 py-3 shadow-soft sm:max-w-[75%] ${
          isUser
            ? "rounded-br-md bg-cyan-500 text-slate-950"
            : "rounded-bl-md border border-white/10 bg-white/8 text-slate-100 backdrop-blur-xl"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-7 sm:text-[15px]">{message}</p>
        {meta?.sources?.length ? (
          <div className="mt-3 border-t border-white/10 pt-3 text-xs text-slate-300">
            Sources: {meta.sources.map((source) => `${source.filename} (p.${source.page})`).join(", ")}
          </div>
        ) : null}
      </div>
    </div>
  );
}
