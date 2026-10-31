<template>
	<view class="quiz-start-page">
		<view class="intro-card">
			<text class="intro-title">快速测评</text>
			<text class="intro-desc">约2分钟完成，了解你的成长状况</text>
		</view>
		
		<view class="info-card">
			<view class="info-item">
				<text class="info-icon">📝</text>
				<text class="info-text">共15道题目</text>
			</view>
			<view class="info-item">
				<text class="info-icon">⏱️</text>
				<text class="info-text">不显示分数</text>
			</view>
			<view class="info-item">
				<text class="info-icon">↩️</text>
				<text class="info-text">可返回修改</text>
			</view>
		</view>
		
		<button class="start-btn" @click="handleStart">开始测评</button>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	
	export default {
		onLoad() {
			// 检查是否有档案
			const profile = store.getProfile()
			if (!profile) {
				uni.redirectTo({
					url: '/pages/profile-setup/profile-setup'
				})
			}
		},
		onTabItemTap() {
			// TabBar 点击处理
			const profile = store.getProfile()
			if (!profile) {
				uni.redirectTo({
					url: '/pages/profile-setup/profile-setup'
				})
			}
			// 已有档案，停留在当前页（测评入口页）
		},
		methods: {
			handleStart() {
				// 清空之前的答题记录
				store.clearQuizAnswers()
				
				uni.navigateTo({
					url: '/pages/quiz-question/quiz-question?currentIndex=1'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.quiz-start-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 60rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.intro-card {
		text-align: center;
		margin-bottom: 60rpx;
		
		.intro-title {
			display: block;
			font-size: 48rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 20rpx;
		}
		
		.intro-desc {
			display: block;
			font-size: 28rpx;
			color: #666;
		}
	}
	
	.info-card {
		width: 100%;
		background: #FFFFFF;
		border-radius: 24rpx;
		padding: 50rpx 40rpx;
		margin-bottom: 60rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.info-item {
			display: flex;
			align-items: center;
			gap: 20rpx;
			margin-bottom: 30rpx;
			
			&:last-child {
				margin-bottom: 0;
			}
			
			.info-icon {
				font-size: 40rpx;
			}
			
			.info-text {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
	
	.start-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		color: #FFFFFF;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 48rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(0, 201, 167, 0.3);
	}
</style>

