import { useEffect, useMemo, useState } from "react";
import "./App.css";

const WEEK_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const DEFAULT_WEEKLY_PLAN = {
  월: "버피테스트 + 플랭크 4분 / 패배 시 점수차만큼 버피 20개 세트 추가",
  화: "러닝 / 패배 시 점수차만큼 km 추가",
  수: "버피테스트 + 플랭크 4분 / 패배 시 점수차만큼 버피 20개 세트 추가",
  목: "러닝 / 패배 시 점수차만큼 km 추가",
  금: "버피테스트 + 플랭크 4분 / 패배 시 점수차만큼 버피 20개 세트 추가",
  토: "러닝 / 패배 시 점수차만큼 km 추가",
  일: "농구",
};

const DEFAULT_WEIGHT_LOG = Array.from({ length: 8 }, (_, i) => ({
  week: `${i + 1}주차`,
  weight: "",
}));

const DEFAULT_TODAY_RECORD = {
  date: new Date().toISOString().slice(0, 10),
  weight: "",
  sleep: "",
  breakfast: "",
  lunch: "",
  dinner: "",
  snacks: "",
  exercise: "",
  memo: "",
  baseballResult: "none",
  scoreDiff: "",
  checks: {
    breakfast: false,
    lunch: false,
    dinner: false,
    water: false,
    exercise: false,
    sleep: false,
  },
};

function getStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error(`${key} 로드 실패`, error);
    return fallback;
  }
}

function getDayKeyFromDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = date.getDay();
  const map = {
    0: "일",
    1: "월",
    2: "화",
    3: "수",
    4: "목",
    5: "금",
    6: "토",
  };
  return map[day] || "";
}

