import { Button } from '@/components/ui/button';
import { Chrome, Facebook } from 'lucide-react';

interface SocialLoginButtonProps {
  provider: 'google' | 'facebook';
  onClick: () => void;
  disabled?: boolean;
}

export function SocialLoginButton({ provider, onClick, disabled }: SocialLoginButtonProps) {
  const isGoogle = provider === 'google';
  
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-3 border-slate-300 hover:bg-slate-50 transition-colors"
      onClick={onClick}
      disabled={disabled}
    >
      {isGoogle ? (
        <>
          <Chrome className="w-5 h-5" />
          <span>Continue with Google</span>
        </>
      ) : (
        <>
          <Facebook className="w-5 h-5 text-blue-600" />
          <span>Continue with Facebook</span>
        </>
      )}
    </Button>
  );
}

