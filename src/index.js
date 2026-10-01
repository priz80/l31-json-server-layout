import "../scss/main.scss";
import { render } from "./modules/render";
import { UserService } from "./modules/userService";
import { addUsers } from "./modules/addUsers";

const userService = new UserService();

async function init() {
  try {
    const users = await userService.getUsers();
    render(users, userService);
  } catch (error) {
    console.error("Failed to initialize:", error);
    render([], userService, true);
  }
}

addUsers(userService);
init();
