import { useEffect, useState } from "react";
import { HiArrowUpTray, HiDocumentText } from "react-icons/hi2";

import Loader from "../components/Loader";
import api from "../services/api";

export default function Admin() {
  const [files, setFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [uploadResults, setUploadResults] = useState([]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/admin/documents");
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!files.length) {
      setError("Select at least one PDF file.");
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    setIsUploading(true);
    setError("");
    setMessage("");
    setUploadResults([]);
    try {
      const { data } = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(data.message);
      setUploadResults(data.documents || []);
      setFiles([]);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Admin Dashboard</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Upload and index college PDFs</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Files are stored on the server, text is extracted and chunked, embeddings are generated through OpenAI, and the FAISS index is updated without resetting existing knowledge.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Multiple uploads", "Batch-upload several PDFs in one action."],
              ["Persistent FAISS", "Embeddings remain available after restart."],
              ["No dummy knowledge", "The assistant only answers from uploaded documents."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-slate-950/30 p-4">
                <p className="font-medium text-white">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleUpload} className="rounded-[32px] border border-white/10 bg-slate-950/35 p-6 backdrop-blur-2xl">
          <div className="flex items-center gap-3 text-white">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
              <HiArrowUpTray className="text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Knowledge Base Upload</h3>
              <p className="text-sm text-slate-400">PDF only. Processing starts immediately after upload.</p>
            </div>
          </div>

          <label className="mt-6 block rounded-3xl border border-dashed border-white/15 bg-white/5 p-6 text-center transition hover:border-cyan-300/40 hover:bg-cyan-300/5">
            <input
              type="file"
              accept=".pdf"
              multiple
              onChange={(event) => setFiles(event.target.files)}
              className="hidden"
            />
            <p className="text-base font-medium text-white">Choose PDF files</p>
            <p className="mt-2 text-sm text-slate-400">
              {files.length ? `${files.length} file(s) selected` : "Click to browse your institutional documents"}
            </p>
          </label>

          {message ? <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
          {uploadResults.length ? (
            <div className="mt-4 space-y-3">
              {uploadResults.map((result, index) => (
                <div
                  key={`${result.filename}-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    result.status === "processed"
                      ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                      : "border border-amber-400/20 bg-amber-400/10 text-amber-100"
                  }`}
                >
                  <div className="font-medium">{result.filename}</div>
                  <div className="mt-1">
                    Status: {result.status} | Pages: {result.pages ?? 0} | Chunks: {result.chunks ?? 0}
                  </div>
                  {result.error ? <div className="mt-1">{result.error}</div> : null}
                </div>
              ))}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isUploading}
            className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploading ? "Uploading and processing..." : "Upload and Index Documents"}
          </button>
        </form>
      </section>

      <section className="rounded-[32px] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Stored Files</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Indexed document inventory</h3>
          </div>
          <button
            type="button"
            onClick={fetchDocuments}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {isLoading ? (
          <Loader label="Loading uploaded documents..." />
        ) : documents.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {documents.map((document) => (
              <div key={document.id} className="rounded-3xl border border-white/10 bg-slate-950/30 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-200">
                    <HiDocumentText className="text-xl" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white">{document.filename}</p>
                    <p className="mt-1 text-sm text-slate-400">Status: {document.status}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Pages: {document.pages ?? "-"} | Chunks: {document.chunks ?? "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(document.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-slate-950/20 px-6 py-10 text-center text-sm text-slate-400">
            No documents uploaded yet. The chatbot will only answer from files added here.
          </div>
        )}
      </section>
    </div>
  );
}
