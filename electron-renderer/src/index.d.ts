declare var electronAPI: {
  send: (command: string, ...arg: any[]) => void,
  invoke: (command: string, ...arg: any[]) => Promise<any>,
}