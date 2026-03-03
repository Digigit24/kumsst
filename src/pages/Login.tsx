import logo from "@/assets/app_logo - Copy.jpeg";
import logo2 from "@/assets/kumss_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useLogin";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

const formSchema = z.object({
    username: z.string().min(2, { message: "Username is required" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
});

type LoginFormValues = z.infer<typeof formSchema>;

const LoginPage = () => {
    const loginMutation = useLogin();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = (values: LoginFormValues) => {
        loginMutation.mutate(values);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center lg:grid lg:grid-cols-2 overflow-hidden bg-purple-50 relative">
            {/* Unified Background Decorations - Spanning entire page */}
            <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-purple-100 via-transparent to-transparent opacity-60" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-lavender-100/40 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-10 right-10 w-64 h-64 bg-purple-100/40 rounded-full blur-3xl" />
            </div>

            {/* Left Side - Branding & Aesthetics (desktop only) */}
            <div className="relative hidden lg:flex flex-col items-center justify-center p-6 z-10 h-full">
                <div className="relative z-10 flex flex-col items-center text-center max-w-sm mx-auto space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="flex bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl shadow-purple-900/10 border-4 border-white/50 ring-1 ring-purple-100/50 transform hover:scale-105 transition-all duration-500">
                        <img
                            src={logo}
                            alt="EduSphere Logo"
                            className="h-40 w-auto object-contain drop-shadow-sm"
                        />
                        <img
                            src={logo2}
                            alt="EduSphere Logo"
                            className="h-40 w-auto object-contain drop-shadow-sm"
                        />
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

            {/* Right Side - Login Form */}
            <div className="flex items-center justify-center w-full p-4 sm:p-6 relative z-10 lg:h-full">

                <div className="relative w-full max-w-[440px] animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
                    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6">
                        <div className="text-center space-y-2">
                            {/* Mobile: Both logos side-by-side */}
                            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                                <div className="flex items-center bg-white/90 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg border border-white/60 gap-2">
                                    <img src={logo} alt="App Logo" className="h-16 w-auto object-contain" />
                                    <img src={logo2} alt="KUMSS Logo" className="h-16 w-auto object-contain" />
                                </div>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-purple-950 font-inter">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-purple-700/80 font-medium">
                                Please enter your details to sign in.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-gray-700 font-medium text-sm">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="Enter your username"
                                        type="text"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={loginMutation.isPending}
                                        {...register("username")}
                                        className={`h-11 bg-white/70 border-purple-200/50 px-4 text-sm text-purple-900 placeholder:text-purple-900/40 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all ${errors.username ? "border-red-500 ring-red-500/20" : "hover:border-purple-300 hover:bg-white"}`}
                                    />
                                    {errors.username && (
                                        <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">{errors.username.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-gray-700 font-medium text-sm">Password</Label>
                                        <Link to="/forgot-password" className="text-xs font-medium text-purple-600 hover:text-purple-700 hover:underline transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        placeholder="Enter your password"
                                        type="password"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        disabled={loginMutation.isPending}
                                        {...register("password")}
                                        className={`h-11 bg-white/70 border-purple-200/50 px-4 text-sm text-purple-900 placeholder:text-purple-900/40 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-all ${errors.password ? "border-red-500 ring-red-500/20" : "hover:border-purple-300 hover:bg-white"}`}
                                    />
                                    {errors.password && (
                                        <p className="text-sm font-medium text-red-500 animate-in slide-in-from-top-1">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>

                            {loginMutation.isError && (
                                <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center animate-in fade-in zoom-in-95">
                                    <ShieldCheck className="h-5 w-5 mr-3 flex-shrink-0 text-red-500" />
                                    <span className="font-medium">Invalid username or password. Please try again.</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loginMutation.isPending}
                                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base shadow-lg shadow-purple-600/20 hover:shadow-purple-600/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 rounded-xl"
                            >
                                {loginMutation.isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

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

export default LoginPage;