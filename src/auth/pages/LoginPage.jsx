import LoginForm from "../components/LoginForm";

function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col justify-center px-6 py-12 bg-[#11112B]">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
          Music Flow
        </h2>
        <p className="mt-4 text-sm text-gray-400">Inicia sesión en tu cuenta</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
