import logo from "@/assets/app_logo - Copy.jpeg";
import logo2 from "@/assets/kumss_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api.config";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z
    .object({
        otp: z
            .string()
            .length(6, { message: "OTP must be exactly 6 digits" })
            .regex(/^\d{6}$/, { message: "OTP must contain only digits" }),
        new_password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
        confirm_password: z.string(),
    })
    .refine((data) => data.new_password === data.confirm_password, {
        message: "Passwords do not match",
        path: ["confirm_password"],
    });

type ResetPasswordValues = z.infer<typeof formSchema>;

const RESEND_COOLDOWN = 60;

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { token?: string; email?: string } | null;

    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // Resend OTP timer
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const [isResending, setIsResending] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Token state — may be refreshed on resend
    const [token, setToken] = useState(state?.token || "");
    const email = state?.email || "";

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError: setFormError,
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { otp: "", new_password: "", confirm_password: "" },
    });

    // Start the countdown timer
    const startTimer = useCallback(() => {
        setResendTimer(RESEND_COOLDOWN);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        startTimer();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [startTimer]);

    // Redirect to forgot-password if no token/email
    if (!state?.token || !state?.email) {
        return <Navigate to="/forgot-password" replace />;
    }

    const handleResendOtp = async () => {
        if (resendTimer > 0 || isResending) return;
        setIsResending(true);
        setError(null);
        try {
            const res = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.auth.forgotPassword}`,
                { email },
            );
            setToken(res.data.token);
            startTimer();
            toast.success("A new OTP has been sent to your email.");
        } catch (err: any) {
            if (err.response?.status === 429) {
                setError(
                    err.response.data?.message ||
                        "Too many reset requests. Please wait before trying again.",
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        err.response?.data?.error ||
                        "Failed to resend OTP. Please try again.",
                );
            }
        } finally {
            setIsResending(false);
        }
    };

    const onSubmit = async (values: ResetPasswordValues) => {
        setIsPending(true);
        setError(null);
        setFieldErrors({});
        try {
            await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.auth.resetPassword}`,
                {
                    token,
                    otp: values.otp,
                    new_password: values.new_password,
                    confirm_password: values.confirm_password,
                },
            );
            toast.success("Password reset successfully! Please sign in with your new password.");
            navigate("/login", { replace: true });
        } catch (err: any) {
            const data = err.response?.data;
            if (!data) {
                setError("Something went wrong. Please try again.");
                return;
            }

            // Single error string: { error: "..." }
            if (typeof data.error === "string") {
                setError(data.error);
                return;
            }

            // Field-level validation errors: { new_password: [...], confirm_password: [...] }
            const fErrors: Record<string, string[]> = {};
            let hasFieldErrors = false;
            for (const [key, val] of Object.entries(data)) {
                if (Array.isArray(val) && val.length > 0) {
                    fErrors[key] = val as string[];
                    hasFieldErrors = true;
                }
            }
            if (hasFieldErrors) {
                setFieldErrors(fErrors);
                return;
            }

            // Fallback
            setError(
                data.message || data.detail || "Something went wrong. Please try again.",
            );
        } finally {
            setIsPending(false);
        }
    };

    const formatTimer = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-purple-50 relative">
            {/* Background Decorations */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-100 via-transparent to-transparent opacity-60" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lavender-100/40 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl" />
            </div>

            {/* Left Side - Branding */}
            <div className="relative hidden lg:flex flex-col items-center justify-center p-6 z-10 h-full">
                <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="flex bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-purple-900/10 border-4 border-white/50 ring-1 ring-purple-100/50 transform hover:scale-105 transition-all duration-500">
                        <img src={logo} alt="EduSphere Logo" className="h-40 w-auto object-contain drop-shadow-sm" />
                        <img src={logo2} alt="KUMSS Logo" className="h-40 w-auto object-contain drop-shadow-sm" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl text-purple-950 font-inter">
                            KUMSS EduSphere
                        </h1>
                        <p className="text-lg text-purple-700/80 font-medium max-w-md mx-auto leading-relaxed">
                            Next-Generation Enterprise Resource Planning for Educational Excellence
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Reset Password Form */}
            <div className="flex items-center justify-center p-6 relative z-10 h-full">
                <div className="relative w-full max-w-[440px] animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-8 lg:p-10 space-y-6">
                        <div className="text-center space-y-2">
                            {/* Mobile Logo */}
                            <div className="lg:hidden flex justify-center mb-6">
                                <img src={logo} alt="EduSphere Logo" className="h-20 w-auto" />
                            </div>

                            <div className="flex justify-center mb-4">
                                <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center">
                                    <KeyRound className="h-7 w-7 text-purple-600" />
                                </div>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-purple-950 font-inter">
                                Reset Password
                            </h2>
                            <p className="text-sm text-purple-700/80 font-medium">
                                Enter the 6-digit OTP sent to{" "}
                                <span className="font-semibold text-purple-900">{email}</span>{" "}
                                and set your new password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* OTP */}
                            <div className="space-y-2">
                                <Label htmlFor="otp" className="text-gray-700 font-medium text-sm">
                                    OTP Code
                                </Label>
                                <Input
                                    id="otp"
                                    placeholder="Enter 6-digit OTP"
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoFocus
                                    disabled={isPending}
                                    {...register("otp")}
                                    className={`h-11 bg-white/70 border-purple-200/50 px-4 text-sm text-purple-900 placeholder:text-purple-900/40 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all tracking-[0.3em] text-center font-semibold text-lg ${errors.otp ? "border-red-500 ring-red-500/20" : "hover:border-purple-300 hover:bg-white"}`}
                                />
                                {errors.otp && (
                                    <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">
                                        {errors.otp.message}
                                    </p>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <Label htmlFor="new_password" className="text-gray-700 font-medium text-sm">
                                    New Password
                                </Label>
                                <Input
                                    id="new_password"
                                    placeholder="Enter new password"
                                    type="password"
                                    disabled={isPending}
                                    {...register("new_password")}
                                    className={`h-11 bg-white/70 border-purple-200/50 px-4 text-sm text-purple-900 placeholder:text-purple-900/40 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all ${errors.new_password || fieldErrors.new_password ? "border-red-500 ring-red-500/20" : "hover:border-purple-300 hover:bg-white"}`}
                                />
                                {errors.new_password && (
                                    <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">
                                        {errors.new_password.message}
                                    </p>
                                )}
                                {fieldErrors.new_password?.map((msg, i) => (
                                    <p key={i} className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">
                                        {msg}
                                    </p>
                                ))}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirm_password" className="text-gray-700 font-medium text-sm">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirm_password"
                                    placeholder="Confirm new password"
                                    type="password"
                                    disabled={isPending}
                                    {...register("confirm_password")}
                                    className={`h-11 bg-white/70 border-purple-200/50 px-4 text-sm text-purple-900 placeholder:text-purple-900/40 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all ${errors.confirm_password || fieldErrors.confirm_password ? "border-red-500 ring-red-500/20" : "hover:border-purple-300 hover:bg-white"}`}
                                />
                                {errors.confirm_password && (
                                    <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">
                                        {errors.confirm_password.message}
                                    </p>
                                )}
                                {fieldErrors.confirm_password?.map((msg, i) => (
                                    <p key={i} className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">
                                        {msg}
                                    </p>
                                ))}
                            </div>

                            {/* API error */}
                            {error && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center animate-in fade-in zoom-in-95">
                                    <ShieldCheck className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 rounded-xl"
                            >
                                {isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>

                        {/* Resend OTP */}
                        <div className="text-center text-sm">
                            {resendTimer > 0 ? (
                                <p className="text-purple-700/60">
                                    Resend OTP in{" "}
                                    <span className="font-semibold text-purple-900">
                                        {formatTimer(resendTimer)}
                                    </span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isResending}
                                    className="font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors disabled:opacity-50"
                                >
                                    {isResending ? "Resending..." : "Resend OTP"}
                                </button>
                            )}
                        </div>

                        <div className="text-center">
                            <Link
                                to="/forgot-password"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Try a different email
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-purple-900/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-transparent px-3 text-purple-900/40 font-medium tracking-wider">
                                    Secured by Digitech
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
