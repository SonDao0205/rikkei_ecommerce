import type { ReactNode } from "react";

interface AuthLayoutProps {
  heroPanel: ReactNode;
  children: ReactNode;
}

const AuthLayout = ({ heroPanel, children }: AuthLayoutProps) => {
  return (
    <div className="bg-white text-slate-900 min-h-screen antialiased">
      <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
        {/* Left Hero Panel */}
        {heroPanel}

        {/* Right Auth Panel */}
        <section className="lg:col-span-7 xl:col-span-6 bg-white px-6 py-10 sm:px-12 md:px-16 lg:px-14 xl:px-20 flex flex-col justify-center items-center">
          <div className="w-full max-w-[480px]">{children}</div>
        </section>
      </main>
    </div>
  );
};

export default AuthLayout;
