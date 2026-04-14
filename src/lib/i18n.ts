// 다국어 지원 - UI 번역 + 국가별 노동시장 컨텍스트

export const LANGUAGES = [
  { code: "ko", country: "KR", flag: "🇰🇷", label: "한국어",    nativeLabel: "한국어"   },
  { code: "en", country: "US", flag: "🇺🇸", label: "English",   nativeLabel: "English"  },
  { code: "zh", country: "CN", flag: "🇨🇳", label: "中文",      nativeLabel: "中文"     },
  { code: "ja", country: "JP", flag: "🇯🇵", label: "日本語",    nativeLabel: "日本語"   },
  { code: "es", country: "ES", flag: "🇪🇸", label: "Español",   nativeLabel: "Español"  },
] as const;

export type LangCode = typeof LANGUAGES[number]["code"];

// UI 번역 텍스트
export const UI_STRINGS: Record<LangCode, {
  title: string;
  subtitle_adult: string;
  subtitle_youth: string;
  mode_adult: string;
  mode_youth: string;
  placeholder_adult: string;
  placeholder_youth: string;
  analyze_btn: string;
  analyzing_btn: string;
  daily_limit: string;
  loading_hint: string;
  loading: string[];
  empty_title: string;
  empty_sub: string;
  remaining: string;
  instant: string;
  share_btn: string;
  share_title: string;
  save_image: string;
  copy_link: string;
  copied: string;
  disclaimer_title: string;
  disclaimer_body: string;
  footer: string;
  analyzed_count: string;
  risk_safe: string;
  risk_caution: string;
  risk_danger: string;
  risk_critical: string;
  // Hero
  hero_line1: string;
  hero_line2: string;
  hero_tagline: string;
  analyzed_before: string;
  analyzed_after: string;
  // Update badge
  update_badge: string;
  update_tag: string;
  // Search card
  popular_jobs_title: string;
  // Results
  result_subtitle: string;
  analyzing_job_label: string;
  // Process steps
  step1_title: string;
  step1_desc: string;
  step2_title: string;
  step2_desc: string;
  step3_title: string;
  step3_desc: string;
  // AI Coach
  ai_coach: string;
  ai_coach_full: string;
  // Sidebar sections
  section_overview: string;
  section_dimensions: string;
  section_horizon: string;
  section_skills: string;
  section_iceberg: string;
  section_income: string;
  section_industry: string;
  section_transitions: string;
  section_consulting: string;
  section_coach: string;
  // Error messages
  error_analyze: string;
  error_network: string;
  error_empty: string;
  error_too_long: string;
  analyzed_job_done: string;
}> = {
  ko: {
    title: "내 직업의 미래",
    subtitle_adult: "내 직업의 AI 대체 가능성을 8차원으로 심층 분석합니다",
    subtitle_youth: "관심 직업의 AI 대체 가능성을 확인하고 진로를 설계하세요",
    mode_adult: "성인",
    mode_youth: "청소년",
    placeholder_adult: "직업명을 입력하세요 (예: 의사, 회계사, 소프트웨어 개발자)",
    placeholder_youth: "관심 있는 직업을 입력하세요 (예: 선생님, 의사, 프로게이머)",
    analyze_btn: "분석하기",
    analyzing_btn: "분석 중",
    daily_limit: "로그인 후 무료 3회 분석 · AI 분석 결과는 참고용입니다",
    loading_hint: "처음 분석은 30~90초 소요됩니다 · 같은 직업은 즉시 로드",
    loading: [
      "Claude AI가 직업 데이터를 수집하고 있습니다...",
      "8차원 분석 모델을 적용하는 중...",
      "AI 대체 가능성을 계산하고 있습니다...",
      "10년 시간 지평선 예측 생성 중...",
      "스킬 갭 및 전환 경로 분석 중...",
      "소득 영향 및 업종 분석 마무리 중...",
    ],
    empty_title: "직업명을 입력하고 분석을 시작하세요",
    empty_sub: "8차원 분석 · 10년 예측 · 스킬 로드맵 · 소득 영향",
    remaining: "오늘 남은 횟수",
    instant: "⚡ 즉시 로드",
    share_btn: "📤 결과 공유하기",
    share_title: "결과 공유하기",
    save_image: "🖼️ 이미지로 저장 (인스타·틱톡용)",
    copy_link: "🔗 링크 + 텍스트 복사",
    copied: "✅ 복사됨!",
    disclaimer_title: "📌 분석 결과 활용 시 유의사항",
    disclaimer_body: "이 분석은 현재 시점의 기술 트렌드와 학술 연구를 바탕으로 한 추정값입니다.",
    footer: "LoginFuture Ministry · 내 직업의 미래 v2.0",
    analyzed_count: "번 분석됨",
    risk_safe: "안전",
    risk_caution: "주의",
    risk_danger: "위험",
    risk_critical: "매우위험",
    hero_line1: "당신의 직업,",
    hero_line2: "AI 시대에 살아남을까요?",
    hero_tagline: "8차원 분석 · 10년 예측 · 스킬 로드맵 · 무료",
    analyzed_before: "",
    analyzed_after: "명이 이미 분석했습니다",
    update_badge: "매월 1일 데이터 업데이트",
    update_tag: "AI 변화속도 반영",
    popular_jobs_title: "인기 직업 바로 분석",
    result_subtitle: "AI 대체율 분석 결과",
    analyzing_job_label: "분석 중인 직업",
    step1_title: "직업 입력",
    step1_desc: "직업명을 검색창에 입력",
    step2_title: "8차원 분석",
    step2_desc: "AI가 8가지 차원으로 분석",
    step3_title: "결과 확인",
    step3_desc: "상세 리포트 즉시 제공",
    ai_coach: "🔮 AI 코치 대화",
    ai_coach_full: "🔮 AI 코치와 대화하기 →",
    section_overview: "종합 대체율",
    section_dimensions: "8차원 분석",
    section_horizon: "10년 예측",
    section_skills: "스킬 갭",
    section_iceberg: "빙산 모델",
    section_income: "소득 영향",
    section_industry: "업종 분석",
    section_transitions: "전환 경로",
    section_consulting: "컨설팅 노트",
    section_coach: "🔮 AI 코치 대화",
    error_analyze: "분석에 실패했습니다. 다시 시도해주세요.",
    error_network: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
    error_empty: "직업명을 입력해주세요.",
    error_too_long: "직업명은 50자 이하로 입력해주세요.",
    analyzed_job_done: "분석 완료",
  },
  en: {
    title: "Future of My Job",
    subtitle_adult: "Analyze your job's AI replacement risk across 8 dimensions",
    subtitle_youth: "Discover AI risks in your dream job and plan your career",
    mode_adult: "Adult",
    mode_youth: "Youth",
    placeholder_adult: "Enter job title (e.g. Nurse, Accountant, Software Engineer)",
    placeholder_youth: "Enter your dream job (e.g. Teacher, Doctor, Game Developer)",
    analyze_btn: "Analyze",
    analyzing_btn: "Analyzing",
    daily_limit: "3 free analyses after login · Results are for reference only",
    loading_hint: "First analysis takes 30~90s · Same job loads instantly",
    loading: [
      "Claude AI is gathering job data...",
      "Applying 8-dimension analysis model...",
      "Calculating AI replacement probability...",
      "Generating 10-year horizon forecast...",
      "Analyzing skill gaps and transition paths...",
      "Finalizing income impact and industry analysis...",
    ],
    empty_title: "Enter a job title to start your analysis",
    empty_sub: "8D Analysis · 10-Year Forecast · Skill Roadmap · Income Impact",
    remaining: "Remaining today",
    instant: "⚡ Instant load",
    share_btn: "📤 Share Result",
    share_title: "Share Result",
    save_image: "🖼️ Save Image (for Instagram·TikTok)",
    copy_link: "🔗 Copy Link + Text",
    copied: "✅ Copied!",
    disclaimer_title: "📌 Important Notice",
    disclaimer_body: "This analysis is an estimate based on current technology trends and academic research.",
    footer: "LoginFuture Ministry · Future of My Job v2.0",
    analyzed_count: "analyses done",
    risk_safe: "Safe",
    risk_caution: "Caution",
    risk_danger: "At Risk",
    risk_critical: "Critical",
    hero_line1: "Your Job,",
    hero_line2: "Will It Survive the AI Era?",
    hero_tagline: "8D Analysis · 10-Year Forecast · Skill Roadmap · Free",
    analyzed_before: "",
    analyzed_after: " have already analyzed",
    update_badge: "Monthly Data Update",
    update_tag: "AI Speed Tracked",
    popular_jobs_title: "Quick Analyze Popular Jobs",
    result_subtitle: "AI Replacement Analysis",
    analyzing_job_label: "Analyzing Job",
    step1_title: "Enter Job",
    step1_desc: "Type your job title in search",
    step2_title: "8D Analysis",
    step2_desc: "AI analyzes across 8 dimensions",
    step3_title: "View Results",
    step3_desc: "Detailed report instantly",
    ai_coach: "🔮 AI Coach Chat",
    ai_coach_full: "🔮 Chat with AI Coach →",
    section_overview: "Overall Risk",
    section_dimensions: "8D Analysis",
    section_horizon: "10-Year Forecast",
    section_skills: "Skill Gap",
    section_iceberg: "Iceberg Model",
    section_income: "Income Impact",
    section_industry: "Industry Context",
    section_transitions: "Career Paths",
    section_consulting: "Consulting Note",
    section_coach: "🔮 AI Coach Chat",
    error_analyze: "Analysis failed. Please try again.",
    error_network: "Network error. Please check your internet connection.",
    error_empty: "Please enter a job title.",
    error_too_long: "Job title must be under 50 characters.",
    analyzed_job_done: "Analysis Complete",
  },
  zh: {
    title: "我的职业未来",
    subtitle_adult: "从8个维度深度分析您职业被AI取代的可能性",
    subtitle_youth: "了解理想职业的AI风险，规划您的职业发展",
    mode_adult: "成人",
    mode_youth: "青少年",
    placeholder_adult: "输入职业名称（例：医生、会计师、软件工程师）",
    placeholder_youth: "输入感兴趣的职业（例：教师、医生、游戏开发者）",
    analyze_btn: "开始分析",
    analyzing_btn: "分析中",
    daily_limit: "登录后免费分析3次 · 分析结果仅供参考",
    loading_hint: "首次分析需30~90秒 · 相同职业即时加载",
    loading: [
      "Claude AI正在收集职业数据...",
      "应用8维度分析模型...",
      "计算AI替代可能性...",
      "生成10年预测...",
      "分析技能差距和转型路径...",
      "完成收入影响和行业分析...",
    ],
    empty_title: "输入职业名称开始分析",
    empty_sub: "8维分析 · 10年预测 · 技能路线图 · 收入影响",
    remaining: "今日剩余次数",
    instant: "⚡ 即时加载",
    share_btn: "📤 分享结果",
    share_title: "分享结果",
    save_image: "🖼️ 保存图片（用于Instagram·TikTok）",
    copy_link: "🔗 复制链接+文字",
    copied: "✅ 已复制！",
    disclaimer_title: "📌 注意事项",
    disclaimer_body: "本分析基于当前技术趋势和学术研究，为估算值，仅供参考。",
    footer: "LoginFuture Ministry · 我的职业未来 v2.0",
    analyzed_count: "次分析",
    risk_safe: "安全",
    risk_caution: "注意",
    risk_danger: "危险",
    risk_critical: "极危",
    hero_line1: "您的职业，",
    hero_line2: "能在AI时代存活吗？",
    hero_tagline: "8维分析 · 10年预测 · 技能路线图 · 免费",
    analyzed_before: "",
    analyzed_after: "人已完成分析",
    update_badge: "每月1日数据更新",
    update_tag: "跟踪AI变化速度",
    popular_jobs_title: "热门职业快速分析",
    result_subtitle: "AI替代率分析结果",
    analyzing_job_label: "分析中的职业",
    step1_title: "输入职业",
    step1_desc: "在搜索框输入职业名称",
    step2_title: "8维分析",
    step2_desc: "AI从8个维度进行分析",
    step3_title: "查看结果",
    step3_desc: "立即提供详细报告",
    ai_coach: "🔮 AI教练对话",
    ai_coach_full: "🔮 与AI教练对话 →",
    section_overview: "综合替代率",
    section_dimensions: "8维分析",
    section_horizon: "10年预测",
    section_skills: "技能差距",
    section_iceberg: "冰山模型",
    section_income: "收入影响",
    section_industry: "行业分析",
    section_transitions: "转型路径",
    section_consulting: "咨询笔记",
    section_coach: "🔮 AI教练对话",
    error_analyze: "分析失败，请重试。",
    error_network: "网络错误，请检查您的网络连接。",
    error_empty: "请输入职业名称。",
    error_too_long: "职业名称请在50字以内。",
    analyzed_job_done: "分析完成",
  },
  ja: {
    title: "私の仕事の未来",
    subtitle_adult: "AIによる代替リスクを8つの次元で深層分析",
    subtitle_youth: "気になる職業のAIリスクを確認し、キャリアを設計しよう",
    mode_adult: "社会人",
    mode_youth: "若者",
    placeholder_adult: "職業名を入力（例：看護師、会計士、ソフトウェアエンジニア）",
    placeholder_youth: "興味のある職業を入力（例：教師、医師、ゲーム開発者）",
    analyze_btn: "分析する",
    analyzing_btn: "分析中",
    daily_limit: "ログイン後3回まで無料 · 分析結果は参考値です",
    loading_hint: "初回分析は30〜90秒かかります · 同じ職業は即時ロード",
    loading: [
      "Claude AIが職業データを収集中...",
      "8次元分析モデルを適用中...",
      "AI代替可能性を計算中...",
      "10年後の予測を生成中...",
      "スキルギャップと転職経路を分析中...",
      "収入影響と業種分析を完成中...",
    ],
    empty_title: "職業名を入力して分析を開始",
    empty_sub: "8次元分析 · 10年予測 · スキルロードマップ · 収入影響",
    remaining: "本日の残り回数",
    instant: "⚡ 即時ロード",
    share_btn: "📤 結果をシェア",
    share_title: "結果をシェア",
    save_image: "🖼️ 画像を保存（Instagram·TikTok用）",
    copy_link: "🔗 リンク+テキストをコピー",
    copied: "✅ コピー完了！",
    disclaimer_title: "📌 ご注意",
    disclaimer_body: "この分析は現在の技術トレンドと学術研究に基づく推定値です。",
    footer: "LoginFuture Ministry · 私の仕事の未来 v2.0",
    analyzed_count: "回分析済み",
    risk_safe: "安全",
    risk_caution: "注意",
    risk_danger: "危険",
    risk_critical: "非常に危険",
    hero_line1: "あなたの仕事は、",
    hero_line2: "AI時代に生き残れるか？",
    hero_tagline: "8次元分析 · 10年予測 · スキルロードマップ · 無料",
    analyzed_before: "",
    analyzed_after: "人が分析済み",
    update_badge: "毎月1日データ更新",
    update_tag: "AI変化速度を反映",
    popular_jobs_title: "人気職業をすぐ分析",
    result_subtitle: "AI代替率分析結果",
    analyzing_job_label: "分析中の職業",
    step1_title: "職業入力",
    step1_desc: "検索欄に職業名を入力",
    step2_title: "8次元分析",
    step2_desc: "AIが8つの次元で分析",
    step3_title: "結果確認",
    step3_desc: "詳細レポートを即時提供",
    ai_coach: "🔮 AIコーチ対話",
    ai_coach_full: "🔮 AIコーチと対話する →",
    section_overview: "総合代替率",
    section_dimensions: "8次元分析",
    section_horizon: "10年予測",
    section_skills: "スキルギャップ",
    section_iceberg: "アイスバーグモデル",
    section_income: "収入影響",
    section_industry: "業種分析",
    section_transitions: "転職経路",
    section_consulting: "コンサルノート",
    section_coach: "🔮 AIコーチ対話",
    error_analyze: "分析に失敗しました。もう一度お試しください。",
    error_network: "ネットワークエラーが発生しました。インターネット接続を確認してください。",
    error_empty: "職業名を入力してください。",
    error_too_long: "職業名は50文字以内で入力してください。",
    analyzed_job_done: "分析完了",
  },
  es: {
    title: "El Futuro de Mi Trabajo",
    subtitle_adult: "Analiza el riesgo de reemplazo por IA en 8 dimensiones",
    subtitle_youth: "Descubre los riesgos de IA en tu trabajo soñado y planifica tu carrera",
    mode_adult: "Adulto",
    mode_youth: "Joven",
    placeholder_adult: "Ingresa el puesto (ej: Enfermero/a, Contador/a, Ingeniero de Software)",
    placeholder_youth: "Ingresa tu trabajo soñado (ej: Maestro/a, Médico, Desarrollador)",
    analyze_btn: "Analizar",
    analyzing_btn: "Analizando",
    daily_limit: "3 análisis gratuitos al registrarse · Los resultados son de referencia",
    loading_hint: "El primer análisis tarda 30~90s · El mismo trabajo carga al instante",
    loading: [
      "Claude AI está recopilando datos laborales...",
      "Aplicando modelo de análisis de 8 dimensiones...",
      "Calculando probabilidad de reemplazo por IA...",
      "Generando pronóstico a 10 años...",
      "Analizando brechas de habilidades y rutas de transición...",
      "Finalizando impacto en ingresos y análisis sectorial...",
    ],
    empty_title: "Ingresa un puesto para comenzar el análisis",
    empty_sub: "Análisis 8D · Pronóstico 10 años · Hoja de ruta · Impacto salarial",
    remaining: "Restantes hoy",
    instant: "⚡ Carga instantánea",
    share_btn: "📤 Compartir Resultado",
    share_title: "Compartir Resultado",
    save_image: "🖼️ Guardar Imagen (para Instagram·TikTok)",
    copy_link: "🔗 Copiar Enlace + Texto",
    copied: "✅ ¡Copiado!",
    disclaimer_title: "📌 Aviso Importante",
    disclaimer_body: "Este análisis es una estimación basada en tendencias tecnológicas actuales e investigación académica.",
    footer: "LoginFuture Ministry · Futuro de Mi Trabajo v2.0",
    analyzed_count: "análisis realizados",
    risk_safe: "Seguro",
    risk_caution: "Precaución",
    risk_danger: "En Riesgo",
    risk_critical: "Crítico",
    hero_line1: "Tu Trabajo,",
    hero_line2: "¿Sobrevivirá la Era de la IA?",
    hero_tagline: "Análisis 8D · Pronóstico 10 años · Hoja de ruta · Gratis",
    analyzed_before: "",
    analyzed_after: " ya han analizado",
    update_badge: "Actualización mensual de datos",
    update_tag: "Ritmo IA monitoreado",
    popular_jobs_title: "Analizar trabajos populares",
    result_subtitle: "Análisis de Reemplazo IA",
    analyzing_job_label: "Trabajo analizado",
    step1_title: "Ingresar trabajo",
    step1_desc: "Escribe el título del trabajo",
    step2_title: "Análisis 8D",
    step2_desc: "IA analiza en 8 dimensiones",
    step3_title: "Ver resultado",
    step3_desc: "Reporte detallado al instante",
    ai_coach: "🔮 Chat con Coach IA",
    ai_coach_full: "🔮 Hablar con Coach IA →",
    section_overview: "Riesgo general",
    section_dimensions: "Análisis 8D",
    section_horizon: "Pronóstico 10 años",
    section_skills: "Brecha de habilidades",
    section_iceberg: "Modelo Iceberg",
    section_income: "Impacto salarial",
    section_industry: "Contexto sectorial",
    section_transitions: "Rutas de carrera",
    section_consulting: "Nota consultoría",
    section_coach: "🔮 Chat Coach IA",
    error_analyze: "Análisis fallido. Por favor intenta de nuevo.",
    error_network: "Error de red. Por favor verifica tu conexión a internet.",
    error_empty: "Por favor ingresa un puesto de trabajo.",
    error_too_long: "El puesto debe tener menos de 50 caracteres.",
    analyzed_job_done: "Análisis Completo",
  },
};

