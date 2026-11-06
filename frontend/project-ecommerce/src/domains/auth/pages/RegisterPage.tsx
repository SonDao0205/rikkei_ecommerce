import "@/shared/styles/register.css";
import AuthHeroPanel from "@/domains/auth/components/AuthHeroPanel";
import RegisterForm from "@/domains/auth/components/RegisterForm";
import AuthLayout from "@/app/layout/AuthLayout";

const RegisterPage = () => {
  return (
    <AuthLayout heroPanel={<AuthHeroPanel />}>
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
