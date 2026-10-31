<template>
	<view class="report-history-page">
		<view v-if="reports.length === 0" class="empty-state">
			<text class="empty-icon">📋</text>
			<text class="empty-text">暂无历史报告</text>
			<button class="empty-btn" @click="handleStartQuiz">开始测评</button>
		</view>
		
		<view v-else class="report-list">
			<view 
				class="report-item" 
				v-for="report in reports" 
				:key="report.id"
				@click="handleViewReport(report.id)"
			>
				<view class="report-header">
					<text class="report-date">{{ formatDate(report.createdAt) }}</text>
					<text class="report-status" :class="getStatusClass(report.result.level)">
						{{ getStatusLabel(report.result.level) }}
					</text>
				</view>
				<view class="report-summary">
					<text>{{ report.result.summary }}</text>
				</view>
				<view class="report-recommendation">
					<text class="rec-label">推荐：</text>
					<text class="rec-text">{{ getRecommendationText(report.result.recommendations) }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	
	export default {
		data() {
			return {
				reports: []
			}
		},
		onLoad() {
			this.loadReports()
		},
		onShow() {
			this.loadReports()
		},
		methods: {
			loadReports() {
				this.reports = store.getReports()
			},
			formatDate(dateString) {
				const date = new Date(dateString)
				const year = date.getFullYear()
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				return `${year}-${month}-${day}`
			},
			getStatusLabel(level) {
				const labels = {
					excellent: '优秀',
					good: '良好',
					normal: '正常',
					need_attention: '需关注'
				}
				return labels[level] || '正常'
			},
			getStatusClass(level) {
				return level
			},
			getRecommendationText(recommendations) {
				if (!recommendations || recommendations.length === 0) {
					return '暂无推荐'
				}
				const names = recommendations.map(r => r.name).join('、')
				return names.length > 20 ? names.substring(0, 20) + '...' : names
			},
			handleViewReport(reportId) {
				uni.navigateTo({
					url: `/pages/report-result/report-result?reportId=${reportId}`
				})
			},
			handleStartQuiz() {
				uni.navigateTo({
					url: '/pages/quiz-start/quiz-start'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.report-history-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx;
	}
	
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 200rpx 40rpx;
		
		.empty-icon {
			font-size: 120rpx;
			margin-bottom: 40rpx;
		}
		
		.empty-text {
			font-size: 32rpx;
			color: #999;
			margin-bottom: 60rpx;
		}
		
		.empty-btn {
			width: 300rpx;
			height: 88rpx;
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
			color: #FFFFFF;
			font-size: 32rpx;
			font-weight: 600;
			border-radius: 44rpx;
			border: none;
		}
	}
	
	.report-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.report-item {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.report-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.report-date {
				font-size: 28rpx;
				color: #666;
			}
			
			.report-status {
				padding: 8rpx 20rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				
				&.excellent {
					background: rgba(0, 201, 167, 0.1);
					color: #00C9A7;
				}
				
				&.good {
					background: rgba(76, 175, 80, 0.1);
					color: #4CAF50;
				}
				
				&.normal {
					background: rgba(255, 167, 38, 0.1);
					color: #FFA726;
				}
				
				&.need_attention {
					background: rgba(255, 107, 107, 0.1);
					color: #FF6B6B;
				}
			}
		}
		
		.report-summary {
			font-size: 28rpx;
			color: #333;
			line-height: 1.6;
			margin-bottom: 20rpx;
		}
		
		.report-recommendation {
			display: flex;
			align-items: center;
			gap: 10rpx;
			
			.rec-label {
				font-size: 24rpx;
				color: #999;
			}
			
			.rec-text {
				font-size: 26rpx;
				color: #00C9A7;
			}
		}
	}
</style>

