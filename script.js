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

profileClose?.addEventListener("click", closeProfile);
profileBackdrop?.addEventListener("click", closeProfile);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeProfile();
});

document.querySelector("[data-focus-register]")?.addEventListener("click", () => {
  document.querySelector("#register-form input")?.focus();
});

document.querySelector("#order-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  navigateTo("dakujeme");
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

document.querySelectorAll(".swatch:not(.dots), .large-swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    const group = swatch.classList.contains("large-swatch")
      ? document.querySelectorAll(".large-swatch")
      : document.querySelectorAll(".swatch:not(.dots)");

    group.forEach((item) => item.classList.remove("is-selected"));
    swatch.classList.add("is-selected");
  });
});

document.querySelectorAll(".factor-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("is-active");
  });
});

const orderForm = document.querySelector("#order-form");
const orderProgress = document.querySelectorAll(".progress-step");
const orderStepButtons = document.querySelectorAll(".order-step-button");

if (orderForm) {
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

  const fieldsets = [...orderForm.querySelectorAll("fieldset")];
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
    fieldset.addEventListener("focusin", () => updateOrderProgress(index));
  });

  orderStepButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const stepIndex = Number(button.dataset.orderStep);
      const fieldset = fieldsets[stepIndex];
      if (!fieldset) return;

      fieldset.scrollIntoView({ behavior: "smooth", block: "center" });
      const firstControl = fieldset.querySelector('input:not([type="radio"]), select, textarea')
        ?? fieldset.querySelector('input[type="radio"]');
      firstControl?.focus({ preventScroll: true });
      updateOrderProgress(stepIndex);
    });
  });

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
