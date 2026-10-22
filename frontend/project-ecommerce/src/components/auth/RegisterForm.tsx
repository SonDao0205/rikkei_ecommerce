import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import { registerUser, clearAuthError } from "../../redux/slices/authSlice";

// ─── Sub-components ─────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4 text-[#1877F2] fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ─── Password Strength ──────────────────────────────────────────────────────────

type StrengthLevel = "Weak" | "Fair" | "Good" | "Strong";

const getPasswordStrength = (password: string): { level: StrengthLevel; filled: number; color: string } => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const filled = checks.filter(Boolean).length;
  const levels: StrengthLevel[] = ["Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-400", "bg-emerald-500", "bg-emerald-600"];
  return { level: levels[filled - 1] ?? "Weak", filled, color: colors[filled - 1] ?? "bg-red-500" };
};

const strengthTextColor: Record<StrengthLevel, string> = {
  Weak: "text-red-500",
  Fair: "text-orange-400",
  Good: "text-emerald-600",
  Strong: "text-emerald-700",
};

// ─── Error Message Component ────────────────────────────────────────────────────

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

// ─── Types ──────────────────────────────────────────────────────────────────────

interface RegisterFormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

// ─── Validation Logic ───────────────────────────────────────────────────────────

const validate = (data: RegisterFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "Full name must be at least 2 characters.";
  }

  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!data.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9\s\-+()]{9,15}$/.test(data.phone.trim())) {
    errors.phone = "Please enter a valid phone number (9–15 digits).";
  }

  if (!data.password) {
    errors.password = "Password is required.";
  } else if (data.password.length < 10) {
    errors.password = "Password must be at least 10 characters.";
  } else if (!/[A-Za-z]/.test(data.password) || !/[0-9]/.test(data.password)) {
    errors.password = "Password must contain at least one letter and one number.";
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!data.terms) {
    errors.terms = "You must agree to the Terms of Service and Privacy Policy.";
  }

  return errors;
};

// ─── Input class helper ─────────────────────────────────────────────────────────

const inputClass = (hasError: boolean, extra = "") =>
  `block w-full py-2.5 text-sm rounded-xl border text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-400 focus:ring-red-300 focus:border-red-400"
      : "border-slate-200 focus:ring-brand-600 focus:border-brand-600"
  } ${extra}`;

// ─── Main Form Component ────────────────────────────────────────────────────────

const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = formData.password ? getPasswordStrength(formData.password) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (authError) {
      dispatch(clearAuthError());
    }
  };

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    const resultAction = await dispatch(
      registerUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "client",
      })
    );

    if (registerUser.fulfilled.match(resultAction)) {
      navigate("/home");
    }
  };

  return (
    <>
      {/* Welcome Badge & Headers */}
      <div className="mb-7">
        <span className="inline-block px-3 py-1 bg-indigo-50 text-brand-700 text-xs font-semibold rounded-full mb-3">
          Get started for free
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Create Your Account</h2>
        <p className="mt-2 text-sm text-slate-500">Join millions of shoppers and explore top verified stores</p>
      </div>

      {/* Auth Error Banner */}
      {authError && authError !== "No active session found." && (
        <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{authError}</span>
        </div>
      )}

      {/* Social Register Buttons */}
      <div className="grid grid-cols-2 gap-3.5 mb-6">
        <button type="button" className="flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition cursor-pointer">
          <GoogleIcon />
          <span className="font-medium text-xs sm:text-sm">Google</span>
        </button>
        <button type="button" className="flex items-center justify-center space-x-2.5 py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition cursor-pointer">
          <FacebookIcon />
          <span className="font-medium text-xs sm:text-sm">Facebook</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold tracking-wider text-slate-400 uppercase whitespace-nowrap">
          OR REGISTER WITH YOUR DETAILS
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      {/* Registration Form */}
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="fullName">
            Full Name
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nguyen Van A"
              value={formData.fullName}
              onChange={handleChange}
              className={inputClass(!!errors.fullName, "pl-10 pr-3.5")}
            />
          </div>
          <ErrorMessage message={errors.fullName} />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="email">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              className={inputClass(!!errors.email, "pl-10 pr-3.5")}
            />
          </div>
          <ErrorMessage message={errors.email} />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="phone">
            Phone Number
          </label>
          <div className={`relative flex rounded-xl shadow-sm ${errors.phone ? "ring-1 ring-red-400 rounded-xl" : ""}`}>
            <div className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-600 text-xs font-medium space-x-1 select-none">
              <span>🇻🇳</span>
              <span className="font-semibold">+84</span>
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="912 345 678"
              value={formData.phone}
              onChange={handleChange}
              className={`block w-full rounded-r-xl border py-2.5 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
                errors.phone
                  ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                  : "border-slate-200 focus:ring-brand-600 focus:border-brand-600"
              }`}
            />
          </div>
          <ErrorMessage message={errors.phone} />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="password">
            Password
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              className={inputClass(!!errors.password, "pl-10 pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
          <ErrorMessage message={errors.password} />

          {/* Password Strength */}
          {formData.password && strength && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 font-medium">Password strength</span>
                <span className={`text-[11px] font-semibold ${strengthTextColor[strength.level]}`}>
                  {strength.level}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={`rounded-full h-full transition-all duration-300 ${bar <= strength.filled ? strength.color : "bg-slate-200"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={inputClass(!!errors.confirmPassword, "pl-10 pr-10")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>
          <ErrorMessage message={errors.confirmPassword} />
        </div>

        {/* Terms Checkbox */}
        <div>
          <div className="flex items-start pt-1">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-slate-300 rounded cursor-pointer"
              />
            </div>
            <div className="ml-2.5 text-xs text-slate-600 leading-normal">
              <label className="cursor-pointer" htmlFor="terms">
                I agree to MarketPulse's{" "}
                <a href="#" className="font-semibold text-brand-700 hover:text-brand-800 underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-brand-700 hover:text-brand-800 underline">Privacy Policy</a>
              </label>
            </div>
          </div>
          <ErrorMessage message={errors.terms} />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl shadow-md bg-brand-700 hover:bg-brand-800 disabled:opacity-60 disabled:cursor-not-allowed focus:ring-4 focus:ring-brand-100 text-white font-semibold text-sm transition-all duration-150 transform active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Links */}
      <div className="mt-7 text-center space-y-4">
        <p className="text-xs sm:text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
            Sign In
          </Link>
        </p>
        {/* Trust Badges */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
          <span>256-bit SSL Encrypted</span>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition">Privacy Policy</a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition">Terms of Service</a>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
