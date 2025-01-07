import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from '../../axiosConfig';
import qs from 'qs'; // URL-encoded 형식으로 변환하기 위해 qs 라이브러리 사용
import axios from 'axios';
import '../../resources/css/User/Login.css';
import Modal from '../../components/Modal/Modal'
import Interest from '../../components/interest/Interest';
import Modalcss from '../../resources/css/Modal/Modal.css';
import Interestcss from '../../resources/css/Interest/interest.css';
import { jwtDecode } from "jwt-decode";  // jwtDecode로 수정


const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [userid, setUserId] = useState();
    const [showModal, setShowModal] = useState(false); // Interest 모달 창 상태 추가

    // useEffect(() => {
    //     const checkAuthentication = async () => {
    //         try {
    //             const response = await axiosInstance.get("/auth-check", { withCredentials: true });
    //             if (response.data == 200) {
    //                 alert("이미 로그인된 사용자입니다.");
    //                 navigate("/"); // Redirect to home or any other page
    //             }
    //         } catch (error) {
    //             console.error("Authentication check failed:", error);
    //         }
    //     };
    //     checkAuthentication();
    // }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        const loginDTO = {
            username: username,
            password: password,
        };

        try {
            const response = await axiosInstance.post("/authenticate", loginDTO, {
                headers: {
                    "Content-Type": "application/json",  // 요청 헤더 설정
                }
            });
            if (response.status === 200) {
                const jwt = response.data.jwt;  // 로그인 성공 시 받은 JWT
                localStorage.setItem("jwt", jwt);  // JWT를 로컬스토리지에 저장

                // JWT에서 userId 추출
                const decodedToken = jwtDecode(jwt);
                const userId = decodedToken.userId;
                alert("UserId: " + userId);  // userId 확인

                localStorage.setItem("userId", userId);  // userId를 로컬스토리지에 저장

                // 관심사 존재 여부 확인
                const interestResponse = await axiosInstance.post('/checkExistInterestById', { id: userId }, {
                    headers: {
                        "Authorization": `Bearer ${jwt}`,  // JWT 토큰을 Authorization 헤더에 포함
                    }
                });
                if (interestResponse.data) {
                    navigate("/");  // 관심사가 있으면 홈으로 이동
                } else {
                    setShowModal(true);  // 관심사가 없으면 모달을 띄움
                }
            } else {
                console.error("Error during login:", response.data);
            }
        } catch (error) {
            console.error("Network error:", error);
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="ID"
                    value={username}
                    name="username"
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="PW"
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">로그인</button>
            </form>
            <div className="links">
                <Link to="/signUp">회원가입</Link> | <Link to="/findId">ID 찾기</Link> | <Link to="/findPw1">PW 찾기</Link>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                {/* 모달 창 내용에 username과 userId 전달 */}
                <Interest/>
            </Modal>
        </div>
    );
};

export default Login;