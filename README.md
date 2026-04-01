# Smart College Information Chatbot

Production-ready full-stack project for a college information chatbot using Flask, LangChain, OpenAI, FAISS, React, and Tailwind CSS.

## Architecture

### Backend
- Flask API with JWT authentication
- Role-aware access for `admin` and `student`
- PDF ingestion pipeline using `PyPDF2`
- LangChain chunking and local sentence-transformers embeddings
- Persistent FAISS index stored on disk
- Multi-agent routing with supervisor, FAQ, and document agents

### Frontend
- React + Vite application
- Tailwind CSS glassmorphism-inspired UI
- Login, student chat, and admin dashboard pages
- Speech input using the Web Speech API
- Axios service layer for API communication

## Project Structure

```text
backend/
  app.py
  config/
  routes/
  services/
  agents/
  database/
  data/
    uploads/
    faiss_index/
frontend/
  src/
    pages/
    components/
    services/
    styles/
```

## Backend Setup

1. Create a Python virtual environment and activate it.
2. Install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

3. Copy the environment template and configure secrets:

```bash
cd ..
cp .env.example .env
```

4. Set at least:
- `OPENAI_API_KEY`
- `SECRET_KEY`
- `JWT_SECRET_KEY`
- `DATABASE_URL`
- `EMBEDDING_MODEL`

SQLite works by default. To use MySQL, set `DATABASE_URL` to a SQLAlchemy-compatible value such as:

```env
DATABASE_URL=mysql://username:password@localhost/college_chatbot
```

If you want MySQL support, install the optional driver after system MySQL/MariaDB development packages are available:

```bash
cd backend
pip install -r requirements-mysql.txt
```

5. Run the Flask API:

```bash
cd backend
python app.py
```

Backend runs on `http://localhost:5000`.

## Frontend Setup

1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Copy the frontend environment template:

```bash
cp .env.example .env
```

3. Run the Vite development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

## First-Time Usage

1. Open the frontend.
2. Use the `Setup Admin` tab to create the first admin account.
3. Sign in as admin.
4. Upload one or more college PDF documents from the admin dashboard.
5. Wait for automatic processing and FAISS indexing to complete.
6. Create a student account from the `Student Sign Up` tab.
7. Sign in as student and start asking document-grounded questions in chat.

## Key Endpoints

- `POST /setup-admin`
- `POST /register`
- `POST /login`
- `POST /logout`
- `GET /admin/documents`
- `POST /admin/upload`
- `POST /chat`
- `POST /voice`

## Notes

- The chatbot starts with no seeded users and no seeded knowledge.
- Responses come only from admin-uploaded PDFs plus minimal FAQ handling for greetings and generic help.
- FAISS embeddings are generated locally with `sentence-transformers`; OpenAI is used only for final answer generation.
- FAISS data persists in `backend/data/faiss_index/`.
- Uploaded files persist in `backend/data/uploads/`.
- Default local setup uses SQLite and does not require MySQL client libraries.
