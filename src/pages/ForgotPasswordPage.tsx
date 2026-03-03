import logo from "@/assets/app_logo - Copy.jpeg";
import logo2 from "@/assets/kumss_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/config/api.config";
import { API_ENDPOINTS } from "@/config/api.config";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordValues = z.infer<typeof formSchema>;

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: ForgotPasswordValues) => {
        setIsPending(true);
        setError(null);
        try {
            const res = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.auth.forgotPassword}`,
                { email: values.email },
            );
            const token: string = res.data.token;
            navigate("/reset-password", {
                state: { token, email: values.email },
            });
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
                        "Something went wrong. Please try again.",
                );
            }
        } finally {
            setIsPending(false);
        }
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

            {/* Right Side - Forgot Password Form */}
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
                                    <Mail className="h-7 w-7 text-purple-600" />
                                </div>
                            </div>

                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-purple-950 font-inter">
                                Forgot Password?
                            </h2>
                            <p className="text-sm text-purple-700/80 font-medium">
                                Enter your email address and we'll send you an OTP to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    placeholder="Enter your email address"
                                    type="email"
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                    autoFocus
                                    disabled={isPending}
                                    {...register("email")}
                                    className={`h-11 bg-white/70 border-purple-200/50 px-4 text-sm text-purple-900 placeholder:text-purple-900/40 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all ${errors.email ? "border-red-500 ring-red-500/20" : "hover:border-purple-300 hover:bg-white"}`}
                                />
                                {errors.email && (
                                    <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

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
                                        <span>Sending OTP...</span>
                                    </div>
                                ) : (
                                    "Send OTP"
                                )}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
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

export default ForgotPasswordPage;
