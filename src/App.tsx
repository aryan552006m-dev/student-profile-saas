import { useState } from 'react'
import './App.css'

type Role = 'student' | 'teacher' | 'admin'

const roleLabels: Record<Role, string> = {
  student: 'Student workspace',
  teacher: 'Faculty workspace',
  admin: 'College admin workspace',
}

const roleNames: Record<Role, string> = {
  student: 'Priya Sharma',
  teacher: 'Alex Kumar',
  admin: 'Meera Nair',
}

const roleNav: Record<Role, string[]> = {
  student: ['Overview', 'My profile', 'Academic records', 'Notifications'],
  teacher: ['Overview', 'My classes', 'Marks entry', 'Analytics'],
  admin: ['Overview', 'Users', 'Assignments', 'College analytics'],
}

const bars = [74, 82, 61, 88, 69, 79, 92, 76, 84, 70, 87, 80]

function App() {
  const [role, setRole] = useState<Role>('teacher')
  const [activeNav, setActiveNav] = useState('Overview')
  const [showPast, setShowPast] = useState(false)
  const name = roleNames[role]
  const initials = name.split(' ').map((part) => part[0]).join('')
  const assignedClasses = showPast
    ? ['CSE 2A · Data Structures', 'CSE 3B · Database Systems', 'CSE 1A · Programming Lab']
    : ['CSE 3B · Database Systems', 'CSE 3A · Web Engineering']

  function changeRole(nextRole: Role) {
    setRole(nextRole)
    setActiveNav('Overview')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">s</span><span>student profile</span></div>
        <div className="workspace"><span className="avatar avatar-teal">{initials}</span><span><strong>{name}</strong><small>{roleLabels[role]}</small></span><span className="chevron">⌄</span></div>
        <nav aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {roleNav[role].map((item, index) => <button className={activeNav === item ? 'nav-item active' : 'nav-item'} key={item} onClick={() => setActiveNav(item)}><span className="nav-icon">{['◒', '▦', '↗', '⌁'][index]}</span>{item}{(item === 'Analytics' || item === 'College analytics') && <span className="nav-badge">New</span>}</button>)}
          <p className="nav-label nav-spacer">Manage</p>
          <button className="nav-item" onClick={() => setActiveNav(role === 'student' ? 'My profile' : 'Users')}><span className="nav-icon">♧</span>{role === 'student' ? 'My documents' : 'Students'}</button>
          <button className="nav-item"><span className="nav-icon">⚙</span>Settings</button>
        </nav>
        <div className="sidebar-bottom"><div className="help-icon">?</div><div><strong>Need a hand?</strong><small>Visit the help center</small></div><span>↗</span></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumb"><span>{roleLabels[role]}</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><div className="role-switcher" aria-label="Preview role"><button className={role === 'student' ? 'selected' : ''} onClick={() => changeRole('student')}>Student</button><button className={role === 'teacher' ? 'selected' : ''} onClick={() => changeRole('teacher')}>Teacher</button><button className={role === 'admin' ? 'selected' : ''} onClick={() => changeRole('admin')}>Admin</button></div><button className="icon-button" aria-label="Notifications">♢<i></i></button><button className="profile-chip"><span className="avatar avatar-orange">{initials}</span><span>{name}</span><span>⌄</span></button></div></header>
        <section className="content-wrap">
          <div className="welcome-row"><div><p className="eyebrow">Monday, September 8, 2025</p><h1>{role === 'student' ? `Welcome back, ${name.split(' ')[0]}.` : role === 'admin' ? 'Good morning, Meera.' : 'Good morning, Alex.'}</h1><p className="subheading">{role === 'student' ? 'Keep your academic record and professional profile up to date.' : role === 'admin' ? 'A clear view of your college operations, all in one place.' : 'Here is what is happening across your assigned classes today.'}</p></div><button className="primary-button">＋ {role === 'student' ? 'Update profile' : role === 'admin' ? 'Import users' : 'Enter marks'}</button></div>
          <RoleStats role={role} />
          {role === 'student' ? <StudentOverview setActiveNav={setActiveNav} /> : <FacultyOverview role={role} bars={bars} assignedClasses={assignedClasses} showPast={showPast} setShowPast={setShowPast} setActiveNav={setActiveNav} />}
        </section>
      </main>
    </div>
  )
}

function RoleStats({ role }: { role: Role }) {
  const stats = role === 'student' ? [['Profile strength', '82%', '↑ 12%', 'since last month'], ['Current CGPA', '8.7', '↑ 0.4', 'this semester'], ['Semesters complete', '05', 'On track', 'for graduation'], ['Unread updates', '03', '2 new', 'this week']] : role === 'admin' ? [['Active students', '1,248', '↑ 8.2%', 'vs last year'], ['Faculty members', '86', '04 new', 'this semester'], ['Classes running', '42', '02 pending', 'assignments'], ['Marksheets ready', '94%', '↑ 6%', 'this month']] : [['Active students', '84', '↑ 8.2%', 'vs last semester'], ['Average performance', '78.4%', '↑ 4.6%', 'vs last semester'], ['Classes assigned', '02', 'Current', 'semester 2025 / 26'], ['Needs attention', '06', '↓ 2 students', 'since last week']]
  return <div className="stats-grid">{stats.map(([label, number, change, detail], index) => <div className="stat-card" key={label}><div className="stat-label">{label} <span className={`stat-dot ${['mint', 'purple', 'orange', 'red'][index]}`}></span></div><div className="stat-number">{number}</div><div className={`stat-foot ${change.startsWith('↑') ? 'positive' : change.startsWith('↓') ? 'warning' : 'neutral'}`}>{change} <span>{detail}</span></div></div>)}</div>
}

