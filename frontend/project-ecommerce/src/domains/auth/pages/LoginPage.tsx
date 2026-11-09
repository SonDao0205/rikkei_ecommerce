import "@/shared/styles/login.css";
import LoginHeroPanel from "@/domains/auth/components/LoginHeroPanel";
import LoginForm from "@/domains/auth/components/LoginForm";

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-800 antialiased">
      <LoginHeroPanel />
      <LoginForm />
    </div>
  );
};

export default LoginPage;
