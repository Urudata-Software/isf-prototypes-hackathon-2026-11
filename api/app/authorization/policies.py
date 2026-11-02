from dataclasses import dataclass

DEMO_SUBJECT = "demo-user"
# RFC 2606 reserves .invalid, so this address can never resolve.
DEMO_EMAIL = "demo@prototype.invalid"


@dataclass(frozen=True)
class Caller:
    subject: str
    email: str | None
    is_demo: bool


def demo_caller() -> Caller:
    return Caller(subject=DEMO_SUBJECT, email=DEMO_EMAIL, is_demo=True)


# Which of these Entra emits depends on the tenant; email is often absent.
EMAIL_CLAIMS = ("email", "preferred_username", "upn", "unique_name")


def caller_from_claims(claims: dict[str, object]) -> Caller:
    # oid is stable per tenant; sub is scoped per app registration.
    subject = claims.get("oid") or claims.get("sub")
    email = next((claims[name] for name in EMAIL_CLAIMS if claims.get(name)), None)

    return Caller(
        subject=str(subject) if subject is not None else "unknown",
        email=str(email) if email is not None else None,
        is_demo=False,
    )
