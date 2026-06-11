import { useState } from 'react'
import Header from './components/Header'
import TabNav from './components/TabNav'
import AddForm from './components/AddForm'
import DropForm from './components/DropForm'
import coursesData from './data/courses.json'
import identitiesData from './data/identities.json'
import styles from './App.module.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('add')

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        <TabNav activeTab={activeTab} onChange={setActiveTab} />
        <div className={styles.content}>
          <div key={activeTab} className={styles.tabPane}>
            {activeTab === 'add' && (
              <AddForm courses={coursesData} identities={identitiesData} />
            )}
            {activeTab === 'drop' && (
              <DropForm courses={coursesData} identities={identitiesData} />
            )}
          </div>
        </div>
      </main>
      <footer className={styles.footer}>
        © 2025 港都社區大學｜版本 2.0.0｜由 mumu 開發
      </footer>
    </div>
  )
}
