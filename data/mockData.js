// 题库 T001-T015
export const quizQuestions = [
	{
		id: 'T001',
		question: '你每天的睡眠时长大约是？',
		options: [
			{ label: 'A. 少于7小时', score: 0 },
			{ label: 'B. 7-9小时', score: 1 },
			{ label: 'C. 9小时以上', score: 2 }
		]
	},
	{
		id: 'T002',
		question: '你通常几点睡觉？',
		options: [
			{ label: 'A. 23:00之后', score: 0 },
			{ label: 'B. 22:00-23:00', score: 1 },
			{ label: 'C. 22:00之前', score: 2 }
		]
	},
	{
		id: 'T003',
		question: '你每周户外运动（跑步、球类、游泳等）的频率是？',
		options: [
			{ label: 'A. 少于2次', score: 0 },
			{ label: 'B. 2-4次', score: 1 },
			{ label: 'C. 4次以上', score: 2 }
		]
	},
	{
		id: 'T004',
		question: '你每天喝牛奶或奶制品的频率是？',
		options: [
			{ label: 'A. 很少或从不', score: 0 },
			{ label: 'B. 偶尔（每周2-3次）', score: 1 },
			{ label: 'C. 经常（每天）', score: 2 }
		]
	},
	{
		id: 'T005',
		question: '你每天吃鸡蛋的频率是？',
		options: [
			{ label: 'A. 很少或从不', score: 0 },
			{ label: 'B. 偶尔（每周2-3次）', score: 1 },
			{ label: 'C. 经常（每天）', score: 2 }
		]
	},
	{
		id: 'T006',
		question: '你每天吃豆类（豆腐、豆浆等）的频率是？',
		options: [
			{ label: 'A. 很少或从不', score: 0 },
			{ label: 'B. 偶尔（每周2-3次）', score: 1 },
			{ label: 'C. 经常（每天）', score: 2 }
		]
	},
	{
		id: 'T007',
		question: '你每天吃新鲜蔬菜的频率是？',
		options: [
			{ label: 'A. 很少或从不', score: 0 },
			{ label: 'B. 偶尔（每周2-3次）', score: 1 },
			{ label: 'C. 经常（每天）', score: 2 }
		]
	},
	{
		id: 'T008',
		question: '你是否有挑食或偏食的习惯？',
		options: [
			{ label: 'A. 严重挑食', score: 0 },
			{ label: 'B. 轻微挑食', score: 1 },
			{ label: 'C. 不挑食', score: 2 }
		]
	},
	{
		id: 'T009',
		question: '你是否有长期服用营养补充剂的习惯？',
		options: [
			{ label: 'A. 从未服用', score: 0 },
			{ label: 'B. 偶尔服用', score: 1 },
			{ label: 'C. 规律服用', score: 2 }
		]
	},
	{
		id: 'T010',
		question: '你是否有过敏史（牛奶、大豆、坚果等）？',
		options: [
			{ label: 'A. 有严重过敏', score: 0 },
			{ label: 'B. 有轻微过敏', score: 1 },
			{ label: 'C. 无过敏', score: 2 }
		]
	},
	{
		id: 'T011',
		question: '你每天使用电子设备（手机、电脑）的时间是？',
		options: [
			{ label: 'A. 超过6小时', score: 0 },
			{ label: 'B. 3-6小时', score: 1 },
			{ label: 'C. 少于3小时', score: 2 }
		]
	},
	{
		id: 'T012',
		question: '你的学习压力如何？',
		options: [
			{ label: 'A. 压力很大', score: 0 },
			{ label: 'B. 压力一般', score: 1 },
			{ label: 'C. 压力较小', score: 2 }
		]
	},
	{
		id: 'T013',
		question: '你是否有规律的运动习惯（如跳绳、篮球、游泳等）？',
		options: [
			{ label: 'A. 没有', score: 0 },
			{ label: 'B. 偶尔', score: 1 },
			{ label: 'C. 有规律', score: 2 }
		]
	},
	{
		id: 'T014',
		question: '你是否有慢性疾病或长期服药？',
		options: [
			{ label: 'A. 有', score: 0 },
			{ label: 'B. 偶尔有', score: 1 },
			{ label: 'C. 无', score: 2 }
		]
	},
	{
		id: 'T015',
		question: '你对自己目前的身高是否满意？',
		options: [
			{ label: 'A. 非常不满意', score: 0 },
			{ label: 'B. 一般', score: 1 },
			{ label: 'C. 满意', score: 2 }
		]
	}
]

// 单品补剂库 S001-S005
export const supplements = {
	S001: {
		id: 'S001',
		name: '钙片',
		dose: '每日500-800mg',
		reason: '钙是骨骼发育的重要元素，青少年期骨骼快速生长，需要充足的钙质支持。',
		precautions: '建议饭后服用，避免与含草酸的食物同食。过量可能引起便秘。',
		allergies: ['无']
	},
	S002: {
		id: 'S002',
		name: '维生素D3',
		dose: '每日400-800IU',
		reason: '维生素D3促进钙的吸收，缺乏会影响骨骼健康。',
		precautions: '建议与钙片同服，效果更佳。避免过量服用。',
		allergies: ['无']
	},
	S003: {
		id: 'S003',
		name: '锌片',
		dose: '每日10-15mg',
		reason: '锌参与蛋白质合成和细胞分裂，对生长发育至关重要。',
		precautions: '建议饭后服用，避免与铁剂同服。',
		allergies: ['无']
	},
	S004: {
		id: 'S004',
		name: '复合维生素B',
		dose: '每日1片',
		reason: 'B族维生素参与能量代谢和神经系统发育，支持整体健康。',
		precautions: '建议饭后服用，避免空腹。',
		allergies: ['无']
	},
	S005: {
		id: 'S005',
		name: '蛋白质粉',
		dose: '每日15-20g',
		reason: '蛋白质是身体组织的基础，充足的蛋白质有助于肌肉和骨骼发育。',
		precautions: '建议运动后服用，避免与牛奶过敏者使用。',
		allergies: ['牛奶']
	}
}

// 复配组合库 F001-F004
export const formulas = {
	F001: {
		id: 'F001',
		name: '基础成长组合',
		items: ['S001', 'S002'],
		reason: '钙+维生素D3是最基础的骨骼发育组合，适合大多数青少年。',
		precautions: '建议饭后服用，避免与含草酸的食物同食。',
		allergies: ['无']
	},
	F002: {
		id: 'F002',
		name: '全面成长组合',
		items: ['S001', 'S002', 'S003'],
		reason: '钙+维生素D3+锌的组合，全面支持骨骼发育和细胞生长。',
		precautions: '建议饭后服用，锌与钙需间隔1小时服用。',
		allergies: ['无']
	},
	F003: {
		id: 'F003',
		name: '强化成长组合',
		items: ['S001', 'S002', 'S003', 'S004'],
		reason: '全面的营养支持，适合营养摄入不足或挑食的青少年。',
		precautions: '建议饭后服用，注意各成分的服用时间间隔。',
		allergies: ['无']
	},
	F004: {
		id: 'F004',
		name: '运动成长组合',
		items: ['S001', 'S002', 'S005'],
		reason: '适合有规律运动习惯的青少年，补充运动消耗的营养。',
		precautions: '蛋白质粉建议运动后服用，避免与牛奶过敏者使用。',
		allergies: ['牛奶']
	}
}

