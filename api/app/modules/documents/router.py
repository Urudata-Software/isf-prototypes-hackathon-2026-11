from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.authorization.dependencies import current_caller
from app.core.pagination import PageParams, PaginatedResult, page_params
from app.database.session import get_db
from app.dependencies import Ai
from app.modules.documents import service
from app.modules.documents.schemas import DocumentCreate, DocumentRead, DocumentUpdate

# Declared per router, not app-wide: app-wide would also gate /health.
router = APIRouter(
    prefix="/documents",
    tags=["documents"],
    dependencies=[Depends(current_caller)],
)

Db = Annotated[Session, Depends(get_db)]
Page = Annotated[PageParams, Depends(page_params)]


@router.get("")
def list_documents(db: Db, page: Page) -> PaginatedResult[DocumentRead]:
    items, total = service.list_documents(db, page)

    return PaginatedResult(
        items=[DocumentRead.model_validate(item) for item in items],
        total_count=total,
        page=page.page,
        page_size=page.page_size,
    )


@router.get("/{document_id}")
def get_document(document_id: int, db: Db) -> DocumentRead:
    return DocumentRead.model_validate(service.get_document(db, document_id))


@router.post("", status_code=status.HTTP_201_CREATED)
def create_document(data: DocumentCreate, db: Db) -> DocumentRead:
    return DocumentRead.model_validate(service.create_document(db, data))


@router.patch("/{document_id}")
def update_document(document_id: int, data: DocumentUpdate, db: Db) -> DocumentRead:
    return DocumentRead.model_validate(service.update_document(db, document_id, data))


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Db) -> Response:
    service.delete_document(db, document_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{document_id}/summarize")
def summarize_document(document_id: int, db: Db, ai: Ai) -> DocumentRead:
    return DocumentRead.model_validate(service.summarize_document(db, document_id, ai))
