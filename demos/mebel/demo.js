(function () {
  const PRODUCTS = {
    nord: {
      category: "Диваны",
      title: "Диван Nord",
      text: "Прямой диван для гостиной: ткань, три посадочных места, доставка и сборка по городу.",
      price: "от 42 000 ₽",
      visual: "product-visual product-visual--sofa",
    },
    line: {
      category: "Шкафы",
      title: "Шкаф Line",
      text: "Шкаф-купе с замером, выбором фасада, сборкой и аккуратной доставкой.",
      price: "от 36 000 ₽",
      visual: "product-visual product-visual--wardrobe",
    },
    loft: {
      category: "Столы",
      title: "Стол Loft",
      text: "Обеденный стол из массива и металла с подбором размера под кухню или гостиную.",
      price: "от 18 500 ₽",
      visual: "product-visual product-visual--table",
    },
    soft: {
      category: "Кровати",
      title: "Кровать Soft",
      text: "Кровать с мягким изголовьем, основанием, матрасом и доставкой до квартиры.",
      price: "от 31 900 ₽",
      visual: "product-visual product-visual--bed",
    },
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const notice = $("[data-demo-notice]");
  const productModal = $("[data-product-modal]");

  function scrollToTarget(selector) {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openNotice() {
    notice?.classList.add("is-open");
    notice?.setAttribute("aria-hidden", "false");
  }

  function closeNotice() {
    notice?.classList.remove("is-open");
    notice?.setAttribute("aria-hidden", "true");
  }

  function closeProductModal() {
    productModal?.classList.remove("is-open");
    productModal?.setAttribute("aria-hidden", "true");
  }

  function openProductModal(id) {
    const product = PRODUCTS[id] || PRODUCTS.nord;
    const visual = $("[data-modal-visual]");
    if (visual) {
      visual.className = "product-modal__visual " + product.visual;
      visual.innerHTML = "<span></span>";
    }
    $("[data-modal-category]").textContent = product.category;
    $("[data-modal-title]").textContent = product.title;
    $("[data-modal-text]").textContent = product.text;
    $("[data-modal-price]").textContent = product.price;
    productModal?.classList.add("is-open");
    productModal?.setAttribute("aria-hidden", "false");
  }

  function requestWeb00Lead() {
    closeNotice();
    closeProductModal();
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "WEB00_DEMO_REQUEST",
        solutionId: "mebel",
        title: "Мебельный магазин",
      }, "*");
      return;
    }
    scrollToTarget("#request");
    window.setTimeout(openNotice, 250);
  }

  $$("a[href^='#']").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      event.preventDefault();
      scrollToTarget(href);
    });
  });

  $$("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToTarget(button.dataset.scrollTarget);
    });
  });

  $$("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;
      $$("[data-category]").forEach((item) => item.classList.toggle("is-active", item === button));
      $$("[data-product-card]").forEach((card) => {
        card.classList.toggle("is-hidden", category !== "all" && card.dataset.category !== category);
      });
    });
  });

  $$("[data-product-open]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openProductModal(button.dataset.productOpen);
    });
  });

  $$("[data-product-close]").forEach((button) => {
    button.addEventListener("click", closeProductModal);
  });

  $$("[data-demo-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openNotice();
    });
  });

  $$("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openNotice();
    });

    form.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && event.target.tagName !== "TEXTAREA") {
        event.preventDefault();
        openNotice();
      }
    });
  });

  $$("[data-notice-close]").forEach((button) => {
    button.addEventListener("click", closeNotice);
  });

  $("[data-web00-request]")?.addEventListener("click", (event) => {
    event.preventDefault();
    requestWeb00Lead();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNotice();
      closeProductModal();
    }
  });
})();
