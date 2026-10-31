<template>
	<view class="profile-setup-page">
		<view class="step-indicator">
			<view class="step-item" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
				<text class="step-num">1</text>
				<text class="step-label">基本信息</text>
			</view>
			<view class="step-line" :class="{ active: currentStep > 1 }"></view>
			<view class="step-item" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
				<text class="step-num">2</text>
				<text class="step-label">身体数据</text>
			</view>
			<view class="step-line" :class="{ active: currentStep > 2 }"></view>
			<view class="step-item" :class="{ active: currentStep >= 3, completed: currentStep > 3 }">
				<text class="step-num">3</text>
				<text class="step-label">其他信息</text>
			</view>
		</view>
		
		<view class="form-content">
			<!-- Step 1: 基本信息 -->
			<view v-if="currentStep === 1" class="step-content">
				<view class="form-item">
					<text class="label">出生日期 <text class="required">*</text></text>
					<picker mode="date" :value="form.birthDate" @change="onBirthDateChange">
						<view class="picker-input">
							<text :class="{ placeholder: !form.birthDate }">
								{{ form.birthDate || '请选择出生日期' }}
							</text>
							<text class="arrow">></text>
						</view>
					</picker>
				</view>
				
				<view class="form-item">
					<text class="label">性别 <text class="required">*</text></text>
					<view class="radio-group">
						<view 
							class="radio-item" 
							:class="{ active: form.gender === 'male' }"
							@click="form.gender = 'male'"
						>
							<text>男</text>
						</view>
						<view 
							class="radio-item" 
							:class="{ active: form.gender === 'female' }"
							@click="form.gender = 'female'"
						>
							<text>女</text>
						</view>
					</view>
				</view>
				
				<view class="info-card" v-if="ageInfo.years > 0">
					<text class="info-label">当前年龄</text>
					<text class="info-value">{{ ageInfo.years }}岁{{ ageInfo.months }}个月</text>
				</view>
			</view>
			
			<!-- Step 2: 身体数据 -->
			<view v-if="currentStep === 2" class="step-content">
				<view class="form-item">
					<text class="label">当前身高(cm) <text class="required">*</text></text>
					<input 
						type="digit" 
						v-model="form.height" 
						placeholder="请输入身高"
						class="input"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">当前体重(kg) <text class="required">*</text></text>
					<input 
						type="digit" 
						v-model="form.weight" 
						placeholder="请输入体重"
						class="input"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">父亲身高(cm) <text class="required">*</text></text>
					<input 
						type="digit" 
						v-model="form.fatherHeight" 
						placeholder="请输入父亲身高"
						class="input"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">母亲身高(cm) <text class="required">*</text></text>
					<input 
						type="digit" 
						v-model="form.motherHeight" 
						placeholder="请输入母亲身高"
						class="input"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">期望成年身高(cm)</text>
					<input 
						type="digit" 
						v-model="form.targetHeight" 
						placeholder="请输入期望身高（可选）"
						class="input"
					/>
				</view>
				
				<view class="info-card" v-if="bmiInfo.bmi > 0">
					<view class="info-row">
						<text class="info-label">BMI</text>
						<text class="info-value">{{ bmiInfo.bmi }} ({{ bmiInfo.status }})</text>
					</view>
				</view>
				
				<view class="info-card" v-if="targetHeightInfo.target > 0">
					<view class="info-row">
						<text class="info-label">遗传靶身高</text>
						<text class="info-value">{{ targetHeightInfo.min }}-{{ targetHeightInfo.max }}cm</text>
					</view>
				</view>
			</view>
			
			<!-- Step 3: 其他信息 -->
			<view v-if="currentStep === 3" class="step-content">
				<view class="form-item">
					<text class="label">骨龄检测</text>
					<view class="radio-group">
						<view 
							class="radio-item" 
							:class="{ active: form.boneAgeStatus === 'none' }"
							@click="form.boneAgeStatus = 'none'; form.boneAge = ''"
						>
							<text>未检测</text>
						</view>
						<view 
							class="radio-item" 
							:class="{ active: form.boneAgeStatus === 'tested' }"
							@click="form.boneAgeStatus = 'tested'"
						>
							<text>已检测</text>
						</view>
					</view>
				</view>
				
				<view class="form-item" v-if="form.boneAgeStatus === 'tested'">
					<text class="label">骨龄(岁) <text class="required">*</text></text>
					<input 
						type="digit" 
						v-model="form.boneAge" 
						placeholder="请输入骨龄"
						class="input"
					/>
				</view>
				
				<view class="form-item">
					<text class="label">过敏史</text>
					<view class="checkbox-group">
						<view 
							class="checkbox-item" 
							:class="{ active: form.allergies.includes('milk') }"
							@click="toggleAllergy('milk')"
						>
							<text>牛奶</text>
						</view>
						<view 
							class="checkbox-item" 
							:class="{ active: form.allergies.includes('soy') }"
							@click="toggleAllergy('soy')"
						>
							<text>大豆</text>
						</view>
						<view 
							class="checkbox-item" 
							:class="{ active: form.allergies.includes('nuts') }"
							@click="toggleAllergy('nuts')"
						>
							<text>坚果</text>
						</view>
						<view 
							class="checkbox-item" 
							:class="{ active: form.allergies.length === 0 }"
							@click="form.allergies = []"
						>
							<text>无</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		
		<view class="footer-actions">
			<button 
				v-if="currentStep > 1" 
				class="btn btn-secondary" 
				@click="prevStep"
			>
				上一步
			</button>
			<button 
				class="btn btn-primary" 
				:class="{ disabled: !canNext }"
				@click="nextStep"
			>
				{{ currentStep === 3 ? '完成' : '下一步' }}
			</button>
		</view>
	</view>
</template>

<script>
	import { store } from '../../store/index.js'
	import { calcAge, calcBMI, calcTargetHeight } from '../../utils/calcUtils.js'
	
	export default {
		data() {
			return {
				currentStep: 1,
				form: {
					birthDate: '',
					gender: '',
					height: '',
					weight: '',
					fatherHeight: '',
					motherHeight: '',
					targetHeight: '',
					boneAgeStatus: 'none',
					boneAge: '',
					allergies: []
				}
			}
		},
		computed: {
			ageInfo() {
				if (!this.form.birthDate) return { years: 0, months: 0 }
				return calcAge(this.form.birthDate)
			},
			bmiInfo() {
				if (!this.form.height || !this.form.weight) return { bmi: 0, status: '' }
				return calcBMI(parseFloat(this.form.height), parseFloat(this.form.weight))
			},
			targetHeightInfo() {
				if (!this.form.gender || !this.form.fatherHeight || !this.form.motherHeight) {
					return { min: 0, max: 0, target: 0 }
				}
				return calcTargetHeight(
					this.form.gender,
					parseFloat(this.form.fatherHeight),
					parseFloat(this.form.motherHeight)
				)
			},
			canNext() {
				if (this.currentStep === 1) {
					return this.form.birthDate && this.form.gender
				} else if (this.currentStep === 2) {
					return this.form.height && this.form.weight && 
					       this.form.fatherHeight && this.form.motherHeight
				} else {
					if (this.form.boneAgeStatus === 'tested') {
						return !!this.form.boneAge
					}
					return true
				}
			}
		},
		methods: {
			onBirthDateChange(e) {
				this.form.birthDate = e.detail.value
			},
			toggleAllergy(type) {
				const index = this.form.allergies.indexOf(type)
				if (index > -1) {
					this.form.allergies.splice(index, 1)
				} else {
					if (type === 'milk' || type === 'soy' || type === 'nuts') {
						this.form.allergies.push(type)
					}
				}
			},
			prevStep() {
				if (this.currentStep > 1) {
					this.currentStep--
				}
			},
			nextStep() {
				if (!this.canNext) return
				
				if (this.currentStep < 3) {
					this.currentStep++
				} else {
					this.saveProfile()
				}
			},
			saveProfile() {
				const profile = {
					...this.form,
					height: parseFloat(this.form.height),
					weight: parseFloat(this.form.weight),
					fatherHeight: parseFloat(this.form.fatherHeight),
					motherHeight: parseFloat(this.form.motherHeight),
					targetHeight: this.form.targetHeight ? parseFloat(this.form.targetHeight) : null,
					boneAge: this.form.boneAge ? parseFloat(this.form.boneAge) : null,
					createdAt: new Date().toISOString()
				}
				
				store.saveProfile(profile)
				
				uni.showToast({
					title: '档案建立成功',
					icon: 'success'
				})
				
				setTimeout(() => {
					uni.switchTab({
						url: '/pages/home/home'
					})
				}, 1500)
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-setup-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 40rpx 30rpx 120rpx;
	}
	
	.step-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 60rpx;
		
		.step-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10rpx;
			
			.step-num {
				width: 60rpx;
				height: 60rpx;
				border-radius: 50%;
				background: #E0E0E0;
				color: #999;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 28rpx;
				font-weight: 600;
			}
			
			.step-label {
				font-size: 24rpx;
				color: #999;
			}
			
			&.active .step-num {
				background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
				color: #FFF;
			}
			
			&.completed .step-num {
				background: #00C9A7;
				color: #FFF;
			}
		}
		
		.step-line {
			width: 80rpx;
			height: 4rpx;
			background: #E0E0E0;
			margin: 0 20rpx;
			
			&.active {
				background: #00C9A7;
			}
		}
	}
	
	.form-content {
		.step-content {
			animation: fadeIn 0.3s;
		}
	}
	
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
			
			.required {
				color: #FF6B6B;
			}
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
			
			.placeholder {
				color: #999;
			}
			
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
				}
			}
		}
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

