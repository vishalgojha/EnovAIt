import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const distDir = join(process.cwd(), "dist");
const port = Number(process.env.PORT || 3000);

const contentTypeByExt = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2"
};

const sendFile = (res, path) => {
  const ext = extname(path);
  res.statusCode = 200;
  res.setHeader("Content-Type", contentTypeByExt[ext] || "application/octet-stream");
  createReadStream(path).pipe(res);
};

const server = createServer(async (req, res) => {
  const requestPath = req.url?.split("?")[0] || "/";
  const normalized = normalize(requestPath).replace(/^(\.\.[\\/])+/, "");
  const candidate = join(distDir, normalized === "/" ? "index.html" : normalized);

  try {
    if (existsSync(candidate)) {
      const stats = await stat(candidate);
      if (stats.isFile()) {
        sendFile(res, candidate);
        return;
      }
    }
  } catch {
    // fall through to SPA index
  }

  const fallback = join(distDir, "index.html");
  if (existsSync(fallback)) {
    sendFile(res, fallback);
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(port, "0.0.0.0", () => {
  console.log(`EnovAIt UI started on port ${port}`);
});
