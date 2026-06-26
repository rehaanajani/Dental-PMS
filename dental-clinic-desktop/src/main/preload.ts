import { contextBridge } from 'electron';

const api = {
  // Placeholder API for MVP
  ping: () => 'pong'
};

contextBridge.exposeInMainWorld('api', api);

export type AppApi = typeof api;
