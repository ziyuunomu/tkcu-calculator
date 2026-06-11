import styles from './FormField.module.css'

/**
 * 通用下拉欄位
 * props: label, value, onChange, options [{ value, label }], placeholder
 */
export default function FormField({ label, value, onChange, options, placeholder = '-- 請選擇 --', disabled = false, error = '' }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <select
        className={`${styles.select} ${disabled ? styles.selectDisabled : ''} ${error ? styles.selectError : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  )
}
