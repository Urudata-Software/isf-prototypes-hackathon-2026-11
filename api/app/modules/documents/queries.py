from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.pagination import PageParams
from app.modules.documents.models import Document


def count_documents(db: Session) -> int:
    return db.scalar(select(func.count()).select_from(Document)) or 0


def list_documents_page(db: Session, page: PageParams) -> list[Document]:
    # created_at is not unique, so id breaks ties. Without it OFFSET/LIMIT can
    # repeat a row on two pages and skip another.
    statement = (
        select(Document)
        .order_by(Document.created_at.desc(), Document.id.desc())
        .offset(page.offset)
        .limit(page.page_size)
    )

    return list(db.scalars(statement).all())
