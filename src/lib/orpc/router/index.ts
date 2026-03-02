import { createTodo, getTodo } from "./todo";
import * as members from "./members";
import * as tasks from "./tasks";
import * as logs from "./logs";

export default {
  createTodo,
  getTodo,
  ...members,
  ...tasks,
  ...logs,
};
