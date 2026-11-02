from typing import Annotated

from fastapi import Depends

from app.core.config import settings
from app.integrations.ai.fake_client import FakeAiClient
from app.integrations.ai.openai_client import OpenAiClient
from app.integrations.ai.protocol import AiClient


def get_ai_client() -> AiClient:
    if not settings.openai_api_key:
        return FakeAiClient()

    return OpenAiClient(settings.openai_api_key)


Ai = Annotated[AiClient, Depends(get_ai_client)]
