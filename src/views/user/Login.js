import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance, { setupAxiosInterceptor } from '../../axiosConfig';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";  // JWT 디코딩

import '../../resources/css/User/Login.css';
import Modal from '../../components/Modal/Modal';
import Interest from '../../components/interest/Interest';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setupAxiosInterceptor(); // Axios 인터셉터 설정
    }, []);

    // 로그인 요청 함수
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axiosInstance.post("/api/auth/authenticate", { username, password });

            if (response.status === 200) {
                const { accessToken } = response.data;
                localStorage.setItem("accessToken", accessToken);

                const decodedToken = jwtDecode(accessToken);
                const userId = decodedToken.userId;
                localStorage.setItem("userId", userId);

                // 관심사 확인 API 요청
                const interestResponse = await axiosInstance.post('/checkExistInterestById', { id: userId }, {
                    headers: { "Authorization": `Bearer ${accessToken}` }
                });

                if (interestResponse.data) {
                    navigate("/");  // 관심사가 있으면 홈으로 이동
                } else {
                    setShowModal(true);  // 관심사가 없으면 모달을 띄움
                }
            }
        } catch (error) {
            console.error("로그인 중 오류 발생:", error);
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="ID" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" placeholder="PW" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">로그인</button>
            </form>
            <div className="links">
                <Link to="/signUp">회원가입</Link> | <Link to="/findId">ID 찾기</Link> | <Link to="/findPw1">PW 찾기</Link>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Interest />
            </Modal>
        </div>
    );
};

export default Login;
