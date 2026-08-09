import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('knitstitchDesktop', {
  getMeta: () => ipcRenderer.invoke('knitstitch:get-app-meta'),
});
