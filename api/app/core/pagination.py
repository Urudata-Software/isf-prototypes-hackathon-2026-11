from typing import Annotated

from fastapi import Query
from pydantic import BaseModel

from app.core.schemas import CamelModel


class PageParams(BaseModel):
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def page_params(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100, alias="pageSize")] = 20,
) -> PageParams:
    return PageParams(page=page, page_size=page_size)


class PaginatedResult[T](CamelModel):
    items: list[T]
    total_count: int
    page: int
    page_size: int
