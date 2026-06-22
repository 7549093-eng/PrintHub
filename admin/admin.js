async function api(path, options = {}) {
  let res;
  try {
    const headers = options.body instanceof FormData
      ? { ...(options.headers || {}) }  // let browser set Content-Type with boundary
      : { 'Content-Type': 'application/json', ...(options.headers || {}) };
    res = await fetch(path, {
      credentials: 'same-origin',
      headers,
      ...options,
    });
  } catch (err) {
    throw new Error('后台服务未启动：请双击“启动PrintHub.command”后再登录。');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || '请求失败');
  }
  return data;
}

async function requireAdmin() {
  const data = await api('/api/admin/me');
  if (!data.admin) {
    window.location.href = '/admin/index.html';
    return null;
  }
  return data.admin;
}

async function logoutAdmin() {
  await api('/api/admin/logout', { method: 'POST', body: '{}' });
  window.location.href = '/admin/index.html';
}

function formatPrice(value) {
  const price = Number(value || 0);
  return price <= 0 ? '免费' : `¥${price.toFixed(price % 1 === 0 ? 0 : 2)}`;
}

function statusLabel(status) {
  return status === 'on'
    ? '<span class="admin-table-status status-on">已上架</span>'
    : '<span class="admin-table-status status-off">已下架</span>';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

async function initLoginPage() {
  const form = document.querySelector('[data-login-form]');
  if (!form) return;
  const error = document.querySelector('[data-login-error]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    const payload = {
      username: form.username.value.trim(),
      password: form.password.value,
    };
    try {
      await api('/api/admin/login', { method: 'POST', body: JSON.stringify(payload) });
      window.location.href = '/admin/dashboard.html';
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

async function initModelsPage() {
  const tableBody = document.querySelector('[data-model-list]');
  const count = document.querySelector('[data-model-count]');
  const form = document.querySelector('[data-model-form]');
  const search = document.querySelector('[data-model-search]');
  const statusFilter = document.querySelector('[data-model-status]');
  if (!tableBody) return;
  await requireAdmin();

  async function loadModels() {
    const params = new URLSearchParams();
    if (search?.value.trim()) params.set('q', search.value.trim());
    if (statusFilter?.value) params.set('status', statusFilter.value);
    const data = await api(`/api/admin/models?${params.toString()}`);
    count.textContent = `共 ${data.count} 个模型`;
    tableBody.innerHTML = data.models.map((model) => `
      <tr data-model-id="${model.id}">
        <td>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="admin-table-img">${escapeHtml(model.image || '📦')}</div>
            <span>${escapeHtml(model.title)}</span>
          </div>
        </td>
        <td>${escapeHtml(model.category)}</td>
        <td>${formatPrice(model.price)}</td>
        <td>${escapeHtml(model.file_format)}</td>
        <td>${Number(model.downloads || 0).toLocaleString()}</td>
        <td>
          ${model.file_path
            ? '<span class="admin-table-status status-on" title="' + escapeHtml(model.file_path) + '">已上传</span>'
            : '<button class="admin-table-action primary" type="button" data-upload style="font-size:0.68rem;padding:4px 8px;">上传文件</button>'}
        </td>
        <td>${statusLabel(model.status)}</td>
        <td>${escapeHtml((model.created_at || '').slice(0, 10))}</td>
        <td>
          <button class="admin-table-action outline" type="button" disabled>编辑</button>
          <button class="admin-table-action ${model.status === 'on' ? 'danger' : 'green'}" type="button" data-toggle-status>
            ${model.status === 'on' ? '下架' : '上架'}
          </button>
        </td>
      </tr>
    `).join('');
  }

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.value,
      category: form.category.value,
      price: form.price.value,
      file_format: form.file_format.value,
      image: form.image.value,
    };
    await api('/api/admin/models', { method: 'POST', body: JSON.stringify(payload) });
    form.reset();
    form.image.value = '📦';
    await loadModels();
  });

  tableBody.addEventListener('click', async (event) => {
    // Toggle status
    const statusBtn = event.target.closest('[data-toggle-status]');
    if (statusBtn) {
      const row = statusBtn.closest('tr');
      const id = row.dataset.modelId;
      const next = statusBtn.textContent.trim() === '下架' ? 'off' : 'on';
      await api(`/api/admin/models/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status: next }),
      });
      await loadModels();
      return;
    }
    // Upload file
    const uploadBtn = event.target.closest('[data-upload]');
    if (uploadBtn) {
      const row = uploadBtn.closest('tr');
      const id = row.dataset.modelId;
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.stl,.obj,.3mf,.zip,.step,.stp';
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) {
          alert('文件不能超过100MB');
          return;
        }
        uploadBtn.textContent = '上传中...';
        uploadBtn.disabled = true;
        try {
          const formData = new FormData();
          formData.append('file', file);
          await api(`/api/admin/models/${id}/upload`, {
            method: 'POST',
            body: formData,
          });
          await loadModels();
        } catch (err) {
          alert('上传失败: ' + err.message);
          uploadBtn.textContent = '上传文件';
          uploadBtn.disabled = false;
        }
      };
      input.click();
    }
  });

  search?.addEventListener('input', () => loadModels());
  statusFilter?.addEventListener('change', () => loadModels());
  await loadModels();
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginPage();
  initModelsPage();
  document.querySelector('[data-logout]')?.addEventListener('click', (event) => {
    event.preventDefault();
    logoutAdmin();
  });
});
