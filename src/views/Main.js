import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import Star from '../resources/img/Movie/star.png';
import axiosInstance from '../axiosConfig';
import '../resources/css/Main/Main.css';
import Next from '../resources/next.png';




function Header(props) {
    const token = localStorage.getItem('accessToken');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    console.log('props', props, props.title);

    return (
        <header>
            <h1>
                <a
                    href="/"
                    onClick={(event) => {
                        event.preventDefault();
                        props.onChangeMode();
                    }}
                >
                    {props.title}
                </a>
            </h1>
        </header>
    );
}

// Loading Spinner 컴포넌트
function Loading() {
    const loadingStyle = {
        margin: '20px 0', // 위아래 여백 추가
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100px', // 로딩 스피너 컨테이너의 높이
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // 배경색 설정
        borderRadius: '8px', // 모서리 둥글기
    };

    return (
        <div className="loading-spinner" style={loadingStyle}>
            <Oval
                color="#D1003F"
                height={70}
                width={70}
                strokeWidth={3}
            />
        </div>
    );
}

function Nav(props) {
    const lis = [];
    for (let i = 0; i < props.topics.length; i++) {
        let t = props.topics[i];
        lis.push(
            <li key={t.id}>
                <a
                    id={t.id}
                    href={'/read/' + t.id}
                    onClick={(event) => {
                        event.preventDefault();
                        props.onChangeMode(Number(event.target.id));
                    }}
                >
                    {t.title}
                </a>
            </li>
        );
    }
    return (
        <nav>
            <ol>{lis}</ol>
        </nav>
    );
}



function App() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [moviesIndex, setMoviesIndex] = useState(0);
    const [recommendationResults, setRecommendationResults] = useState([]);
    const [recentMovies, setRecentMovies] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [wishMovies, setWishMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        fetchRecommendations();
        fetchRecentMovies();
        fetchWishMovies();
    }, []);

    // 영화 추천 데이터 가져오기
    const fetchRecommendations = () => {
        const userId = localStorage.getItem('userId');
        if (userId && token) {
            axiosInstance
                .get('/main/recommend', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        userId: userId,
                    },
                })
                .then((response) => {
                    setRecommendationResults(response.data);
                })
                .catch((error) => {
                    console.error('Request failed:', error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    // 최신 영화 데이터 가져오기
    const fetchRecentMovies = () => {
        if (token) {
            axiosInstance
                .get('/main', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    setRecentMovies(Array.isArray(response.data) ? response.data : []);
                })
                .catch((error) => {
                    console.error('Request failed:', error);
                });
        }
    };

    // 보관함 영화 데이터 가져오기
    const fetchWishMovies = () => {
        const userId = localStorage.getItem('userId');
        if (userId && token) {
            axiosInstance
                .get('/movie/wish', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: { userId: userId },
                })
                .then((response) => {
                    setWishMovies(response.data);
                })
                .catch((error) => {
                    console.error('Request failed:', error);
                });
        }
    };

    // 영화 검색 처리
    const handleSearch = () => {
        if (search.trim() === '') {
            alert('검색어를 입력해주세요.');
            return;
        }

        setIsLoading(true);

        axiosInstance
            .get(`/search/${search}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((response) => {
                setSearchResults(response.data);
                navigate(`/search/${search}`, { state: response.data });
            })
            .catch((error) => {
                console.error('검색 요청 실패:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const onChange = (event) => {
        setSearch(event.target.value);
    };


    const showMovies = (mvId) => {
        const token = localStorage.getItem('accessToken');
        axiosInstance
            .get(`/movie/${mvId}`, {
                headers: { Authorization: `Bearer ${token}` }
            }) // 경로 변수를 사용하여 mvId 전달
            .then((response) => {
                const movieDetails = response.data;
                navigate(`/movie/${mvId}`, {state: movieDetails});
            })
            .catch((error) => {
                console.error('Request failed:', error);
            });
    };

// 영화 컴포넌트
    function Movies(props) {
        let content;
        if (props.type === 'new') {
            content = '최신영화';
        } else if (props.type === 'recommend') {
            content = '추천영화';
        } else {
            content = '보관함';
        }

        return (
            <div className={props.type}>
                <h2>{content}</h2>
                <div className="new-movies">
                    {props.isLoading ? <Loading /> : renderMovies(props.type, props.movies)}
                </div>
            </div>
        );
    }

// 영화 리스트를 렌더링하는 함수
    const renderMovies = (type, movies) => {
        if (!Array.isArray(movies) || movies.length === 0) {
            let message = '';

            switch (type) {
                case 'new':
                    message = '최신 영화가 없습니다.';
                    break;
                case 'recommend':
                    message = '추천 영화가 없습니다.';
                    break;
                case 'wish':
                    message = '보관함에 영화가 없습니다.';
                    break;
                default:
                    message = '영화 정보가 없습니다.';
            }

            return <p>{message}</p>;
        }

        return movies.map((movie) => (
            <span key={movie.mvId} className="movie">
              <img src={movie.mvImg} alt={movie.mvTitle} className="Poster-img" onClick={() => showMovies(movie.mvId)} />
            <p>
                {movie.mvTitle}
                <img src={Star} className="star" />
                ({movie.mvStar})
            </p>
        </span>
        ));
    };



    return (
        <div className="div1">
            <div id="div1_input">
                <input type="text" className="search-type" placeholder="검색하기" value={search} onChange={onChange}/>
                <input type="button" className="search-button" value="검색" onClick={handleSearch}/>
            </div>
            <p/>
            <Movies type="new" movies={recentMovies} isLoading={isLoading}/>
            <Movies type="recommend" movies={recommendationResults} isLoading={isLoading}/>
            <Movies type="wish" movies={wishMovies} isLoading={isLoading}/>
            {/* Interest 모달 창 */}

        </div>
    );
}

export default App;

