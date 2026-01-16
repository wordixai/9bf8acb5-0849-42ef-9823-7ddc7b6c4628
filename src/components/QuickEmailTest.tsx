import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Send, Loader2, Plus, X, User } from 'lucide-react';
import { toast } from 'sonner';

interface Contact {
  name: string;
  email: string;
}

export const QuickEmailTest = () => {
  const [contacts, setContacts] = useState<Contact[]>([{ name: '', email: '' }]);
  const [userName, setUserName] = useState('');
  const [sending, setSending] = useState(false);

  const addContact = () => {
    if (contacts.length < 5) {
      setContacts([...contacts, { name: '', email: '' }]);
    }
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter((_, i) => i !== index));
    }
  };

  const updateContact = (index: number, field: keyof Contact, value: string) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleSend = async () => {
    const validContacts = contacts.filter(c => c.name && c.email);

    if (validContacts.length === 0) {
      toast.error('请至少填写一个联系人');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-alert-email', {
        body: {
          contacts: validContacts,
          userName: userName || '测试用户',
          lastCheckIn: new Date().toLocaleString('zh-CN'),
        },
      });

      if (error) throw error;

      toast.success('邮件发送成功！', {
        description: `已发送至 ${validContacts.length} 个联系人`,
      });
    } catch (error: any) {
      toast.error('发送失败', {
        description: error.message,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-slide-up">
      <div className="bg-card rounded-2xl p-6 shadow-xl border border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">快速测试邮件</h3>
            <p className="text-sm text-muted-foreground">无需登录，立即发送测试邮件</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* 发送者名称 */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="您的名字（选填）"
              className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* 联系人列表 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">紧急联系人</label>
            {contacts.map((contact, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  placeholder="姓名"
                  className="flex-1 px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                  placeholder="邮箱"
                  className="flex-1 px-3 py-2.5 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {contacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeContact(index)}
                    className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 添加联系人按钮 */}
          {contacts.length < 5 && (
            <button
              type="button"
              onClick={addContact}
              className="w-full py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加联系人
            </button>
          )}

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full py-3 bg-warning text-warning-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                立即发送测试邮件
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
