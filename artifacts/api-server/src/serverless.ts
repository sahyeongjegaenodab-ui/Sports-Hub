import type { IncomingMessage, ServerResponse } from "http";
import app from "./app";

// Vercel's Node.js runtime invokes the default export with the incoming
// request/response objects. An Express application instance is itself a
// (req, res) request listener, so it can be exported directly as the handler.
export default function handler(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  app(req, res);
}
