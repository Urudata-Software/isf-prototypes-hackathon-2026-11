"""provided_fields feeds setattr on an ORM object, so its keys must be column names."""

from app.core.schemas import CamelModel, provided_fields


class Update(CamelModel):
    title: str | None = None
    published_at: str | None = None


def test_returns_column_names_rather_than_the_camel_case_aliases():
    # "publishedAt" makes setattr add a stray attribute instead of writing the
    # column. Nothing raises, and the PATCH response still shows the new value.
    assert provided_fields(Update(published_at="2026-03-14")) == {"published_at": "2026-03-14"}


def test_omits_fields_the_caller_did_not_send():
    assert provided_fields(Update(title="Delivery note")) == {"title": "Delivery note"}


def test_treats_an_explicit_null_as_unchanged():
    assert provided_fields(Update(title=None)) == {}
