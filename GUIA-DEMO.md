# Lote360 · Guía de la demo

Archivo de la demo: `lote360.html`. Se abre con doble clic. No necesita servidor.

---

## 1. Mail real con EmailJS (unos 15 minutos)

### Pasos

1. Creá una cuenta gratis en **emailjs.com**.
2. **Email Services → Add New Service → Gmail** (u Outlook). Conectá una casilla de la que no te importe enviar, por ejemplo una cuenta del equipo. Copiá el **Service ID** (ejemplo: `service_abc123`).
3. **Email Templates → Create New Template**. Completá:
   - **To Email:** `{{to_email}}` ← **tiene que ser exactamente esto**, si no el mail no llega a nadie.
   - **From Name:** `Lote360 · Calidad`
   - **Subject** y **Content:** copiá los textos de abajo.
   - Guardá y copiá el **Template ID** (ejemplo: `template_xyz789`).
4. **Account → General → Public Key**: copiala.
5. En la carpeta de la demo abrí `config.js` con el Bloc de notas (si no existe, copiá `config.example.js` y renombralo a `config.js`) y completá:

   ```js
   window.LOTE360_CONFIG = {
     emailjs: { publicKey: "tu_public_key", serviceId: "service_abc123", templateId: "template_xyz789" },
     recipients: "vos@empresa.com, jurado@ejemplo.com",
   };
   ```

   `recipients` admite varios mails separados por coma. `config.js` **no se sube a GitHub ni se publica**: las claves quedan solo en tu computadora.
6. Guardá, abrí `lote360.html` con doble clic, bloqueá el L-2411 y fijate que llegue el mail (revisá el spam).

> **Importante:** el mail real sale solo desde el archivo abierto en tu computadora. La versión publicada en la URL no puede conectarse a EmailJS (el sitio bloquea esas conexiones). Allá la demo funciona entera, con el aviso y el Registro de notificaciones, pero sin mail real. Para el pitch con mail en vivo, usá el archivo local.

Si algo falla o tarda más de 5 segundos, la demo sigue igual: aparece el aviso de éxito y el error solo queda en la consola del navegador (F12).

### Plantilla sugerida

**Asunto**

```
Retiro inmediato – Lote {{lote}} ({{producto}})
```

**Cuerpo**

```
Atención: se bloqueó el lote {{lote}} – {{producto}}.

Incidente: {{incidente}}
Acción: {{accion}}
Fecha y hora: {{fecha_hora}}

Comercios afectados:
{{comercios}}

Qué hacer ahora:
1. Retirar de góndola todas las unidades del lote {{lote}}.
2. Separarlas en cámara, identificadas como "NO VENDER".
3. Esperar la recolección de Logística (dentro de las próximas 24 horas).

Calidad · Lote360
```

Variables que envía la demo: `to_email`, `lote`, `producto`, `incidente`, `comercios`, `accion`, `fecha_hora`.

### Publicarla en Render (URL pública, con mail real)

1. En **dashboard.render.com**: **New → Blueprint** y elegí el repositorio `Urudata-Software/isf-prototypes-hackathon-2026-11`.
2. Render lee el `render.yaml` y te pide cuatro valores. Cargá los mismos que en `config.js`:
   - `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`
   - `DEMO_RECIPIENTS`: los mails separados por coma.
3. **Apply**. En uno o dos minutos queda en una dirección como `https://lote360.onrender.com`.
4. En EmailJS: **Account → Security → Domains**, agregá esa dirección. Así nadie puede usar tus claves desde otro sitio.

En un sitio público las claves de EmailJS quedan visibles para quien inspeccione la página. EmailJS está pensado para eso; la protección es el paso 4 y mandar los mails solo a casillas del equipo.

Cada vez que se sube un cambio a GitHub, Render vuelve a publicar la demo solo. Si cambiás una clave en Render, hacé **Manual Deploy** para que tome el valor nuevo.

---

## 2. Guion de 3 minutos

Antes de empezar: perfil **Calidad / Producción**, pantalla **Tablero**, demo recién reiniciada.

