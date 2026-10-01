import { render } from "./render";

export const addUsers = (userService) => {
  const form = document.querySelector("form");
  const nameInput = form.querySelector("#form-name");
  const emailInput = form.querySelector("#form-email");
  const childrenInput = form.querySelector("#form-children");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      const user = {
        name,
        email,
        children: childrenInput.checked,
        permissions: false,
      };

      await userService.addUser(user);
      form.reset();
      const users = await userService.getUsers();
      render(users, userService);
    } catch (error) {
      console.error("Failed to add user:", error);
      alert("Ошибка при сохранении пользователя");
    }
  });
};
