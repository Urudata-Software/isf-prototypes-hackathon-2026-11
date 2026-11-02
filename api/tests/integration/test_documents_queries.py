"""The query layer against a real database."""

from app.core.pagination import PageParams
from app.modules.documents import queries
from app.modules.documents.models import Document


def make_documents(db, count: int) -> None:
    db.add_all(
        Document(title=f"Remito {index}", content=f"Body {index}", status="draft") for index in range(count)
    )
    db.commit()


def test_count_is_independent_of_the_page(db):
    make_documents(db, 7)

    assert queries.count_documents(db) == 7
    assert len(queries.list_documents_page(db, PageParams(page=1, page_size=3))) == 3


def test_pages_do_not_overlap(db):
    make_documents(db, 5)

    first = queries.list_documents_page(db, PageParams(page=1, page_size=2))
    second = queries.list_documents_page(db, PageParams(page=2, page_size=2))

    assert {d.id for d in first}.isdisjoint({d.id for d in second})


def test_a_page_past_the_end_is_empty_rather_than_an_error(db):
    make_documents(db, 2)

    assert queries.list_documents_page(db, PageParams(page=99, page_size=20)) == []


def test_newest_first(db):
    make_documents(db, 3)

    page = queries.list_documents_page(db, PageParams(page=1, page_size=20))

    assert [d.created_at for d in page] == sorted((d.created_at for d in page), reverse=True)
