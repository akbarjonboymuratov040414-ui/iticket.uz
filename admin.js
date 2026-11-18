/* ===================================================
   iTicket.UZ — Admin Panel Management Script
   - Shows ALL 40 Events
   - Search & Category Filter
   - Status Filter & Quick Toggles (Banner, Sold-Out)
   - Add / Edit / Delete Modal
   - Reset to default 40 events button
   =================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* 1. Admin Authentication Check */
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    alert("Kechirasiz! Ushbu sahifaga faqat Administrator kira oladi.");
    window.location.href = "signIN.html?redirect=adminPanel.html";
    return;
  }

  const adminBadge = document.getElementById("adminUserBadge");
  if (adminBadge) {
    adminBadge.textContent = "🛠 Admin: " + currentUser.username;
  }

  /* 2. Load Events (Ensure all 40 events load without 12-item cache bug) */
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

  const tableBody = document.getElementById("eventsTableBody");
  const modal = document.getElementById("eventModal");
  const modalTitle = document.getElementById("modalTitle");
  const eventForm = document.getElementById("eventForm");
  const editIdInput = document.getElementById("editEventId");

  const openAddBtn = document.getElementById("openAddModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelModalBtn");
  const resetToDefaultBtn = document.getElementById("resetToDefaultBtn");

  /* Filters */
  const searchInput = document.getElementById("adminSearchInput");
  const categoryFilter = document.getElementById("adminCategoryFilter");
  const statusFilter = document.getElementById("adminStatusFilter");

  /* Stats elements */
  const statTotal = document.getElementById("statTotal");
  const statBanner = document.getElementById("statBanner");
  const statAvailable = document.getElementById("statAvailable");
  const statSoldOut = document.getElementById("statSoldOut");

  function saveEvents() {
    localStorage.setItem("Events", JSON.stringify(eventList));
    Events = eventList;
  }

  function updateStats() {
    statTotal.textContent = eventList.length;
    statBanner.textContent = eventList.filter(e => e.sections && e.sections.includes("Banner")).length;
    statAvailable.textContent = eventList.filter(e => e.holat !== "sold-out").length;
    statSoldOut.textContent = eventList.filter(e => e.holat === "sold-out").length;
  }

  function renderTable() {
    tableBody.innerHTML = "";
    updateStats();

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const cat = categoryFilter ? categoryFilter.value : "all";
    const status = statusFilter ? statusFilter.value : "all";

    const displayList = eventList.filter(ev => {
      let match = true;
      if (query && !((ev.title + " " + ev.joy).toLowerCase().includes(query))) {
        match = false;
      }
      if (cat !== "all" && ev.category !== cat) {
        match = false;
      }
      if (status === "available" && ev.holat === "sold-out") {
        match = false;
      }
      if (status === "sold-out" && ev.holat !== "sold-out") {
        match = false;
      }
      if (status === "banner" && !(ev.sections && ev.sections.includes("Banner"))) {
        match = false;
      }
      return match;
    });

    if (displayList.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:var(--muted);">Hech qanday tadbir topilmadi.</td></tr>';
      return;
    }

    displayList.forEach((ev) => {
      const isBanner = ev.sections && ev.sections.includes("Banner");
      const isSoldOut = ev.holat === "sold-out";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><img src="${ev.rasm}" alt="${ev.title}" class="admin-thumb" onerror="this.src='https://cdn.iticket.uz/event/no-app-poster.png'"></td>
        <td>
          <a href="single.html?id=${ev.id}" target="_blank" style="font-weight:700; color:var(--text); text-decoration:none;">${ev.title}</a>
          <br><small style="color:var(--muted);">ID: #${ev.id}</small>
        </td>
        <td><span style="font-size:12px; font-weight:600; text-transform:uppercase;">${ev.category}</span></td>
        <td>
          <strong>${ev.joy}</strong>
          <br><small style="color:#b47800; font-weight:700;">Zal: ${ev.zal || "palace"}</small>
        </td>
        <td>${ev.sana}${ev.vaqt ? " · " + ev.vaqt : ""}</td>
        <td><strong>${ev.narxdan ? ev.narxdan.toLocaleString("ru-RU") + " UZS" : "Bepul"}</strong></td>
        <td>
          <span class="badge-status ${isSoldOut ? 'sold-out' : 'available'}">
            ${isSoldOut ? 'Tugagan' : 'Mavjud'}
          </span>
        </td>
        <td>
          ${isBanner ? '<span class="badge-banner">★ Karuselda</span>' : '<span style="color:var(--muted); font-size:12px;">Yo\'q</span>'}
        </td>
        <td>
          <div class="action-btns">
            <button class="btn-sm btn-toggle-sold" title="Holatni almashtirish" data-action="toggle-sold" data-id="${ev.id}">
              ${isSoldOut ? ' Ochish' : ' Tugatish'}
            </button>
            <button class="btn-sm btn-toggle-banner" title="Karuselga chiqarish / olib tashlash" data-action="toggle-banner" data-id="${ev.id}">
              ${isBanner ? '✕ Karusel' : '★ Karusel'}
            </button>
            <button class="btn-sm btn-edit" title="Tahrirlash" data-action="edit" data-id="${ev.id}">
              ✎ Tahrirlash
            </button>
            <button class="btn-sm btn-delete" title="O'chirish" data-action="delete" data-id="${ev.id}">
              🗑
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  /* Filter listeners */
  if (searchInput) searchInput.addEventListener("input", renderTable);
  if (categoryFilter) categoryFilter.addEventListener("change", renderTable);
  if (statusFilter) statusFilter.addEventListener("change", renderTable);

  /* Reset to Default 40 Events */
  if (resetToDefaultBtn) {
    resetToDefaultBtn.addEventListener("click", () => {
      if (confirm("Haqiqatan ham barcha 40 ta standart konsertlarni qayta tiklamoqchimisiz?")) {
        localStorage.removeItem("Events");
        eventList = typeof Events !== "undefined" ? Events : [];
        saveEvents();
        if (searchInput) searchInput.value = "";
        if (categoryFilter) categoryFilter.value = "all";
        if (statusFilter) statusFilter.value = "all";
        renderTable();
        alert("Barcha 40 ta standart tadbirlar muvaffaqiyatli tiklandi!");
      }
    });
  }

  /* 3. Actions Handler (Event delegation) */
  tableBody.addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = Number(btn.dataset.id);
    const targetEvent = eventList.find(item => item.id === id);
    if (!targetEvent) return;

    if (action === "toggle-sold") {
      targetEvent.holat = targetEvent.holat === "sold-out" ? "available" : "sold-out";
      saveEvents();
      renderTable();
    } else if (action === "toggle-banner") {
      if (!targetEvent.sections) targetEvent.sections = [];
      const idx = targetEvent.sections.indexOf("Banner");
      if (idx !== -1) {
        targetEvent.sections.splice(idx, 1);
      } else {
        targetEvent.sections.push("Banner");
      }
      saveEvents();
      renderTable();
    } else if (action === "edit") {
      openEditModal(targetEvent);
    } else if (action === "delete") {
      if (confirm(`Haqiqatan ham "${targetEvent.title}" tadbirini o'chirmoqchimisiz?`)) {
        eventList = eventList.filter(item => item.id !== id);
        saveEvents();
        renderTable();
      }
    }
  });

  /* 4. Modal Open & Close */
  function openAddModal() {
    eventForm.reset();
    editIdInput.value = "";
    modalTitle.textContent = "Yangi tadbir qo'shish";
    document.getElementById("eventBanner").checked = false;
    document.getElementById("eventHolat").value = "available";
    modal.classList.add("active");
  }

  function openEditModal(item) {
    editIdInput.value = item.id;
    modalTitle.textContent = "Tadbirni tahrirlash: " + item.title;
    document.getElementById("eventTitle").value = item.title;
    document.getElementById("eventCategory").value = item.category || "concerts";
    document.getElementById("eventJoy").value = item.joy;
    document.getElementById("eventZal").value = item.zal || "palace";
    document.getElementById("eventSana").value = item.sana;
    document.getElementById("eventVaqt").value = item.vaqt || "";
    document.getElementById("eventNarx").value = item.narxdan || "";
    document.getElementById("eventYosh").value = item.yoshChegarasi || "";
    document.getElementById("eventRasm").value = item.rasm;
    document.getElementById("eventHolat").value = item.holat || "available";
    document.getElementById("eventBanner").checked = Boolean(item.sections && item.sections.includes("Banner"));
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  if (openAddBtn) openAddBtn.addEventListener("click", openAddModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeModal();
  });

  /* 5. Form Submit (Add / Edit) */
  eventForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const title = document.getElementById("eventTitle").value.trim();
    const category = document.getElementById("eventCategory").value;
    const joy = document.getElementById("eventJoy").value.trim();
    const zal = document.getElementById("eventZal").value;
    const sana = document.getElementById("eventSana").value;
    const vaqt = document.getElementById("eventVaqt").value.trim();
    const narxdan = Number(document.getElementById("eventNarx").value) || 0;
    const yoshChegarasi = document.getElementById("eventYosh").value.trim();
    const rasm = document.getElementById("eventRasm").value.trim();
    const holat = document.getElementById("eventHolat").value;
    const isBanner = document.getElementById("eventBanner").checked;

    const editId = editIdInput.value ? Number(editIdInput.value) : null;

    if (editId) {
      /* Update existing event */
      const existing = eventList.find(item => item.id === editId);
      if (existing) {
        existing.title = title;
        existing.category = category;
        existing.joy = joy;
        existing.zal = zal;
        existing.sana = sana;
        existing.vaqt = vaqt;
        existing.narxdan = narxdan;
        existing.yoshChegarasi = yoshChegarasi;
        existing.rasm = rasm;
        existing.holat = holat;

        if (!existing.sections) existing.sections = [];
        const bIdx = existing.sections.indexOf("Banner");
        if (isBanner && bIdx === -1) existing.sections.push("Banner");
        if (!isBanner && bIdx !== -1) existing.sections.splice(bIdx, 1);
      }
    } else {
      /* Create new event */
      const nextId = eventList.reduce((max, item) => Math.max(max, item.id || 0), 0) + 1;
      const sections = ["Popular events"];
      if (isBanner) sections.push("Banner");

      const newEvent = {
        id: nextId,
        title: title,
        category: category,
        sections: sections,
        sana: sana,
        vaqt: vaqt,
        joy: joy,
        narxdan: narxdan,
        narxgacha: narxdan * 3,
        valyuta: "UZS",
        holat: holat,
        yoshChegarasi: yoshChegarasi,
        til: "O'zbekcha / Русский",
        rasm: rasm,
        havola: "single.html?id=" + nextId,
        zal: zal
      };
      eventList.unshift(newEvent);
    }

    saveEvents();
    renderTable();
    closeModal();
    alert("O'zgarishlar muvaffaqiyatli saqlandi va barcha sahifalarda aks etdi!");
  });

  renderTable();
});
