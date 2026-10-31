<template>
	<view class="game-container">
		<canvas 
			canvas-id="gameCanvas" 
			class="game-canvas"
			@touchstart="handleTouchStart"
			@touchmove="handleTouchMove"
			@touchend="handleTouchEnd"
		></canvas>
		<view class="game-info">
			<text class="info-text">当前积分: {{ currentPoints }}</text>
			<text class="info-text">可兑换: ¥{{ redeemableMoney }}</text>
		</view>
		<view class="game-limit-info" v-if="!canPlay">
			<text class="limit-text">⚠️ 今日游戏次数已用完（5次/天）</text>
			<text class="limit-desc">{{ resetTimeText }}</text>
		</view>
		<view class="game-limit-info" v-else-if="remainingGameCount < 5">
			<text class="limit-text">今日剩余游戏次数: {{ remainingGameCount }}/5</text>
		</view>
		<view class="game-controls">
			<button class="game-btn" @click="startGame" v-if="!isPlaying" :disabled="!canPlay" :class="{disabled: !canPlay}">开始游戏</button>
			<button class="game-btn" @click="pauseGame" v-if="isPlaying && !isPaused">暂停</button>
			<button class="game-btn" @click="resumeGame" v-if="isPaused">继续</button>
			<button class="game-btn" @click="stopGame" v-if="isPlaying">结束</button>
		</view>
	</view>
</template>

<script>
import { store } from '../../store/index.js'

