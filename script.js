/* ===================================================
   iTicket.UZ — Enhanced Homepage Script
   - All 40 Events Display
   - Category & Date Range Filter
   - This Week (Shu haftada bo'ladiganlar) Day Filter
   - Image Shrink Card Hover Animation
   - Interactive Favorites Modal with Direct Links
   - Cart Modal with Checkout Link
   =================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* 1. Ensure all 40 events load (sync cache if old 12-item cache is present) */
  let eventList = typeof Events !== "undefined" ? Events : [];
  if (localStorage.getItem("Events")) {
    try {
      const stored = JSON.parse(localStorage.getItem("Events"));
      if (stored && Array.isArray(stored) && stored.length >= Events.length) {
        eventList = stored;
      } else {
        eventList = Events;
        localStorage.setItem("Events", JSON.stringify(Events));
      }
    } catch (e) {
      eventList = Events;
    }
  } else {
    localStorage.setItem("Events", JSON.stringify(Events));
  }

  let heroNumber = 0;
  let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
  const currentLang = typeof getLang === "function" ? getLang() : "uz";

  const eventSections = document.querySelector("#eventSections");
  const featuredEvent = document.querySelector("#featuredEvent");
  const heroPagination = document.querySelector("#heroPagination");

  /* Filter banner events (managed from Admin Panel) */
  let bannerList = eventList.filter(item => item.sections && item.sections.includes("Banner"));
  if (bannerList.length === 0) {
    bannerList = eventList.slice(0, 5);
  }

  function formatDate(value) {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day = d.getDate();
    const monthsUz = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
    const monthsRu = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
    const monthName = currentLang === 'ru' ? monthsRu[d.getMonth()] : monthsUz[d.getMonth()];
    return `${day}-${monthName}`;
  }

  function formatPrice(item) {
    if (!item.narxdan) return typeof t === "function" ? t("free") : "Bepul";
    return item.narxdan.toLocaleString("ru-RU") + " " + item.valyuta;
  }

  /* Make Card matching user hover requirement:
     "cardda faqat rasmi chiqsin olib borganda pastidan hoveri chiqsin rasm kichariyib" */
  function makeCard(item) {
    const liked = favorites.includes(item.id);
    const isSoldOut = item.holat === "sold-out";
    const soldOutText = typeof t === "function" ? t("soldOut") : "Biletlar tugagan";
    const fromText = typeof t === "function" ? t("fromPrice") : "dan";
    const catName = item.category ? item.category.toUpperCase() : "TADBIR";

    return `
      <article class="event-card">
        <a class="event-card-link" href="single.html?id=${item.id}">
          <div class="event-image-wrap">
            <span class="event-top-badge">${catName}</span>
            <img src="${item.rasm}" alt="${item.title}" loading="lazy" onerror="this.src='https://cdn.iticket.uz/event/no-app-poster.png'">
            <button class="favorite-btn ${liked ? "active" : ""}" type="button" data-favorite="${item.id}" title="Sevimlilar">
              ${liked ? "♥" : "♡"}
            </button>
          </div>
          <div class="event-info">
            <div class="event-date">${formatDate(item.sana)}${item.vaqt ? " · " + item.vaqt : ""}</div>
            <h3>${item.title}</h3>
            <p>📍 ${item.joy}</p>
            <strong>${isSoldOut ? ('<span style="color:#ef4444;">' + soldOutText + '</span>') : (fromText + " " + formatPrice(item))}</strong>
            <div class="card-action-btn">${isSoldOut ? (currentLang === 'ru' ? 'Подробнее' : 'Batafsil') : (currentLang === 'ru' ? 'Выбрать место →' : 'Bilet tanlash →')}</div>
          </div>
        </a>
      </article>
    `;
  }

  function showSection(title, list) {
    if (!list || list.length === 0) return "";
    let cards = "";
    list.forEach(item => {
      cards += makeCard(item);
    });

    return `
      <section class="event-section">
        <div class="section-heading">
          <h2>${title} (${list.length})</h2>
        </div>
        <div class="event-grid">${cards}</div>
      </section>
    `;
  }

  /* Display ALL 40 Events cleanly grouped */
  function showHome() {
    const popular = eventList.filter(item => item.sections && item.sections.includes("Popular events"));
    const concerts = eventList.filter(item => item.category === "concerts");
    const culture = eventList.filter(item => item.category === "cultural-events" || item.category === "theater");
    const sport = eventList.filter(item => item.category === "sport");
    const kids = eventList.filter(item => item.category === "kids");
    const other = eventList.filter(item => item.category === "other-events");

    const titlePop = currentLang === 'ru' ? " Популярные события" : " Mashhur tadbirlar";
    const titleCon = currentLang === 'ru' ? "  Концерты" : " Konsertlar";
    const titleCul = currentLang === 'ru' ? " Театр и культура" : " Teatr va Madaniy tadbirlar";
    const titleSpo = currentLang === 'ru' ? " Спортивные события" : " Sport musobaqalari";
    const titleKid = currentLang === 'ru' ? " Детям и семье" : " Bolalar va oila uchun";
    const titleOth = currentLang === 'ru' ? " Другие интересные события" : " Boshqa tadbirlar";

    eventSections.innerHTML =
      showSection(titlePop, popular.length ? popular : eventList.slice(0, 10)) +
      showSection(titleCon, concerts) +
      showSection(titleCul, culture) +
      showSection(titleSpo, sport) +
      showSection(titleKid, kids) +
      showSection(titleOth, other);
  }

  function showCategory(category) {
    const namesUz = {
      concerts: " Konsertlar",
      "cultural-events": " Madaniy tadbirlar",
      sport: " Sport musobaqalari",
      theater: " Teatr spektakllari",
      kids: " Bolalar uchun",
      "other-events": " Boshqa tadbirlar"
    };

    const namesRu = {
      concerts: " Концерты",
      "cultural-events": "Культурные события",
      sport: " Спортивные события",
      theater: " Театр",
      kids: "Детям",
      "other-events": " Другие события"
    };

    const names = currentLang === 'ru' ? namesRu : namesUz;
    const list = eventList.filter(item => item.category === category);
    eventSections.innerHTML = showSection(names[category] || "Tadbirlar", list);

    const filterSec = document.getElementById("filterBar");
    if (filterSec) {
      filterSec.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* Banner rotation */
  function showBanner() {
    if (bannerList.length === 0) return;
    heroNumber = (heroNumber + bannerList.length) % bannerList.length;
    const item = bannerList[heroNumber];
    const buyText = typeof t === "function" ? t("buyTicket") : "Bilet sotib olish";

    featuredEvent.innerHTML = `
      <article class="hero-card">
        <img src="${item.rasm}" alt="${item.title}" onerror="this.src='https://cdn.iticket.uz/event/no-app-poster.png'">
        <div class="hero-copy">
          <span>${formatDate(item.sana)}</span>
          <h1>${item.title}</h1>
          <p>📍 ${item.joy}</p>
          <a href="single.html?id=${item.id}">${buyText} →</a>
        </div>
      </article>
    `;

    let dots = "";
    bannerList.forEach((banner, index) => {
      dots += `<button class="${index === heroNumber ? "active" : ""}" data-banner="${index}"></button>`;
    });
    heroPagination.innerHTML = dots;
  }

  function updateCounts() {
    const favCountEl = document.querySelector("#favoritesCount");
    if (favCountEl) favCountEl.textContent = favorites.length;

    const bookings = JSON.parse(localStorage.getItem("Bookings") || "[]");
    let totalBookedSeats = 0;
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (user) {
      bookings.forEach(b => {
        if (b.userLogin === user.login) {
          totalBookedSeats += (b.seats ? b.seats.length : 0);
        }
      });
    }

    const cartAmountEl = document.querySelector("#cartAmount");
    if (cartAmountEl) cartAmountEl.textContent = totalBookedSeats;

    const floatingCountEl = document.querySelector("#floatingCartCount");
    if (floatingCountEl) floatingCountEl.textContent = totalBookedSeats;
  }

  showBanner();
  showHome();
  updateCounts();

  /* Banner auto timer */
  let bannerTimer = setInterval(() => {
    heroNumber++;
    showBanner();
  }, 5000);

  const prevBtn = document.querySelector(".hero-prev");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      clearInterval(bannerTimer);
      heroNumber--;
      showBanner();
    });
  }

  const nextBtn = document.querySelector(".hero-next");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      clearInterval(bannerTimer);
      heroNumber++;
      showBanner();
    });
  }

  if (heroPagination) {
    heroPagination.addEventListener("click", (e) => {
      if (e.target.dataset.banner) {
        clearInterval(bannerTimer);
        heroNumber = Number(e.target.dataset.banner);
        showBanner();
      }
    });
  }

  /* Navigation category filters */
  document.querySelectorAll("[data-category]").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showCategory(link.dataset.category);
    });
  });

  const eventsViewBtn = document.querySelector("[data-view='events']");
  if (eventsViewBtn) {
    eventsViewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showHome();
    });
  }

  /* Favorite button toggle on cards */
  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-favorite]");
    if (!button) return;

    e.preventDefault();
    e.stopPropagation();

    const id = Number(button.dataset.favorite);
    if (favorites.includes(id)) {
      favorites = favorites.filter(item => item !== id);
      button.classList.remove("active");
      button.textContent = "♡";
    } else {
      favorites.push(id);
      button.classList.add("active");
      button.textContent = "♥";
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    updateCounts();
  });

  /* ================= 2. DATE RANGE & CATEGORY FILTER ================= */
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const resetFilterBtn = document.getElementById("resetFilterBtn");
  const filterCategory = document.getElementById("filterCategory");
  const filterDateFrom = document.getElementById("filterDateFrom");
  const filterDateTo = document.getElementById("filterDateTo");

  if (applyFilterBtn) {
    applyFilterBtn.addEventListener("click", () => {
      const cat = filterCategory.value;
      const dateFrom = filterDateFrom.value;
      const dateTo = filterDateTo.value;

      let filtered = eventList.filter(item => {
        let match = true;
        if (cat !== "all" && item.category !== cat) {
          match = false;
        }
        if (dateFrom && item.sana < dateFrom) {
          match = false;
        }
        if (dateTo && item.sana > dateTo) {
          match = false;
        }
        return match;
      });

      const titleText = currentLang === 'ru' ? "Результаты фильтрации" : "Filtrlangan tadbirlar";
      if (filtered.length === 0) {
        eventSections.innerHTML = `
          <div style="text-align:center; padding:60px 20px; background:#fff; border-radius:16px; margin:40px auto; max-width:1240px; border:1px solid var(--line);">
            <div style="font-size:48px; margin-bottom:12px;"></div>
            <h3 style="font-size:20px; font-weight:800; color:var(--text);">${currentLang === 'ru' ? 'По вашему запросу ничего не найдено' : 'Tanlangan parametrlar bo\'yicha tadbirlar topilmadi'}</h3>
            <p style="color:var(--muted); margin-top:8px;">${currentLang === 'ru' ? 'Попробуйте изменить категорию или диапазон дат' : 'Kategoriya yoki sana oralig\'ini o\'zgartirib qayta urinib ko\'ring'}</p>
          </div>
        `;
      } else {
        eventSections.innerHTML = showSection(titleText, filtered);
      }
      eventSections.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (resetFilterBtn) {
    resetFilterBtn.addEventListener("click", () => {
      filterCategory.value = "all";
      filterDateFrom.value = "";
      filterDateTo.value = "";
      showHome();
    });
  }

  /* ================= 3. THIS WEEK (SHU HAFTADA) DAY SELECTOR ================= */
  const dayPills = document.querySelectorAll(".day-pill");
  dayPills.forEach(pill => {
    pill.addEventListener("click", () => {
      dayPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const dayVal = pill.dataset.day;
      if (dayVal === "all") {
        showHome();
        return;
      }

      const targetDay = Number(dayVal); // 0 = Sun, 1 = Mon, etc.
      const filtered = eventList.filter(item => {
        const d = new Date(item.sana);
        return d.getDay() === targetDay;
      });

      const dayNamesUz = ["Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
      const dayNamesRu = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
      const dayTitle = (currentLang === 'ru' ? dayNamesRu[targetDay] : dayNamesUz[targetDay]) + " kungi tadbirlar";

      eventSections.innerHTML = showSection(dayTitle, filtered);
      eventSections.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ================= 4. FAVORITES MODAL (FIX FOR "yoqimlilar bosilganda kirmayapti") ================= */
  const dialog = document.querySelector("#utilityDialog");
  const dialogContent = document.querySelector("#utilityContent");
  const favoritesButton = document.querySelector("#favoritesButton");

  function renderFavoritesModal() {
    const favEvents = eventList.filter(e => favorites.includes(e.id));
    const titleText = currentLang === 'ru' ? "Избранные события" : "Sevimlilar ro'yxati";
    const emptyText = currentLang === 'ru' ? "У вас пока нет избранных событий. Нажмите на сердечко ♡ на карточке любого события!" : "Hozircha hech qanday tadbirni sevimlilarga qo'shmadingiz. Istalgan tadbirdagi ♡ belgisini bosing!";
    const buyText = currentLang === 'ru' ? "Купить билет →" : "Bilet olish →";
    const removeText = currentLang === 'ru' ? "Удалить" : "O'chirish";

    let content = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; padding-bottom:14px; border-bottom:1px solid var(--line);">
        <h2 style="font-size:22px; font-weight:900; color:var(--text-dark); margin:0;">
          <span style="color:#e23d64;">♥</span> ${titleText} <span style="font-size:13px; background:var(--yellow-light); color:#a37200; padding:3px 10px; border-radius:12px; margin-left:6px; font-weight:800;">${favEvents.length}</span>
        </h2>
      </div>
    `;

    if (favEvents.length === 0) {
      content += `
        <div style="text-align:center; padding:48px 20px;">
          <div style="font-size:52px; color:#cbd5e1; margin-bottom:14px;">♡</div>
          <h4 style="font-size:17px; font-weight:800; color:var(--text-dark); margin-bottom:8px;">${currentLang === 'ru' ? 'Список избранного пуст' : 'Sevimlilar ro\'yxati bo\'sh'}</h4>
          <p style="color:var(--muted); line-height:1.6; max-width:380px; margin:0 auto;">${emptyText}</p>
        </div>
      `;
    } else {
      content += `<div class="fav-items-list">`;
      favEvents.forEach(fe => {
        content += `
          <div class="fav-item-row">
            <img src="${fe.rasm}" alt="${fe.title}" onerror="this.src='https://cdn.iticket.uz/event/no-app-poster.png'">
            <div class="fav-item-info">
              <h4>${fe.title}</h4>
              <p> ${fe.joy} ·  ${fe.sana}</p>
              <strong>${fe.narxdan ? fe.narxdan.toLocaleString("ru-RU") + " UZS" : "Bepul"}</strong>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px; align-items:flex-end;">
              <a href="single.html?id=${fe.id}" class="btn-primary" style="padding:8px 18px; font-size:13px; text-decoration:none; white-space:nowrap; border-radius:10px;">${buyText}</a>
              <button class="remove-fav-btn" data-rem-id="${fe.id}">✕ ${removeText}</button>
            </div>
          </div>
        `;
      });
      content += `</div>`;
    }

    dialogContent.innerHTML = content;
    dialog.showModal();

    /* Event delegation for remove in modal */
    dialogContent.querySelectorAll(".remove-fav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const remId = Number(btn.dataset.remId);
        favorites = favorites.filter(id => id !== remId);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateCounts();
        renderFavoritesModal();
      });
    });
  }

  if (favoritesButton) {
    favoritesButton.addEventListener("click", renderFavoritesModal);
  }

  /* ================= 5. SEARCH MODAL ================= */
  const searchButton = document.querySelector("#searchButton");
  if (searchButton && dialog && dialogContent) {
    searchButton.addEventListener("click", () => {
      const titleSearch = currentLang === 'ru' ? "Поиск событий" : "Tadbirlarni qidirish";
      const phSearch = currentLang === 'ru' ? "Название события или место..." : "Tadbir nomi yoki joylashuv...";

      dialogContent.innerHTML = `
        <h2 style="font-size:22px; font-weight:900; margin-bottom:14px;">🔍 ${titleSearch}</h2>
        <input id="searchInput" class="dialog-input" placeholder="${phSearch}" autofocus style="width:100%; height:48px; padding:0 16px; border:2px solid var(--line); border-radius:12px; font-size:15px; outline:none;">
        <div id="searchResults" style="max-height: 380px; overflow-y: auto; margin-top: 14px; display:flex; flex-direction:column; gap:8px;"></div>
      `;
      dialog.showModal();

      const searchInput = document.querySelector("#searchInput");
      searchInput.addEventListener("input", (e) => {
        const text = e.target.value.toLowerCase().trim();
        if (!text) {
          document.querySelector("#searchResults").innerHTML = "";
          return;
        }

        const result = eventList.filter(item => {
          return (item.title + " " + item.joy + " " + item.category).toLowerCase().includes(text);
        }).slice(0, 15);

        if (result.length === 0) {
          document.querySelector("#searchResults").innerHTML = '<p style="color:var(--muted); padding:16px;">Hech qanday tadbir topilmadi.</p>';
          return;
        }

        document.querySelector("#searchResults").innerHTML = result.map(item => `
          <a href="single.html?id=${item.id}" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#f8fafc; border:1px solid var(--line); border-radius:10px; text-decoration:none; color:var(--text); transition:background 0.2s;">
            <div>
              <strong style="font-size:14px;">${item.title}</strong>
              <br><small style="color:var(--muted);">📍 ${item.joy} ·  ${item.sana}</small>
            </div>
            <span style="color:#b47800; font-weight:800; font-size:14px; white-space:nowrap;">${formatPrice(item)}</span>
          </a>
        `).join("");
      });
    });
  }

  const dialogClose = document.querySelector("#dialogClose");
  if (dialogClose && dialog) {
    dialogClose.addEventListener("click", () => {
      dialog.close();
    });
  }

  /* ================= 6. CART MODAL WITH CHECKOUT REDIRECT ================= */
  const cartButton = document.querySelector("#cartButton");
  const floatingCartBtn = document.querySelector("#floatingCartBtn");

  function showCartModal() {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
    if (!user) {
      alert("Savatingizni ko'rish uchun avval tizimga kiring!");
      window.location.href = "signIN.html?redirect=index.html";
      return;
    }

    const bookings = JSON.parse(localStorage.getItem("Bookings") || "[]");
    const userBookings = bookings.filter(b => b.userLogin === user.login);

    const titleText = currentLang === 'ru' ? "Мои бронирования / Корзина" : "Mening bronlarim / Savat";
    const emptyText = currentLang === 'ru' ? "У вас пока нет забронированных билетов." : "Hozircha hech qanday bilet bron qilmagansiz.";
    const checkoutBtnText = currentLang === 'ru' ? "Перейти к оплате (Checkout) →" : " To'lovga o'tish (Checkout) →";

    let content = `<h2 style="font-size:22px; font-weight:900; margin-bottom:16px;"> ${titleText}</h2>`;

    if (userBookings.length === 0) {
      content += `<p style="color:var(--muted); margin-top:14px; line-height:1.6;">${emptyText}</p>`;
    } else {
      content += `<div style="margin-top:16px; display:flex; flex-direction:column; gap:12px; max-height:380px; overflow-y:auto;">`;
      let grandTotal = 0;

      userBookings.forEach((b, index) => {
        const ev = eventList.find(e => e.id === b.eventId) || eventList[0];
        const pricePer = ev ? (ev.narxdan || 80000) : 80000;
        const total = pricePer * (b.seats ? b.seats.length : 1);
        grandTotal += total;

        content += `
          <div style="padding:14px; border:1px solid var(--line); border-radius:12px; background:#fdfaf0;">
            <h4 style="margin-bottom:6px; font-size:15px; color:var(--text); font-weight:800;">${index + 1}. ${ev ? ev.title : "Tadbir #" + b.eventId}</h4>
            <p style="color:var(--muted); font-size:12px; margin-bottom:4px;">📍 ${ev ? ev.joy : ""} ·  ${ev ? ev.sana : ""}</p>
            <p style="color:#b47800; font-weight:800; font-size:13px;">Joylar: ${b.seats.join(", ")} (${b.seats.length} ta joy)</p>
            <p style="font-weight:900; font-size:14px; margin-top:4px;">Summa: ${total.toLocaleString("ru-RU")} UZS</p>
          </div>
        `;
      });
      content += `</div>`;
      content += `
        <div style="margin-top:20px; padding-top:16px; border-top:2px dashed var(--line);">
          <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:900; margin-bottom:16px;">
            <span>Jami summa:</span>
            <span style="color:#b47800;">${grandTotal.toLocaleString("ru-RU")} UZS</span>
          </div>
          <a href="checkout.html" class="btn-primary" style="display:block; text-align:center; text-decoration:none; padding:14px; font-size:16px;">
            ${checkoutBtnText}
          </a>
        </div>
      `;
    }
    dialogContent.innerHTML = content;
    dialog.showModal();
  }

  if (cartButton) cartButton.addEventListener("click", showCartModal);
  if (floatingCartBtn) floatingCartBtn.addEventListener("click", showCartModal);

  /* Mobile menu */
  const menuButton = document.querySelector("#mobileMenuToggle");
  const mobileMenu = document.querySelector("#mobileNav");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.hidden = !mobileMenu.hidden;
    });
  }
});
