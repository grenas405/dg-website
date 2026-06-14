import { createApp } from "./src/app.ts";
import { readConfig } from "./src/config.ts";

if (import.meta.main) {
  const config = readConfig();
  const app = createApp(config.siteRoot);

  console.log(
    `DenoGenesis listening on http://${config.hostname}:${config.port}/`,
  );

  Deno.serve(
    {
      hostname: config.hostname,
      port: config.port,
    },
    app,
  );
}
