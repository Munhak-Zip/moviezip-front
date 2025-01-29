import React, { useEffect, useState } from 'react';
import { Client, Stomp } from '@stomp/stompjs';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { useParams } from 'react-router-dom';
import axiosInstance, { setupAxiosInterceptor } from '../../axiosConfig';
const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [client, setClient] = useState(null);
    // const [sessionId, setSessionId] = useState('');
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
    const [username, setUserName] = useState("");

    const fetchUserInfo = (userId) => {
        axiosInstance.get('/mypage/user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`  // 'Bearer '와 token을 함께 전달
            }
        })
            .then(response => {
                const data = response.data;
                setUserName(data.nickname);
                console.log("이름: " + data.nickname);
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
    };


    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/chat');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);

            // 채팅 방에 대한 구독
            stompClient.subscribe(`/topic/chat`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                console.log('Received message:', receivedMessage); // 디버깅용 로그

                // 메시지가 유효한 경우에만 상태 업데이트
                if (receivedMessage.sender && receivedMessage.content) {
                    if ( String(receivedMessage.userId) !== userId) {
                        setMessages(prevMessages => [...prevMessages, receivedMessage]);
                    }
                }
            });

            setClient(stompClient);
        }, (error) => {
            console.error('WebSocket error:', error); // 에러 핸들링
        });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
                console.log('Disconnected'); // 디버깅용 로그
            }
        };
    }, []);

    const fetchMessages = async () => {
        try {
            console.log("Fetching messages for roomId: " + roomId);
            const response = await axiosInstance.get(`http://localhost:8080/chat/room/${roomId}/messages`);

            if (response.status === 200) {
                console.log("Response data", response.data);
                console.log("Messages:", response.data);
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchUserInfo(userId);
    }, [roomId, userId]);

    const handleSendMessage = async () => {
        if (newMessage.trim() && client) {
            const message = {
                type: "TALK",  // Message type (could also be dynamic based on message type)
                userId: userId,  // The ID of the authenticated user
                sender: username || "이용자",  // The username of the sender (authenticated or anonymous)
                content: newMessage,  // The message content
                timestamp: new Date().toISOString(),  // Current timestamp in ISO format
                chatRoomId: roomId,  // The chat room ID
            };

            try {
                client.publish({
                    destination: `/app/send/message`,
                    body: JSON.stringify(message),
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    },
                });


                setMessages((prevMessages) => [
                    ...prevMessages,
                    { sender: username, content: newMessage },
                ]);

                setNewMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <div style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', marginBottom: '10px' }}>
                {Array.isArray(messages) && messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div key={index} style={{ padding: '5px', borderBottom: '1px solid #eaeaea' }}>
                            <strong>{msg.sender}: </strong>
                            {msg.content}
                        </div>
                    ))
                ) : (
                    <div>No messages in this chat room yet.</div>
                )}
            </div>
            <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                style={{ width: '70%', marginRight: '10px' }}
            />
            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default ChatRoom;
