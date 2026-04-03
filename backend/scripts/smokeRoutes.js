/* eslint-disable no-console */

const baseUrl = process.env.BASE_URL || 'http://localhost:5000';

async function request(path, { method = 'GET', headers, body } = {}) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : null),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return { status: res.status, ok: res.ok, body: json };
}

(async () => {
  const email = `test_${crypto.randomUUID().slice(0, 8)}@example.com`;

  const register = await request('/api/auth/register', {
    method: 'POST',
    body: { name: 'Test User', email, password: 'Passw0rd!123' },
  });

  console.log('REGISTER', register.status, register.body?.user?.email || register.body);
  if (!register.ok) process.exit(2);

  const token = register.body?.token;
  if (!token) {
    console.error('Missing token from register response');
    process.exit(3);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  const list0 = await request('/api/bookmarks', { headers: authHeaders });
  console.log('BOOKMARKS_LIST_0', list0.status, list0.body);

  const add = await request('/api/bookmarks', {
    method: 'POST',
    headers: authHeaders,
    body: { movieId: '550', title: 'Fight Club', poster: 'x', rating: 8.8 },
  });
  console.log('BOOKMARK_ADD', add.status, add.body);

  const list1 = await request('/api/bookmarks', { headers: authHeaders });
  console.log('BOOKMARKS_LIST_1', list1.status, list1.body);

  const setWatched1 = await request('/api/bookmarks/550/watched', {
    method: 'PATCH',
    headers: authHeaders,
    body: { watched: true },
  });
  console.log('BOOKMARK_SET_WATCHED_TRUE', setWatched1.status, setWatched1.body);

  const watchedList1 = await request('/api/bookmarks/watched', { headers: authHeaders });
  console.log('BOOKMARKS_WATCHED_LIST_1', watchedList1.status, watchedList1.body);

  const setWatched0 = await request('/api/bookmarks/550/watched', {
    method: 'PATCH',
    headers: authHeaders,
    body: { watched: false },
  });
  console.log('BOOKMARK_SET_WATCHED_FALSE', setWatched0.status, setWatched0.body);

  const del = await request('/api/bookmarks/550', { method: 'DELETE', headers: authHeaders });
  console.log('BOOKMARK_DELETE', del.status, del.body);

  const list2 = await request('/api/bookmarks', { headers: authHeaders });
  console.log('BOOKMARKS_LIST_2', list2.status, list2.body);

  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
