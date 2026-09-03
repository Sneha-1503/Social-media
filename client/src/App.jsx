import { useEffect, useState } from 'react';
import { Heart, MessageCircle, LogOut, Plus, UserRound, Send, Search } from 'lucide-react';
import { auth, posts, users } from './api';

const demoUsers = [
  { username: 'ananya', name: 'Ananya Sharma', bio: 'Designer • coffee • travel' },
  { username: 'rahul', name: 'Rahul Verma', bio: 'Building cool things' },
  { username: 'priya', name: 'Priya Singh', bio: 'Books, music & sunsets' }
];

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try { const result = mode === 'login' ? await auth.login({ email: form.email, password: form.password }) : await auth.register(form); onLogin(result.user); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card"><div className="brand">socially<span>.</span></div><p className="muted">Connect, share and discover.</p><h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
    <form onSubmit={submit}>{mode === 'register' && <><label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label><label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} minLength="3" required /></label></>}
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label><label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="8" required /></label>
      {error && <div className="error">{error}</div>}<button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}</button></form>
    <button className="link-button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'New here? Create an account':'Already have an account? Log in'}</button></section></main>;
}

function PostCard({ post, onLike, onComment }) {
  const [text, setText] = useState('');
  const liked = post._liked;
  const submit = async e => { e.preventDefault(); if (!text.trim()) return; await onComment(post._id, text); setText(''); };
  return <article className="post-card"><div className="post-head"><div className="avatar">{post.author?.name?.[0] || 'U'}</div><div><strong>{post.author?.name || 'User'}</strong><span>@{post.author?.username || 'user'}</span></div></div><p className="post-content">{post.content}</p>{post.mediaUrl && <img className="post-media" src={post.mediaUrl} alt="Post media" />}
    <div className="post-actions"><button onClick={()=>onLike(post._id)} className={liked?'active':''}><Heart size={19} fill={liked?'currentColor':'none'}/> {post.likes?.length || 0}</button><span><MessageCircle size={19}/> {post.comments?.length || 0}</span></div>
    <form className="comment-form" onSubmit={submit}><input placeholder="Write a comment…" value={text} onChange={e=>setText(e.target.value)}/><button><Send size={17}/></button></form>
  </article>;
}

function App() {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true); const [items, setItems] = useState([]); const [content, setContent] = useState(''); const [tab, setTab] = useState('home'); const [message, setMessage] = useState('');
  useEffect(()=>{ auth.me().then(r=>setUser(r.user)).catch(()=>{}).finally(()=>setLoading(false)); },[]);
  useEffect(()=>{ if(user) loadPosts(); },[user]);
  const loadPosts = async()=>{ try { const r=await posts.list(); setItems(r.posts.map(p=>({...p,_liked:p.likes?.some(id=>String(id)===String(user?._id||user?.id))}))); } catch(e){setMessage(e.message);} };
  const create = async e=>{e.preventDefault();if(!content.trim())return;try{await posts.create({content});setContent('');await loadPosts();}catch(e){setMessage(e.message)}};
  const like = async id=>{try{const r=await posts.like(id);setItems(xs=>xs.map(p=>p._id===id?{...p,_liked:r.liked,likes:Array(r.likesCount).fill('x')}:p));}catch(e){setMessage(e.message)}};
  const comment = async(id,text)=>{try{const r=await posts.comment(id,text);setItems(xs=>xs.map(p=>p._id===id?{...p,comments:[...(p.comments||[]),r.comment]}:p));}catch(e){setMessage(e.message)}};
  const logout=async()=>{await auth.logout();setUser(null);};
  if(loading)return <div className="loading">Loading socially…</div>;
  if(!user)return <AuthScreen onLogin={setUser}/>;
  return <div className="app"><header className="topbar"><div className="brand">socially<span>.</span></div><div className="search"><Search size={18}/><input placeholder="Search people" /></div><div className="top-user"><div className="avatar small">{user.name?.[0]}</div><strong>{user.name}</strong></div></header>
    <div className="layout"><aside className="sidebar"><button className={tab==='home'?'nav active':''} onClick={()=>setTab('home')}><UserRound size={20}/> Home</button><button className={tab==='discover'?'nav active':''} onClick={()=>setTab('discover')}><Search size={20}/> Discover</button><button className="nav" onClick={logout}><LogOut size={20}/> Log out</button></aside>
      <main className="feed"><div className="welcome"><div><p className="eyebrow">YOUR FEED</p><h1>{tab==='home'?'Good to see you, '+user.name.split(' ')[0]:'Discover people'}</h1></div><button className="primary compact" onClick={()=>document.getElementById('composer')?.focus()}><Plus size={18}/> Create</button></div>
      {message&&<div className="error banner">{message}</div>}{tab==='home'?<><form className="composer" onSubmit={create}><div className="avatar">{user.name?.[0]}</div><div className="composer-body"><textarea id="composer" placeholder="What’s on your mind?" value={content} onChange={e=>setContent(e.target.value)} maxLength="5000"/><div className="composer-bottom"><span>{content.length}/5000</span><button className="primary compact" disabled={!content.trim()}>Post</button></div></div></form>{items.length?items.map(p=><PostCard key={p._id} post={p} onLike={like} onComment={comment}/>):<div className="empty">No posts yet. Be the first to share something.</div>}</>:<div className="discover">{demoUsers.map(u=><div className="person" key={u.username}><div className="avatar">{u.name[0]}</div><div><strong>{u.name}</strong><span>@{u.username}</span><p>{u.bio}</p></div><button className="outline" onClick={async()=>{try{const r=await users.profile(u.username);setMessage(`@${r.user.username} has ${r.user.followersCount} followers.`)}catch(e){setMessage(e.message)}}}>View</button></div>)}</div>}</main>
      <aside className="rightbar"><div className="profile-card"><div className="cover"></div><div className="profile-content"><div className="avatar profile-avatar">{user.name?.[0]}</div><h3>{user.name}</h3><span>@{user.username}</span><p>{user.bio || 'Tell people a little about yourself.'}</p><div className="stats"><div><strong>{user.followers?.length || 0}</strong><span>Followers</span></div><div><strong>{user.following?.length || 0}</strong><span>Following</span></div></div></div></div><div className="tip"><strong>Build your community</strong><p>Follow people you know and join the conversation.</p></div></aside>
    </div></div>;
}
export default App;
