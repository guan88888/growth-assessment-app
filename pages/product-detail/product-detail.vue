<template>
	<view class="product-detail-page">
		<view v-if="product" class="product-content">
			<!-- 商品图片区域 -->
			<view class="product-image">
				<text class="product-icon">💊</text>
			</view>
			
			<!-- 商品基本信息 -->
			<view class="product-info">
				<view class="product-header">
					<text class="product-name">{{ product.name }}</text>
					<view class="product-tag" :class="product.type">
						<text>{{ product.type === 'formula' ? '组合装' : '单品' }}</text>
					</view>
				</view>
				
				<view class="product-price">
					<text class="price-label">价格</text>
					<text class="price-value">¥{{ product.price }}</text>
					<text class="price-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</text>
				</view>
				
				<view class="product-specs">
					<view class="spec-item" v-if="product.dose">
						<text class="spec-label">规格：</text>
						<text class="spec-value">{{ product.dose }}</text>
					</view>
					<view class="spec-item" v-if="product.quantity">
						<text class="spec-label">数量：</text>
						<text class="spec-value">{{ product.quantity }}</text>
					</view>
				</view>
			</view>
			
			<!-- 推荐理由 -->
			<view class="product-section">
				<text class="section-title">为什么推荐</text>
				<text class="section-content">{{ product.reason }}</text>
			</view>
			
			<!-- 包含成分（组合装） -->
			<view class="product-section" v-if="product.items && product.items.length > 0">
				<text class="section-title">包含成分</text>
				<view class="ingredients-list">
					<view 
						class="ingredient-item" 
						v-for="(itemId, index) in product.items" 
						:key="index"
					>
						<text class="ingredient-name">{{ getSupplementName(itemId) }}</text>
					</view>
				</view>
			</view>
			
			<!-- 注意事项 -->
			<view class="product-section" v-if="product.precautions">
				<text class="section-title">注意事项</text>
				<text class="section-content">{{ product.precautions }}</text>
			</view>
			
			<!-- 商品详情 -->
			<view class="product-section">
				<text class="section-title">商品详情</text>
				<view class="detail-list">
					<view class="detail-item">
						<text class="detail-label">适用人群：</text>
						<text class="detail-value">青少年（12-18岁）</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">保质期：</text>
						<text class="detail-value">24个月</text>
					</view>
					<view class="detail-item">
						<text class="detail-label">储存方式：</text>
						<text class="detail-value">阴凉干燥处，避免阳光直射</text>
					</view>
					<view class="detail-item" v-if="product.allergies && product.allergies.length > 0 && !product.allergies.includes('无')">
						<text class="detail-label">过敏提示：</text>
						<text class="detail-value warning">含{{ product.allergies.join('、') }}成分</text>
					</view>
				</view>
			</view>
			
			<!-- 底部购买栏 -->
			<view class="footer-bar">
				<view class="footer-left">
					<text class="footer-price">¥{{ product.price }}</text>
				</view>
				<button class="buy-btn" @click="handleBuy">立即购买</button>
			</view>
		</view>
		
		<view v-else class="empty-state">
			<text class="empty-text">商品信息加载失败</text>
		</view>
	</view>
</template>

