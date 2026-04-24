const { mkdirSync, writeFileSync, chmodSync, existsSync } = require("node:fs");
const { join } = require("node:path");

function main() {
  const binDir = join(process.cwd(), "node_modules", ".bin");
  const target = join(process.cwd(), "scripts", "coolify.mjs");

  if (!existsSync(target)) {
    return;
  }

  mkdirSync(binDir, { recursive: true });

  const cmdPath = join(binDir, "coolify.cmd");
  const ps1Path = join(binDir, "coolify.ps1");
  const shPath = join(binDir, "coolify");

  writeFileSync(
    cmdPath,
    [
      "@ECHO off",
      'SETLOCAL',
      'SET "NODE_EXE=node"',
      '"%NODE_EXE%" "%~dp0\\..\\..\\scripts\\coolify.mjs" %*',
      "",
    ].join("\r\n")
  );

  writeFileSync(
    ps1Path,
    [
      '#!/usr/bin/env pwsh',
      `node "$PSScriptRoot\\..\\..\\scripts\\coolify.mjs" $args`,
      "",
    ].join("\n")
  );

  writeFileSync(
    shPath,
    [
      "#!/usr/bin/env sh",
      'node "$(dirname "$0")/../../scripts/coolify.mjs" "$@"',
      "",
    ].join("\n")
  );

  try {
    chmodSync(shPath, 0o755);
  } catch {
    // Best effort on non-POSIX systems.
  }
}

main();
