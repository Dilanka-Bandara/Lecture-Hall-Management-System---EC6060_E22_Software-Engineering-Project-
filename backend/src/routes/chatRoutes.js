const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");

// get lecturer list
router.get("/lecturers", chatController.getLecturers);

// get messages between two users
router.get("/messages/:senderId/:receiverId", chatController.getMessages);

// send message
router.post("/send", chatController.sendMessage);

module.exports = router;