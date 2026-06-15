type EnvReader = {
  get(name: string): string | undefined;
};

export type ServerConfig = {
  hostname: string;
  port: number;
  siteRoot: URL;
};

export function parsePort(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return fallback;
  }

  return port;
}

export function readConfig(env: EnvReader = Deno.env): ServerConfig {
  return {
    hostname: env.get("HOST") ?? "127.0.0.1",
    port: parsePort(env.get("PORT"), 8004),
    siteRoot: new URL("../public/", import.meta.url),
  };
}
