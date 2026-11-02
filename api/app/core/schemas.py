from typing import Any

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base for everything crossing the HTTP boundary. The frontend reads camelCase."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        serialize_by_alias=True,
    )


def provided_fields(model: BaseModel) -> dict[str, Any]:
    """Fields the client actually sent. An explicit null means "unchanged", not "set to null"."""
    return model.model_dump(by_alias=False, exclude_unset=True, exclude_none=True)
