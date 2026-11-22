const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const profileModal = document.querySelector("#profil");
const profileBackdrop = document.querySelector(".profile-backdrop");
const profileClose = document.querySelector(".profile-close");

const routes = new Set([
  "domov",
  "produkty",
  "objednavka",
  "cennik",
  "faq",
  "dakujeme",
  "profil"
]);

function setMenuOpen(open) {
  if (!mainNav || !menuToggle) return;
  mainNav.classList.toggle("open", open);
  menuToggle.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

function openProfile() {
  if (!profileModal) return;
  profileModal.hidden = false;
  document.body.style.overflow = "hidden";
  window.setTimeout(() => profileModal.querySelector("input")?.focus(), 0);
}

function closeProfile() {
  if (!profileModal) return;
  profileModal.hidden = true;
  document.body.style.overflow = "";
}

function showPage(route) {
  const currentRoute = routes.has(route) ? route : "domov";

  if (currentRoute === "profil") {
    openProfile();
    return;
  }

  closeProfile();

  const homeSections = [
    document.querySelector(".hero"),
    document.querySelector(".materials-preview"),
    document.querySelector(".realization")
  ];
  const pageSections = {
    produkty: document.querySelector("#produkty-page"),
    objednavka: document.querySelector("#objednavka-page"),
    cennik: document.querySelector("#cennik-page"),
    faq: document.querySelector("#faq-page"),
    dakujeme: document.querySelector("#dakujeme-page")
  };

  const showHome = currentRoute === "domov";
  homeSections.forEach((section) => {
    if (section) section.hidden = !showHome;
  });

  Object.entries(pageSections).forEach(([name, section]) => {
    if (section) section.hidden = name !== currentRoute;
  });

  setMenuOpen(false);

  document.querySelectorAll(".main-nav a").forEach((link) => {
    const target = link.getAttribute("href").replace("#", "");
    link.classList.toggle("active", target === currentRoute);
  });

  window.scrollTo({ top: 0, behavior: "auto" });
}

function navigateTo(route) {
  const currentRoute = routes.has(route) ? route : "domov";

  if (currentRoute === "profil") {
    openProfile();
    return;
  }

  showPage(currentRoute);
  if (window.location.hash !== `#${currentRoute}`) {
    history.pushState({ route: currentRoute }, "", `#${currentRoute}`);
  }
}

menuToggle?.addEventListener("click", () => {
  setMenuOpen(!mainNav.classList.contains("open"));
});

document.querySelectorAll('a[href="#domov"], a[href="#produkty"], a[href="#objednavka"], a[href="#cennik"], a[href="#faq"], a[href="#profil"], a[href="#dakujeme"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(link.getAttribute("href").replace("#", ""));
  });
});

const orderHeroCta = document.querySelector(".order-hero-cta");
const orderFormTarget = document.querySelector("#order-form");

if (orderHeroCta && orderFormTarget) {
  orderHeroCta.addEventListener("click", (event) => {
    event.preventDefault();
    orderFormTarget.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

const productHeroCta = document.querySelector(".product-hero-cta");
const productGalleryTarget = document.querySelector("#product-gallery");

if (productHeroCta && productGalleryTarget) {
  productHeroCta.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo("produkty");
    window.requestAnimationFrame(() => {
      productGalleryTarget.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });
  });
}

profileClose?.addEventListener("click", closeProfile);
profileBackdrop?.addEventListener("click", closeProfile);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProfile();
});

document.querySelector("[data-focus-register]")?.addEventListener("click", () => {
  document.querySelector("#register-form input")?.focus();
});

document.querySelector("#login-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  closeProfile();
  navigateTo("domov");
});

document.querySelector("#register-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  closeProfile();
  navigateTo("domov");
});

const colorSwatches = [...document.querySelectorAll(".swatch[data-color], .large-swatch[data-color]")];
const colorInput = document.querySelector('#order-form input[name="color"]');
const colorFeedback = [...document.querySelectorAll(".swatch-feedback")];
const colorPrompt = "Prejdite na vzorku pre názov farby alebo na ňu kliknite a doplňte ju do objednávky.";

function updateColorFeedback(message) {
  colorFeedback.forEach((feedback) => {
    feedback.textContent = message;
  });
}

function restoreColorFeedback() {
  const selected = colorSwatches.find((swatch) => swatch.classList.contains("is-selected"));
  updateColorFeedback(
    selected
      ? `Vybraná farba: ${selected.dataset.color}. Kliknutím na inú vzorku zmeníte výber.`
      : colorPrompt
  );
}

