import { useEffect, useState, type FormEvent } from 'react';
import { team } from '@/config/catalog';
import { adminApi } from '@/booking/api';
import { BookingError, type StaffRole, type StaffUser } from '@/booking/types';
import { Icon } from '@/components/ui/Icon';

const field = 'mt-1.5 block w-full rounded-lg border hairline bg-ink px-3.5 py-3 text-ivory focus:border-ivory focus:outline-none';
const btn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] px-4 text-[11.5px] font-semibold uppercase tracking-[0.14em] disabled:opacity-50';
const messages: Partial<Record<string, string>> = {
  username_taken: 'Esse usuário já existe.',
  weak_password: 'A senha precisa de pelo menos 8 caracteres, com letras e números.',
  invalid: 'Confira os dados. Usuário: letras minúsculas, números, ponto, hífen ou sublinhado (3 a 32).',
  unauthorized: 'Senha atual incorreta.',
  forbidden: 'Somente administradores podem fazer isso.',
};
const message = (e: unknown) => (e instanceof BookingError ? messages[e.code] : undefined) ?? 'Não foi possível salvar. Tente de novo.';
const lastLogin = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

/** Admin only: create team accounts, reset passwords, change roles and turn access off. */
export function TeamPanel({ me }: { me: StaffUser }) {
  const [users, setUsers] = useState<StaffUser[] | null>(null);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const load = () =>
    adminApi
      .users()
      .then((u) => (setUsers(u), setError('')))
      .catch((e) => setError(message(e)));
  useEffect(() => {
    load();
  }, []);

  return (
    <main id="conteudo" className="mx-auto max-w-6xl px-4 pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[clamp(1.8rem,5vw,2.6rem)]">Equipe e acessos</h1>
          <p className="mt-1 max-w-xl text-sm text-muted">Cada funcionário entra com o próprio usuário e senha. Desativar um acesso encerra na hora as sessões abertas dele.</p>
        </div>
        <button onClick={() => setAdding(true)} className={`${btn} bg-ivory text-ink`}>
          <Icon name="plus" className="h-4 w-4" /> Novo acesso
        </button>
      </div>
      {error && <p className="mt-5 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm">{error}</p>}
      {adding && <NewUserForm onClose={() => setAdding(false)} onCreated={() => (setAdding(false), load())} />}

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {!users
          ? [0, 1].map((i) => <li key={i} className="h-36 animate-pulse rounded-xl bg-ivory/5" />)
          : users.map((u) => <UserCard key={u.id} user={u} isMe={u.id === me.id} onChanged={load} />)}
      </ul>
    </main>
  );
}

function NewUserForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'barbeiro' as StaffRole, proId: '' });
  const [state, setState] = useState<{ saving: boolean; error?: string }>({ saving: false });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState({ saving: true });
    try {
      await adminApi.createUser({ name: form.name, username: form.username.trim().toLowerCase(), password: form.password, role: form.role, proId: form.proId || null });
      onCreated();
    } catch (err) {
      setState({ saving: false, error: message(err) });
    }
  };
  return (
    <form onSubmit={submit} className="mt-6 grid gap-4 rounded-xl border hairline bg-ink-2 p-5 md:grid-cols-2 md:p-6">
      <p className="eyebrow md:col-span-2">Novo acesso</p>
      <label>
        <span className="text-sm font-medium">Nome</span>
        <input id="new-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={field} required />
      </label>
      <label>
        <span className="text-sm font-medium">Usuário</span>
        <input id="new-username" autoCapitalize="none" spellCheck={false} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={field} placeholder="ex.: mateus" required />
      </label>
      <label>
        <span className="text-sm font-medium">Senha inicial</span>
        <input id="new-password" type="text" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={field} required />
        <span className="mt-1 block text-[12px] text-muted">Mínimo de 8 caracteres, com letras e números. A pessoa pode trocar em "Minha conta".</span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="text-sm font-medium">Perfil</span>
          <select id="new-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })} className={field}>
            <option value="barbeiro">Barbeiro</option>
            <option value="admin">Administrador</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Agenda de</span>
          <select id="new-pro" value={form.proId} onChange={(e) => setForm({ ...form, proId: e.target.value })} className={field}>
            <option value="">Nenhuma</option>
            {team.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>
      </div>
      <div aria-live="polite" className="text-[13px] text-danger md:col-span-2">{state.error}</div>
      <div className="flex gap-2 md:col-span-2">
        <button type="submit" disabled={state.saving} className={`${btn} bg-ivory text-ink`}>{state.saving ? 'Salvando…' : 'Criar acesso'}</button>
        <button type="button" onClick={onClose} className={`${btn} border hairline`}>Cancelar</button>
      </div>
    </form>
  );
}

