from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./prototype.db"
    openai_model: str = "gpt-4o-mini"

    # Every credential stays optional: an absent one is what selects a fake.
    openai_api_key: str | None = None
    entra_tenant_id: str | None = None
    entra_api_audience: str | None = None

    @property
    def entra_jwks_url(self) -> str:
        return f"https://login.microsoftonline.com/{self.entra_tenant_id}/discovery/v2.0/keys"

    @property
    def entra_valid_issuers(self) -> set[str]:
        # Entra only issues v2 tokens once the app manifest sets
        # accessTokenAcceptedVersion: 2; v1 tokens carry the sts.windows.net issuer.
        return {
            f"https://login.microsoftonline.com/{self.entra_tenant_id}/v2.0",
            f"https://sts.windows.net/{self.entra_tenant_id}/",
        }


settings = Settings()
