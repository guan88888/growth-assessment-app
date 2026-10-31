<template>
	<view class="product-list-page">
		<view class="page-header">
			<text class="header-title">营养品商城</text>
			<text class="header-subtitle">科学配比，助力成长</text>
		</view>
		
		<view class="product-grid">
			<view 
				class="product-card" 
				v-for="(product, index) in productList" 
				:key="index"
				@click="handleViewProduct(product)"
			>
				<view class="product-image">
					<text class="product-icon">💊</text>
					<view class="product-badge" v-if="product.badge">
						<text>{{ product.badge }}</text>
					</view>
				</view>
				
				<view class="product-info">
					<text class="product-name">{{ product.name }}</text>
					<text class="product-desc" v-if="product.desc">{{ product.desc }}</text>
					
					<view class="product-tags">
						<text class="product-tag" v-if="product.type === 'formula'">组合装</text>
						<text class="product-tag" v-else>单品</text>
					</view>
					
					<view class="product-footer">
						<view class="product-price">
							<text class="price-symbol">¥</text>
							<text class="price-value">{{ product.price }}</text>
							<text class="price-original" v-if="product.originalPrice">¥{{ product.originalPrice }}</text>
						</view>
						<view class="product-stats">
							<text class="stat-item">⭐ {{ product.rating || '4.8' }}</text>
							<text class="stat-item">月售{{ product.sales || '500+' }}</text>
						</view>
					</view>
					
					<view class="product-promo" v-if="product.promo">
						<text class="promo-text">{{ product.promo }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { supplements, formulas } from '../../data/mockData.js'
	
	export default {
		data() {
			return {
				productList: []
			}
		},
		onLoad() {
			this.loadProducts()
		},
		methods: {
			loadProducts() {
				// 加载所有商品（组合 + 单品）
				const products = []
				
				// 添加组合商品
				Object.keys(formulas).forEach(id => {
					const formula = formulas[id]
					products.push({
						id: id,
						type: 'formula',
						name: formula.name,
						desc: formula.reason,
						price: this.getFormulaPrice(id),
						originalPrice: null,
						rating: (4.5 + Math.random() * 0.5).toFixed(1),
						sales: this.getRandomSales(),
						promo: this.getPromo(id, 'formula'),
						badge: this.getBadge(id),
						...formula
					})
				})
				
				// 添加单品商品
				Object.keys(supplements).forEach(id => {
					const supplement = supplements[id]
					products.push({
						id: id,
						type: 'supplement',
						name: supplement.name,
						desc: supplement.reason,
						price: this.getSupplementPrice(id),
						originalPrice: null,
						rating: (4.5 + Math.random() * 0.5).toFixed(1),
						sales: this.getRandomSales(),
						promo: this.getPromo(id, 'supplement'),
						badge: null,
						...supplement
					})
				})
				
				// 随机排序，让商品列表更丰富
				this.productList = products.sort(() => Math.random() - 0.5)
			},
			getFormulaPrice(id) {
				const prices = {
					'F001': 198,
					'F002': 298,
					'F003': 398,
					'F004': 328
				}
				return prices[id] || 298
			},
			getSupplementPrice(id) {
				const prices = {
					'S001': 68,
					'S002': 58,
					'S003': 78,
					'S004': 88,
					'S005': 128
				}
				return prices[id] || 68
			},
			getRandomSales() {
				const sales = ['100+', '200+', '500+', '1千+', '2千+', '5千+']
				return sales[Math.floor(Math.random() * sales.length)]
			},
			getPromo(id, type) {
				// 随机生成促销信息
				const promos = [
					'新客减5',
					'满100减10',
					'买2送1',
					'限时特价',
					'组合优惠'
				]
				return promos[Math.floor(Math.random() * promos.length)]
			},
			getBadge(id) {
				// 热门商品标记
				if (id === 'F003' || id === 'S001' || id === 'S002') {
					return '热销'
				}
				return null
			},
			handleViewProduct(product) {
				uni.navigateTo({
					url: `/pages/product-detail/product-detail?id=${product.id}&type=${product.type}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.product-list-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx;
	}
	
	.page-header {
		text-align: center;
		margin-bottom: 40rpx;
		
		.header-title {
			display: block;
			font-size: 40rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 12rpx;
		}
		
		.header-subtitle {
			display: block;
			font-size: 28rpx;
			color: #999;
		}
	}
	
	.product-grid {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}
	
	.product-card {
		background: #FFFFFF;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		display: flex;
		gap: 24rpx;
		padding: 30rpx;
		transition: all 0.3s;
		
		&:active {
			transform: scale(0.98);
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
		}
		
		.product-image {
			width: 200rpx;
			height: 200rpx;
			background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
			border-radius: 16rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;
			flex-shrink: 0;
			
			.product-icon {
				font-size: 80rpx;
			}
			
			.product-badge {
				position: absolute;
				top: 10rpx;
				right: 10rpx;
				background: #FF6B6B;
				color: #FFFFFF;
				padding: 6rpx 16rpx;
				border-radius: 20rpx;
				font-size: 20rpx;
			}
		}
		
		.product-info {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 12rpx;
			
			.product-name {
				font-size: 32rpx;
				font-weight: 600;
				color: #333;
				line-height: 1.4;
			}
			
			.product-desc {
				font-size: 24rpx;
				color: #666;
				line-height: 1.5;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 2;
				overflow: hidden;
			}
			
			.product-tags {
				display: flex;
				gap: 12rpx;
				
				.product-tag {
					padding: 6rpx 16rpx;
					background: rgba(0, 201, 167, 0.1);
					color: #00C9A7;
					border-radius: 8rpx;
					font-size: 22rpx;
				}
			}
			
			.product-footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-top: auto;
				
				.product-price {
					display: flex;
					align-items: baseline;
					gap: 8rpx;
					
					.price-symbol {
						font-size: 24rpx;
						color: #FF6B6B;
						font-weight: 600;
					}
					
					.price-value {
						font-size: 36rpx;
						color: #FF6B6B;
						font-weight: 600;
					}
					
					.price-original {
						font-size: 24rpx;
						color: #999;
						text-decoration: line-through;
					}
				}
				
				.product-stats {
					display: flex;
					flex-direction: column;
					align-items: flex-end;
					gap: 8rpx;
					
					.stat-item {
						font-size: 22rpx;
						color: #999;
					}
				}
			}
			
			.product-promo {
				margin-top: 8rpx;
				
				.promo-text {
					display: inline-block;
					padding: 6rpx 12rpx;
					background: #FFF3E0;
					color: #FF6B00;
					border-radius: 8rpx;
					font-size: 22rpx;
				}
			}
		}
	}
</style>


