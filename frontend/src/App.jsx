import { useEffect, useMemo, useState } from "react";
import {
  Sprout, CalendarDays, MapPin, LogOut, LayoutDashboard, ClipboardList,
  Users, Building2, CheckCircle2, Clock3, Wheat, ShieldCheck, ArrowRight,
  XCircle, Menu, X, Leaf, Phone, Truck, BarChart3
} from "lucide-react";
import { api } from "./api";

const demoFarmer = { email: "farmer@example.com", password: "farmer123" };
const demoAdmin = { email: "admin@example.com", password: "admin123" };

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("krishisahayak_user") || "null"));
  const [view, setView] = useState("home");
  const [toast, setToast] = useState(null);

  const notify = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const login = (newUser) => {
    setUser(newUser);
    localStorage.setItem("krishisahayak_user", JSON.stringify(newUser));
    setView(newUser.role === "admin" ? "admin" : "dashboard");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("krishisahayak_user");
    setView("home");
  };

  return (
    <div className="app">
      <Header user={user} view={view} setView={setView} logout={logout} />
      {toast && <div className={`toast ${toast.type}`}>{toast.type === "success" ? <CheckCircle2 size={18}/> : <XCircle size={18}/>} {toast.message}</div>}

      {!user ? (
        view === "login" ? (
          <LoginPage onLogin={login} setView={setView} notify={notify} />
        ) : view === "register" ? (
          <RegisterPage onLogin={login} setView={setView} notify={notify} />
        ) : (
          <Home setView={setView} />
        )
      ) : user.role === "admin" ? (
        <AdminDashboard user={user} setView={setView} notify={notify} />
      ) : (
        <>
          {view === "dashboard" && <FarmerDashboard user={user} setView={setView} />}
          {view === "slots" && <SlotBooking user={user} notify={notify} />}
          {view === "bookings" && <MyBookings user={user} notify={notify} />}
          {view === "profile" && <Profile user={user} />}
        </>
      )}

      <Footer />
    </div>
  );
}

