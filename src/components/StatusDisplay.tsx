import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StatusDisplayProps {
  lastCheckIn: number | null;
  status: 'never' | 'safe' | 'warning' | 'danger';
}

export const StatusDisplay = ({ lastCheckIn, status }: StatusDisplayProps) => {
  const [timeDisplay, setTimeDisplay] = useState('');

  useEffect(() => {
    const updateTime = () => {
      if (!lastCheckIn) {
        setTimeDisplay('从未签到');
        return;
      }

      const diff = Date.now() - lastCheckIn;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeDisplay(`${hours}小时${minutes}分钟前`);
      } else {
        setTimeDisplay(`${minutes}分钟前`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  const getStatusInfo = () => {
    switch (status) {
      case 'safe':
        return {
          icon: <CheckCircle className="w-6 h-6 text-success" />,
          text: '状态安全',
          subtext: '距离下次提醒还有时间',
          color: 'text-success',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-warning" />,
          text: '请注意签到',
          subtext: '已超过24小时未签到',
          color: 'text-warning',
        };
      case 'danger':
        return {
          icon: <XCircle className="w-6 h-6 text-destructive" />,
          text: '紧急状态',
          subtext: '即将通知紧急联系人',
          color: 'text-destructive',
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-muted-foreground" />,
          text: '开始使用',
          subtext: '点击上方按钮进行首次签到',
          color: 'text-muted-foreground',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const getRemainingTime = () => {
    if (!lastCheckIn || status === 'never') return null;

    const deadline = lastCheckIn + 48 * 60 * 60 * 1000;
    const remaining = deadline - Date.now();

    if (remaining <= 0) return '已超时';

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}小时${minutes}分钟`;
  };

  return (
    <div className="w-full max-w-sm bg-card rounded-xl p-6 shadow-lg animate-slide-up">
      <div className="flex items-center gap-3 mb-4">
        {statusInfo.icon}
        <div>
          <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
          <p className="text-sm text-muted-foreground">{statusInfo.subtext}</p>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-sm">上次签到</span>
          <span className="font-medium">{timeDisplay}</span>
        </div>

        {status !== 'never' && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">距离通知</span>
            <span className={`font-medium ${status === 'danger' ? 'text-destructive' : ''}`}>
              {getRemainingTime()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
