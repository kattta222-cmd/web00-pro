(function () {
  const STORAGE_KEYS = {
    leads: "web00_pro_leads",
    bugs: "web00_pro_bug_reports",
    leadSeq: "web00_pro_lead_seq",
    bugSeq: "web00_pro_bug_seq",
  };

  const CONTACTS = {
    telegram: {
      label: "Telegram",
      value: "GarantiyWeb00bot",
      href: "https://t.me/GarantiyWeb00bot",
      placeholder: false,
    },
    max: {
      label: "MAX",
      value: "WEB00 в MAX",
      href: "https://max.ru/u/f9LHodD0cOKyonoj-aP5RBGWocesp86479bRtc3lkiQ0qzWtqtXIEiV2tVs",
      placeholder: false,
    },
    vk: {
      label: "VK",
      value: "club231397496",
      href: "https://vk.com/club231397496/",
      placeholder: false,
    },
    phone: {
      label: "Телефон",
      value: "+7 (905) 861-52-31",
      href: "tel:+79058615231",
      placeholder: false,
    },
    email: {
      label: "E-mail",
      value: "email уточняется",
      href: "#",
      placeholder: true,
    },
  };

  const SOLUTIONS = [
    {
      id: "mebel",
      legacyTitle: "Мебельный магазин",
      title: "Мебельный магазин",
      editableTitle: true,
      category: "Товары",
      description: "Витрина мебельного магазина с категориями, карточками товаров, условиями доставки и заявкой на расчёт.",
      priceFrom: "от 15 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Каталог товаров", "Категории и фильтры", "Заявка на расчёт", "Адаптив"],
      demoLocalUrl: "demos/mebel/index.html",
      originalDemoUrl: "https://prudexxx.github.io/MEBELPlanet/",
      demoUrl: "https://prudexxx.github.io/MEBELPlanet/",
      previewImage: "assets/img/previews/mebel.svg",
      previewType: "goods",
      active: true,
    },
    {
      id: "odezhda",
      legacyTitle: "Магазин одежды",
      title: "Магазин одежды",
      editableTitle: true,
      category: "Товары",
      description: "Мини-магазин для локального бренда, шоурума или продаж из соцсетей с быстрым заказом.",
      priceFrom: "от 15 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Коллекции", "Карточки товаров", "Размеры", "Заказ через форму"],
      demoLocalUrl: "demos/odezhda/index.html",
      originalDemoUrl: "https://prudexxx.github.io/OdegdaPlanet/",
      demoUrl: "https://prudexxx.github.io/OdegdaPlanet/",
      previewImage: "assets/img/previews/odezhda.svg",
      previewType: "goods",
      active: true,
    },
    {
      id: "cleaning",
      legacyTitle: "Услуга клининга",
      title: "Услуга клининга",
      editableTitle: true,
      category: "Услуги",
      description: "Лендинг клининга с пакетами уборки, преимуществами, расчётом и заявкой.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Виды уборки", "Пакеты услуг", "Форма расчёта", "Telegram-уведомления"],
      demoLocalUrl: "demos/cleaning/index.html",
      originalDemoUrl: "https://prudexxx.github.io/Klining/",
      demoUrl: "https://prudexxx.github.io/Klining/",
      previewImage: "assets/img/previews/cleaning.svg",
      previewType: "services",
      active: true,
    },
    {
      id: "krovlya",
      legacyTitle: "Услуга кровли",
      title: "Услуга кровли",
      editableTitle: true,
      category: "Строительство",
      description: "Сайт для кровельной бригады или компании: услуги, этапы, гарантии и заявка на замер.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Услуги", "Портфолио", "Расчёт работ", "Заявка на замер"],
      demoLocalUrl: "demos/krovlya/index.html",
      originalDemoUrl: "https://prudexxx.github.io/Krovla/",
      demoUrl: "https://prudexxx.github.io/Krovla/",
      previewImage: "assets/img/previews/krovlya.svg",
      previewType: "construction",
      active: true,
    },
    {
      id: "massage",
      legacyTitle: "Массаж",
      title: "Массаж",
      editableTitle: true,
      category: "Красота",
      description: "Доверительный лендинг для специалиста или салона с услугами, записью и отзывами.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 2 дней",
      features: ["Услуги и цены", "Онлайн-запись", "Отзывы", "Блок доверия"],
      demoLocalUrl: "demos/massage/index.html",
      originalDemoUrl: "https://prudexxx.github.io/m/",
      demoUrl: "https://prudexxx.github.io/m/",
      previewImage: "assets/img/previews/massage.svg",
      previewType: "beauty",
      active: true,
    },
    {
      id: "uslugi",
      legacyTitle: "Услуга муж на час",
      title: "Услуга муж на час",
      editableTitle: true,
      category: "Услуги",
      description: "Универсальный сайт для частного специалиста или команды, которым нужны заявки из рекламы.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 2 дней",
      features: ["Оффер", "Услуги", "FAQ", "Форма заявки"],
      demoLocalUrl: "demos/uslugi/index.html",
      originalDemoUrl: "https://prudexxx.github.io/MugNaChas/",
      demoUrl: "https://prudexxx.github.io/MugNaChas/",
      previewImage: "assets/img/previews/uslugi.svg",
      previewType: "services",
      active: true,
    },
    {
      id: "drova",
      legacyTitle: "Доставка и продажа дров",
      title: "Доставка и продажа дров",
      editableTitle: true,
      category: "Доставка",
      description: "Страница для локальной доставки товаров с ассортиментом, зонами доставки и быстрым заказом.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 2 дней",
      features: ["Ассортимент", "Зоны доставки", "Прайс", "Быстрый заказ"],
      demoLocalUrl: "demos/delivery/index.html",
      originalDemoUrl: "https://дровасухие.рф",
      demoUrl: "https://дровасухие.рф",
      previewImage: "assets/img/previews/drova.svg",
      previewType: "delivery",
      active: true,
    },
    {
      id: "telegram-bot",
      legacyTitle: null,
      title: "Telegram-бот для заявок",
      editableTitle: true,
      category: "Автоматизация",
      description: "Бот для приёма обращений, первичной квалификации клиента и уведомлений владельцу.",
      priceFrom: "от 3 000 ₽",
      deliveryTime: "от 2 дней",
      features: ["Сценарий диалога", "Кнопки", "Сбор контактов", "Уведомления"],
      demoLocalUrl: "demos/telegram-bot/index.html",
      originalDemoUrl: "https://t.me/GarantiyWeb00bot",
      demoUrl: "https://t.me/GarantiyWeb00bot",
      previewImage: "assets/img/previews/telegram-bot.svg",
      previewType: "automation",
      active: true,
    },
    {
      id: "site-custom",
      legacyTitle: "Сайт под заказ",
      title: "Сайт под заказ",
      editableTitle: true,
      category: "Индивидуально",
      description: "Индивидуальный сайт под запрос клиента. В текущем каталоге представлен как услуга WEB00 Pro, карточка сохранена для будущей витрины.",
      priceFrom: "от 15 000 ₽",
      deliveryTime: "по оценке задачи",
      features: ["Индивидуальная структура", "Адаптив", "Форма заявки", "Подбор решения"],
      originalDemoUrl: "",
      demoUrl: "",
      previewImage: "",
      previewType: "services",
      active: false,
      backlog: true,
    },
    {
      id: "doma-bani",
      legacyTitle: "Дома, бани из сруба",
      title: "Дома, бани из сруба",
      editableTitle: true,
      category: "Строительство",
      description: "Шаблон строительной тематики для домов и бань из сруба. Оставлен в backlog до отдельного локального демо.",
      priceFrom: "от 15 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Каталог проектов", "Карточки объектов", "Заявка на расчёт", "Портфолио"],
      originalDemoUrl: "https://prudexxx.github.io/DomaBani/",
      demoUrl: "https://prudexxx.github.io/DomaBani/",
      previewImage: "",
      previewType: "construction",
      active: false,
      backlog: true,
    },
    {
      id: "medicine",
      legacyTitle: "Медицина услуги",
      title: "Медицина услуги",
      editableTitle: true,
      category: "Услуги",
      description: "Медицинская услуга из старой витрины. Не активирована в основном каталоге до отдельной проверки ниши и текстов.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Описание услуг", "Преимущества", "Запись", "Контакты"],
      originalDemoUrl: "https://prudexxx.github.io/MedizinaPlanet/",
      demoUrl: "https://prudexxx.github.io/MedizinaPlanet/",
      previewImage: "",
      previewType: "services",
      active: false,
      backlog: true,
    },
    {
      id: "narko-medicine",
      legacyTitle: "Наркологическая медицина",
      title: "Наркологическая медицина",
      editableTitle: true,
      category: "Услуги",
      description: "Наркологическая медицинская услуга из старой витрины. Оставлена в backlog до отдельной юридической и контентной проверки.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Описание услуг", "Блок доверия", "Запись", "Контакты"],
      originalDemoUrl: "https://prudexxx.github.io/NarkoKlinika/",
      demoUrl: "https://prudexxx.github.io/NarkoKlinika/",
      previewImage: "",
      previewType: "services",
      active: false,
      backlog: true,
    },
    {
      id: "advokat",
      legacyTitle: "Услуга адвоката",
      title: "Услуга адвоката",
      editableTitle: true,
      category: "Услуги",
      description: "Юридическая услуга из старой витрины. Сохранена как backlog-карточка для будущей проработки.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Услуги", "Преимущества", "Форма консультации", "Контакты"],
      originalDemoUrl: "https://prudexxx.github.io/Advokat/",
      demoUrl: "https://prudexxx.github.io/Advokat/",
      previewImage: "",
      previewType: "services",
      active: false,
      backlog: true,
    },
    {
      id: "digital-projects",
      legacyTitle: "Цифровые проекты",
      title: "Цифровые проекты",
      editableTitle: true,
      category: "Услуги",
      description: "Шаблон для цифровых услуг и проектной деятельности. Оставлен в backlog.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Оффер", "Проекты", "Заявка", "Портфолио"],
      originalDemoUrl: "https://prudexxx.github.io/ProektyPlanet/",
      demoUrl: "https://prudexxx.github.io/ProektyPlanet/",
      previewImage: "",
      previewType: "automation",
      active: false,
      backlog: true,
    },
    {
      id: "ruberoid-roof",
      legacyTitle: "Услуга кровли рубероида",
      title: "Услуга кровли рубероида",
      editableTitle: true,
      category: "Строительство",
      description: "Узкий строительный шаблон под кровлю рубероидом. Сохранён в backlog, чтобы не дублировать активную карточку кровли.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Услуги", "Материалы", "Расчёт", "Заявка"],
      originalDemoUrl: "https://prudexxx.github.io/Ruberoid/",
      demoUrl: "https://prudexxx.github.io/Ruberoid/",
      previewImage: "",
      previewType: "construction",
      active: false,
      backlog: true,
    },
    {
      id: "rental-house",
      legacyTitle: "Дом под сдачу",
      title: "Дом под сдачу",
      editableTitle: true,
      category: "Услуги",
      description: "Шаблон для сдачи дома в аренду. Оставлен в backlog до отдельного сценария бронирования.",
      priceFrom: "от 12 000 ₽",
      deliveryTime: "от 3 дней",
      features: ["Описание объекта", "Условия", "Галерея", "Заявка"],
      originalDemoUrl: "https://prudexxx.github.io/Dom/",
      demoUrl: "https://prudexxx.github.io/Dom/",
      previewImage: "",
      previewType: "services",
      active: false,
      backlog: true,
    },
  ];

  const SERVICES = [
    { id: "ready", title: "Готовые решения", text: "Готовые сайты и комплекты для быстрого старта бизнеса.", icon: "▣", type: "Готовое решение" },
    { id: "site", title: "Сайт под ключ", text: "Чистый код, адаптив, заявки и помощь с доменом или хостингом.", icon: "</>", type: "Сайт под ключ" },
    { id: "bot", title: "Telegram-боты", text: "Боты для заявок, консультаций, уведомлений и простых сценариев продаж.", icon: "→", type: "Telegram-бот" },
    { id: "automation", title: "Автоматизация заявок", text: "Передача данных с сайта в Telegram или таблицу после подключения backend.", icon: "⌁", type: "Автоматизация заявок" },
    { id: "redesign", title: "Доработка и редизайн", text: "Улучшим структуру, адаптив, форму, визуальный стиль и сценарий заявки.", icon: "✎", type: "Доработка сайта" },
    { id: "support", title: "Поддержка и сопровождение", text: "Обновления, правки, развитие сайта и техническая помощь после запуска.", icon: "☏", type: "Поддержка" },
  ];

  const PRICING = [
    { title: "Мини-сайт", price: "от 7 000 ₽", note: "Для простой презентации услуги или оффера.", tag: "Быстрый старт" },
    { title: "Лендинг", price: "от 12 000 ₽", note: "Для рекламы, заявок и продажи одной услуги.", tag: "Популярный" },
    { title: "Каталог / мини-магазин", price: "от 15 000 ₽", note: "Для товаров, категорий и заказов.", tag: "Витрина" },
    { title: "Telegram-бот", price: "от 3 000 ₽", note: "Для заявок, сценариев и уведомлений.", tag: "Автоматизация" },
    { title: "Поддержка", price: "от 500 ₽/мес", note: "Правки и сопровождение после запуска.", tag: "После запуска" },
  ];

  const FAQ_ITEMS = [
    { category: "price", question: "Сколько стоит сайт?", answer: "Мини-сайт начинается от 7 000 ₽, лендинг от 12 000 ₽, каталог или мини-магазин от 15 000 ₽. Точная цена зависит от объёма и функций." },
    { category: "terms", question: "Сколько времени занимает запуск?", answer: "Готовые решения можно адаптировать от 2 дней. Индивидуальные проекты обычно занимают больше времени, срок фиксируется после обсуждения." },
    { category: "price", question: "Можно ли без предоплаты?", answer: "Да. Сначала показываю результат или демо, затем обсуждаем оплату и запуск." },
    { category: "launch", question: "Где будет размещён сайт?", answer: "Можно разместить на статическом хостинге, Cloudflare Pages, GitHub Pages или другом варианте. Перед запуском выбираем удобную схему." },
    { category: "technical", question: "Можно ли подключить Telegram?", answer: "Да. Сейчас в frontend есть mock-сценарий, а затем можно подключить backend/Worker и Telegram Bot API." },
    { category: "support", question: "Есть ли поддержка после запуска?", answer: "Да. Можно обновлять тексты, цены, товары, блоки и постепенно развивать сайт." },
    { category: "changes", question: "Можно ли доработать существующий сайт?", answer: "Да. Можно улучшить адаптив, форму, структуру, дизайн, скорость и пользовательский сценарий." },
  ];

  const LEAD_STATUSES = {
    new: {
      label: "Новая",
      badge: "blue",
      title: "Статус вашей заявки",
      intro: "Спасибо! Ваша заявка принята в работу. Мы уже приступили к её обработке.",
      progress: 1,
      update: "Заявка принята и зарегистрирована.",
      action: "Открыть детали заявки",
      clientAction: "Ожидайте связи. Мы уточним детали и предложим следующий шаг.",
    },
    in_progress: {
      label: "В работе",
      badge: "blue",
      title: "Проект в работе",
      intro: "Мы работаем над реализацией и обновляем статус по мере продвижения.",
      progress: 4,
      update: "Структура согласована, дизайн и сборка в работе.",
      action: "Посмотреть прогресс",
      clientAction: "Можно написать менеджеру, если появились новые вводные.",
    },
    clarification_needed: {
      label: "Нужны уточнения",
      badge: "gold",
      title: "Нужны уточнения",
      intro: "Нам нужны дополнительные данные, чтобы подготовить точный результат.",
      progress: 2,
      update: "Ожидаем материалы, пожелания или ответы по структуре.",
      action: "Отправить уточнение",
      clientAction: "Ответьте в течение 2 дней, чтобы мы не приостанавливали работу.",
    },
    proposal_ready: {
      label: "Предложение готово",
      badge: "violet",
      title: "Коммерческое предложение готово",
      intro: "Мы подготовили предложение на основе ваших требований.",
      progress: 3,
      update: "Предложение доступно до оплаты и не обязывает к покупке.",
      action: "Открыть предложение",
      clientAction: "Ознакомьтесь с деталями и напишите, если нужно уточнение.",
    },
    waiting_client_confirmation: {
      label: "Ожидает подтверждения",
      badge: "gold",
      title: "Ожидаем ваше подтверждение",
      intro: "Предложение отправлено. Подтвердите запуск, чтобы мы приступили к работе.",
      progress: 3,
      update: "Предложение ожидает решения клиента.",
      action: "Подтвердить запуск",
      clientAction: "Без подтверждения работа не начнётся.",
    },
    demo_ready: {
      label: "Демо готово",
      badge: "green",
      title: "Демо готово",
      intro: "Демонстрационная версия готова к просмотру перед финальным запуском.",
      progress: 4,
      update: "Проверьте структуру, адаптив, формы и ключевые блоки.",
      action: "Открыть демо",
      clientAction: "Посмотрите демо и отправьте комментарии, если нужны правки.",
    },
    revision_in_progress: {
      label: "Доработка",
      badge: "blue",
      title: "Доработка по вашим комментариям",
      intro: "Мы получили ваши комментарии и работаем над улучшениями.",
      progress: 4,
      update: "Правки по демо внесены в работу.",
      action: "Посмотреть комментарии",
      clientAction: "Можно добавить ещё комментарий, пока доработка не завершена.",
    },
    delayed: {
      label: "Срок обновлён",
      badge: "gold",
      title: "Срок обновлён",
      intro: "Мы немного отстаём от графика, но уже активно работаем над решением.",
      progress: 4,
      update: "Новая дата готовности: 28 мая 2026.",
      action: "Связаться с нами",
      clientAction: "Подскажите приоритеты, если что-то нужно ускорить.",
    },
    ready_to_launch: {
      label: "Готов к запуску",
      badge: "green",
      title: "Готов к запуску",
      intro: "Проект прошёл проверку и готов к финальному запуску.",
      progress: 5,
      update: "Домен, контент, интеграции и безопасность проверены.",
      action: "Подтвердить запуск",
      clientAction: "Подтвердите запуск, чтобы сайт стал доступен посетителям.",
    },
    launched: {
      label: "Запущен",
      badge: "green",
      title: "Проект успешно запущен",
      intro: "Ваш сайт опубликован и доступен для посетителей. Все системы работают корректно.",
      progress: 6,
      update: "Проект запущен, поддержка активна.",
      action: "Перейти на сайт",
      clientAction: "Можно оставить отзыв или запросить развитие проекта.",
    },
    completed: {
      label: "Запущен",
      badge: "green",
      title: "Проект успешно запущен",
      intro: "Проект завершён и передан клиенту.",
      progress: 6,
      update: "Все этапы выполнены.",
      action: "Перейти на сайт",
      clientAction: "Поддержка доступна по запросу.",
    },
  };

  const MOCK_LEADS = [
    {
      id: "WEB00-2026-0001",
      status: "new",
      solution: "Мебельный магазин",
      contact: "demo",
      name: "Демо клиент",
      createdAt: "2026-05-22T10:00:00.000Z",
    },
    {
      id: "WEB00-2026-0002",
      status: "demo_ready",
      solution: "Сайт под ключ",
      contact: "demo",
      name: "Демо клиент",
      createdAt: "2026-05-22T11:00:00.000Z",
    },
  ];

  const BUG_REPORTS = [];

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function nextSeq(key) {
    const current = Number(localStorage.getItem(key) || "0") + 1;
    localStorage.setItem(key, String(current));
    return current;
  }

  function year() {
    return new Date().getFullYear();
  }

  function createLead(data) {
    const seq = nextSeq(STORAGE_KEYS.leadSeq);
    const lead = {
      id: `WEB00-${year()}-${String(seq).padStart(4, "0")}`,
      status: "new",
      createdAt: new Date().toISOString(),
      ...data,
    };
    const leads = readJson(STORAGE_KEYS.leads, []);
    leads.unshift(lead);
    writeJson(STORAGE_KEYS.leads, leads);
    return lead;
  }

  function allLeads() {
    return [...readJson(STORAGE_KEYS.leads, []), ...MOCK_LEADS];
  }

  function getLeadStatus(id) {
    if (!id) return null;
    return allLeads().find((lead) => lead.id.toLowerCase() === String(id).trim().toLowerCase()) || null;
  }

  function updateLeadStatusMock(id, status) {
    const leads = readJson(STORAGE_KEYS.leads, []);
    const index = leads.findIndex((lead) => lead.id === id);
    if (index >= 0) {
      leads[index].status = status;
      leads[index].updatedAt = new Date().toISOString();
      writeJson(STORAGE_KEYS.leads, leads);
      return leads[index];
    }
    return null;
  }

  function createBugReport(data) {
    const seq = nextSeq(STORAGE_KEYS.bugSeq);
    const report = {
      id: `BUG-${year()}-${String(seq).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
      ...data,
    };
    const reports = readJson(STORAGE_KEYS.bugs, []);
    reports.unshift(report);
    writeJson(STORAGE_KEYS.bugs, reports);
    return report;
  }

  window.WEB00_DATA = {
    CONTACTS,
    SOLUTIONS,
    SERVICES,
    PRICING,
    FAQ_ITEMS,
    LEAD_STATUSES,
    MOCK_LEADS,
    BUG_REPORTS,
    createLead,
    getLeadStatus,
    createBugReport,
    updateLeadStatusMock,
    allLeads,
  };
})();
