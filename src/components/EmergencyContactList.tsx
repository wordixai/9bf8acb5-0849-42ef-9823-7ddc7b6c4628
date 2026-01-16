import { useState } from 'react';
import { UserPlus, X, Mail, User } from 'lucide-react';
import { EmergencyContact } from '../types';

interface EmergencyContactListProps {
  contacts: EmergencyContact[];
  onAdd: (name: string, email: string) => void;
  onRemove: (id: string) => void;
}

export const EmergencyContactList = ({ contacts, onAdd, onRemove }: EmergencyContactListProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onAdd(name.trim(), email.trim());
      setName('');
      setEmail('');
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-card rounded-xl p-6 shadow-lg animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">紧急联系人</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-secondary/50 rounded-lg space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              添加
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setName('');
                setEmail('');
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {contacts.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          还没有添加紧急联系人
        </p>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg group"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{contact.name}</p>
                <p className="text-sm text-muted-foreground truncate">{contact.email}</p>
              </div>
              <button
                onClick={() => onRemove(contact.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
        如果连续48小时未签到，系统将自动发送邮件通知以上联系人
      </p>
    </div>
  );
};
