"""Business logic against a fake integration."""

from typing import get_args

import pytest

from app.core.exceptions import DomainError, NotFoundError
from app.integrations.ai.exceptions import AiUnavailableError
from app.modules.documents import service
from app.modules.documents.models import DOCUMENT_STATUSES
from app.modules.documents.schemas import DocumentCreate, DocumentStatus, DocumentUpdate


class RecordingAi:
    """Captures the prompt so a test can assert on what the feature asked for."""

    def __init__(self, answer: str = "A two-sentence summary.") -> None:
        self.answer = answer
        self.prompts: list[str] = []

    def complete(self, prompt: str) -> str:
        self.prompts.append(prompt)

        return self.answer


class BrokenAi:
    def complete(self, prompt: str) -> str:
        raise AiUnavailableError("connection reset")


def a_document(db, **overrides):
    payload = {
        "title": "Invoice 2024-0871",
        "content": "Three deliveries, one without an order reference.",
    } | overrides

    return service.create_document(db, DocumentCreate(**payload))


def test_summarize_sends_the_feature_prompt_to_the_ai(db):
    document = a_document(db)
    ai = RecordingAi()

    service.summarize_document(db, document.id, ai)

    assert len(ai.prompts) == 1
    # The prompt is built by the feature, so the document must reach the model.
    assert "Invoice 2024-0871" in ai.prompts[0]
    assert "one without an order reference" in ai.prompts[0]


def test_summarize_stores_the_completion(db):
    document = a_document(db)

    updated = service.summarize_document(db, document.id, RecordingAi("Two sentences here."))

    assert updated.summary == "Two sentences here."


def test_summarize_translates_an_integration_failure_into_a_domain_error(db):
    # The router must never see AiUnavailableError, or the frontend gets a 500
    # with a stack trace instead of a readable message.
    document = a_document(db)

    with pytest.raises(DomainError) as raised:
        service.summarize_document(db, document.id, BrokenAi())

    assert "connection reset" in str(raised.value)


def test_missing_document_raises_not_found(db):
    with pytest.raises(NotFoundError):
        service.get_document(db, 9999)


def test_update_applies_only_the_fields_provided(db):
    document = a_document(db, title="Original title")

    updated = service.update_document(db, document.id, DocumentUpdate(status="published"))

    assert updated.status == "published"
    assert updated.title == "Original title"


def test_update_treats_an_explicit_null_as_no_change(db):
    # Every field on DocumentUpdate is optional, so null means "not provided".
    # Writing it through would hit a NOT NULL column and 500 the request.
    document = a_document(db, title="Original title")

    updated = service.update_document(db, document.id, DocumentUpdate(title=None))

    assert updated.title == "Original title"


def test_the_status_values_agree_across_the_model_and_the_schema(db):
    # The Enum and the Literal are declared separately; nothing links them.
    assert set(get_args(DocumentStatus)) == set(DOCUMENT_STATUSES)
