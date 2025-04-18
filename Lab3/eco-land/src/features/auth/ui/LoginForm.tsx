import { useState } from "react";
import { useLogin } from "../model/useLogin";
import styles from "./LoginForm.module.scss";
import { useErrorStore } from "entities/error/useErrorStore";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { error, setError, clearError } = useErrorStore();
  const { mutate, isPending } = useLogin();

  const validateForm = () => {
    if (!username || !password) {
      setError("Please fill out all fields");
      return false;
    }
    clearError();
    return true;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    clearError();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    mutate({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Login</h2>
      <input
        className={styles.input}
        type="text"
        placeholder="Username"
        value={username}
        onChange={handleUsernameChange}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={handlePasswordChange}
      />
      {error && <div className={styles.error}>{error}</div>}{" "}
      <button className={styles.button} type="submit" disabled={isPending}>
        {isPending ? "Loading..." : "Login"}
      </button>
    </form>
  );
};
