import React, { useContext, useState } from "react";
import UserContext from "../contexts/UserContext";
import { useForm } from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";
import { SpotifyAuthButton } from "./SpotifyAuthButton";

const initialForm = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useContext(UserContext);

  const { email, password, onInputChange } = useForm(initialForm);

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) navigate("/");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const success = isRegistering
      ? await registerWithEmail(email, password)
      : await loginWithEmail(email, password);
    if (success) navigate("/");
  };

  return (
    <>
      <form onSubmit={handleEmailSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onInputChange}
            placeholder="nombre@correo.com"
            className="bg-[#1E1E3F] border border-gray-600 text-white text-sm rounded-lg focus:ring-[#2F2F65] focus:border-[#2F2F65] block w-full p-2.5"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={onInputChange}
            placeholder="••••••••"
            className="bg-[#1E1E3F] border border-gray-600 text-white text-sm rounded-lg focus:ring-[#2F2F65] focus:border-[#2F2F65] block w-full p-2.5"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#1E1E3F] border border-gray-600 text-white text-sm rounded-lg hover:border-[#2F2F65] hover:text-[#2F2F65] py-2.5 transition-colors duration-200"
        >
          {isRegistering ? "Registrarse" : "Iniciar sesión"}
        </button>

        <div className="text-center mt-4 text-sm text-gray-400">
          {isRegistering ? (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-[#6C63FF] hover:underline"
              >
                Inicia sesión
              </button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-[#6C63FF] hover:underline"
              >
                Regístrate
              </button>
            </>
          )}
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#11112B] text-gray-400">Continuar con</span>
          </div>
        </div>

        <div className="mt-4">
          <SpotifyAuthButton />
        </div>

        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full justify-center rounded-md bg-[#1E1E3F] border border-gray-600 text-white px-3 py-2 text-sm hover:border-[#6C63FF] hover:text-[#6C63FF] transition-colors"
          >
            Continuar con Google
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
