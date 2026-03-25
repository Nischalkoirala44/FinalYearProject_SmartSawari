export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    success: boolean;
    notifications: Notification[];
}