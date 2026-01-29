import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Factory, ArrowRight, UserCircle, Megaphone, Bike, Landmark, Building2, Warehouse, ShieldCheck, Lock, User, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';
import { login } from '../api/authApi';

const ROLE_CONFIG = {
  admin: { name: 'Admin Operations', color: '#e11d48', bgColor: 'bg-rose-50', borderColor: 'border-[#e11d48]' },
  warehouse: { name: 'Warehouse Ops', color: '#0891b2', bgColor: 'bg-[#CFFAFE]', borderColor: 'border-[#0891b2]' },
  production: { name: 'Production', color: '#16A34A', bgColor: 'bg-[#F0FDF4]', borderColor: 'border-[#16A34A]' },
  darkstore: { name: 'Darkstore Ops', color: '#1677FF', bgColor: 'bg-[#F0F7FF]', borderColor: 'border-[#1677FF]' },
  rider: { name: 'Rider Fleet', color: '#F97316', bgColor: 'bg-[#FFF7ED]', borderColor: 'border-[#F97316]' },
  vendor: { name: 'Vendor & Supplier', color: '#4F46E5', bgColor: 'bg-[#EEF2FF]', borderColor: 'border-[#4F46E5]' },
  finance: { name: 'Finance', color: '#14B8A6', bgColor: 'bg-[#F0FDFA]', borderColor: 'border-[#14B8A6]' },
  merch: { name: 'Merch & Promo', color: '#7C3AED', bgColor: 'bg-[#F3E8FF]', borderColor: 'border-[#7C3AED]' },
};

export function LoginScreen() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'darkstore' | 'production' | 'merch' | 'rider' | 'finance' | 'vendor' | 'warehouse' | 'admin' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: 'darkstore' | 'production' | 'merch' | 'rider' | 'finance' | 'vendor' | 'warehouse' | 'admin') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // Regular login with role
      const result = await login({ 
        email, 
        password,
        role: selectedRole 
      });
      
