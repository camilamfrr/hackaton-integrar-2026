import {
  createMissionState,
  deliverOnePancho,
  getPendingCount,
  submitMagicWord,
} from "./gameState.js";
import { PrepAndPortalScene } from "./scenes/PrepAndPortalScene.js";
import { FaeRealmScene } from "./scenes/FaeRealmScene.js";

document.addEventListener("DOMContentLoaded", () => {
  let missionState = createMissionState();

  const hudMission = document.getElementById("hud-mission");
  const hudOrder = document.getElementById("hud-order");
  const hudPending = document.getElementById("hud-pending");
  const hudWings = document.getElementById("hud-wings");
  const hudPortal = document.getElementById("hud-portal");

  const prepBar = document.getElementById("prep-bar");
  const magicWordForm = document.getElementById("magic-word-form");
  const inputMagicWord = document.getElementById("input-magic-word");
  const prepFeedback = document.getElementById("prep-feedback");

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

  const modalRejected = document.getElementById("modal-rejected");
  const rejectedTitle = document.getElementById("rejected-title");
  const rejectedMessage = document.getElementById("rejected-message");
  const rejectedTip = document.getElementById("rejected-tip");
  const btnCloseRejected = document.getElementById("btn-close-rejected");

  const gameToast = document.getElementById("game-toast");
  let toastTimeoutId = null;

  function getActiveScene() {
    if (!window.chunkeroGame) return null;
    const active = window.chunkeroGame.scene.getScenes(true);
    return active[0] || null;
  }

  function isModalOpen() {
    return (
      !modalIntro.hidden ||
      !modalDelivery.hidden ||
      !modalVictory.hidden ||
      !modalRejected.hidden
    );
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

    if (missionState.wingsEquipped) {
      hudWings.textContent = "Equipadas ✓ (E: quitar)";
      hudWings.dataset.equipped = "true";
    } else if (missionState.wingsCollected) {
      hudWings.textContent = "En mochila (E: equipar)";
      hudWings.dataset.equipped = "false";
    } else {
      hudWings.textContent = "Sin alitas";
      hudWings.dataset.equipped = "false";
    }

    hudPortal.textContent = missionState.orderStatus;
    hudPortal.dataset.open = String(missionState.portalOpen || missionState.inFaeRealm);

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
    onWingsUpdated() {
      updateHUD();
      if (missionState.portalOpen) {
        prepFeedback.textContent = "¡Todo listo! Caminá hacia el portal para cruzar al Reino Fae.";
      } else if (missionState.wingsEquipped && !missionState.magicWordValid) {
        prepFeedback.textContent = "Alitas equipadas. Ahora ingresá la palabra mágica CHUNKERO.";
      } else if (missionState.wingsCollected && !missionState.wingsEquipped) {
        prepFeedback.textContent = "Tenés las alitas en la mochila. Presioná E para equiparlas.";
      }
    },
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
    openRejectionModal(access) {
      const titlesByCode = {
        WINGS_NOT_COLLECTED: "¡Te convertiste en un helecho!",
        WINGS_NOT_EQUIPPED: "¡Te convertiste en un helecho!",
        MISSING_BOTH: "¡Te convertiste en un helecho!",
        INVALID_WORD: "Conjuro CHUNKERO Incorrecto",
      };
      rejectedTitle.textContent = titlesByCode[access.reasonCode] || "Portal Rechazado";
      rejectedMessage.textContent = access.message;
      rejectedTip.textContent = access.transformsToFern
        ? `Tu pedido de ${missionState.requestedCount} panchos y tus objetos siguen intactos. Al reintentar recuperarás tu forma humana.`
        : `Tus alitas evitaron la transformación en helecho. Tu pedido de ${missionState.requestedCount} panchos sigue intacto.`;
      modalRejected.hidden = false;
      syncKeyboardLock();
      btnCloseRejected.focus();
    },
  };

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

  btnAcceptOrder.addEventListener("click", () => {
    modalIntro.hidden = true;
    prepBar.hidden = false;
    syncKeyboardLock();
    showToast("Recorré el claro para encontrar las alitas y pronunciá CHUNKERO.", "info");
  });

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

  btnCloseRejected.addEventListener("click", () => {
    modalRejected.hidden = true;
    const scene = getActiveScene();
    if (scene) {
      scene.events.emit("restore-human-form");
    }
    syncKeyboardLock();
  });

  btnRestartGame.addEventListener("click", () => {
    missionState = createMissionState();
    game.registry.set("missionState", missionState);

    inputMagicWord.value = "";
    prepFeedback.textContent =
      "Buscá las alitas de cotillón en el claro (E para recoger y equipar) e ingresá CHUNKERO.";
    prepBar.hidden = true;
    modalVictory.hidden = true;
    modalDelivery.hidden = true;
    modalRejected.hidden = true;
    modalIntro.hidden = false;

    updateHUD();
    game.scene.stop("FaeRealmScene");
    game.scene.start("PrepAndPortalScene");
    btnAcceptOrder.focus();
  });

  updateHUD();
  modalIntro.hidden = false;
});
