import { useState } from 'react'
import CourseSelector from './CourseSelector'
import FormField from './FormField'
import ResultModal from './ResultModal'
import { calculateDrop, validateDropInputs } from '../calculator'
import styles from './Form.module.css'

const REGISTRATION_OPTIONS = [
  { value: '200', label: '新生 200 元' },
  { value: '100', label: '舊生 100 元' },
]

const INSURANCE_OPTIONS = [
  { value: '215', label: '保險費 215 元' },
  { value: '0',   label: '不納保 0 元' },
]

const OTHER_COURSES_OPTIONS = [
  { value: 'true',  label: '有其他課程' },
  { value: 'false', label: '無其他課程' },
]

export default function DropForm({ courses, identities }) {
  const [courseCode, setCourseCode]        = useState('')
  const [identity, setIdentity]            = useState('')
  const [dropWeek, setDropWeek]            = useState('')
  const [hasOther, setHasOther]            = useState('')
  const [registrationFee, setRegistration] = useState('')
  const [insuranceFee, setInsurance]       = useState('')
  const [result, setResult]                = useState(null)
  const [errors, setErrors]                = useState({})

  const selectedCourse = courses.find(c => c.課程編號 === courseCode)
  const maxWeek = selectedCourse ? Math.min(selectedCourse.週數, 6) : 6

  const weekOptions = Array.from({ length: maxWeek }, (_, i) => ({
    value: String(i + 1),
    label: `第 ${i + 1} 週前退課`,
  }))

  const identityOptions = Object.keys(identities).map(k => ({ value: k, label: k }))

  function handleCalculate() {
    const validation = validateDropInputs({
      courseCode,
      identity,
      dropWeek: dropWeek || null,
      registrationFee: registrationFee !== '' ? Number(registrationFee) : null,
      insuranceFee:    insuranceFee !== ''    ? Number(insuranceFee)    : null,
    })

    if (!validation.valid) {
      setErrors({ form: validation.message })
      return
    }

    setErrors({})
    const res = calculateDrop({
      course: selectedCourse,
      identity,
      identities,
      dropWeek: Number(dropWeek),
      hasOtherCourses: hasOther === 'true',
      registrationFee: Number(registrationFee),
      insuranceFee: Number(insuranceFee),
    })
    setResult(res)
  }

  return (
    <div className={styles.layout}>
      {/* ── 表單 ── */}
      <div className={styles.formCard}>
        <div className={styles.cardTitle}>退課資料</div>
        <div className={styles.fields}>
          <CourseSelector courses={courses} value={courseCode} onChange={setCourseCode} />

          <FormField
            label="身分優惠"
            value={identity}
            onChange={setIdentity}
            options={identityOptions}
          />

          <FormField
            label="退課週次"
            value={dropWeek}
            onChange={setDropWeek}
            options={weekOptions}
            placeholder={courseCode ? '-- 請選擇週次 --' : '（請先選擇課程）'}
            disabled={!courseCode}
          />

          <div className={styles.twoCol}>
            <FormField
              label="其他課程"
              value={hasOther}
              onChange={setHasOther}
              options={OTHER_COURSES_OPTIONS}
            />
            <FormField
              label="報名費"
              value={registrationFee}
              onChange={setRegistration}
              options={REGISTRATION_OPTIONS}
            />
          </div>

          <FormField
            label="保險費"
            value={insuranceFee}
            onChange={setInsurance}
            options={INSURANCE_OPTIONS}
          />
        </div>

        {errors.form && <p className={styles.error}>{errors.form}</p>}

        <button className={styles.calcBtn} onClick={handleCalculate}>
          計算退課費用
        </button>
      </div>

      {/* ── 說明 ── */}
      <aside className={styles.noteCard}>
        <div className={styles.cardTitle}>退費說明</div>
        <div className={styles.noteContent}>
          <p className={styles.noteGroup}>開課前退課 → 全額退費</p>
          <p className={styles.noteSubtitle}>6–12 週課程</p>
          <p>第 2 週前 → 全額退費</p>
          <p>第 3 週前 → 退費 50%</p>
          <p>第 3 週起 → 不予退費</p>
          <hr className={styles.divider} />
          <p className={styles.noteSubtitle}>12 週以上課程</p>
          <p>第 3 週前 → 全額退費</p>
          <p>第 4 週前 → 退費 70%</p>
          <p>第 5 週前 → 退費 50%</p>
          <p>第 5 週起 → 不予退費</p>
        </div>
      </aside>

      {result && (
        <ResultModal
          type="drop"
          result={result}
          course={selectedCourse}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
