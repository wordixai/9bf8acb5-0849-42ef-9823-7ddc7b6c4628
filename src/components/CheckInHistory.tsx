import { CheckInRecord } from '../types';
import { Calendar } from 'lucide-react';

interface CheckInHistoryProps {
  history: CheckInRecord[];
}

export const CheckInHistory = ({ history }: CheckInHistoryProps) => {
  // Generate last 14 days
  const generateDays = () => {
    const days = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      days.push({
        date: dateStr,
        dayOfWeek: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
        dayOfMonth: date.getDate(),
        hasCheckIn: history.some(r => r.date === dateStr),
        isToday: i === 0,
      });
    }

    return days;
  };

  const days = generateDays();

  return (
    <div className="w-full max-w-sm bg-card rounded-xl p-6 shadow-lg animate-slide-up">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">签到记录</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day.date}
            className={`
              relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm
              transition-all duration-200
              ${day.hasCheckIn
                ? 'bg-success/20 text-success border border-success/30'
                : 'bg-secondary/30 text-muted-foreground'
              }
              ${day.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}
            `}
            title={day.date}
          >
            <span className="text-xs opacity-60">{day.dayOfWeek}</span>
            <span className="font-medium">{day.dayOfMonth}</span>
            {day.hasCheckIn && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-success rounded-full" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/20 border border-success/30" />
          <span>已签到</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-secondary/30" />
          <span>未签到</span>
        </div>
      </div>
    </div>
  );
};
