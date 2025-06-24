import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/tickets.tsx"),
  route("/tickets/:id", "routes/ticket.tsx"),
  route("/login", "routes/login.tsx"),
  route("/signup", "routes/signup.tsx"),
  route("/admin", "routes/admin.tsx"),
] satisfies RouteConfig;
