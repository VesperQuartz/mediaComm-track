import * as logs from "./logs";
import * as members from "./members";
import * as tasks from "./tasks";
import { createTodo, getTodo } from "./todo";

export default {
  createTodo,
  getTodo,
  ...members,
  ...tasks,
  ...logs,
};
