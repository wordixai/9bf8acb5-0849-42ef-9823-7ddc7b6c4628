import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const AuthForm = () => {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('登录成功');
      } else {
        await signUp(email, password);
        toast.success('注册成功，已自动登录');
      }
    } catch (error: any) {
      toast.error(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-slide-up">
      <div className="bg-card rounded-2xl p-8 shadow-xl border border-border/50">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">{isLogin ? '欢迎回来' : '创建账户'}</h2>
          <p className="text-muted-foreground mt-2">
            {isLogin ? '登录以继续使用' : '注册以开始使用'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="邮箱地址"
              required
              className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              required
              minLength={6}
              className="w-full pl-11 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {isLogin ? '登录' : '注册'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
};
