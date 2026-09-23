import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#F5F2F0] flex flex-col items-center py-10 px-4">
      {/* Logo */}
      <div className="mb-8 mt-4">
        <Link href="/" className="flex items-center gap-2">
           <img src="/logo.png" alt="Events Pro AI Logo" className="w-[420px] h-auto object-contain " />
        </Link>
      </div>
      
      {/* Form Container */}
      <div className="w-full max-w-[480px]">
        <RegisterForm />
      </div>
    </div>
  );
}
