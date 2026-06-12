import { useState, useRef, useEffect } from 'react'
import styles from './CourseSelector.module.css'

export default function CourseSelector({ courses, value, onChange, hideInfo = false }) {
  const [query, setQuery]       = useState('')
  const [open, setOpen]         = useState(false)
  const wrapperRef              = useRef(null)

  const selectedCourse = courses.find(c => c.課程編號 === value)

  // 顯示文字：已選課程 or 輸入中的關鍵字
  const displayValue = open
    ? query
    : selectedCourse ? `（${selectedCourse.課程編號}）${selectedCourse.課程名稱}` : ''

  const filtered = query.trim()
    ? courses.filter(c => c.課程名稱.includes(query) || c.課程編號.includes(query))
    : courses

  // 點擊外部關閉
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(code) {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  function handleInputChange(e) {
    setQuery(e.target.value)
    setOpen(true)
    if (!e.target.value) onChange('')
  }

  function handleFocus() {
    setOpen(true)
    setQuery('')
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <label className={styles.label}>選擇課程</label>

      <div className={`${styles.inputBox} ${open ? styles.inputBoxOpen : ''}`}>
        <span className={styles.icon}>🔍</span>
        <input
          type="text"
          className={styles.input}
          placeholder="輸入課程名稱或編號..."
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
        />
        {value && !open && (
          <button className={styles.clearBtn} onClick={() => { onChange(''); setQuery('') }}>✕</button>
        )}
      </div>

      {open && (
        <ul className={styles.dropdown}>
          {filtered.length === 0 ? (
            <li className={styles.noResult}>查無符合課程</li>
          ) : (
            filtered.map(c => (
              <li
                key={c.課程編號}
                className={`${styles.option} ${c.課程編號 === value ? styles.optionSelected : ''}`}
                onMouseDown={() => handleSelect(c.課程編號)}
              >
                <span className={styles.optionCode}>{c.課程編號}</span>
                <span className={styles.optionName}>{c.課程名稱}</span>
                {c.推廣課程 && <span className={styles.promoBadge}>7折</span>}
              </li>
            ))
          )}
        </ul>
      )}

      {selectedCourse && !open && !hideInfo && (
        <div className={styles.courseInfo}>
          <span>總週數：{selectedCourse.週數} 週</span>
          {selectedCourse.推廣課程 && (
            <span className={styles.promoBadge}>推廣課程 7 折</span>
          )}
        </div>
      )}
    </div>
  )
}
