from openai import APIError, OpenAI

from app.core.config import settings
from app.integrations.ai.exceptions import AiUnavailableError

MAX_OUTPUT_TOKENS = 1024


class OpenAiClient:
    def __init__(self, api_key: str) -> None:
        self._client = OpenAI(api_key=api_key)

    def complete(self, prompt: str) -> str:
        try:
            response = self._client.responses.create(
                model=settings.openai_model,
                input=prompt,
                max_output_tokens=MAX_OUTPUT_TOKENS,
            )
        except APIError as error:
            raise AiUnavailableError(str(error)) from error

        # A 200 can still be unusable: refused, or cut off by max_output_tokens.
        if response.status != "completed":
            reason = (
                response.error.message
                if response.error
                else response.incomplete_details.reason
                if response.incomplete_details
                else response.status
            )
            raise AiUnavailableError(f"The model did not finish: {reason}")

        text = response.output_text.strip()

        if not text:
            raise AiUnavailableError("The model returned no text")

        return text
