import styles from './TabNav.module.css'

const TABS = [
  { id: 'add',  label: '加選 / 插班' },
  { id: 'drop', label: '退課' },
]

export default function TabNav({ activeTab, onChange }) {
  return (
    <nav className={styles.nav}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
