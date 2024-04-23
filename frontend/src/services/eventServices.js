import { defaultAxiosInstance } from "./config";
import { eventRoutePrefix } from "./routeUtils";

export const getEventById = async (eventId) => {
    return await defaultAxiosInstance.get(`${eventRoutePrefix}/${eventId}`);
}

export const addNewEvent = async (data) => {
    return await defaultAxiosInstance.post(`${eventRoutePrefix}/new`, data);
}