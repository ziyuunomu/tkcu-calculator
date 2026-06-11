// ========== 費用計算核心邏輯 ==========
// 對應原始 Python 檔：tkcucalculator_0620_web.py

// ========== 折扣計算 ==========

/**
 * 計算最終折扣率（推廣課程與身分優惠擇優）
 * @param {boolean} isPromo - 是否為推廣課程
 * @param {string} identity - 身分名稱
 * @param {Object} identities - 身分折扣對照表 { "身分名稱": 折扣率 }
 * @returns {{ finalDiscount: number, note: string }}
 */
export function calcDiscount(isPromo, identity, identities) {
  const promoDiscount = isPromo ? 0.7 : 1.0;
  const identityDiscount = identities[identity] ?? 1.0;
  const finalDiscount = Math.min(promoDiscount, identityDiscount);

  let note;
  if (isPromo && finalDiscount === promoDiscount) {
    note = "推廣課程 0.7（與身分優惠擇優）";
  } else if (isPromo && finalDiscount === identityDiscount) {
    note = `身份：${identity} ${identityDiscount}（與推廣課程擇優）`;
  } else {
    note = `身份：${identity} ${identityDiscount === 1.0 ? '1.0 → 無優惠折扣' : identityDiscount}`;
  }

  return { finalDiscount, note };
}

// ========== 加選費用計算 ==========

/**
 * @param {Object} params
 * @param {Object} params.course        - 課程資料 { weeks, fee, place_fee, ac_fee, deposit, is_promo, 課程名稱 }
 * @param {string} params.identity      - 身分名稱
 * @param {Object} params.identities    - 身分折扣對照表
 * @param {number} params.joinWeek      - 插班週次（數字）
 * @param {number} params.registrationFee - 報名費（200 / 100 / 0）
 * @param {number} params.insuranceFee  - 保險費（215 / 0）
 * @returns {Object} 計算結果
 */
export function calculateAdd({ course, identity, identities, joinWeek, registrationFee, insuranceFee }) {
  const totalWeeks = course['週數'];
  const fee       = course['學分費'];
  const place_fee = course['場地費'] ?? 0;
  const ac_fee    = course['冷氣費'] ?? 0;
  const deposit   = course['保證金'] ?? 0;
  const isPromo   = course['推廣課程'] === true;

  // 插班比例：第 1-2 週全額，第 3 週起依剩餘比例
  const ratio = joinWeek <= 2 ? 1 : (totalWeeks - joinWeek + 1) / totalWeeks;

  // 折扣
  const { finalDiscount, note } = calcDiscount(isPromo, identity, identities);

  // 各項費用
  const originalCreditFee = fee;
  const creditFee = Math.round(fee * finalDiscount * ratio);
  const originalPlaceFee = place_fee;
  const placeFee = Math.round(place_fee * ratio);
  const originalAcFee = ac_fee;
  const acFee = Math.round(ac_fee * ratio);
  const depositInt = Math.round(deposit);

  const total = creditFee + placeFee + acFee + registrationFee + insuranceFee + depositInt;

  // 備註
  const remark =
    joinWeek <= 2
      ? `※備註：第 ${joinWeek} 週插班，全額收費`
      : `※備註：第 ${joinWeek} 週插班，依比例計算 ${totalWeeks - joinWeek + 1}/${totalWeeks}`;

  return {
    creditFee: { original: originalCreditFee, final: creditFee },
    placeFee:  { original: originalPlaceFee,  final: placeFee },
    acFee:     { original: originalAcFee,      final: acFee },
    deposit: depositInt,
    registrationFee,
    insuranceFee,
    total,
    note,
    remark,
  };
}

// ========== 退課費用計算 ==========

/**
 * 依課程週數與退課週次決定退費比例與說明
 * @param {number} totalWeeks
 * @param {number} dropWeek
 * @returns {{ refundRatio: number, remark: string }}
 */
export function calcRefundRatio(totalWeeks, dropWeek) {
  if (totalWeeks > 12) {
    if (dropWeek === 1)      return { refundRatio: 1.0, remark: "※開課前退課，全額退費" };
    if (dropWeek <= 3)       return { refundRatio: 1.0, remark: "※第 3 週前退課，全額退費" };
    if (dropWeek === 4)      return { refundRatio: 0.7, remark: "※第 4 週前退課，退費 70%" };
    if (dropWeek === 5)      return { refundRatio: 0.5, remark: "※第 5 週前退課，退費 50%" };
    return                          { refundRatio: 0,   remark: "※第 5 週起退課，不予退費" };
  } else {
    if (dropWeek === 1)      return { refundRatio: 1.0, remark: "※開課前退課，全額退費" };
    if (dropWeek === 2)      return { refundRatio: 1.0, remark: "※第 2 週前退課，全額退費" };
    if (dropWeek === 3)      return { refundRatio: 0.5, remark: "※第 3 週前退課，退費 50%" };
    return                          { refundRatio: 0,   remark: "※第 3 週起退課，不予退費" };
  }
}

/**
 * @param {Object} params
 * @param {Object} params.course          - 課程資料
 * @param {string} params.identity        - 身分名稱
 * @param {Object} params.identities      - 身分折扣對照表
 * @param {number} params.dropWeek        - 退課週次（數字）
 * @param {boolean} params.hasOtherCourses - 是否有其他課程
 * @param {number} params.registrationFee - 報名費（200 / 100）
 * @param {number} params.insuranceFee    - 保險費（215 / 0）
 * @returns {Object} 計算結果
 */
