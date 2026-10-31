<template>
	<view class="home-page">
		<!-- 积分显示区域 -->
		<view class="points-section">
			<view class="points-card">
				<text class="points-label">当前积分</text>
				<text class="points-value">{{ gamePoints }}</text>
			</view>
			<view class="points-card">
				<text class="points-label">可兑换金额</text>
				<text class="points-value money">¥{{ redeemableMoney }}</text>
			</view>
		</view>
		
		<view class="header-banner" :class="statusClass">
			<text class="status-text">{{ statusText }}</text>
		</view>
		
		<!-- 游戏区域 -->
		<view class="game-section">
			<view class="section-header">
				<text class="section-title">🎮 飞机打病毒游戏</text>
				<text class="section-subtitle">每消灭一个病毒+10积分</text>
			</view>
			<airplane-game ref="game" @points-updated="handlePointsUpdated"></airplane-game>
		</view>
		
		<view class="metrics-cards">
			<view class="metric-card" v-for="(item, index) in metrics" :key="index">
				<text class="metric-label">{{ item.label }}</text>
				<text class="metric-value">{{ item.value }}</text>
				<text class="metric-desc" v-if="item.desc">{{ item.desc }}</text>
			</view>
		</view>
		
		<button class="primary-btn" @click="handleStartQuiz">开始测评</button>
		
		<!-- 推荐营养品区域 -->
		<view class="recommendation-section" v-if="recommendations.length > 0">
			<view class="section-header">
				<text class="section-title">推荐营养品</text>
				<text class="section-subtitle" v-if="latestReport">基于最近一次测评</text>
			</view>
			<view class="recommendation-list">
				<view 
					class="recommendation-card" 
					v-for="(rec, index) in recommendations" 
					:key="index"
					@click="handleViewProduct(rec)"
				>
					<view class="rec-icon">💊</view>
					<view class="rec-content">
						<text class="rec-name">{{ rec.name }}</text>
						<text class="rec-dose" v-if="rec.dose">{{ rec.dose }}</text>
						<text class="rec-type" v-if="rec.type === 'formula'">组合装</text>
						<text class="rec-type" v-else>单品</text>
					</view>
					<text class="rec-arrow">></text>
				</view>
			</view>
			<view class="view-more" @click="handleViewReport" v-if="latestReport">
				<text>查看完整报告 ></text>
			</view>
		</view>
		
		<!-- 无推荐时的提示 -->
		<view class="no-recommendation" v-else>
			<text class="no-rec-icon">💡</text>
			<text class="no-rec-text">完成测评后，将为您推荐合适的营养品</text>
			<button class="no-rec-btn" @click="handleStartQuiz">立即测评</button>
		</view>
		
		<view class="quick-actions">
			<view class="action-item" @click="handleEditProfile">
				<text class="action-icon">✏️</text>
				<text class="action-label">编辑档案</text>
			</view>
			<view class="action-item" @click="handleViewHistory">
				<text class="action-icon">📋</text>
				<text class="action-label">历史报告</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	import { calcAge, calcBMI, calcTargetHeight } from '../../utils/calcUtils.js'
	import AirplaneGame from '../../components/airplane-game/airplane-game.vue'
	
	export default {
		components: {
			AirplaneGame
		},
		data() {
			return {
				profile: null,
				latestReport: null,
				recommendations: []
			}
		},
		computed: {
			statusText() {
				if (!this.profile) return '欢迎使用成长助手'
				
				const age = calcAge(this.profile.birthDate)
				const bmi = calcBMI(this.profile.height, this.profile.weight)
				
				if (bmi.status === '正常' && age.years < 18) {
					return '你的成长状况良好，继续保持！'
				} else if (bmi.status === '偏瘦' || bmi.status === '偏胖') {
					return '建议关注营养均衡和运动习惯'
				} else {
					return '科学管理，助力成长'
				}
			},
			statusClass() {
				if (!this.profile) return 'default'
				const bmi = calcBMI(this.profile.height, this.profile.weight)
				if (bmi.status === '正常') return 'good'
				return 'normal'
			},
			metrics() {
				if (!this.profile) return []
				
				const age = calcAge(this.profile.birthDate)
				const bmi = calcBMI(this.profile.height, this.profile.weight)
				const target = calcTargetHeight(
					this.profile.gender,
					this.profile.fatherHeight,
					this.profile.motherHeight
				)
				
				return [
					{
						label: '年龄',
						value: `${age.years}岁${age.months}个月`
					},
					{
						label: 'BMI',
						value: bmi.bmi,
						desc: bmi.status
					},
					{
						label: '遗传靶身高',
						value: `${target.min}-${target.max}cm`
					}
				]
			},
			gamePoints() {
				return store.getGamePoints()
			},
			redeemableMoney() {
				return store.getRedeemableMoney()
			}
		},
		onLoad() {
			this.loadProfile()
			this.loadRecommendations()
		},
		onShow() {
			this.loadProfile()
			this.loadRecommendations()
			// 刷新积分显示
			this.$forceUpdate()
		},
		methods: {
			loadProfile() {
				this.profile = store.getProfile()
				if (!this.profile) {
					// 无档案，跳转到建档页
					uni.redirectTo({
						url: '/pages/profile-setup/profile-setup'
					})
				}
			},
			loadRecommendations() {
				// 加载最近一次报告的推荐
				this.latestReport = store.getLatestReport()
				if (this.latestReport && this.latestReport.result && this.latestReport.result.recommendations) {
					// 只显示前3个推荐，避免首页过长
					this.recommendations = this.latestReport.result.recommendations.slice(0, 3)
				} else {
					this.recommendations = []
				}
			},
			handleViewProduct(rec) {
				// 跳转到商品详情页
				uni.navigateTo({
					url: `/pages/product-detail/product-detail?id=${rec.id}&type=${rec.type}`
				})
			},
			handleViewReport() {
				if (this.latestReport) {
					uni.navigateTo({
						url: `/pages/report-result/report-result?reportId=${this.latestReport.id}`
					})
				} else {
					uni.navigateTo({
						url: '/pages/quiz-start/quiz-start'
					})
				}
			},
			handleStartQuiz() {
				if (!this.profile) {
					uni.redirectTo({
						url: '/pages/profile-setup/profile-setup'
					})
					return
				}
				// 清空之前的答题记录
				store.clearQuizAnswers()
				// 直接跳转到答题页面
				uni.navigateTo({
					url: '/pages/quiz-question/quiz-question?currentIndex=1'
				})
			},
			handleEditProfile() {
				uni.navigateTo({
					url: '/pages/profile-edit/profile-edit'
				})
			},
			handleViewHistory() {
				uni.navigateTo({
					url: '/pages/report-history/report-history'
				})
			},
			handlePointsUpdated(newPoints) {
				// 积分更新时刷新显示
				this.$forceUpdate()
				// 确保积分和可兑换金额实时更新
				this.$nextTick(() => {
					this.$forceUpdate()
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.home-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx;
	}
	
	.header-banner {
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		margin-bottom: 40rpx;
		text-align: center;
		
		&.good {
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		}
		
		&.normal {
			background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
		}
		
		.status-text {
			font-size: 36rpx;
			font-weight: 600;
			color: #FFFFFF;
		}
	}
	
	.metrics-cards {
		display: flex;
		gap: 20rpx;
		margin-bottom: 40rpx;
	}
	
	.metric-card {
		flex: 1;
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 30rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.metric-label {
			font-size: 24rpx;
			color: #999;
		}
		
		.metric-value {
			font-size: 36rpx;
			font-weight: 600;
			color: #00C9A7;
		}
		
		.metric-desc {
			font-size: 22rpx;
			color: #666;
		}
	}
	
	.primary-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		color: #FFFFFF;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 48rpx;
		border: none;
		margin-bottom: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(0, 201, 167, 0.3);
	}
	
	.quick-actions {
		display: flex;
		gap: 20rpx;
	}
	
	.action-item {
		flex: 1;
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 40rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.action-icon {
			font-size: 48rpx;
		}
		
		.action-label {
			font-size: 28rpx;
			color: #333;
		}
	}
	
	.recommendation-section {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;
			
			.section-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
			
			.section-subtitle {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.recommendation-list {
			display: flex;
			flex-direction: column;
			gap: 20rpx;
		}
		
		.recommendation-card {
			display: flex;
			align-items: center;
			gap: 20rpx;
			padding: 24rpx;
			background: #F5F7FA;
			border-radius: 16rpx;
			transition: all 0.3s;
			
			&:active {
				background: #E8F5E9;
				transform: scale(0.98);
			}
			
			.rec-icon {
				font-size: 48rpx;
				width: 80rpx;
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				background: linear-gradient(135deg, rgba(0, 201, 167, 0.1) 0%, rgba(0, 168, 204, 0.1) 100%);
				border-radius: 16rpx;
			}
			
			.rec-content {
				flex: 1;
				display: flex;
				flex-direction: column;
				gap: 8rpx;
				
				.rec-name {
					font-size: 30rpx;
					font-weight: 600;
					color: #333;
				}
				
				.rec-dose {
					font-size: 24rpx;
					color: #666;
				}
				
				.rec-type {
					display: inline-block;
					padding: 4rpx 12rpx;
					background: rgba(0, 201, 167, 0.1);
					color: #00C9A7;
					border-radius: 8rpx;
					font-size: 22rpx;
					align-self: flex-start;
				}
			}
			
			.rec-arrow {
				font-size: 28rpx;
				color: #999;
			}
		}
		
		.view-more {
			margin-top: 20rpx;
			text-align: center;
			padding: 20rpx;
			color: #00C9A7;
			font-size: 28rpx;
		}
	}
	
	.no-recommendation {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 60rpx 40rpx;
		margin-bottom: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.no-rec-icon {
			font-size: 80rpx;
		}
		
		.no-rec-text {
			font-size: 28rpx;
			color: #666;
			text-align: center;
			line-height: 1.6;
		}
		
	.no-rec-btn {
		margin-top: 20rpx;
		padding: 16rpx 40rpx;
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		color: #FFFFFF;
		font-size: 28rpx;
		border-radius: 24rpx;
		border: none;
	}
	
	.points-section {
		display: flex;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}
	
	.points-card {
		flex: 1;
		background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
		border-radius: 16rpx;
		padding: 30rpx 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(255, 215, 0, 0.3);
		
		.points-label {
			font-size: 24rpx;
			color: rgba(255, 255, 255, 0.9);
		}
		
		.points-value {
			font-size: 40rpx;
			font-weight: 700;
			color: #FFFFFF;
			
			&.money {
				font-size: 36rpx;
			}
		}
	}
	
	.game-section {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
		margin-bottom: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.section-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
			}
			
			.section-subtitle {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}
</style>

