<template>
	<view class="me-page">
		<view class="user-card">
			<text class="user-name">{{ userName }}</text>
			<text class="user-age">{{ userAge }}</text>
		</view>
		
		<view class="menu-section">
			<view class="menu-item" @click="handleEditProfile">
				<text class="menu-icon">✏️</text>
				<text class="menu-label">编辑档案</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="handleDisclaimer">
				<text class="menu-icon">📄</text>
				<text class="menu-label">免责声明</text>
				<text class="menu-arrow">></text>
			</view>
			<view class="menu-item" @click="handleAbout">
				<text class="menu-icon">ℹ️</text>
				<text class="menu-label">关于</text>
				<text class="menu-arrow">></text>
			</view>
		</view>
		
		<view class="stats-section">
			<text class="stats-title">数据统计</text>
			<view class="stats-cards">
				<view class="stats-card">
					<text class="stats-value">{{ quizCount }}</text>
					<text class="stats-label">测评次数</text>
				</view>
				<view class="stats-card">
					<text class="stats-value">{{ checkinStreak }}</text>
					<text class="stats-label">连续打卡</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	import { calcAge } from '../../utils/calcUtils.js'
	
	export default {
		data() {
			return {
				profile: null,
				quizCount: 0,
				checkinStreak: 0
			}
		},
		computed: {
			userName() {
				return this.profile?.nickname || '用户'
			},
			userAge() {
				if (!this.profile || !this.profile.birthDate) return ''
				const age = calcAge(this.profile.birthDate)
				return `${age.years}岁${age.months}个月`
			}
		},
		onLoad() {
			this.loadData()
		},
		onShow() {
			this.loadData()
		},
		methods: {
			loadData() {
				this.profile = store.getProfile()
				this.quizCount = store.getQuizCount()
				this.checkinStreak = store.getCheckinStreak()
			},
			handleEditProfile() {
				uni.navigateTo({
					url: '/pages/profile-edit/profile-edit'
				})
			},
			handleDisclaimer() {
				uni.navigateTo({
					url: '/pages/disclaimer/disclaimer'
				})
			},
			handleAbout() {
				uni.showModal({
					title: '关于',
					content: '青少年长高测评 & 补剂推荐\n版本 1.0.0\n\n科学成长，让每一步都更接近理想身高',
					showCancel: false
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.me-page {
		min-height: 100vh;
		background: #F5F7FA;
	}
	
	.user-card {
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		padding: 60rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
		
		.user-name {
			font-size: 40rpx;
			font-weight: 600;
			color: #FFFFFF;
		}
		
		.user-age {
			font-size: 28rpx;
			color: rgba(255, 255, 255, 0.9);
		}
	}
	
	.menu-section {
		background: #FFFFFF;
		margin: 30rpx;
		border-radius: 16rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.menu-item {
			display: flex;
			align-items: center;
			padding: 30rpx;
			border-bottom: 1rpx solid #F0F0F0;
			
			&:last-child {
				border-bottom: none;
			}
			
			.menu-icon {
				font-size: 40rpx;
				margin-right: 20rpx;
			}
			
			.menu-label {
				flex: 1;
				font-size: 32rpx;
				color: #333;
			}
			
			.menu-arrow {
				font-size: 28rpx;
				color: #999;
			}
		}
	}
	
	.stats-section {
		margin: 30rpx;
		
		.stats-title {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 24rpx;
		}
		
		.stats-cards {
			display: flex;
			gap: 20rpx;
		}
		
		.stats-card {
			flex: 1;
			background: #FFFFFF;
			border-radius: 16rpx;
			padding: 40rpx 20rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 16rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			
			.stats-value {
				font-size: 48rpx;
				font-weight: 600;
				color: #00C9A7;
			}
			
			.stats-label {
				font-size: 28rpx;
				color: #666;
			}
		}
	}
</style>

