import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRoutes";
import LoginSuccessToast from "./components/common/LoginSuccessToast";
import LogoutConfirmModal from "./components/common/LogoutConfirmModal";
import { useAppDispatch } from "./redux/store";
import { refreshAccessToken, sessionExpired } from "./redux/slices/auth/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Remove refresh tokens left by older builds; refresh credentials now live only in HttpOnly cookies.
    try {
      localStorage.removeItem("mp_client_refresh_token");
    } catch {
      void 0;
    }
    // Chỉ kích hoạt phục hồi phiên một lần duy nhất khi khởi tạo, tránh StrictMode gọi lặp làm xoay hỏng token
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    dispatch(refreshAccessToken());
  }, [dispatch]);

  useEffect(() => {
    const handleExpiredSession = () => dispatch(sessionExpired());
    window.addEventListener("auth:session-expired", handleExpiredSession);
    return () => window.removeEventListener("auth:session-expired", handleExpiredSession);
  }, [dispatch]);

  return (
    <>
      <RouterProvider router={router} />
      <LoginSuccessToast />
      <LogoutConfirmModal />
    </>
  );
}

export default App;
