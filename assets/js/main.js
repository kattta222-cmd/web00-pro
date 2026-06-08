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

  function solutionByIdStrict(id) {
    const value = String(id || "").trim();
    if (!value) return null;
    return solutions().find((item) => item.id === value || item.title === value || item.legacyTitle === value) || null;
  }

  function pricingByTitle(title) {
    const value = String(title || "").trim().toLowerCase();
    if (!value) return null;
    return (DATA.PRICING || []).find((item) => String(item.title || "").trim().toLowerCase() === value) || null;
  }

  function briefUrl(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      query.set(key, String(value));
    });
    const suffix = query.toString();
    return `brief.html${suffix ? `?${suffix}` : ""}`;
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
      const hasDemo = Boolean(solutionDemoUrl(solution));
      const tags = features.slice(0, 2);
      return `
      <article class="solution-card" data-solution-card data-category="${esc(solutionFilter(solution))}" data-solution-id="${esc(solution.id)}" role="button" tabindex="0" aria-label="Смотреть решение: ${esc(solution.title)}">
        ${solutionPreview(solution, { card: true })}
        <div class="solution-card__body">
          <div class="solution-card__tags">${tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>
          <h3>${esc(solution.title)}</h3>
          <p>${esc(solution.description || solutionAudience(solution))}</p>
          <div class="solution-card__meta"><b>${esc(solutionPrice(solution))}</b><span>${esc(solutionTime(solution))}</span></div>
          <div class="solution-card__actions">
            <button class="solution-card__action solution-card__action--secondary" type="button" data-card-action="${hasDemo ? "demo" : "details"}">${hasDemo ? "Смотреть демо" : "Подробнее"}</button>
            <a class="solution-card__action solution-card__action--primary" href="${attr(briefUrl({ solution: solution.id }))}">${hasDemo ? "Запустить" : "Оставить заявку"}</a>
          </div>
        </div>
      </article>
    `;
    }).join("");

    $$(".solution-card", grid).forEach((card) => {
      const openCard = () => openSolutionModal(solutionById(card.dataset.solutionId));
      card.addEventListener("click", (event) => {
        if (event.target.closest(".solution-card__actions")) return;
        openCard();
      });
      card.addEventListener("keydown", (event) => {
        if (event.target !== card) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        openCard();
      });
      $("[data-card-action]", card)?.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const solution = solutionById(card.dataset.solutionId);
        if (solutionDemoUrl(solution)) openDemoModal(solution);
        else openCard();
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
        <a href="${attr(briefUrl({ service: service.type }))}" aria-label="${esc(service.title)}">→</a>
      </article>
    `).join("");
  }

  function renderPricing() {
    const grid = $("[data-pricing-grid]");
    if (!grid) return;
    grid.innerHTML = DATA.PRICING.map((item) => {
      const rowsByTitle = {
        Start: [
          ["Срок запуска", "до 7 дней"],
          ["Поддержка", "30 дней"],
          ["Настройка контента", "Базовая"],
          ["Интеграции", "Базовые"],
          ["Количество страниц", "до 10"],
        ],
        Business: [
          ["Срок запуска", "до 14 дней"],
          ["Поддержка", "60 дней"],
          ["Настройка контента", "Стандартная"],
          ["Интеграции", "Расширенные"],
          ["Количество страниц", "до 20"],
        ],
        Pro: [
          ["Срок запуска", "до 21 дня"],
          ["Поддержка", "90 дней"],
          ["Настройка контента", "Индивидуальная"],
          ["Интеграции", "Максимальные"],
          ["Количество страниц", "до 50"],
        ],
      };
      const rows = rowsByTitle[item.title] || (item.features || []).map((feature) => [feature, ""]);
      const isRecommended = item.title === "Pro";
      return `
        <article class="price-card ${isRecommended ? "price-card--accent" : ""}">
          <div class="price-card__top">
            ${isRecommended ? '<span class="price-card__tag">Рекомендуем</span>' : ""}
          </div>
          <h3>${esc(item.title)}</h3>
          <strong>${esc(item.price)}</strong>
          <p>${esc(item.note)}</p>
          <ul class="price-card__specs">${rows.map(([label, value]) => `<li><span>${esc(label)}</span><b>${esc(value)}</b></li>`).join("")}</ul>
          <a class="btn btn--secondary btn--small" href="${attr(briefUrl({ tariff: item.title }))}">Выбрать тариф ${esc(item.title)}</a>
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
    const category = solution.category || "Бизнес";
    const bestForMap = {
      "Товары": "магазинам, шоурумам и локальным брендам, которым нужно показать ассортимент и быстро принимать заявки.",
      "Услуги": "специалистам и сервисным компаниям, которым важно понятно описать услуги и получать обращения клиентов.",
      "Строительство": "бригадам и компаниям, которым нужно показать работы, доверие, этапы и заявку на расчёт.",
      "Медицина": "медицинским услугам и кабинетам, где важны аккуратная подача, доверие и запись на консультацию.",
      "Недвижимость": "аренде, объектам и локальным предложениям, где нужно показать условия, фото и форму бронирования.",
      "Доставка": "локальному бизнесу с доставкой, прайсом и быстрым заказом через форму.",
      "Индивидуально": "бизнесу с нестандартной задачей, где готовый шаблон нужно адаптировать под особый сценарий.",
    };
    const included = [...new Set([...features, "Адаптивная версия", "Форма заявки", "Подготовка к запуску"])].slice(0, 7);
    const quality = ["Performance 90+", "SEO-ready", "Mobile-ready", "Адаптивность", "Поддержка после запуска"];
    const launchSteps = ["Бриф", "Подготовка", "Согласование", "Запуск", "Поддержка"];
    target.innerHTML = `
      <div class="solution-modal solution-modal--premium template-detail">
        <section class="template-detail__hero" aria-label="Подробности шаблона ${esc(solution.title)}">
          <div class="template-detail__visual">
            <div class="template-detail__eyebrow">Готовый сайт · ${esc(category)}</div>
            <section class="solution-gallery template-detail__gallery" aria-label="Галерея решения ${esc(solution.title)}">
              <div class="solution-gallery__stage template-detail__stage">
                ${activeImage ? `<img data-solution-gallery-main src="${attr(activeImage)}" alt="${attr(solution.title)} - экран сайта">` : `<div class="solution-gallery__empty">Preview готовится</div>`}
              </div>
              ${gallery.length > 1 ? `
                <div class="solution-gallery__thumbs template-detail__thumbs" role="list" aria-label="Экраны сайта">
                  ${gallery.map((image, index) => `
                    <button class="${index === 0 ? "is-active" : ""}" type="button" data-gallery-thumb data-gallery-image="${attr(image)}" aria-label="Показать экран ${index + 1}">
                      <img src="${attr(image)}" alt="" loading="lazy">
                    </button>
                  `).join("")}
                </div>
              ` : ""}
            </section>
          </div>

          <aside class="solution-detail template-detail__summary">
            <span class="solution-detail__tag">Шаблон готов к адаптации</span>
            <h2 id="solution-title">${esc(solution.title)}</h2>
            <p class="solution-detail__description">${esc(solution.description)}</p>
            <div class="solution-detail__meta template-detail__meta">
              <article><span>Стоимость</span><strong>${esc(price)}</strong></article>
              <article><span>Запуск</span><strong>${esc(time)}</strong></article>
            </div>
            <div class="template-detail__fit">
              <h3>Кому подходит</h3>
              <p>${esc(bestForMap[category] || "малому бизнесу, которому нужен понятный сайт с формой заявки и подготовкой к запуску.")}</p>
            </div>
            <ul class="check-list solution-detail__features">${features.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            <div class="solution-detail__actions template-detail__actions">
              <a class="btn btn--primary btn--full" href="${attr(briefUrl({ solution: solution.id }))}">Запустить этот сайт</a>
              ${hasDemo ? `<button class="btn btn--secondary btn--full" type="button" data-open-demo="${esc(solution.id)}">Смотреть демо</button>` : `<p class="template-detail__demo-note">Демо подберём после короткого брифа.</p>`}
            </div>
          </aside>
        </section>

        <section class="template-detail__sections" aria-label="Состав и запуск шаблона">
          <article class="template-detail__panel template-detail__panel--included">
            <span>Что входит</span>
            <h3>Основа для запуска сайта</h3>
            <ul class="check-list">${included.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          </article>
          <article class="template-detail__panel template-detail__panel--quality">
            <span>Паспорт качества</span>
            <h3>Проверяем перед запуском</h3>
            <div class="template-detail__quality-grid">
              ${quality.map((item) => `<b>${esc(item)}</b>`).join("")}
            </div>
          </article>
          <article class="template-detail__panel template-detail__panel--process">
            <span>Как запускаем</span>
            <h3>Понятный путь без лишней сложности</h3>
            <ol>
              ${launchSteps.map((item, index) => `<li><i>${index + 1}</i><strong>${esc(item)}</strong></li>`).join("")}
            </ol>
          </article>
        </section>
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
          <a class="btn btn--primary btn--small" href="${attr(briefUrl({ solution: solution.id }))}">Хочу такой сайт</a>
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
        <aside class="lead-aside brief-summary">
          <span class="brief-summary__eyebrow">Выбранный шаблон</span>
          ${solutionPreview(solution)}
          <h3>${esc(solution.title)}</h3>
          <p>${esc(solution.description)}</p>
          <div class="brief-summary__meta">
            <article><span>Запуск</span><strong>${esc(solutionTime(solution))}</strong></article>
            <article><span>Стоимость</span><strong>${esc(solutionPrice(solution))}</strong></article>
          </div>
          <ul class="check-list">${features.slice(0, 5).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <div class="brief-summary__trust">
            <span>Демо до оплаты</span>
            <span>Форма заявки</span>
            <span>Поддержка после запуска</span>
          </div>
        </aside>
      `;
    }
    const tariff = context.tariff;
    if (tariff) {
      const estimate = context.estimate || tariff.price || "";
      return `
        <aside class="lead-aside brief-summary">
          <span class="brief-summary__eyebrow">Выбранный тариф</span>
          <div class="service-selected"><span>WEB00</span><strong>${esc(tariff.title)}</strong></div>
          <p>${esc(tariff.note || "Тариф для запуска сайта с понятным объёмом работ и поддержкой после старта.")}</p>
          <div class="brief-summary__meta">
            <article><span>Стоимость</span><strong>${esc(estimate)}</strong></article>
            <article><span>Срок</span><strong>по тарифу</strong></article>
          </div>
          <ul class="check-list">${(tariff.features || []).slice(0, 5).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          <div class="brief-summary__trust">
            <span>Персональный менеджер</span>
            <span>Поддержка после запуска</span>
            <span>Правки и доработки</span>
            <span>Запуск и сопровождение</span>
          </div>
        </aside>
      `;
    }
    const service = context.service || "Сайт под ключ";
    const estimateMatch = service.match(/(\d[\d\s]*[–-]\d[\d\s]*\s*₽)/);
    const estimate = context.estimate || estimateMatch?.[1] || "";
    return `
      <aside class="lead-aside brief-summary">
        <span class="brief-summary__eyebrow">Контекст заявки</span>
        <div class="service-selected"><span>WEB00</span><strong>${esc(service)}</strong></div>
        ${estimate ? `<div class="brief-summary__estimate"><span>Ориентир</span><strong>${esc(estimate)}</strong></div>` : ""}
        <p>Опишите задачу, и мы предложим формат, срок и следующий шаг без лишней технической сложности.</p>
        <div class="brief-summary__meta">
          <article><span>Формат</span><strong>Подбор</strong></article>
          <article><span>Старт</span><strong>от 2 дней</strong></article>
        </div>
        <ul class="check-list"><li>Разбор задачи</li><li>Подбор формата сайта</li><li>Цена и срок</li><li>Демо до оплаты</li></ul>
        <div class="brief-summary__trust">
          <span>Без предоплаты</span>
          <span>Заявки в удобный канал</span>
          <span>Поддержка после запуска</span>
        </div>
      </aside>
    `;
  }

  function openLeadModal(context = {}) {
    const solution = context.solution || null;
    activeSolution = solution || activeSolution;
    activeService = context.service || (solution ? "Готовое решение" : "Сайт под ключ");
    renderLeadForm({ solution, service: activeService, tariff: context.tariff || null, estimate: context.estimate || "", mode: "modal", errors: null });
    setModal("lead", true);
  }

  function leadTarget(context = {}) {
    if (context.mode === "page") return $("[data-brief-page-content]");
    return $("[data-lead-modal-content]");
  }

  function renderLeadForm(context) {
    const target = leadTarget(context);
    if (!target) return;
    const isPageMode = context.mode === "page";
    const hasErrors = Boolean(context.errors);
    const rawTaskValue = context.solution
      ? "Запуск готового сайта"
      : context.tariff
        ? "Запуск готового сайта"
        : context.service || "Сайт под заказ";
    const taskValue = rawTaskValue.includes("Доработ")
      ? "Доработка сайта"
      : rawTaskValue.includes("Автомат") || rawTaskValue.includes("бот")
        ? "Автоматизация заявок"
        : rawTaskValue.includes("Поддерж")
          ? "Поддержка после запуска"
          : context.solution
            ? "Запуск готового сайта"
            : "Сайт под заказ";
    const introComment = context.solution
      ? `Интересует решение: ${context.solution.title}`
      : context.tariff
        ? `Интересует тариф: ${context.tariff.title}`
        : "";
    target.innerHTML = `
      <div class="${isPageMode ? "brief-page-ui" : "lead-modal"} brief-modal ${hasErrors ? "has-errors" : ""}">
        <form class="lead-form-ui brief-form" data-lead-form novalidate>
          ${isPageMode ? "" : `<div class="brief-modal__header">
            <span class="brief-kicker">WEB00 launch brief</span>
            <h2 id="lead-title">Бриф на запуск сайта</h2>
            <p>Расскажите о проекте — мы подготовим сайт, который привлечёт клиентов и поддержит ваш бренд.</p>
          </div>
          <div class="brief-stepper" aria-label="Этапы брифа">
            <span><b>1</b> Выбор</span>
            <span><b>2</b> Данные</span>
            <span><b>3</b> Контент</span>
            <span><b>4</b> Подтверждение</span>
          </div>`}
          ${hasErrors ? '<div class="alert alert--error">Пожалуйста, заполните обязательные поля</div>' : ""}

          <section class="brief-section">
            <div class="brief-section__head"><span>01</span><h3>Контакт и задача</h3></div>
            <div class="brief-grid">
              <label><span class="field-label">Ваше имя <b>*</b></span><input name="name" type="text" placeholder="Иван" autocomplete="name" required></label>
              <label><span class="field-label">Контакт для связи <b>*</b></span><input name="contact" type="text" placeholder="+7, Telegram или Email" autocomplete="tel" required></label>
              <label><span class="field-label">Ниша / сфера деятельности <b>*</b></span><select name="industry" required>
                <option value="">Выберите сферу</option>
                <option>Товары / интернет-магазин</option>
                <option>Услуги</option>
                <option>Строительство / ремонт</option>
                <option>Медицина / здоровье</option>
                <option>Недвижимость</option>
                <option>Доставка / локальный бизнес</option>
                <option>Индивидуальный проект</option>
                <option>Другое</option>
              </select></label>
              <label><span class="field-label">Название бизнеса / проекта</span><input name="businessName" type="text" placeholder="Название компании или проекта"></label>
              <label><span class="field-label">Тип задачи <b>*</b></span><select name="taskType" required>
                <option ${taskValue === "Запуск готового сайта" ? "selected" : ""}>Запуск готового сайта</option>
                <option ${taskValue === "Сайт под заказ" || taskValue === "Сайт под ключ" ? "selected" : ""}>Сайт под заказ</option>
                <option ${taskValue.includes("Доработ") ? "selected" : ""}>Доработка сайта</option>
                <option ${taskValue.includes("Автомат") || taskValue.includes("бот") ? "selected" : ""}>Автоматизация заявок</option>
                <option ${taskValue.includes("Поддерж") ? "selected" : ""}>Поддержка после запуска</option>
              </select></label>
              <label><span class="field-label">Бюджет <b>*</b></span><select name="budget" required><option>Пока не знаю</option><option>до 10 000 ₽</option><option>10 000-20 000 ₽</option><option>20 000-40 000 ₽</option><option>от 40 000 ₽</option></select></label>
            </div>
          </section>

          <section class="brief-section">
            <div class="brief-section__head"><span>02</span><h3>Содержание сайта</h3></div>
            <label><span class="field-label">Какие услуги или товары вы предлагаете?</span><textarea name="offerDescription" rows="4" maxlength="800" placeholder="Коротко опишите ассортимент, услуги, географию, особенности бизнеса"></textarea></label>
            <div class="brief-grid">
              <label><span class="field-label">Стиль и настроение сайта</span><input name="styleMood" type="text" placeholder="Например: спокойный, премиальный, строгий"></label>
              <label><span class="field-label">Примеры сайтов, которые нравятся</span><input name="references" type="text" placeholder="Ссылки или названия сайтов"></label>
            </div>
          </section>

          <section class="brief-section">
            <div class="brief-section__head"><span>03</span><h3>Запуск и заявки</h3></div>
            <div class="brief-grid brief-grid--compact">
              <fieldset class="brief-choice-group">
                <legend>Нужен ли домен?</legend>
                <label><input type="radio" name="domainNeeded" value="Да"> <span>Да</span></label>
                <label><input type="radio" name="domainNeeded" value="Нет"> <span>Нет</span></label>
                <label><input type="radio" name="domainNeeded" value="Не знаю" checked> <span>Не знаю</span></label>
              </fieldset>
              <fieldset class="brief-choice-group">
                <legend>Нужен ли блог / статьи?</legend>
                <label><input type="radio" name="blogNeeded" value="Да"> <span>Да</span></label>
                <label><input type="radio" name="blogNeeded" value="Нет"> <span>Нет</span></label>
                <label><input type="radio" name="blogNeeded" value="Позже" checked> <span>Позже</span></label>
              </fieldset>
            </div>
            <fieldset class="brief-choice-group brief-choice-group--wide">
              <legend>Куда должны приходить заявки?</legend>
              <label><input type="checkbox" name="leadChannels" value="Telegram" checked> <span>Telegram</span></label>
              <label><input type="checkbox" name="leadChannels" value="Email"> <span>Email</span></label>
              <label><input type="checkbox" name="leadChannels" value="WhatsApp"> <span>WhatsApp</span></label>
              <label><input type="checkbox" name="leadChannels" value="CRM"> <span>CRM</span></label>
            </fieldset>
          </section>

          <section class="brief-section">
            <div class="brief-section__head"><span>04</span><h3>Материалы и комментарий</h3></div>
            <div class="brief-upload-grid" aria-label="Материалы для будущей загрузки">
              <div class="brief-upload-placeholder"><strong>Логотип</strong><span>Файлы можно будет передать менеджеру после отправки брифа.</span></div>
              <div class="brief-upload-placeholder"><strong>Фото / изображения</strong><span>Файлы можно будет передать менеджеру после отправки брифа.</span></div>
            </div>
            <label><span class="field-label">Комментарий</span><textarea name="comment" rows="5" maxlength="700" placeholder="Опишите пожелания, сроки, важные детали">${introComment}</textarea></label>
          </section>

          <label class="checkbox-row brief-consent"><input name="consent" type="checkbox" required> <span class="field-label">Согласие на обработку данных <b>*</b></span></label>
          <div class="brief-actions">
            <button class="btn btn--primary btn--full" type="submit">Отправить бриф</button>
            ${isPageMode ? '<a class="btn btn--secondary btn--full" href="solutions.html">Вернуться к выбору</a>' : '<button class="btn btn--secondary btn--full" type="button" data-close-modal>Вернуться к выбору</button>'}
          </div>
          <small>Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности. Файлы сейчас не загружаются: их можно будет передать менеджеру после отправки брифа.</small>
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
    ["name", "contact", "industry", "taskType", "budget", "consent"].forEach((name) => {
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
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    const errors = {};
    if (!data.name?.trim()) errors.name = "Заполните имя";
    if (!data.contact?.trim()) errors.contact = "Укажите контакт";
    if (!data.industry?.trim()) errors.industry = "Выберите сферу";
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
        industry: data.industry,
        businessName: data.businessName?.trim() || "",
        offerDescription: data.offerDescription?.trim() || "",
        styleMood: data.styleMood?.trim() || "",
        references: data.references?.trim() || "",
        domainNeeded: data.domainNeeded || "Не знаю",
        leadChannels: formData.getAll("leadChannels"),
        blogNeeded: data.blogNeeded || "Позже",
        comment: data.comment?.trim() || "",
        solution: context.solution?.title || context.tariff?.title || context.service || data.taskType,
        selectedSolutionId: context.solution?.id || "",
        selectedTariff: context.tariff?.title || "",
        requestContext: context.estimate
          ? `${context.service || context.tariff?.title || data.taskType}: ${context.estimate}`
          : context.service || (context.solution ? "Готовый шаблон" : context.tariff ? `Тариф ${context.tariff.title}` : data.taskType),
      });
      renderLeadSuccess(lead, context);
    } catch (error) {
      renderLeadFallback(context);
    }
  }

  function renderLeadSuccess(lead, context) {
    const target = leadTarget(context);
    if (!target) return;
    const isPageMode = context.mode === "page";
    target.innerHTML = `
      <div class="success-state ${isPageMode ? "brief-page-success" : ""}">
        <div class="success-icon">✓</div>
        <h2>Бриф отправлен</h2>
        <p>Мы получили данные по проекту. Менеджер свяжется с вами, уточнит детали и подготовит следующий шаг.</p>
        <div class="success-box success-box--lead">
          <span>Номер заявки</span>
          <strong class="lead-number">${esc(lead.id)}</strong>
          <span class="success-badge">Новая</span>
          <span>Выбранное решение: ${esc(normalizeSolutionTitle(lead.solution || context.solution?.title || context.service || "WEB00 проект"))}</span>
          <span>Сфера: ${esc(lead.industry || "Будет уточнена")}</span>
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
          ${isPageMode ? '<a class="btn btn--secondary" href="solutions.html">Вернуться к каталогу</a>' : '<button class="btn btn--secondary" type="button" data-close-modal>Вернуться к каталогу</button>'}
        </div>
      </div>
    `;
    $("[data-close-modal]", target)?.addEventListener("click", closeModals);
  }

  function renderLeadFallback(context) {
    const target = leadTarget(context);
    if (!target) return;
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
        const leadId = String(data.leadId || "").trim();
        const isDirectLookup = form.getAttribute("data-status-lookup") === "direct";
        if (!leadId) {
          const message = $("[data-status-message]", form.closest(".status-lookup") || form.closest(".status-lookup-card") || document);
          if (message) {
            message.textContent = "Введите номер заявки.";
            message.classList.add("is-error");
          }
          return;
        }
        const lead = DATA.getLeadStatus(leadId);
        if (lead) {
          window.location.href = `status.html?id=${encodeURIComponent(lead.id)}`;
          return;
        }
        if (isDirectLookup) {
          window.location.href = `status.html?id=${encodeURIComponent(leadId)}`;
          return;
        }
        const message = $("[data-status-message]", form.closest(".status-lookup") || form.closest(".status-lookup-card") || document);
        if (message) {
          message.textContent = "Заявка не найдена. Проверьте номер и контакт или свяжитесь с поддержкой.";
          message.classList.add("is-error");
        } else {
          window.location.href = `status.html?id=${encodeURIComponent(data.leadId || "")}&notFound=1`;
        }
      });
    });
  }

  function readBriefDraftContext() {
    try {
      return JSON.parse(sessionStorage.getItem("WEB00_BRIEF_CONTEXT") || "{}");
    } catch (error) {
      return {};
    }
  }

  function initBriefPage() {
    const root = $("[data-brief-page-content]");
    if (!root) return;
    const params = new URLSearchParams(window.location.search);
    const draft = readBriefDraftContext();
    const solution = solutionByIdStrict(params.get("solution") || draft.solutionId);
    const tariff = pricingByTitle(params.get("tariff") || draft.tariff);
    const service = params.get("service") || draft.service || (tariff ? `Тариф ${tariff.title}` : "");
    const estimate = params.get("estimate") || draft.estimate || "";
    renderLeadForm({
      mode: "page",
      solution,
      tariff,
      service: service || (solution ? "Готовое решение" : "Сайт под заказ"),
      estimate,
      errors: null,
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
    const labels = [
      ["Анкета получена", "Бриф сохранён"],
      ["Уточняем детали", "Формат и объём"],
      ["Материалы", "Контент и доступы"],
      ["Сайт в работе", "Структура и сборка"],
      ["Проверка качества", "Адаптив и формы"],
      ["Согласование", "Комментарии клиента"],
      ["Публикация", "Финальный запуск"],
      ["Поддержка", "После старта"],
    ];
    const current = Math.max(1, Math.min(Number(active) || 1, labels.length));
    return labels.map(([label, note], index) => {
      const step = index + 1;
      const className = step < current ? "is-done" : step === current ? "is-active" : "";
      return `<li class="${className}"><span>${step}</span><strong>${label}</strong><small>${note}</small></li>`;
    }).join("");
  }

  function statusStage(statusKey, status) {
    const map = {
      new: 1,
      clarification_needed: 2,
      proposal_ready: 3,
      waiting_client_confirmation: 3,
      in_progress: 4,
      revision_in_progress: 6,
      demo_ready: 5,
      delayed: 5,
      ready_to_launch: 7,
      launched: 8,
      completed: 8,
    };
    return map[statusKey] || Math.max(1, Math.min(Number(status?.progress) || 1, 8));
  }

  function formatStatusDate(value) {
    if (!value) return "Уточняется";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Уточняется";
    return date.toLocaleString("ru-RU", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function statusLeadSolution(lead) {
    if (!lead) return null;
    if (lead.selectedSolutionId) {
      const byId = DATA.SOLUTIONS.find((item) => item.id === lead.selectedSolutionId);
      if (byId) return byId;
    }
    const title = normalizeSolutionTitle(lead.solution || "");
    return DATA.SOLUTIONS.find((item) => item.title === title || item.legacyTitle === title || item.id === title) || null;
  }

  function statusDisplayValue(value, fallback = "Уточняется") {
    if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function statusFact(label, value, fallback = "Уточняется") {
    return `<article><span>${esc(label)}</span><strong>${esc(statusDisplayValue(value, fallback))}</strong></article>`;
  }

  function statusCompactDate(value) {
    if (!value) return "Уточняется";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Уточняется";
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  }

  function statusEstimate(lead) {
    const source = [lead?.requestContext, lead?.solution, lead?.budget].filter(Boolean).join(" ");
    const match = source.match(/(\d[\d\s]*[–-]\d[\d\s]*\s*₽|от\s*\d[\d\s]*\s*₽)/i);
    return match ? match[1] : "";
  }

  function renderStatusLookup(root) {
    root.innerHTML = `
      <section class="status-lookup-page">
        <div class="status-lookup-card">
          <p class="status-kicker"><span></span>WEB00 · кабинет клиента</p>
          <h1>Проверить статус заявки</h1>
          <p>Введите номер заявки, чтобы открыть статус проекта и следующий шаг по запуску сайта.</p>
          <form data-status-lookup="direct">
            <label>
              <span>Номер заявки</span>
              <input name="leadId" type="text" placeholder="WEB00-2026-0001" autocomplete="off">
            </label>
            <button class="btn btn--primary" type="submit">Открыть статус</button>
          </form>
          <p class="status-form-message" data-status-message></p>
          <div class="status-lookup-actions">
            <a class="btn btn--secondary" href="solutions.html">Вернуться в каталог</a>
            <button class="btn btn--secondary" type="button" data-open-lead>Оставить заявку</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderStatusPage() {
    const root = $("#status-app");
    if (!root) return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
      renderStatusLookup(root);
      initStatusLookup();
      return;
    }
    const state = params.get("state");
    const lead = DATA.getLeadStatus(id);
    if (!lead) {
      renderStatusNotFound(root, id);
      return;
    }
    const statusKey = state && DATA.LEAD_STATUSES[state] ? state : lead.status || "new";
    const status = DATA.LEAD_STATUSES[statusKey] || DATA.LEAD_STATUSES.new;
    const solution = statusLeadSolution(lead);
    const selectedTitle = solution?.title || normalizeSolutionTitle(lead.solution || lead.requestContext || lead.taskType || "WEB00 проект");
    const estimate = statusEstimate(lead);
    const stage = statusStage(statusKey, status);
    const launchValue = solution ? solutionTime(solution) : lead.launchEstimate || "от 2 дней";
    const priceValue = estimate || (solution ? solutionPrice(solution) : lead.budget);
    const channels = statusDisplayValue(lead.leadChannels, "Telegram / удобный канал");
    const tariffValue = statusDisplayValue(lead.tariff || lead.service || lead.taskType, solution ? "Готовый сайт" : "По задаче");
    const passportItems = [
      statusFact("Формат", tariffValue),
      statusFact("Стоимость", priceValue),
      statusFact("Срок запуска", launchValue),
      statusFact("Ниша / сфера", lead.industry),
      statusFact("Страницы", solution?.features?.length ? `до ${Math.max(5, solution.features.length + 4)}` : "по задаче"),
      statusFact("Язык сайта", "русский"),
      statusFact("Интеграции", channels),
      statusFact("Домен", lead.domainNeeded),
    ].join("");
    const summaryItems = [
      statusFact("Статус проекта", status.label),
      statusFact("Дата заявки", statusCompactDate(lead.createdAt)),
      statusFact("Контакт", lead.contact),
      statusFact("Бизнес", lead.businessName || lead.name),
    ].join("");
    const includedItems = [
      ...(solution?.features || []),
      "Адаптивная вёрстка",
      "Форма заявки",
      "Базовая SEO-подготовка",
      "Техническая поддержка после запуска",
    ].slice(0, 7);
    const integrationItems = [
      ["Форма обратной связи", "Подключается"],
      [channels, "По брифу"],
      ["Почта для заявок", lead.contact ? "Уточняется" : "Ожидает"],
    ];
    const supportItems = [
      ["Техническая поддержка", "Включено"],
      ["Помощь после запуска", "Включено"],
      ["Правки и уточнения", "По задаче"],
      ["Консультация", "Доступна"],
    ];
    const historyItems = [
      ["Бриф отправлен", formatStatusDate(lead.createdAt)],
      ["Заявка зарегистрирована", `Номер ${lead.id}`],
      ["Текущий статус обновлён", status.update],
    ];
    const notificationItems = [
      ["Данные проекта сохранены", formatStatusDate(lead.createdAt)],
      ["Следующий шаг определён", status.clientAction],
      ["Канал связи указан", statusDisplayValue(lead.contact, "Уточняется")],
    ];
    const projectFacts = [
      statusFact("Номер", lead.id),
      statusFact("Клиент", lead.name),
      statusFact("Домен", lead.domainNeeded),
      statusFact("Блог / статьи", lead.blogNeeded),
    ].join("");
    const description = lead.offerDescription || lead.comment || status.clientAction;
    root.innerHTML = `
      <section class="status-hero status-hero--cabinet">
        <div>
          <p class="status-kicker"><span></span>WEB00 · frontend-preview cabinet</p>
          <h1>Кабинет проекта</h1>
          <p>Следите за статусом заявки, сохранёнными данными брифа и следующим шагом по запуску сайта.</p>
        </div>
        <button class="btn btn--secondary" type="button" data-open-lead>Задать вопрос</button>
      </section>

      <div class="status-dashboard" aria-label="Кабинет проекта">
        <section class="status-dashboard-grid">
          <article class="status-project-card status-card">
            <div class="status-project-card__preview">
              ${solution ? solutionPreview(solution) : `<div class="status-service-preview"><strong>WEB00</strong><span>${esc(selectedTitle)}</span></div>`}
            </div>
            <div class="status-project-card__body">
              <span class="status-card-label">Текущий проект</span>
              <h2>${esc(selectedTitle)}</h2>
              <div class="status-project-meta">
                <span>${esc(tariffValue)}</span>
                <strong class="status-badge status-badge--${esc(status.badge)}">${esc(status.label)}</strong>
              </div>
              <div class="status-summary-grid status-summary-grid--compact">${summaryItems}</div>
            </div>
          </article>

          <aside class="status-action-card status-card">
            <span class="status-card-label">Следующее действие</span>
            <h3>${statusKey === "new" ? "Ожидайте связи" : esc(status.action || "Уточнить детали")}</h3>
            <p>${esc(status.clientAction)}</p>
            <button class="btn btn--primary" type="button" data-open-lead>Уточнить детали</button>
            <small>Это frontend-preview статус: данные сохранены локально, без реальных уведомлений.</small>
          </aside>
        </section>

        <section class="status-timeline-card status-card">
          <div class="status-section-head">
            <span>Прогресс выполнения</span>
            <h2>Путь от анкеты до поддержки</h2>
          </div>
          <ol class="status-progress status-progress--cabinet">${statusSteps(stage)}</ol>
        </section>

        <section class="status-dashboard-grid status-dashboard-grid--details">
          <article class="status-passport-card status-card">
            <div class="status-section-head">
              <span>Паспорт проекта</span>
              <h2>Данные проекта</h2>
            </div>
            <div class="status-passport-layout">
              <div class="status-passport-grid">${passportItems}</div>
              <div>
                <h3>Что входит в проект</h3>
                <ul class="status-check-list">
                  ${includedItems.map((item) => `<li>${esc(item)}</li>`).join("")}
                </ul>
              </div>
            </div>
            ${description ? `<div class="status-description"><span>Краткое описание</span><p>${esc(description)}</p></div>` : ""}
          </article>

          <aside class="status-integrations-card status-card">
            <div class="status-section-head">
              <span>Заявки и интеграции</span>
              <h2>Куда пойдут обращения</h2>
            </div>
            <ul class="status-support-list">
              ${integrationItems.map(([label, value]) => `<li><span>${esc(label)}</span><strong>${esc(value)}</strong></li>`).join("")}
            </ul>
          </aside>
        </section>

        <section class="status-dashboard-grid status-dashboard-grid--support">
          <article class="status-support-card status-card">
            <div class="status-section-head">
              <span>Что входит в поддержку</span>
              <h2>Связь и сопровождение</h2>
            </div>
            <ul class="status-support-list">
              ${supportItems.map(([label, value]) => `<li><span>${esc(label)}</span><strong>${esc(value)}</strong></li>`).join("")}
            </ul>
          </article>

          <article class="status-history-card status-card">
            <div class="status-section-head">
              <span>История</span>
              <h2>События заявки</h2>
            </div>
            <ul class="status-history">
              ${historyItems.map(([title, text]) => `<li><strong>${esc(title)}</strong><small>${esc(text)}</small></li>`).join("")}
            </ul>
          </article>

          <article class="status-notifications-card status-card">
            <div class="status-section-head">
              <span>Уведомления</span>
              <h2>Что важно сейчас</h2>
            </div>
            <ul class="status-history">
              ${notificationItems.map(([title, text]) => `<li><strong>${esc(title)}</strong><small>${esc(text)}</small></li>`).join("")}
            </ul>
          </article>
        </section>

        <section class="status-meta-strip status-card" aria-label="Сводка заявки">
          ${projectFacts}
        </section>
      </div>
    `;
  }

  function renderStatusNotFound(root, id) {
    root.innerHTML = `
      <section class="not-found-layout status-not-found-page">
        <div class="not-found-card status-lookup-card">
          <p class="status-kicker"><span></span>WEB00 · статус заявки</p>
          <h1>Заявка не найдена</h1>
          <p>Мы не нашли заявку с номером ${id ? `<strong>${esc(id)}</strong>` : "без номера"}. Проверьте номер из письма, сообщения или success-экрана.</p>
          <form data-status-lookup="direct">
            <label>
              <span>Номер заявки</span>
              <input name="leadId" type="text" value="${esc(id || "")}" placeholder="WEB00-2026-0001" autocomplete="off">
            </label>
            <button class="btn btn--primary btn--full" type="submit">Проверить ещё раз</button>
          </form>
          <p class="status-form-message" data-status-message></p>
          <div class="status-lookup-actions">
            <a class="btn btn--secondary" href="solutions.html">Вернуться в каталог</a>
            <button class="btn btn--secondary" type="button" data-open-lead>Оставить заявку</button>
          </div>
        </div>
        <aside class="status-help-card">
          <h2>Что можно сделать</h2>
          <ul>
            <li>Проверьте, что номер введён без лишних пробелов.</li>
            <li>Откройте ссылку из экрана “Бриф отправлен”.</li>
            <li>Если номер потерян, оставьте заявку повторно.</li>
          </ul>
        </aside>
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
    } else if (page === "brief") {
      initBriefPage();
    } else {
      initHome();
    }
  });
})();
