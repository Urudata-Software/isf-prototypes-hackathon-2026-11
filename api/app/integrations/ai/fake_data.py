"""Canned completions for FakeAiClient, keyed on words appearing in the prompt."""

CANNED_COMPLETIONS = {
    "factura": (
        "La factura 2024-0871 de Nordwind Logistics totaliza 14.320 USD en tres entregas. "
        "Dos coinciden con sus órdenes de compra; la tercera, de 1.150 USD, no tiene "
        "referencia de orden, así que requiere revisión antes del pago."
    ),
    "contrato": (
        "Contrato de servicios a dos años que se renueva automáticamente salvo aviso 60 "
        "días antes del fin del plazo. La responsabilidad se limita a doce meses de "
        "honorarios y la jurisdicción es Uruguay."
    ),
    "alta de proveedor": (
        "El alta de Peralta y Asociados está completa salvo por el seguro: el RUT y los "
        "datos bancarios están verificados, pero el certificado del legajo venció en marzo "
        "y no fue sustituido."
    ),
    "ilegible": (
        "No hay nada para resumir. El escaneo está en blanco y no se localizó el documento "
        "original, así que el registro no puede evaluarse tal como está."
    ),
}

GENERIC_COMPLETION = (
    "El documento expone los antecedentes, las partes involucradas y las fechas "
    "relevantes, y cierra sin indicar quién lo aprueba."
)
