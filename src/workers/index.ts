import { startNotificationWorker, stopNotificationWorker } from "./notificationWorker.js";

export const startWorkers = (): void => {
  startNotificationWorker();
};

export const stopWorkers = (): void => {
  stopNotificationWorker();
};

