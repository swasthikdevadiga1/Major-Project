import tempfile

import speech_recognition as sr


class VoiceService:
    @staticmethod
    def transcribe_file(file_storage):
        recognizer = sr.Recognizer()
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            file_storage.save(tmp.name)
            with sr.AudioFile(tmp.name) as source:
                audio = recognizer.record(source)
            return recognizer.recognize_google(audio)
