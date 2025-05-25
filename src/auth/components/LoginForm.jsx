import React, { useContext, useState } from "react";
import UserContext from "../contexts/UserContext";
import { useForm } from "../../hooks/useForm";
import { useNavigate } from "react-router-dom";
import { SpotifyAuthButton } from "./SpotifyAuthButton";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

const initialForm = {
  email: "",
  password: "",
};

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithEmail } = useContext(UserContext);

  const { email, password, onInputChange } = useForm(initialForm);

  const handleGoogleLogin = async () => {
    const success = await loginWithGoogle();
    if (success) navigate("/");
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const success = await loginWithEmail(formData.email, formData.password);
    if (success) navigate("/");
  };

  // const onLoginUser = async (e) => {
  //   e.preventDefault();
  //   await login({ email, password });
  //   navigate("/", { replace: true });
  // };

  return (
    <>
      <form onSubmit={handleEmailLogin} className="space-y-6">
        <div>
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onInputChange}
              placeholder="nombre@correo.com"
              className="bg-[#1E1E3F] border border-gray-600 text-white text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 block w-full p-2.5"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-300"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onInputChange}
              placeholder="••••••••"
              className="bg-[#1E1E3F] border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              required
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-blue-500 text-white py-2 px-4 rounded-md text-sm font-semibold hover:opacity-90 transition"
          >
            Iniciar sesión
          </button>
        </div>
      </form>
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#11112B] text-gray-400">
              Continuar con
            </span>
          </div>
        </div>
        <div className="mt-4">
          <SpotifyAuthButton />
        </div>
        <div className="mt-4">
          <button
            onClick={handleGoogleLogin}
            className="flex w-full justify-center rounded-md bg-red-700 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-red-600 mt-4"
          >
            Continuar con Google
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
