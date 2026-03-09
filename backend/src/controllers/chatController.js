const knex = require("../database/connection");

// Get all lecturers
exports.getLecturers = async (req, res) => {
  try {
    const lecturers = await knex("users")
      .select("id", "name", "email")
      .where("role", "lecturer");

    res.json(lecturers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages between two lecturers
exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await knex("messages")
      .where(function () {
        this.where({ sender_id: senderId, receiver_id: receiverId });
      })
      .orWhere(function () {
        this.where({ sender_id: receiverId, receiver_id: senderId });
      })
      .orderBy("created_at", "asc");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  const { sender_id, receiver_id, message } = req.body;

  try {
    const newMessage = await knex("messages").insert({
      sender_id,
      receiver_id,
      message,
    });

    res.json({ success: true, id: newMessage[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};