import "../css/register.css";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import RegisterForm from "../components/auth/RegisterForm";
import AuthLayout from "../layout/AuthLayout";

const RegisterPage = () => {
  return (
    <AuthLayout heroPanel={<AuthHeroPanel />}>
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
