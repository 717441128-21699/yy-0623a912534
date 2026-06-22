import type { Staff, Patient, Appointment, Voucher, PostOpInstruction } from '../types'

export const staffList: Staff[] = [
  { id: 'S001', name: '王护士', role: 'nurse', room: 'skin_treatment', avatar: '', password: '123456' },
  { id: 'S002', name: '李治疗师', role: 'therapist', room: 'photoelectric', avatar: '', password: '123456' },
  { id: 'S003', name: '张医生', role: 'doctor', room: 'injection', avatar: '', password: '123456' },
  { id: 'S004', name: '赵主管', role: 'supervisor', room: 'skin_treatment', avatar: '', password: '123456' },
  { id: 'S005', name: '陈护士', role: 'nurse', room: 'photoelectric', avatar: '', password: '123456' },
  { id: 'S006', name: '刘治疗师', role: 'therapist', room: 'injection', avatar: '', password: '123456' },
]

export const patientList: Patient[] = [
  { id: 'P001', name: '刘思琪', gender: 'female', age: 28, cardNo: 'GH20260101', avatar: '', allergies: ['海鲜'], contraindications: [], specialNotes: [] },
  { id: 'P002', name: '陈浩然', gender: 'male', age: 35, cardNo: 'GH20260102', avatar: '', allergies: [], contraindications: [], specialNotes: [] },
  { id: 'P003', name: '张雨薇', gender: 'female', age: 42, cardNo: 'GH20260103', avatar: '', allergies: ['青霉素'], contraindications: ['孕期'], specialNotes: [] },
  { id: 'P004', name: '王建国', gender: 'male', age: 50, cardNo: 'GH20260104', avatar: '', allergies: [], contraindications: ['心脏起搏器'], specialNotes: ['疤痕体质'] },
  { id: 'P005', name: '李梦瑶', gender: 'female', age: 24, cardNo: 'GH20260105', avatar: '', allergies: ['海鲜', '花粉'], contraindications: [], specialNotes: [] },
  { id: 'P006', name: '赵志远', gender: 'male', age: 38, cardNo: 'GH20260106', avatar: '', allergies: [], contraindications: ['光敏'], specialNotes: [] },
  { id: 'P007', name: '孙婉婷', gender: 'female', age: 31, cardNo: 'GH20260107', avatar: '', allergies: ['阿司匹林'], contraindications: [], specialNotes: ['疤痕体质'] },
  { id: 'P008', name: '周明辉', gender: 'male', age: 45, cardNo: 'GH20260108', avatar: '', allergies: [], contraindications: [], specialNotes: [] },
  { id: 'P009', name: '吴佳欣', gender: 'female', age: 22, cardNo: 'GH20260109', avatar: '', allergies: ['青霉素', '海鲜'], contraindications: ['孕期'], specialNotes: [] },
  { id: 'P010', name: '郑天宇', gender: 'male', age: 58, cardNo: 'GH20260110', avatar: '', allergies: [], contraindications: ['光敏', '金属植入'], specialNotes: [] },
]

export const appointmentList: Appointment[] = [
  { id: 'A001', patientId: 'P001', room: 'skin_treatment', projectName: '果酸焕肤', bodyPart: '面部', estimatedDuration: 40, scheduledTime: '09:00', status: 'waiting' },
  { id: 'A002', patientId: 'P003', room: 'photoelectric', projectName: '光子嫩肤', bodyPart: '全脸', estimatedDuration: 45, scheduledTime: '09:00', status: 'in_progress' },
  { id: 'A003', patientId: 'P005', room: 'injection', projectName: '水光针', bodyPart: '面颊', estimatedDuration: 30, scheduledTime: '09:00', status: 'treatment_completed' },
  { id: 'A004', patientId: 'P002', room: 'photoelectric', projectName: '皮秒激光', bodyPart: '面部', estimatedDuration: 60, scheduledTime: '09:30', status: 'waiting' },
  { id: 'A005', patientId: 'P007', room: 'injection', projectName: '玻尿酸填充', bodyPart: '法令纹', estimatedDuration: 45, scheduledTime: '09:30', status: 'in_progress' },
  { id: 'A006', patientId: 'P004', room: 'skin_treatment', projectName: '点阵激光', bodyPart: '手部', estimatedDuration: 50, scheduledTime: '10:00', status: 'waiting' },
  { id: 'A007', patientId: 'P006', room: 'photoelectric', projectName: '热玛吉', bodyPart: '下颌线', estimatedDuration: 90, scheduledTime: '10:00', status: 'voucher_deducted' },
  { id: 'A008', patientId: 'P008', room: 'injection', projectName: '水光针', bodyPart: '颈部', estimatedDuration: 35, scheduledTime: '10:30', status: 'waiting' },
  { id: 'A009', patientId: 'P001', room: 'photoelectric', projectName: '射频紧肤', bodyPart: '面部', estimatedDuration: 60, scheduledTime: '10:30', status: 'verified' },
  { id: 'A010', patientId: 'P009', room: 'skin_treatment', projectName: '果酸焕肤', bodyPart: '全脸', estimatedDuration: 40, scheduledTime: '11:00', status: 'treatment_completed' },
  { id: 'A011', patientId: 'P010', room: 'injection', projectName: '玻尿酸填充', bodyPart: '法令纹', estimatedDuration: 45, scheduledTime: '11:00', status: 'to_front_desk' },
  { id: 'A012', patientId: 'P003', room: 'photoelectric', projectName: '光子嫩肤', bodyPart: '颈部', estimatedDuration: 45, scheduledTime: '11:30', status: 'waiting' },
  { id: 'A013', patientId: 'P007', room: 'skin_treatment', projectName: '点阵激光', bodyPart: '面部', estimatedDuration: 60, scheduledTime: '11:30', status: 'in_progress' },
  { id: 'A014', patientId: 'P005', room: 'photoelectric', projectName: '皮秒激光', bodyPart: '面部', estimatedDuration: 60, scheduledTime: '14:00', status: 'waiting' },
  { id: 'A015', patientId: 'P002', room: 'injection', projectName: '水光针', bodyPart: '全脸', estimatedDuration: 30, scheduledTime: '14:00', status: 'verified' },
]

