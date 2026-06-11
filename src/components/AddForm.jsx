import { useState } from 'react'
import CourseSelector from './CourseSelector'
import FormField from './FormField'
import ResultModal from './ResultModal'
import { calculateAddMultiple, checkAddWarning } from '../calculator'
import styles from './Form.module.css'

const REGISTRATION_OPTIONS = [
  { value: '200', label: '新生 200 元' },
  { value: '100', label: '舊生 100 元' },
  { value: '0',   label: '已報名其他課程 0 元' },
]

const INSURANCE_OPTIONS = [
  { value: '215', label: '保險費 215 元' },
  { value: '0',   label: '不納保 0 元' },
]

export default function AddForm({ courses, identities }) {
  const [identity, setIdentity]            = useState('')
  const [registrationFee, setRegistration] = useState('')
  const [insuranceFee, setInsurance]       = useState('')
  const [currentCourse, setCurrentCourse] = useState('')
  const [currentWeek, setCurrentWeek]     = useState('')
  const [cartItems, setCartItems]         = useState([])
  const [result, setResult]               = useState(null)
  const [warning, setWarning]             = useState('')
  const [errors, setErrors]               = useState({})

  const selectedCourse = courses.find(c => c.課程編號 === currentCourse)
  const maxWeek = selectedCourse ? Math.min(selectedCourse.週數, 6) : 6
  const weekOptions = Array.from({ length: maxWeek }, (_, i) => ({
    value: String(i + 1),
    label: `第 ${i + 1} 週插班`,
  }))
  const identityOptions = Object.keys(identities).map(k => ({ value: k, label: k }))

  function handleAddToCart() {
    if (!currentCourse) { setErrors({ cart: '請先選擇課程' }); return }
    if (!currentWeek)   { setErrors({ cart: '請選擇插班週次' }); return }
    if (cartItems.some(item => item.courseCode === currentCourse)) {
      setErrors({ cart: '此課程已在清單中' }); return
    }
    setErrors({})
    setCartItems(prev => [...prev, { courseCode: currentCourse, joinWeek: Number(currentWeek) }])
    setCurrentCourse('')
    setCurrentWeek('')
  }

  function handleRemove(code) {
    setCartItems(prev => prev.filter(item => item.courseCode !== code))
  }

  function handleCalculate() {
    if (cartItems.length === 0) { setErrors({ form: '請先在上方新增至少一堂課程' }); return }
    if (!identity)              { setErrors({ identity: '請選擇身分優惠' }); return }
    if (registrationFee === '') { setErrors({ form: '請選擇報名費選項' }); return }
    if (insuranceFee === '')    { setErrors({ form: '請選擇保險費選項' }); return }

    const warn = checkAddWarning(
      REGISTRATION_OPTIONS.find(o => o.value === registrationFee)?.label ?? '',
      INSURANCE_OPTIONS.find(o => o.value === insuranceFee)?.label ?? ''
    )
    if (warn) { setWarning(warn); return }

    setErrors({})
    const items = cartItems.map(item => ({
      course: courses.find(c => c.課程編號 === item.courseCode),
      joinWeek: item.joinWeek,
    }))
    const res = calculateAddMultiple({
      items, identity, identities,
      registrationFee: Number(registrationFee),
      insuranceFee: Number(insuranceFee),
    })
    setResult({ ...res, cartItems, courses })
  }

  const canCalculate = cartItems.length > 0

  return (
    <div className={styles.layout}>
      <div className={styles.formCard}>
        <div className={styles.cardTitle}>加選資料</div>
        <div className={styles.fields}>

          {/* ① 身分優惠 */}
          <div className={styles.stepBlock}>
            <span className={styles.stepBadge}>1</span>
            <div className={styles.stepContent}>
              <FormField
                label="選擇身分優惠"
                value={identity}
                onChange={v => {
                  setIdentity(v)
                  setErrors(e => ({ ...e, identity: '' }))
                  if (v === '新生') setRegistration('200')
                  else if (v === '舊生') setRegistration('100')
                }}
                options={identityOptions}
                error={errors.identity}
              />
            </div>
          </div>

          {/* ② 新增課程 */}
          <div className={styles.stepBlock}>
            <span className={styles.stepBadge}>2</span>
            <div className={styles.stepContent}>
              <p className={styles.stepLabel}>新增課程至清單（可新增多堂課程）</p>
              <div className={styles.cartInputArea}>
                <CourseSelector
                  courses={courses}
                  value={currentCourse}
                  onChange={code => { setCurrentCourse(code); setCurrentWeek('') }}
                />
                <div className={styles.cartInputRow}>
                  <FormField
                    label="插班週次"
                    value={currentWeek}
                    onChange={setCurrentWeek}
                    options={weekOptions}
                    placeholder={currentCourse ? '-- 請選擇週次 --' : '（請先選擇課程）'}
                    disabled={!currentCourse}
                  />
                  <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                    + 加入清單
                  </button>
                </div>
                {errors.cart && <p className={styles.cartError}>{errors.cart}</p>}
              </div>

              {/* 清單 */}
              {cartItems.length > 0 ? (
                <div className={styles.cartList}>
                  <p className={styles.cartListTitle}>已加入 {cartItems.length} 堂課程</p>
                  {cartItems.map((item, i) => {
                    const c = courses.find(c => c.課程編號 === item.courseCode)
                    return (
                      <div key={item.courseCode} className={styles.cartItem}>
                        <span className={styles.cartItemNum}>{i + 1}</span>
                        <span className={styles.cartItemCode}>{item.courseCode}</span>
                        <span className={styles.cartItemName}>{c?.課程名稱}</span>
                        <span className={styles.cartItemWeek}>第 {item.joinWeek} 週</span>
                        <button
                          className={styles.cartRemoveBtn}
                          onClick={() => handleRemove(item.courseCode)}
                          title="移除此課程"
                        >✕</button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className={styles.cartEmpty}>
                  尚未加入任何課程，請從上方搜尋後按「+ 加入清單」
                </div>
              )}
            </div>
          </div>

          {/* ③ 報名費＋保險費 */}
          <div className={styles.stepBlock}>
            <span className={styles.stepBadge}>3</span>
            <div className={styles.stepContent}>
              <p className={styles.stepLabel}>費用選項（本學期只收一次）</p>
              <div className={styles.twoCol}>
                <FormField
                  label="報名費"
                  value={registrationFee}
                  onChange={setRegistration}
                  options={REGISTRATION_OPTIONS}
                />
                <FormField
                  label="保險費"
                  value={insuranceFee}
                  onChange={setInsurance}
                  options={INSURANCE_OPTIONS}
                />
              </div>
            </div>
          </div>

        </div>

        {errors.form && <p className={styles.error}>{errors.form}</p>}
        {warning && (
          <div className={styles.warning}>
            <p className={styles.warningTitle}>⚠ 選項不一致</p>
            <p>{warning}</p>
            <button className={styles.warningClose} onClick={() => setWarning('')}>我知道了</button>
          </div>
        )}

        <button
          className={`${styles.calcBtn} ${!canCalculate ? styles.calcBtnDisabled : ''}`}
          onClick={handleCalculate}
          disabled={!canCalculate}
          title={!canCalculate ? '請先加入至少一堂課程' : ''}
        >
          計算加選費用
        </button>
      </div>

      {/* 說明 */}
      <aside className={styles.noteCard}>
        <div className={styles.cardTitle}>插班說明</div>
        <div className={styles.noteContent}>
          <p>第 1–2 週插班 → 全額收費</p>
          <p>第 3 週起插班 → 依剩餘週次比例</p>
          <p className={styles.noteFormula}>（剩餘週次 / 總週次）× 費用</p>
          <hr className={styles.divider} />
          <p>新生報名費：200 元</p>
          <p>舊生報名費：100 元</p>
          <p>已報名其他課程：0 元</p>
          <hr className={styles.divider} />
          <p>保險費：215 元</p>
          <p>不納保：0 元</p>
          <hr className={styles.divider} />
          <p>報名費與保險費每學期收取一次</p>
        </div>
      </aside>

      {result && (
        <ResultModal
          type="add-multi"
          result={result}
          courses={courses}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
