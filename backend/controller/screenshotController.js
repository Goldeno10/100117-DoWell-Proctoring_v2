const { ScreenShot, validateScreenShotData } = require("../models/screenshotModel");
const { generateDefaultResponseObject,ResponseObject } = require("../utils/defaultResponseObject");

exports.add = async (req, res) => {
    const { error, value } = validateScreenShotData(req.body);
    if (error) {
        return ResponseObject({
            success: false,
            message: error.details[0].message,
        }, res.status(400));
    }

    try {
        const existingWithEventId = await ScreenShot.findOne({ event_id: value.event_id });
        if (existingWithEventId) {
            return ResponseObject({
                success: false,
                message: `Screenshots with "Event Id: "+ ${value.event_id} already exists`,
            }, res.status(409));
        }

        const newScreenShot = new ScreenShot(value);
        await newScreenShot.save();

        return ResponseObject({
            success: true,
            message: `Screenshots created successfully`,
            response: newScreenShot,
        }, res.status(201));

    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'ScreenShot failed to be created',
        }, res.status(500));
    }
}

exports.getByParams = async (req, res) => {
    try {
        const screenshots = await ScreenShot.find(req.body);
        return ResponseObject({
            success: true,
            message: 'Screenshots retrieved successfully',
            response: screenshots}, res.status(200));
    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'Failed to retrieve screenshots'}, res.status(400));
    }
}
exports.getByDateRange = async (req, res) => {
    try {
        const screenshots = await ScreenShot.find(req.body);
        return ResponseObject({
            success: true,
            message: 'Screenshots retrieved successfully',
            response: screenshots}, res.status(200));
    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'Failed to retrieve screenshots'}, res.status(400));
    }
}
