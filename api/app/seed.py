"""Synthetic demo data. Idempotent: does nothing if any document exists."""

from app.database.session import SessionFactory
from app.modules.documents.models import Document

DOCUMENTS = [
    {
        "title": "Factura 2024-0871 — Nordwind Logistics",
        "content": (
            "Factura 2024-0871 del 14 de marzo de 2024 de Nordwind Logistics por 14.320 USD. "
            "Cubre tres entregas: 4.100 USD contra la orden PO-2291, 9.070 USD contra la "
            "orden PO-2288 y 1.150 USD sin referencia de orden. Plazo de pago 30 días."
        ),
        "status": "review",
    },
    {
        "title": "Contrato de servicios — Peralta y Asociados",
        "content": (
            "Contrato de servicios a dos años con vigencia desde el 1 de enero de 2024, con "
            "renovación automática salvo aviso 60 días antes del fin del plazo. La "
            "responsabilidad se limita a doce meses de honorarios. Jurisdicción: Uruguay."
        ),
        "status": "published",
    },
    {
        "title": "Alta de proveedor — Peralta y Asociados",
        "content": (
            "El RUT (213456780012) y los datos bancarios están presentes y verificados. El "
            "certificado de seguro del legajo venció el 31 de marzo de 2024 y no fue "
            "sustituido. Se espera un certificado vigente para poder aprobar al proveedor."
        ),
        "status": "draft",
    },
    {
        # The awkward one: nothing to summarize, yet marked finished.
        "title": "Remito — escaneo ilegible",
        "content": "La página escaneada está en blanco. No se localizó el original.",
        "status": "published",
    },
]


def seed() -> None:
    db = SessionFactory()
    try:
        if db.query(Document).first() is not None:
            print("Documents already present — nothing to seed.")
            return

        db.add_all(Document(**document) for document in DOCUMENTS)
        db.commit()
        print(f"Seeded {len(DOCUMENTS)} documents.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
