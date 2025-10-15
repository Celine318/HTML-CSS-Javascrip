// ======== 表單邏輯 ========
const form = document.getElementById("contactForm");
const submitResult = document.getElementById("submitResult");

function showError(inputEl, message) {
  const key = inputEl.getAttribute("id");
  const hint = document.querySelector(`small.error[data-for="${key}"]`);
  if (hint) hint.textContent = message || "";
  inputEl.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateField(inputEl) {
  if (inputEl.validity.valid) {
    showError(inputEl, "");
    return true;
  }
  if (inputEl.validity.valueMissing) {
    showError(inputEl, "此欄位為必填");
  } else if (inputEl.validity.typeMismatch) {
    showError(inputEl, "格式不正確，請重新輸入");
  } else if (inputEl.validity.rangeUnderflow || inputEl.validity.rangeOverflow) {
    showError(inputEl, `數值需介於 ${inputEl.min || "?"} ~ ${inputEl.max || "?"}`);
  } else if (inputEl.validity.tooShort) {
    showError(inputEl, `至少需輸入 ${inputEl.minLength} 個字`);
  } else {
    showError(inputEl, "輸入有誤");
  }
  return false;
}

if (form) {
  [...form.elements].forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.addEventListener("blur", () => validateField(el));
      el.addEventListener("input", () => validateField(el));
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const controls = [...form.elements].filter(el => (el.tagName === "INPUT" || el.tagName === "TEXTAREA"));
    const allValid = controls.map(validateField).every(Boolean);
    if (!allValid) return;

    const data = Object.fromEntries(new FormData(form).entries());
    const previewHtml = `
      <ul class="preview">
        <li><strong>姓名：</strong>${escapeHtml(data.name)}</li>
        <li><strong>Email：</strong>${escapeHtml(data.email)}</li>
        <li><strong>年齡：</strong>${escapeHtml(data.age || "—")}</li>
        <li><strong>留言內容：</strong><br>${escapeHtml(data.message).replace(/\n/g, "<br>")}</li>
      </ul>
    `;
    submitResult.innerHTML = previewHtml;
    form.reset();
  });
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ======== 貼文表格 + API (/posts) ========
const POSTS_API = "https://jsonplaceholder.typicode.com/posts";
const postsTable = document.getElementById("postsTable");
const postsTbody = postsTable?.querySelector("tbody");
const statePosts = document.getElementById("statePosts");
const filterPosts = document.getElementById("filterPosts");
const reloadPosts = document.getElementById("reloadPosts");
let rawPosts = [];

async function loadPosts() {
  if (!statePosts) return;
  setState(statePosts, "載入中…");
  try {
    const res = await fetch(`${POSTS_API}?_limit=10`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rawPosts = await res.json();
    renderPosts(rawPosts);
    setState(statePosts, "");
  } catch (err) {
    console.error(err);
    setState(statePosts, "載入失敗，請稍後再試。");
  }
}

function renderPosts(list) {
  if (!postsTbody) return;
  postsTbody.innerHTML = "";
  if (!list.length) {
    postsTbody.innerHTML = `<tr><td colspan="3" class="muted">無符合資料</td></tr>`;
    return;
  }
  const rows = list.map(post => {
    const body = String(post.body).slice(0, 80).replace(/\n/g, " ") + (post.body.length > 80 ? "…" : "");
    return `
      <tr>
        <td>${post.id}</td>
        <td>${escapeHtml(post.title)}</td>
        <td>${escapeHtml(body)}</td>
      </tr>
    `;
  });
  postsTbody.insertAdjacentHTML("beforeend", rows.join(""));
}

filterPosts?.addEventListener("input", () => {
  const q = filterPosts.value.trim().toLowerCase();
  const filtered = rawPosts.filter(p => p.title.toLowerCase().includes(q));
  renderPosts(filtered);
});

reloadPosts?.addEventListener("click", loadPosts);

// ======== 使用者表格 + API (/users) ========
const USERS_API = "https://jsonplaceholder.typicode.com/users";
const usersTable = document.getElementById("usersTable");
const usersTbody = usersTable?.querySelector("tbody");
const stateUsers = document.getElementById("stateUsers");
const filterUsers = document.getElementById("filterUsers");
const reloadUsers = document.getElementById("reloadUsers");
let rawUsers = [];

async function loadUsers() {
  if (!stateUsers) return;
  setState(stateUsers, "載入中…");
  try {
    const res = await fetch(USERS_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rawUsers = await res.json();
    renderUsers(rawUsers);
    setState(stateUsers, "");
  } catch (err) {
    console.error(err);
    setState(stateUsers, "載入失敗，請稍後再試。");
  }
}

function renderUsers(list) {
  if (!usersTbody) return;
  usersTbody.innerHTML = "";
  if (!list.length) {
    usersTbody.innerHTML = `<tr><td colspan="5" class="muted">無符合資料</td></tr>`;
    return;
  }
  const rows = list.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${escapeHtml(u.name)}</td>
      <td>${escapeHtml(u.email)}</td>
      <td>${escapeHtml(u.company?.name || "—")}</td>
      <td>${escapeHtml(u.address?.city || "—")}</td>
    </tr>
  `);
  usersTbody.insertAdjacentHTML("beforeend", rows.join(""));
}

filterUsers?.addEventListener("input", () => {
  const q = filterUsers.value.trim().toLowerCase();
  const filtered = rawUsers.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  );
  renderUsers(filtered);
});

reloadUsers?.addEventListener("click", loadUsers);

// ======== 共用：狀態顯示 ========
function setState(el, text) {
  el.textContent = text;
  el.style.display = text ? "block" : "none";
}

// 初次載入：同時抓 posts 與 users
document.addEventListener("DOMContentLoaded", () => {
  loadPosts();
  loadUsers();
});