// 국가별 노동시장 컨텍스트 (Claude 프롬프트에 삽입)
export const COUNTRY_CONTEXTS: Record<LangCode, string> = {
  ko: `이 분석은 한국 노동시장 기준입니다.
- 적용 법규: 근로기준법, 직업안정법, 관련 자격증/면허 제도
- 산업 구조: 대기업 중심 제조업, 급속한 AI 도입 중인 금융/서비스업
- AI 도입 속도: 아시아 상위권 (정부 주도 디지털 뉴딜)
- 직업명과 전환 경로 예시는 한국 기준으로 작성하세요.
- 모든 분석 결과를 한국어로 작성하세요.`,

  en: `This analysis is based on the US labor market.
- Applicable law: FLSA, OSHA, state licensing requirements, ADA
- Industry structure: Service-dominant economy, rapid AI adoption in tech/finance/healthcare
- AI adoption speed: World-leading (Silicon Valley ecosystem, major AI investments)
- Data sources: O*NET, BLS Occupational Outlook Handbook, McKinsey US reports
- Job titles and transition examples must use US market terminology.
- Write ALL free-text fields (descriptions, titles, summaries, narratives) in English.
- CRITICAL: Keep these JSON enum fields in Korean exactly as specified: riskLevel (안전/주의/위험/매우위험), urgency (즉시/1년 내/3년 내), transitions[].type (이직/전직/창직), transitions[].difficulty (낮음/보통/높음).`,

  zh: `本分析基于中国劳动力市场。
- 适用法规：劳动合同法、职业资格认证制度、行业许可证制度
- 产业结构：制造业大国向服务业转型，政府主导AI产业政策（新一代AI发展规划）
- AI采用速度：全球领先（政府大力投资、BAT等科技巨头推动）
- 职业名称和转型路径示例须使用中国市场通用术语
- 请用中文撰写所有自由文本字段（描述、标题、摘要、叙述等）。
- 重要：以下JSON枚举字段必须严格保持韩语不变：riskLevel（안전/주의/위험/매우위험）、urgency（즉시/1년 내/3년 내）、transitions[].type（이직/전직/창직）、transitions[].difficulty（낮음/보통/높음）。`,

  ja: `この分析は日本の労働市場を基準としています。
- 適用法規：労働基準法、職業安定法、各種国家資格・免許制度
- 産業構造：製造業と自動車産業、高齢化に伴うサービス業のAI化加速
- AI導入速度：先進国中やや遅め（規制・文化的要因）だが政府のDX推進で加速中
- 職種名と転職事例は日本の雇用慣行（終身雇用・年功序列の変化）を考慮すること
- すべての自由テキストフィールド（説明、タイトル、要約、ナラティブ）を日本語で記述してください。
- 重要：以下のJSONの列挙フィールドは必ず韓国語のまま維持してください：riskLevel（안전/주의/위험/매우위험）、urgency（즉시/1년 내/3년 내）、transitions[].type（이직/전직/창직）、transitions[].difficulty（낮음/보통/높음）。`,

  es: `Este análisis está basado en el mercado laboral de España y Latinoamérica.
- Marco legal: Estatuto de los Trabajadores (España), legislación laboral de cada país
- Estructura industrial: Economías mixtas con sectores de servicios en crecimiento
- Velocidad de adopción de IA: Variable según país (España moderada, Brasil y México acelerando)
- Los títulos de trabajo y ejemplos de transición deben usar terminología del mercado hispanohablante
- Redacta en español todos los campos de texto libre (descripciones, títulos, resúmenes, narrativas).
- IMPORTANTE: Mantén estos campos enum del JSON exactamente en coreano: riskLevel (안전/주의/위험/매우위험), urgency (즉시/1년 내/3년 내), transitions[].type (이직/전직/창직), transitions[].difficulty (낮음/보통/높음).`,
};

export function getLang(code: LangCode) {
  return UI_STRINGS[code];
}
