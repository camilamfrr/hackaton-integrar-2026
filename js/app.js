import {
  evaluatePortalEntry,
  isMagicWordValid,
  normalizeMagicWord,
} from "./validation.js";
import { initMagicParticles } from "./particles.js";

const OPENING_DURATION_MS = 900;

document.addEventListener("DOMContentLoaded", () => {
  initMagicParticles(document.getElementById("magic-particles"));

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const screens = {
    intro: document.getElementById("screen-intro"),
    auth: document.getElementById("screen-auth"),
    opening: document.getElementById("screen-opening"),
    open: document.getElementById("screen-open"),
    rejected: document.getElementById("screen-rejected"),
  };

  const btnStart = document.getElementById("btn-start");
  const btnBackIntro = document.getElementById("btn-back-intro");
  const btnResetOpen = document.getElementById("btn-reset-open");
  const btnRetry = document.getElementById("btn-retry");

  const authForm = document.getElementById("auth-form");
  const inputWings = document.getElementById("input-wings");
  const inputMagicWord = document.getElementById("input-magic-word");
  const inputWrapper = inputMagicWord.closest(".input-wrapper");
  const wordFeedback = document.getElementById("word-feedback");

  const runeWings = document.getElementById("rune-wings");
  const runeWord = document.getElementById("rune-word");

  const openTitle = document.getElementById("open-title");
  const openMessage = document.getElementById("open-message");
  const openDetail = document.getElementById("open-detail");

  const rejectedTitle = document.getElementById("rejected-title");
  const rejectedMessage = document.getElementById("rejected-message");
  const rejectedDetail = document.getElementById("rejected-detail");

  let openingTimeoutId = null;

  function showScreen(targetKey, portalState) {
    if (openingTimeoutId !== null) {
      window.clearTimeout(openingTimeoutId);
      openingTimeoutId = null;
    }

    document.body.setAttribute("data-portal-state", portalState);

    Object.entries(screens).forEach(([key, element]) => {
      const isTarget = key === targetKey;
      element.hidden = !isTarget;
      element.classList.toggle("is-active", isTarget);
    });
  }

  function updateConditionIndicators() {
    const wingsOk = inputWings.checked;
    const rawWord = inputMagicWord.value;
    const cleanedWord = normalizeMagicWord(rawWord);
    const wordOk = isMagicWordValid(rawWord);

    runeWings.dataset.active = String(wingsOk);
    runeWord.dataset.active = String(wordOk);
    inputWrapper.dataset.wordValid = String(wordOk);

    if (wordOk) {
      wordFeedback.textContent = "La runa resonó con fuerza: CHUNKERO reconocido.";
    } else if (cleanedWord.length > 0) {
      wordFeedback.textContent = `Escuchando "${cleanedWord}"... las runas esperan CHUNKERO.`;
    } else {
      wordFeedback.textContent =
        "Pista del grimorio: es el nombre de este portal (no distingue mayúsculas ni espacios).";
    }
  }

  function resetExperience() {
    authForm.reset();
    updateConditionIndicators();
    showScreen("intro", "idle");
    btnStart.focus();
  }

  btnStart.addEventListener("click", () => {
    showScreen("auth", "idle");
    inputWings.focus();
  });

  btnBackIntro.addEventListener("click", () => {
    showScreen("intro", "idle");
    btnStart.focus();
  });

  btnResetOpen.addEventListener("click", resetExperience);

  btnRetry.addEventListener("click", () => {
    showScreen("auth", "idle");
    updateConditionIndicators();
    if (!inputWings.checked) {
      inputWings.focus();
    } else {
      inputMagicWord.focus();
    }
  });

  inputWings.addEventListener("change", updateConditionIndicators);
  inputMagicWord.addEventListener("input", updateConditionIndicators);

  authForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const result = evaluatePortalEntry({
      hasWings: inputWings.checked,
      magicWord: inputMagicWord.value,
    });

    if (result.authorized) {
      openTitle.textContent = result.title;
      openMessage.textContent = `“${result.message}”`;
      openDetail.textContent = result.detail;

      if (motionQuery.matches) {
        showScreen("open", "open");
        btnResetOpen.focus();
        return;
      }

      showScreen("opening", "opening");
      openingTimeoutId = window.setTimeout(() => {
        showScreen("open", "open");
        btnResetOpen.focus();
      }, OPENING_DURATION_MS);
      return;
    }

    rejectedTitle.textContent = result.title;
    rejectedMessage.textContent = `“${result.message}”`;
    rejectedDetail.textContent = result.detail;
    showScreen("rejected", "rejected");
    btnRetry.focus();
  });

  updateConditionIndicators();
});
