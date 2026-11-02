class DomainError(Exception):
    """Something the caller did wrong, or an operation that cannot complete.

    Carries a message meant to be read by a person, because the frontend surfaces
    `detail` directly — see web/src/lib/api.ts.
    """

    status_code = 400

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(DomainError):
    status_code = 404
