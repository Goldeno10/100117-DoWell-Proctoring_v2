const { Router } = require("express");
const messageController = require("../controller/messageController");

const router = Router();

// Route to create a new event chat store entry
//router.post("/add", messageController.addmessage);
router.patch("/update", messageController.updatemessage);
router.get("/get", messageController.getByParams);
router.delete("/harddelete", messageController.harddelete);
router.delete("/softdelete", messageController.softdelete);


module.exports = router;
