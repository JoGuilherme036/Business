// End-to-end test against `wrangler dev` (local D1 + Durable Object).
const B = 'http://localhost:8787';
let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; console.log('  ✓', msg); } else { fail++; console.log('  ✗', msg); } };
const call = async (path, { method = 'GET', body, token } = {}) => {
  const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
// next Tuesday (shop open, lucas & mateus work)
const d = new Date(Date.now() + 86400000 * 2);
while (d.getUTCDay() !== 2) d.setUTCDate(d.getUTCDate() + 1);
const day = d.toISOString().slice(0, 10);
const booking = (key, extra = {}) => ({ idempotencyKey: key.padEnd(12, 'x'), serviceIds: ['corte-assinatura'], proId: 'lucas', day, time: '15:00', customer: { name: 'Cliente Teste', phone: '(86) 98888-7777' }, ...extra });

console.log('Conta e login');
ok((await call('/api/staff/setup')).body.needed === true, 'primeiro acesso disponível');
ok((await call('/api/staff/setup', { method: 'POST', body: { setupKey: 'errada', username: 'dono', name: 'Dono', password: 'senha1234' } })).status === 401, 'chave de configuração errada é recusada');
ok((await call('/api/staff/setup', { method: 'POST', body: { setupKey: 'chave-teste-123', username: 'dono', name: 'Dono', password: '123' } })).body.error === 'weak_password', 'senha fraca é recusada');
const setup = await call('/api/staff/setup', { method: 'POST', body: { setupKey: 'chave-teste-123', username: 'dono', name: 'Dono', password: 'senha1234' } });
ok(setup.status === 201 && setup.body.user.role === 'admin' && /^[0-9a-f]{64}$/.test(setup.body.token), 'administrador criado com sessão');
ok((await call('/api/staff/setup', { method: 'POST', body: { setupKey: 'chave-teste-123', username: 'outro', name: 'Outro', password: 'senha1234' } })).body.error === 'setup_done', 'primeiro acesso não pode ser repetido');
const admin = setup.body.token;
ok((await call('/api/admin/day?day=' + day)).status === 401, 'agenda da equipe exige login');
ok((await call('/api/admin/day?day=' + day, { token: 'f'.repeat(64) })).status === 401, 'token inventado é recusado');
const created = await call('/api/staff/users', { method: 'POST', token: admin, body: { username: 'lucas', name: 'Lucas', password: 'barba2026', role: 'barbeiro', proId: 'lucas' } });
ok(created.status === 201, 'admin cria acesso de barbeiro');
ok((await call('/api/staff/users', { method: 'POST', token: admin, body: { username: 'LUCAS', name: 'Lucas 2', password: 'barba2026', role: 'barbeiro', proId: null } })).body.error === 'username_taken', 'usuário duplicado é recusado (sem diferenciar maiúsculas)');
ok((await call('/api/staff/login', { method: 'POST', body: { username: 'lucas', password: 'errada1' } })).status === 401, 'senha errada é recusada');
const barberLogin = await call('/api/staff/login', { method: 'POST', body: { username: 'Lucas', password: 'barba2026' } });
ok(barberLogin.status === 200 && barberLogin.body.user.proId === 'lucas', 'barbeiro entra com usuário e senha');
const barber = barberLogin.body.token;
ok((await call('/api/staff/users', { token: barber })).status === 403, 'barbeiro não gerencia acessos');
ok((await call('/api/admin/day?day=' + day, { token: barber })).status === 200, 'barbeiro vê a agenda');
for (let i = 0; i < 4; i++) await call('/api/staff/login', { method: 'POST', body: { username: 'dono', password: 'errada' + i } });
const locked = await call('/api/staff/login', { method: 'POST', body: { username: 'dono', password: 'errada9' } });
ok(locked.body.error === 'locked', 'conta bloqueia após 5 tentativas erradas');
ok((await call('/api/staff/login', { method: 'POST', body: { username: 'dono', password: 'senha1234' } })).body.error === 'locked', 'bloqueio vale mesmo com a senha certa');
ok((await call('/api/staff/me', { token: admin })).status === 200, 'sessão já aberta continua válida');

console.log('Tempo real');
const ws = new WebSocket(B.replace('http', 'ws') + '/api/live');
const messages = [];
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
ws.onmessage = (m) => messages.push({ at: Date.now(), data: m.data });

console.log('Reserva simultânea do mesmo horário');
const t0 = Date.now();
const results = await Promise.all(Array.from({ length: 25 }, (_, i) => call('/api/bookings', { method: 'POST', body: booking('race' + i) })));
const okCount = results.filter((r) => r.status === 201).length;
const taken = results.filter((r) => r.body.error === 'slot_taken').length;
ok(okCount === 1 && taken === 24, `25 pedidos ao mesmo tempo para Lucas às 15:00 → ${okCount} confirmado, ${taken} recusados`);
await new Promise((r) => setTimeout(r, 400));
ok(messages.length >= 1, `aviso em tempo real recebido (${messages.length ? messages[0].at - t0 : '-'} ms após o envio)`);
ok((await call('/api/bookings', { method: 'POST', body: booking('overlap', { time: '15:30' }) })).body.error === 'slot_taken', 'horário que se sobrepõe (15:30) também é recusado');
const anyRes = await Promise.all(Array.from({ length: 10 }, (_, i) => call('/api/bookings', { method: 'POST', body: booking('any' + i, { proId: 'any', time: '17:00' }) })));
const anyOk = anyRes.filter((r) => r.status === 201);
ok(anyOk.length === 2 && new Set(anyOk.map((r) => r.body.proId)).size === 2, `"primeiro disponível" às 17:00 → ${anyOk.length} reservas, uma por barbeiro que trabalha na terça`);
const retry1 = await call('/api/bookings', { method: 'POST', body: booking('idem', { time: '11:00' }) });
const retry2 = await call('/api/bookings', { method: 'POST', body: booking('idem', { time: '11:00' }) });
ok(retry1.body.code && retry1.body.code === retry2.body.code, 'reenvio do mesmo pedido não duplica a reserva');

console.log('Agenda da equipe x site');
const walkin = await call('/api/admin/bookings', { method: 'POST', token: barber, body: booking('walkin', { time: '09:00', customer: { name: 'Encaixe', phone: '' } }) });
ok(walkin.status === 201, 'barbeiro agenda pelo painel (sem telefone)');
ok((await call('/api/bookings', { method: 'POST', body: booking('site9', { time: '09:00' }) })).body.error === 'slot_taken', 'o mesmo horário some do site na hora');
const busy = await call('/api/busy?day=' + day);
ok((busy.body.busy.lucas ?? []).length === 4, 'agenda pública mostra 4 horários ocupados de Lucas, sem dados de clientes');
ok(!JSON.stringify(busy.body).includes('Cliente'), 'endpoint público não expõe nomes de clientes');
const block = await call('/api/admin/blocks', { method: 'POST', token: admin, body: { proId: 'lucas', from: day, to: day, startTime: '12:00', endTime: '13:00', reason: 'Almoço' } });
ok(block.status === 201, 'bloqueio de horário criado');
ok((await call('/api/bookings', { method: 'POST', body: booking('blocked', { time: '12:15' }) })).body.error === 'slot_taken', 'horário bloqueado não aceita reserva');
const code = results.find((r) => r.status === 201).body.code;
ok((await call(`/api/admin/bookings/${code}/status`, { method: 'POST', token: barber, body: { status: 'completed' } })).body.status === 'completed', 'barbeiro conclui atendimento');

console.log('Acessos');
ok((await call(`/api/staff/users/${created.body.id}`, { method: 'PATCH', token: admin, body: { active: false } })).status === 200, 'admin desativa o barbeiro');
ok((await call('/api/admin/day?day=' + day, { token: barber })).status === 401, 'sessão do barbeiro desativado cai na hora');
ok((await call(`/api/staff/users/${setup.body.user.id}`, { method: 'PATCH', token: admin, body: { active: false } })).status === 400, 'admin não consegue se desativar (evita ficar sem acesso)');
ok((await call('/api/staff/logout', { method: 'POST', token: admin })).status === 200 && (await call('/api/staff/me', { token: admin })).status === 401, 'sair encerra a sessão');
ws.close();
console.log(`\n${pass} ok, ${fail} falhas`);
process.exit(fail ? 1 : 0);
