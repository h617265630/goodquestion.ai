import { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  ChevronRight,
  Sparkles,
  ArrowRight,
  Menu,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User, Question, Comment } from "./types";

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const login = (user: User) => setUser(user);
  const logout = () => {
    fetch("/api/auth/logout", { method: "POST" }).then(() => setUser(null));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// --- Components ---

function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white">
              <Sparkles className="h-6 w-6 text-emerald-400" />
              <span>GoodQuestion</span>
            </Link>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <Link to="/questions" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Explore</Link>
                <Link to="/submit" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Submit</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-400">Hi, {user.username}</span>
                  <button onClick={logout} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm font-medium text-white hover:bg-white/5 transition-colors">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
                  <Link to="/register" className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-emerald-400 transition-colors">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-black"
          >
            <div className="space-y-1 px-2 pb-3 pt-2">
              <Link to="/questions" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">Explore</Link>
              <Link to="/submit" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">Submit</Link>
              {user ? (
                <button onClick={logout} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="block rounded-md px-3 py-2 text-base font-medium text-zinc-400 hover:bg-white/5 hover:text-white">Login</Link>
                  <Link to="/register" className="block rounded-md px-3 py-2 text-base font-medium text-emerald-400 hover:bg-white/5">Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter text-white">
              <Sparkles className="h-6 w-6 text-emerald-400" />
              <span>GoodQuestion</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-zinc-500">
              Curating the best AI prompts and responses to help you master the art of AI interaction.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><Link to="/questions" className="hover:text-white">Explore</Link></li>
              <li><Link to="/submit" className="hover:text-white">Submit Prompt</Link></li>
              <li><Link to="/trending" className="hover:text-white">Trending</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/5 pt-8 text-center text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} GoodQuestion. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

// --- Pages ---

function LandingPage() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-24 sm:mt-32 lg:mt-16"
          >
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold leading-6 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
              What's new
            </span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl"
          >
            Master the art of <span className="text-emerald-400">AI Prompting</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-zinc-400"
          >
            Discover, share, and learn from the most effective AI prompts and their high-quality responses. Elevate your AI game with GoodQuestion.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex items-center gap-x-6"
          >
            <Link to="/questions" className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 transition-all">
              Explore Questions
            </Link>
            <Link to="/register" className="text-sm font-semibold leading-6 text-white flex items-center gap-1 hover:text-emerald-400 transition-colors">
              Join the community <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
              <div className="space-y-4">
                <div className="rounded-lg bg-white/5 p-4">
                  <p className="text-xs font-mono text-emerald-400 mb-2">Prompt:</p>
                  <p className="text-sm text-zinc-300">Explain quantum entanglement using a magic sock analogy...</p>
                </div>
                <div className="rounded-lg bg-emerald-500/5 p-4 border border-emerald-500/10">
                  <p className="text-xs font-mono text-emerald-400 mb-2">Response:</p>
                  <p className="text-sm text-zinc-300 italic">"Imagine you have a pair of magic socks..."</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/questions")
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Explore Questions</h1>
          <p className="mt-2 text-zinc-400 text-sm">Discover high-quality prompts curated by the community.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search prompts..." 
            className="w-full rounded-full border border-white/10 bg-zinc-900/50 py-2 pl-10 pr-4 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 md:w-64"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-zinc-900/50 border border-white/5" />
          ))
        ) : (
          questions.map((q) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="group relative flex flex-col rounded-2xl border border-white/10 bg-zinc-900/30 p-6 transition-all hover:bg-zinc-900/50 hover:border-white/20"
            >
              <Link to={`/questions/${q.id}`} className="absolute inset-0 z-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">{q.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm text-zinc-400 leading-relaxed">{q.content}</p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Heart className="h-3.5 w-3.5" />
                    {q.likes_count}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                    12
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function QuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState<Question | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`/api/questions/${id}`).then((res) => res.json()),
      fetch(`/api/questions/${id}/comments`).then((res) => res.json())
    ]).then(([qData, cData]) => {
      setQuestion(qData);
      setComments(cData);
      setLoading(false);
    });
  }, [id]);

  const handleLike = async () => {
    if (!user) return navigate("/login");
    const res = await fetch(`/api/questions/${id}/like`, { method: "POST" });
    if (res.ok) {
      setQuestion(prev => prev ? { ...prev, likes_count: prev.likes_count + 1 } : null);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    const res = await fetch(`/api/questions/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newComment })
    });
    if (res.ok) {
      const data = await res.json();
      setComments([{ id: data.id, content: newComment, username: user.username, created_at: new Date().toISOString(), question_id: Number(id), user_id: user.id }, ...comments]);
      setNewComment("");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-zinc-500">Loading...</div>;
  if (!question) return <div className="flex h-screen items-center justify-center text-zinc-500">Question not found</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{question.title}</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>By Anonymous</span>
            <span>•</span>
            <span>{new Date(question.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/30 p-8">
          <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-4">The Prompt</h2>
          <div className="prose prose-invert max-w-none text-zinc-300">
            <ReactMarkdown>{question.content}</ReactMarkdown>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8">
          <h2 className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-4">The Response</h2>
          <div className="prose prose-invert max-w-none text-zinc-300 italic">
            <ReactMarkdown>{question.answer}</ReactMarkdown>
          </div>
        </div>

        <div className="flex items-center gap-6 border-y border-white/5 py-6">
          <button onClick={handleLike} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
            <Heart className="h-5 w-5" />
            {question.likes_count} Likes
          </button>
          <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
            <MessageSquare className="h-5 w-5" />
            {comments.length} Comments
          </button>
          <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
            <Bookmark className="h-5 w-5" />
            Save
          </button>
          <button className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors ml-auto">
            <Share2 className="h-5 w-5" />
            Share
          </button>
        </div>

        {/* Comments Section */}
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-white">Comments</h3>
          {user ? (
            <form onSubmit={handleComment} className="space-y-4">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full rounded-xl border border-white/10 bg-zinc-900/50 p-4 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                rows={3}
              />
              <button type="submit" className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors">
                Post Comment
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-white/5 bg-white/5 p-6 text-center">
              <p className="text-sm text-zinc-400">Please <Link to="/login" className="text-emerald-400 hover:underline">login</Link> to join the conversation.</p>
            </div>
          )}

          <div className="space-y-6">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
                  <UserIcon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{c.username}</span>
                    <span className="text-xs text-zinc-600">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      login(data);
      navigate("/questions");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-sm"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-400">Login to your account to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors">
            Sign In
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Don't have an account? <Link to="/register" className="text-emerald-400 hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    if (res.ok) {
      navigate("/login");
    } else {
      setError("Registration failed. Email or username might be taken.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-zinc-900/50 p-8 backdrop-blur-sm"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Create account</h2>
          <p className="mt-2 text-sm text-zinc-400">Join the GoodQuestion community</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors">
            Sign Up
          </button>
        </form>
        <p className="text-center text-sm text-zinc-500">
          Already have an account? <Link to="/login" className="text-emerald-400 hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}

function SubmitPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [answer, setAnswer] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, answer })
    });
    if (res.ok) {
      navigate("/questions");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Submit a Question</h1>
          <p className="mt-2 text-zinc-400 text-sm">Share a great prompt and its AI response with the world.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/10 bg-zinc-900/50 p-8">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Explaining Quantum Physics to a 5-year-old"
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Prompt Content</label>
            <textarea 
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What was the prompt you used?"
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">AI Response</label>
            <textarea 
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="What was the AI's response?"
              className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              rows={6}
            />
          </div>
          <button type="submit" className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors">
            Submit Question
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-zinc-200 selection:bg-emerald-500/30 selection:text-emerald-400">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/questions/:id" element={<QuestionDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/submit" element={<SubmitPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
