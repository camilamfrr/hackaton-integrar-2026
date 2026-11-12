# CHUNKERO — The Fae Delivery Quest

Videojuego 2D top-down en estilo **Fantasy Pixel Art** desarrollado para la **Hackathon 2026**.

## Historia

El hada **Lumina del Claro** tiene un antojo urgente de panchos con papitas, pero ninguna app de delivery llega al Reino Fae. Para resolverlo construyó un portal interdimensional que solo deja pasar a repartidores humanos que cumplan dos reglas:

1. Llevar puestas **alitas de cotillón**.
2. Pronunciar la palabra mágica **`CHUNKERO`**.

Durante el cruce, un antiguo indicador dimensional advierte:

> **73,84291 %** — *Probabilidad de atravesar el portal sin convertirse accidentalmente en un helecho.*

## Mecánicas

- **Pedido variable:** Cada misión solicita una cantidad aleatoria (`2`, `3` o `5` panchos con papitas) que persiste durante toda la partida.
- **Búsqueda y equipamiento de alitas:** El repartidor comienza sin alitas (llevando su uniforme y mochila térmica roja de **PedidosYa**). Debe recorrer el claro para encontrar las alitas en el suelo, acercarse y presionar **`E`** para recogerlas, y luego presionar **`E`** para equiparlas o quitarlas en su espalda.
- **Palabra mágica:** Validación de `CHUNKERO` (ignora mayúsculas y espacios exteriores).
- **Portal Interdimensional:** Bloquea el paso con mensajes graciosos si falta algún requisito; al activarse, abre su vórtice de energía y transporta al jugador al Reino Fae.
- **Exploración y colisiones:** Mapa top-down con árboles, hongos gigantes, flores luminosas y casas fantásticas con colisión física.
- **Entrega progresiva:** Al acercarse al hada y presionar `ESPACIO`, se abre el diálogo de entrega para entregar los panchos uno por uno hasta completar la cantidad solicitada.

## Controles

- **Flechas** o **W / A / S / D**: Mover al repartidor (con movimiento diagonal normalizado).
- **E**: Recoger las alitas al estar cerca del objeto / equiparlas o quitarlas una vez recogidas.
- **ESPACIO**: Interactuar con el hada cuando estás cerca.
- **Mouse / Teclado en interfaz**: Aceptar pedido, activar portal con `CHUNKERO`, entregar panchos y reiniciar misión.

## Tecnologías

- **JavaScript (ES Modules)**
- **Phaser 3** (Arcade Physics, `pixelArt: true`, múltiples escenas)
- **HTML5 & CSS3** (HUD, modales narrativos, soporte `prefers-reduced-motion`)
- Sprites y tiles **Fantasy Pixel Art** generados proceduralmente en `js/pixelSprites.js`.

## Skills utilizadas

- `frontend-design`
- `web-animation-design`
- `design-ui-ux-game` *(game UI/UX design)*
- *(Nota: `creative coding` no estaba instalada como skill en el entorno).*

## Instalación y ejecución

No requiere `npm install` ni bundler. Serví el directorio con un servidor HTTP local:

```bash
python3 -m http.server 4173
```

Luego abrí en tu navegador:

```text
http://localhost:4173
```

## Instrucciones para probar la misión

1. En la pantalla inicial, revisá el pedido del hada y presioná **ACEPTAR PEDIDO**.
2. Intentá caminar hacia el portal (derecha) sin prepararte para comprobar que el portal bloquea el ingreso e indica qué falta.
3. Presioná **PONERME ALITAS** para equipar visualmente las alitas en el personaje.
4. Escribí `chunkero` (con o sin espacios/mayúsculas) y presioná **ACTIVAR PORTAL**.
5. Caminá hacia el portal iluminado para cruzar al **Reino Fae**.
6. Explorá el bosque mágico hasta encontrar a **Lumina del Claro** (este del mapa), acercate y presioná **ESPACIO**.
7. Entregá los panchos con papitas uno por uno hasta completar el pedido y ver la pantalla de victoria.
8. Presioná **JUGAR OTRA MISIÓN** para reiniciar con un nuevo pedido.