| # | Clic | Qué decís |
|---|---|---|
| 1 | *(Tablero, sin tocar nada)* | "Esto es Lote360. Una sola pantalla donde fábrica, logística, gerencia y comercios ven lo mismo: dónde está cada lote, a qué temperatura estuvo y cuándo vence." |
| 2 | Señalá las 4 tarjetas | "Quince lotes activos, cuatro alertas abiertas, siete que vencen esta semana. Y un 93 % de cumplimiento de la cadena de frío. Ese 7 % que falta es nuestra historia de hoy." |
| 3 | Clic en la alerta roja **L-2411** | "Hoy esta alerta llega por WhatsApp, tarde y de tercera mano. Acá, Calidad la ve al instante." |
| 4 | Señalá el **Recorrido del lote** | "Este es el yogur bebible de frutilla, lote 2411. Se fabricó en Planta Canelones, se empacó, pasó por la cámara, salió en el Camión 3 por la ruta Montevideo Este y hoy está en seis comercios." |
| 5 | Bajá al **gráfico** y pasá el mouse por el pico | "Y esto es lo que nadie veía: entre la tercera y la cuarta entrega, el camión llegó a 9,2 grados durante 40 minutos. Fuera del rango de 2 a 8." |
| 6 | Bajá a **Dónde está el lote** | "Y sabemos exactamente dónde está cada unidad: El Trébol en el Buceo, La Esquina en Pocitos… seis comercios, con hora de entrega." |
| 7 | Subí y clic en **Bloquear y retirar lote** | "Entonces Calidad decide. Un clic." |
| 8 | Clic en **Sí, bloquear y retirar** | "Y en este momento le llega un mail a Calidad y a los seis comercios." *(Mostrá el celular si llegó.)* |
| 9 | Señalá el aviso y el lote en rojo | "Siete destinatarios avisados. El lote queda bloqueado en todas las vistas: nadie lo puede vender ni despachar." |
| 10 | Clic en el **sobre** (arriba a la derecha) | "Y queda registrado qué se avisó, a quién y cuándo. Esto es oro para una auditoría." |
| 11 | Selector **Viendo como → Comercio** | "Ahora soy el encargado del Supermercado El Trébol. Abro el sistema y lo primero que veo es esto: aviso de retiro, cuántas unidades, qué hacer." |
| 12 | Señalá la tabla de lotes | "Y además veo qué me vence esta semana. La leche de mañana ya la tengo en rojo." |
| 13 | *(Cierre)* | "Del teléfono descompuesto a minutos. Lote360: dónde está cada lote, a qué temperatura estuvo y cuándo vence, de la fábrica a la góndola." |

Si sobra tiempo: **Vencimientos** (semáforo) o **Logística** (el Camión 3 ya tiene la tarea de recolectar en los seis comercios).

---

## 3. Checklist antes de presentar

**El día anterior**
- [ ] Claves de EmailJS cargadas en `lote360.html` y mail de prueba recibido.
- [ ] El mail **no** cae en spam. Si cae, marcalo como "No es spam" en cada casilla que vayas a mostrar.
- [ ] Ensayaste el guion entero dos veces con un cronómetro.
- [ ] Copia del archivo en un pendrive y en tu mail.

**30 minutos antes**
- [ ] Probaste la conexión a internet de la sala. Sin internet la demo funciona igual, pero no sale el mail real.
- [ ] Abriste `lote360.html` en el navegador de la notebook que vas a usar, en pantalla completa (F11).
- [ ] Zoom del navegador al 100 % y pantalla duplicada en el proyector.
- [ ] Una **segunda pestaña** con la demo abierta y lista, de respaldo.
- [ ] El celular con la casilla de mail abierta, sin sonido y con las notificaciones visibles.
- [ ] Hiciste clic en **Reiniciar demo** (abajo a la izquierda). El tablero muestra 4 alertas abiertas y 1 crítica.

**Si algo sale mal en vivo**
- [ ] No llegó el mail: seguí igual y mostrá el **Registro de notificaciones** (el sobre).
- [ ] Se trabó la pantalla: pasá a la pestaña de respaldo.
- [ ] Bloqueaste antes de tiempo: **Reiniciar demo** y seguí.
