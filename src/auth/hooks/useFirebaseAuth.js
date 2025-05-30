import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase/firebase";

export const useFirebaseAuth = () => {
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      toast.error("Error con Google:", error);
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      toast.error("Error con email:", error);
    }
  };

  return { signInWithGoogle, signInWithEmail };
};
