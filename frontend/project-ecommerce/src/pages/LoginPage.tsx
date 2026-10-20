import "../css/login.css";
import LoginHeroPanel from "../components/auth/LoginHeroPanel";
import LoginForm from "../components/auth/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-800 antialiased">
      <LoginHeroPanel />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
