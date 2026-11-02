from fastapi import FastAPI

from app.core.exception_handlers import register_exception_handlers
from app.core.logging import configure_logging
from app.modules.documents.router import router as documents_router


def create_app() -> FastAPI:
    # No CORS: every request comes from the Next.js server, never a browser.
    app = FastAPI(title="ISF prototype API")

    register_exception_handlers(app)
    app.include_router(documents_router)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


configure_logging()

app = create_app()
