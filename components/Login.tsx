import React, { useState } from 'react';
import { Layers } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for login
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-full bg-white font-sans text-gray-900">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 xl:p-24 animate-fade-in relative bg-white z-10">
        <div className="w-full max-w-sm space-y-8">
            
          {/* Logo Section */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
               <div className="text-indigo-600">
                 <Layers size={48} strokeWidth={2} />
               </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Acadex AI</h1>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
              Empowering India's Educators with a Personalized, AI-Powered Teaching Assistant.
            </p>
          </div>

          {/* Form Section */}
          <div className="pt-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Login</h2>
            <p className="text-sm text-gray-500 mb-6">Enter your email below to login to your account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="m@example.com"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <input
                  type="password"
                  placeholder="Password" 
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                 <div className="flex justify-end">
                  <a href="#" className="text-xs font-medium text-gray-500 hover:text-gray-900">Forgot your password?</a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-700 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Logging in...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            <button
                type="button"
                className="w-full mt-4 bg-white hover:bg-gray-50 text-gray-900 font-medium py-2.5 rounded-lg border border-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
               <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
               Login with Google
            </button>
            
            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account? <a href="#" className="font-semibold text-gray-900 hover:underline">Sign up</a>
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="hidden lg:block w-1/2 relative bg-gray-900 overflow-hidden">
         <img 
           src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
           alt="Forest Path"
           className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 hover:scale-100 transition-transform duration-[20s]"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-12 xl:p-24">
            <h2 className="text-3xl font-bold text-white mb-4">The Educator's Co-pilot</h2>
            <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
               Automate planning, grading, and personalized learning to focus on what truly matters: mentorship and instruction.
            </p>
         </div>
      </div>
    </div>
  );
};