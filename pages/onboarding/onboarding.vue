<template>
	<view class="onboarding-page">
		<view class="content">
			<view class="slogan">
				<text class="title">科学成长</text>
				<text class="subtitle">让每一步都更接近理想身高</text>
			</view>
			
			<view class="highlights">
				<view class="card" v-for="(item, index) in highlights" :key="index">
					<text class="card-icon">{{ item.icon }}</text>
					<text class="card-title">{{ item.title }}</text>
					<text class="card-desc">{{ item.desc }}</text>
				</view>
			</view>
			
			<button class="start-btn" @click="handleStart">开始</button>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	
	export default {
		data() {
			return {
				highlights: [
					{
						icon: '⏱️',
						title: '2分钟测评',
						desc: '快速了解成长状况'
					},
					{
						icon: '📊',
						title: '成长报告',
						desc: '个性化分析建议'
					},
					{
						icon: '📅',
						title: '30天计划',
						desc: '科学行动指南'
					}
				]
			}
		},
		onLoad() {
			// 检查是否有档案
			const profile = store.getProfile()
			if (profile) {
				// 有档案，直接跳转到首页
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/home/home'
					})
				}, 1000)
			}
		},
		methods: {
			handleStart() {
				const profile = store.getProfile()
				if (!profile) {
					// 无档案，跳转到建档页
					uni.redirectTo({
						url: '/pages/profile-setup/profile-setup'
					})
				} else {
					// 有档案，跳转到首页
					uni.switchTab({
						url: '/pages/home/home'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.onboarding-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 60rpx 40rpx;
	}
	
	.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.slogan {
		text-align: center;
		margin-bottom: 100rpx;
		
		.title {
			display: block;
			font-size: 64rpx;
			font-weight: bold;
			color: #FFFFFF;
			margin-bottom: 20rpx;
		}
		
		.subtitle {
			display: block;
			font-size: 32rpx;
			color: rgba(255, 255, 255, 0.9);
		}
	}
	
	.highlights {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		margin-bottom: 80rpx;
	}
	
	.card {
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(10rpx);
		border-radius: 24rpx;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20rpx;
		
		.card-icon {
			font-size: 60rpx;
		}
		
		.card-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #FFFFFF;
		}
		
		.card-desc {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.8);
		}
	}
	
	.start-btn {
		width: 100%;
		height: 96rpx;
		background: #FFFFFF;
		color: #00C9A7;
		font-size: 36rpx;
		font-weight: 600;
		border-radius: 48rpx;
		border: none;
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
	}
</style>

