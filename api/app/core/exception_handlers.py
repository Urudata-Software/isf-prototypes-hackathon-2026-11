from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException

from app.core.exceptions import DomainError


def register_exception_handlers(app: FastAPI) -> None:
    """Every handler returns {"detail": "<one readable sentence>"}; the frontend shows it."""

    @app.exception_handler(DomainError)
    async def handle_domain_error(_: Request, error: DomainError) -> JSONResponse:
        return JSONResponse(status_code=error.status_code, content={"detail": error.message})

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, error: RequestValidationError) -> JSONResponse:
        # FastAPI's default is a list of per-field objects; flatten it.
        fields = ", ".join(".".join(str(part) for part in item["loc"][1:]) for item in error.errors())

        return JSONResponse(
            status_code=422,
            content={"detail": f"Invalid request. Check these fields: {fields}"},
        )

    @app.exception_handler(HTTPException)
    async def handle_http_exception(_: Request, error: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=error.status_code,
            content={"detail": error.detail},
            headers=error.headers,
        )