<script>
	import { supplements, formulas } from '../../data/mockData.js'
	
	export default {
		data() {
			return {
				product: null,
				productId: '',
				productType: ''
			}
		},
		onLoad(options) {
			this.productId = options.id || ''
			this.productType = options.type || 'formula' // formula 或 supplement
			this.loadProduct()
		},
		methods: {
			loadProduct() {
				if (this.productType === 'formula') {
					// 加载组合
					const formula = formulas[this.productId]
					if (formula) {
						this.product = {
							...formula,
							type: 'formula',
							price: this.getFormulaPrice(this.productId),
							originalPrice: null,
							quantity: '1套'
						}
					}
				} else {
					// 加载单品
					const supplement = supplements[this.productId]
					if (supplement) {
						this.product = {
							...supplement,
							type: 'supplement',
							price: this.getSupplementPrice(this.productId),
							originalPrice: null,
							quantity: '1瓶'
						}
					}
				}
				
				if (!this.product) {
					uni.showToast({
						title: '商品不存在',
						icon: 'none'
					})
					setTimeout(() => {
						uni.navigateBack()
					}, 1500)
				}
			},
			getFormulaPrice(id) {
				// 模拟价格
				const prices = {
					'F001': 198,
					'F002': 298,
					'F003': 398,
					'F004': 328
				}
				return prices[id] || 298
			},
			getSupplementPrice(id) {
				// 模拟价格
				const prices = {
					'S001': 68,
					'S002': 58,
					'S003': 78,
					'S004': 88,
					'S005': 128
				}
				return prices[id] || 68
			},
			getSupplementName(id) {
				return supplements[id]?.name || id
			},
			handleBuy() {
				// 模拟购买流程
				uni.showModal({
					title: '确认购买',
					content: `确定要购买 ${this.product.name} 吗？\n价格：¥${this.product.price}`,
					success: (res) => {
						if (res.confirm) {
							// 这里可以调用购买接口
							uni.showToast({
								title: '购买成功',
								icon: 'success'
							})
							
							// 跳转到商品列表页
							setTimeout(() => {
								uni.redirectTo({
									url: '/pages/product-list/product-list'
								})
							}, 1500)
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.product-detail-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding-bottom: 120rpx;
	}
	
	.product-content {
		display: flex;
		flex-direction: column;
	}
	
	.product-image {
		width: 100%;
		height: 400rpx;
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		
		.product-icon {
			font-size: 120rpx;
		}
	}
	
	.product-info {
		background: #FFFFFF;
		padding: 40rpx;
		margin-bottom: 20rpx;
		
		.product-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 30rpx;
			
			.product-name {
				font-size: 36rpx;
				font-weight: 600;
				color: #333;
			}
			
			.product-tag {
				padding: 8rpx 20rpx;
				border-radius: 20rpx;
				font-size: 24rpx;
				
				&.formula {
					background: rgba(0, 201, 167, 0.1);
					color: #00C9A7;
				}
				
				&.supplement {
					background: rgba(255, 167, 38, 0.1);
					color: #FFA726;
				}
			}
		}
		
		.product-price {
			display: flex;
			align-items: baseline;
			gap: 16rpx;
			margin-bottom: 30rpx;
			
			.price-label {
				font-size: 28rpx;
				color: #666;
			}
			
			.price-value {
				font-size: 48rpx;
				font-weight: 600;
				color: #FF6B6B;
			}
			
			.price-original {
				font-size: 28rpx;
				color: #999;
				text-decoration: line-through;
			}
		}
		
		.product-specs {
			display: flex;
			flex-direction: column;
			gap: 16rpx;
			
			.spec-item {
				display: flex;
				align-items: center;
				
				.spec-label {
					font-size: 28rpx;
					color: #666;
				}
				
				.spec-value {
					font-size: 28rpx;
					color: #333;
					font-weight: 500;
				}
			}
		}
	}
	
	.product-section {
		background: #FFFFFF;
		padding: 40rpx;
		margin-bottom: 20rpx;
		
		.section-title {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 24rpx;
		}
		
		.section-content {
			display: block;
			font-size: 28rpx;
			color: #666;
			line-height: 1.8;
		}
		
		.ingredients-list {
			display: flex;
			flex-direction: column;
			gap: 16rpx;
			
			.ingredient-item {
				padding: 20rpx;
				background: #F5F7FA;
				border-radius: 12rpx;
				
				.ingredient-name {
					font-size: 28rpx;
					color: #333;
				}
			}
		}
		
		.detail-list {
			display: flex;
			flex-direction: column;
			gap: 20rpx;
			
			.detail-item {
				display: flex;
				align-items: flex-start;
				
				.detail-label {
					font-size: 28rpx;
					color: #666;
					width: 160rpx;
					flex-shrink: 0;
				}
				
				.detail-value {
					font-size: 28rpx;
					color: #333;
					flex: 1;
					
					&.warning {
						color: #FF6B6B;
					}
				}
			}
		}
	}
	
	.footer-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: #FFFFFF;
		padding: 20rpx 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.footer-left {
			.footer-price {
				font-size: 36rpx;
				font-weight: 600;
				color: #FF6B6B;
			}
		}
		
		.buy-btn {
			flex: 1;
			margin-left: 30rpx;
			height: 88rpx;
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
			color: #FFFFFF;
			font-size: 32rpx;
			font-weight: 600;
			border-radius: 44rpx;
			border: none;
		}
	}
	
	.empty-state {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 200rpx 40rpx;
		
		.empty-text {
			font-size: 32rpx;
			color: #999;
		}
	}
</style>

