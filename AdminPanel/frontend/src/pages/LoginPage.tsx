import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { ErrorState } from "../components/ui/ErrorState";

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@anaaj.ai");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (loginError: unknown) {
      const fallback = "Unable to login. Please check your credentials.";
      if (typeof loginError === "object" && loginError && "response" in loginError) {
        const response = (loginError as { response?: { data?: { message?: string } } }).response;
        setError(response?.data?.message ?? fallback);
      } else {
        setError(fallback);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card title="Anaaj.ai Admin Login" description="Sign in to manage users, plans, analytics, and operations.">
          <form className="space-y-4" onSubmit={onSubmit}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <ErrorState message={error} />}
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Login
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

