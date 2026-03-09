import axios from "axios";

const API = "http://localhost:5000/api/chat";

// get lecturer list
export const getLecturers = async () => {
  const res = await axios.get(`${API}/lecturers`);
  return res.data;
};

// get messages between two lecturers
export const getMessages = async (senderId, receiverId) => {
  const res = await axios.get(`${API}/messages/${senderId}/${receiverId}`);
  return res.data;
};

// send message
export const sendMessage = async (data) => {
  const res = await axios.post(`${API}/send`, data);
  return res.data;
};