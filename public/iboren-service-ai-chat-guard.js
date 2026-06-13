(() => {
  const normalize = (value) => String(value || "").trim();
  const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

  function validLeadName(value) {
    const text = normalize(value);
    const letters = (text.match(/[A-Za-zÅÄÖåäö]/g) || []).length;
    return text.length >= 2 && letters >= 2 && !/^\d+$/.test(text);
  }

  function validSwedishMobile(value) {
    const raw = normalize(value);
    if (!/^[+\d\s()-]+$/.test(raw)) return false;
    const compactRaw = raw.replace(/[\s()-]/g, "");
    const digits = normalizePhone(raw);
    if (/^(\d)\1+$/.test(digits)) return false;
    return /^07\d{8}$/.test(digits) || /^467\d{8}$/.test(digits) || /^\+467\d{8}$/.test(compactRaw);
  }

  function lastBotText(root) {
    const messages = Array.prototype.slice.call(root.querySelectorAll(".saic2-msg.saic2-bot,.saic2-msg.saic2-agent"));
    const last = messages[messages.length - 1];
    return last ? last.textContent || "" : "";
  }

  function addBotMessage(root, text) {
    const log = root.querySelector(".saic2-log");
    if (!log) return;
    const node = document.createElement("div");
    node.className = "saic2-msg saic2-bot";
    node.textContent = text;
    log.appendChild(node);
    log.scrollTop = log.scrollHeight;
  }

  document.addEventListener("submit", (event) => {
    const form = event.target && event.target.closest && event.target.closest(".saic2-form");
    if (!form) return;
    const root = form.closest(".saic2");
    const input = form.querySelector(".saic2-input");
    if (!root || !input) return;
    const prompt = lastBotText(root);
    const value = normalize(input.value);

    if (/Vad heter du\?/.test(prompt) && !validLeadName(value)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      addBotMessage(root, "Namnet verkar inte vara korrekt. Skriv ditt riktiga namn med minst två bokstäver.");
      input.focus();
      return;
    }

    if (/Vad är ditt telefonnummer\?/.test(prompt) && !validSwedishMobile(value)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      addBotMessage(root, "Telefonnumret verkar inte vara korrekt. Skriv gärna ett riktigt svenskt mobilnummer, till exempel 0701234567 eller +46701234567.");
      input.focus();
    }
  }, true);
})();
