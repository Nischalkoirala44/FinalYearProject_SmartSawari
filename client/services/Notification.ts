import axios, { AxiosResponse } from 'axios';
import { NotificationResponse } from '../types/Notification';

const API_URL = "http://localhost:3001/api/notifications";

const getHeaders = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token}` };
};

export const fetchNotifications = async (): Promise<NotificationResponse> => {
    const response: AxiosResponse<NotificationResponse> = await axios.get(API_URL, {
        headers: getHeaders()
    });
    return response.data;
};

export const markAsRead = async (id: number): Promise<void> => {
    await axios.put(`${API_URL}/${id}/read`, {}, {
        headers: getHeaders()
    });
};