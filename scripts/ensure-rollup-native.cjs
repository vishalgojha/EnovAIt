const {execFileSync} = require('node:child_process');

function detectLibc() {
  if (process.platform !== 'linux') {
    return null;
  }

  const report = process.report && typeof process.report.getReport === 'function'
    ? process.report.getReport()
    : null;

  return report && report.header && report.header.glibcVersionRuntime ? 'gnu' : 'musl';
}

function getPackageName() {
  switch (process.platform) {
    case 'linux': {
      const libc = detectLibc();

      if (process.arch === 'x64') {
        return `@rollup/rollup-linux-x64-${libc}`;
      }

      if (process.arch === 'arm64') {
        return `@rollup/rollup-linux-arm64-${libc}`;
      }

      return null;
    }
    case 'darwin':
      if (process.arch === 'x64') {
        return '@rollup/rollup-darwin-x64';
      }

      if (process.arch === 'arm64') {
        return '@rollup/rollup-darwin-arm64';
      }

      return null;
    case 'win32':
      if (process.arch === 'x64') {
        return '@rollup/rollup-win32-x64-msvc';
      }

      if (process.arch === 'arm64') {
        return '@rollup/rollup-win32-arm64-msvc';
      }

      return null;
    default:
      return null;
  }
}

function hasPackage(name) {
  try {
    require.resolve(name);
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (process.env.ENOVAIT_SKIP_ROLLUP_NATIVE_FIX === '1') {
    return;
  }

  const packageName = getPackageName();

  if (!packageName) {
    return;
  }

  if (hasPackage(packageName)) {
    return;
  }

  const rollupVersion = require('rollup/package.json').version;

  console.warn(`[rollup-fix] Missing ${packageName}; installing ${packageName}@${rollupVersion}`);

  execFileSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['install', '--no-save', '--ignore-scripts', `${packageName}@${rollupVersion}`],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        ENOVAIT_SKIP_ROLLUP_NATIVE_FIX: '1',
      },
    }
  );
}

main();
