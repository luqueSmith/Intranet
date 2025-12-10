// app.js
document.addEventListener('DOMContentLoaded', () => {
  // ---------- UTILIDADES ----------
  function saveJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  // Declaramos documents aquí para usarlo en todo el archivo
  let documents = [];

  // ---------- FECHA DASHBOARD ----------
  const dateSpan = document.getElementById('dashboard-date');
  if (dateSpan) {
    const now = new Date();
    dateSpan.textContent = now.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // ---------- NAVEGACIÓN ENTRE VISTAS ----------
  const viewSections = document.querySelectorAll('[data-view]');
  const sidebarButtons = document.querySelectorAll('[data-view-target]');
  const mobileOverlay = document.getElementById('mobile-overlay');
  const sidebar = document.getElementById('sidebar');
  const openSidebarBtn = document.getElementById('open-sidebar-btn');

  function showView(viewName) {
    viewSections.forEach(sec => {
      if (sec.getAttribute('data-view') === viewName) {
        sec.classList.remove('hidden');
      } else {
        sec.classList.add('hidden');
      }
    });

    sidebarButtons.forEach(btn => {
      if (btn.getAttribute('data-view-target') === viewName) {
        btn.classList.add('sidebar-btn-active');
      } else {
        btn.classList.remove('sidebar-btn-active');
      }
    });

    if (window.innerWidth < 768) {
      closeSidebar();
    }
  }

  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewName = btn.getAttribute('data-view-target');
      if (viewName) showView(viewName);
    });
  });

  function openSidebar() {
    if (!sidebar || !mobileOverlay) return;
    sidebar.classList.remove('-translate-x-full');
    mobileOverlay.classList.remove('pointer-events-none');
    mobileOverlay.classList.remove('opacity-0');
    mobileOverlay.classList.add('opacity-100');
  }

  function closeSidebar() {
    if (!sidebar || !mobileOverlay) return;
    sidebar.classList.add('-translate-x-full');
    mobileOverlay.classList.add('pointer-events-none');
    mobileOverlay.classList.remove('opacity-100');
    mobileOverlay.classList.add('opacity-0');
  }

  if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeSidebar);

  // Vista por defecto
  showView('dashboard');

  // ---------- ESTADÍSTICAS ----------
  const statComunicados = document.getElementById('stat-comunicados');
  const statDocs = document.getElementById('stat-docs');
  const statChat = document.getElementById('stat-chat');

  function updateStats({ annCount, docCount, chatCount }) {
    if (statComunicados) statComunicados.textContent = annCount.toString();
    if (statDocs) statDocs.textContent = docCount.toString();
    if (statChat) statChat.textContent = chatCount.toString();
  }

  // ---------- COMUNICADOS ----------
  const ANN_KEY = 'intranet_announcements_v1';
  let announcements = loadJSON(ANN_KEY, []);

  const announcementFormWrapper = document.getElementById('announcement-form');
  const openAnnouncementFormBtn = document.getElementById('open-announcement-form');
  const cancelAnnouncementBtn = document.getElementById('cancel-announcement');
  const announcementFormElement = document.getElementById('announcement-form-element');
  const annTitleInput = document.getElementById('announcement-title');
  const annContentInput = document.getElementById('announcement-content');
  const announcementList = document.getElementById('announcement-list');

  function renderAnnouncements() {
    if (!announcementList) return;
    announcementList.innerHTML = '';

    if (!announcements.length) {
      const empty = document.createElement('div');
      empty.className =
        'text-center py-8 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 empty-ann';
      empty.textContent = 'No hay comunicados activos.';
      announcementList.appendChild(empty);
      return;
    }

    announcements
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(ann => {
        const wrapper = document.createElement('div');
        wrapper.className =
          'bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors';
        wrapper.dataset.id = ann.id;

        const createdDate = new Date(ann.createdAt);
        const dateString = createdDate.toLocaleDateString('es-PE');

        wrapper.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3">
              <span class="px-2 py-1 text-xs font-semibold rounded-full border bg-yellow-50 text-yellow-600 border-yellow-200">Media</span>
              <span class="text-slate-400 text-xs flex items-center gap-1">
                <span class="material-symbols-outlined text-xs">schedule</span>
                ${dateString}
              </span>
            </div>
            <button class="text-slate-400 hover:text-red-500 transition-colors text-sm delete-ann">
              <span class="material-symbols-outlined text-base">delete</span>
            </button>
          </div>
          <h3 class="text-base font-bold text-slate-800 mb-2">${ann.title}</h3>
          <p class="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">${ann.content}</p>
          <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span class="font-medium text-slate-500 uppercase tracking-wide">Autor: ${
              ann.author || 'Smith Luque'
            }</span>
            <span class="text-indigo-500 font-medium cursor-pointer hover:underline">Leer más</span>
          </div>
        `;

        const deleteBtn = wrapper.querySelector('.delete-ann');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            announcements = announcements.filter(a => a.id !== ann.id);
            saveJSON(ANN_KEY, announcements);
            renderAnnouncements();
            updateStats({
              annCount: announcements.length,
              docCount: documents.length,
              chatCount: currentChatCount
            });
          });
        }

        announcementList.appendChild(wrapper);
      });
  }

  if (openAnnouncementFormBtn && announcementFormWrapper) {
    openAnnouncementFormBtn.addEventListener('click', () => {
      announcementFormWrapper.classList.remove('hidden');
      if (annTitleInput) annTitleInput.focus();
    });
  }

  if (cancelAnnouncementBtn && announcementFormWrapper) {
    cancelAnnouncementBtn.addEventListener('click', () => {
      announcementFormWrapper.classList.add('hidden');
    });
  }

  if (announcementFormElement) {
    announcementFormElement.addEventListener('submit', e => {
      e.preventDefault();
      if (!annTitleInput || !annContentInput) return;
      const title = annTitleInput.value.trim();
      const content = annContentInput.value.trim();
      if (!title || !content) return;

      const newAnn = {
        id: Date.now().toString(),
        title,
        content,
        createdAt: Date.now(),
        author: 'Smith Luque'
      };

      announcements.push(newAnn);
      saveJSON(ANN_KEY, announcements);
      annTitleInput.value = '';
      annContentInput.value = '';
      if (announcementFormWrapper) announcementFormWrapper.classList.add('hidden');

      renderAnnouncements();
      updateStats({
        annCount: announcements.length,
        docCount: documents.length,
        chatCount: currentChatCount
      });
    });
  }

  // ---------- CHAT EFÍMERO (CON localStorage) ----------
  const CHAT_KEY = 'intranet_chat_v1';
  let chatHistory = loadJSON(CHAT_KEY, []); // [{id, text, sender}]
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');
  const TEN_MINUTES = 10 * 60 * 1000;
  let currentChatCount = 0;

  function saveChatHistory() {
    saveJSON(CHAT_KEY, chatHistory);
  }

  // ✅ FUNCIÓN DE BURBUJA DE CHAT CON BOTÓN ELIMINAR
  function createChatBubble(msg, options = {}) {
    if (!chatMessages) return;

    // Si había placeholder, lo quitamos
    if (
      chatMessages.children.length &&
      chatMessages.children[0].dataset &&
      chatMessages.children[0].dataset.placeholder === '1'
    ) {
      chatMessages.innerHTML = '';
    }

    const wrapper = document.createElement('div');
    wrapper.className =
      msg.sender === 'Smith Luque' ? 'flex justify-end' : 'flex justify-start';
    wrapper.dataset.id = msg.id;

    const bubble = document.createElement('div');
    bubble.className =
      'max-w-[85%] md:max-w-[70%] p-3 md:p-4 rounded-2xl text-sm shadow-md';
    if (msg.sender === 'Smith Luque') {
      bubble.classList.add('bg-indigo-600', 'text-white', 'rounded-tr-none');
    } else {
      bubble.classList.add(
        'bg-white',
        'text-slate-800',
        'border',
        'border-slate-200',
        'rounded-tl-none'
      );
    }

    const header = document.createElement('div');
    header.className =
      'flex justify-between items-center gap-4 mb-1 text-[10px]';

    const senderSpan = document.createElement('span');
    senderSpan.className =
      msg.sender === 'Smith Luque'
        ? 'font-bold text-indigo-200'
        : 'font-bold text-slate-500';
    senderSpan.textContent = msg.sender;

    const timerSpan = document.createElement('span');
    timerSpan.className =
      (msg.sender === 'Smith Luque'
        ? 'flex items-center gap-1 text-indigo-200'
        : 'flex items-center gap-1 text-red-400') +
      ' cursor-pointer select-none';
    timerSpan.title = 'Eliminar este mensaje';

    timerSpan.innerHTML =
      '<span class="material-symbols-outlined" style="font-size:12px">delete</span>' +
      '<span class="time-left"></span>';

    header.appendChild(senderSpan);
    header.appendChild(timerSpan);

    const textP = document.createElement('p');
    textP.className = 'leading-relaxed';
    textP.textContent = msg.text;

    bubble.appendChild(header);
    bubble.appendChild(textP);
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    currentChatCount += 1;
    updateStats({
      annCount: announcements.length,
      docCount: documents.length,
      chatCount: currentChatCount
    });

    const created = Date.now();
    const timeSpan = timerSpan.querySelector('.time-left');
    let interval;

    function actualizarContador() {
      const diff = Date.now() - created;
      const remaining = TEN_MINUTES - diff;
      if (!timeSpan) return false;

      if (remaining <= 0) {
        timeSpan.textContent = '0:00';
        return false;
      }
      const m = Math.floor(remaining / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      timeSpan.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
      return true;
    }

    function eliminarMensajeAhora() {
      // quitar del DOM
      wrapper.remove();
      // eliminar del historial
      chatHistory = chatHistory.filter(m => m.id !== msg.id);
      saveChatHistory();
      // stats
      currentChatCount = Math.max(0, currentChatCount - 1);
      updateStats({
        annCount: announcements.length,
        docCount: documents.length,
        chatCount: currentChatCount
      });
      // detener el intervalo
      if (interval) clearInterval(interval);
    }

    // CLICK EN EL ICONO / CONTADOR => borrar ya
    timerSpan.addEventListener('click', eliminarMensajeAhora);

    // Iniciar contador visual
    actualizarContador();
    interval = setInterval(() => {
      const sigue = actualizarContador();
      if (!sigue) {
        eliminarMensajeAhora();
      }
    }, 1000);

    // Autodestruir a los 10 minutos por si acaso
    setTimeout(() => {
      eliminarMensajeAhora();
    }, TEN_MINUTES);
  }

  function addChatMessage(text, sender = 'Smith Luque') {
    const msg = {
      id: Date.now().toString() + Math.random().toString(16).slice(2),
      text,
      sender
    };
    chatHistory.push(msg);
    saveChatHistory();
    createChatBubble(msg);
  }

  function renderChatFromStorage() {
    if (!chatMessages) return;
    if (!chatHistory.length) {
      currentChatCount = 0;
      updateStats({
        annCount: announcements.length,
        docCount: documents.length,
        chatCount: currentChatCount
      });
      return;
    }

    if (
      chatMessages.children.length &&
      chatMessages.children[0].dataset &&
      chatMessages.children[0].dataset.placeholder === '1'
    ) {
      chatMessages.innerHTML = '';
    }

    currentChatCount = 0;
    chatHistory.forEach(msg => {
      createChatBubble(msg, { fromRestore: true });
    });
  }

  // pintar mensajes guardados al cargar
  renderChatFromStorage();

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', e => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      addChatMessage(text);
      chatInput.value = '';
      chatInput.focus();
    });
  }

  // ---------- ENLACES: BUSCADOR ----------
  const linksSearch = document.getElementById('links-search');
  const linksCards = document.querySelectorAll('[data-link-card]');

  if (linksSearch) {
    linksSearch.addEventListener('input', () => {
      const term = linksSearch.value.toLowerCase();
      linksCards.forEach(card => {
        const el = card;
        const title = el.getAttribute('data-title')?.toLowerCase() || '';
        const desc = el.getAttribute('data-desc')?.toLowerCase() || '';
        if (title.includes(term) || desc.includes(term)) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      });
    });
  }

  // ---------- DOCUMENTOS ----------
  const DOC_KEY = 'intranet_documents_v1';
  // aquí solo asignamos, ya declaramos "documents" arriba
  documents = loadJSON(DOC_KEY, []);

  const docUploadInput = document.getElementById('doc-upload-input');
  const docTableBody = document.getElementById('doc-table-body');
  const docEmpty = document.getElementById('doc-empty');

  function formatSize(bytes) {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }

  function renderDocuments() {
    if (!docTableBody || !docEmpty) return;
    docTableBody.innerHTML = '';

    if (!documents.length) {
      docEmpty.classList.remove('hidden');
      return;
    }

    docEmpty.classList.add('hidden');

    documents
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach(doc => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50';
        tr.dataset.id = doc.id;

        tr.innerHTML = `
          <td class="p-3">
            <div class="flex items-center gap-2">
              <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <span class="material-symbols-outlined text-base">description</span>
              </div>
              <span class="font-medium text-slate-700 truncate max-w-[150px] md:max-w-xs" title="${doc.name}">${doc.name}</span>
            </div>
          </td>
          <td class="p-3 text-xs text-slate-500 hidden md:table-cell">${doc.type || '—'}</td>
          <td class="p-3 text-xs text-slate-500 hidden md:table-cell">${formatSize(doc.size)}</td>
          <td class="p-3 text-xs text-slate-500">${doc.dateString}</td>
          <td class="p-3 text-xs text-right">
            <button class="text-red-500 hover:text-red-600 inline-flex items-center gap-1 delete-doc">
              <span class="material-symbols-outlined text-base">delete</span>
              Eliminar
            </button>
          </td>
        `;

        const deleteBtn = tr.querySelector('.delete-doc');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            documents = documents.filter(d => d.id !== doc.id);
            saveJSON(DOC_KEY, documents);
            renderDocuments();
            updateStats({
              annCount: announcements.length,
              docCount: documents.length,
              chatCount: currentChatCount
            });
          });
        }

        docTableBody.appendChild(tr);
      });
  }

  if (docUploadInput) {
    docUploadInput.addEventListener('change', e => {
      const input = e.target;
      if (!input.files || !input.files[0]) return;
      const file = input.files[0];

      const now = new Date();
      const dateString = now.toISOString().split('T')[0];

      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        dateString,
        createdAt: Date.now()
      };

      documents.push(newDoc);
      saveJSON(DOC_KEY, documents);
      input.value = '';
      renderDocuments();
      updateStats({
        annCount: announcements.length,
        docCount: documents.length,
        chatCount: currentChatCount
      });
    });
  }

  // ---------- CONFIGURACIÓN: TABS ----------
  const settingsTabs = document.querySelectorAll('[data-settings-tab]');
  const settingsContents = document.querySelectorAll('[data-settings-content]');

  settingsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-settings-tab');
      settingsTabs.forEach(t => t.classList.remove('settings-tab-active'));
      tab.classList.add('settings-tab-active');
      settingsContents.forEach(content => {
        if (content.getAttribute('data-settings-content') === target) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });

  // ---------- RENDER INICIAL ----------
  renderAnnouncements();
  renderDocuments();
  updateStats({
    annCount: announcements.length,
    docCount: documents.length,
    chatCount: currentChatCount
  });

  // ---------- SERVICE WORKER ----------
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // no pasa nada si falla
    });
  }
});
