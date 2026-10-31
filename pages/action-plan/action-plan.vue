<template>
	<view class="action-plan-page">
		<view class="today-section">
			<text class="section-title">今日任务</text>
			<view class="task-list">
				<view 
					class="task-item" 
					v-for="(item, index) in todayTasks" 
					:key="index"
				>
					<view 
						class="checkbox" 
						:class="{ checked: item.checked }"
						@click="toggleTask(index)"
					>
						<text v-if="item.checked">✓</text>
					</view>
					<view class="task-content">
						<text class="task-category">{{ getCategoryLabel(item.category) }}</text>
						<text class="task-text">{{ item.text }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<view class="progress-section">
			<text class="section-title">本周进度</text>
			<view class="progress-card">
				<view class="progress-info">
					<text class="progress-label">已完成</text>
					<text class="progress-value">{{ completedCount }}/{{ totalCount }}</text>
				</view>
				<view class="progress-bar">
					<view 
						class="progress-fill" 
						:style="{ width: progressPercent + '%' }"
					></view>
				</view>
			</view>
		</view>
		
		<view class="reminder-section">
			<button class="reminder-btn" @click="handleReminder">
				<text class="reminder-icon">🔔</text>
				<text class="reminder-text">设置复测提醒</text>
			</button>
		</view>
		
		<view class="achievement-section" v-if="showAchievement">
			<view class="achievement-card">
				<text class="achievement-icon">🎉</text>
				<text class="achievement-text">今日任务全部完成！</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	
	export default {
		data() {
			return {
				todayTasks: [],
				showAchievement: false
			}
		},
		computed: {
			completedCount() {
				return this.todayTasks.filter(t => t.checked).length
			},
			totalCount() {
				return this.todayTasks.length
			},
			progressPercent() {
				if (this.totalCount === 0) return 0
				return (this.completedCount / this.totalCount) * 100
			}
		},
		onLoad() {
			this.loadPlan()
		},
		methods: {
			loadPlan() {
				const plan = store.getPlan()
				if (plan && plan.actionItems) {
					this.todayTasks = JSON.parse(JSON.stringify(plan.actionItems))
				} else {
					// 如果没有计划，从最近一次报告获取
					const report = store.getLatestReport()
					if (report && report.result && report.result.actionItems) {
						this.todayTasks = JSON.parse(JSON.stringify(report.result.actionItems))
					} else {
						// 默认任务
						this.todayTasks = [
							{ text: '保证每天22:00前睡觉，睡眠时长9小时以上', category: 'sleep', checked: false },
							{ text: '每周至少3次户外运动，每次30分钟以上', category: 'exercise', checked: false },
							{ text: '每天保证一杯牛奶、一个鸡蛋、适量豆制品', category: 'nutrition', checked: false }
						]
					}
				}
			},
			getCategoryLabel(category) {
				const labels = {
					sleep: '睡眠',
					exercise: '运动',
					nutrition: '饮食',
					maintain: '保持',
					monitor: '监测'
				}
				return labels[category] || '其他'
			},
			toggleTask(index) {
				this.todayTasks[index].checked = !this.todayTasks[index].checked
				this.savePlan()
				
				// 检查是否全部完成
				if (this.completedCount === this.totalCount && this.totalCount > 0) {
					this.showAchievement = true
					setTimeout(() => {
						this.showAchievement = false
					}, 3000)
				}
			},
			savePlan() {
				const today = new Date().toISOString().split('T')[0]
				store.updatePlanCheckin(today, this.todayTasks)
			},
			handleReminder() {
				uni.showToast({
					title: '提醒功能开发中',
					icon: 'none'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.action-plan-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx;
	}
	
	.section-title {
		display: block;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 24rpx;
	}
	
	.today-section {
		margin-bottom: 40rpx;
		
		.task-list {
			display: flex;
			flex-direction: column;
			gap: 20rpx;
		}
		
		.task-item {
			background: #FFFFFF;
			border-radius: 16rpx;
			padding: 30rpx;
			display: flex;
			align-items: flex-start;
			gap: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			
			.checkbox {
				width: 40rpx;
				height: 40rpx;
				border: 2rpx solid #E0E0E0;
				border-radius: 8rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				margin-top: 4rpx;
				
				&.checked {
					background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
					border-color: #00C9A7;
					color: #FFFFFF;
					font-size: 24rpx;
				}
			}
			
			.task-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				
				.task-category {
					font-size: 24rpx;
					color: #00C9A7;
					padding: 4rpx 12rpx;
					background: rgba(0, 201, 167, 0.1);
					border-radius: 8rpx;
					align-self: flex-start;
				}
				
				.task-text {
					font-size: 28rpx;
					color: #333;
					line-height: 1.6;
				}
			}
		}
	}
	
	.progress-section {
		margin-bottom: 40rpx;
		
		.progress-card {
			background: #FFFFFF;
			border-radius: 16rpx;
			padding: 30rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			
			.progress-info {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
				
				.progress-label {
					font-size: 28rpx;
					color: #666;
				}
				
				.progress-value {
					font-size: 32rpx;
					font-weight: 600;
					color: #00C9A7;
				}
			}
			
			.progress-bar {
				width: 100%;
				height: 12rpx;
				background: #E0E0E0;
				border-radius: 6rpx;
				overflow: hidden;
				
				.progress-fill {
					height: 100%;
					background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
					transition: width 0.3s;
				}
			}
		}
	}
	
	.reminder-section {
		margin-bottom: 40rpx;
		
		.reminder-btn {
			width: 100%;
			height: 96rpx;
			background: #FFFFFF;
			border-radius: 16rpx;
			border: 2rpx solid #E0E0E0;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 16rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			
			.reminder-icon {
				font-size: 36rpx;
			}
			
			.reminder-text {
				font-size: 32rpx;
				color: #333;
			}
		}
	}
	
	.achievement-section {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 999;
		animation: fadeInOut 3s;
		
		.achievement-card {
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
			border-radius: 24rpx;
			padding: 40rpx 60rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 20rpx;
			box-shadow: 0 8rpx 24rpx rgba(0, 201, 167, 0.3);
			
			.achievement-icon {
				font-size: 60rpx;
			}
			
			.achievement-text {
				font-size: 32rpx;
				font-weight: 600;
				color: #FFFFFF;
			}
		}
	}
	
	@keyframes fadeInOut {
		0%, 100% {
			opacity: 0;
			transform: translate(-50%, -50%) scale(0.8);
		}
		20%, 80% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(1);
		}
	}
</style>