function App() {
  const [startWeight] = useState(82);
  const [goalWeight] = useState(75);

  const [weeklyPlan, setWeeklyPlan] = useState(() =>
    getStorage("daily-routine-weekly-plan", DEFAULT_WEEKLY_PLAN)
  );

  const [weightLog, setWeightLog] = useState(() =>
    getStorage("daily-routine-weight-log", DEFAULT_WEIGHT_LOG)
  );

  const [todayRecord, setTodayRecord] = useState(() =>
    getStorage("daily-routine-today-record", DEFAULT_TODAY_RECORD)
  );

  const [savedRecords, setSavedRecords] = useState(() =>
    getStorage("daily-routine-saved-records", [])
  );

  const [editingId, setEditingId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "daily-routine-weekly-plan",
      JSON.stringify(weeklyPlan)
    );
  }, [weeklyPlan]);

  useEffect(() => {
    localStorage.setItem("daily-routine-weight-log", JSON.stringify(weightLog));
  }, [weightLog]);

  useEffect(() => {
    localStorage.setItem(
      "daily-routine-today-record",
      JSON.stringify(todayRecord)
    );
  }, [todayRecord]);

  useEffect(() => {
    localStorage.setItem(
      "daily-routine-saved-records",
      JSON.stringify(savedRecords)
    );
  }, [savedRecords]);

  const checklistScore = useMemo(() => {
    return Object.values(todayRecord.checks).filter(Boolean).length;
  }, [todayRecord.checks]);

  const currentWeight = todayRecord.weight || "";
  const latestWeight =
    currentWeight ||
    [...weightLog].reverse().find((item) => item.weight)?.weight ||
    "";

  const remainingWeight = latestWeight
    ? Math.max(Number(latestWeight) - goalWeight, 0).toFixed(1)
    : "-";

  const progressPercent = latestWeight
    ? Math.min(
        Math.max(
          ((startWeight - Number(latestWeight)) / (startWeight - goalWeight)) *
            100,
          0
        ),
        100
      ).toFixed(0)
    : 0;

  const todayStatusText = useMemo(() => {
    if (checklistScore >= 5) return "아주 좋아요";
    if (checklistScore >= 3) return "무난해요";
    return "조금 더 관리가 필요해요";
  }, [checklistScore]);

  const autoExerciseText = useMemo(() => {
    const dayKey = getDayKeyFromDate(todayRecord.date);
    const result = todayRecord.baseballResult;
    const diff = Number(todayRecord.scoreDiff || 0);

    if (!dayKey) return "날짜를 먼저 선택해줘.";

    if (dayKey === "일") {
      return "농구";
    }

    if (result === "none") {
      if (dayKey === "월" || dayKey === "수" || dayKey === "금") {
        return "버피테스트 + 플랭크 4분";
      }
      if (dayKey === "화" || dayKey === "목" || dayKey === "토") {
        return "러닝";
      }
    }

    if (dayKey === "월" || dayKey === "수" || dayKey === "금") {
      if (result === "win") {
        return "간단 스트레칭 + 플랭크 4분";
      }
      if (result === "lose") {
        return diff > 0
          ? `버피 20개 × ${diff}세트 + 플랭크 4분`
          : "점수차를 입력해줘.";
      }
    }

    if (dayKey === "화" || dayKey === "목" || dayKey === "토") {
      if (result === "win") {
        return "러닝";
      }
      if (result === "lose") {
        return diff > 0 ? `러닝 ${diff}km` : "점수차를 입력해줘.";
      }
    }

    return "기본 루틴 없음";
  }, [todayRecord.date, todayRecord.baseballResult, todayRecord.scoreDiff]);

  const handleTodayChange = (field, value) => {
    setTodayRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCheckChange = (field) => {
    setTodayRecord((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [field]: !prev.checks[field],
      },
    }));
  };

  const handleWeeklyPlanChange = (day, value) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const handleWeightLogChange = (index, value) => {
    setWeightLog((prev) =>
      prev.map((item, i) => (i === index ? { ...item, weight: value } : item))
    );
  };

  const resetTodayRecord = () => {
    setTodayRecord({
      ...DEFAULT_TODAY_RECORD,
      date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
  };

  const applyAutoExercise = () => {
    setTodayRecord((prev) => ({
      ...prev,
      exercise: autoExerciseText,
    }));
  };

  const handleSaveRecord = () => {
    if (!todayRecord.date) {
      alert("날짜를 입력해줘.");
      return;
    }

    const payload = {
      ...todayRecord,
      id: editingId || Date.now(),
      savedAt: new Date().toLocaleString("ko-KR"),
      score: checklistScore,
    };

    if (editingId) {
      setSavedRecords((prev) =>
        prev.map((item) => (item.id === editingId ? payload : item))
      );
      alert("기록이 수정됐어.");
    } else {
      setSavedRecords((prev) => [payload, ...prev]);
      alert("기록이 저장됐어.");
    }

    resetTodayRecord();
  };

  const handleEditRecord = (record) => {
    setTodayRecord({
      date: record.date || "",
      weight: record.weight || "",
      sleep: record.sleep || "",
      breakfast: record.breakfast || "",
      lunch: record.lunch || "",
      dinner: record.dinner || "",
      snacks: record.snacks || "",
      exercise: record.exercise || "",
      memo: record.memo || "",
      baseballResult: record.baseballResult || "none",
      scoreDiff: record.scoreDiff || "",
      checks: {
        breakfast: record.checks?.breakfast || false,
        lunch: record.checks?.lunch || false,
        dinner: record.checks?.dinner || false,
        water: record.checks?.water || false,
        exercise: record.checks?.exercise || false,
        sleep: record.checks?.sleep || false,
      },
    });
    setEditingId(record.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteRecord = (id) => {
    const ok = window.confirm("이 기록을 삭제할까?");
    if (!ok) return;
    setSavedRecords((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      resetTodayRecord();
    }
  };

  const feedbackText = useMemo(() => {
    const baseballResultText =
      todayRecord.baseballResult === "win"
        ? "승"
        : todayRecord.baseballResult === "lose"
        ? "패"
        : "경기 없음";

    return `아래 기록 보고 식단/운동/수면 기준으로 피드백해줘.

날짜: ${todayRecord.date || "-"}
오늘 아침 체중: ${todayRecord.weight || "미입력"}kg
수면 시간: ${todayRecord.sleep || "미입력"}시간
야구 결과: ${baseballResultText}
점수차: ${todayRecord.scoreDiff || "미입력"}
자동 계산 운동: ${autoExerciseText}

아침: ${todayRecord.breakfast || "미입력"}
점심: ${todayRecord.lunch || "미입력"}
저녁: ${todayRecord.dinner || "미입력"}
간식: ${todayRecord.snacks || "미입력"}
운동: ${todayRecord.exercise || "미입력"}

체크리스트 달성:
- 아침 챙김: ${todayRecord.checks.breakfast ? "O" : "X"}
- 점심 균형식: ${todayRecord.checks.lunch ? "O" : "X"}
- 저녁 과식 안함: ${todayRecord.checks.dinner ? "O" : "X"}
- 물 충분히 마심: ${todayRecord.checks.water ? "O" : "X"}
- 운동함: ${todayRecord.checks.exercise ? "O" : "X"}
- 수면 7시간 이상: ${todayRecord.checks.sleep ? "O" : "X"}

총 점수: ${checklistScore}/6
메모: ${todayRecord.memo || "없음"}

목표는 82kg에서 75kg까지 감량하는 거야.
너무 딱딱하지 않게, 현실적으로 피드백해줘.`;
  }, [todayRecord, checklistScore, autoExerciseText]);

  const handleCopyFeedback = async () => {
    try {
      await navigator.clipboard.writeText(feedbackText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      alert("복사에 실패했어.");
    }
  };

  const openChatGPT = () => {
    window.open("https://chatgpt.com/", "_blank");
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="brand">
            <h1 className="title">데일리 루틴</h1>
            <p className="subtitle">
              식단 · 운동 · 수면을 한 번에 관리하는 건강 루틴 웹앱
            </p>
          </div>

          <div className="summary-card">
            <div className="summary-top">
              <div>
                <div className="summary-label">시작정보</div>
                <div className="summary-value">
                  {startWeight}kg → {goalWeight}kg
                </div>
              </div>
              <div>
                <div className="summary-label">오늘상태</div>
                <div className="summary-value">{todayStatusText}</div>
              </div>
            </div>

            <div className="progress-wrap">
              <div className="progress-meta">
                <span>진행률</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="summary-grid">
              <div className="mini-stat">
                <span className="mini-stat-label">현재 체중</span>
                <strong>{latestWeight ? `${latestWeight}kg` : "-"}</strong>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">남은 감량</span>
                <strong>
                  {remainingWeight !== "-" ? `${remainingWeight}kg` : "-"}
                </strong>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-label">체크 점수</span>
                <strong>{checklistScore}/6</strong>
              </div>
            </div>
          </div>
        </header>

        <main className="main-grid">
          <section className="column">
            <Card title="주간 운동 계획">
              <div className="stack">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="row-block">
                    <label className="day-label">{day}</label>
                    <input
                      className="input"
                      type="text"
                      value={weeklyPlan[day]}
                      onChange={(e) =>
                        handleWeeklyPlanChange(day, e.target.value)
                      }
                      placeholder={`${day} 운동 계획 입력`}
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card title="주간 체중 기록">
              <div className="weight-grid">
                {weightLog.map((item, index) => (
                  <div key={item.week} className="weight-item">
                    <label className="field-label">{item.week}</label>
                    <input
                      className="input"
                      type="number"
                      step="0.1"
                      value={item.weight}
                      onChange={(e) =>
                        handleWeightLogChange(index, e.target.value)
                      }
                      placeholder="kg"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="column">
            <Card title={editingId ? "오늘의 기록 수정" : "오늘의 기록"}>
              <div className="form-grid">
                <InputField
                  label="날짜"
                  type="date"
                  value={todayRecord.date}
                  onChange={(e) => handleTodayChange("date", e.target.value)}
                />
                <InputField
                  label="오늘 아침 체중 (kg)"
                  type="number"
                  step="0.1"
                  value={todayRecord.weight}
                  onChange={(e) => handleTodayChange("weight", e.target.value)}
                  placeholder="예: 81.2"
                />
                <InputField
                  label="수면 시간"
                  type="number"
                  step="0.1"
                  value={todayRecord.sleep}
                  onChange={(e) => handleTodayChange("sleep", e.target.value)}
                  placeholder="예: 7.5"
                />

                <div>
                  <label className="field-label">야구 결과</label>
                  <select
                    className="input"
                    value={todayRecord.baseballResult}
                    onChange={(e) =>
                      handleTodayChange("baseballResult", e.target.value)
                    }
                  >
                    <option value="none">경기 없음</option>
                    <option value="win">승</option>
                    <option value="lose">패</option>
                  </select>
                </div>

                <InputField
                  label="점수차"
                  type="number"
                  value={todayRecord.scoreDiff}
                  onChange={(e) =>
                    handleTodayChange("scoreDiff", e.target.value)
                  }
                  placeholder="예: 3"
                />

                <TextField
                  label="아침"
                  value={todayRecord.breakfast}
                  onChange={(e) =>
                    handleTodayChange("breakfast", e.target.value)
                  }
                  placeholder="예: 계란 2개, 바나나 1개"
                />
                <TextField
                  label="점심"
                  value={todayRecord.lunch}
                  onChange={(e) => handleTodayChange("lunch", e.target.value)}
                  placeholder="예: 돼지불백 + 밥 반공기"
                />
                <TextField
                  label="저녁"
                  value={todayRecord.dinner}
                  onChange={(e) => handleTodayChange("dinner", e.target.value)}
                  placeholder="예: 샐러드 + 닭가슴살"
                />
                <TextField
                  label="간식"
                  value={todayRecord.snacks}
                  onChange={(e) => handleTodayChange("snacks", e.target.value)}
                  placeholder="예: 단백질바"
                />
                <TextField
                  label="운동"
                  value={todayRecord.exercise}
                  onChange={(e) =>
                    handleTodayChange("exercise", e.target.value)
                  }
                  placeholder="예: 걷기 40분 + 스쿼트 3세트"
                />
              </div>

              <div className="section-space">
                <label className="field-label">자동 계산된 오늘 운동</label>
                <div className="auto-exercise-box">
                  <div className="auto-exercise-text">{autoExerciseText}</div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={applyAutoExercise}
                  >
                    운동 칸에 반영
                  </button>
                </div>
              </div>

              <div className="section-space">
                <label className="field-label">체크리스트</label>
                <div className="check-grid">
                  <CheckItem
                    label="아침 챙김"
                    checked={todayRecord.checks.breakfast}
                    onChange={() => handleCheckChange("breakfast")}
                  />
                  <CheckItem
                    label="점심 균형식"
                    checked={todayRecord.checks.lunch}
                    onChange={() => handleCheckChange("lunch")}
                  />
                  <CheckItem
                    label="저녁 과식 안함"
                    checked={todayRecord.checks.dinner}
                    onChange={() => handleCheckChange("dinner")}
                  />
                  <CheckItem
                    label="물 충분히 마심"
                    checked={todayRecord.checks.water}
                    onChange={() => handleCheckChange("water")}
                  />
                  <CheckItem
                    label="운동함"
                    checked={todayRecord.checks.exercise}
                    onChange={() => handleCheckChange("exercise")}
                  />
                  <CheckItem
                    label="수면 7시간 이상"
                    checked={todayRecord.checks.sleep}
                    onChange={() => handleCheckChange("sleep")}
                  />
                </div>
              </div>

              <div className="section-space">
                <label className="field-label">메모</label>
                <textarea
                  className="textarea"
                  value={todayRecord.memo}
                  onChange={(e) => handleTodayChange("memo", e.target.value)}
                  placeholder="오늘 느낀 점이나 특이사항을 적어줘"
                  rows={4}
                />
              </div>

              <div className="score-box">
                <span>오늘 점수</span>
                <strong>{checklistScore} / 6</strong>
              </div>

              <div className="button-row">
                <button className="primary-button" onClick={handleSaveRecord}>
                  {editingId ? "수정 완료" : "기록 저장"}
                </button>
                <button className="secondary-button" onClick={resetTodayRecord}>
                  초기화
                </button>
              </div>

              <div className="feedback-box">
                <div className="feedback-header">
                  <h3 className="feedback-title">ChatGPT 피드백용 문구</h3>
                  <div className="button-row small">
                    <button
                      className="secondary-button"
                      onClick={handleCopyFeedback}
                    >
                      {copied ? "복사됨" : "복사"}
                    </button>
                    <button className="primary-button" onClick={openChatGPT}>
                      ChatGPT 열기
                    </button>
                  </div>
                </div>

                <textarea
                  className="feedback-textarea"
                  value={feedbackText}
                  readOnly
                  rows={12}
                />
              </div>
            </Card>

            <Card title="최근 저장 기록">
              {savedRecords.length === 0 ? (
                <div className="empty-state">아직 저장된 기록이 없어.</div>
              ) : (
                <div className="record-list">
                  {savedRecords.map((record) => (
                    <div key={record.id} className="record-card">
                      <div className="record-header">
                        <div>
                          <div className="record-date">{record.date}</div>
                          <div className="record-meta">
                            저장: {record.savedAt} · 점수 {record.score}/6
                          </div>
                        </div>
                        <div className="button-row small">
                          <button
                            className="secondary-button"
                            onClick={() => handleEditRecord(record)}
                          >
                            수정
                          </button>
                          <button
                            className="danger-button"
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      <div className="record-body">
                        <p>
                          <strong>체중:</strong> {record.weight || "-"}kg
                        </p>
                        <p>
                          <strong>수면:</strong> {record.sleep || "-"}시간
                        </p>
                        <p>
                          <strong>야구 결과:</strong>{" "}
                          {record.baseballResult === "win"
                            ? "승"
                            : record.baseballResult === "lose"
                            ? "패"
                            : "경기 없음"}
                        </p>
                        <p>
                          <strong>점수차:</strong> {record.scoreDiff || "-"}
                        </p>
                        <p>
                          <strong>아침:</strong> {record.breakfast || "-"}
                        </p>
                        <p>
                          <strong>점심:</strong> {record.lunch || "-"}
                        </p>
                        <p>
                          <strong>저녁:</strong> {record.dinner || "-"}
                        </p>
                        <p>
                          <strong>간식:</strong> {record.snacks || "-"}
                        </p>
                        <p>
                          <strong>운동:</strong> {record.exercise || "-"}
                        </p>
                        {record.memo ? (
                          <p>
                            <strong>메모:</strong> {record.memo}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  step,
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        step={step}
      />
    </div>
  );
}

function TextField({ label, value, onChange, placeholder = "" }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="input"
        value={value}
        onChange={onChange}
        type="text"
        placeholder={placeholder}
      />
    </div>
  );
}

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="check-item">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

export default App;