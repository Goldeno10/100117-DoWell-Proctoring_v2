import { defaultAxiosInstance } from "./config";
import { eventRoutePrefix, participantRoutePrefix } from "./routeUtils";


export const getEventById = async (eventId) => {
    return await defaultAxiosInstance.get(`${eventRoutePrefix}/${eventId}`);
}

export const registerForEvent = async (data) => {
    return await defaultAxiosInstance.post(`${participantRoutePrefix}/new`, data);
}