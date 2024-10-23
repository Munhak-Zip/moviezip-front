import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const ChatRooms = () => {
    const [userId, setUserId] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [chatRoom, setChatRoom] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [adminId,setAdminId] =useState('');

    useEffect(() => {
        const id = localStorage.getItem("userId");

        if (id) {
            setUserId(id);
            console.log("유저 아이디: ", id);
            handleFetchChatRooms(id); // Fetch chat room list
        }
        const fetchAdminId = async () => {
            try {
                const response = await axios.get('/api/getAdminId');
                if (response.status === 200) {
                    console.log("어드민 아이디=" + response.data);
                    setAdminId(response.data);
                }
            } catch (error) {
                console.error('Error fetching admin ID:', error);
            }
        };

        fetchAdminId();
    }, [adminId]);

    // 채팅방 생성
    const handleCreateChatRoom = async () => {
        console.log("Creating chat room with User ID:", userId, "Admin ID:", adminId);
        try {
            const response = await axios.post('/chat/createRoom', null, {
                params: { userId,adminId },
            });
            setChatRoom(response.data);
            navigate(`/chat/${response.data.id}`);

            setError('');
        } catch (err) {
            console.error('Error creating chat room:', err);
            setError('Failed to create chat room.');
        }
    };
    useEffect(() => {
        if (userId) {
            handleFetchChatRooms(userId);
        }
    }, [isAdmin]); // Depend on isAdmin

    // 채팅방 목록 조회
    const handleFetchChatRooms = async (fetchedUserId) => {
        console.log("어드민 fetchedUserId =", fetchedUserId, "Type:", typeof fetchedUserId);
        console.log("어드민 adminId =", adminId, "Type:", typeof adminId);

        try {
            if (fetchedUserId === String(adminId)) {
                console.log("어드민 adminId=", adminId);
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }

            // Now that we have set isAdmin, we can fetch chat rooms
            const response = await axios.get('/chat', {
                params: { userId: fetchedUserId || userId, isAdmin }
            });
            setChatRooms(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching chat rooms:', err);
            setError('Failed to fetch chat rooms.'); // Set error message
        }
    };
    // 해당 채팅방으로 이동
    const handleRoomClick = (roomId) => {
        console.log("룸아이디:", roomId);
        navigate(`/chat/${roomId}`);
    };

    return (
        <div>
            <h2>Create Chat Room</h2>
            <button onClick={handleCreateChatRoom}>문의하기</button>

            {chatRoom && <div>Created Chat Room: {chatRoom.roomName}</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}

            <hr />

            <h2>Chat Rooms</h2>

            {chatRooms.length > 0 && (
                <ul>
                    {chatRooms.map((room) => (
                        <li key={room.id} onClick={() => handleRoomClick(room.id)} style={{ cursor: 'pointer' }}>
                            {room.roomName}
                        </li>
                    ))}
                </ul>
            )}
            {error && <div style={{ color: 'red' }}>{error}</div>}
        </div>
    );
};

export default ChatRooms;
