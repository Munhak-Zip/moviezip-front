import React, { useEffect, useState } from 'react';
import { Client, Stomp } from '@stomp/stompjs';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [client, setClient] = useState(null);
    const [sessionId, setSessionId] = useState('');
    const userId = localStorage.getItem("userId");
    const [username, setUserName] = useState("");

    const fetchUserInfo = (userId) => {
        axios.get('/mypage/user', { params: { userId: userId } })
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
        const fetchSessionId = async () => {
            try {
                const response = await axios.get('http://localhost:8080/sessionId', {
                    withCredentials: true
                });
                setSessionId(response.data.sessionId);
            } catch (error) {
                console.error('Error fetching session ID:', error);
            }
        };

        fetchSessionId();
    }, []);

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
            const response = await axios.get(`http://localhost:8080/chat/room/${roomId}/messages`);

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
                chatRoom: { id: roomId },
                type: "TALK",
                userId: userId,
                content: newMessage,
                timestamp: new Date().toISOString(),
            };

            try {
                client.publish({
                    destination: `/app/send/message`,
                    body: JSON.stringify(message),
                    headers: {
                        sessionId: sessionId,
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
