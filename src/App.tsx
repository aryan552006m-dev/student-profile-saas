import './App.css'

import { useState } from 'react'

const navItems = ['Overview', 'My classes', 'Marks entry', 'Analytics']
const bars = [74, 82, 61, 88, 69, 79, 92, 76, 84, 70, 87, 80]

function App() {
  const [activeNav, setActiveNav] = useState('Overview')
  const [showPast, setShowPast] = useState(false)

  const assignedClasses = showPast
    ? ['CSE 2A · Data Structures', 'CSE 3B · Database Systems', 'CSE 1A · Programming Lab']
    : ['CSE 3B · Database Systems', 'CSE 3A · Web Engineering']

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">s</span><span>student profile</span></div>
        <div className="workspace"><span className="avatar avatar-teal">AK</span><span><strong>Alex Kumar</strong><small>Faculty workspace</small></span><span className="chevron">⌄</span></div>
        <nav aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map((item, index) => <button className={activeNav === item ? 'nav-item active' : 'nav-item'} key={item} onClick={() => setActiveNav(item)}><span className="nav-icon">{['◒', '▦', '↗', '⌁'][index]}</span>{item}{item === 'Analytics' && <span className="nav-badge">New</span>}</button>)}
          <p className="nav-label nav-spacer">Manage</p>
          <button className="nav-item"><span className="nav-icon">♧</span>Students</button>
          <button className="nav-item"><span className="nav-icon">⚙</span>Settings</button>
        </nav>
        <div className="sidebar-bottom"><div className="help-icon">?</div><div><strong>Need a hand?</strong><small>Visit the help center</small></div><span>↗</span></div>
      </aside>
      <main className="main-content">
        <header className="topbar"><div className="breadcrumb"><span>Workspace</span><b>/</b><strong>{activeNav}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications">♢<i></i></button><button className="profile-chip"><span className="avatar avatar-orange">AK</span><span>Alex Kumar</span><span>⌄</span></button></div></header>
        <section className="content-wrap">
          <div className="welcome-row"><div><p className="eyebrow">Monday, September 8, 2025</p><h1>Good morning, Alex.</h1><p className="subheading">Here is what is happening across your classes today.</p></div><button className="primary-button">＋ Enter marks</button></div>
          <div className="stats-grid"><div className="stat-card"><div className="stat-label">Active students <span className="stat-dot mint"></span></div><div className="stat-number">84</div><div className="stat-foot positive">↗ 8.2% <span>vs last semester</span></div></div><div className="stat-card"><div className="stat-label">Average performance <span className="stat-dot purple"></span></div><div className="stat-number">78.4<span className="unit">%</span></div><div className="stat-foot positive">↗ 4.6% <span>vs last semester</span></div></div><div className="stat-card"><div className="stat-label">Classes assigned <span className="stat-dot orange"></span></div><div className="stat-number">02</div><div className="stat-foot neutral">Current semester <span>2025 / 26</span></div></div><div className="stat-card"><div className="stat-label">Needs attention <span className="stat-dot red"></span></div><div className="stat-number">06</div><div className="stat-foot warning">↓ 2 students <span>since last week</span></div></div></div>
          <div className="dashboard-grid"><section className="panel performance-panel"><div className="panel-heading"><div><h2>Performance overview</h2><p>Average marks across your assigned subjects</p></div><button className="select-button">This semester <span>⌄</span></button></div><div className="chart-area"><div className="y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart"><div className="grid-lines"><i></i><i></i><i></i><i></i><i></i></div><div className="bars">{bars.map((height, index) => <div className="bar-column" key={index}><div className="bar" style={{ height: `${height}%` }}></div><span>{['DS', 'DB', 'OS', 'CN', 'SE', 'AI', 'DS', 'DB', 'OS', 'CN', 'SE', 'AI'][index]}</span></div>)}</div></div></div><div className="chart-legend"><span><i className="legend-dot"></i> Average marks</span><span className="trend">↗ 4.6% from last semester</span></div></section><section className="panel classes-panel"><div className="panel-heading"><div><h2>Your classes</h2><p>Scoped to your assignments</p></div><button className={showPast ? 'toggle on' : 'toggle'} onClick={() => setShowPast(!showPast)}><span></span>Past</button></div><div className="class-list">{assignedClasses.map((item, index) => <div className="class-row" key={item}><span className={`class-icon class-${index % 3}`}>{['DS', 'DB', 'PL'][index % 3]}</span><span className="class-name"><strong>{item.split(' · ')[0]}</strong><small>{item.split(' · ')[1]}</small></span><span className="student-count">{[42, 42, 28][index % 3]} <small>students</small></span><span className="row-arrow">›</span></div>)}</div><button className="text-button" onClick={() => setActiveNav('My classes')}>View all classes <span>→</span></button></section></div>
          <div className="lower-grid"><section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Your latest updates and actions</p></div><button className="more-button">•••</button></div><div className="activity-list"><div className="activity-row"><span className="activity-icon green">✓</span><span><strong>Marks submitted</strong><small>Database Systems · CSE 3B</small></span><time>2h ago</time></div><div className="activity-row"><span className="activity-icon blue">↗</span><span><strong>Class report exported</strong><small>Data Structures · CSE 3A</small></span><time>Yesterday</time></div><div className="activity-row"><span className="activity-icon yellow">!</span><span><strong>6 students need attention</strong><small>Data Structures · CSE 3A</small></span><time>Sep 5</time></div></div></section><section className="insight-card"><div className="insight-orb">✦</div><p className="eyebrow">Student insights</p><h2>Your students are trending up.</h2><p>Average performance has grown by 4.6% this semester. Keep the momentum going.</p><button className="insight-button" onClick={() => setActiveNav('Analytics')}>Explore analytics <span>→</span></button></section></div>
        </section>
      </main>
    </div>
  )
}

export default App
