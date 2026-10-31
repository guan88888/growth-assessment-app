<template>
	<view class="report-result-page">
		<!-- 加载状态 -->
		<view v-if="!report" class="loading-state">
			<text>加载中...</text>
		</view>
		
		<!-- 报告内容 -->
		<view v-else>
			<!-- 评价区域 -->
			<view class="rating-section" v-if="!hasRated">
				<text class="rating-title">您感觉这次测评怎么样？</text>
				<view class="stars-container">
					<view 
						class="star-wrapper" 
						v-for="(star, index) in 5" 
						:key="index"
					>
						<view 
							class="star-half star-left" 
							@click="handleStarClick(index, 0.5)"
						>
							<view class="star-bg">
								<text class="star-icon">⭐</text>
							</view>
							<view 
								class="star-fill" 
								:style="{ width: getStarFillWidth(index, 0.5) + '%' }"
							>
								<text class="star-icon">⭐</text>
							</view>
						</view>
						<view 
							class="star-half star-right" 
							@click="handleStarClick(index, 1)"
						>
							<view class="star-bg">
								<text class="star-icon">⭐</text>
							</view>
							<view 
								class="star-fill" 
								:style="{ width: getStarFillWidth(index, 1) + '%' }"
							>
								<text class="star-icon">⭐</text>
							</view>
						</view>
					</view>
				</view>
				<text class="rating-hint" v-if="rating > 0">{{ getRatingText() }}</text>
			</view>
			
			<!-- 总览卡 -->
			<view class="overview-card" :class="statusClass">
				<text class="status-label">{{ statusLabel }}</text>
				<text class="summary-text">{{ report.result.summary }}</text>
			</view>
		
		<!-- 关键指标卡 -->
		<view class="metrics-card">
			<text class="card-title">关键指标</text>
			<view class="metrics-list">
				<view class="metric-item" v-for="(item, index) in metrics" :key="index">
					<text class="metric-label">{{ item.label }}</text>
					<text class="metric-value">{{ item.value }}</text>
				</view>
			</view>
		</view>
		
		<!-- 推荐方案卡 -->
		<view class="recommendation-card">
			<text class="card-title">推荐方案</text>
			
			<view v-if="report.result.blockedReasons && report.result.blockedReasons.length > 0">
				<view class="blocked-reason" v-for="(reason, index) in report.result.blockedReasons" :key="index">
					<text class="blocked-text">⚠️ {{ reason }}</text>
				</view>
			</view>
			
			<view v-if="report.result.recommendations && report.result.recommendations.length > 0">
				<view 
					class="recommendation-item" 
					v-for="(rec, index) in report.result.recommendations" 
					:key="index"
					@click="handleViewProduct(rec)"
				>
					<view class="rec-header">
						<text class="rec-name">{{ rec.name }}</text>
						<text class="rec-dose" v-if="rec.dose">{{ rec.dose }}</text>
					</view>
					
					<view class="rec-reason">
						<text class="reason-label">为什么推荐：</text>
						<text class="reason-text">{{ rec.reason }}</text>
					</view>
					
					<view class="rec-precautions" v-if="rec.precautions">
						<view class="precautions-header" @click.stop="togglePrecautions(index)">
							<text class="precautions-label">注意事项</text>
							<text class="precautions-arrow">{{ expandedPrecautions[index] ? '▼' : '▶' }}</text>
						</view>
						<view class="precautions-content" v-if="expandedPrecautions[index]">
							<text>{{ rec.precautions }}</text>
						</view>
					</view>
					
					<view class="rec-items" v-if="rec.items">
						<text class="items-label">包含：</text>
						<view class="items-list">
							<text 
								class="item-tag" 
								v-for="itemId in rec.items" 
								:key="itemId"
							>
								{{ getSupplementName(itemId) }}
							</text>
						</view>
					</view>
				</view>
			</view>
			
			<view v-else class="no-recommendation">
				<text>暂无推荐方案</text>
			</view>
		</view>
		
		<!-- 行动建议清单 -->
		<view class="action-card">
			<text class="card-title">行动建议</text>
			<view class="action-list">
				<view 
					class="action-item" 
					v-for="(item, index) in report.result.actionItems" 
					:key="index"
				>
					<view 
						class="checkbox" 
						:class="{ checked: item.checked }"
						@click="toggleAction(index)"
					>
						<text v-if="item.checked">✓</text>
					</view>
					<text class="action-text">{{ item.text }}</text>
				</view>
			</view>
		</view>
		
		<!-- 底部按钮 -->
		<view class="footer-actions">
			<button class="btn btn-secondary" @click="handleViewHistory">历史报告</button>
			<button class="btn btn-primary" @click="handleViewPlan">30天计划</button>
		</view>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	import { supplements } from '../../data/mockData.js'
	import { calcAge, calcBMI, calcTargetHeight } from '../../utils/calcUtils.js'
	
	export default {
		data() {
			return {
				report: null,
				expandedPrecautions: {}
			}
		},
		computed: {
			statusClass() {
				if (!this.report || !this.report.result) return 'normal'
				const level = this.report.result.level
				if (level === 'excellent') return 'excellent'
				if (level === 'good') return 'good'
				if (level === 'need_attention') return 'attention'
				return 'normal'
			},
			statusLabel() {
				if (!this.report || !this.report.result) return '正常'
				const level = this.report.result.level
				const labels = {
					excellent: '优秀',
					good: '良好',
					normal: '正常',
					need_attention: '需关注'
				}
				return labels[level] || '正常'
			},
			metrics() {
				if (!this.report || !this.report.profile) return []
				
				const profile = this.report.profile
				const age = calcAge(profile.birthDate)
				const bmi = calcBMI(profile.height, profile.weight)
				const target = calcTargetHeight(
					profile.gender,
					profile.fatherHeight,
					profile.motherHeight
				)
				
				const metrics = [
					{ label: '年龄', value: `${age.years}岁${age.months}个月` },
					{ label: '身高', value: `${profile.height}cm` },
					{ label: '体重', value: `${profile.weight}kg` },
					{ label: 'BMI', value: `${bmi.bmi} (${bmi.status})` },
					{ label: '遗传靶身高', value: `${target.min}-${target.max}cm` }
				]
				
				if (profile.boneAge) {
					metrics.push({ label: '骨龄', value: `${profile.boneAge}岁` })
				}
				
				return metrics
			}
		},
		onLoad(options) {
			console.log('报告页加载，reportId:', options.reportId)
			this.loadReport(options.reportId)
		},
		onShow() {
			// TabBar 点击时，如果没有 reportId，重新加载最近一次报告
			if (!this.report) {
				this.loadReport()
			}
		},
		onTabItemTap() {
			// TabBar 点击处理
			const report = store.getLatestReport()
			if (!report) {
				uni.navigateTo({
					url: '/pages/quiz-start/quiz-start'
				})
			} else {
				// 有报告，加载最近一次报告
				this.loadReport()
			}
		},
		methods: {
			loadReport(reportId) {
				if (reportId) {
					const report = store.getReportById(reportId)
					if (report) {
						console.log('加载报告成功:', report.id)
						console.log('推荐方案数量:', report.result?.recommendations?.length || 0)
						console.log('推荐详情:', JSON.stringify(report.result?.recommendations))
						this.report = report
						
						// 检查是否已评价
						if (report.rating !== undefined && report.rating !== null) {
							this.rating = report.rating
							this.hasRated = true
						}
					} else {
						console.error('报告不存在:', reportId)
						uni.showToast({
							title: '报告不存在',
							icon: 'none'
						})
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/home/home'
							})
						}, 1500)
					}
				} else {
					// 没有 reportId，显示最近一次报告
					const report = store.getLatestReport()
					if (report) {
						console.log('加载最近报告成功:', report.id)
						console.log('推荐方案数量:', report.result?.recommendations?.length || 0)
						this.report = report
						
						// 检查是否已评价
						if (report.rating !== undefined && report.rating !== null) {
							this.rating = report.rating
							this.hasRated = true
						}
					} else {
						console.log('暂无报告')
						uni.showToast({
							title: '暂无报告',
							icon: 'none'
						})
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/quiz-start/quiz-start'
							})
						}, 1500)
					}
				}
			},
			getSupplementName(id) {
				return supplements[id]?.name || id
			},
			handleStarClick(index, value) {
				// value: 0.5 表示半星，1 表示整星
				this.rating = index + value
				this.saveRating()
			},
			getStarFillWidth(index, half) {
				// 计算每颗星的填充宽度
				// half: 0.5 表示左半部分，1 表示右半部分
				const starValue = index + half
				
				if (this.rating < starValue) {
					return 0
				} else if (this.rating >= starValue) {
					return 100
				}
				return 0
			},
			getRatingText() {
				if (this.rating === 0) return ''
				if (this.rating <= 1) return '非常不满意'
				if (this.rating <= 2) return '不满意'
				if (this.rating <= 3) return '一般'
				if (this.rating <= 4) return '满意'
				return '非常满意'
			},
			saveRating() {
				if (this.report && this.rating > 0) {
					// 保存评分到报告
					this.report.rating = this.rating
					this.report.ratedAt = new Date().toISOString()
					store.saveReport(this.report)
					
					// 延迟标记为已评价，让用户看到评分效果
					setTimeout(() => {
						this.hasRated = true
						uni.showToast({
							title: '评价成功',
							icon: 'success',
							duration: 1000
						})
					}, 500)
				}
			},
			handleViewProduct(rec) {
				// 跳转到商品详情页
				uni.navigateTo({
					url: `/pages/product-detail/product-detail?id=${rec.id}&type=${rec.type}`
				})
			},
			togglePrecautions(index) {
				this.$set(this.expandedPrecautions, index, !this.expandedPrecautions[index])
			},
			toggleAction(index) {
				this.report.result.actionItems[index].checked = !this.report.result.actionItems[index].checked
				store.saveReport(this.report)
			},
			handleViewHistory() {
				uni.navigateTo({
					url: '/pages/report-history/report-history'
				})
			},
			handleViewPlan() {
				// 保存当前报告到计划
				if (this.report) {
					const plan = {
						reportId: this.report.id,
						actionItems: JSON.parse(JSON.stringify(this.report.result.actionItems)),
						createdAt: new Date().toISOString()
					}
					store.savePlan(plan)
				}
				
				uni.navigateTo({
					url: '/pages/action-plan/action-plan'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.report-result-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx 30rpx 160rpx;
	}
	
	.loading-state {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 200rpx 40rpx;
		font-size: 32rpx;
		color: #999;
	}
	
	.rating-section {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		margin-bottom: 30rpx;
		text-align: center;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.rating-title {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 40rpx;
		}
		
		.stars-container {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 20rpx;
			margin-bottom: 30rpx;
		}
		
		.star-wrapper {
			position: relative;
			width: 60rpx;
			height: 60rpx;
			display: flex;
			
			.star-half {
				position: relative;
				width: 50%;
				height: 100%;
				overflow: hidden;
				cursor: pointer;
				
				&.star-left {
					.star-icon {
						position: absolute;
						left: 0;
					}
					
					.star-fill {
						left: 0;
					}
				}
				
				&.star-right {
					.star-icon {
						position: absolute;
						right: 0;
					}
					
					.star-fill {
						right: 0;
					}
				}
				
				.star-bg {
					width: 100%;
					height: 100%;
					position: absolute;
					top: 0;
					
					.star-icon {
						font-size: 60rpx;
						color: #E0E0E0;
						display: block;
					}
				}
				
				.star-fill {
					width: 0%;
					height: 100%;
					position: absolute;
					top: 0;
					overflow: hidden;
					transition: width 0.2s;
					
					.star-icon {
						font-size: 60rpx;
						color: #FFD700;
						display: block;
					}
				}
			}
		}
		
		.rating-hint {
			display: block;
			font-size: 28rpx;
			color: #00C9A7;
			font-weight: 500;
		}
	}
	
	.overview-card {
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		margin-bottom: 30rpx;
		text-align: center;
		
		&.excellent {
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		}
		
		&.good {
			background: linear-gradient(135deg, #4CAF50 0%, #00C9A7 100%);
		}
		
		&.normal {
			background: linear-gradient(135deg, #FFA726 0%, #FF9800 100%);
		}
		
		&.attention {
			background: linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%);
		}
		
		.status-label {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #FFFFFF;
			margin-bottom: 20rpx;
		}
		
		.summary-text {
			display: block;
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.9);
			line-height: 1.6;
		}
	}
	
	.metrics-card,
	.recommendation-card,
	.action-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 40rpx;
		margin-bottom: 30rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.card-title {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 30rpx;
		}
	}
	
	.metrics-list {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		
		.metric-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-bottom: 24rpx;
			border-bottom: 1rpx solid #F0F0F0;
			
			&:last-child {
				border-bottom: none;
				padding-bottom: 0;
			}
			
			.metric-label {
				font-size: 28rpx;
				color: #666;
			}
			
			.metric-value {
				font-size: 28rpx;
				font-weight: 600;
				color: #333;
			}
		}
	}
	
	.blocked-reason {
		background: #FFF3E0;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		
		.blocked-text {
			font-size: 26rpx;
			color: #FF6B00;
		}
	}
	
	.recommendation-item {
		background: #F5F7FA;
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		cursor: pointer;
		transition: all 0.3s;
		
		&:active {
			background: #E8F5E9;
			transform: scale(0.98);
		}
		
		&:last-child {
			margin-bottom: 0;
		}
		
		.rec-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20rpx;
			
			.rec-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #00C9A7;
			}
			
			.rec-dose {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.rec-reason {
			margin-bottom: 20rpx;
			
			.reason-label {
				display: block;
				font-size: 26rpx;
				color: #666;
				margin-bottom: 10rpx;
			}
			
			.reason-text {
				display: block;
				font-size: 28rpx;
				color: #333;
				line-height: 1.6;
			}
		}
		
		.rec-precautions {
			margin-bottom: 20rpx;
			
			.precautions-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 16rpx;
				background: #FFFFFF;
				border-radius: 8rpx;
				
				.precautions-label {
					font-size: 26rpx;
					color: #666;
				}
				
				.precautions-arrow {
					font-size: 24rpx;
					color: #999;
				}
			}
			
			.precautions-content {
				padding: 16rpx;
				background: #FFFFFF;
				border-radius: 8rpx;
				margin-top: 10rpx;
				font-size: 26rpx;
				color: #666;
				line-height: 1.6;
			}
		}
		
		.rec-items {
			.items-label {
				display: block;
				font-size: 26rpx;
				color: #666;
				margin-bottom: 10rpx;
			}
			
			.items-list {
				display: flex;
				flex-wrap: wrap;
				gap: 12rpx;
				
				.item-tag {
					padding: 8rpx 16rpx;
					background: #FFFFFF;
					border-radius: 8rpx;
					font-size: 24rpx;
					color: #00C9A7;
				}
			}
		}
	}
	
	.no-recommendation {
		text-align: center;
		padding: 40rpx;
		color: #999;
		font-size: 28rpx;
	}
	
	.action-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
		
		.action-item {
			display: flex;
			align-items: flex-start;
			gap: 20rpx;
			
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
			
			.action-text {
				flex: 1;
				font-size: 28rpx;
				color: #333;
				line-height: 1.6;
			}
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
			}
		}
	}
</style>

