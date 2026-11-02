from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.base import Base
from app.database.session import get_db
from app.main import create_app


@pytest.fixture
def db(tmp_path) -> Generator[Session]:
    """On disk, not in memory, so it drops tzinfo the way a real POC database does."""
    engine = create_engine(f"sqlite:///{tmp_path / 'test.db'}", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine, autocommit=False, autoflush=False)()
    try:
        yield session
    finally:
        session.close()
        # Otherwise pooled connections linger until GC and surface as
        # ResourceWarning noise in an unrelated later test.
        engine.dispose()


@pytest.fixture
def client(db: Session) -> TestClient:
    app = create_app()
    app.dependency_overrides[get_db] = lambda: db

    return TestClient(app)
