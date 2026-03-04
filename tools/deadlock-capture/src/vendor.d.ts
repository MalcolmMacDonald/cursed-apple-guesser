// Ambient type declarations for packages whose package.json exports field lacks a "types" entry.

declare module "@fabricio-191/valve-server-query" {
  import EventEmitter from "events";

  namespace RCON {
    interface Data {
      ip?: string;
      port?: number;
      timeout?: number;
      debug?: boolean;
      enableWarns?: boolean;
      retries?: number;
      password: string;
    }
  }

  interface RCON extends EventEmitter {
    exec(command: string): Promise<string>;
    authenticate(password?: string): Promise<void>;
    reconnect(): Promise<void>;
    destroy(): void;
    on(event: "disconnect", listener: (reason: string) => void): this;
    on(event: "passwordChange", listener: () => void): this;
  }

  function RCON(data?: RCON.Data): Promise<RCON>;

  export { RCON };
}
