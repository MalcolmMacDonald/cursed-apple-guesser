import { RCON } from "@fabricio-191/valve-server-query";

type RconInstance = Awaited<ReturnType<typeof RCON>>;

export class RconClient {
  private rcon: RconInstance | null = null;

  async connect(host: string, port: number, password: string): Promise<void> {
    this.rcon = await RCON({ ip: host, port, password });
  }

  async send(command: string): Promise<string> {
    if (!this.rcon) throw new Error("RCON not connected");
    return this.rcon.exec(command);
  }

  close(): void {
    this.rcon?.destroy();
    this.rcon = null;
  }
}