function StudentOverview({ setActiveNav }: { setActiveNav: (nav: string) => void }) {
  return <div className="student-grid"><section className="panel profile-panel"><div className="profile-hero"><div className="profile-photo">PS</div><div><p className="eyebrow">Professional profile</p><h2>Priya Sharma</h2><p>CSE · 3rd year · Section A</p></div><button className="select-button" onClick={() => setActiveNav('My profile')}>Edit profile</button></div><div className="profile-progress"><div><strong>82%</strong><span>Profile strength</span></div><div className="progress-track"><i></i></div><small>Add a bio and resume to reach 100%</small></div><div className="profile-links"><span>in LinkedIn connected</span><span>⌘ GitHub connected</span><span>▣ Resume uploaded</span></div></section><section className="panel records-panel"><div className="panel-heading"><div><h2>Academic snapshot</h2><p>Your latest semester results</p></div><button className="text-button" onClick={() => setActiveNav('Academic records')}>View records →</button></div><div className="grade-row"><div className="grade-circle">8.7<small>SGPA</small></div><div><strong>Semester 5</strong><p>Computer Science & Engineering</p><span className="positive">↑ 0.4 from last semester</span></div></div><div className="subject-mini"><span>Database Systems</span><b>92</b><span>Data Structures</span><b>88</b><span>Web Engineering</span><b>84</b></div></section><section className="panel activity-panel"><div className="panel-heading"><div><h2>Notifications</h2><p>Recent college updates</p></div><button className="more-button">•••</button></div><div className="activity-list"><div className="activity-row"><span className="activity-icon green">✓</span><span><strong>Midterm schedule published</strong><small>Examinations office</small></span><time>2h ago</time></div><div className="activity-row"><span className="activity-icon blue">↗</span><span><strong>Placement workshop</strong><small>Career development cell</small></span><time>Yesterday</time></div></div></section><section className="insight-card"><div className="insight-orb">✦</div><p className="eyebrow">Profile tip</p><h2>Make your profile stand out.</h2><p>Add a short bio and your latest project to help faculty and placement teams know your strengths.</p><button className="insight-button" onClick={() => setActiveNav('My profile')}>Complete profile <span>→</span></button></section></div>
}

function FacultyOverview({ role, bars, assignedClasses, showPast, setShowPast, setActiveNav }: { role: Role; bars: number[]; assignedClasses: string[]; showPast: boolean; setShowPast: (value: boolean) => void; setActiveNav: (nav: string) => void }) {
  const isAdmin = role === 'admin'
  const groups = isAdmin ? ['Computer Science · 486 students', 'Information Technology · 392 students', 'Electronics · 370 students'] : assignedClasses
  return <><div className="dashboard-grid"><section className="panel performance-panel"><div className="panel-heading"><div><h2>{isAdmin ? 'College performance' : 'Performance overview'}</h2><p>{isAdmin ? 'Average marks across all departments' : 'Average marks across your assigned subjects'}</p></div><button className="select-button">This semester <span>⌄</span></button></div><div className="chart-area"><div className="y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart"><div className="grid-lines"><i></i><i></i><i></i><i></i><i></i></div><div className="bars">{bars.map((height, index) => <div className="bar-column" key={index}><div className="bar" style={{ height: `${height}%` }}></div><span>{['DS', 'DB', 'OS', 'CN', 'SE', 'AI', 'DS', 'DB', 'OS', 'CN', 'SE', 'AI'][index]}</span></div>)}</div></div></div><div className="chart-legend"><span><i className="legend-dot"></i> Average marks</span><span className="trend">↗ 4.6% from last semester</span></div></section><section className="panel classes-panel"><div className="panel-heading"><div><h2>{isAdmin ? 'Departments' : 'Your classes'}</h2><p>{isAdmin ? 'College-wide academic groups' : 'Scoped to your assignments'}</p></div>{!isAdmin && <button className={showPast ? 'toggle on' : 'toggle'} onClick={() => setShowPast(!showPast)}><span></span>Past</button>}</div><div className="class-list">{groups.map((item, index) => <div className="class-row" key={item}><span className={`class-icon class-${index % 3}`}>{isAdmin ? ['CS', 'IT', 'EC'][index] : ['DS', 'DB', 'PL'][index % 3]}</span><span className="class-name"><strong>{item.split(' · ')[0]}</strong><small>{item.split(' · ')[1]}</small></span><span className="student-count">{isAdmin ? ['486', '392', '370'][index] : [42, 42, 28][index % 3]} <small>students</small></span><span className="row-arrow">›</span></div>)}</div><button className="text-button" onClick={() => setActiveNav(isAdmin ? 'College analytics' : 'My classes')}>View details <span>→</span></button></section></div><div className="lower-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Your latest updates and actions</p></div><button className="more-button">•••</button></div><div className="activity-list"><div className="activity-row"><span className="activity-icon green">✓</span><span><strong>{isAdmin ? 'Semester marksheets processed' : 'Marks submitted'}</strong><small>{isAdmin ? 'CSE department · 184 records' : 'Database Systems · CSE 3B'}</small></span><time>2h ago</time></div><div className="activity-row"><span className="activity-icon blue">↗</span><span><strong>{isAdmin ? 'New faculty accounts imported' : 'Class report exported'}</strong><small>{isAdmin ? '04 teachers added to the directory' : 'Data Structures · CSE 3A'}</small></span><time>Yesterday</time></div></div></section><section className="insight-card"><div className="insight-orb">✦</div><p className="eyebrow">Student insights</p><h2>Your students are trending up.</h2><p>Average performance has grown by 4.6% this semester. Keep the momentum going.</p><button className="insight-button" onClick={() => setActiveNav(isAdmin ? 'College analytics' : 'Analytics')}>Explore analytics <span>→</span></button></section></div></>
}

export default App
