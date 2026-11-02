from typing import Protocol


class AiClient(Protocol):
    def complete(self, prompt: str) -> str: ...
