import React, { useEffect, useState } from "react";
import { getLecturers } from "../../services/chatService";

const ChatBox = () => {
  const [lecturers, setLecturers] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState(null);

  useEffect(() => {
    loadLecturers();
  }, []);

  const loadLecturers = async () => {
    try {
      const data = await getLecturers();
      setLecturers(data);
    } catch (error) {
      console.error("Error loading lecturers", error);
    }
  };

  return (
    <div className="flex h-screen">

      {/* LEFT SIDE — Lecturer List */}
      <div className="w-1/4 border-r p-4 bg-slate-50">
        <h2 className="text-lg font-semibold mb-4">Lecturers</h2>

        {lecturers.map((lecturer) => (
          <div
            key={lecturer.id}
            onClick={() => setSelectedLecturer(lecturer)}
            className="p-2 mb-2 bg-white rounded cursor-pointer hover:bg-slate-100"
          >
            {lecturer.name}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE — Chat Area */}
      <div className="flex-1 p-4">
        {selectedLecturer ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Chat with {selectedLecturer.name}
            </h2>

            <div className="border h-[400px] p-3 mb-3 overflow-y-auto">
              Messages will appear here
            </div>

            <input
              type="text"
              placeholder="Type message..."
              className="border p-2 w-full rounded"
            />
          </div>
        ) : (
          <div className="text-gray-500">
            Select a lecturer to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBox;