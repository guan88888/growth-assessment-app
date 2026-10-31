<template>
	<view class="profile-edit-page">
		<view class="form-list">
			<view class="form-item">
				<text class="label">出生日期</text>
				<picker mode="date" :value="profile.birthDate" @change="onBirthDateChange">
					<view class="picker-input">
						<text>{{ profile.birthDate }}</text>
						<text class="arrow">></text>
					</view>
				</picker>
			</view>
			
			<view class="form-item">
				<text class="label">性别</text>
				<view class="radio-group">
					<view 
						class="radio-item" 
						:class="{ active: profile.gender === 'male' }"
						@click="profile.gender = 'male'"
					>
						<text>男</text>
					</view>
					<view 
						class="radio-item" 
						:class="{ active: profile.gender === 'female' }"
						@click="profile.gender = 'female'"
					>
						<text>女</text>
					</view>
				</view>
			</view>
			
			<view class="form-item">
				<text class="label">当前身高(cm)</text>
				<input 
					type="digit" 
					v-model="profile.height" 
					placeholder="请输入身高"
					class="input"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">当前体重(kg)</text>
				<input 
					type="digit" 
					v-model="profile.weight" 
					placeholder="请输入体重"
					class="input"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">父亲身高(cm)</text>
				<input 
					type="digit" 
					v-model="profile.fatherHeight" 
					placeholder="请输入父亲身高"
					class="input"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">母亲身高(cm)</text>
				<input 
					type="digit" 
					v-model="profile.motherHeight" 
					placeholder="请输入母亲身高"
					class="input"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">期望成年身高(cm)</text>
				<input 
					type="digit" 
					v-model="profile.targetHeight" 
					placeholder="请输入期望身高（可选）"
					class="input"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">骨龄检测</text>
				<view class="radio-group">
					<view 
						class="radio-item" 
						:class="{ active: profile.boneAgeStatus === 'none' }"
						@click="profile.boneAgeStatus = 'none'; profile.boneAge = ''"
					>
						<text>未检测</text>
					</view>
					<view 
						class="radio-item" 
						:class="{ active: profile.boneAgeStatus === 'tested' }"
						@click="profile.boneAgeStatus = 'tested'"
					>
						<text>已检测</text>
					</view>
				</view>
			</view>
			
			<view class="form-item" v-if="profile.boneAgeStatus === 'tested'">
				<text class="label">骨龄(岁)</text>
				<input 
					type="digit" 
					v-model="profile.boneAge" 
					placeholder="请输入骨龄"
					class="input"
				/>
			</view>
			
			<view class="form-item">
				<text class="label">过敏史</text>
				<view class="checkbox-group">
					<view 
						class="checkbox-item" 
						:class="{ active: profile.allergies.includes('milk') }"
						@click="toggleAllergy('milk')"
					>
						<text>牛奶</text>
					</view>
					<view 
						class="checkbox-item" 
						:class="{ active: profile.allergies.includes('soy') }"
						@click="toggleAllergy('soy')"
					>
						<text>大豆</text>
					</view>
					<view 
						class="checkbox-item" 
						:class="{ active: profile.allergies.includes('nuts') }"
						@click="toggleAllergy('nuts')"
					>
						<text>坚果</text>
					</view>
				</view>
			</view>
			
			<view class="info-card" v-if="bmiInfo.bmi > 0">
				<view class="info-row">
					<text class="info-label">当前BMI</text>
					<text class="info-value">{{ bmiInfo.bmi }} ({{ bmiInfo.status }})</text>
				</view>
			</view>
		</view>
		
		<view class="footer-actions">
			<button class="btn btn-primary" @click="handleSave">保存</button>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	import { calcBMI } from '../../utils/calcUtils.js'
	
	export default {
		data() {
			return {
				profile: {}
			}
		},
		computed: {
			bmiInfo() {
				if (!this.profile.height || !this.profile.weight) return { bmi: 0, status: '' }
				return calcBMI(parseFloat(this.profile.height), parseFloat(this.profile.weight))
			}
		},
		onLoad() {
			const profile = store.getProfile()
			if (!profile) {
				uni.redirectTo({
					url: '/pages/profile-setup/profile-setup'
				})
				return
			}
			// 深拷贝
			this.profile = JSON.parse(JSON.stringify(profile))
		},
		methods: {
			onBirthDateChange(e) {
				this.profile.birthDate = e.detail.value
			},
			toggleAllergy(type) {
				if (!this.profile.allergies) {
					this.profile.allergies = []
				}
				const index = this.profile.allergies.indexOf(type)
				if (index > -1) {
					this.profile.allergies.splice(index, 1)
				} else {
					this.profile.allergies.push(type)
				}
			},
			handleSave() {
				const profile = {
					...this.profile,
					height: parseFloat(this.profile.height),
					weight: parseFloat(this.profile.weight),
					fatherHeight: parseFloat(this.profile.fatherHeight),
					motherHeight: parseFloat(this.profile.motherHeight),
					targetHeight: this.profile.targetHeight ? parseFloat(this.profile.targetHeight) : null,
					boneAge: this.profile.boneAge ? parseFloat(this.profile.boneAge) : null,
					updatedAt: new Date().toISOString()
				}
				
				store.saveProfile(profile)
				
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				})
				
				setTimeout(() => {
					uni.redirectTo({
						url: '/pages/home/home'
					})
				}, 1500)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-edit-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx 30rpx 120rpx;
	}
	
	.form-list {
		.form-item {
			background: #FFFFFF;
			border-radius: 16rpx;
			padding: 30rpx;
			margin-bottom: 24rpx;
			
			.label {
				display: block;
				font-size: 28rpx;
				color: #333;
				margin-bottom: 20rpx;
				font-weight: 500;
			}
			
			.input {
				width: 100%;
				height: 80rpx;
				background: #F5F7FA;
				border-radius: 12rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
			}
			
			.picker-input {
				width: 100%;
				height: 80rpx;
				background: #F5F7FA;
				border-radius: 12rpx;
				padding: 0 20rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				
				.arrow {
					color: #999;
				}
			}
			
			.radio-group {
				display: flex;
				gap: 20rpx;
				
				.radio-item {
					flex: 1;
					height: 80rpx;
					background: #F5F7FA;
					border-radius: 12rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					font-size: 28rpx;
					color: #666;
					
					&.active {
						background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
						color: #FFF;
					}
				}
			}
			
			.checkbox-group {
				display: flex;
				flex-wrap: wrap;
				gap: 20rpx;
				
				.checkbox-item {
					padding: 16rpx 32rpx;
					background: #F5F7FA;
					border-radius: 12rpx;
					font-size: 28rpx;
					color: #666;
					
					&.active {
						background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
						color: #FFF;
					}
				}
			}
		}
	}
	
	.info-card {
		background: linear-gradient(135deg, rgba(0, 201, 167, 0.1) 0%, rgba(0, 168, 204, 0.1) 100%);
		border-radius: 16rpx;
		padding: 30rpx;
		margin-bottom: 24rpx;
		
		.info-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		
		.info-label {
			font-size: 28rpx;
			color: #666;
		}
		
		.info-value {
			font-size: 32rpx;
			font-weight: 600;
			color: #00C9A7;
		}
	}
	
	.footer-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFF;
		padding: 20rpx 30rpx;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.btn {
			width: 100%;
			height: 88rpx;
			border-radius: 44rpx;
			font-size: 32rpx;
			font-weight: 600;
			border: none;
			
			&.btn-primary {
				background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
				color: #FFF;
			}
		}
	}
</style>

