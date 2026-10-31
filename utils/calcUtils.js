/**
 * 计算年龄（精确到月）
 * @param {String} birthDate - 出生日期 YYYY-MM-DD
 * @returns {Object} { years, months, totalMonths }
 */
export function calcAge(birthDate) {
	if (!birthDate) return { years: 0, months: 0, totalMonths: 0 }
	
	const birth = new Date(birthDate)
	const now = new Date()
	
	let years = now.getFullYear() - birth.getFullYear()
	let months = now.getMonth() - birth.getMonth()
	
	if (months < 0) {
		years--
		months += 12
	}
	
	if (now.getDate() < birth.getDate()) {
		months--
		if (months < 0) {
			years--
			months += 12
		}
	}
	
	return {
		years,
		months,
		totalMonths: years * 12 + months
	}
}

/**
 * 计算BMI
 * @param {Number} height - 身高(cm)
 * @param {Number} weight - 体重(kg)
 * @returns {Object} { bmi, status }
 */
export function calcBMI(height, weight) {
	if (!height || !weight) return { bmi: 0, status: '未计算' }
	
	const heightM = height / 100
	const bmi = (weight / (heightM * heightM)).toFixed(1)
	
	let status = '正常'
	if (bmi < 18.5) {
		status = '偏瘦'
	} else if (bmi >= 18.5 && bmi < 24) {
		status = '正常'
	} else if (bmi >= 24 && bmi < 28) {
		status = '偏胖'
	} else {
		status = '肥胖'
	}
	
	return { bmi: parseFloat(bmi), status }
}

/**
 * 计算遗传靶身高区间
 * @param {String} gender - 性别 'male' | 'female'
 * @param {Number} fatherHeight - 父亲身高(cm)
 * @param {Number} motherHeight - 母亲身高(cm)
 * @returns {Object} { min, max, target }
 */
export function calcTargetHeight(gender, fatherHeight, motherHeight) {
	if (!gender || !fatherHeight || !motherHeight) {
		return { min: 0, max: 0, target: 0 }
	}
	
	let target = 0
	if (gender === 'male') {
		// 男孩：(父亲身高 + 母亲身高 + 13) / 2 ± 5cm
		target = (fatherHeight + motherHeight + 13) / 2
	} else {
		// 女孩：(父亲身高 + 母亲身高 - 13) / 2 ± 5cm
		target = (fatherHeight + motherHeight - 13) / 2
	}
	
	return {
		min: Math.round(target - 5),
		max: Math.round(target + 5),
		target: Math.round(target)
	}
}

