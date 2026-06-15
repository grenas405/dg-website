import { createApp } from "./src/app.ts";
import { readConfig } from "./src/config.ts";

if (import.meta.main) {
  const config = readConfig();
  const kv = await Deno.openKv(config.kvPath);
  const app = createApp(config.siteRoot, kv);

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
