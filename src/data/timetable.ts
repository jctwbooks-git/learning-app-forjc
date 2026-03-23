export interface SchoolPeriod {
  period: string;
  time: string;
  subjects: { [key: string]: string }; // key: "Mon" | "Tue" | ...
}

export interface PracticeSchedule {
  day: string;
  subjects: string[];
  focus: string;
  methods: string;
  materials: string;
}

export const SCHOOL_TIMETABLE: SchoolPeriod[] = [
  { period: "第一節", time: "08:30-09:15", subjects: { Mon: "國文", Tue: "客語 🔴", Wed: "輔導 🟡", Thu: "國文", Fri: "生科 🟡" } },
  { period: "第二節", time: "09:25-10:10", subjects: { Mon: "藝術 🔴", Tue: "地理", Wed: "數學", Thu: "體育 🔴", Fri: "資科 🟡" } },
  { period: "第三節", time: "10:20-11:05", subjects: { Mon: "食在寶山 🔴", Tue: "體育 🔴", Wed: "自然", Thu: "自然", Fri: "求生 🔴" } },
  { period: "第四節", time: "11:15-12:00", subjects: { Mon: "數學", Tue: "國文", Wed: "數學", Thu: "家政 🔴", Fri: "數學" } },
  { period: "第五節", time: "13:10-13:55", subjects: { Mon: "自然", Tue: "英語", Wed: "英語", Thu: "音樂 🔴", Fri: "英語" } },
  { period: "第六節", time: "14:05-14:50", subjects: { Mon: "表演 🔴", Tue: "童軍 🔴", Wed: "社團 🟡", Thu: "閱讀 🟡", Fri: "公民" } },
  { period: "第七節", time: "15:05-15:50", subjects: { Mon: "歷史", Tue: "健康", Wed: "國文", Thu: "數學", Fri: "國文" } },
];

export const WEEKLY_PRACTICE: { [key: string]: PracticeSchedule } = {
  Mon: { day: "週一", subjects: ["數學", "自然"], focus: "數學（25分）＋ 自然（20分）", methods: "30+15策略", materials: "數學講義題目" },
  Tue: { day: "週二", subjects: ["地理", "英語"], focus: "地理（20分）＋ 英語單字（25分）", methods: "地理先看圖表再寫題；英語用隨身夾", materials: "地理講義" },
  Wed: { day: "週三", subjects: ["數學"], focus: "數學主攻（45分）", methods: "30+15策略，聯立方程式等難題集中突破", materials: "數學講義題目" },
  Thu: { day: "週四", subjects: ["自然", "數學"], focus: "自然主攻（30分）＋ 數學錯題訂正（15分）", methods: "30+15策略", materials: "自然講義題目" },
  Fri: { day: "週五", subjects: ["英語", "國文"], focus: "英語（25分）＋ 國文（20分）", methods: "輕鬆收尾，語文為主", materials: "英語講義" },
  Sat: { day: "週六", subjects: ["數學", "自然"], focus: "數學（30分）＋ 自然（30分）", methods: "用講義題目補強週間弱點", materials: "數學／自然講義" },
  Sun: { day: "週日", subjects: ["國文", "英語"], focus: "預習下週國文課文 ＋ 英語單字複習", methods: "輕鬆預習，維持節奏", materials: "英語隨身夾" },
};

export const EXAM_TIPS = [
  { days: 14, message: "⚠️ 評量單可以開始使用了！段考前兩週衝刺啟動。" },
  { days: 7, message: "🔥 重點複習模式：打開數學錯題本、複習自然重點整理。" },
  { days: 3, message: "📖 系統提示：只複習不練新題，以閱讀筆記與精選題型為主。" },
  { days: 1, message: "🌙 最後衝刺：早點休息，確保睡眠充足，明天加油！" },
];
