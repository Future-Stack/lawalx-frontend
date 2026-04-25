'use client';

import { useState } from 'react';
import { Eye, EyeClosed } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLoginMutation } from '@/redux/api/users/authApi';
import { useAppDispatch } from '@/redux/store/hook';
import { setUser } from '@/redux/features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

export default function SupporterLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      console.log("Supporter Login Response:", res);
      if (res.success) {
        const { accessToken, refreshToken } = res.data;

        // Decode role to verify if this is a SUPPORTER
        const decoded: any = jwtDecode(accessToken);
        const role = (decoded.role || "").toUpperCase();

        if (role !== "SUPPORTER") {
          alert("invalid password or email");
          return;
        }

        dispatch(setUser({
          token: accessToken,
          refreshToken
        }));
        router.push('/supporter/overview');
      }
    } catch (error) {
      console.error("Supporter login API call failed:", error);
      alert("invalid password or email");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-navbarBg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="bg-navbarBg border border-border rounded-lg shadow-customShadow overflow-hidden">
            {/* Blue Toggle at Top */}
            <div className="bg-bgBlue p-4 w-fit mt-6 rounded-full text-center mx-auto shadow-customShadow">
              <Image src="/admin/navbar/adminlogo.svg" alt="Logo" width={28} height={28} className="mx-auto" />
            </div>

            {/* Content */}
            <div className="px-10 pt-8 pb-10">
              <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                Tape Supporter Portal
              </h1>
              <p className="text-center text-sm text-gray-600 mt-2 dark:text-white">
                Sign in to access the supporter dashboard
              </p>

              <form onSubmit={handleLogin} className="mt-8 space-y-6">
                {/* Email Field */}
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email address"
                    className="w-full px-4 py-3 bg-navbarBg border border-border rounded-lg text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>

                {/* Password Field */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    className="w-full px-4 py-3 bg-navbarBg border border-border rounded-lg text-gray-700 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeClosed className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-bgBlue hover:bg-blue-500 text-white font-medium py-3.5 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-customShadow disabled:opacity-70"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
