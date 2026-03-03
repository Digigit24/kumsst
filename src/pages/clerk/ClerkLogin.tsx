import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(2, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export const ClerkLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(values);
      const token = res?.access || res?.key;
      if (token) {
        localStorage.setItem("access_token", token);
        if (res?.refresh) localStorage.setItem("refresh_token", res.refresh);
        if (res.user) {
          localStorage.setItem("kumss_user", JSON.stringify(res.user));
          localStorage.setItem("kumss_user_id", res.user.id || "");
        }
        if (res.user?.college) {
          localStorage.setItem("kumss_college_id", String(res.user.college));
          navigate("/clerk/students", { replace: true });
        } else {
          navigate("/clerk/select-college", { replace: true });
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50">
      <div className="w-full max-w-[420px] mx-4">
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <FileText className="h-7 w-7 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Clerk Portal</h2>
            <p className="text-sm text-gray-500">Sign in to manage students & documents</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input {...register("username")} disabled={loading} className={errors.username ? "border-red-500" : ""} />
              {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" {...register("password")} disabled={loading} className={errors.password ? "border-red-500" : ""} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /><span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              {loading ? <div className="flex items-center gap-2"><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</div> : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
