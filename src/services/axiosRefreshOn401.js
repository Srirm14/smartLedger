import toast from "react-hot-toast";
import { useAuthStore } from "../../store/useAuthStore";

/** 401 on these routes must not trigger refresh (avoids login/register/refresh loops). */
function isAuthEndpointWithoutRefresh(config) {
  if (!config?.url) return false;
  const path = String(config.url).split("?")[0];
  const noRefresh = [
    "/login",
    "/register",
    "/refresh",
    "/forget_password",
    "/otp_confirmation",
    "/otp_verification",
    "/change_password",
  ];
  return noRefresh.some((p) => path === p || path.endsWith(p));
}

/**
 * Shared axios response error handler: refresh access token on 401 unless
 * the request is an auth endpoint or there is no refresh token.
 * @param {import("axios").AxiosInstance} axiosInstance
 */
export function axios401RefreshInterceptor(axiosInstance) {
  return async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = useAuthStore.getState().refreshToken;

      if (isAuthEndpointWithoutRefresh(error.config) || !refreshToken) {
        return Promise.reject(error);
      }

      try {
        const response = await axiosInstance.post(
          `/refresh?request=${refreshToken}`
        );
        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

        error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosInstance.request(error.config);
      } catch (refreshError) {
        console.error("Failed to refresh token", refreshError);
        useAuthStore.getState().logoutAction();
        window.location.href = "/login";
        toast.error("Session expired, please log in again.");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  };
}
