from sqlalchemy.orm import Session

from app.core.exceptions import DomainError, NotFoundError
from app.core.pagination import PageParams
from app.core.schemas import provided_fields
from app.integrations.ai.exceptions import AiUnavailableError
from app.integrations.ai.protocol import AiClient
from app.modules.documents import queries
from app.modules.documents.models import Document
from app.modules.documents.prompts.summarize import build_summarize_prompt
from app.modules.documents.schemas import DocumentCreate, DocumentUpdate


def list_documents(db: Session, page: PageParams) -> tuple[list[Document], int]:
    return queries.list_documents_page(db, page), queries.count_documents(db)


def get_document(db: Session, document_id: int) -> Document:
    document = db.get(Document, document_id)

    if document is None:
        raise NotFoundError(f"No document with id {document_id}")

    return document


def create_document(db: Session, data: DocumentCreate) -> Document:
    document = Document(**data.model_dump())
    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def update_document(db: Session, document_id: int, data: DocumentUpdate) -> Document:
    document = get_document(db, document_id)

    for field, value in provided_fields(data).items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)

    return document


def delete_document(db: Session, document_id: int) -> None:
    document = get_document(db, document_id)
    db.delete(document)
    db.commit()


def summarize_document(db: Session, document_id: int, ai: AiClient) -> Document:
    document = get_document(db, document_id)
    prompt = build_summarize_prompt(document.title, document.content)

    try:
        document.summary = ai.complete(prompt)
    except AiUnavailableError as error:
        raise DomainError(f"The summarizer is unavailable: {error}") from error

    db.commit()
    db.refresh(document)

    return document
