import os
import tempfile

from openai import OpenAI


class VoiceService:
    @staticmethod
    def transcribe_file(file_storage):
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            file_storage.save(tmp.name)
            try:
                with open(tmp.name, "rb") as audio_file:
                    transcript = client.audio.transcriptions.create(
                        model="whisper-1",
                        file=audio_file
                    )
                return transcript.text
            finally:
                os.unlink(tmp.name)
