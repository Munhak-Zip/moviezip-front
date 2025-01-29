import React, {useEffect, useState} from 'react';
import {Link, useLocation, useNavigate} from "react-router-dom";
import menu from '../../resources/img/menu.png';
import close from '../../resources/img/close.png';
import '../../resources/css/Common/header.css';
import Sidebar from "./Sidebar";
import axios from 'axios';
import axiosInstance from '../../axiosConfig';

const Header = (props) => {
    const locationNow = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false); // 사이드바 열림 상태 관리
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

    const toggleSidebar = async () => {
        if (!isSidebarOpen) {
            // JWT를 Authorization 헤더에 포함하여 서버로 요청
            try {
                const token = localStorage.getItem('accessToken');  // 로컬 스토리지에서 JWT 가져오기
                if (token) {
                    const response = await axiosInstance.get("/auth-check", {
                        headers: {
                            Authorization: `Bearer ${token}`,  // Authorization 헤더에 토큰 추가
                        },
                    });
                    setIsLoggedIn(response.data);  // 서버 응답에 따라 로그인 상태 업데이트
                } else {
                    setIsLoggedIn(false);  // 토큰이 없으면 로그인 상태 false로 설정
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                setIsLoggedIn(false);  // 요청 실패 시 로그인 상태 false로 설정
            }
        }
        setSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const navigate = useNavigate();

    const goToMypage = () => {
        navigate("/user/mypage");
        closeSidebar();
    }

    const goToChatRoom = () => {
        navigate("/ChatRooms");
        closeSidebar();
    };

    const goToMain = () => {
        navigate("/");
        closeSidebar();
    }

    const goToLogout = () => {
        axios.post('/logout')
            .then(response => {
                console.log('로그아웃 성공');
                alert("로그아웃 성공");
                setIsLoggedIn(false);
                closeSidebar();
            })
            .catch(error => {
                console.error('로그아웃 오류:', error);
                closeSidebar();
            });
    }

    const goToSignup = () => {
        navigate("/signup");
        closeSidebar();
    }

    const goToWish = () => {
        navigate("/wish");
        closeSidebar();
    }

    return (
        <header className="header">
            <div className="mobile">
                <div className="all">
                    <img src={menu} width={50} height={50} className="img-header" onClick={toggleSidebar} />
                    <div className="title_style" onClick={goToMain}>
                        Movie.Zip
                    </div>
                    <div className="horizontal-line"></div>
                </div>
            </div>
            {isSidebarOpen && (
                <div className="sidebar">
                    <div className="close">
                        <img src={close} width={50} height={50} onClick={closeSidebar} />
                    </div>
                    {isLoggedIn ? (
                        <>
                            <div className="sidebar-text" onClick={goToWish}>
                                보관함
                            </div>
                            <br />
                            <div className="sidebar-text" onClick={goToMypage}>
                                마이페이지
                            </div>
                            <div className="sidebar-text2" onClick={goToChatRoom}>
                                고객센터
                            </div>
                            <br />
                            <div className="sidebar-text" onClick={goToLogout}>
                                로그아웃
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="sidebar-text" onClick={goToSignup}>
                                회원가입
                            </div>
                            <br />
                            <div className="sidebar-text" onClick={() => navigate("/login")}>
                                로그인
                            </div>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}

export default Header;
