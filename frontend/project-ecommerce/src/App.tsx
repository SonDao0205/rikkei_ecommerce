import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes/AppRoutes";
import LoginSuccessToast from "./components/common/LoginSuccessToast";
import LogoutConfirmModal from "./components/common/LogoutConfirmModal";
import { useAppDispatch } from "./redux/store";
import { refreshAccessToken } from "./redux/slices/authSlice";

function App() {
  const dispatch = useAppDispatch();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Chỉ kích hoạt phục hồi phiên một lần duy nhất khi khởi tạo, tránh StrictMode gọi lặp làm xoay hỏng token
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    dispatch(refreshAccessToken());
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