function Header({ user, view, setView, logout }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="header">
      <div className="container nav">
        <button className="brand" onClick={() => {setView(user ? (user.role === "admin" ? "admin" : "dashboard") : "home"); setOpen(false);}}>
          <span className="brand-icon"><Sprout size={23}/></span>
          <span><strong>Krishi Sahayak</strong><small>Farmer Procurement</small></span>
        </button>

        <button className="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button>

        <nav className={open ? "nav-links open" : "nav-links"}>
          {!user ? (
            <>
              <button onClick={() => {setView("home"); setOpen(false)}}>Home</button>
              <button className="nav-login" onClick={() => {setView("login"); setOpen(false)}}>Login</button>
              <button className="primary small" onClick={() => {setView("register"); setOpen(false)}}>Register</button>
            </>
          ) : user.role === "admin" ? (
            <>
              <button className={view === "admin" ? "active" : ""} onClick={() => {setView("admin"); setOpen(false)}}>Dashboard</button>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <button className={view === "dashboard" ? "active" : ""} onClick={() => {setView("dashboard"); setOpen(false)}}>Dashboard</button>
              <button className={view === "slots" ? "active" : ""} onClick={() => {setView("slots"); setOpen(false)}}>Book Slot</button>
              <button className={view === "bookings" ? "active" : ""} onClick={() => {setView("bookings"); setOpen(false)}}>My Bookings</button>
              <button className={view === "profile" ? "active" : ""} onClick={() => {setView("profile"); setOpen(false)}}>Profile</button>
              <button className="logout" onClick={logout}><LogOut size={16}/> Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Home({ setView }) {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow"><Leaf size={16}/> Digital procurement made simple</div>
            <h1>Sell your harvest with <span>less waiting.</span></h1>
            <p className="hero-copy">Krishi Sahayak helps farmers find procurement centres, reserve time slots, and track their harvest deliveries from one simple platform.</p>
            <div className="hero-actions">
              <button className="primary large" onClick={() => setView("register")}>Start Booking <ArrowRight size={19}/></button>
              <button className="secondary large" onClick={() => setView("login")}>I already have an account</button>
            </div>
            <div className="trust-row">
              <span><CheckCircle2 size={17}/> No long queues</span>
              <span><CheckCircle2 size={17}/> Slot confirmation</span>
              <span><CheckCircle2 size={17}/> Simple dashboard</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="sun"></div>
            <div className="field-card">
              <div className="field-top"><span className="status-dot"></span> Next available slot</div>
              <h3>Bankura Central Centre</h3>
              <div className="slot-highlight"><CalendarDays/><div><strong>10 September 2026</strong><span>09:00 AM · Paddy</span></div></div>
              <div className="capacity"><div><span>12 slots left</span><span>40% booked</span></div><div className="progress"><i style={{width:"40%"}}></i></div></div>
              <button className="primary full" onClick={() => setView("register")}>Reserve your slot</button>
            </div>
            <div className="crop crop1">🌾</div><div className="crop crop2">🌱</div><div className="crop crop3">🌾</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head center"><span className="eyebrow">How it works</span><h2>From harvest to procurement centre in 3 steps</h2><p>Designed for farmers first, with clear information at every step.</p></div>
          <div className="steps">
            <Step n="01" icon={<Users/>} title="Create your profile" text="Register your basic farmer details once and keep them ready for every booking." />
            <Step n="02" icon={<CalendarDays/>} title="Choose a slot" text="Compare centres, dates and available capacity before selecting a convenient slot." />
            <Step n="03" icon={<Truck/>} title="Arrive & procure" text="Bring your booking reference to the centre and reduce unnecessary waiting." />
          </div>
        </div>
      </section>

      <section className="section tinted">
        <div className="container feature-grid">
          <div><span className="eyebrow">Built for rural workflows</span><h2>Simple enough to use on a phone.</h2><p>Large buttons, readable cards and straightforward steps keep the most important actions easy to find.</p><ul className="check-list"><li><CheckCircle2/> Centre-wise slot availability</li><li><CheckCircle2/> Booking history and status</li><li><CheckCircle2/> Admin overview for capacity</li><li><CheckCircle2/> Mobile-friendly responsive design</li></ul></div>
          <div className="mini-dashboard">
            <div className="mini-header"><span>Today's procurement</span><BarChart3/></div>
            <div className="mini-number">68 <small>bookings</small></div>
            <div className="bars"><i style={{height:"48%"}}></i><i style={{height:"68%"}}></i><i style={{height:"55%"}}></i><i style={{height:"82%"}}></i><i style={{height:"70%"}}></i><i style={{height:"91%"}}></i><i style={{height:"62%"}}></i></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({n, icon, title, text}) {
  return <div className="step"><div className="step-number">{n}</div><div className="icon-box">{icon}</div><h3>{title}</h3><p>{text}</p></div>
}

function LoginPage({ onLogin, setView, notify }) {
  const [form, setForm] = useState(demoFarmer);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const data = await api.login(form); onLogin(data.user); }
    catch (e) { notify(e.message, "error"); }
    finally { setLoading(false); }
  };

  return <main className="auth-page"><div className="auth-card">
    <div className="auth-brand"><span className="brand-icon"><Sprout/></span><div><strong>Welcome back</strong><small>Sign in to Krishi Sahayak</small></div></div>
    <form onSubmit={submit}>
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /></label>
      <button className="primary full large" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
    </form>
    <div className="demo-box"><strong>Demo accounts</strong><span>Farmer: farmer@example.com / farmer123</span><span>Admin: admin@example.com / admin123</span></div>
    <p className="auth-switch">New farmer? <button onClick={()=>setView("register")}>Create an account</button></p>
  </div></main>
}

function RegisterPage({ onLogin, setView, notify }) {
  const [form, setForm] = useState({name:"",email:"",password:"",phone:"",village:"",land:""});
  const [loading,setLoading]=useState(false);
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { const data=await api.register(form); onLogin(data.user); }
    catch(e){notify(e.message,"error")} finally{setLoading(false)}
  };
  return <main className="auth-page"><div className="auth-card wide">
    <div className="auth-brand"><span className="brand-icon"><Sprout/></span><div><strong>Create your farmer account</strong><small>It takes less than a minute</small></div></div>
    <form className="form-grid" onSubmit={submit}>
      <label>Full name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/></label>
      <label>Mobile number<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="10-digit number"/></label>
      <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></label>
      <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength="6" required/></label>
      <label>Village / locality<input value={form.village} onChange={e=>setForm({...form,village:e.target.value})}/></label>
      <label>Land holding<input value={form.land} onChange={e=>setForm({...form,land:e.target.value})} placeholder="e.g. 2.5 acres"/></label>
      <button className="primary full large span-2" disabled={loading}>{loading?"Creating account...":"Create account"}</button>
    </form>
    <p className="auth-switch">Already registered? <button onClick={()=>setView("login")}>Sign in</button></p>
  </div></main>
}

function FarmerDashboard({ user, setView }) {
  const [bookings,setBookings]=useState([]);
  useEffect(()=>{api.bookings(user.id).then(setBookings).catch(()=>{})},[user.id]);
  const active=bookings.filter(b=>b.status!=="Cancelled");
  return <main className="dashboard-page"><div className="container">
    <div className="page-title"><div><span className="eyebrow">Farmer dashboard</span><h1>Good day, {user.name.split(" ")[0]} 👋</h1><p>Manage your procurement journey from one place.</p></div><button className="primary" onClick={()=>setView("slots")}><CalendarDays size={18}/> Book a slot</button></div>
    <div className="stats-grid"><Stat icon={<CalendarDays/>} label="Active bookings" value={active.length}/><Stat icon={<CheckCircle2/>} label="Confirmed" value={active.filter(b=>b.status==="Confirmed").length}/><Stat icon={<Wheat/>} label="Total quantity" value={`${active.reduce((a,b)=>a+Number(b.quantity),0)} kg`}/><Stat icon={<MapPin/>} label="Centre network" value="3"/></div>
    <div className="dashboard-grid">
      <div className="panel"><div className="panel-head"><div><h2>Upcoming booking</h2><p>Your next procurement visit</p></div><button className="text-btn" onClick={()=>setView("bookings")}>View all</button></div>
      {active[0] ? <BookingCard booking={active[0]} compact/> : <EmptyState title="No upcoming bookings" text="Choose an available procurement slot to get started." action="Find a slot" onClick={()=>setView("slots")}/>}</div>
      <div className="panel profile-summary"><div className="avatar">{user.name.charAt(0)}</div><h3>{user.name}</h3><p>{user.village || "Village not added"}</p><div className="profile-line"><Phone size={16}/> {user.phone || "Phone not added"}</div><div className="profile-line"><ShieldCheck size={16}/> Farmer account</div><button className="secondary full" onClick={()=>setView("profile")}>View profile</button></div>
    </div>
  </div></main>
}

function Stat({icon,label,value}){return <div className="stat-card"><div className="stat-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong></div></div>}

function SlotBooking({ user, notify }) {
  const [centers,setCenters]=useState([]), [slots,setSlots]=useState([]), [centerId,setCenterId]=useState(""), [crop,setCrop]=useState("Paddy"), [quantity,setQuantity]=useState("500"), [loading,setLoading]=useState(false);
  const load=()=>api.slots(`crop=${encodeURIComponent(crop)}${centerId?`&centerId=${centerId}`:""}`).then(setSlots).catch(e=>notify(e.message,"error"));
  useEffect(()=>{api.centers().then(setCenters)},[]);
  useEffect(()=>{load()},[crop,centerId]);

  const book=async(slot)=>{
    setLoading(slot.id);
    try { await api.book({userId:user.id,slotId:slot.id,crop,quantity}); notify("Slot booked successfully!"); load(); }
    catch(e){notify(e.message,"error")} finally{setLoading(false)}
  };
  return <main className="dashboard-page"><div className="container">
    <div className="page-title"><div><span className="eyebrow">Procurement slots</span><h1>Choose a convenient slot</h1><p>Compare available capacity before you book.</p></div></div>
    <div className="filter-bar">
      <label>Crop<select value={crop} onChange={e=>setCrop(e.target.value)}><option>Paddy</option><option>Wheat</option><option>Maize</option><option>Potato</option></select></label>
      <label>Centre<select value={centerId} onChange={e=>setCenterId(e.target.value)}><option value="">All centres</option>{centers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Quantity (kg)<input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label>
    </div>
    <div className="slot-grid">{slots.map(slot=><SlotCard key={slot.id} slot={slot} quantity={quantity} book={book} loading={loading===slot.id}/>)}</div>
    {!slots.length && <EmptyState title="No matching slots" text="Try another crop or procurement centre."/>}
  </div></main>
}

function SlotCard({slot,quantity,book,loading}) {
  const remaining=slot.capacity-slot.booked, full=remaining<=0;
  return <div className="slot-card"><div className="slot-date"><CalendarDays size={20}/><div><strong>{new Date(slot.date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</strong><span>{slot.time}</span></div></div>
    <div className="slot-info"><div className="crop-tag"><Wheat size={15}/> {slot.crop}</div><h3>{slot.center?.name}</h3><p><MapPin size={15}/> {slot.center?.location}</p></div>
    <div className="slot-cap"><div><span>{remaining} slots remaining</span><span>{slot.booked}/{slot.capacity}</span></div><div className="progress"><i style={{width:`${Math.min(100,(slot.booked/slot.capacity)*100)}%`}}/></div></div>
    <button className="primary full" disabled={full||loading} onClick={()=>book(slot)}>{loading?"Booking...":full?"Slot full":"Book this slot"}</button>
  </div>
}

function MyBookings({user,notify}) {
  const [bookings,setBookings]=useState([]);
  const load=()=>api.bookings(user.id).then(setBookings).catch(e=>notify(e.message,"error"));
  useEffect(load,[user.id]);
  const cancel=async(id)=>{try{await api.cancel(id);notify("Booking cancelled");load()}catch(e){notify(e.message,"error")}};
  return <main className="dashboard-page"><div className="container"><div className="page-title"><div><span className="eyebrow">Your records</span><h1>My bookings</h1><p>Keep track of your confirmed procurement visits.</p></div></div>
    <div className="booking-list">{bookings.map(b=><BookingCard key={b.id} booking={b} onCancel={cancel}/>)}</div>
    {!bookings.length&&<EmptyState title="No bookings yet" text="Your confirmed procurement slots will appear here."/>}
  </div></main>
}

function BookingCard({booking,onCancel,compact=false}) {
  return <div className={`booking-card ${compact?"compact":""}`}><div className="booking-main"><div className="booking-icon"><CalendarDays/></div><div><div className="booking-ref">Booking #{booking.id}</div><h3>{booking.center?.name}</h3><p>{new Date(booking.slot?.date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})} · {booking.slot?.time}</p></div></div>
    <div className="booking-meta"><div><span>Crop</span><strong>{booking.crop}</strong></div><div><span>Quantity</span><strong>{booking.quantity} kg</strong></div><div><span>Status</span><b className={booking.status==="Cancelled"?"badge cancelled":"badge"}>{booking.status}</b></div></div>
    {onCancel && booking.status!=="Cancelled" && <button className="danger-btn" onClick={()=>onCancel(booking.id)}>Cancel</button>}
  </div>
}

function Profile({user}) {
  return <main className="dashboard-page"><div className="container"><div className="page-title"><div><span className="eyebrow">Account</span><h1>My profile</h1><p>Your registered farmer information.</p></div></div>
    <div className="profile-card"><div className="avatar large-avatar">{user.name.charAt(0)}</div><div className="profile-details"><h2>{user.name}</h2><span className="badge">Verified farmer profile</span><div className="detail-grid"><Detail label="Email" value={user.email}/><Detail label="Mobile" value={user.phone||"—"}/><Detail label="Village" value={user.village||"—"}/><Detail label="Land holding" value={user.land||"—"}/></div></div></div>
  </div></main>
}
function Detail({label,value}){return <div><span>{label}</span><strong>{value}</strong></div>}

function AdminDashboard({user,notify}) {
  const [stats,setStats]=useState(null), [slots,setSlots]=useState([]), [centers,setCenters]=useState([]);
  useEffect(()=>{api.stats().then(setStats);api.slots().then(setSlots);api.centers().then(setCenters)},[]);
  return <main className="dashboard-page"><div className="container"><div className="page-title"><div><span className="eyebrow">Administration</span><h1>Procurement overview</h1><p>Monitor farmer demand and slot capacity.</p></div><div className="admin-pill"><ShieldCheck size={17}/> Admin mode</div></div>
    <div className="stats-grid">{stats&&<><Stat icon={<Users/>} label="Registered farmers" value={stats.farmers}/><Stat icon={<Building2/>} label="Procurement centres" value={stats.centers}/><Stat icon={<CalendarDays/>} label="Total slots" value={stats.slots}/><Stat icon={<ClipboardList/>} label="Bookings" value={stats.bookings}/></>}</div>
    <div className="dashboard-grid admin-grid"><div className="panel"><div className="panel-head"><div><h2>Slot capacity</h2><p>Current booking pressure across centres</p></div></div><div className="admin-slots">{slots.map(s=><div className="admin-slot" key={s.id}><div><strong>{s.center?.name}</strong><span>{s.date} · {s.time} · {s.crop}</span></div><div className="admin-cap"><b>{s.booked}/{s.capacity}</b><div className="progress"><i style={{width:`${Math.min(100,s.booked/s.capacity*100)}%`}}/></div></div></div>)}</div></div>
      <div className="panel"><div className="panel-head"><div><h2>Centre network</h2><p>Registered procurement locations</p></div></div>{centers.map(c=><div className="center-row" key={c.id}><div className="center-icon"><Building2/></div><div><strong>{c.name}</strong><span>{c.location} · {c.hours}</span></div></div>)}</div>
    </div>
  </div></main>
}

function EmptyState({title,text,action,onClick}){return <div className="empty"><div className="empty-icon"><Leaf/></div><h3>{title}</h3><p>{text}</p>{action&&<button className="primary" onClick={onClick}>{action}</button>}</div>}

function Footer(){return <footer><div className="container footer-inner"><div className="brand"><span className="brand-icon"><Sprout size={20}/></span><span><strong>Krishi Sahayak</strong><small>Digital farmer procurement</small></span></div><span>Hackathon prototype · Built for easy access</span></div></footer>}

export default App;
