/**
 * Estado persistente de la misión y lógica pura del juego.
 * Desacoplado de Phaser y del DOM para facilitar pruebas unitarias.
 */

export const MAGIC_WORD = "CHUNKERO";
export const FAIRY_NAME = "Lumina del Claro";
export const ORDER_QUANTITIES = [2, 3, 5];

export function normalizeMagicWord(rawInput) {
  if (typeof rawInput !== "string") return "";
  return rawInput.trim().toUpperCase();
}

export function isMagicWordValid(rawInput) {
  return normalizeMagicWord(rawInput) === MAGIC_WORD;
}

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
    wingsCollected: false,
    wingsEquipped: false,
    magicWordValid: false,
    lastWordAttempt: "",
    transformedIntoFern: false,
    portalOpen: false,
    inFaeRealm: false,
    missionCompleted: false,
    orderStatus: "Pedido recibido",
  };
}

/**
 * Incorpora las alitas de cotillón al inventario tras recogerlas en el escenario.
 */
export function collectWings(state) {
  if (state.wingsCollected) return false;
  state.wingsCollected = true;
  updatePortalReadiness(state);
  return true;
}

/**
 * Equipa o quita las alitas de cotillón (solo si ya fueron recogidas).
 * @returns {{ changed: boolean, equipped: boolean }}
 */
export function toggleWings(state) {
  if (!state.wingsCollected) {
    return { changed: false, equipped: false };
  }
  state.wingsEquipped = !state.wingsEquipped;
  updatePortalReadiness(state);
  return { changed: true, equipped: state.wingsEquipped };
}

export function submitMagicWord(state, rawInput) {
  const cleaned = normalizeMagicWord(rawInput);
  state.lastWordAttempt = cleaned;
  state.magicWordValid = cleaned === MAGIC_WORD;
  updatePortalReadiness(state);
  return evaluatePortalAccess(state);
}

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

export function evaluatePortalAccess(state) {
  if (state.wingsEquipped && state.magicWordValid) {
    return {
      allowed: true,
      transformsToFern: false,
      reasonCode: "OK",
      message:
        "¡Portal activado! Caminá hacia el umbral rúnico para cruzar al Reino Fae.",
    };
  }

  if (!state.wingsCollected) {
    return {
      allowed: false,
      transformsToFern: true,
      reasonCode: "WINGS_NOT_COLLECTED",
      message: state.magicWordValid
        ? "Intentaste cruzar sin alitas de cotillón y la magia del portal te convirtió en un helecho."
        : "¡Incidente botánico! Sin alitas de cotillón ni la palabra CHUNKERO, el portal te transformó en un helecho.",
    };
  }

  if (!state.wingsEquipped && !state.magicWordValid) {
    return {
      allowed: false,
      transformsToFern: true,
      reasonCode: "MISSING_BOTH",
      message:
        "Tenías las alitas guardadas en la mochila sin equipar y faltó CHUNKERO: el portal te convirtió en un helecho.",
    };
  }

  if (!state.wingsEquipped) {
    return {
      allowed: false,
      transformsToFern: true,
      reasonCode: "WINGS_NOT_EQUIPPED",
      message:
        "¡Te olvidaste de ponerte las alitas (tecla E)! Al cruzar sin ellas, el portal te convirtió en un helecho.",
    };
  }

  return {
    allowed: false,
    transformsToFern: false,
    reasonCode: "INVALID_WORD",
    message: state.lastWordAttempt
      ? `Tus alitas te protegieron de volverte helecho, pero el portal escuchó "${state.lastWordAttempt}" en vez de CHUNKERO.`
      : "Tus alitas te protegieron de volverte helecho, pero falta ingresar la palabra mágica CHUNKERO.",
  };
}

export function getPendingCount(state) {
  return Math.max(0, state.requestedCount - state.deliveredCount);
}

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
