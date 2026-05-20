import type { NotificationInstance } from 'antd/es/notification/interface';

let notificationInstance: NotificationInstance = null;

export const getNotificationInstance = (): NotificationInstance => {
  if (!notificationInstance) throw new Error('Notification instance not initialized');
  return notificationInstance;
};

export const setNotificationInstance = (instance: NotificationInstance) => {
  notificationInstance = instance;
};
