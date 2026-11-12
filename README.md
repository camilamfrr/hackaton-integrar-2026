# CHUNKERO — The Fae Delivery Quest

**Hackathon 2026 · La Feria de Soluciones Improbables**  
**Pabellón:** 3 — Mundos Inventados

---

## Problema

Un hada del Reino Fae (**Lumina del Claro**) quiere comer panchos con papas fritas, pero ningún servicio de delivery humano puede acceder a su dimensión.

## Solución

Videojuego 2D top-down en estilo **Fantasy Pixel Art** donde controlás a una persona repartidora de delivery (con uniforme y mochila térmica roja de **PedidosYa**) que debe buscar sus **alitas de cotillón** en el claro, equipárselas, pronunciar la palabra mágica **`CHUNKERO`** y atravesar un portal interdimensional hacia el Reino Fae para entregar el pedido completo.

## Ingrediente improbable

**N.º 3 — Comprobante oficial:**  
Al completar exactamente la cantidad de panchos solicitados, el juego emite el **COMPROBANTE OFICIAL DE ENTREGA — REINO FAE**, con el sello mágico del Reino Fae, la firma ficticia de **Lumina del Claro**, fecha/hora de emisión y un botón para **descargar el archivo PDF real** (`comprobante-chunkero-reino-fae.pdf`).

---

## Mecánicas

- **Pedido variable:** Cada partida solicita una cantidad variable (`2`, `3` o `5` panchos con papitas) que se conserva durante toda la misión.
- **Búsqueda y equipamiento de alitas (`E`):** El repartidor comienza sin alitas. Debe explorar el escenario inicial, acercarse al objeto y presionar `E` para recogerlo, y luego presionar `E` para equiparlas o quitarlas en su espalda sin tapar la mochila de **PedidosYa**.
- **Transformación en helecho:** Si intentás cruzar el portal sin tener las alitas equipadas, el repartidor se transforma visualmente en un helecho mágico y muestra un modal explicativo recuperable (sin perder el progreso ni el pedido). Si tenés las alitas equipadas pero la palabra clave es incorrecta, muestra un rechazo específico de contraseña sin transformarte.
- **Potenciador Coca-Cola:** Lata coleccionable escondida en el escenario inicial. Al tomarla con `E`, aumenta la velocidad y el tamaño del personaje por un máximo de **45 segundos**, con cuenta regresiva visible en el HUD que persiste entre escenas y se restablece automáticamente al expirar.
- **Entrega incremental exacta:** En el Reino Fae, al acercarte a **Lumina del Claro** y presionar `ESPACIO`, entregás los panchos uno por uno controlando `Solicitados`, `Entregados` y `Pendientes` sin permitir entregas excedentes.

## Controles

- **Flechas** o **W / A / S / D**: Mover al repartidor (con movimiento diagonal normalizado).
- **E**: Recoger objetos cercanos (alitas / Coca-Cola) y equipar o quitar las alitas.
- **ESPACIO**: Interactuar con el hada en el Reino Fae.
- **Interfaz**: Ingresar palabra mágica `CHUNKERO`, entregar panchos y descargar el comprobante PDF.

## Tecnologías

- **HTML5 & CSS3** (HUD, modales narrativos, soporte `prefers-reduced-motion`)
- **JavaScript (ES Modules)** con arquitectura modular (`gameState.js`, `pixelSprites.js`, `playerController.js`, `pdfGenerator.js`, `scenes/`)
- **Phaser 3.80.1** (incluido localmente en `vendor/phaser.min.js` para ejecución **100% offline**)
- **Generador PDF 1.4 puro** sin dependencias externas (`js/pdfGenerator.js`)

## Herramientas de IA utilizadas

- **Antigravity (Google DeepMind / Gemini)** como asistente de diseño, programación y verificación automatizada en navegador.
- **Agent Skills aplicadas:** `frontend-design`, `web-animation-design`, `design-ui-ux-game`.

## Instalación y ejecución (offline)

No requiere `npm install` ni conexión a internet. Serví el directorio con cualquier servidor HTTP estático:

```bash
python3 -m http.server 4173
```

Luego abrí en tu navegador:

```text
http://localhost:4173
```

## Guía de prueba (en menos de 1 minuto)

1. Presioná **ACEPTAR PEDIDO** (observá la cantidad solicitada en el HUD).
2. *(Opcional)* Acercate a la lata roja abajo a la derecha y presioná **`E`** para activar el turbo **Coca-Cola (45s)**.
3. *(Opcional)* Caminá hacia el portal sin alitas para ver la **transformación en helecho** y presioná **VOLVER A INTENTARLO**.
4. Buscá las alitas arriba a la izquierda, acercate y presioná **`E`** para recogerlas y nuevamente **`E`** para equiparlas.
5. Escribí **`CHUNKERO`** (no distingue mayúsculas ni espacios), presioná **ACTIVAR PORTAL** y caminá hacia el portal.
6. En el Reino Fae, seguí el sendero hacia **Lumina del Claro** (este), presioná **`ESPACIO`** y entregá todos los panchos.
7. Verificá el **Comprobante Oficial** y presioná **DESCARGAR COMPROBANTE PDF**.

## Registro de SHA (último commit válido)

- **Rama:** `dev`
- **Commit base verificado previo a M4:** `e85c0ea` *(actualizar con el SHA final tras aprobar el commit de M4).*
