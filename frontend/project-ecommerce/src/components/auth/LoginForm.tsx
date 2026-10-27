<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi";
=======
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { loginUser, clearAuthError } from "../../redux/slices/authSlice";
>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be

// â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// â”€â”€â”€ Error Message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ErrorMessage = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {message}
    </p>
  );
};

// â”€â”€â”€ Types & Validation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface LoginFormData {
  identifier: string;
  password: string;
  remember: boolean;
}

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

const validate = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.identifier.trim()) {
    errors.identifier = "Vui lòng nhập email hoặc số điện thoại.";
  } else {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.identifier.trim());
    const isPhone = /^[0-9\s\-+()]{9,15}$/.test(data.identifier.trim());
    if (!isEmail && !isPhone) {
      errors.identifier = "Vui lòng nhập email hoặc số điện thoại hợp lệ.";
    }
  }

  if (!data.password) {
    errors.password = "Vui lòng nhập mật khẩu.";
  } else if (data.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  return errors;
};

// â”€â”€â”€ Input class helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const inputClass = (hasError: boolean, extra = "") =>
  `block w-full py-2.5 text-sm rounded-[11px] border bg-white text-slate-900 placeholder:text-slate-400 transition-all outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 focus:ring-red-100 focus:border-red-400 bg-red-50/20"
      : "border-slate-200 focus:border-brand-600 focus:ring-indigo-100"
  } ${extra}`;

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const LoginForm = () => {
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector((state) => state.auth);

>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: "",
    password: "",
    remember: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
=======
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

<<<<<<< HEAD
    // XÃ³a lá»—i cá»§a field Ä‘ang sá»­a
=======
>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (loginErrorMessage) {
      setLoginErrorMessage(null);
    }
    if (authError) {
      dispatch(clearAuthError());
    }
  };

<<<<<<< HEAD
=======
  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMessage(null);

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
<<<<<<< HEAD
    setApiError("");
    setSubmitting(true);
    try {
      await authApi.login(formData.identifier, formData.password);
      navigate("/account", { replace: true });
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setSubmitting(false);
=======

    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      const userRole = resultAction.payload.user.role;
      if (userRole === "admin") {
        navigate("/admin/products");
      } else {
        navigate("/home");
      }
    } else if (loginUser.rejected.match(resultAction)) {
      setLoginErrorMessage("Tài khoản hoặc mật khẩu không chính xác");
>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-white min-h-[600px] lg:min-h-screen">
      <div className="w-full max-w-md mx-auto space-y-7">

        {/* Mobile header */}
        <div className="flex lg:hidden items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-700 shadow-md flex items-center justify-center p-1.5">
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900">MarketPulse</span>
          </div>
          <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            Need help?
          </a>
        </div>

        {/* Form Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-brand-700">
            Welcome back
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to MarketPulse
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Enter your account credentials to continue shopping or managing your orders
          </p>
        </div>

        {/* Social Auth Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-[11px] text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer"
          >
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-[11px] text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer"
          >
            <FacebookIcon />
            <span>Facebook</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
            Or continue with email
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
<<<<<<< HEAD
          {apiError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p>}
=======
          {/* Thông báo lỗi khi đăng nhập thất bại */}
          {(loginErrorMessage || (authError && authError !== "No active session found.")) && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700 flex items-start gap-2.5 transition-all">
              <svg className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-red-800">Đăng nhập không thành công</p>
                <p className="text-xs text-red-600 mt-0.5 leading-relaxed">
                  Tài khoản hoặc mật khẩu không chính xác
                </p>
              </div>
            </div>
          )}
>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be

          {/* Email / Phone */}
          <div className="space-y-1.5">
            <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700">
              Email or Phone Number
            </label>
            <div className="relative rounded-[11px] shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="name@example.com"
                value={formData.identifier}
                onChange={handleChange}
                className={inputClass(!!errors.identifier, "pl-10 pr-3.5")}
              />
            </div>
            <ErrorMessage message={errors.identifier} />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative rounded-[11px] shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                value={formData.password}
                onChange={handleChange}
                className={inputClass(!!errors.password, "pl-10 pr-10")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={`absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors focus:outline-none cursor-pointer ${
                  showPassword ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
                }`}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <ErrorMessage message={errors.password} />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
                Remember me
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
<<<<<<< HEAD
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[11px] bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-150 transform active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-200 cursor-pointer"
            >
              <span>{submitting ? "Signing in…" : "Sign In"}</span>
              <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
=======
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[11px] bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all duration-150 transform active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-indigo-200 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
>>>>>>> d39ab1246432014645f9f417d4f8c5a819a6c1be
            </button>
          </div>
        </form>

        {/* Footer: Sign Up Link */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs sm:text-sm text-slate-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors ml-1"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL Encrypted
          </span>
          <span>â€¢</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <span>â€¢</span>
          <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
        </div>

      </div>
    </div>
  );
};

export default LoginForm;
