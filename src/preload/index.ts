import { contextBridge, ipcRenderer } from 'electron'

const api = {
  patients: {
    create: (data: unknown) => ipcRenderer.invoke('patients:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('patients:update', id, data),
    getById: (id: string) => ipcRenderer.invoke('patients:getById', id),
    search: (query: string) => ipcRenderer.invoke('patients:search', query),
    listRecent: () => ipcRenderer.invoke('patients:listRecent'),
    count: () => ipcRenderer.invoke('patients:count'),
    delete: (id: string) => ipcRenderer.invoke('patients:delete', id)
  },
  visits: {
    create: (data: unknown) => ipcRenderer.invoke('visits:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('visits:update', id, data),
    getById: (id: string) => ipcRenderer.invoke('visits:getById', id),
    getWithMedicines: (id: string) => ipcRenderer.invoke('visits:getWithMedicines', id),
    listByPatient: (patientId: string) => ipcRenderer.invoke('visits:listByPatient', patientId),
    listRecent: () => ipcRenderer.invoke('visits:listRecent'),
    getMedicines: (visitId: string) => ipcRenderer.invoke('visits:getMedicines', visitId),
    listAll: () => ipcRenderer.invoke('visits:listAll'),
    listPrescriptions: () => ipcRenderer.invoke('visits:listPrescriptions'),
    getDashboardStats: () => ipcRenderer.invoke('visits:getDashboardStats'),
    delete: (id: string) => ipcRenderer.invoke('visits:delete', id)
  },
  appointments: {
    create: (data: unknown) => ipcRenderer.invoke('appointments:create', data),
    update: (id: string, data: unknown) => ipcRenderer.invoke('appointments:update', id, data),
    getById: (id: string) => ipcRenderer.invoke('appointments:getById', id),
    listByDate: (date: string) => ipcRenderer.invoke('appointments:listByDate', date),
    listUpcoming: () => ipcRenderer.invoke('appointments:listUpcoming'),
    listAll: () => ipcRenderer.invoke('appointments:listAll'),
    markCompleted: (id: string) => ipcRenderer.invoke('appointments:markCompleted', id),
    cancel: (id: string) => ipcRenderer.invoke('appointments:cancel', id),
    delete: (id: string) => ipcRenderer.invoke('appointments:delete', id)
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    update: (settings: unknown) => ipcRenderer.invoke('settings:update', settings)
  },
  print: {
    generateAndOpen: () => ipcRenderer.invoke('print:generateAndOpen')
  },
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    getLast: () => ipcRenderer.invoke('backup:getLast')
  }
}

contextBridge.exposeInMainWorld('api', api)

export type AppApi = typeof api
