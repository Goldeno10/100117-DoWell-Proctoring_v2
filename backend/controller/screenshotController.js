const { ScreenShot, validateScreenShotData } = require("../models/screenshotModel");
const { ResponseObject } = require("../utils/defaultResponseObject");

exports.add = async (req, res) => {
    const { error, value } = validateScreenShotData(req.body);
    if (error) {
        return ResponseObject({
            success: false,
            message: error.details[0].message,
        }, res.status(400));
    }

    try {
    
        const newScreenShot = new ScreenShot(value);
        await newScreenShot.save();

        return ResponseObject({
            success: true,
            message: `Screenshots created successfully`,
            data: newScreenShot,
        }, res.status(201));

    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'ScreenShot failed to be created',
            error: error,
        }, res.status(500));
    }
}

exports.getByParams = async (req, res) => {
    let query = {};
    if (req.body.start_date) {
        query.createdAt = {
            $gte: req.body.start_date
        };
    }
    if (req.body.end_date) {
        query.createdAt = {
            $lte: req.body.end_date
        };
    }

    // Construct the query object dynamically based on the parameters received
    if (req.body.event_id) query.event_id = req.body.event_id;
    if (req.body.name) query.name = req.body.name;
    if (req.body.user_id) query.user_id = req.body.user_id;
    if (req.body.company_id) query.company_id = req.body.company_id;
    if (req.body.createdAt) query.createdAt = req.body.createdAt;
    
    try {
        const screenshots = await ScreenShot.find(query);
        return ResponseObject({
            success: true,
            message: 'Screenshots retrieved successfully',
            data: screenshots}, res.status(200));
    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'Failed to retrieve screenshots',
            error: error,
        }, res.status(400));
    }
}

exports.delete = async (req, res) => {
    let query = {};
    if (req.body.start_date) {
        query.createdAt = {
            $gte: req.body.start_date
        };
    }
    if (req.body.end_date) {
        query.createdAt = {
            $lte: req.body.end_date
        };
    }

    // Construct the query object dynamically based on the parameters received
    if (req.body.event_id) query.event_id = req.body.event_id;
    if (req.body.name) query.name = req.body.name;
    if (req.body.user_id) query.user_id = req.body.user_id;
    if (req.body.company_id) query.company_id = req.body.company_id;
    if (req.body.createdAt) query.createdAt = req.body.createdAt;

    try {
        const screenshots = await ScreenShot.find(query);
        if (screenshots.length==0){
            return ResponseObject({
                success: false,
                message: 'No screenshots found matching query criteria'
            }, res.status(404));
        }
        for (let i = 0; i < screenshots.length; i++) {
            const id = screenshots[i]._id;
            const deletedScreenshot = await ScreenShot.findByIdAndDelete(id);
            
            if (!deletedScreenshot) {
                return ResponseObject({
                    success: false,
                    message: 'Failed to retrieve screenshots',
                    error: `Screen shot with id: ${id} not deleted`
                }, res.status(404));
            }
        }
        
        return ResponseObject({
            success: true,
            message: 'Successfully deleted ScreenShot(s).'}, res.status(200));

    } catch (error) {
        return ResponseObject({
            success: true,
            message: 'Failed to deleted ScreenShot(s).', 
            error:error.message
        }, res.status(500));
    }
}

