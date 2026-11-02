from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.authorization.policies import Caller, caller_from_claims, demo_caller
from app.core.security import InvalidTokenError, auth_enabled, verify_bearer_token

bearer = HTTPBearer(auto_error=False)

UNAUTHENTICATED_HEADERS = {"WWW-Authenticate": "Bearer"}


def unauthenticated(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers=UNAUTHENTICATED_HEADERS,
    )


def current_caller(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> Caller:
    if not auth_enabled():
        return demo_caller()

    if credentials is None:
        raise unauthenticated("Missing bearer token")

    try:
        claims = verify_bearer_token(credentials.credentials)
    except InvalidTokenError as error:
        raise unauthenticated(str(error)) from error

    return caller_from_claims(claims)


CurrentCaller = Annotated[Caller, Depends(current_caller)]
