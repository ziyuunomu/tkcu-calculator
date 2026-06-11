import { useState, useEffect } from 'react'
import styles from './ResultModal.module.css'

export default function ResultModal({ type, result, course, courses, onClose }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (result) document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [result])

  if (!result) return null

  const isMulti = type === 'add-multi'
  const isDrop  = type === 'drop'

  // ── 多課程加選 ──
  if (isMulti) {
    const { courseResults, coursesTotal, registrationFee, insuranceFee, total, cartItems } = result

    function handleCopy() {
      const lines = cartItems.map((item, i) => {
        const c = courses.find(c => c.課程編號 === item.courseCode)
        const r = courseResults[i]
        return `【${item.courseCode}】${c?.課程名稱} 第${item.joinWeek}週\n  學分費：${r.creditFee.final.toLocaleString()}　場地費：${r.placeFee.final.toLocaleString()}　冷氣費：${r.acFee.final.toLocaleString()}`
      })
      const text = lines.join('\n') +
        `\n──\n報名費：${registrationFee.toLocaleString()}\n保險費：${insuranceFee.toLocaleString()}\n總應收：NT$${total.toLocaleString()}`
      copyText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <div className={styles.titleBar}>
            <span>加選費用計算結果（共 {cartItems.length} 堂）</span>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          <div className={styles.body}>
            {cartItems.map((item, i) => {
              const c = courses.find(c => c.課程編號 === item.courseCode)
              const r = courseResults[i]
              return (
                <section key={item.courseCode} className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    {item.courseCode}　{c?.課程名稱}
                    {c?.推廣課程 && <span className={styles.promoBadge}>推廣7折</span>}
                  </h3>
                  <div className={styles.rows}>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>插班週次</span>
                      <span className={styles.rowValue}>第 {item.joinWeek} 週</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>學分費</span>
                      <span className={styles.rowValue}>{r.creditFee.original.toLocaleString()} → {r.creditFee.final.toLocaleString()}</span>
                    </div>
                    {r.placeFee.original > 0 && (
                      <div className={styles.row}>
                        <span className={styles.rowLabel}>場地費</span>
                        <span className={styles.rowValue}>{r.placeFee.original.toLocaleString()} → {r.placeFee.final.toLocaleString()}</span>
                      </div>
                    )}
                    {r.acFee.original > 0 && (
                      <div className={styles.row}>
                        <span className={styles.rowLabel}>冷氣費</span>
                        <span className={styles.rowValue}>{r.acFee.original.toLocaleString()} → {r.acFee.final.toLocaleString()}</span>
                      </div>
                    )}
                    <div className={`${styles.row} ${styles.rowSubtotal}`}>
                      <span className={styles.rowLabel}>小計</span>
                      <span className={styles.rowValue}>NT$ {r.total.toLocaleString()}</span>
                    </div>
                  </div>
                </section>
              )
            })}

            {/* 共用費用 */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>共用費用（每學期收取一次）</h3>
              <div className={styles.rows}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>報名費</span>
                  <span className={styles.rowValue}>{registrationFee.toLocaleString()}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>保險費</span>
                  <span className={styles.rowValue}>{insuranceFee.toLocaleString()}</span>
                </div>
              </div>
            </section>

            <div className={styles.total}>
              <span>總應收</span>
              <span className={styles.totalAmount}>NT$ {total.toLocaleString()}</span>
            </div>

            {/* 折扣備註 */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>備註</h3>
              <div className={styles.notes}>
                {courseResults.map((r, i) => (
                  <p key={i}>【{cartItems[i].courseCode}】{r.note}　{r.remark}</p>
                ))}
              </div>
            </section>
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
              onClick={handleCopy}
            >
              {copied ? '✓ 已複製' : '複製結果'}
            </button>
            <button className={styles.primaryBtn} onClick={onClose}>關閉</button>
          </div>
        </div>
      </div>
    )
  }

  // ── 單課程（加選 or 退課）──
  const isAdd = type === 'add'
  const totalLabel  = isAdd ? '總應收' : '總應退'
  const totalAmount = isAdd ? result.total : result.totalRefund

  const rows = [
    { label: '課程編號', value: course.課程編號 },
    { label: '課程名稱', value: course.課程名稱 },
    { label: '學分費', value: `${result.creditFee.original.toLocaleString()} → ${result.creditFee.final.toLocaleString()}` },
    { label: '場地費', value: `${result.placeFee.original.toLocaleString()} → ${result.placeFee.final.toLocaleString()}` },
    { label: '冷氣費', value: `${result.acFee.original.toLocaleString()} → ${result.acFee.final.toLocaleString()}` },
    { label: '報名費', value: `${result.registrationFee.toLocaleString()}` },
    {
      label: '保險費',
      value: isAdd
        ? `${result.insuranceFee.toLocaleString()}`
        : `${result.insuranceFee.paid.toLocaleString()} → ${result.insuranceFee.refund.toLocaleString()}`
    },
    { label: '保證金', value: `${result.deposit.toLocaleString()}` },
  ]

  const notes = [
    result.note,
    result.remark ?? result.dynamicRemark,
    result.adminRemark,
    result.insuranceRemark,
    result.reminder,
  ].filter(Boolean)

  function handleCopy() {
    const text = rows.map(r => `${r.label}：${r.value}`).join('\n')
      + `\n${totalLabel}：NT$${totalAmount.toLocaleString()}\n`
      + notes.join('\n')
    copyText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.titleBar}>
          <span>{isAdd ? '加選費用計算結果' : '退課費用計算結果'}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>費用明細</h3>
            <div className={styles.rows}>
              {rows.map(row => (
                <div key={row.label} className={styles.row}>
                  <span className={styles.rowLabel}>{row.label}</span>
                  <span className={styles.rowValue}>{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          <div className={styles.total}>
            <span>{totalLabel}</span>
            <span className={styles.totalAmount}>NT$ {totalAmount.toLocaleString()}</span>
          </div>

          {notes.length > 0 && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>備註</h3>
              <div className={styles.notes}>
                {notes.map((n, i) => <p key={i}>{n}</p>)}
              </div>
            </section>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ''}`}
            onClick={handleCopy}
          >
            {copied ? '✓ 已複製' : '複製結果'}
          </button>
          <button className={styles.primaryBtn} onClick={onClose}>關閉</button>
        </div>
      </div>
    </div>
  )
}

function copyText(text) {
  const doFallback = () => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(doFallback)
  } else {
    doFallback()
  }
}
