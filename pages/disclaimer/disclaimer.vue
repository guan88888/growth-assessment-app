<template>
	<view class="disclaimer-page">
		<view class="content">
			<view class="section">
				<text class="section-title">免责声明</text>
				<text class="section-text">
					本应用提供的营养支持建议仅供参考，不替代专业医生的诊断和治疗建议。如有明显的身高增长落后或其他健康问题，建议及时咨询专业医生进行线下评估。
				</text>
			</view>
			
			<view class="section">
				<text class="section-title">使用说明</text>
				<text class="section-text">
					1. 本应用基于用户提供的信息进行测评和推荐，结果仅供参考。\n
					2. 补剂推荐需结合个人实际情况，建议在医生或营养师指导下使用。\n
					3. 如有过敏史或慢性疾病，请谨慎使用推荐方案。\n
					4. 身高增长受多种因素影响，建议保持科学的生活习惯和合理的期望。
				</text>
			</view>
			
			<view class="section">
				<text class="section-title">隐私说明</text>
				<text class="section-text">
					1. 所有数据仅存储在本地设备，不会上传到服务器。\n
					2. 我们不会收集、使用或分享您的个人信息。\n
					3. 您可以随时删除本地数据。
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		
	}
</script>

<style lang="scss" scoped>
	.disclaimer-page {
		min-height: 100vh;
		background: #F5F7FA;
		padding: 30rpx;
	}
	
	.content {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
	}
	
	.section {
		background: #FFFFFF;
		border-radius: 16rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		
		.section-title {
			display: block;
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			margin-bottom: 24rpx;
		}
		
		.section-text {
			display: block;
			font-size: 28rpx;
			color: #666;
			line-height: 1.8;
			white-space: pre-line;
		}
	}
</style>

