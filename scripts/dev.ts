// Generate CSS first so Bun can resolve dist.css on startup
await Bun.$`bunx @tailwindcss/cli -i ./frontend/styles.css -o ./frontend/dist.css`.quiet();
console.log("CSS ready, starting dev servers...");

const css = Bun.spawn(["bun", "run", "dev:css"], { stdout: "inherit", stderr: "inherit" });
const server = Bun.spawn(["bun", "run", "dev:server"], { stdout: "inherit", stderr: "inherit" });

process.on("SIGINT", () => {
  css.kill();
  server.kill();
  process.exit(0);
});

await Promise.race([css.exited, server.exited]);
