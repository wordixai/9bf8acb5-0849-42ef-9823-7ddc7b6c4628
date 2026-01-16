import { Heart } from 'lucide-react';

interface CheckInButtonProps {
  onCheckIn: () => void;
  status: 'never' | 'safe' | 'warning' | 'danger';
}

export const CheckInButton = ({ onCheckIn, status }: CheckInButtonProps) => {
  const getButtonStyles = () => {
    switch (status) {
      case 'safe':
        return 'bg-success hover:bg-success/90 shadow-[0_0_30px_hsl(142_70%_45%/0.4)]';
      case 'warning':
        return 'bg-warning hover:bg-warning/90 shadow-[0_0_30px_hsl(38_92%_50%/0.4)]';
      case 'danger':
        return 'bg-destructive hover:bg-destructive/90 shadow-[0_0_30px_hsl(0_72%_51%/0.4)] animate-pulse';
      default:
        return 'bg-primary hover:bg-primary/90 shadow-[0_0_30px_hsl(16_85%_60%/0.4)]';
    }
  };

  return (
    <button
      onClick={onCheckIn}
      className={`
        relative w-48 h-48 rounded-full
        flex flex-col items-center justify-center gap-3
        text-primary-foreground font-bold text-xl
        transition-all duration-300 ease-out
        hover:scale-105 active:scale-95
        ${getButtonStyles()}
        ${status === 'safe' ? 'animate-pulse-glow' : ''}
      `}
    >
      <Heart
        className={`w-16 h-16 ${status !== 'danger' ? 'animate-heartbeat' : ''}`}
        fill="currentColor"
      />
      <span className="text-lg font-semibold">
        {status === 'never' ? '首次签到' : '我还活着'}
      </span>
    </button>
  );
};
