import React, {useEffect, useState} from 'react';
import {BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import '../resources/css/Main/Main.css';
import Next from '../resources/next.png';
import Star from '../resources/img/Movie/star.png';
import axios from 'axios';
import {Oval} from 'react-loader-spinner';
import Modal from '../components/Modal/Modal';
import Interest from '../components/interest/Interest';

function Header(props) {
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

function Article(props) {
    return (
        <article>
            <h2>{props.title}</h2>
            {props.body}
        </article>
    );
}

function App() {
    const navigate = useNavigate();
    const [mode, setMode] = useState('WELCOME');
    const [search, setSearch] = useState('');
    const [moviesIndex, setMoviesIndex] = useState(0);
    const [id, setId] = useState(null);
    const [recommendationResults, setRecommendationResults] = useState([]);
    const [recentMovies, setRecentMovies] = useState([]); // 최신 영화를 위한 상태 추가
    const [searchResults, setSearchResults] = useState([]);
    const [wishMovies, setWishMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

    useEffect(() => {
        const userId = localStorage.getItem('userId');

        // 로그인 여부 확인
        if (userId) {
            setIsLoggedIn(true);
            fetchRecommendations();
            fetchRecentMovies();
            fetchWishMovies();
        } else {
            setIsLoggedIn(false);
            setIsLoading(false); // 로그인이 되어 있지 않으면 로딩 상태 해제
        }
    }, []);

    const topics = [
        {id: 1, title: '보관함', body: 'wish is...'},
        {id: 2, title: '마이페이지', body: 'myPage...'},
        {id: 3, title: '로그아웃', body: 'logOut...'},
    ];

    const onChange = (event) => {
        setSearch(event.target.value);
    };

    const fetchRecommendations = () => {
        //const userId = 3; // 예시로 사용자 ID를 지정
        const userId = localStorage.getItem('userId');
        if (userId) {
            axios
                .get('/main/recommend', {
                    params: {
                        userId: userId,
                    },
                })
                .then((response) => {
                    const recommendationResults = response.data;
                    setRecommendationResults(recommendationResults);
                })
                .catch((error) => {
                    console.error('Request failed:', error);
                })
                .finally(() => {
                    setIsLoading(false); // 데이터 요청 완료 시 로딩 상태 해제
                });
        }
    };

    const fetchRecentMovies = () => {
        axios
            .get('http://localhost:3000/main')
            .then((response) => {
                const recentMovies = response.data;
                setRecentMovies(Array.isArray(recentMovies) ? recentMovies : []);
            })
            .catch((error) => {
                console.error('Request failed:', error);
            });
    };

    const fetchWishMovies = () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            axios
                .get('http://localhost:3000/movie/wish', {params: {userId: userId}})
                .then((response) => {
                    const wishMovies = response.data;
                    if (Array.isArray(wishMovies)) {
                        setWishMovies(wishMovies);
                    } else {
                        console.error('Received non-array data:', wishMovies);
                        setWishMovies([]); // 배열이 아닌 경우 빈 배열 설정
                    }
                })
                .catch((error) => {
                    console.error('Request failed:', error);
                });
        }
    };

    useEffect(() => {
        fetchRecommendations();
        fetchRecentMovies(); // 컴포넌트가 마운트될 때 최신 영화를 가져옴
        fetchWishMovies(); // 컴포넌트가 마운트될 때 보관함 영화를 가져옴
    }, []);


    // const renderMovies = (movies) => {
    //     if (!Array.isArray(movies) || movies.length === 0) {
    //         return <p>최신 영화가 없습니다.</p>;
    //     }
    //
    //     return movies.map((movie) => (
    //         <span key={movie.mvId} className="movie">
    //         <img src={movie.mvImg} alt={movie.mvTitle} className="Poster-img" onClick={() => showMovies(movie.mvId)}/>
    //         <p>
    //             {movie.mvTitle}
    //             <img src={Star} className="star"/>
    //             ({movie.mvStar})
    //         </p>
    //     </span>
    //     ));
    // };
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
    const showMovies = (mvId) => {
        axios
            .get(`/movie/${mvId}`) // 경로 변수를 사용하여 mvId 전달
            .then((response) => {
                const movieDetails = response.data;
                navigate(`/movie/${mvId}`, {state: movieDetails});
            })
            .catch((error) => {
                console.error('Request failed:', error);
            });
    };

    function Movies(props) {
        let content;
        if (props.type === 'new') {
            content = '최신영화';
        } else if (props.type === 'recommend') {
            content = '추천영화';
        } else {
            content = '보관함';
        }

        // Render content
        return (
            <div className={props.type}>
                <h2>{content}</h2>
                <div className="new-movies">
                    {/* Display either the loading indicator or the movie list */}
                    {props.isLoading ? <Loading /> : renderMovies(props.type, props.movies)}
                </div>
            </div>
        );
    }

    let content = null;
    if (mode === 'WELCOME') {
        content = <Article title="Welcome" body="Hello, MOVIE.ZIP"/>;
    } else if (mode === 'READ') {
        let title,
            body = null;
        for (let i = 0; i < topics.length; i++) {
            if (topics[i].id === id) {
                title = topics[i].title;
                body = topics[i].body;
            }
        }
        content = <Article title={title} body={body}/>;
    }

    const [username, setUserName] = useState('');
    const [userid, setUserId] = useState();
    const [showModal, setShowModal] = useState(false); // Interest 모달 창 상태 추가

    // useEffect(() => {
    //     const fetchUsername = async () => {
    //         try {
    //             const response = await axios.get('/user-id', { withCredentials: true });
    //             setUserName(response.data);
    //             // console.log(response.data);
    //         } catch (error) {
    //             console.error('Error fetching user ID:', error);
    //         }
    //     };
    //
    //     fetchUsername();
    // }, []);
    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const response = await axios.get('/getId');
                if (response.headers['content-type'].includes('application/json')) {
                    const userId = response.data;
                    console.log("User ID:", userId);
                    setUserId(userId)
                    // localStorage.setItem(userId);
                } else {
                    // 로그인 페이지가 반환된 경우 리디렉션
                    window.location.href = 'http://localhost:3000/login';
                }
            } catch (error) {
                console.error('Error fetching user ID:', error);
                window.location.href = 'http://localhost:3000/login';
            }
        };

        fetchUserId();
    }, []);

    const handleInterestModal = () => {
        setShowModal(true);
    };
    // const fetchUserIdByUsername = async () => {
    //     try {
    //         if (username) {
    //             const response = await axios.post('/getUserIdByUsername', { username: username }, { withCredentials: true });
    //             setUserId(response.data);
    //             console.log('User ID:', response.data);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching user ID:', error);
    //     }
    // };

    const handleSearch = () => {
        if (search.trim() === '') {
            alert('검색어를 입력해주세요.');
            return;
        }

        setIsLoading(true); // 검색 시작 시 로딩 상태를 true로 설정

        axios
            .get(`/search/${search}`)
            .then((response) => {
                const searchResults = response.data;
                setSearchResults(searchResults);
                navigate(`/search/${search}`, {state: searchResults});
            })
            .catch((error) => {
                console.error('검색 요청 실패:', error);
            })
            .finally(() => {
                setIsLoading(false); // 검색 완료 시 로딩 상태를 false로 설정
            });
    };

    return (
        <div className="div1">
            <div id="div1_input">
                <input type="text" class="search-type" placeholder="검색하기" value={search} onChange={onChange}/>
                <input type="button" class="search-button" value="검색" onClick={handleSearch}/>
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
