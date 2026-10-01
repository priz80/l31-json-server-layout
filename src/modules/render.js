const FILTERS = {
  ALL: "all",
  WITH_CHILDREN: "withChildren",
  WITH_PERMISSIONS: "withPermissions",
};

let currentFilter = FILTERS.ALL;
let searchQuery = "";
let userServiceInstance = null;

export const render = (users, userService, hasError = false) => {
  userServiceInstance = userService;
  const tbody = document.getElementById("table-body");
  const errorMessage = document.getElementById("error-message");
  tbody.innerHTML = "";

  if (hasError) {
    errorMessage.style.display = "block";
    return;
  }

  errorMessage.style.display = "none";
  const filteredUsers = filterUsers(users);

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td scope="row">${user.id}</td>
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td>${user.children ? "Есть" : "Нет"}</td>
      <td>
        <div class="form-check form-switch">
          <input
            class="form-check-input permission-toggle"
            type="checkbox"
            role="switch"
            data-id="${user.id}"
            ${user.permissions ? "checked" : ""}
          />
        </div>
      </td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn btn-warning edit-btn"
            data-id="${user.id}"
            title="Редактировать"
          >
            <i class="bi bi-pencil-square"></i>
          </button>
          <button
            type="button"
            class="btn btn-danger delete-btn"
            data-id="${user.id}"
            title="Удалить"
          >
            <i class="bi bi-person-x"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  attachEventListeners();
};

const filterUsers = (users) => {
  let result = users;

  if (currentFilter === FILTERS.WITH_CHILDREN) {
    result = result.filter((u) => u.children);
  } else if (currentFilter === FILTERS.WITH_PERMISSIONS) {
    result = result.filter((u) => u.permissions);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }

  return result;
};

const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

const attachEventListeners = () => {
  const us = userServiceInstance;

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.dataset.id || e.target.parentElement.dataset.id, 10);
      if (confirm("Удалить пользователя?")) {
        try {
          await us.deleteUser(id);
          const users = await us.getUsers();
          render(users, us);
        } catch (error) {
          console.error("Failed to delete user:", error);
          alert("Ошибка при удалении пользователя");
        }
      }
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id || e.target.parentElement.dataset.id, 10);
      editUser(id);
    });
  });

  document.querySelectorAll(".permission-toggle").forEach((toggle) => {
    toggle.addEventListener("change", async (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      try {
        await us.updateUser(id, { permissions: e.target.checked });
        const users = await us.getUsers();
        render(users, us);
      } catch (error) {
        console.error("Failed to update user:", error);
        alert("Ошибка при обновлении доступа");
        e.target.checked = !e.target.checked;
      }
    });
  });

  document.getElementById("btn-isChildren").addEventListener("click", () => {
    currentFilter = FILTERS.WITH_CHILDREN;
    updateFilterButtons(currentFilter);
    refreshTable();
  });

  document.getElementById("btn-isPermissions").addEventListener("click", () => {
    currentFilter = FILTERS.WITH_PERMISSIONS;
    updateFilterButtons(currentFilter);
    refreshTable();
  });

  document.getElementById("btn-isAll").addEventListener("click", () => {
    currentFilter = FILTERS.ALL;
    updateFilterButtons(currentFilter);
    refreshTable();
  });

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    refreshTable();
  });

  const sortButton = document.getElementById("sort-is-children");
  let sortAsc = true;
  sortButton.addEventListener("click", async () => {
    const users = await us.getUsers();
    users.sort((a, b) => {
      return sortAsc ? a.children - b.children : b.children - a.children;
    });
    sortAsc = !sortAsc;
    render(users, us);
  });
};

const updateFilterButtons = (activeFilter) => {
  document.querySelectorAll(".btn-group .btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const btnMap = {
    [FILTERS.ALL]: "btn-isAll",
    [FILTERS.WITH_CHILDREN]: "btn-isChildren",
    [FILTERS.WITH_PERMISSIONS]: "btn-isPermissions",
  };

  const activeBtn = document.getElementById(btnMap[activeFilter]);
  if (activeBtn) activeBtn.classList.add("active");
};

const refreshTable = async () => {
  try {
    const us = userServiceInstance;
    const users = await us.getUsers();
    render(users, us);
  } catch (error) {
    console.error("Failed to refresh table:", error);
    render([], userServiceInstance, true);
  }
};

const editUser = async (id) => {
  const us = userServiceInstance;
  try {
    const users = await us.getUsers();
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const name = prompt("Имя", user.name);
    if (name === null) return;

    const email = prompt("Email", user.email);
    if (email === null) return;

    const children = confirm("Есть ли дети?");

    await us.updateUser(id, { name, email, children });
    const updatedUsers = await us.getUsers();
    render(updatedUsers, us);
  } catch (error) {
    console.error("Failed to edit user:", error);
    alert("Ошибка при редактировании пользователя");
  }
};
