/**
 * Estado persistente de la misión y lógica pura del juego.
 * Desacoplado de Phaser y del DOM para facilitar pruebas unitarias.
 */

export const MAGIC_WORD = "CHUNKERO";
export const STABILITY_PROBABILITY = "73,84291 %";
export const STABILITY_DESCRIPTION =
  "Probabilidad de atravesar el portal sin convertirse accidentalmente en un helecho.";

export const FAIRY_NAME = "Lumina del Claro";
export const ORDER_QUANTITIES = [2, 3, 5];

/**
 * Normaliza la palabra mágica ingresada: recorta espacios exteriores y pasa a mayúsculas.
 * @param {unknown} rawInput
 * @returns {string}
 */
export function normalizeMagicWord(rawInput) {
  if (typeof rawInput !== "string") return "";
  return rawInput.trim().toUpperCase();
}

/**
 * Verifica si la palabra ingresada coincide con CHUNKERO.
 * @param {unknown} rawInput
 * @returns {boolean}
 */
export function isMagicWordValid(rawInput) {
  return normalizeMagicWord(rawInput) === MAGIC_WORD;
}

/**
 * Crea un nuevo estado inicial de misión con cantidad variable (2, 3 o 5 panchos).
 * @param {number} [forcedQuantity]
 */
export function createMissionState(forcedQuantity) {
  const validQuantity =
    typeof forcedQuantity === "number" && forcedQuantity > 0
      ? forcedQuantity
      : ORDER_QUANTITIES[Math.floor(Math.random() * ORDER_QUANTITIES.length)];

  return {
    missionName: "Entrega Interdimensional Fae",
    fairyName: FAIRY_NAME,
    requestedCount: validQuantity,
    deliveredCount: 0,
    wingsEquipped: false,
    magicWordValid: false,
    lastWordAttempt: "",
    portalOpen: false,
    inFaeRealm: false,
    missionCompleted: false,
    orderStatus: "Pedido recibido",
  };
}

/**
 * Equipa las alitas de cotillón al repartidor.
 */
export function equipWings(state) {
  state.wingsEquipped = true;
  updatePortalReadiness(state);
  return state;
}

/**
 * Evalúa la palabra mágica y actualiza el estado del portal.
 * Devuelve un resultado detallado para feedback gracioso.
 */
export function submitMagicWord(state, rawInput) {
  const cleaned = normalizeMagicWord(rawInput);
  state.lastWordAttempt = cleaned;
  state.magicWordValid = cleaned === MAGIC_WORD;
  updatePortalReadiness(state);
  return evaluatePortalAccess(state);
}

/**
 * Actualiza si el portal está listo/abierto según las dos condiciones.
 */
export function updatePortalReadiness(state) {
  state.portalOpen = Boolean(state.wingsEquipped && state.magicWordValid);
  if (state.missionCompleted) {
    state.orderStatus = "Completado";
  } else if (state.inFaeRealm) {
    state.orderStatus = "En el Reino Fae";
  } else if (state.portalOpen) {
    state.orderStatus = "Portal abierto — Listo para cruzar";
  } else {
    state.orderStatus = "En preparación";
  }
}

/**
 * Evalúa si el jugador puede activar o cruzar el portal.
 * @returns {{ allowed: boolean, reasonCode: string, message: string }}
 */
export function evaluatePortalAccess(state) {
  if (state.wingsEquipped && state.magicWordValid) {
    return {
      allowed: true,
      reasonCode: "OK",
      message:
        "¡Portal activado! Caminá hacia el umbral rúnico para cruzar al Reino Fae.",
    };
  }

  if (!state.wingsEquipped && !state.magicWordValid) {
    return {
      allowed: false,
      reasonCode: "MISSING_BOTH",
      message:
        "Te faltan las alitas de cotillón y pronunciar CHUNKERO. ¡Sin disfraz ni conjuro el portal te convierte en helecho!",
    };
  }

  if (!state.wingsEquipped) {
    return {
      allowed: false,
      reasonCode: "MISSING_WINGS",
      message:
        "La palabra CHUNKERO funcionó, pero te faltan las alitas de cotillón. Presioná 'PONERME ALITAS' primero.",
    };
  }

  return {
    allowed: false,
    reasonCode: "INVALID_WORD",
    message: state.lastWordAttempt
      ? `Tus alitas brillan genial, pero el portal escuchó "${state.lastWordAttempt}" en vez de CHUNKERO.`
      : "Tus alitas están listas, pero falta escribir la palabra mágica CHUNKERO.",
  };
}

/**
 * Devuelve cuántos panchos faltan entregar.
 */
export function getPendingCount(state) {
  return Math.max(0, state.requestedCount - state.deliveredCount);
}

/**
 * Entrega una unidad de pancho con papitas al hada.
 * No permite entregar más unidades que las solicitadas ni completar antes de tiempo.
 */
export function deliverOnePancho(state) {
  if (!state.inFaeRealm) {
    return {
      delivered: false,
      completed: false,
      message: "Primero tenés que cruzar el portal hacia el Reino Fae.",
    };
  }

  if (state.missionCompleted || state.deliveredCount >= state.requestedCount) {
    return {
      delivered: false,
      completed: true,
      message: "El pedido ya fue entregado por completo.",
    };
  }

  state.deliveredCount += 1;
  const pending = getPendingCount(state);

  if (pending === 0) {
    state.missionCompleted = true;
    state.orderStatus = "Completado";
    return {
      delivered: true,
      completed: true,
      message:
        "¡DELIVERY INTERDIMENSIONAL COMPLETADO! El Reino Fae vuelve a ser feliz.",
    };
  }

  return {
    delivered: true,
    completed: false,
    message: `¡Entregaste 1 pancho con papitas! Todavía faltan ${pending}.`,
  };
}
