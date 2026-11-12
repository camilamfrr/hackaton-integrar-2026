/**
 * Lógica pura de validación del Portal de Emergencia Fae (CHUNKERO).
 * Separada de la capa de presentación (DOM) para facilitar pruebas y mantenimiento.
 */

export const MAGIC_WORD = "CHUNKERO";
export const STABILITY_PROBABILITY = "73,84291 %";

/**
 * Normaliza la palabra mágica ingresada por el usuario:
 * elimina espacios exteriores y convierte a mayúsculas.
 * @param {unknown} rawInput
 * @returns {string}
 */
export function normalizeMagicWord(rawInput) {
  if (typeof rawInput !== "string") {
    return "";
  }
  return rawInput.trim().toUpperCase();
}

/**
 * Verifica si la palabra mágica normalizada coincide con CHUNKERO.
 * @param {unknown} rawInput
 * @returns {boolean}
 */
export function isMagicWordValid(rawInput) {
  return normalizeMagicWord(rawInput) === MAGIC_WORD;
}

/**
 * Evalúa las dos condiciones obligatorias para cruzar el portal.
 *
 * @param {{ hasWings: boolean, magicWord: string }} params
 * @returns {{
 *   authorized: boolean,
 *   hasWings: boolean,
 *   magicWordValid: boolean,
 *   reasonCode: "OK" | "MISSING_BOTH" | "MISSING_WINGS" | "INVALID_WORD",
 *   title: string,
 *   message: string,
 *   detail: string
 * }}
 */
export function evaluatePortalEntry({ hasWings, magicWord }) {
  const wingsOk = Boolean(hasWings);
  const wordOk = isMagicWordValid(magicWord);

  if (wingsOk && wordOk) {
    return {
      authorized: true,
      hasWings: true,
      magicWordValid: true,
      reasonCode: "OK",
      title: "Portal Interdimensional Abierto",
      message:
        "¡Gracias, humano! Ya puedo oler las papitas crocantes desde el claro del bosque.",
      detail:
        "Tus alitas de cotillón brillan con aprobación feérica y la palabra CHUNKERO resonó en las raíces antiguas. Tenés permiso oficial para ingresar al Reino Fae con el pedido.",
    };
  }

  if (!wingsOk && !wordOk) {
    const cleaned = normalizeMagicWord(magicWord);
    return {
      authorized: false,
      hasWings: false,
      magicWordValid: false,
      reasonCode: "MISSING_BOTH",
      title: "Sello Doble Activado: Acceso Denegado",
      message:
        "El portal estornudó chispas violetas y cerró sus runas de golpe.",
      detail: cleaned
        ? `Ni trajiste las alitas de cotillón ni pronunciaste CHUNKERO (el artefacto escuchó "${cleaned}"). Sin alas parecés un inspector municipal y sin la palabra correcta casi terminás convertido en helecho.`
        : "No confirmaste tus alitas de cotillón ni pronunciaste la palabra mágica. El guardián del claro no deja pasar entregas clandestinas sin vestimenta feérica.",
    };
  }

  if (!wingsOk) {
    return {
      authorized: false,
      hasWings: false,
      magicWordValid: true,
      reasonCode: "MISSING_WINGS",
      title: "Falta de Etiqueta Feérica",
      message:
        "La palabra CHUNKERO abrió una rendija, pero el protocolo de disfraz te detuvo en la puerta.",
      detail:
        "Falta confirmar que llevás puestas tus alitas de cotillón. En el Reino Fae está terminantemente prohibido repartir panchos sin alitas reglamentarias.",
    };
  }

  const cleaned = normalizeMagicWord(magicWord);
  return {
    authorized: false,
    hasWings: true,
    magicWordValid: false,
    reasonCode: "INVALID_WORD",
    title: "Conjuro Mal Pronunciado",
    message:
      "Tus alitas de cotillón pasaron la inspección, pero las runas quedaron confundidas.",
    detail: cleaned
      ? `El portal escuchó "${cleaned}" en lugar de CHUNKERO. Cuidado: pronunciar mal el conjuro reduce la estabilidad del 73,84291 % y podría convertir los panchos en piñas de pino.`
      : "No ingresaste la palabra mágica. Susurrá o escribí CHUNKERO para completar el hechizo de acceso.",
  };
}
