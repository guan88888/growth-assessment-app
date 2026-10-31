// 简单的状态管理（使用 localStorage）
const STORAGE_KEYS = {
	PROFILE: 'growth_profile',
	QUIZ_ANSWERS: 'quiz_answers',
	REPORTS: 'growth_reports',
	PLAN: 'action_plan',
	QUIZ_COUNT: 'quiz_count',
	CHECKIN_STREAK: 'checkin_streak',
	GAME_POINTS: 'game_points',
	GAME_PLAY_COUNT: 'game_play_count',
	GAME_PLAY_DATE: 'game_play_date'
}

export const store = {
	// Profile 相关
	getProfile() {
		const data = uni.getStorageSync(STORAGE_KEYS.PROFILE)
		return data ? JSON.parse(data) : null
	},
	
	saveProfile(profile) {
		uni.setStorageSync(STORAGE_KEYS.PROFILE, JSON.stringify(profile))
	},
	
	// Quiz 相关
	getQuizAnswers() {
		const data = uni.getStorageSync(STORAGE_KEYS.QUIZ_ANSWERS)
		return data ? JSON.parse(data) : []
	},
	
	saveQuizAnswers(answers) {
		uni.setStorageSync(STORAGE_KEYS.QUIZ_ANSWERS, JSON.stringify(answers))
	},
	
	clearQuizAnswers() {
		uni.removeStorageSync(STORAGE_KEYS.QUIZ_ANSWERS)
	},
	
	// Reports 相关
	getReports() {
		const data = uni.getStorageSync(STORAGE_KEYS.REPORTS)
		return data ? JSON.parse(data) : []
	},
	
	getLatestReport() {
		const reports = this.getReports()
		return reports.length > 0 ? reports[0] : null
	},
	
	getReportById(reportId) {
		const reports = this.getReports()
		return reports.find(r => r.id === reportId) || null
	},
	
	saveReport(report) {
		try {
			if (!report || !report.id) {
				console.error('报告数据无效，无法保存')
				throw new Error('报告数据无效')
			}
			
			console.log('开始保存报告：', report.id)
			const reports = this.getReports()
			
			// 检查是否已存在相同ID的报告
			const existingIndex = reports.findIndex(r => r.id === report.id)
			if (existingIndex > -1) {
				// 如果已存在，替换它
				reports[existingIndex] = report
			} else {
				// 不存在，添加到最前面
				reports.unshift(report)
			}
			
			// 最多保存50条
			if (reports.length > 50) {
				reports.splice(50)
			}
			
			// 保存到本地存储
			const reportsStr = JSON.stringify(reports)
			uni.setStorageSync(STORAGE_KEYS.REPORTS, reportsStr)
			
			// 验证保存是否成功
			const savedReports = this.getReports()
			const savedReport = savedReports.find(r => r.id === report.id)
			if (!savedReport) {
				console.error('报告保存后验证失败')
				throw new Error('报告保存验证失败')
			}
			
			console.log('报告保存成功，当前报告数量：', savedReports.length)
			
			// 更新测评次数
			const count = this.getQuizCount()
			this.setQuizCount(count + 1)
			
			return true
		} catch (error) {
			console.error('保存报告失败：', error)
			throw error
		}
	},
	
	// Plan 相关
	getPlan() {
		const data = uni.getStorageSync(STORAGE_KEYS.PLAN)
		return data ? JSON.parse(data) : null
	},
	
	savePlan(plan) {
		uni.setStorageSync(STORAGE_KEYS.PLAN, JSON.stringify(plan))
	},
	
	updatePlanCheckin(date, items) {
		const plan = this.getPlan() || { checkins: {} }
		if (!plan.checkins) plan.checkins = {}
		plan.checkins[date] = items
		this.savePlan(plan)
		
		// 更新连续打卡天数
		this.updateCheckinStreak()
	},
	
	// 统计相关
	getQuizCount() {
		const count = uni.getStorageSync(STORAGE_KEYS.QUIZ_COUNT)
		return count ? parseInt(count) : 0
	},
	
	setQuizCount(count) {
		uni.setStorageSync(STORAGE_KEYS.QUIZ_COUNT, count.toString())
	},
	
	getCheckinStreak() {
		const streak = uni.getStorageSync(STORAGE_KEYS.CHECKIN_STREAK)
		return streak ? parseInt(streak) : 0
	},
	
	updateCheckinStreak() {
		const plan = this.getPlan()
		if (!plan || !plan.checkins) {
			uni.setStorageSync(STORAGE_KEYS.CHECKIN_STREAK, '0')
			return
		}
		
		const checkins = plan.checkins
		const dates = Object.keys(checkins).sort().reverse()
		
		if (dates.length === 0) {
			uni.setStorageSync(STORAGE_KEYS.CHECKIN_STREAK, '0')
			return
		}
		
		// 计算连续天数
		let streak = 0
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		
		for (let i = 0; i < dates.length; i++) {
			const checkDate = new Date(dates[i])
			checkDate.setHours(0, 0, 0, 0)
			
			const diffDays = Math.floor((today - checkDate) / (1000 * 60 * 60 * 24))
			
			if (diffDays === i) {
				streak++
			} else {
				break
			}
		}
		
		uni.setStorageSync(STORAGE_KEYS.CHECKIN_STREAK, streak.toString())
	},
	
	// 游戏积分相关
	getGamePoints() {
		const points = uni.getStorageSync(STORAGE_KEYS.GAME_POINTS)
		return points ? parseInt(points) : 0
	},
	
	addGamePoints(points) {
		const current = this.getGamePoints()
		const newTotal = current + points
		uni.setStorageSync(STORAGE_KEYS.GAME_POINTS, newTotal.toString())
		return newTotal
	},
	
	getRedeemableMoney() {
		const points = this.getGamePoints()
		// 5000积分 = 1人民币
		return (points / 5000).toFixed(2)
	},
	
	// 每日游戏次数相关
	getTodayDate() {
		const today = new Date()
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
	},
	
	getTodayGameCount() {
		const lastDate = uni.getStorageSync(STORAGE_KEYS.GAME_PLAY_DATE)
		const today = this.getTodayDate()
		
		// 如果是新的一天，重置计数
		if (lastDate !== today) {
			uni.setStorageSync(STORAGE_KEYS.GAME_PLAY_COUNT, '0')
			uni.setStorageSync(STORAGE_KEYS.GAME_PLAY_DATE, today)
			return 0
		}
		
		const count = uni.getStorageSync(STORAGE_KEYS.GAME_PLAY_COUNT)
		return count ? parseInt(count) : 0
	},
	
	addGamePlayCount() {
		const today = this.getTodayDate()
		const lastDate = uni.getStorageSync(STORAGE_KEYS.GAME_PLAY_DATE)
		
		// 如果是新的一天，重置计数
		if (lastDate !== today) {
			uni.setStorageSync(STORAGE_KEYS.GAME_PLAY_COUNT, '1')
			uni.setStorageSync(STORAGE_KEYS.GAME_PLAY_DATE, today)
			return 1
		}
		
		// 增加计数（直接读取，避免重复日期检查）
		const count = uni.getStorageSync(STORAGE_KEYS.GAME_PLAY_COUNT)
		const current = count ? parseInt(count) : 0
		const newCount = current + 1
		uni.setStorageSync(STORAGE_KEYS.GAME_PLAY_COUNT, newCount.toString())
		return newCount
	},
	
	canPlayGame() {
		return this.getTodayGameCount() < 5
	},
	
	getRemainingGameCount() {
		const count = this.getTodayGameCount()
		return Math.max(0, 5 - count)
	},
	
	// 重置游戏次数（用于测试或特殊情况）
	resetGamePlayCount() {
		uni.removeStorageSync(STORAGE_KEYS.GAME_PLAY_COUNT)
		uni.removeStorageSync(STORAGE_KEYS.GAME_PLAY_DATE)
	},
	
	// 获取下次重置时间（距离明天的秒数）
	getNextResetTime() {
		const today = new Date()
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)
		tomorrow.setHours(0, 0, 0, 0)
		const diff = tomorrow - today
		const hours = Math.floor(diff / (1000 * 60 * 60))
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
		return { hours, minutes }
	}
}

