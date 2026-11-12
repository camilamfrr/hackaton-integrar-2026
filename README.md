# CHUNKERO — Portal de Emergencia Fae

**Pabellón:** 3 — Mundos Inventados (Hackathon 2026 — Feria de Soluciones Improbables)

## Problema

Una hada del Reino Fae tiene un antojo urgente de **panchos con papitas**, pero ningún servicio de delivery tradicional cruza las fronteras dimensionales hacia el mundo mágico.

## Solución

**CHUNKERO** es un prototipo web interactivo con estética de videojuego narrativo fantástico que simula un portal interdimensional de emergencia. Para que un humano pueda cruzar con el pedido sin incidentes, el portal exige cumplir dos condiciones de seguridad feérica:

1. Confirmar que lleva puestas **alitas de cotillón**.
2. Pronunciar o escribir correctamente la palabra mágica **`CHUNKERO`** (sin distinguir mayúsculas ni espacios exteriores).

## Ingrediente improbable

El artefacto antiguo muestra de forma permanente su indicador de estabilidad dimensional:

> **73,84291 %** — *Probabilidad de llegar al Reino Fae sin convertirse accidentalmente en un helecho.*

## Tecnologías utilizadas

- **HTML5** semántico e ilustraciones vectoriales **SVG** artesanales (bosque encantado, portal rúnico, hada y panchos con papitas).
- **CSS3** con variables de diseño, transiciones suaves, animaciones GPU-friendly y soporte completo para `prefers-reduced-motion`.
- **JavaScript (ES Modules)** puro, con la lógica de validación desacoplada en `js/validation.js`, partículas ambientales en `js/particles.js` y controlador de interfaz en `js/app.js`.

## Skills utilizadas

- `frontend-design`
- `web-animation-design`
- `design-ui-ux-game`

## Instrucciones para ejecutar y probar

Al utilizar ES Modules (`<script type="module">`), el proyecto debe servirse desde un servidor HTTP local (por seguridad del navegador frente a `file://`):

```bash
python3 -m http.server 4173
```

Luego abrí en el navegador:

```text
http://localhost:4173
```

### Casos de prueba sugeridos

1. **Acceso autorizado:** Presioná **ABRIR PORTAL**, marcá el checkbox de alitas de cotillón, escribí `  chunkero  ` (con minúsculas o espacios) y enviá. El portal se abrirá mostrando el mensaje de agradecimiento y los panchos con papitas.
2. **Solo alitas faltantes:** Desmarcá las alitas y escribí `CHUNKERO`. El portal se cerrará indicando que falta la indumentaria feérica.
3. **Solo palabra incorrecta:** Marcá las alitas y escribí otra palabra (o dejá el campo vacío). El portal mostrará el error de conjuro mal pronunciado.
4. **Ambas condiciones incorrectas:** Enviá sin marcar alitas y sin escribir `CHUNKERO` para verificar el sello doble y el botón **Volver a intentarlo**.
