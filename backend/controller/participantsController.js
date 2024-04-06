const { generateDefaultResponseObject } = require("../utils/defaultResponseObject");
const { validateParticipantData, Participant } = require("../models/participantModel");
const { ResponseObject } = require("../utils/defaultResponseObject");
const { Event } = require("../models/eventModel");

exports.add_new_participant = async (req, res) => {
    const { error, value } = validateParticipantData(req.body);

    if (error) return res.status(400).json(generateDefaultResponseObject({
        success: false,
        message: error.details[0].message,
    }));

    let foundEvent, existingParticipant;

    try {
        const promises = await Promise.all([
            Event.findById(value.event_id),
            Participant.findOne({ 
                email: value.email.toLocaleLowerCase(), 
                event_id: value.event_id 
            })
        ])

        foundEvent = promises[0];
        existingParticipant = promises[1];

        if (!foundEvent) return res.status(404).json(generateDefaultResponseObject({
            success: false,
            message: 'Event could not be found',
        }));

        if (existingParticipant) return res.status(409).json(generateDefaultResponseObject({
            success: false,
            message: 'Participant has already been registered for event',
            data: existingParticipant,
        }));

    } catch (error) {
        return res.status(500).json(generateDefaultResponseObject({
            success: false,
            message: 'An error occured trying to save participant details',
            error: error,
        }));
    }

    if (new Date().getTime() > new Date(foundEvent?.close_date).getTime()) return res.status(403).json(generateDefaultResponseObject({
        success: false,
        message: `Sorry, this event closed on ${new Date(foundEvent?.close_date).toDateString()} at ${new Date(foundEvent?.close_date).toLocaleTimeString()}`,
    }));

    const newParticipant = new Participant({ ...value, email: value.email.toLocaleLowerCase(), time_started: new Date() });

    try {
        await newParticipant.save();

        return res.status(200).json(generateDefaultResponseObject({
            success: true,
            message: 'Successfully saved participant details for event',
            data: newParticipant,
        }))
    } catch (error) {
        return res.status(500).json(generateDefaultResponseObject({
            success: false,
            message: 'An error occured trying to save participant details',
            error: error,
        }));   
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
    if (req.body._id) query._id = req.body._id;
    if (req.body.email) query.email = req.body.email;
    if (req.body.user_lat) query.user_lat = req.body.user_lat;
    if (req.body.user_lon) query.user_lon = req.body.user_lon;
    if (req.body.hours_spent_in_event) query.hours_spent_in_event = req.body.hours_spent_in_event;
    // Assuming createdAt is a direct property of the participant document
    if (req.body.createdAt) query.createdAt = req.body.createdAt;
    
    try {
        const participant = await Participant.find(query);
        return ResponseObject({
            success: true,
            message: 'Participants retrieved successfully',
            data: participant}, res.status(200));
    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'Failed to retrieve participants',
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
    if (req.body._id) query._id = req.body._id;
    if (req.body.email) query.email = req.body.email;
    if (req.body.user_lat) query.user_lat = req.body.user_lat;
    if (req.body.user_lon) query.user_lon = req.body.user_lon;
    if (req.body.hours_spent_in_event) query.hours_spent_in_event = req.body.hours_spent_in_event;
    // Assuming createdAt is a direct property of the participant document
    if (req.body.createdAt) query.createdAt = req.body.createdAt;
    
    try {
        const participants = await Participant.find(query);
        if (participants.length==0){
            return ResponseObject({
                success: false,
                message: 'No participants found matching query criteria'
            }, res.status(404));
        }
        for (let i = 0; i < participants.length; i++) {
            const id = participants[i]._id;
            const deletedparticipant = await Participant.findByIdAndDelete(id);
            
            if (!deletedparticipant) {
                return ResponseObject({
                    success: false,
                    message: 'Failed to retrieve participants',
                    error: `participant with id: ${id} not deleted`
                }, res.status(404));
            }
        }
        
        return ResponseObject({
            success: true,
            message: 'Successfully deleted participants(s).'}, res.status(200));
    } catch (error) {
        return ResponseObject({
            success: false,
            message: 'Failed to retrieve participants',
            error: error,
        }, res.status(400));
    }
}