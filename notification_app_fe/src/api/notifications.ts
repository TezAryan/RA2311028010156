import axios from 'axios';
import { log } from '../utils/logger';

const API_BASE_URL = 'http://localhost:3001/api';

export interface NotificationItem {
  ID?: string;
  Type?: string;
  Message?: string;
  Timestamp?: string;
  _score?: number;
}

export const fetchAllNotifications = async (params: { limit?: number; page?: number; notification_type?: string }) => {
  try {
    log("info", "api", `Fetching all notifications with params: ${JSON.stringify(params)}`);
    const response = await axios.get(`${API_BASE_URL}/notifications`, { params });
    const data = Array.isArray(response.data) ? response.data : response.data.data || response.data;
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error: any) {
    log("error", "api", `Failed to fetch all notifications: ${error.message}`);
    throw error;
  }
};

export const fetchPriorityNotifications = async (n: number = 10) => {
  try {
    log("info", "api", `Fetching top ${n} priority notifications`);
    const response = await axios.get(`${API_BASE_URL}/notifications/priority`, { params: { n } });
    const data = Array.isArray(response.data) ? response.data : response.data.data || response.data;
    if (!Array.isArray(data)) return [];
    return data;
  } catch (error: any) {
    log("error", "api", `Failed to fetch priority notifications: ${error.message}`);
    throw error;
  }
};
