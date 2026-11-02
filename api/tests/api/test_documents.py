"""The contract web/src/lib/api.ts depends on. Each assertion fails silently if broken."""

from app.core.config import settings


def create(client, **overrides):
    payload = {"title": "Remito 4821", "content": "Arrived without a purchase order."} | overrides

    return client.post("/documents", json=payload)


def test_create_returns_201_with_the_entity(client):
    response = create(client)

    assert response.status_code == 201
    assert response.json()["title"] == "Remito 4821"


def test_ids_serialize_as_strings(client):
    document = create(client).json()

    assert isinstance(document["id"], str)


def test_response_keys_are_camel_case(client):
    document = create(client).json()

    assert "createdAt" in document
    assert "created_at" not in document


def test_created_at_carries_a_utc_offset(client):
    # SQLite drops tzinfo; without an offset the browser reads UTC as local time.
    created_at = create(client).json()["createdAt"]

    assert created_at.endswith("+00:00") or created_at.endswith("Z")


def test_list_returns_the_pagination_envelope(client):
    create(client)

    body = client.get("/documents", params={"page": 1, "pageSize": 5}).json()

    assert set(body) == {"items", "totalCount", "page", "pageSize"}
    assert body["totalCount"] == 1
    assert body["pageSize"] == 5


def test_page_size_is_read_from_the_camel_case_query_param(client):
    for index in range(3):
        create(client, title=f"Remito {index}")

    body = client.get("/documents", params={"pageSize": 2}).json()

    assert len(body["items"]) == 2
    assert body["totalCount"] == 3


def test_patch_applies_a_partial_update(client):
    document_id = create(client).json()["id"]

    response = client.patch(f"/documents/{document_id}", json={"status": "published"})

    assert response.status_code == 200
    assert response.json()["status"] == "published"
    assert response.json()["title"] == "Remito 4821"


def test_delete_returns_204_with_no_body(client):
    document_id = create(client).json()["id"]

    response = client.delete(f"/documents/{document_id}")

    assert response.status_code == 204
    assert response.content == b""


def test_unknown_id_returns_404_with_a_readable_detail(client):
    response = client.get("/documents/9999")

    assert response.status_code == 404
    assert isinstance(response.json()["detail"], str)


def test_validation_errors_return_a_single_readable_detail(client):
    response = create(client, title="")

    assert response.status_code == 422
    assert isinstance(response.json()["detail"], str)


def test_summarize_uses_the_fake_client_when_no_credential_is_set(client):
    document_id = create(client, title="Invoice 2024-0871").json()["id"]

    response = client.post(f"/documents/{document_id}/summarize")

    assert response.status_code == 200
    assert response.json()["summary"]


def test_unauthenticated_requests_are_allowed_while_auth_is_unconfigured(client):
    # The frontend's own server is the only caller of a prototype. If this starts
    # returning 401, ENTRA_TENANT_ID leaked into the environment.
    assert client.get("/documents").status_code == 200


def test_a_malformed_token_is_rejected_with_401_not_500(client, monkeypatch):
    # A 500 here would show the user a broken page instead of a sign-in redirect.
    monkeypatch.setattr(settings, "entra_tenant_id", "00000000-0000-0000-0000-000000000000")
    monkeypatch.setattr(settings, "entra_api_audience", "api://test")

    response = client.get("/documents", headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401
    assert isinstance(response.json()["detail"], str)


def test_a_missing_token_is_rejected_once_auth_is_on(client, monkeypatch):
    monkeypatch.setattr(settings, "entra_tenant_id", "00000000-0000-0000-0000-000000000000")
    monkeypatch.setattr(settings, "entra_api_audience", "api://test")

    response = client.get("/documents")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
