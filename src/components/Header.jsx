import styles from './Header.module.css'

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>高雄市港都社區大學</h1>
      <p className={styles.subtitle}>加退選費用計算機</p>
    </header>
  )
}
