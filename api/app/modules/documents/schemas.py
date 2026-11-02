from datetime import UTC, datetime
from typing import Literal

from pydantic import Field, field_serializer

from app.core.schemas import CamelModel

DocumentStatus = Literal["draft", "review", "published"]


class DocumentRead(CamelModel):
    id: int
    title: str
    content: str
    status: DocumentStatus
    summary: str | None
    created_at: datetime

    # The frontend types id as a string, so int and UUID keys are interchangeable.
    @field_serializer("id")
    def serialize_id(self, value: int) -> str:
        return str(value)

    @field_serializer("created_at")
    def serialize_created_at(self, value: datetime) -> str:
        # SQLite drops tzinfo. Without an offset the browser reads UTC as local time.
        if value.tzinfo is None:
            value = value.replace(tzinfo=UTC)

        return value.isoformat()


class DocumentCreate(CamelModel):
    title: str = Field(min_length=1, max_length=200)
    content: str = Field(min_length=1)
    status: DocumentStatus = "draft"


class DocumentUpdate(CamelModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)
    status: DocumentStatus | None = None