export const voucherList: Voucher[] = [
  { id: 'V001', patientId: 'P001', type: 'course_card', name: '光子嫩肤疗程卡(6次)', totalSessions: 6, usedSessions: 2, remainingSessions: 4, expiryDate: '2026-12-31', applicableProjects: ['光子嫩肤'] },
  { id: 'V002', patientId: 'P001', type: 'experience_voucher', name: '果酸焕肤体验券', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-08-15', applicableProjects: ['果酸焕肤'] },
  { id: 'V003', patientId: 'P002', type: 'course_card', name: '皮秒激光疗程卡(6次)', totalSessions: 6, usedSessions: 1, remainingSessions: 5, expiryDate: '2027-03-01', applicableProjects: ['皮秒激光'] },
  { id: 'V004', patientId: 'P002', type: 'gift_session', name: '水光针赠送1次', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-07-01', applicableProjects: ['水光针'] },
  { id: 'V005', patientId: 'P003', type: 'course_card', name: '光子嫩肤疗程卡(6次)', totalSessions: 6, usedSessions: 4, remainingSessions: 2, expiryDate: '2026-09-30', applicableProjects: ['光子嫩肤'] },
  { id: 'V006', patientId: 'P003', type: 'experience_voucher', name: '热玛吉体验券', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-06-30', applicableProjects: ['热玛吉'] },
  { id: 'V007', patientId: 'P004', type: 'course_card', name: '点阵激光疗程卡(4次)', totalSessions: 4, usedSessions: 0, remainingSessions: 4, expiryDate: '2027-06-30', applicableProjects: ['点阵激光'] },
  { id: 'V008', patientId: 'P005', type: 'course_card', name: '水光针套餐(3次)', totalSessions: 3, usedSessions: 1, remainingSessions: 2, expiryDate: '2026-11-30', applicableProjects: ['水光针'] },
  { id: 'V009', patientId: 'P005', type: 'gift_session', name: '皮秒激光赠送2次', totalSessions: 2, usedSessions: 0, remainingSessions: 2, expiryDate: '2026-10-15', applicableProjects: ['皮秒激光'] },
  { id: 'V010', patientId: 'P006', type: 'experience_voucher', name: '射频紧肤体验券', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-07-15', applicableProjects: ['射频紧肤'] },
  { id: 'V011', patientId: 'P006', type: 'course_card', name: '热玛吉疗程卡(3次)', totalSessions: 3, usedSessions: 1, remainingSessions: 2, expiryDate: '2027-01-31', applicableProjects: ['热玛吉'] },
  { id: 'V012', patientId: 'P007', type: 'course_card', name: '玻尿酸填充套餐(3次)', totalSessions: 3, usedSessions: 1, remainingSessions: 2, expiryDate: '2026-12-15', applicableProjects: ['玻尿酸填充'] },
  { id: 'V013', patientId: 'P007', type: 'gift_session', name: '点阵激光赠送1次', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-08-31', applicableProjects: ['点阵激光'] },
  { id: 'V014', patientId: 'P008', type: 'experience_voucher', name: '水光针体验券', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-09-01', applicableProjects: ['水光针'] },
  { id: 'V015', patientId: 'P009', type: 'course_card', name: '果酸焕肤疗程卡(6次)', totalSessions: 6, usedSessions: 5, remainingSessions: 1, expiryDate: '2026-07-31', applicableProjects: ['果酸焕肤'] },
  { id: 'V016', patientId: 'P009', type: 'gift_session', name: '光子嫩肤赠送1次', totalSessions: 1, usedSessions: 1, remainingSessions: 0, expiryDate: '2026-05-31', applicableProjects: ['光子嫩肤'] },
  { id: 'V017', patientId: 'P010', type: 'course_card', name: '玻尿酸填充套餐(3次)', totalSessions: 3, usedSessions: 0, remainingSessions: 3, expiryDate: '2027-04-30', applicableProjects: ['玻尿酸填充'] },
  { id: 'V018', patientId: 'P010', type: 'experience_voucher', name: '皮秒激光体验券', totalSessions: 1, usedSessions: 1, remainingSessions: 0, expiryDate: '2026-04-30', applicableProjects: ['皮秒激光'] },
  { id: 'V019', patientId: 'P004', type: 'course_card', name: '射频紧肤疗程卡(4次)', totalSessions: 4, usedSessions: 3, remainingSessions: 1, expiryDate: '2026-06-25', applicableProjects: ['射频紧肤'] },
  { id: 'V020', patientId: 'P008', type: 'gift_session', name: '果酸焕肤赠送1次', totalSessions: 1, usedSessions: 0, remainingSessions: 1, expiryDate: '2026-06-20', applicableProjects: ['果酸焕肤'] },
]

export const postOpInstructions: PostOpInstruction[] = [
  {
    projectName: '光子嫩肤',
    items: [
      '治疗后24小时内避免使用热水洗脸，请使用冷水或温水',
      '治疗后3天内避免剧烈运动及大量出汗',
      '治疗后1周内严格防晒，SPF50+防晒霜每2小时补涂一次',
      '治疗后1周内避免使用含酸类、维A醇等刺激性护肤品',
      '治疗后可使用医用修复面膜，每日1片连续3-5天',
      '如出现轻微红肿属于正常反应，一般1-2天自行消退',
    ],
  },
  {
    projectName: '皮秒激光',
    items: [
      '治疗后出现轻微红肿及灼热感属正常现象，可冰敷缓解',
      '治疗后24小时内避免沾水，次日可正常清洁',
      '结痂部位不可用手抠抓，需自然脱落约5-7天',
      '治疗后2周内严格防晒，避免色素沉着',
      '治疗后1周内避免使用美白、含酸类护肤品',
      '饮食宜清淡，避免辛辣刺激及感光性食物',
    ],
  },
  {
    projectName: '热玛吉',
    items: [
      '治疗后可能出现轻微红肿，通常数小时内消退',
      '治疗后1周内每天饮水不少于2000ml以促进代谢',
      '治疗后1周内避免桑拿、泡温泉等高温环境',
      '治疗后1个月内加强保湿，建议使用医用修复面霜',
      '治疗后3个月内每月复查一次，评估效果',
      '治疗后6个月内避免在同一部位进行其他射频类治疗',
    ],
  },
  {
    projectName: '水光针',
    items: [
      '治疗后24小时内注射部位避免沾水',
      '治疗后3天内避免化妆及使用粉底类产品',
      '治疗后1周内每日敷医用修复面膜，加强补水',
      '治疗后1周内避免剧烈运动、饮酒及辛辣饮食',
      '治疗后2周内避免去泳池、桑拿等公共场所',
      '治疗后1个月内避免激光类及射频类治疗',
    ],
  },
  {
    projectName: '玻尿酸填充',
    items: [
      '注射后24小时内避免触碰、按压注射部位',
      '注射后1周内避免剧烈运动及高温环境',
      '注射后1周内睡觉时尽量仰卧，避免侧压',
      '注射后2周内避免进行牙科治疗及面部按摩',
      '如出现轻微淤青可于48小时后热敷促进消散',
      '注射后1个月内复查，必要时进行补打调整',
    ],
  },
  {
    projectName: '点阵激光',
    items: [
      '治疗后创面需保持干燥，24小时内避免沾水',
      '结痂期约5-10天，严禁抠抓痂皮，需自然脱落',
      '治疗后使用医用修复喷雾及修复霜，每日3-4次',
      '治疗后1个月内严格物理防晒加化学防晒',
      '治疗后2周内避免使用含酸类、维C等刺激性护肤品',
      '治疗后1个月内避免食用感光性食物如芹菜、香菜',
    ],
  },
  {
    projectName: '射频紧肤',
    items: [
      '治疗后轻微发红属正常现象，一般2-4小时消退',
      '治疗后1周内加强补水保湿，建议使用医用修复产品',
      '治疗后1周内避免桑拿、高温瑜伽等高温活动',
      '治疗后1周内避免饮酒及辛辣刺激饮食',
      '治疗后1个月内严格防晒，避免长时间户外活动',
      '建议每4-6周进行一次巩固治疗，共3-5次为一疗程',
    ],
  },
  {
    projectName: '果酸焕肤',
    items: [
      '治疗后24小时内避免洗脸，次日仅用温水清洁',
      '治疗后3天内不可使用磨砂膏及含酸类产品',
      '治疗后1周内严格防晒，SPF50+防晒霜每日使用',
      '治疗后1周内避免使用粉底、遮瑕等彩妆产品',
      '治疗后可能出现脱皮现象，严禁手撕，需自然脱落',
      '治疗间隔至少2周，具体以医生建议为准',
    ],
  },
]
