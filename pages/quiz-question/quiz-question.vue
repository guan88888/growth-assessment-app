<template>
	<view class="quiz-question-page">
		<view class="progress-header">
			<text class="question-num">第{{ currentIndex }}/15题</text>
			<view class="progress-bar">
				<view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
			</view>
		</view>
		
		<view class="question-card" :class="{ fadeIn: showQuestion }">
			<text class="question-text">{{ currentQuestion.question }}</text>
		</view>
		
		<view class="options-list">
			<view 
				class="option-card" 
				v-for="(option, index) in currentQuestion.options" 
				:key="index"
				:class="{ active: selectedIndex === index }"
				@click="selectOption(index)"
			>
				<text class="option-label">{{ option.label }}</text>
			</view>
		</view>
		
		<view class="footer-actions">
			<button 
				v-if="currentIndex > 1" 
				class="btn btn-secondary" 
				@click="prevQuestion"
			>
				上一题
			</button>
			<button 
				class="btn btn-primary" 
				:class="{ disabled: selectedIndex === null }"
				:disabled="selectedIndex === null"
				@click="handleNextOrSubmit"
			>
				{{ currentIndex === 15 ? '提交' : '下一题' }}
			</button>
		</view>
	</view>
</template>

<script>
	import { quizQuestions } from '../../data/mockData.js'
	import { store } from '../../store/index.js'
	import { evaluateResult } from '../../utils/evaluateResult.js'
	
	export default {
		data() {
			return {
				currentIndex: 1,
				selectedIndex: null,
				answers: [],
				showQuestion: false
			}
		},
		computed: {
			currentQuestion() {
				return quizQuestions[this.currentIndex - 1]
			},
			progressPercent() {
				return (this.currentIndex / 15) * 100
			}
		},
		onLoad(options) {
			const index = parseInt(options.currentIndex) || 1
			this.currentIndex = index
			this.loadAnswers()
			this.loadCurrentAnswer()
			
			setTimeout(() => {
				this.showQuestion = true
			}, 100)
		},
		methods: {
			loadAnswers() {
				this.answers = store.getQuizAnswers()
			},
			loadCurrentAnswer() {
				const answer = this.answers.find(a => a.questionId === this.currentQuestion.id)
				if (answer) {
					this.selectedIndex = this.currentQuestion.options.findIndex(
						opt => opt.score === answer.score
					)
				} else {
					this.selectedIndex = null
				}
			},
			selectOption(index) {
				this.selectedIndex = index
			},
			prevQuestion() {
				this.saveCurrentAnswer()
				this.currentIndex--
				this.showQuestion = false
				setTimeout(() => {
					this.loadCurrentAnswer()
					this.showQuestion = true
				}, 200)
			},
			handleNextOrSubmit() {
				if (this.selectedIndex === null) {
					uni.showToast({
						title: '请选择答案',
						icon: 'none'
					})
					return
				}
				
				if (this.currentIndex === 15) {
					// 最后一题，直接提交
					this.submitQuiz()
				} else {
					// 不是最后一题，继续下一题
					this.nextQuestion()
				}
			},
			nextQuestion() {
				this.saveCurrentAnswer()
				this.currentIndex++
				this.selectedIndex = null
				this.showQuestion = false
				setTimeout(() => {
					this.loadCurrentAnswer()
					this.showQuestion = true
				}, 200)
			},
			saveCurrentAnswer() {
				if (this.selectedIndex === null) return
				
				const option = this.currentQuestion.options[this.selectedIndex]
				const existingIndex = this.answers.findIndex(
					a => a.questionId === this.currentQuestion.id
				)
				
				const answer = {
					questionId: this.currentQuestion.id,
					score: option.score
				}
				
				if (existingIndex > -1) {
					this.answers[existingIndex] = answer
				} else {
					this.answers.push(answer)
				}
				
				// 确保答案数组按题目顺序排序
				this.answers.sort((a, b) => {
					const aIndex = quizQuestions.findIndex(q => q.id === a.questionId)
					const bIndex = quizQuestions.findIndex(q => q.id === b.questionId)
					return aIndex - bIndex
				})
				
				store.saveQuizAnswers(this.answers)
			},
			submitQuiz() {
				console.log('开始提交测评...')
				
				// 先保存当前答案
				if (this.selectedIndex === null) {
					uni.showToast({
						title: '请选择答案',
						icon: 'none'
					})
					return
				}
				
				console.log('保存当前答案，题目索引：', this.currentIndex, '选项索引：', this.selectedIndex)
				this.saveCurrentAnswer()
				
				// 重新加载答案，确保获取最新数据
				this.answers = store.getQuizAnswers()
				console.log('当前答案数量：', this.answers ? this.answers.length : 0)
				console.log('答案详情：', JSON.stringify(this.answers))
				
				const profile = store.getProfile()
				if (!profile) {
					uni.showToast({
						title: '请先建立档案',
						icon: 'none'
					})
					return
				}
				
				// 检查答案是否完整（15题）
				if (!this.answers || this.answers.length === 0) {
					console.log('答案为空')
					uni.showModal({
						title: '提示',
						content: '请完成所有题目后再提交',
						showCancel: false
					})
					return
				}
				
				// 检查是否有重复的题目ID
				const questionIds = this.answers.map(a => a.questionId)
				const uniqueIds = [...new Set(questionIds)]
				if (uniqueIds.length !== 15) {
					console.log('答案不完整，已答题数：', uniqueIds.length, '总题数：15')
					// 找出缺失的题目
					const allQuestionIds = quizQuestions.map(q => q.id)
					const missingIds = allQuestionIds.filter(id => !questionIds.includes(id))
					console.log('缺失的题目ID：', missingIds)
					
					uni.showModal({
						title: '提示',
						content: `您已完成 ${uniqueIds.length}/15 题，请完成所有题目后再提交`,
						showCancel: false
					})
					return
				}
				
				// 确保所有答案都有有效的分数
				const invalidAnswers = this.answers.filter(a => typeof a.score !== 'number' || a.score < 0 || a.score > 2)
				if (invalidAnswers.length > 0) {
					console.log('存在无效答案：', invalidAnswers)
					uni.showModal({
						title: '错误',
						content: '部分答案数据无效，请重新答题',
						showCancel: false
					})
					return
				}
				
				// 显示加载提示
				uni.showLoading({
					title: '正在生成报告...',
					mask: true
				})
				
				// 使用 setTimeout 确保 UI 更新
				setTimeout(() => {
					try {
						console.log('开始评估结果...')
						console.log('答案数据：', JSON.stringify(this.answers))
						console.log('档案数据：', JSON.stringify(profile))
						
						// 评估结果
						const result = evaluateResult(this.answers, profile)
						console.log('评估结果状态：', result.status)
						console.log('评估结果详情：', JSON.stringify(result))
						
						if (!result || result.status === 'error') {
							uni.hideLoading()
							const errorMsg = result?.message || '评估失败，请重试'
							console.error('评估失败：', errorMsg)
							uni.showModal({
								title: '错误',
								content: errorMsg,
								showCancel: false,
								success: () => {
									// 可以重新答题
								}
							})
							return
						}
						
						// 验证评估结果
						if (!result.recommendations || result.recommendations.length === 0) {
							console.warn('警告：没有推荐方案，使用默认推荐')
							// 至少添加一个基础推荐
							if (!result.recommendations) {
								result.recommendations = []
							}
							result.recommendations.push({
								type: 'supplement',
								id: 'S001',
								name: '钙片',
								dose: '每日500-800mg',
								reason: '基础营养补充',
								precautions: '建议饭后服用',
								allergies: ['无']
							})
						}
						
						// 生成报告
						const report = {
							id: 'R' + Date.now(),
							createdAt: new Date().toISOString(),
							profile: JSON.parse(JSON.stringify(profile)), // 深拷贝
							answers: JSON.parse(JSON.stringify(this.answers)), // 深拷贝
							result: JSON.parse(JSON.stringify(result)) // 深拷贝
						}
						
						console.log('生成报告对象：', report.id)
						console.log('报告包含推荐数量：', report.result.recommendations?.length || 0)
						
						// 保存报告
						try {
							store.saveReport(report)
							console.log('报告保存成功')
							
							// 验证保存是否成功
							const savedReport = store.getReportById(report.id)
							if (!savedReport) {
								throw new Error('报告保存失败，无法读取')
							}
							console.log('验证报告保存成功：', savedReport.id)
						} catch (saveError) {
							console.error('保存报告失败：', saveError)
							uni.hideLoading()
							uni.showModal({
								title: '保存失败',
								content: '报告保存失败：' + (saveError.message || '未知错误'),
								showCancel: false
							})
							return
						}
						
						// 清空答题记录
						store.clearQuizAnswers()
						
						uni.hideLoading()
						uni.showToast({
							title: '测评完成',
							icon: 'success',
							duration: 1500
						})
						
						// 延迟跳转，确保数据已保存
						setTimeout(() => {
							console.log('准备跳转到报告页，reportId:', report.id)
							// 再次验证报告是否存在
							const verifyReport = store.getReportById(report.id)
							if (!verifyReport) {
								console.error('报告不存在，无法跳转')
								uni.showModal({
									title: '错误',
									content: '报告生成失败，请重新测评',
									showCancel: false
								})
								return
							}
							
							uni.redirectTo({
								url: `/pages/report-result/report-result?reportId=${report.id}`,
								success: () => {
									console.log('跳转成功')
								},
								fail: (err) => {
									console.error('跳转失败：', err)
									uni.showModal({
										title: '跳转失败',
										content: '请手动查看历史报告',
										showCancel: false,
										success: () => {
											uni.switchTab({
												url: '/pages/home/home'
											})
										}
									})
								}
							})
						}, 1500)
					} catch (error) {
						uni.hideLoading()
						console.error('提交失败，错误详情：', error)
						console.error('错误堆栈：', error.stack)
						uni.showModal({
							title: '提交失败',
							content: error.message || '未知错误，请重试',
							showCancel: false
						})
					}
				}, 100)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.quiz-question-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 40rpx 30rpx 120rpx;
	}
	
	.progress-header {
		margin-bottom: 40rpx;
		
		.question-num {
			display: block;
			font-size: 28rpx;
			color: #666;
			margin-bottom: 20rpx;
			text-align: center;
		}
		
		.progress-bar {
			width: 100%;
			height: 8rpx;
			background: #E0E0E0;
			border-radius: 4rpx;
			overflow: hidden;
			
			.progress-fill {
				height: 100%;
				background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
				transition: width 0.3s;
			}
		}
	}
	
	.question-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		&.fadeIn {
			animation: fadeIn 0.3s;
		}
		
		.question-text {
			font-size: 36rpx;
			color: #333;
			line-height: 1.6;
		}
	}
	
	.options-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-bottom: 40rpx;
	}
	
	.option-card {
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s;
		
		&.active {
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
			
			.option-label {
				color: #FFFFFF;
			}
		}
		
		.option-label {
			font-size: 32rpx;
			color: #333;
			line-height: 1.5;
		}
	}
	
	.footer-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFF;
		padding: 20rpx 30rpx;
		display: flex;
		gap: 20rpx;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.btn {
			flex: 1;
			height: 88rpx;
			border-radius: 44rpx;
			font-size: 32rpx;
			font-weight: 600;
			border: none;
			
			&.btn-secondary {
				background: #F5F7FA;
				color: #666;
			}
			
			&.btn-primary {
				background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
				color: #FFF;
				
			&.disabled {
				opacity: 0.5;
				pointer-events: none;
			}
			
			&[disabled] {
				opacity: 0.5;
				pointer-events: none;
			}
			}
		}
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(-20rpx);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>

