import {
  createMissionState,
  deliverOnePancho,
  equipWings,
  getPendingCount,
  submitMagicWord,
  STABILITY_DESCRIPTION,
  STABILITY_PROBABILITY,
} from "./gameState.js";
import { PrepAndPortalScene } from "./scenes/PrepAndPortalScene.js";
import { FaeRealmScene } from "./scenes/FaeRealmScene.js";

document.addEventListener("DOMContentLoaded", () => {
  let missionState = createMissionState();

  // Referencias del HUD
  const hudMission = document.getElementById("hud-mission");
  const hudOrder = document.getElementById("hud-order");
  const hudPending = document.getElementById("hud-pending");
  const hudPortal = document.getElementById("hud-portal");
  const hudStabilityValue = document.getElementById("hud-stability-value");
  const hudStabilityDesc = document.getElementById("hud-stability-desc");

  // Panel de preparación (Nivel 2)
  const prepBar = document.getElementById("prep-bar");
  const btnEquipWings = document.getElementById("btn-equip-wings");
  const magicWordForm = document.getElementById("magic-word-form");
  const inputMagicWord = document.getElementById("input-magic-word");
  const prepFeedback = document.getElementById("prep-feedback");

  // Modales (Nivel 1, Nivel 5 Entrega, Victoria)
  const modalIntro = document.getElementById("modal-intro");
  const introFairyName = document.getElementById("intro-fairy-name");
  const introOrderCount = document.getElementById("intro-order-count");
  const btnAcceptOrder = document.getElementById("btn-accept-order");

  const modalDelivery = document.getElementById("modal-delivery");
  const deliveryFairyName = document.getElementById("delivery-fairy-name");
  const deliveryRequested = document.getElementById("delivery-requested");
  const deliveryDelivered = document.getElementById("delivery-delivered");
  const deliveryPending = document.getElementById("delivery-pending");
  const deliveryFeedback = document.getElementById("delivery-feedback");
  const btnDeliverOne = document.getElementById("btn-deliver-one");
  const btnCloseDelivery = document.getElementById("btn-close-delivery");

  const modalVictory = document.getElementById("modal-victory");
  const victorySummary = document.getElementById("victory-summary");
  const btnRestartGame = document.getElementById("btn-restart-game");

  const gameToast = document.getElementById("game-toast");
  let toastTimeoutId = null;

  hudStabilityValue.textContent = STABILITY_PROBABILITY;
  hudStabilityDesc.textContent = STABILITY_DESCRIPTION;

  function getActiveScene() {
    if (!window.chunkeroGame) return null;
    const active = window.chunkeroGame.scene.getScenes(true);
    return active[0] || null;
  }

  function isModalOpen() {
    return !modalIntro.hidden || !modalDelivery.hidden || !modalVictory.hidden;
  }

  function syncKeyboardLock() {
    const scene = getActiveScene();
    if (scene) {
      scene.events.emit("modal-toggled", isModalOpen());
    }
  }

  function showToast(message, type = "info") {
    if (toastTimeoutId !== null) {
      window.clearTimeout(toastTimeoutId);
    }
    gameToast.textContent = message;
    gameToast.dataset.type = type;
    gameToast.hidden = false;
    toastTimeoutId = window.setTimeout(() => {
      gameToast.hidden = true;
    }, 3600);
  }

  function updateHUD() {
    const pending = getPendingCount(missionState);
    hudMission.textContent = `${missionState.missionName} (${missionState.fairyName})`;
    hudOrder.textContent = `${missionState.requestedCount} panchos con papitas`;
    hudPending.textContent = `${pending} pendiente${pending === 1 ? "" : "s"}`;
    hudPortal.textContent = missionState.orderStatus;
    hudPortal.dataset.open = String(missionState.portalOpen || missionState.inFaeRealm);

    btnEquipWings.disabled = missionState.wingsEquipped;
    btnEquipWings.textContent = missionState.wingsEquipped
      ? "ALITAS EQUIPADAS ✓"
      : "PONERME ALITAS";

    introFairyName.textContent = missionState.fairyName;
    introOrderCount.textContent = `${missionState.requestedCount} panchos con papitas`;

    deliveryFairyName.textContent = missionState.fairyName;
    deliveryRequested.textContent = String(missionState.requestedCount);
    deliveryDelivered.textContent = String(missionState.deliveredCount);
    deliveryPending.textContent = String(pending);
  }

  const uiBridge = {
    isModalOpen,
    showToast,
    onEnterFaeRealm() {
      prepBar.hidden = true;
      updateHUD();
    },
    openDeliveryModal() {
      updateHUD();
      deliveryFeedback.textContent =
        "Entregá los panchos con papitas uno por uno para completar el pedido.";
      modalDelivery.hidden = false;
      syncKeyboardLock();
      btnDeliverOne.focus();
    },
  };

  // Inicializar Phaser 3
  const config = {
    type: Phaser.AUTO,
    parent: "game-canvas-container",
    width: 800,
    height: 520,
    pixelArt: true,
    roundPixels: true,
    backgroundColor: "#09140f",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: "arcade",
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scene: [PrepAndPortalScene, FaeRealmScene],
  };

  const game = new Phaser.Game(config);
  window.chunkeroGame = game;
  game.registry.set("missionState", missionState);
  game.registry.set("uiBridge", uiBridge);

  // Evitar que Phaser capture teclas mientras se escribe la palabra mágica
  inputMagicWord.addEventListener("focus", () => {
    if (game.input?.keyboard) {
      game.input.keyboard.enabled = false;
    }
  });
  inputMagicWord.addEventListener("blur", () => {
    if (game.input?.keyboard) {
      game.input.keyboard.enabled = true;
    }
  });

  // Nivel 1: Aceptar pedido
  btnAcceptOrder.addEventListener("click", () => {
    modalIntro.hidden = true;
    prepBar.hidden = false;
    syncKeyboardLock();
    showToast("Equipate las alitas, pronunciá CHUNKERO y caminá hacia el portal.", "info");
  });

  // Nivel 2: Equipar alitas
  btnEquipWings.addEventListener("click", () => {
    equipWings(missionState);
    updateHUD();
    const scene = getActiveScene();
    if (scene) {
      scene.events.emit("wings-equipped");
    }
    prepFeedback.textContent = missionState.magicWordValid
      ? "¡Todo listo! Caminá hacia el portal para cruzar al Reino Fae."
      : "Alitas equipadas. Ahora ingresá la palabra mágica CHUNKERO.";
    showToast("¡Alitas de cotillón equipadas!", "success");
  });

  // Nivel 2: Palabra mágica CHUNKERO
  magicWordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = submitMagicWord(missionState, inputMagicWord.value);
    updateHUD();
    const scene = getActiveScene();
    if (scene) {
      scene.events.emit("portal-updated");
    }

    prepFeedback.textContent = result.message;
    showToast(result.message, result.allowed ? "success" : "error");
    inputMagicWord.blur();
  });

  // Nivel 5: Entregar panchos de a uno
  btnDeliverOne.addEventListener("click", () => {
    const res = deliverOnePancho(missionState);
    updateHUD();

    const scene = getActiveScene();
    if (res.delivered && scene) {
      scene.events.emit("pancho-delivered");
    }

    deliveryFeedback.textContent = res.message;

    if (res.completed) {
      modalDelivery.hidden = true;
      victorySummary.textContent = `Entregaste los ${missionState.requestedCount} panchos con papitas a ${missionState.fairyName} sin convertirte en helecho.`;
      modalVictory.hidden = false;
      syncKeyboardLock();
      if (scene) {
        scene.events.emit("mission-completed");
      }
      btnRestartGame.focus();
    }
  });

  btnCloseDelivery.addEventListener("click", () => {
    modalDelivery.hidden = true;
    syncKeyboardLock();
  });

  // Reiniciar partida con nueva cantidad variable
  btnRestartGame.addEventListener("click", () => {
    missionState = createMissionState();
    game.registry.set("missionState", missionState);

    inputMagicWord.value = "";
    prepFeedback.textContent = "Equipate las alitas e ingresá CHUNKERO para activar el portal.";
    prepBar.hidden = true;
    modalVictory.hidden = true;
    modalDelivery.hidden = true;
    modalIntro.hidden = false;

    updateHUD();
    game.scene.stop("FaeRealmScene");
    game.scene.start("PrepAndPortalScene");
    btnAcceptOrder.focus();
  });

  // Mostrar Nivel 1 al iniciar
  updateHUD();
  modalIntro.hidden = false;
});
