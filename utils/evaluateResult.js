import { formulas, supplements } from '../data/mockData.js'

/**
 * 评估测评结果并生成推荐方案
 * @param {Array} answers - 答题结果 [{ questionId, score }, ...]
 * @param {Object} profile - 用户档案
 * @returns {Object} 推荐结果
 */
export function evaluateResult(answers, profile) {
	if (!answers || !Array.isArray(answers)) {
		return {
			status: 'error',
			message: '答题数据无效'
		}
	}
	
	if (answers.length !== 15) {
		return {
			status: 'error',
			message: `答题不完整，当前完成 ${answers.length}/15 题`
		}
	}
	
	// 验证所有答案都有 questionId 和 score
	const validAnswers = answers.filter(a => a && a.questionId && typeof a.score === 'number')
	if (validAnswers.length !== 15) {
		return {
			status: 'error',
			message: '部分答案数据无效'
		}
	}
	
	// 计算总分
	const totalScore = answers.reduce((sum, item) => sum + (item.score || 0), 0)
	const maxScore = 30 // 15题 * 2分
	
	// 评估等级
	let level = 'normal' // normal | good | excellent | need_attention
	let summary = ''
	
	if (totalScore >= 25) {
		level = 'excellent'
		summary = '你的生活习惯和营养状况很好，继续保持！'
	} else if (totalScore >= 18) {
		level = 'good'
		summary = '你的整体状况不错，有进一步提升的空间。'
	} else if (totalScore >= 12) {
		level = 'normal'
		summary = '你的状况基本正常，建议优化生活习惯和营养摄入。'
	} else {
		level = 'need_attention'
		summary = '建议重点关注营养摄入和生活习惯，必要时咨询专业建议。'
	}
	
	// 分析答题情况
	const sleepScore = (answers[0]?.score || 0) + (answers[1]?.score || 0) // T001 + T002
	const nutritionScore = (answers[3]?.score || 0) + (answers[4]?.score || 0) + 
	                      (answers[5]?.score || 0) + (answers[6]?.score || 0) + 
	                      (answers[7]?.score || 0) // T004-T008
	const exerciseScore = (answers[2]?.score || 0) + (answers[12]?.score || 0) // T003 + T013
	const allergyInfo = answers[9]?.score === 0 ? '有过敏' : '无过敏' // T010
	
	// 推荐逻辑
	let recommendations = []
	let blockedReasons = []
	
	// 检查过敏情况
	const hasAllergy = answers[9]?.score === 0 || (answers[9]?.score === 1) // 有过敏或轻微过敏
	const allergyType = profile.allergies || []
	const hasMilkAllergy = allergyType.includes('milk')
	const hasSoyAllergy = allergyType.includes('soy')
	const hasNutsAllergy = allergyType.includes('nuts')
	
	// 优先推荐复配组合（如果无过敏或过敏不影响）
	if (!hasAllergy || (!hasMilkAllergy && !hasSoyAllergy && !hasNutsAllergy)) {
		// 无过敏或过敏不影响，优先推荐组合
		if (totalScore < 15) {
			// 低分（<15），推荐全面组合
			if (hasMilkAllergy) {
				// 有牛奶过敏，推荐不含蛋白质粉的组合
				recommendations.push({
					type: 'formula',
					id: 'F002',
					...formulas.F002
				})
			} else {
				// 无牛奶过敏，推荐最全面的组合
				recommendations.push({
					type: 'formula',
					id: 'F003',
					...formulas.F003
				})
			}
		} else if (totalScore < 20) {
			// 中等分数（15-19），根据运动情况推荐
			if (exerciseScore >= 3 && !hasMilkAllergy) {
				// 有运动习惯且无牛奶过敏，推荐运动组合
				recommendations.push({
					type: 'formula',
					id: 'F004',
					...formulas.F004
				})
			} else if (!hasMilkAllergy) {
				// 无牛奶过敏，推荐全面组合
				recommendations.push({
					type: 'formula',
					id: 'F002',
					...formulas.F002
				})
			} else {
				// 有牛奶过敏，推荐基础组合（不含蛋白质粉）
				recommendations.push({
					type: 'formula',
					id: 'F002',
					...formulas.F002
				})
			}
		} else {
			// 高分（>=20），推荐基础组合
			recommendations.push({
				type: 'formula',
				id: 'F001',
				...formulas.F001
			})
		}
	}
	
	// 如果无组合推荐（有严重过敏），推荐单品
	if (recommendations.length === 0) {
		// 根据答题情况和过敏情况推荐单品
		if (nutritionScore < 6) {
			// 营养摄入不足，推荐多个单品
			// 钙片（无过敏限制）
			recommendations.push({
				type: 'supplement',
				id: 'S001',
				...supplements.S001
			})
			
			// 维生素D3（无过敏限制）
			recommendations.push({
				type: 'supplement',
				id: 'S002',
				...supplements.S002
			})
			
			// 锌片（无过敏限制）
			if (totalScore < 18) {
				recommendations.push({
					type: 'supplement',
					id: 'S003',
					...supplements.S003
				})
			}
			
			// 复合维生素B（无过敏限制）
			if (totalScore < 15) {
				recommendations.push({
					type: 'supplement',
					id: 'S004',
					...supplements.S004
				})
			}
			
			// 蛋白质粉（需检查牛奶过敏）
			if (exerciseScore >= 3 && !hasMilkAllergy) {
				recommendations.push({
					type: 'supplement',
					id: 'S005',
					...supplements.S005
				})
			}
		} else {
			// 营养状况较好，推荐基础单品
			recommendations.push({
				type: 'supplement',
				id: 'S001',
				...supplements.S001
			})
			
			recommendations.push({
				type: 'supplement',
				id: 'S002',
				...supplements.S002
			})
			
			// 如果运动较多，可加锌
			if (exerciseScore >= 3) {
				recommendations.push({
					type: 'supplement',
					id: 'S003',
					...supplements.S003
				})
			}
		}
	}
	
	// 检查屏蔽条件 - 过滤掉包含过敏成分的推荐
	recommendations = recommendations.filter(rec => {
		if (rec.type === 'formula') {
			// 检查组合中的每个单品
			const hasAllergen = rec.items.some(itemId => {
				const item = supplements[itemId]
				if (!item) return false
				// 检查单品是否包含过敏成分
				if (item.allergies && item.allergies.length > 0) {
					// 如果单品标注了过敏信息
					if (item.allergies.includes('牛奶') && hasMilkAllergy) return true
					if (item.allergies.includes('大豆') && hasSoyAllergy) return true
					if (item.allergies.includes('坚果') && hasNutsAllergy) return true
				}
				return false
			})
			if (hasAllergen) {
				blockedReasons.push(`组合 ${rec.name} 中包含过敏成分，已自动屏蔽`)
				return false
			}
		} else {
			// 检查单品
			if (rec.allergies && rec.allergies.length > 0) {
				if (rec.allergies.includes('牛奶') && hasMilkAllergy) {
					blockedReasons.push(`补剂 ${rec.name} 包含牛奶成分，已自动屏蔽`)
					return false
				}
				if (rec.allergies.includes('大豆') && hasSoyAllergy) {
					blockedReasons.push(`补剂 ${rec.name} 包含大豆成分，已自动屏蔽`)
					return false
				}
				if (rec.allergies.includes('坚果') && hasNutsAllergy) {
					blockedReasons.push(`补剂 ${rec.name} 包含坚果成分，已自动屏蔽`)
					return false
				}
			}
		}
		return true
	})
	
	// 如果过滤后没有推荐，至少推荐基础单品（不包含过敏成分的）
	if (recommendations.length === 0) {
		// 推荐最基础的钙片和维生素D3（这两个通常不含常见过敏原）
		recommendations.push({
			type: 'supplement',
			id: 'S001',
			...supplements.S001
		})
		recommendations.push({
			type: 'supplement',
			id: 'S002',
			...supplements.S002
		})
	}
	
	// 生成行动建议
	const actionItems = []
	
	if (sleepScore < 3) {
		actionItems.push({
			text: '保证每天22:00前睡觉，睡眠时长9小时以上',
			category: 'sleep',
			checked: false
		})
	}
	
	if (exerciseScore < 3) {
		actionItems.push({
			text: '每周至少3次户外运动，每次30分钟以上',
			category: 'exercise',
			checked: false
		})
	}
	
	if (nutritionScore < 8) {
		actionItems.push({
			text: '每天保证一杯牛奶、一个鸡蛋、适量豆制品',
			category: 'nutrition',
			checked: false
		})
		actionItems.push({
			text: '多吃新鲜蔬菜，减少挑食偏食',
			category: 'nutrition',
			checked: false
		})
	}
	
	if (actionItems.length === 0) {
		actionItems.push({
			text: '保持当前良好的生活习惯',
			category: 'maintain',
			checked: false
		})
		actionItems.push({
			text: '定期监测身高变化，建议每3个月测量一次',
			category: 'monitor',
			checked: false
		})
	}
	
	return {
		status: 'success',
		level,
		summary,
		totalScore,
		maxScore,
		recommendations,
		blockedReasons,
		actionItems,
		analysis: {
			sleepScore,
			nutritionScore,
			exerciseScore
		}
	}
}