export default {
	data() {
		return {
			canvas: null,
			ctx: null,
			isPlaying: false,
			isPaused: false,
			animationId: null,
			// 飞机属性
			airplane: {
				x: 0,
				y: 0,
				width: 60,
				height: 60,
				speed: 5,
				rotation: 0 // 用于动画效果
			},
			// 子弹数组
			bullets: [],
			// 敌人数组
			enemies: [],
			// 游戏状态
			score: 0,
			enemySpawnTimer: 0,
			bulletTimer: 0,
			canvasWidth: 0,
			canvasHeight: 0,
			touchX: 0,
			touchY: 0,
			initialPoints: 0, // 游戏开始时的初始积分
			gameTime: 0, // 游戏进行时间（帧数）
			difficultyLevel: 1, // 难度等级
			resetTimer: null // 重置时间更新定时器
		}
	},
	computed: {
		currentPoints() {
			return store.getGamePoints()
		},
		redeemableMoney() {
			return store.getRedeemableMoney()
		},
		todayGameCount() {
			return store.getTodayGameCount()
		},
		remainingGameCount() {
			return store.getRemainingGameCount()
		},
		canPlay() {
			return store.canPlayGame()
		},
		resetTimeText() {
			if (this.canPlay) return ''
			const resetTime = store.getNextResetTime()
			if (resetTime.hours > 0) {
				return `距离重置还有 ${resetTime.hours}小时${resetTime.minutes}分钟`
			} else {
				return `距离重置还有 ${resetTime.minutes}分钟`
			}
		}
	},
	onReady() {
		// 延迟初始化，确保组件完全挂载
		setTimeout(() => {
			this.initCanvas()
		}, 50)
	},
	mounted() {
		// 双重保险，确保canvas初始化
		this.$nextTick(() => {
			setTimeout(() => {
				if (!this.ctx) {
					this.initCanvas()
				}
			}, 100)
		})
	},
	onShow() {
		// 页面显示时刷新游戏次数显示
		this.$forceUpdate()
		// 启动重置时间更新定时器
		this.startResetTimer()
	},
	onUnload() {
		this.stopGame()
		this.stopResetTimer()
	},
	beforeDestroy() {
		this.stopResetTimer()
	},
	methods: {
		initCanvas() {
			// 延迟初始化，确保canvas已渲染
			setTimeout(() => {
				const query = uni.createSelectorQuery().in(this)
				query.select('.game-canvas').boundingClientRect((rect) => {
					if (rect && rect.width > 0 && rect.height > 0) {
						// 使用逻辑尺寸（rpx转换后的px）
						this.canvasWidth = rect.width
						this.canvasHeight = rect.height
						
						// 创建canvas上下文
						this.ctx = uni.createCanvasContext('gameCanvas', this)
						
						if (!this.ctx) {
							console.error('Failed to create canvas context')
							return
						}
						
						// 初始化飞机位置（屏幕底部中央）
						this.airplane.x = this.canvasWidth / 2 - this.airplane.width / 2
						this.airplane.y = this.canvasHeight - this.airplane.height - 20
						
						console.log('Canvas initialized:', {
							width: this.canvasWidth,
							height: this.canvasHeight,
							airplane: this.airplane
						})
						
						// 绘制初始画面
						this.drawInitial()
					} else {
						console.error('Canvas rect not available:', rect)
						// 重试
						setTimeout(() => this.initCanvas(), 200)
					}
				}).exec()
			}, 150)
		},
		
		drawInitial() {
			if (!this.ctx || !this.canvasWidth || !this.canvasHeight) {
				console.log('Cannot draw initial: ctx or dimensions missing')
				return
			}
			
			try {
				// 绘制背景
				this.ctx.setFillStyle('#1a1a2e')
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
				
				// 绘制提示文字
				this.ctx.setFillStyle('#FFFFFF')
				this.ctx.setFontSize(24)
				const text = '点击"开始游戏"开始'
				const textWidth = text.length * 12 // 估算文字宽度
				this.ctx.fillText(text, (this.canvasWidth - textWidth) / 2, this.canvasHeight / 2)
				
				// 立即绘制
				this.ctx.draw(true, () => {
					console.log('Initial draw completed')
				})
			} catch (error) {
				console.error('Draw initial error:', error)
			}
		},
		
		startGame() {
			if (this.isPlaying) return
			
			// 检查今日游戏次数
			if (!this.canPlay) {
				uni.showToast({
					title: '今日游戏次数已用完（5次/天）',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 确保canvas已初始化
			if (!this.ctx || !this.canvasWidth || !this.canvasHeight) {
				this.initCanvas()
				setTimeout(() => {
					this.startGame()
				}, 200)
				return
			}
			
			// 增加游戏次数
			const playCount = store.addGamePlayCount()
			this.$forceUpdate() // 更新显示
			
			// 记录游戏开始时的初始积分
			this.initialPoints = store.getGamePoints()
			
			this.isPlaying = true
			this.isPaused = false
			this.score = 0
			this.bullets = []
			this.enemies = []
			this.enemySpawnTimer = 0
			this.bulletTimer = 0
			this.gameTime = 0
			this.difficultyLevel = 1
			
			// 重置飞机位置
			this.airplane.x = this.canvasWidth / 2 - this.airplane.width / 2
			this.airplane.y = this.canvasHeight - this.airplane.height - 20
			
			this.gameLoop()
		},
		
		pauseGame() {
			this.isPaused = true
			if (this.animationId) {
				clearTimeout(this.animationId)
				this.animationId = null
			}
		},
		
		resumeGame() {
			this.isPaused = false
			this.gameLoop()
		},
		
		stopGame(showResult = true) {
			this.isPlaying = false
			this.isPaused = false
			if (this.animationId) {
				clearTimeout(this.animationId)
				this.animationId = null
			}
			
			// 计算本次游戏获得的积分（积分已在游戏中实时累加）
			if (showResult) {
				const currentPoints = store.getGamePoints()
				const earnedPoints = currentPoints - this.initialPoints
				const earnedMoney = (earnedPoints / 5000).toFixed(2)
				const totalMoney = store.getRedeemableMoney()
				
				// 立即刷新积分显示（积分已在游戏中实时累加）
				this.$forceUpdate()
				this.$emit('points-updated', currentPoints)
				
				// 显示游戏结果
				setTimeout(() => {
					let content = `本次得分: ${this.score}分`
					content += `\n达到难度: ${this.difficultyLevel}级`
					
					if (earnedPoints > 0) {
						content += `\n\n🎉 本次获得积分: ${earnedPoints}`
						content += `\n💰 本次可兑换: ¥${earnedMoney}`
						content += `\n\n✅ 积分已自动累加到总积分`
					}
					
					content += `\n\n📊 当前总积分: ${currentPoints}`
					content += `\n💵 总可兑换金额: ¥${totalMoney}`
					
					uni.showModal({
						title: '🎮 游戏结束',
						content: content,
						showCancel: false,
						confirmText: '确定',
						success: () => {
							// 再次刷新显示
							this.$forceUpdate()
						}
					})
				}, 300)
			}
			
			this.bullets = []
			this.enemies = []
			this.gameTime = 0
			this.difficultyLevel = 1
			// 清空画布并绘制初始画面
			if (this.ctx && this.canvasWidth && this.canvasHeight) {
				this.drawInitial()
			}
		},
		
		gameLoop() {
			if (!this.isPlaying || this.isPaused) return
			
			// 更新游戏时间和难度
			this.gameTime++
			this.updateDifficulty()
			
			this.update()
			this.draw()
			
			// 使用setTimeout替代requestAnimationFrame，兼容uni-app
			this.animationId = setTimeout(() => {
				this.gameLoop()
			}, 16) // 约60fps
		},
		
		updateDifficulty() {
			// 每300帧（约5秒）提升一次难度
			this.difficultyLevel = Math.floor(this.gameTime / 300) + 1
		},
		
		update() {
			// 更新飞机位置（跟随触摸）
			if (this.touchX > 0 && this.touchY > 0) {
				this.airplane.x = this.touchX - this.airplane.width / 2
				this.airplane.y = this.touchY - this.airplane.height / 2
				
				// 限制飞机在画布内
				this.airplane.x = Math.max(0, Math.min(this.airplane.x, this.canvasWidth - this.airplane.width))
				this.airplane.y = Math.max(0, Math.min(this.airplane.y, this.canvasHeight - this.airplane.height))
			}
			
			// 自动发射子弹
			this.bulletTimer++
			if (this.bulletTimer >= 10) {
				this.shoot()
				this.bulletTimer = 0
			}
			
			// 生成敌人（难度递增：生成速度越来越快）
			this.enemySpawnTimer++
			// 基础生成间隔60帧，随着难度增加逐渐减少（最快20帧）
			const spawnInterval = Math.max(20, 60 - this.difficultyLevel * 3)
			if (this.enemySpawnTimer >= spawnInterval) {
				// 高难度时可能同时生成多个敌人
				const spawnCount = this.difficultyLevel >= 5 ? (Math.random() < 0.3 ? 2 : 1) : 1
				for (let i = 0; i < spawnCount; i++) {
					this.spawnEnemy()
				}
				this.enemySpawnTimer = 0
			}
			
			// 更新子弹
			for (let i = this.bullets.length - 1; i >= 0; i--) {
				this.bullets[i].y -= 8
				if (this.bullets[i].y < 0) {
					this.bullets.splice(i, 1)
				}
			}
			
			// 更新敌人（病毒）
			for (let i = this.enemies.length - 1; i >= 0; i--) {
				this.enemies[i].y += this.enemies[i].speed
				// 病毒旋转动画
				this.enemies[i].rotation += 0.1
				if (this.enemies[i].y > this.canvasHeight) {
					this.enemies.splice(i, 1)
				}
			}
			
			// 更新飞机旋转动画（轻微摆动）
			this.airplane.rotation = Math.sin(Date.now() / 200) * 0.1
			
			// 检测碰撞
			this.checkCollisions()
		},
		
		shoot() {
			this.bullets.push({
				x: this.airplane.x + this.airplane.width / 2 - 5,
				y: this.airplane.y,
				width: 10,
				height: 20
			})
		},
		
		spawnEnemy() {
			const x = Math.random() * (this.canvasWidth - 40)
			// 基础速度2-4，随着难度增加速度提升（最高速度约8-10）
			const baseSpeed = 2 + Math.random() * 2
			const speedMultiplier = 1 + (this.difficultyLevel - 1) * 0.3
			const finalSpeed = Math.min(baseSpeed * speedMultiplier, 10)
			
			this.enemies.push({
				x: x,
				y: -40,
				width: 40,
				height: 40,
				speed: finalSpeed,
				rotation: Math.random() * Math.PI * 2, // 病毒旋转角度
				spikes: 6 + Math.floor(Math.random() * 4) // 病毒刺的数量
			})
		},
		
		checkCollisions() {
			// 子弹与敌人碰撞
			for (let i = this.bullets.length - 1; i >= 0; i--) {
				const bullet = this.bullets[i]
				for (let j = this.enemies.length - 1; j >= 0; j--) {
					const enemy = this.enemies[j]
					if (
						bullet.x < enemy.x + enemy.width &&
						bullet.x + bullet.width > enemy.x &&
						bullet.y < enemy.y + enemy.height &&
						bullet.y + bullet.height > enemy.y
					) {
					// 碰撞发生
					this.bullets.splice(i, 1)
					this.enemies.splice(j, 1)
					this.score++
					// 每消灭一个病毒加10积分
					const newPoints = store.addGamePoints(10)
					// 强制更新组件以刷新积分显示
					this.$forceUpdate()
					// 通知父组件积分已更新
					this.$emit('points-updated', newPoints)
					// 显示得分提示
					uni.showToast({
						title: '+10积分',
						icon: 'none',
						duration: 500
					})
					break
					}
				}
			}
			
			// 飞机与敌人碰撞（游戏结束）
			for (let i = this.enemies.length - 1; i >= 0; i--) {
				const enemy = this.enemies[i]
				if (
					this.airplane.x < enemy.x + enemy.width &&
					this.airplane.x + this.airplane.width > enemy.x &&
					this.airplane.y < enemy.y + enemy.height &&
					this.airplane.y + this.airplane.height > enemy.y
				) {
					// 游戏结束（碰撞到病毒）
					this.stopGame(true)
					break
				}
			}
		},
		
		draw() {
			if (!this.ctx || !this.canvasWidth || !this.canvasHeight) {
				return
			}
			
			try {
				// 清空画布
				this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
				
				// 绘制背景
				this.ctx.setFillStyle('#1a1a2e')
				this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
				
				// 绘制飞机（带细节）
				this.drawAirplane(this.airplane.x + this.airplane.width / 2, this.airplane.y + this.airplane.height / 2)
				
				// 绘制子弹
				this.ctx.setFillStyle('#FFD700')
				for (let bullet of this.bullets) {
					this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)
				}
				
				// 绘制病毒
				for (let enemy of this.enemies) {
					this.drawVirus(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, enemy.rotation, enemy.spikes)
				}
				
				// 绘制得分和难度
				this.ctx.setFillStyle('#FFFFFF')
				this.ctx.setFontSize(20)
				this.ctx.fillText(`得分: ${this.score}`, 10, 30)
				this.ctx.setFontSize(16)
				this.ctx.fillText(`难度: ${this.difficultyLevel}`, 10, 50)
				
				// 立即绘制
				this.ctx.draw(true)
			} catch (error) {
				console.error('Draw error:', error)
			}
		},
		
		handleTouchStart(e) {
			const touch = e.touches[0]
			// 获取canvas相对于页面的位置
			const query = uni.createSelectorQuery().in(this)
			query.select('.game-canvas').boundingClientRect((rect) => {
				this.touchX = touch.clientX - rect.left
				this.touchY = touch.clientY - rect.top
			}).exec()
		},
		
		handleTouchMove(e) {
			const touch = e.touches[0]
			// 获取canvas相对于页面的位置
			const query = uni.createSelectorQuery().in(this)
			query.select('.game-canvas').boundingClientRect((rect) => {
				this.touchX = touch.clientX - rect.left
				this.touchY = touch.clientY - rect.top
			}).exec()
		},
		
		handleTouchEnd(e) {
			// 触摸结束，保持飞机位置
		},
		
		// 启动重置时间更新定时器
		startResetTimer() {
			this.stopResetTimer()
			// 每分钟更新一次重置时间显示
			this.resetTimer = setInterval(() => {
				this.$forceUpdate()
			}, 60000) // 60秒更新一次
		},
		
		// 停止重置时间更新定时器
		stopResetTimer() {
			if (this.resetTimer) {
				clearInterval(this.resetTimer)
				this.resetTimer = null
			}
		},
		
		// 绘制飞机（带细节）
		drawAirplane(centerX, centerY) {
			const ctx = this.ctx
			const width = this.airplane.width
			const height = this.airplane.height
			const rotation = this.airplane.rotation
			
			ctx.save()
			ctx.translate(centerX, centerY)
			ctx.rotate(rotation)
			
			// 机身（主体）
			ctx.setFillStyle('#00C9A7')
			ctx.beginPath()
			ctx.moveTo(0, -height / 2 + 5) // 机头
			ctx.lineTo(-width / 4, height / 2) // 左下
			ctx.lineTo(width / 4, height / 2) // 右下
			ctx.closePath()
			ctx.fill()
			
			// 机翼（左）
			ctx.setFillStyle('#00A8CC')
			ctx.beginPath()
			ctx.moveTo(-width / 4, height / 4)
			ctx.lineTo(-width / 2, height / 2 - 5)
			ctx.lineTo(-width / 4, height / 2)
			ctx.closePath()
			ctx.fill()
			
			// 机翼（右）
			ctx.beginPath()
			ctx.moveTo(width / 4, height / 4)
			ctx.lineTo(width / 2, height / 2 - 5)
			ctx.lineTo(width / 4, height / 2)
			ctx.closePath()
			ctx.fill()
			
			// 尾翼
			ctx.setFillStyle('#008B8B')
			ctx.beginPath()
			ctx.moveTo(0, height / 2)
			ctx.lineTo(-width / 6, height / 2 + 8)
			ctx.lineTo(width / 6, height / 2 + 8)
			ctx.closePath()
			ctx.fill()
			
			// 驾驶舱（窗户）
			ctx.setFillStyle('#87CEEB')
			ctx.beginPath()
			ctx.arc(0, -height / 6, 6, 0, Math.PI * 2)
			ctx.fill()
			
			// 机头高光
			ctx.setFillStyle('#FFFFFF')
			ctx.beginPath()
			ctx.arc(0, -height / 2 + 8, 3, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.restore()
		},
		
		// 绘制病毒
		drawVirus(centerX, centerY, radius, rotation, spikes) {
			const ctx = this.ctx
			
			ctx.save()
			ctx.translate(centerX, centerY)
			ctx.rotate(rotation)
			
			// 病毒主体（圆形，带渐变效果）
			ctx.setFillStyle('#FF6B6B')
			ctx.beginPath()
			ctx.arc(0, 0, radius, 0, Math.PI * 2)
			ctx.fill()
			
			// 病毒外层（深红色）
			ctx.setFillStyle('#FF4444')
			ctx.beginPath()
			ctx.arc(0, 0, radius * 0.8, 0, Math.PI * 2)
			ctx.fill()
			
			// 绘制病毒刺
			ctx.setFillStyle('#CC0000')
			const spikeLength = radius * 0.4
			const angleStep = (Math.PI * 2) / spikes
			
			for (let i = 0; i < spikes; i++) {
				const angle = i * angleStep
				const x1 = Math.cos(angle) * radius
				const y1 = Math.sin(angle) * radius
				const x2 = Math.cos(angle) * (radius + spikeLength)
				const y2 = Math.sin(angle) * (radius + spikeLength)
				
				ctx.beginPath()
				ctx.moveTo(x1, y1)
				ctx.lineTo(x2, y2)
				ctx.lineTo(Math.cos(angle + angleStep / 2) * (radius + spikeLength * 0.7), Math.sin(angle + angleStep / 2) * (radius + spikeLength * 0.7))
				ctx.closePath()
				ctx.fill()
			}
			
			// 病毒内部细节（小圆点）
			ctx.setFillStyle('#FFFFFF')
			ctx.beginPath()
			ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2)
			ctx.fill()
			
			// 病毒眼睛（两个小点）
			ctx.setFillStyle('#000000')
			ctx.beginPath()
			ctx.arc(-radius * 0.2, -radius * 0.1, 2, 0, Math.PI * 2)
			ctx.fill()
			ctx.beginPath()
			ctx.arc(radius * 0.2, -radius * 0.1, 2, 0, Math.PI * 2)
			ctx.fill()
			
			ctx.restore()
		}
	}
}
</script>

<style lang="scss" scoped>
.game-container {
	background: #FFFFFF;
	border-radius: 24rpx;
	padding: 30rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.game-canvas {
	width: 100%;
	height: 500rpx;
	background: #1a1a2e;
	border-radius: 16rpx;
	display: block;
	touch-action: none;
}

.game-info {
	display: flex;
	justify-content: space-between;
	margin-top: 20rpx;
	padding: 20rpx;
	background: #F5F7FA;
	border-radius: 12rpx;
	
	.info-text {
		font-size: 28rpx;
		color: #333;
		font-weight: 600;
	}
}

.game-limit-info {
	margin-top: 20rpx;
	padding: 20rpx;
	background: #FFF3CD;
	border-radius: 12rpx;
	border: 1px solid #FFE69C;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
	
	.limit-text {
		font-size: 26rpx;
		color: #856404;
		font-weight: 600;
	}
	
	.limit-desc {
		font-size: 24rpx;
		color: #856404;
	}
}

.game-controls {
	display: flex;
	gap: 20rpx;
	margin-top: 20rpx;
	
	.game-btn {
		flex: 1;
		height: 70rpx;
		background: linear-gradient(135deg, #00C9A7 0%, #00A8CC 100%);
		color: #FFFFFF;
		font-size: 28rpx;
		border-radius: 12rpx;
		border: none;
		
		&.disabled {
			background: #CCCCCC;
			color: #999999;
			opacity: 0.6;
		}
	}
}
</style>

