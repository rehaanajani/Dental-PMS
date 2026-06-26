//#region src/main/preload.ts
require("electron").contextBridge.exposeInMainWorld("api", { ping: () => "pong" });
//#endregion
