from functools import lru_cache

import jwt
from jwt import PyJWKClient

from app.core.config import settings

ALGORITHMS = ["RS256"]


class InvalidTokenError(Exception):
    pass


def auth_enabled() -> bool:
    return bool(settings.entra_tenant_id)


@lru_cache(maxsize=1)
def _jwks() -> PyJWKClient:
    return PyJWKClient(settings.entra_jwks_url)


def verify_bearer_token(token: str) -> dict[str, object]:
    if not settings.entra_api_audience:
        raise InvalidTokenError("ENTRA_API_AUDIENCE is not set")

    try:
        signing_key = _jwks().get_signing_key_from_jwt(token)
        claims: dict[str, object] = jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
            audience=settings.entra_api_audience,
            options={"verify_iss": False},  # checked below; two forms are accepted
        )
    except jwt.PyJWTError as error:
        raise InvalidTokenError(str(error)) from error
    except Exception as error:
        # A JWKS fetch failure is still a token we cannot verify, so still a 401.
        raise InvalidTokenError(f"Could not verify the token: {error}") from error

    if claims.get("iss") not in settings.entra_valid_issuers:
        raise InvalidTokenError(f"Unexpected issuer {claims.get('iss')!r}")

    return claims