export function calculateDrop({ course, identity, identities, dropWeek, hasOtherCourses, registrationFee, insuranceFee }) {
  const totalWeeks = course['週數'];
  const fee       = course['學分費'];
  const place_fee = course['場地費'] ?? 0;
  const ac_fee    = course['冷氣費'] ?? 0;
  const deposit   = course['保證金'] ?? 0;
  const isPromo   = course['推廣課程'] === true;

  // 退費比例
  const { refundRatio, remark: dynamicRemark } = calcRefundRatio(totalWeeks, dropWeek);

  // 折扣
  const { finalDiscount, note } = calcDiscount(isPromo, identity, identities);

  // 各項費用（學分費先套折扣，再套退費比例）
  const originalCreditFee = Math.round(fee * finalDiscount);
  const creditFee = Math.round(originalCreditFee * refundRatio);
  const originalPlaceFee = place_fee;
  const placeFee = Math.round(place_fee * refundRatio);
  const originalAcFee = ac_fee;
  const acFee = Math.round(ac_fee * refundRatio);
  const depositInt = Math.round(deposit);

  // 保險費退費：只有開課前（週次=1）且無其他課程才退
  const insuranceRefund = (dropWeek === 1 && !hasOtherCourses) ? insuranceFee : 0;
  const insuranceRemark = hasOtherCourses
    ? "※有其他課程，不退還保險費"
    : dropWeek === 1
      ? "※開課前可退還保險費"
      : "※開課後不予退還保險費";

  // 報名費與行政手續費
  const noRefund = (creditFee + placeFee + acFee) === 0;
  let refundRegistration = 0;
  let adminFee = 0;
  let adminRemark = "";
  let reminder = "";

  if (noRefund) {
    adminRemark = `※不予退費，報名費 ${registrationFee} 元不退還`;
    reminder = "※提醒：已超過退課期限，無法退費";
  } else if (hasOtherCourses) {
    adminRemark = `※有其他課程，不退報名費 ${registrationFee} 元，也不扣手續費`;
  } else {
    refundRegistration = registrationFee;
    adminFee = 100;
    adminRemark = `※無其他課程，退報名費 ${registrationFee} 元，但扣除行政手續費 100 元`;
  }

  // 應退總金額
  const totalRefund = Math.max(0, creditFee + placeFee + acFee + refundRegistration + insuranceRefund - adminFee);

  return {
    creditFee:  { original: originalCreditFee, final: creditFee },
    placeFee:   { original: originalPlaceFee,  final: placeFee },
    acFee:      { original: originalAcFee,      final: acFee },
    deposit: depositInt,
    registrationFee,
    insuranceFee: { paid: insuranceFee, refund: insuranceRefund },
    adminFee,
    totalRefund,
    note,
    adminRemark,
    insuranceRemark,
    dynamicRemark,
    reminder,
  };
}

// ========== 多課程加選計算 ==========

/**
 * 多堂課購物車模式：每堂各自計算學分/場地/冷氣費，報名費與保險費整批只收一次
 * @param {{ items: Array<{course, joinWeek}>, identity, identities, registrationFee, insuranceFee }}
 */
export function calculateAddMultiple({ items, identity, identities, registrationFee, insuranceFee }) {
  const courseResults = items.map(({ course, joinWeek }) =>
    calculateAdd({ course, identity, identities, joinWeek, registrationFee: 0, insuranceFee: 0 })
  )
  const coursesTotal = courseResults.reduce((sum, r) => sum + r.total, 0)
  const total = coursesTotal + registrationFee + insuranceFee
  return { courseResults, coursesTotal, registrationFee, insuranceFee, total }
}

// ========== 輸入驗證 ==========

/**
 * @returns {{ valid: boolean, message: string }}
 */
export function validateAddInputs({ courseCode, identity, joinWeek, registrationFee, insuranceFee }) {
  if (!courseCode)       return { valid: false, message: "請選擇課程編號！" };
  if (!identity)         return { valid: false, message: "請選擇身分優惠！" };
  if (!joinWeek)         return { valid: false, message: "請選擇插班週次！" };
  if (!registrationFee && registrationFee !== 0) return { valid: false, message: "請選擇報名費選項！" };
  if (!insuranceFee && insuranceFee !== 0)        return { valid: false, message: "請選擇保險費選項！" };
  return { valid: true, message: "" };
}

/**
 * @returns {{ valid: boolean, message: string }}
 */
export function validateDropInputs({ courseCode, identity, dropWeek, registrationFee, insuranceFee }) {
  if (!courseCode)       return { valid: false, message: "請選擇課程編號！" };
  if (!identity)         return { valid: false, message: "請選擇身分優惠！" };
  if (!dropWeek)         return { valid: false, message: "請選擇退課週次！" };
  if (!registrationFee && registrationFee !== 0) return { valid: false, message: "請選擇報名費選項！" };
  if (!insuranceFee && insuranceFee !== 0)        return { valid: false, message: "請選擇保險費選項！" };
  return { valid: true, message: "" };
}

// ========== 警告檢查：加選選項衝突 ==========

/**
 * 已報名其他課程 + 保險費215元 → 邏輯矛盾
 * @returns {string | null} 警告訊息，無問題回傳 null
 */
export function checkAddWarning(registrationFeeLabel, insuranceFeeLabel) {
  if (registrationFeeLabel === "已報名其他課程0元" && insuranceFeeLabel === "保險費215元") {
    return (
      "您選擇了「已報名其他課程 0 元」，但同時選擇了「保險費 215 元」。\n\n" +
      "如果您已經報名其他課程：\n→ 表示您已繳過保險費，應選擇「不納保 0 元」\n\n" +
      "如果您需要繳交保險費：\n→ 表示這是第一次報名，應選擇「新生 200 元」或「舊生 100 元」"
    );
  }
  return null;
}