<<<<<<< HEAD
      // Verify role matches (admin can access any dashboard)
      if (result.user.role !== selectedRole && result.user.role !== 'admin' && selectedRole !== 'admin') {
=======
      // Verify role matches
      if (result.user.role !== selectedRole && result.user.role !== 'admin') {
>>>>>>> 63b3bc210ee91a70915e036eecbe3c11bfc59f48
        toast.error('You do not have access to this dashboard');
        setIsLoading(false);
        return;
      }
      
<<<<<<< HEAD
      // For admin role, allow access to any dashboard
      const finalRole = result.user.role === 'admin' ? selectedRole : result.user.role;
      
      toast.success(`Welcome to ${ROLE_CONFIG[selectedRole as keyof typeof ROLE_CONFIG]?.name || selectedRole}`);
      navigate(`/dashboard/${finalRole}`);
    } catch (error: any) {
      console.error('Login error:', error);
=======
      toast.success(`Welcome to ${ROLE_CONFIG[selectedRole as keyof typeof ROLE_CONFIG]?.name || selectedRole}`);
      navigate(`/dashboard/${selectedRole}`);
    } catch (error: any) {
>>>>>>> 63b3bc210ee91a70915e036eecbe3c11bfc59f48
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  const roleConfig = selectedRole ? ROLE_CONFIG[selectedRole as keyof typeof ROLE_CONFIG] : null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full overflow-hidden border border-[#E0E0E0] flex flex-col md:flex-row">
        
        {/* Left Side: Role Selection */}
        <div className="w-full md:w-2/3 p-6 md:p-8 bg-[#FAFAFA] md:border-r border-[#E0E0E0] overflow-y-auto max-h-[80vh] custom-scrollbar">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#212121]">Select Department</h1>
            <p className="text-[#757575] text-sm">Choose your operational unit to log in.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Admin */}
            <button
              onClick={() => handleRoleSelect('admin')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'admin' 
                  ? "border-[#e11d48] bg-rose-50 ring-1 ring-[#e11d48]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#e11d48]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'admin' ? "bg-[#e11d48] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#e11d48]"
              )}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'admin' ? "text-[#e11d48]" : "text-[#212121]")}>Admin Operations</h3>
              </div>
            </button>

            {/* Warehouse */}
            <button
              onClick={() => handleRoleSelect('warehouse')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'warehouse' 
                  ? "border-[#0891b2] bg-[#CFFAFE] ring-1 ring-[#0891b2]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#0891b2]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'warehouse' ? "bg-[#0891b2] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#0891b2]"
              )}>
                <Warehouse size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'warehouse' ? "text-[#0891b2]" : "text-[#212121]")}>Warehouse Ops</h3>
              </div>
            </button>

            {/* Production */}
            <button
              onClick={() => handleRoleSelect('production')}
              className={cn(
                "w-full p-4 rounded-lg border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'production' 
                  ? "border-[#16A34A] bg-[#F0FDF4] ring-1 ring-[#16A34A]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#16A34A]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'production' ? "bg-[#16A34A] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#16A34A]"
              )}>
                <Factory size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'production' ? "text-[#16A34A]" : "text-[#212121]")}>Production</h3>
              </div>
            </button>

            {/* Darkstore */}
            <button
              onClick={() => handleRoleSelect('darkstore')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'darkstore' 
                  ? "border-[#1677FF] bg-[#F0F7FF] ring-1 ring-[#1677FF]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#1677FF]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'darkstore' ? "bg-[#1677FF] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#1677FF]"
              )}>
                <Store size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'darkstore' ? "text-[#1677FF]" : "text-[#212121]")}>Darkstore Ops</h3>
              </div>
            </button>

            {/* Rider Fleet */}
            <button
              onClick={() => handleRoleSelect('rider')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'rider' 
                  ? "border-[#F97316] bg-[#FFF7ED] ring-1 ring-[#F97316]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#F97316]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'rider' ? "bg-[#F97316] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#F97316]"
              )}>
                <Bike size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'rider' ? "text-[#F97316]" : "text-[#212121]")}>Rider Fleet</h3>
              </div>
            </button>

            {/* Vendor & Supplier */}
            <button
              onClick={() => handleRoleSelect('vendor')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'vendor' 
                  ? "border-[#4F46E5] bg-[#EEF2FF] ring-1 ring-[#4F46E5]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#4F46E5]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'vendor' ? "bg-[#4F46E5] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#4F46E5]"
              )}>
                <Building2 size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'vendor' ? "text-[#4F46E5]" : "text-[#212121]")}>Vendor & Supplier</h3>
              </div>
            </button>

            {/* Finance */}
            <button
              onClick={() => handleRoleSelect('finance')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'finance' 
                  ? "border-[#14B8A6] bg-[#F0FDFA] ring-1 ring-[#14B8A6]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#14B8A6]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'finance' ? "bg-[#14B8A6] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#14B8A6]"
              )}>
                <Landmark size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'finance' ? "text-[#14B8A6]" : "text-[#212121]")}>Finance</h3>
              </div>
            </button>

            {/* Merch & Promo */}
            <button
              onClick={() => handleRoleSelect('merch')}
              className={cn(
                "w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all hover:shadow-md text-left group",
                selectedRole === 'merch' 
                  ? "border-[#7C3AED] bg-[#F3E8FF] ring-1 ring-[#7C3AED]" 
                  : "border-[#E0E0E0] bg-white hover:border-[#7C3AED]/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                selectedRole === 'merch' ? "bg-[#7C3AED] text-white" : "bg-[#F5F5F5] text-[#757575] group-hover:text-[#7C3AED]"
              )}>
                <Megaphone size={20} />
              </div>
              <div>
                <h3 className={cn("font-bold text-sm", selectedRole === 'merch' ? "text-[#7C3AED]" : "text-[#212121]")}>Merch & Promo</h3>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/3 bg-white p-8 flex flex-col justify-center border-l border-[#E0E0E0]">
          {selectedRole ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-4">
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg transition-colors",
                  selectedRole === 'admin' ? "bg-[#e11d48]" :
                  selectedRole === 'warehouse' ? "bg-[#0891b2]" :
                  selectedRole === 'production' ? "bg-[#16A34A]" :
                  selectedRole === 'darkstore' ? "bg-[#1677FF]" :
                  selectedRole === 'rider' ? "bg-[#F97316]" :
                  selectedRole === 'vendor' ? "bg-[#4F46E5]" :
                  selectedRole === 'finance' ? "bg-[#14B8A6]" : "bg-[#7C3AED]"
                )}>
                  {selectedRole === 'admin' && <ShieldCheck className="text-white w-8 h-8" />}
                  {selectedRole === 'warehouse' && <Warehouse className="text-white w-8 h-8" />}
                  {selectedRole === 'production' && <Factory className="text-white w-8 h-8" />}
                  {selectedRole === 'darkstore' && <Store className="text-white w-8 h-8" />}
                  {selectedRole === 'rider' && <Bike className="text-white w-8 h-8" />}
                  {selectedRole === 'vendor' && <Building2 className="text-white w-8 h-8" />}
                  {selectedRole === 'finance' && <Landmark className="text-white w-8 h-8" />}
                  {selectedRole === 'merch' && <Megaphone className="text-white w-8 h-8" />}
                </div>
                <h2 className="text-2xl font-bold text-[#212121]">
                  {roleConfig?.name || selectedRole}
                </h2>
                <p className="text-sm text-[#757575]">
                  Secure Access Portal
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#757575] uppercase mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[#E0E0E0] focus:border-[#212121] focus:ring-1 focus:ring-[#212121] outline-none transition-all text-sm font-medium"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#757575] uppercase mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3]" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-[#E0E0E0] focus:border-[#212121] focus:ring-1 focus:ring-[#212121] outline-none transition-all text-sm font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#212121] transition-colors focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all text-white shadow-lg",
                    isLoading ? "opacity-70 cursor-wait" : "hover:translate-y-[-1px]",
                    selectedRole === 'admin' ? "bg-[#e11d48] hover:bg-[#be123c]" :
                    selectedRole === 'warehouse' ? "bg-[#0891b2] hover:bg-[#0e7490]" :
                    selectedRole === 'production' ? "bg-[#16A34A] hover:bg-[#15803d]" :
                    selectedRole === 'darkstore' ? "bg-[#1677FF] hover:bg-[#0958d9]" :
                    selectedRole === 'rider' ? "bg-[#F97316] hover:bg-[#c2410c]" :
                    selectedRole === 'vendor' ? "bg-[#4F46E5] hover:bg-[#4338ca]" :
                    selectedRole === 'finance' ? "bg-[#14B8A6] hover:bg-[#0f766e]" : "bg-[#7C3AED] hover:bg-[#6d28d9]"
                  )}
                >
                  {isLoading ? "Authenticating..." : "Login to Dashboard"}
                  {!isLoading && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full opacity-50">
              <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                <UserCircle className="text-[#A3A3A3] w-8 h-8" />
              </div>
              <p className="font-medium text-[#212121]">No Department Selected</p>
              <p className="text-sm text-[#757575]">Please select your role to continue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
