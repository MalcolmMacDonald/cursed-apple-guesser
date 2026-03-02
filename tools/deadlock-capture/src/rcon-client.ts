// Source RCON protocol client.
// Ref: https://developer.valvesoftware.com/wiki/Source_RCON_Protocol

const SERVERDATA_AUTH = 3;
const SERVERDATA_EXECCOMMAND = 2;
const SERVERDATA_AUTH_RESPONSE = 2;
const SERVERDATA_RESPONSE_VALUE = 0;

type PendingRequest = {
  resolve: (body: string) => void;
  reject: (err: Error) => void;
};

export class RconClient {
  private socket: Awaited<ReturnType<typeof Bun.connect>> | null = null;
  private buffer: Buffer = Buffer.alloc(0);
  private nextId = 1;
  private pending = new Map<number, PendingRequest>();
  private authResolve: (() => void) | null = null;
  private authReject: ((e: Error) => void) | null = null;
  private connected = false;

  async connect(host: string, port: number, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authResolve = resolve;
      this.authReject = reject;

      Bun.connect({
        hostname: host,
        port,
        socket: {
          data: (_socket, data: Buffer) => this.onData(data),
          open: (_socket) => {
            this.connected = true;
            this.sendAuth(password);
          },
          close: () => {
            this.connected = false;
            // Reject any pending requests
            for (const { reject: r } of this.pending.values()) {
              r(new Error("RCON connection closed"));
            }
            this.pending.clear();
          },
          error: (_socket, err) => {
            reject(err);
            this.authReject?.(err);
          },
        },
      }).then((sock) => {
        this.socket = sock;
      }).catch(reject);
    });
  }

  async send(command: string): Promise<string> {
    if (!this.socket || !this.connected) {
      throw new Error("RCON not connected");
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.sendPacket(id, SERVERDATA_EXECCOMMAND, command);
    });
  }

  close(): void {
    this.socket?.end();
    this.socket = null;
    this.connected = false;
  }

  private sendAuth(password: string): void {
    const authId = this.nextId++;
    this.pending.set(authId, {
      resolve: () => {},
      reject: (e) => this.authReject?.(e),
    });
    this.sendPacket(authId, SERVERDATA_AUTH, password);
  }

  private sendPacket(id: number, type: number, body: string): void {
    const bodyBytes = Buffer.from(body, "ascii");
    // Packet after the size field: id(4) + type(4) + body + \0 + \0
    const size = 4 + 4 + bodyBytes.length + 2;
    const packet = Buffer.alloc(4 + size);
    let offset = 0;
    packet.writeInt32LE(size, offset);         offset += 4;
    packet.writeInt32LE(id, offset);           offset += 4;
    packet.writeInt32LE(type, offset);         offset += 4;
    bodyBytes.copy(packet, offset);            offset += bodyBytes.length;
    packet[offset++] = 0; // body null terminator
    packet[offset++] = 0; // empty string null terminator
    this.socket!.write(packet);
  }

  private onData(data: Buffer): void {
    this.buffer = Buffer.concat([this.buffer, data]);

    while (this.buffer.length >= 4) {
      const size = this.buffer.readInt32LE(0);
      if (this.buffer.length < 4 + size) break; // incomplete packet, wait for more data

      const id   = this.buffer.readInt32LE(4);
      const type = this.buffer.readInt32LE(8);
      // Body ends before the two trailing null bytes
      const bodyEnd = 4 + size - 2;
      const body = this.buffer.slice(12, bodyEnd).toString("ascii");
      this.buffer = this.buffer.slice(4 + size);

      if (type === SERVERDATA_AUTH_RESPONSE) {
        if (id === -1) {
          this.authReject?.(new Error("RCON authentication failed — check RCON_PASSWORD"));
        } else {
          this.authResolve?.();
        }
        this.authResolve = null;
        this.authReject = null;
        continue;
      }

      if (type === SERVERDATA_RESPONSE_VALUE) {
        const handler = this.pending.get(id);
        if (handler) {
          this.pending.delete(id);
          handler.resolve(body);
        }
      }
    }
  }
}