colorSwatches.forEach((swatch) => {
  const colorName = swatch.dataset.color;
  swatch.setAttribute("aria-label", `Vybrať farbu: ${colorName}`);
  swatch.setAttribute("aria-pressed", "false");
  swatch.title = colorName;

  swatch.addEventListener("pointerenter", () => {
    updateColorFeedback(`Farba: ${colorName}`);
  });
  swatch.addEventListener("pointerleave", restoreColorFeedback);
  swatch.addEventListener("focus", () => {
    updateColorFeedback(`Farba: ${colorName}`);
  });
  swatch.addEventListener("blur", restoreColorFeedback);
  swatch.addEventListener("click", () => {
    colorSwatches.forEach((item) => {
      const selected = item.dataset.color === colorName;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    if (colorInput) {
      colorInput.value = colorName;
      colorInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    updateColorFeedback(`Vybraná farba: ${colorName}. Doplnená do objednávky.`);
  });
});

document.querySelectorAll(".factor-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    const active = button.classList.toggle("is-active");
    button.setAttribute("aria-pressed", String(active));
  });
});

const orderForm = document.querySelector("#order-form");
const orderProgress = document.querySelectorAll(".progress-step");
const orderStepButtons = document.querySelectorAll(".order-step-button");

if (orderForm) {
  const fieldsets = [...orderForm.querySelectorAll("fieldset")];
  let currentStep = 0;
  orderForm.noValidate = true;

  const cursor = document.createElement("span");
  cursor.className = "order-cursor";
  document.body.appendChild(cursor);

  orderForm.addEventListener("pointerenter", () => cursor.classList.add("visible"));
  orderForm.addEventListener("pointerleave", () => cursor.classList.remove("visible", "active"));
  orderForm.addEventListener("pointermove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });
  orderForm.addEventListener("pointerdown", () => cursor.classList.add("active"));
  orderForm.addEventListener("pointerup", () => cursor.classList.remove("active"));

  const updateOrderProgress = (activeIndex) => {
    orderProgress.forEach((step, stepIndex) => {
      const active = stepIndex === activeIndex;
      step.classList.toggle("active", active);
      step.classList.toggle("completed", stepIndex < activeIndex);
      if (active) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
    });

    orderStepButtons.forEach((button, stepIndex) => {
      const active = stepIndex === activeIndex;
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
  };

  fieldsets.forEach((fieldset, index) => {
    fieldset.hidden = index !== currentStep;
    fieldset.addEventListener("focusin", () => updateOrderProgress(index));
  });

  const showOrderStep = (stepIndex) => {
    const fieldset = fieldsets[stepIndex];
    if (!fieldset) return;

    fieldsets.forEach((step, index) => {
      step.hidden = index !== stepIndex;
    });
    currentStep = stepIndex;
    updateOrderProgress(stepIndex);
    fieldset.scrollIntoView({ behavior: "smooth", block: "center" });

    const firstControl = fieldset.querySelector('input:not([type="radio"]), select, textarea')
      ?? fieldset.querySelector('input[type="radio"]');
    firstControl?.focus({ preventScroll: true });
  };

  const goToOrderStep = (stepIndex) => {
    if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= fieldsets.length) return;

    for (let index = currentStep; index < stepIndex; index += 1) {
      if (!fieldsets[index].checkValidity()) {
        showOrderStep(index);
        fieldsets[index].reportValidity();
        return;
      }
    }

    showOrderStep(stepIndex);
  };

  orderStepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      goToOrderStep(Number(button.dataset.orderStep));
    });
  });

  orderForm.querySelectorAll("[data-order-next]").forEach((button) => {
    button.addEventListener("click", () => goToOrderStep(currentStep + 1));
  });

  orderForm.querySelectorAll("[data-order-previous]").forEach((button) => {
    button.addEventListener("click", () => goToOrderStep(currentStep - 1));
  });

  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const invalidIndex = fieldsets.findIndex((fieldset) => !fieldset.checkValidity());
    if (invalidIndex !== -1) {
      showOrderStep(invalidIndex);
      fieldsets[invalidIndex].reportValidity();
      return;
    }

    navigateTo("dakujeme");
  });

  updateOrderProgress(currentStep);

  orderForm.querySelectorAll("input, select, textarea").forEach((control) => {
    const updateValidity = () => {
      control.classList.toggle("is-valid", control.checkValidity() && control.value);
    };
    control.addEventListener("input", updateValidity);
    control.addEventListener("change", updateValidity);
  });
}

function syncRouteFromLocation() {
  const route = window.location.hash.replace("#", "") || "domov";
  showPage(routes.has(route) ? route : "domov");
}

window.addEventListener("popstate", syncRouteFromLocation);
window.addEventListener("hashchange", syncRouteFromLocation);

syncRouteFromLocation();
