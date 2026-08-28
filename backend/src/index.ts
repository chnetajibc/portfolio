import type { Env } from "./config.js";
import { handleRequest } from "./router.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
