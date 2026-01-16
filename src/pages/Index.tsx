import { useAuth } from '../hooks/useAuth';
import { useCheckIn } from '../hooks/useCheckIn';
import { CheckInButton } from '../components/CheckInButton';
import { StatusDisplay } from '../components/StatusDisplay';
import { EmergencyContactList } from '../components/EmergencyContactList';
import { CheckInHistory } from '../components/CheckInHistory';
import { AuthForm } from '../components/AuthForm';
import { QuickEmailTest } from '../components/QuickEmailTest';
import { Shield, LogOut, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const Index = () => {
  const { user, isAuthenticated, loading: authLoading, signOut } = useAuth();
  const {
    lastCheckIn,
    checkInHistory,
    emergencyContacts,
    checkIn,
    addContact,
    removeContact,
    getStatus,
    loading: dataLoading,
  } = useCheckIn();

  const status = getStatus();

  const handleCheckIn = async () => {
    try {
      await checkIn();
      toast.success('签到成功！', {
        description: '您的状态已更新',
      });
    } catch (error: any) {
      toast.error('签到失败', {
        description: error.message,
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('已退出登录');
    } catch (error: any) {
      toast.error('退出失败', {
        description: error.message,
      });
    }
  };

  const isLoading = authLoading || (isAuthenticated && dataLoading);

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

            {/* User info & logout */}
            {isAuthenticated && user && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  退出
                </button>
              </div>
            )}
          </header>

          {/* Main content */}
          <main className="flex-1 flex flex-col items-center gap-8">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !isAuthenticated ? (
              <div className="flex flex-col gap-8 w-full items-center">
                <QuickEmailTest />
                <div className="text-center text-muted-foreground text-sm">
                  <span>或者</span>
                </div>
                <AuthForm />
              </div>
            ) : (
              <>
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
              </>
            )}
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
