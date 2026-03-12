import React, { useEffect, useState, useRef } from "react";
import { X, MessageCircle } from "lucide-react";
import { getLecturers, getMessages, sendMessage } from "../services/chatService";
import { useAuth } from "../context/AuthContext";

const ChatPanel = ({ isOpen, onClose }) => {

  const { user } = useAuth();
  const senderId = user?.id;

  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showLecturers, setShowLecturers] = useState(false);

  const [unreadSenders, setUnreadSenders] = useState([]);

  const messagesEndRef = useRef(null);

  // Load lecturers when chat opens
  useEffect(() => {
    if (isOpen) {
      loadLecturers();
    }
  }, [isOpen]);

  // Check unread messages
  useEffect(() => {

    const checkUnread = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/chat/unread");
        const data = await res.json();

        setUnreadSenders(data);
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(checkUnread, 4000);

    return () => clearInterval(interval);

  }, []);

  const loadLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Load messages when lecturer clicked
  const loadMessages = async (lecturer) => {
    try {

      const data = await getMessages(senderId, lecturer.id);

      setMessages(data);
      setSelectedLecturer(lecturer);
      setShowLecturers(false);

      // remove unread dot
      setUnreadSenders(prev =>
        prev.filter(id => id !== lecturer.id)
      );

    } catch (error) {
      console.error(error);
    }
  };

  // Send message
  const handleSendMessage = async () => {

    if (!newMessage.trim()) return;

    try {

      await sendMessage({
        sender_id: senderId,
        receiver_id: selectedLecturer.id,
        message: newMessage,
      });

      setNewMessage("");

      const updated = await getMessages(senderId, selectedLecturer.id);
      setMessages(updated);

    } catch (error) {
      console.error(error);
    }
  };

  // Auto refresh messages
  useEffect(() => {

    if (!selectedLecturer) return;

    const interval = setInterval(async () => {

      const updated = await getMessages(senderId, selectedLecturer.id);
      setMessages(updated);

    }, 3000);

    return () => clearInterval(interval);

  }, [selectedLecturer]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-700 shadow-xl z-50 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <h2 className="font-semibold text-white">Chat</h2>
        </div>

        <button onClick={onClose}>
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Lecturer dropdown */}
      <div
        onClick={() => setShowLecturers(!showLecturers)}
        className="p-3 border-b border-slate-700 cursor-pointer flex justify-between text-sm text-white"
      >
        <span>Lecturer List</span>
        <span>{showLecturers ? "▲" : "▼"}</span>
      </div>

      {/* Lecturer list */}
      {showLecturers && (
        <div className="max-h-40 overflow-y-auto border-b border-slate-700">

          {lecturers.map((lecturer) => (

            <div
              key={lecturer.id}
              onClick={() => loadMessages(lecturer)}
              className="flex justify-between items-center p-2 hover:bg-slate-800 cursor-pointer text-sm text-white"
            >

              <span>{lecturer.name}</span>

              {unreadSenders.includes(lecturer.id) && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}

            </div>

          ))}

        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">

        {selectedLecturer ? (
          <>

            <div className="text-sm font-semibold text-white mb-2">
              Chat with {selectedLecturer.name}
            </div>

            {messages.map((msg) => (

              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === senderId
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[70%] ${
                    msg.sender_id === senderId
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >

                  <div>{msg.message}</div>

                  <div className="text-[10px] text-gray-300 mt-1 text-right">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </div>

                </div>

              </div>

            ))}

            <div ref={messagesEndRef}></div>

          </>
        ) : (
          <div className="text-sm text-slate-400">
            Select a lecturer to start chatting
          </div>
        )}

      </div>

      {/* Message input */}
      {selectedLecturer && (
        <div className="p-3 border-t border-slate-700 flex gap-2">

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-1 p-2 rounded bg-slate-800 text-white text-sm"
            placeholder="Type message..."
          />

          <button
            onClick={handleSendMessage}
            className="px-4 bg-indigo-600 text-white rounded"
          >
            Send
          </button>

        </div>
      )}

    </div>
  );
};

export default ChatPanel;