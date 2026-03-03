import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { HardHat, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export const JrEngineerLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await login(values);
      const accessToken = response?.access || response?.key;
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        if (response?.refresh) {
          localStorage.setItem("refresh_token", response.refresh);
        }
        if (response.user) {
          localStorage.setItem("kumss_user", JSON.stringify(response.user));
          localStorage.setItem("kumss_user_id", response.user.id || "");
        }
        // Store accessible colleges for college selector
        if (response.accessible_colleges) {
          localStorage.setItem(
            "jr_accessible_colleges",
            JSON.stringify(response.accessible_colleges)
          );
        }
        if (response.tenant_ids) {
          localStorage.setItem("jr_tenant_ids", JSON.stringify(response.tenant_ids));
        }
        // If user has a single college, set it and skip selector
        if (response.user?.college) {
          localStorage.setItem("kumss_college_id", String(response.user.college));
          navigate("/jr-engineer/projects", { replace: true });
        } else {
          navigate("/jr-engineer/select-college", { replace: true });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-orange-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-[440px] mx-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <HardHat className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Jr Engineer Portal
            </h2>
            <p className="text-sm text-gray-500">
              Sign in to manage your construction projects
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium text-sm">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  type="text"
                  disabled={isLoading}
                  {...register("username")}
                  className={`h-11 bg-white/70 border-amber-200/50 ${errors.username ? "border-red-500" : "hover:border-amber-300"}`}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  disabled={isLoading}
                  {...register("password")}
                  className={`h-11 bg-white/70 border-amber-200/50 ${errors.password ? "border-red-500" : "hover:border-amber-300"}`}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/20"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
