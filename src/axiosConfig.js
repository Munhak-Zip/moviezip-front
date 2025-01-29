import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // 쿠키 포함
});

const token = localStorage.getItem("accessToken");

// Axios 인터셉터 설정
export const setupAxiosInterceptor = () => {
    axiosInstance.interceptors.request.use((config) => {
        const token = localStorage.getItem("accessToken"); // 여기서 토큰을 가져오는 로직을 추가
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    });

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // 403 에러가 발생하고, 해당 요청에서 이미 재시도한 적이 없다면
            if (error.response.status === 403 && !originalRequest._retry) {
                originalRequest._retry = true; // 재시도 플래그 설정

                try {
                    // 토큰 갱신 요청
                    const refreshResponse = await axios.post('http://localhost:8080/api/auth/refresh', {}, {
                        withCredentials: true // 쿠키와 함께 전송
                    });

                    if (refreshResponse.status === 200) {
                        const newAccessToken = refreshResponse.data.accessToken;
                        console.log("새로받은 토큰", newAccessToken);

                        // 새로운 토큰을 로컬스토리지에 저장
                        localStorage.setItem("accessToken", newAccessToken);

                        // axiosInstance 및 원래 요청에 새로운 토큰을 설정
                        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

                        // 원래 요청을 새로운 토큰으로 다시 시도
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("토큰 갱신 실패:", refreshError);

                    // 토큰 갱신 실패 시, 토큰과 사용자 정보를 로컬스토리지에서 제거
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("userId");

                    // 로그인 페이지로 리디렉션
                    window.location.href = "/login";
                }
            }

            // 403 오류 외의 다른 오류는 그대로 반환
            return Promise.reject(error);
        }
    );
};

export default axiosInstance;