function UserCard({ user: u, isMe, onChanged }: { user: StaffUser; isMe: boolean; onChanged: () => void }) {
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState('');
  const [state, setState] = useState<{ saving: boolean; error?: string; done?: string }>({ saving: false });
  const save = async (patch: Parameters<typeof adminApi.updateUser>[1], done: string) => {
    setState({ saving: true });
    try {
      await adminApi.updateUser(u.id, patch);
      setState({ saving: false, done });
      setResetting(false);
      setPassword('');
      onChanged();
    } catch (err) {
      setState({ saving: false, error: message(err) });
    }
  };
  const pro = team.find((p) => p.id === u.proId);
  return (
    <li className={`rounded-xl border hairline bg-ink-2 p-5 ${u.active ? '' : 'opacity-60'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl font-bold">
            {u.name} {isMe && <span className="text-[12px] font-normal text-muted">(você)</span>}
          </p>
          <p className="mt-0.5 font-mono text-[12.5px] text-muted">@{u.username}</p>
        </div>
        <span className={`shrink-0 rounded-[3px] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${u.role === 'admin' ? 'bg-ivory text-ink' : 'border hairline'}`}>
          {u.role === 'admin' ? 'Administrador' : 'Barbeiro'}
        </span>
      </div>
      <p className="mt-3 text-[13px] text-muted">
        {pro ? `Agenda de ${pro.name}` : 'Sem agenda própria'} · {u.active ? 'Ativo' : 'Desativado'}
        {u.lastLoginAt ? ` · último acesso ${lastLogin.format(new Date(u.lastLoginAt))}` : ' · nunca entrou'}
      </p>

      {resetting ? (
        <form onSubmit={(e) => (e.preventDefault(), save({ password }, 'Senha redefinida.'))} className="mt-4 flex flex-wrap gap-2">
          <input id={`reset-${u.id}`} aria-label="Nova senha" type="text" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha" className="min-h-11 min-w-0 flex-1 rounded-lg border hairline bg-ink px-3 text-ivory focus:border-ivory focus:outline-none" required />
          <button disabled={state.saving} className={`${btn} bg-ivory text-ink`}>Salvar</button>
          <button type="button" onClick={() => setResetting(false)} className={`${btn} border hairline`}>Cancelar</button>
        </form>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => setResetting(true)} className={`${btn} border hairline`}>Redefinir senha</button>
          {!isMe && (
            <>
              <button disabled={state.saving} onClick={() => save({ role: u.role === 'admin' ? 'barbeiro' : 'admin' }, 'Perfil alterado.')} className={`${btn} border hairline`}>
                {u.role === 'admin' ? 'Tornar barbeiro' : 'Tornar administrador'}
              </button>
              <button disabled={state.saving} onClick={() => save({ active: !u.active }, u.active ? 'Acesso desativado.' : 'Acesso reativado.')} className={`${btn} border hairline ${u.active ? 'hover:border-danger hover:text-danger' : ''}`}>
                {u.active ? 'Desativar' : 'Reativar'}
              </button>
            </>
          )}
        </div>
      )}
      <p aria-live="polite" className={`mt-2 min-h-5 text-[12.5px] ${state.error ? 'text-danger' : 'text-emerald-400'}`}>{state.error ?? state.done}</p>
    </li>
  );
}

/** Any team member: see their account and change their own password. */
export function AccountPanel({ me }: { me: StaffUser; onChange: (u: StaffUser) => void }) {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [state, setState] = useState<{ saving: boolean; error?: string; done?: boolean }>({ saving: false });
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) return setState({ saving: false, error: 'A confirmação não confere com a nova senha.' });
    setState({ saving: true });
    try {
      await adminApi.changePassword(form.current, form.next);
      setForm({ current: '', next: '', confirm: '' });
      setState({ saving: false, done: true });
    } catch (err) {
      setState({ saving: false, error: message(err) });
    }
  };
  return (
    <main id="conteudo" className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 md:grid-cols-[1fr_1.2fr]">
      <div>
        <h1 className="display text-[clamp(1.8rem,5vw,2.6rem)]">Minha conta</h1>
        <dl className="mt-6 divide-y divide-ivory/10 rounded-xl border hairline bg-ink-2 px-5">
          {[
            ['Nome', me.name],
            ['Usuário', `@${me.username}`],
            ['Perfil', me.role === 'admin' ? 'Administrador' : 'Barbeiro'],
            ['Agenda', team.find((p) => p.id === me.proId)?.name ?? 'Sem agenda própria'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3.5 text-sm">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <form onSubmit={submit} className="rounded-xl border hairline bg-ink-2 p-5 md:p-7">
        <p className="eyebrow">Trocar senha</p>
        <p className="mt-2 text-sm text-muted">Ao trocar, os outros aparelhos conectados com a sua conta saem automaticamente.</p>
        {(['current', 'next', 'confirm'] as const).map((k) => (
          <label key={k} className="mt-4 block">
            <span className="text-sm font-medium">{k === 'current' ? 'Senha atual' : k === 'next' ? 'Nova senha' : 'Confirmar nova senha'}</span>
            <input id={`pw-${k}`} type="password" autoComplete={k === 'current' ? 'current-password' : 'new-password'} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} className={field} required />
          </label>
        ))}
        <p aria-live="polite" className={`mt-3 min-h-5 text-[13px] ${state.error ? 'text-danger' : 'text-emerald-400'}`}>{state.error ?? (state.done ? 'Senha alterada.' : '')}</p>
        <button type="submit" disabled={state.saving} className={`${btn} mt-2 w-full bg-ivory text-ink`}>{state.saving ? 'Salvando…' : 'Salvar nova senha'}</button>
      </form>
    </main>
  );
}
