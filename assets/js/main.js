(function () {
  const DATA = window.WEB00_DATA;
  if (!DATA) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const page = document.body.dataset.page || "home";

  let activeSolution = (DATA.SOLUTIONS || []).find((item) => item.active !== false) || DATA.SOLUTIONS[0];
  let activeService = null;
  let bugAttachment = null;
  const TITLE_ALIASES = new Map([
    ["Каталог мебели", "Мебельный магазин"],
    ["Сайт для клининга", "Услуга клининга"],
    ["Сайт для кровли", "Услуга кровли"],
    ["Сайт для массажа", "Массаж"],
    ["Сайт для услуг", "Услуга муж на час"],
    ["Сайт для доставки", "Доставка и продажа дров"],
  ]);

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function attr(value) {
    return esc(value).replaceAll("`", "&#096;");
  }

  function solutions() {
    const seen = new Set();
    return DATA.SOLUTIONS.filter((item) => {
      if (item.active === false || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  function solutionFilter(solution) {
    return solution.filter || solution.previewType || "services";
  }

  function solutionPreviewType(solution) {
    return solution.previewType || solution.tone || "services";
  }

  function solutionFeatures(solution) {
    return solution.features || solution.includes || [];
  }

  function solutionPrice(solution) {
    return solution.priceFrom || solution.price || "";
  }

  function solutionTime(solution) {
    return solution.deliveryTime || solution.term || "";
  }

  function solutionAudience(solution) {
    return solution.audience || solution.description || "";
  }

  function solutionDemoUrl(solution) {
    if (!solution || solution.demoMode === "none") return "";
    if (solution.demoMode === "external-iframe" && solution.externalDemoUrl) return solution.externalDemoUrl;
    return solution.demoLocalUrl || "";
  }

  function solutionOriginalDemoUrl(solution) {
    return solution.originalDemoUrl || solution.externalDemoUrl || solution.demoUrl || "";
  }

  function solutionGallery(solution) {
    const gallery = Array.isArray(solution?.galleryImages) ? solution.galleryImages.filter(Boolean) : [];
    const fallback = solution?.previewImage ? [solution.previewImage] : [];
    return [...new Set(gallery.length ? gallery : fallback)];
  }

  function modalIcon(type) {
    const icons = {
      launch: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19c2.7-.5 4.9-1.8 6.7-3.8"/><path d="M11 13 8 10c1.7-3.7 4.4-5.9 8.1-6.7L20 3l-.3 3.9C18.9 10.6 16.7 13.3 13 15l-2-2Z"/><path d="M7 15l-2 4 4-2"/></svg>',
      support: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.4-2.9 7.7-7 10-4.1-2.3-7-5.6-7-10V6l7-3Z"/><path d="m9 12 2 2 4-5"/></svg>',
      demo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="3"/></svg>',
      payment: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/><path d="M7 15h5"/></svg>',
    };
    return icons[type] || icons.demo;
  }

  function externalLink(url, label, className = "btn btn--secondary btn--small") {
    if (!url) {
      return `<a class="${className} is-disabled" aria-disabled="true" tabindex="-1">${esc(label)}</a>`;
    }
    return `<a class="${className}" href="${attr(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
  }

  function solutionById(id) {
    return solutions().find((item) => item.id === id) || solutions()[0] || DATA.SOLUTIONS[0];
  }

  function normalizeSolutionTitle(value) {
    const title = String(value || "").trim();
    if (!title) return "";
    const solution = DATA.SOLUTIONS.find((item) => item.title === title || item.legacyTitle === title || item.id === title);
    return solution?.title || TITLE_ALIASES.get(title) || title;
  }

  function setModal(name, open) {
    const modal = $(`[data-modal="${name}"]`);
    if (!modal) return;
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    const hasOpenModal = open && Boolean($(".modal.is-open"));
    document.body.classList.toggle("is-modal-open", hasOpenModal);
    document.documentElement.classList.toggle("is-modal-open", hasOpenModal);
  }

  function setDemoDialogMode(solution) {
    const dialog = $("[data-modal=\"demo\"] .modal__dialog");
    if (!dialog) return;
    dialog.classList.toggle("modal__dialog--demo-2", solution?.demoMode === "external-iframe");
  }

  function closeModals() {
    $$(".modal").forEach((modal) => {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
    });
    $("[data-modal=\"demo\"] .modal__dialog")?.classList.remove("modal__dialog--demo-2");
    document.body.classList.remove("is-modal-open");
    document.documentElement.classList.remove("is-modal-open");
  }

  function initShell() {
    const menuToggle = $("[data-menu-toggle]");
    const nav = $("[data-nav]");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => {
        const open = menuToggle.getAttribute("aria-expanded") !== "true";
        menuToggle.setAttribute("aria-expanded", String(open));
        nav.classList.toggle("is-open", open);
        document.body.classList.toggle("is-menu-open", open);
      });
    }

    $$("[data-nav] a").forEach((link) => {
      const linkPage = link.getAttribute("href")?.split("#")[0] || "";
      link.classList.toggle("is-active", linkPage === currentPage);
    });

    $$('a[data-scroll][href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const target = $(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        if (menuToggle && nav) {
          menuToggle.setAttribute("aria-expanded", "false");
          nav.classList.remove("is-open");
          document.body.classList.remove("is-menu-open");
        }
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    $$("[data-close-modal]").forEach((item) => item.addEventListener("click", closeModals));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModals();
    });

    document.addEventListener("click", (event) => {
      const leadButton = event.target.closest("[data-open-lead]");
      if (leadButton) {
        event.preventDefault();
        const solutionId = leadButton.dataset.solutionId;
        const service = leadButton.dataset.service;
        if (solutionId) openLeadModal({ solution: solutionById(solutionId) });
        else openLeadModal({ service: service || activeService || "Сайт под ключ" });
      }

      const bugButton = event.target.closest("[data-open-bug]");
      if (bugButton) {
        event.preventDefault();
        openBugModal();
      }

      const messageButton = event.target.closest("[data-open-message]");
      if (messageButton) {
        event.preventDefault();
        openLeadModal({ service: "Вопрос или консультация" });
      }
    });

    window.addEventListener("message", (event) => {
      const payload = event.data || {};
      if (payload.type !== "WEB00_DEMO_REQUEST") return;
      const solutionId = String(payload.solutionId || "").trim();
      if (!solutionId) return;
      const solution = DATA.SOLUTIONS.find((item) => item.id === solutionId && item.active !== false);
      if (!solution) return;
      closeModals();
      openLeadModal({ solution });
    });
  }

  function renderSolutions() {
    const grid = $("[data-solutions-grid]");
    if (!grid) return;
    grid.innerHTML = solutions().map((solution) => {
      const features = solutionFeatures(solution);
      return `
      <article class="solution-card" data-solution-card data-category="${esc(solutionFilter(solution))}" data-solution-id="${esc(solution.id)}" role="button" tabindex="0" aria-label="Смотреть решение: ${esc(solution.title)}">
        ${solutionPreview(solution, { card: true })}
        <div class="solution-card__body">
          <h3>${esc(solution.title)}</h3>
          <p>${esc(solution.description || solutionAudience(solution))}</p>
          <p class="solution-card__features"><span>Входит:</span> ${esc(features.slice(0, 3).join(", "))}</p>
          <div class="solution-card__meta"><span>${esc(solutionTime(solution))}</span><b>${esc(solutionPrice(solution))}</b></div>
        </div>
      </article>
    `;
    }).join("");

    $$(".solution-card", grid).forEach((card) => {
      const openCard = () => openSolutionModal(solutionById(card.dataset.solutionId));
      card.addEventListener("click", openCard);
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openCard();
      });
    });

    $$("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.dataset.filter;
        $$("[data-filter]").forEach((item) => item.classList.toggle("is-active", item === button));
        $$(".solution-card", grid).forEach((card) => {
          card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter);
        });
      });
    });
  }

  function renderServices() {
    const grid = $("[data-services-grid]");
    if (!grid) return;
    grid.innerHTML = DATA.SERVICES.map((service) => `
      <article class="service-card">
        <span class="service-card__icon">${esc(service.icon)}</span>
        <div>
          <h3>${esc(service.title)}</h3>
          <p>${esc(service.text)}</p>
        </div>
        <button type="button" data-open-lead data-service="${esc(service.type)}" aria-label="${esc(service.title)}">→</button>
      </article>
    `).join("");
  }

  function renderPricing() {
    const grid = $("[data-pricing-grid]");
    if (!grid) return;
    grid.innerHTML = DATA.PRICING.map((item) => {
      const features = item.features || [];
      return `
        <article class="price-card ${item.tag === "Популярный" ? "price-card--accent" : ""}">
          <div class="price-card__top">
            <span class="price-card__tag">${esc(item.tag)}</span>
            ${item.tag === "Популярный" ? "<b>Лучший старт</b>" : ""}
          </div>
          <h3>${esc(item.title)}</h3>
          <strong>${esc(item.price)}</strong>
          <p>${esc(item.note)}</p>
          <ul>${features.map((feature) => `<li>${esc(feature)}</li>`).join("")}</ul>
          <button class="btn btn--secondary btn--small" type="button" data-open-lead data-service="${esc(item.title)}">Получить расчёт</button>
        </article>
      `;
    }).join("");
  }

  function renderFaq(category = "all") {
    const list = $("[data-faq-list]");
    if (!list) return;
    const items = DATA.FAQ_ITEMS.filter((item) => category === "all" || item.category === category);
    list.innerHTML = items.map((item, index) => `
      <article class="faq-item">
        <button class="faq-question" type="button" aria-expanded="${index === 0 ? "true" : "false"}">
          <span>${index + 1}</span>${esc(item.question)}
        </button>
        <div class="faq-answer"><p>${esc(item.answer)}</p></div>
      </article>
    `).join("");

    $$(".faq-question", list).forEach((button) => {
      button.addEventListener("click", () => {
        button.setAttribute("aria-expanded", String(button.getAttribute("aria-expanded") !== "true"));
      });
    });
  }

  function initFaq() {
    renderFaq();
    $$("[data-faq]").forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-faq]").forEach((item) => item.classList.toggle("is-active", item === button));
        renderFaq(button.dataset.faq);
      });
    });
  }

  function solutionPreview(solution, options = {}) {
    const type = solutionPreviewType(solution);
    const viewButton = options.card ? '<span class="solution-card__view" aria-hidden="true">Смотреть</span>' : "";
    if (solution.previewImage) {
      return `
        <div class="solution-preview solution-preview--image solution-preview--${esc(type)}">
          <img src="${attr(solution.previewImage)}" alt="Превью решения: ${attr(solution.title)}" loading="lazy">
          ${viewButton}
        </div>
      `;
    }
    return `
      <div class="solution-preview solution-preview--${esc(type)}">
        <div class="solution-preview__glow"></div>
        <div class="solution-preview__scene" aria-hidden="true">
          <div class="preview-window">
            <em></em><em></em><em></em>
            <div class="preview-line preview-line--wide"></div>
            <div class="preview-line"></div>
            <div class="preview-grid">
              <b></b><b></b><b></b>
            </div>
          </div>
          <div class="preview-side">
            <b></b><b></b><b></b>
          </div>
        </div>
        <strong>${esc(solution.title)}</strong>
        ${viewButton}
      </div>
    `;
  }

  function openSolutionModal(solution) {
    activeSolution = solution;
    const target = $("[data-solution-modal-content]");
    const features = solutionFeatures(solution);
    const price = solutionPrice(solution);
    const time = solutionTime(solution);
    const hasDemo = Boolean(solutionDemoUrl(solution));
    const gallery = solutionGallery(solution);
    const activeImage = gallery[0] || solution.previewImage || "";
    target.innerHTML = `
      <div class="solution-modal solution-modal--premium">
        <section class="solution-gallery" aria-label="Галерея решения ${esc(solution.title)}">
          <div class="solution-gallery__stage">
            ${activeImage ? `<img data-solution-gallery-main src="${attr(activeImage)}" alt="${attr(solution.title)} - экран сайта">` : `<div class="solution-gallery__empty">Preview готовится</div>`}
          </div>
          ${gallery.length > 1 ? `
            <div class="solution-gallery__thumbs" role="list" aria-label="Экраны сайта">
              ${gallery.map((image, index) => `
                <button class="${index === 0 ? "is-active" : ""}" type="button" data-gallery-thumb data-gallery-image="${attr(image)}" aria-label="Показать экран ${index + 1}">
                  <img src="${attr(image)}" alt="" loading="lazy">
                </button>
              `).join("")}
            </div>
          ` : ""}
        </section>

        <aside class="solution-detail">
          <span class="solution-detail__tag">Готов к запуску</span>
          <h2 id="solution-title">${esc(solution.title)}</h2>
          <div class="solution-detail__meta"><strong>${esc(price)}</strong><i></i><span>${esc(time)}</span></div>
          <p class="solution-detail__description">${esc(solution.description)}</p>
          <ul class="check-list solution-detail__features">${features.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <div class="solution-detail__actions">
            <button class="btn btn--primary btn--full" type="button" data-open-lead data-solution-id="${esc(solution.id)}">${hasDemo ? "Хочу такой сайт" : "Оставить заявку"}</button>
            ${hasDemo ? `<button class="btn btn--secondary btn--full" type="button" data-open-demo="${esc(solution.id)}">Посмотреть демо</button>` : ""}
          </div>
        </aside>

        <div class="modal-benefits modal-benefits--premium">
          <article><span>${modalIcon("launch")}</span><strong>Запуск ${esc(time)}</strong><small>Быстрый старт без лишних задержек</small></article>
          <article><span>${modalIcon("support")}</span><strong>Поддержка 7 дней</strong><small>Поможем на старте и ответим на вопросы</small></article>
          <article><span>${modalIcon("demo")}</span><strong>Демо доступно</strong><small>Посмотрите живой пример перед запуском</small></article>
          <article><span>${modalIcon("payment")}</span><strong>Без подписок</strong><small>Единоразовая оплата без скрытых платежей</small></article>
        </div>
      </div>
    `;
    $$("[data-gallery-thumb]", target).forEach((button) => {
      button.addEventListener("click", () => {
        const image = button.dataset.galleryImage;
        const mainImage = $("[data-solution-gallery-main]", target);
        if (!image || !mainImage) return;
        mainImage.src = image;
        mainImage.alt = `${solution.title} - экран сайта`;
        $$("[data-gallery-thumb]", target).forEach((item) => item.classList.toggle("is-active", item === button));
      });
    });
    $("[data-open-demo]", target)?.addEventListener("click", () => openDemoModal(solution));
    setModal("solution", true);
  }

  function openDemoModal(solution) {
    const demoUrl = solutionDemoUrl(solution);
    if (!demoUrl) {
      closeModals();
      openLeadModal({ solution });
      return;
    }
    activeSolution = solution;
    const isExternalFrame = solution?.demoMode === "external-iframe";
    setDemoDialogMode(solution);
    const target = $("[data-demo-modal-content]");
    const features = solutionFeatures(solution);
    const price = solutionPrice(solution);
    const time = solutionTime(solution);
    const originalDemoUrl = solutionOriginalDemoUrl(solution);
    target.innerHTML = `
      <div class="demo-modal ${isExternalFrame ? "demo-modal--external" : ""}">
        <div class="demo-modal__head">
          <div><h2 id="demo-title">${esc(isExternalFrame ? solution.title : `Демо: ${solution.title}`)}</h2><p>${isExternalFrame ? "Настоящий сайт открывается внутри demo viewer." : "Локальная демо-страница открывается внутри WEB00 Pro."}</p></div>
          ${isExternalFrame ? "" : `<div class="segmented"><button class="is-active" type="button" data-demo-device="desktop">Desktop</button><button type="button" data-demo-device="mobile">Mobile</button></div>`}
          ${externalLink(originalDemoUrl, isExternalFrame ? "Открыть отдельно" : "Открыть оригинал")}
          <button class="btn btn--primary btn--small" type="button" data-open-lead data-solution-id="${esc(solution.id)}">Хочу такой сайт</button>
        </div>
        <div class="demo-layout">
          <aside>
            <h3>О шаблоне</h3>
            <p>${esc(solution.description)}</p>
            <ul class="check-list">${features.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            <div class="mini-meta"><span>${esc(price)}</span><span>${esc(time)}</span></div>
          </aside>
          <div class="demo-frame ${demoUrl ? "demo-frame--live" : ""}" data-demo-frame>
            ${demoUrl ? `
              <iframe data-demo-iframe src="${attr(demoUrl)}" title="Демо: ${attr(solution.title)}" loading="lazy"></iframe>
              ${solution.demoMode === "external-iframe" ? `
                <div class="demo-frame__external-fallback" data-demo-external-fallback hidden>
                  <span>▤</span>
                  <h3>Откройте демо в отдельном окне</h3>
                  <p>Если сайт не отобразился внутри окна, откройте его отдельно.</p>
                  ${externalLink(originalDemoUrl, "Открыть отдельно", "btn btn--primary btn--small")}
                </div>
              ` : ""}
            ` : `
              <div class="demo-frame__fallback">
                <span>▤</span>
                <h3>Демо для этого решения готовится</h3>
                <p>Мы уже готовим внутреннюю демонстрационную страницу для этого решения.</p>
                ${externalLink(originalDemoUrl, "Открыть оригинал")}
              </div>
            `}
          </div>
          <aside>
            <h3>Что можно сделать на этом сайте</h3>
            <ul class="feature-list">
              <li>Просматривать структуру и дизайн</li>
              <li>Оценить функционал</li>
              <li>Проверить адаптацию</li>
              <li>Оставить заявку</li>
            </ul>
          </aside>
        </div>
      </div>
    `;
    $$("[data-demo-device]", target).forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-demo-device]", target).forEach((item) => item.classList.toggle("is-active", item === button));
        $("[data-demo-frame]", target).classList.toggle("is-mobile", button.dataset.demoDevice === "mobile");
      });
    });
    const iframe = $("[data-demo-iframe]", target);
    const externalFallback = $("[data-demo-external-fallback]", target);
    if (iframe && externalFallback) {
      iframe.addEventListener("load", () => {
        externalFallback.hidden = true;
      });
      iframe.addEventListener("error", () => {
        externalFallback.hidden = false;
      });
    }
    setModal("demo", true);
  }

  function leadAside(context) {
    const solution = context.solution;
    if (solution) {
      const features = solutionFeatures(solution);
      return `
        <aside class="lead-aside">
          <h3>Выбранное решение</h3>
          ${solutionPreview(solution)}
          <h4>${esc(solution.title)}</h4>
          <p>${esc(solution.description)}</p>
          <ul class="check-list">${features.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <div class="mini-meta"><span>${esc(solutionTime(solution))}</span><span>${esc(solutionPrice(solution))}</span></div>
        </aside>
      `;
    }
    return `
      <aside class="lead-aside">
        <h3>Выбранная услуга</h3>
        <div class="service-selected"><span>WEB00</span><strong>${esc(context.service || "Сайт под ключ")}</strong></div>
        <p>Опишите задачу, и мы предложим формат, срок и стоимость.</p>
        <ul class="check-list"><li>Разбор задачи</li><li>Подбор формата сайта</li><li>Цена и срок</li><li>Демо до оплаты</li></ul>
      </aside>
    `;
  }

  function openLeadModal(context = {}) {
    const solution = context.solution || null;
    activeSolution = solution || activeSolution;
    activeService = context.service || (solution ? "Готовое решение" : "Сайт под ключ");
    renderLeadForm({ solution, service: activeService, errors: null });
    setModal("lead", true);
  }

  function renderLeadForm(context) {
    const target = $("[data-lead-modal-content]");
    const hasErrors = Boolean(context.errors);
    target.innerHTML = `
      <div class="lead-modal ${hasErrors ? "has-errors" : ""}">
        <form class="lead-form-ui" data-lead-form novalidate>
          <h2 id="lead-title">Заявка на создание сайта</h2>
          <p>Заполните форму, и мы свяжемся с вами в ближайшее время.</p>
          ${hasErrors ? '<div class="alert alert--error">Пожалуйста, заполните обязательные поля</div>' : ""}
          <label><span class="field-label">Ваше имя <b>*</b></span><input name="name" type="text" placeholder="Введите ваше имя" required></label>
          <label><span class="field-label">Контакт для связи <b>*</b></span><input name="contact" type="text" placeholder="Телефон, Telegram или Email" required></label>
          <label><span class="field-label">Тип задачи <b>*</b></span><select name="taskType" required>
            <option value="">Выберите тип задачи</option>
            <option ${context.solution ? "selected" : ""}>Готовое решение</option>
            <option ${context.service === "Сайт под ключ" ? "selected" : ""}>Сайт под ключ</option>
            <option ${context.service === "Telegram-бот" ? "selected" : ""}>Telegram-бот</option>
            <option ${context.service === "Автоматизация заявок" ? "selected" : ""}>Автоматизация заявок</option>
            <option>Доработка сайта</option>
            <option>Поддержка</option>
          </select></label>
          <label><span class="field-label">Бюджет <b>*</b></span><select name="budget" required><option>Пока не знаю</option><option>до 10 000 ₽</option><option>10 000-20 000 ₽</option><option>20 000-40 000 ₽</option><option>от 40 000 ₽</option></select></label>
          <label>Комментарий к проекту <textarea name="comment" rows="5" maxlength="500" placeholder="Опишите проект, цели, пожелания...">${context.solution ? `Интересует решение: ${context.solution.title}` : ""}</textarea></label>
          <label class="checkbox-row"><input name="consent" type="checkbox" required> <span class="field-label">Согласие на обработку данных <b>*</b></span></label>
          <button class="btn btn--primary btn--full" type="submit">Отправить заявку</button>
          <small>Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности.</small>
        </form>
        ${leadAside(context)}
      </div>
    `;

    const form = $("[data-lead-form]", target);
    if (hasErrors) markLeadErrors(form, context.errors);
    bindLeadErrorCleanup(form);
    form.addEventListener("submit", (event) => submitLeadForm(event, context));
  }

  function markLeadErrors(form, errors) {
    Object.keys(errors || {}).forEach((name) => {
      const field = form.elements[name];
      if (field) field.classList.add("is-invalid");
      const hint = document.createElement("small");
      hint.className = "field-error";
      hint.textContent = errors[name];
      if (field && field.closest("label")) field.closest("label").appendChild(hint);
    });
  }

  function clearLeadError(form, name) {
    const field = form.elements[name];
    if (!field) return;
    field.classList.remove("is-invalid");
    field.closest("label")?.querySelector(".field-error")?.remove();
    if (!$(".field-error", form)) {
      $(".alert--error", form)?.remove();
      form.closest(".lead-modal")?.classList.remove("has-errors");
    }
  }

  function bindLeadErrorCleanup(form) {
    ["name", "contact", "taskType", "budget", "consent"].forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
      field.addEventListener(eventName, () => {
        if (name === "consent") {
          if (field.checked) clearLeadError(form, name);
          return;
        }
        if (String(field.value || "").trim()) clearLeadError(form, name);
      });
    });
  }

  function submitLeadForm(event, context) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const errors = {};
    if (!data.name?.trim()) errors.name = "Заполните имя";
    if (!data.contact?.trim()) errors.contact = "Укажите контакт";
    if (!data.taskType?.trim()) errors.taskType = "Выберите тип задачи";
    if (!form.elements.consent.checked) errors.consent = "Необходимо согласие";

    if (Object.keys(errors).length) {
      renderLeadForm({ ...context, errors });
      return;
    }

    try {
      const lead = DATA.createLead({
        name: data.name.trim(),
        contact: data.contact.trim(),
        taskType: data.taskType,
        budget: data.budget,
        comment: data.comment,
        solution: context.solution?.title || context.service || data.taskType,
      });
      renderLeadSuccess(lead, context);
    } catch (error) {
      renderLeadFallback(context);
    }
  }

  function renderLeadSuccess(lead, context) {
    const target = $("[data-lead-modal-content]");
    target.innerHTML = `
      <div class="success-state">
        <div class="success-icon">✓</div>
        <h2>Заявка принята</h2>
        <p>Мы получили ваши данные и уже начали обработку.</p>
        <div class="success-box success-box--lead">
          <span>Номер заявки</span>
          <strong class="lead-number">${esc(lead.id)}</strong>
          <span class="success-badge">Новая</span>
          <span>Выбранное решение: ${esc(normalizeSolutionTitle(lead.solution || context.solution?.title || context.service || "WEB00 проект"))}</span>
          <span>Способ связи: ${esc(lead.contact)}</span>
        </div>
        <div class="success-next">
          <span>1</span><p>Проверим задачу</p>
          <span>2</span><p>Уточним детали</p>
          <span>3</span><p>Подготовим расчёт</p>
          <span>4</span><p>Покажем результат до оплаты</p>
        </div>
        <div class="modal-actions">
          <a class="btn btn--primary" href="status.html?id=${encodeURIComponent(lead.id)}">Проверить статус заявки</a>
          <button class="btn btn--secondary" type="button" data-close-modal>Вернуться к каталогу</button>
        </div>
      </div>
    `;
    $("[data-close-modal]", target).addEventListener("click", closeModals);
  }

  function renderLeadFallback(context) {
    const target = $("[data-lead-modal-content]");
    target.innerHTML = `
      <div class="fallback-state">
        <div class="warning-icon">!</div>
        <h2>Не удалось отправить заявку автоматически</h2>
        <p>Мы сохранили черновик на странице. Напишите нам в Telegram, и мы примем заявку вручную.</p>
        <div class="success-box"><span>Выбранное решение</span><strong>${esc(context.solution?.title || context.service || "Проект WEB00")}</strong></div>
        <a class="btn btn--primary btn--full" href="${attr(DATA.CONTACTS?.telegram?.href || "https://t.me/GarantiyWeb00bot")}" target="_blank" rel="noopener">Открыть Telegram</a>
        <button class="btn btn--secondary btn--full" type="button" onclick="location.reload()">Попробовать ещё раз</button>
      </div>
    `;
  }

  function openBugModal() {
    bugAttachment = null;
    renderBugForm();
    setModal("bug", true);
  }

  function renderBugForm() {
    const target = $("[data-bug-modal-content]");
    target.innerHTML = `
      <div class="bug-modal">
        <form data-bug-form novalidate>
          <h2 id="bug-title">Сообщить об ошибке</h2>
          <div class="bug-form-body">
            <p>Нажмите Print Screen и вставьте изображение через Ctrl+V или перетащите файл сюда.</p>
            <label><span class="field-label">Где находится ошибка? <b>*</b></span><input name="place" type="text" placeholder="Страница, раздел или действие" required></label>
            <label><span class="field-label">Что произошло? <b>*</b></span><textarea name="what" rows="3" placeholder="Опишите, что случилось" required></textarea></label>
            <label><span class="field-label">Что вы делали перед ошибкой? <b>*</b></span><textarea name="before" rows="2" placeholder="Какие действия привели к ошибке" required></textarea></label>
            <label>Контакт для связи <input name="contact" type="text" placeholder="Telegram, телефон или email"></label>
            <label class="upload-zone" data-upload-zone>
              <input name="screenshot" type="file" accept="image/*">
              <span>Перетащите файл сюда или нажмите для выбора<br><small>PNG, JPG, JPEG до 10 MB</small></span>
            </label>
            <p class="attachment-info" data-attachment-info></p>
          </div>
          <div class="modal-actions bug-form-footer"><button class="btn btn--primary" type="submit">Отправить сообщение</button><button class="btn btn--secondary" type="button" data-close-modal>Отмена</button></div>
        </form>
        <aside class="bug-help">
          <h3>Как правильно сообщить об ошибке</h3>
          <p><strong>Будьте точны</strong><br>Укажите страницу и действия.</p>
          <p><strong>Опишите проблему</strong><br>Расскажите, что произошло.</p>
          <p><strong>Прикрепите скриншот</strong><br>Он помогает быстрее понять проблему.</p>
        </aside>
      </div>
    `;
    const form = $("[data-bug-form]", target);
    const fileInput = form.elements.screenshot;
    const info = $("[data-attachment-info]", form);
    fileInput.addEventListener("change", () => setBugAttachment(fileInput.files[0], info));
    form.addEventListener("paste", (event) => {
      const file = Array.from(event.clipboardData?.files || []).find((item) => item.type.startsWith("image/"));
      if (file) setBugAttachment(file, info);
    });
    const zone = $("[data-upload-zone]", form);
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is-dragover");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-dragover"));
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-dragover");
      setBugAttachment(event.dataTransfer.files[0], info);
    });
    bindBugErrorCleanup(form);
    form.addEventListener("submit", submitBugReport);
    $("[data-close-modal]", target).addEventListener("click", closeModals);
  }

  function setBugAttachment(file, info) {
    if (!file) return;
    bugAttachment = file;
    info.textContent = `Прикреплён файл: ${file.name}`;
  }

  function submitBugReport(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const errors = [];
    if (!data.place?.trim()) errors.push("Укажите, где ошибка");
    if (!data.what?.trim()) errors.push("Опишите, что произошло");
    if (!data.before?.trim()) errors.push("Укажите, что вы делали перед ошибкой");
    if (errors.length) {
      ["place", "what", "before"].forEach((name) => {
        if (!data[name]?.trim()) form.elements[name].classList.add("is-invalid");
      });
      $(".attachment-info", form).textContent = errors.join(". ");
      $(".attachment-info", form).classList.add("is-error");
      return;
    }
    const report = DATA.createBugReport({
      place: data.place,
      what: data.what,
      before: data.before,
      contact: data.contact,
      fileName: bugAttachment?.name || "",
    });
    renderBugSuccess(report);
  }

  function renderBugSuccess(report) {
    const target = $("[data-bug-modal-content]");
    target.innerHTML = `
      <div class="success-state">
        <div class="success-icon">✓</div>
        <h2>Сообщение принято</h2>
        <p>Спасибо, что помогаете нам стать лучше.</p>
        <div class="success-box"><span>Номер обращения</span><strong class="lead-number">${esc(report.id)}</strong><span>${report.fileName ? `Скриншот: ${esc(report.fileName)}` : "Скриншот не прикреплён"}</span></div>
        <div class="modal-actions"><button class="btn btn--primary" type="button" data-close-modal>Вернуться на сайт</button><button class="btn btn--secondary" type="button" data-open-bug>Отправить ещё одно</button></div>
      </div>
    `;
    $("[data-close-modal]", target).addEventListener("click", closeModals);
    $("[data-open-bug]", target).addEventListener("click", openBugModal);
  }

  function bindBugErrorCleanup(form) {
    ["place", "what", "before"].forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener("input", () => {
        if (!field.value.trim()) return;
        field.classList.remove("is-invalid");
        if (![form.elements.place, form.elements.what, form.elements.before].some((item) => item.classList.contains("is-invalid"))) {
          const info = $(".attachment-info", form);
          info.classList.remove("is-error");
          info.textContent = bugAttachment ? `Прикреплён файл: ${bugAttachment.name}` : "";
        }
      });
    });
  }

  function initCalculator() {
    const form = $("#price-calculator");
    if (!form) return;
    const result = $("[data-calc-result]");

    function calculate() {
      const data = new FormData(form);
      const type = data.get("projectType");
      const pages = Number(data.get("pages") || "1");
      let base = { site: 18000, landing: 12000, shop: 15000, bot: 3000 }[type] || 12000;
      base += Math.max(0, pages - 1) * 1800;
      base += data.getAll("integrations").length * 2500;
      if (data.get("botLevel") === "simple") base += 3000;
      if (data.get("botLevel") === "advanced") base += 9000;
      if (data.get("support") === "1") base += 500;
      if (data.get("support") === "3") base += 1500;
      if (data.get("urgency") === "fast") base *= 1.25;
      if (data.get("design") === "standard") base *= 1.15;
      if (data.get("design") === "premium") base *= 1.35;
      const min = Math.round(base / 1000) * 1000;
      const max = min + Math.max(7000, Math.round(min * 0.28 / 1000) * 1000);
      const days = Math.max(2, Math.ceil(pages / 2) + data.getAll("integrations").length + (type === "bot" ? 1 : 4));
      result.innerHTML = `
        <h3>Предварительная оценка</h3>
        <p>Стоимость проекта <span>ориентировочно</span></p>
        <strong>от ${min.toLocaleString("ru-RU")} ₽ до ${max.toLocaleString("ru-RU")} ₽</strong>
        <p>Срок запуска: от ${days} до ${days + 5} рабочих дней</p>
        <ul><li>Проектирование и структура</li><li>Адаптивная вёрстка</li><li>Форма заявки</li><li>Базовая SEO-подготовка</li></ul>
        <small>Расчёт не является юридическим предложением. Итог фиксируется после обсуждения.</small>
      `;
      return { min, max, days };
    }

    form.addEventListener("change", calculate);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const calc = calculate();
      openLeadModal({ service: `Расчёт калькулятора: ${calc.min.toLocaleString("ru-RU")}–${calc.max.toLocaleString("ru-RU")} ₽` });
    });
    calculate();
  }

  function initStatusLookup() {
    $$("[data-status-lookup]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const lead = DATA.getLeadStatus(data.leadId);
        if (lead) {
          window.location.href = `status.html?id=${encodeURIComponent(lead.id)}`;
          return;
        }
        const message = $("[data-status-message]", form.closest(".status-lookup") || document);
        if (message) {
          message.textContent = "Заявка не найдена. Проверьте номер и контакт или свяжитесь с поддержкой.";
          message.classList.add("is-error");
        } else {
          window.location.href = `status.html?id=${encodeURIComponent(data.leadId || "")}&notFound=1`;
        }
      });
    });
  }

  function initMessageForm() {
    const form = $("[data-message-form]");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      openLeadModal({ service: "Сообщение из контактов" });
    });
  }

  function statusSteps(active) {
    const labels = ["Новая", "Уточнение", "Предложение", "В работе", "Демо", "Запуск"];
    return labels.map((label, index) => `<li class="${index + 1 <= active ? "is-done" : ""}"><span>${index + 1}</span><strong>${label}</strong></li>`).join("");
  }

  function renderStatusPage() {
    const root = $("#status-app");
    if (!root) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id") || "WEB00-2026-0001";
    const state = params.get("state");
    const lead = DATA.getLeadStatus(id);
    if (!lead && params.get("notFound")) {
      renderStatusNotFound(root, id);
      return;
    }
    const statusKey = state || lead?.status || "new";
    const status = DATA.LEAD_STATUSES[statusKey] || DATA.LEAD_STATUSES.new;
    const displayLead = lead || { id, solution: "WEB00 проект", contact: "Telegram", createdAt: new Date().toISOString() };
    displayLead.solution = normalizeSolutionTitle(displayLead.solution || "WEB00 проект");
    root.innerHTML = `
      <section class="status-hero">
        <p class="ui-kicker"><span></span>WEB00 · статус заявки</p>
        <h1>${esc(status.title)}</h1>
        <p>${esc(status.intro)}</p>
        <strong class="status-id">${esc(displayLead.id)}</strong>
      </section>
      <section class="status-layout">
        <div class="status-main glow-panel">
          <div class="status-current"><span class="status-dot status-dot--${esc(status.badge)}"></span><div><small>Текущий статус</small><h2 class="status-badge">${esc(status.label)}</h2><p>${esc(status.update)}</p></div></div>
          <ol class="status-progress">${statusSteps(status.progress)}</ol>
          <div class="status-note">${esc(status.clientAction)}</div>
          <div class="modal-actions"><button class="btn btn--primary" type="button">${esc(status.action)}</button></div>
        </div>
        <aside class="status-side">
          <article class="glass-card"><span>Выбранное решение</span><strong>${esc(displayLead.solution || "WEB00 проект")}</strong></article>
          <article class="glass-card"><span>Дата подачи заявки</span><strong>${new Date(displayLead.createdAt || Date.now()).toLocaleString("ru-RU")}</strong></article>
          <article class="glass-card"><span>Предпочтительный контакт</span><strong>${esc(displayLead.contact || "Telegram")}</strong></article>
          <article class="glass-card"><span>Действия клиента</span><p>${esc(status.clientAction)}</p></article>
        </aside>
      </section>
      <section class="status-switcher glow-panel">
        <h2>Демо состояний 21–30</h2>
        <div>${Object.entries(DATA.LEAD_STATUSES).filter(([key]) => key !== "completed").map(([key, item]) => `<a href="status.html?id=${encodeURIComponent(displayLead.id)}&state=${esc(key)}">${esc(item.label)}</a>`).join("")}</div>
      </section>
    `;
  }

  function renderStatusNotFound(root, id) {
    root.innerHTML = `
      <section class="not-found-layout">
        <aside class="glass-card">
          <h2>Проверьте данные</h2>
          <p>Убедитесь, что номер введён без лишних пробелов и указан тот же контакт.</p>
        </aside>
        <div class="not-found-card glow-panel">
          <div class="warning-icon">!</div>
          <h1>Заявка не найдена</h1>
          <p>Мы не нашли заявку с указанными данными. Возможно, номер или контакт введены неверно.</p>
          <form data-status-lookup>
            <input name="leadId" type="text" value="${esc(id)}" placeholder="Номер заявки">
            <input name="leadContact" type="text" placeholder="Контакт для связи">
            <button class="btn btn--primary btn--full" type="submit">Проверить ещё раз</button>
          </form>
          <button class="btn btn--secondary btn--full" type="button" data-open-lead>Связаться с поддержкой</button>
        </div>
      </section>
    `;
    initStatusLookup();
  }

  function initHome() {
    renderSolutions();
    renderServices();
    renderPricing();
    initFaq();
    initCalculator();
    initStatusLookup();
    initMessageForm();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initShell();
    if (page === "status") {
      renderStatusPage();
      initStatusLookup();
    } else {
      initHome();
    }
  });
})();
