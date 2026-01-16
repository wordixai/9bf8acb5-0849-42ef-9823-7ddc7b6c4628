import { useCheckIn } from '../hooks/useCheckIn';
import { CheckInButton } from '../components/CheckInButton';
import { StatusDisplay } from '../components/StatusDisplay';
import { EmergencyContactList } from '../components/EmergencyContactList';
import { CheckInHistory } from '../components/CheckInHistory';
import { Shield } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const Index = () => {
  const {
    lastCheckIn,
    checkInHistory,
    emergencyContacts,
    checkIn,
    addContact,
    removeContact,
    getStatus,
  } = useCheckIn();

  const status = getStatus();

  const handleCheckIn = () => {
    checkIn();
    toast.success('签到成功！', {
      description: '您的状态已更新',
    });
  };

  return (
    <>
      <Toaster position="top-center" richColors />
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute inset-0 gradient-radial pointer-events-none" />

        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
          {/* Header */}
          <header className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                死了么
              </h1>
            </div>
            <p className="text-muted-foreground">
              每日签到，让关心你的人安心
            </p>
          </header>

          {/* Main content */}
          <main className="flex-1 flex flex-col items-center gap-8">
            {/* Check-in button */}
            <div className="flex flex-col items-center gap-6">
              <CheckInButton onCheckIn={handleCheckIn} status={status} />
              <StatusDisplay lastCheckIn={lastCheckIn} status={status} />
            </div>

            {/* Cards section */}
            <div className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
              <EmergencyContactList
                contacts={emergencyContacts}
                onAdd={addContact}
                onRemove={removeContact}
              />
              <CheckInHistory history={checkInHistory} />
            </div>
          </main>

          {/* Footer */}
          <footer className="text-center py-6 text-muted-foreground text-sm animate-fade-in">
            <p>连续48小时未签到将自动通知紧急联系人</p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default Index;
