from app.integrations.ai.fake_data import CANNED_COMPLETIONS, GENERIC_COMPLETION


class FakeAiClient:
    def complete(self, prompt: str) -> str:
        haystack = prompt.lower()

        for keyword, completion in CANNED_COMPLETIONS.items():
            if keyword in haystack:
                return completion

        return GENERIC_COMPLETION
