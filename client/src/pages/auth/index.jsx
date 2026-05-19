import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Background from "../../assets/login2.png";
import Victory from "../../assets/victory.svg";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateLogin = () => {
    if (!email.length) {
      toast.error("Email is Required.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is Required.");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email.length) {
      toast.error("Email is Required.");
      return false;
    }
    if (!password.length) {
      toast.error("Password is Required.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password should be Same.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true },
        );
        if (response.data.user.id) {
          setUserInfo(response.data.user);
          if (response.data.user.profileSetup) {
            navigate("/chat");
          } else {
            navigate("/profile");
          }
        }
      } catch (error) {
        const message =
          error.response?.data || "Login failed. Please try again.";
        toast.error(message);
      }
    }
  };

  const handleSignup = async () => {
    if (validateSignup()) {
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password },
          { withCredentials: true },
        );
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate("/profile");
        }
      } catch (error) {
        const message =
          error.response?.data || "Signup failed. Please try again.";
        toast.error(message);
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-electric-violet/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-deep-indigo/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="h-[80vh] glass-panel w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-[2rem] grid xl:grid-cols-2 z-10 relative">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl tracking-tight text-white">
                Welcome
              </h1>
              <img
                src={Victory}
                alt="Victory Emoji"
                className="h-[80px] ml-4 drop-shadow-2xl"
              />
            </div>
            <p className="font-medium text-center text-neutral-400 mt-2">
              Connect beyond boundaries.
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full border-b border-white/10">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-neutral-400 border-b-2 border-transparent rounded-none w-full data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-electric-violet p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-neutral-400 border-b-2 border-transparent rounded-none w-full data-[state=active]:text-white data-[state=active]:font-semibold data-[state=active]:border-b-electric-violet p-3 transition-all duration-300"
                >
                  Signup
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet focus-visible:border-electric-violet/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showLoginPassword ? "text" : "password"}
                    className="rounded-full p-6 pr-14 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet focus-visible:border-electric-violet/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                <Button
                  className="rounded-full p-6 bg-electric-violet hover:bg-deep-indigo text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-t border-white/20"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5 mt-10" value="signup">
                <Input
                  placeholder="Email"
                  type="email"
                  className="rounded-full p-6 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet focus-visible:border-electric-violet/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="relative">
                  <Input
                    placeholder="Password"
                    type={showSignupPassword ? "text" : "password"}
                    className="rounded-full p-6 pr-14 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet focus-visible:border-electric-violet/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    className="rounded-full p-6 pr-14 bg-black/20 border-white/10 text-white placeholder-neutral-500 focus-visible:ring-1 focus-visible:ring-electric-violet focus-visible:border-electric-violet/50"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
                <Button
                  className="rounded-full p-6 bg-electric-violet hover:bg-deep-indigo text-white font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] border-t border-white/20"
                  onClick={handleSignup}
                >
                  Signup
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center opacity-80 mix-blend-screen pointer-events-none">
          <img
            src={Background}
            alt="background login"
            className="h-[700px] drop-shadow-2xl brightness-75"
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
