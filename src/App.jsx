import { useMemo, useState } from "react";
import "./App.css";

const weeklyPlan = [
  { day: "월", workout: "버피 + 플랭크" },
  { day: "화", workout: "러닝 5km" },
  { day: "수", workout: "버피 + 플랭크" },
  { day: "목", workout: "러닝 5km" },
  { day: "금", workout: "버피 + 플랭크" },
  { day: "토", workout: "러닝 5km" },
  { day: "일", workout: "가벼운 농구" },
];

const initialDaily = {
  date: new Date().toISOString().slice(0, 10),
  weight: "",
  sleep: "",
  breakfast: "",
  lunch: "",
  dinner: "",
  water: "",
  workout: "",
  activity: "",
  condition: "",
  memo: "",
  checks: {
    breakfast: false,
    lunch: false,
    dinner: false,
    exercise: false,
    water: false,
    sleep: false,
  },
};

const initialWeeklyWeights = [
  { week: "1주차", weight: "82.0", note: "시작" },
  { week: "2주차", weight: "", note: "" },
  { week: "3주차", weight: "", note: "" },
  { week: "4주차", weight: "", note: "" },
  { week: "5주차", weight: "", note: "" },
  { week: "6주차", weight: "", note: "" },
  { week: "7주차", weight: "", note: "" },
  { week: "8주차", weight: "", note: "" },
];

function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

export default function App() {
  const [daily, setDaily] = useState(initialDaily);
  const [weeklyWeights, setWeeklyWeights] = useState(initialWeeklyWeights);
  const [history, setHistory] = useState([]);
  const [feedbackText, setFeedbackText] = useState("");

  const dailyScore = useMemo(() => {
    return Object.values(daily.checks).filter(Boolean).length;
  }, [daily.checks]);

  const progressToGoal = useMemo(() => {
    const start = 82;
    const goal = 75;
    const filled = [...weeklyWeights].reverse().find((w) => w.weight !== "");
    const current = Number(filled?.weight || start);
    const total = start - goal;
    const done = Math.max(0, start - current);
    return Math.min(100, Math.round((done / total) * 100));
  }, [weeklyWeights]);

  const handleCheck = (key) => {
    setDaily((prev) => ({
      ...prev,
      checks: {
        ...prev.checks,
        [key]: !prev.checks[key],
      },
    }));
  };

  const saveDaily = () => {
    setHistory((prev) => [daily, ...prev]);
    setDaily({
      ...initialDaily,
      date: new Date().toISOString().slice(0, 10),
    });
  };

  const resetDaily = () => {
    setDaily({
      ...initialDaily,
      date: new Date().toISOString().slice(0, 10),
    });
    setFeedbackText("");
  };

  const createFeedbackText = () => {
    const text = `아래 기록 보고 식단/운동/수면 기준으로 피드백해줘.

날짜: ${daily.date}
오늘 아침 체중: ${daily.weight || "미입력"}
수면 시간: ${daily.sleep || "미입력"}
아침: ${daily.breakfast || "미입력"}
점심: ${daily.lunch || "미입력"}
저녁: ${daily.dinner || "미입력"}
물 섭취: ${daily.water || "미입력"}
운동: ${daily.workout || "미입력"}
추가 활동: ${daily.activity || "미입력"}
컨디션: ${daily.condition || "미입력"}
메모: ${daily.memo || "미입력"}
체크 점수: ${Object.values(daily.checks).filter(Boolean).length}/6

체크 항목
- 아침 먹음: ${daily.checks.breakfast ? "예" : "아니오"}
- 점심 과식 안 함: ${daily.checks.lunch ? "예" : "아니오"}
- 저녁 가볍게 먹음: ${daily.checks.dinner ? "예" : "아니오"}
- 운동 또는 활동 완료: ${daily.checks.exercise ? "예" : "아니오"}
- 물 충분히 마심: ${daily.checks.water ? "예" : "아니오"}
- 7시간 이상 잠: ${daily.checks.sleep ? "예" : "아니오"}

좋았던 점 3개, 보완점 3개, 내일 할 일 3개로 짧고 현실적으로 정리해줘.`;

    setFeedbackText(text);
    return text;
  };

  const copyFeedbackText = async () => {
    const text = createFeedbackText();
    try {
      await navigator.clipboard.writeText(text);
      alert("피드백 문구를 복사했어요. ChatGPT에 붙여넣으면 돼요.");
    } catch (error) {
      alert("복사에 실패했어요. 아래 생성된 문구를 직접 복사해 주세요.");
    }
  };

  const openChatGPTForFeedback = async () => {
    const text = createFeedbackText();
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      // 복사 실패해도 창은 열기
    }
    window.open("https://chatgpt.com", "_blank");
  };

  const successLabel = dailyScore >= 4 ? "성공" : "관리중";

  return (
    <div className="app">
      <h1>건강 루틴 관리 앱</h1>
      <p className="subtitle">완벽보다 지속. 기록으로 관리하기.</p>

      <div className="grid three">
        <Card title="시작 정보">
          <p>
            키: <b>163cm</b>
          </p>
          <p>
            시작 체중: <b>82kg</b>
          </p>
          <p>
            1차 목표: <b>75kg</b>
          </p>
          <p>
            체중 측정: <b>매주 월요일 아침 공복</b>
          </p>
        </Card>

        <Card title="목표 진행률">
          <p>{progressToGoal}%</p>
          <div className="progressWrap">
            <div
              className="progressBar"
              style={{ width: `${progressToGoal}%` }}
            />
          </div>
          <p className="small">75kg 목표까지 진행률</p>
        </Card>

        <Card title="오늘 상태">
          <p>
            체크 점수: <b>{dailyScore}/6</b>
          </p>
          <p>
            판정: <b>{successLabel}</b>
          </p>
          <p className="small">하루 4개 이상 체크면 성공</p>
        </Card>
      </div>

      <div className="grid two">
        <Card title="주간 운동 계획">
          <div className="list">
            {weeklyPlan.map((item) => (
              <div className="listRow" key={item.day}>
                <span>
                  <b>{item.day}</b>
                </span>
                <span>{item.workout}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="오늘 기록">
          <div className="formGrid">
            <input
              type="date"
              value={daily.date}
              onChange={(e) => setDaily({ ...daily, date: e.target.value })}
            />
            <input
              placeholder="오늘 아침 체중"
              value={daily.weight}
              onChange={(e) => setDaily({ ...daily, weight: e.target.value })}
            />
            <input
              placeholder="수면 시간 (예: 7.5시간)"
              value={daily.sleep}
              onChange={(e) => setDaily({ ...daily, sleep: e.target.value })}
            />
            <input
              placeholder="물 섭취량"
              value={daily.water}
              onChange={(e) => setDaily({ ...daily, water: e.target.value })}
            />
            <input
              placeholder="아침 식사"
              value={daily.breakfast}
              onChange={(e) =>
                setDaily({ ...daily, breakfast: e.target.value })
              }
            />
            <input
              placeholder="점심 식사"
              value={daily.lunch}
              onChange={(e) => setDaily({ ...daily, lunch: e.target.value })}
            />
            <input
              placeholder="저녁 식사"
              value={daily.dinner}
              onChange={(e) => setDaily({ ...daily, dinner: e.target.value })}
            />
            <input
              placeholder="운동 기록"
              value={daily.workout}
              onChange={(e) => setDaily({ ...daily, workout: e.target.value })}
            />
            <input
              placeholder="활동량 / 산책 / 농구"
              value={daily.activity}
              onChange={(e) => setDaily({ ...daily, activity: e.target.value })}
            />
            <input
              placeholder="컨디션"
              value={daily.condition}
              onChange={(e) =>
                setDaily({ ...daily, condition: e.target.value })
              }
            />
          </div>

          <textarea
            placeholder="한 줄 메모"
            value={daily.memo}
            onChange={(e) => setDaily({ ...daily, memo: e.target.value })}
            rows={4}
          />

          <div className="checks">
            {[
              ["breakfast", "아침 먹음"],
              ["lunch", "점심 과식 안 함"],
              ["dinner", "저녁 가볍게 먹음"],
              ["exercise", "운동 또는 활동 완료"],
              ["water", "물 충분히 마심"],
              ["sleep", "7시간 이상 잠"],
            ].map(([key, label]) => (
              <label className="checkItem" key={key}>
                <input
                  type="checkbox"
                  checked={daily.checks[key]}
                  onChange={() => handleCheck(key)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="buttonRow">
            <button onClick={saveDaily}>오늘 기록 저장</button>
            <button className="secondary" onClick={resetDaily}>
              초기화
            </button>
            <button className="feedbackBtn" onClick={copyFeedbackText}>
              피드백 문구 복사
            </button>
            <button className="chatBtn" onClick={openChatGPTForFeedback}>
              ChatGPT 열기
            </button>
          </div>

          {feedbackText && (
            <div className="feedbackBox">
              <p>
                <b>
                  아래 문구를 복사해서 ChatGPT에 붙여넣으면 바로 피드백을 받을 수
                  있어요.
                </b>
              </p>
              <textarea value={feedbackText} readOnly rows={10} />
            </div>
          )}
        </Card>
      </div>

      <div className="grid two">
        <Card title="주간 체중 기록">
          <div className="list">
            {weeklyWeights.map((row, idx) => (
              <div className="weightRow" key={row.week}>
                <div>
                  <b>{row.week}</b>
                </div>
                <input
                  placeholder="체중"
                  value={row.weight}
                  onChange={(e) => {
                    const next = [...weeklyWeights];
                    next[idx].weight = e.target.value;
                    setWeeklyWeights(next);
                  }}
                />
                <input
                  placeholder="메모"
                  value={row.note}
                  onChange={(e) => {
                    const next = [...weeklyWeights];
                    next[idx].note = e.target.value;
                    setWeeklyWeights(next);
                  }}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="최근 저장 기록">
          {history.length === 0 ? (
            <p className="small">
              아직 저장된 기록이 없어요. 오늘 기록을 저장해보세요.
            </p>
          ) : (
            <div className="history">
              {history.map((item, index) => (
                <div className="historyItem" key={`${item.date}-${index}`}>
                  <div className="historyHead">
                    <b>{item.date}</b>
                    <span>
                      체크{" "}
                      {Object.values(item.checks).filter(Boolean).length}/6
                    </span>
                  </div>
                  <p>
                    <b>아침</b>: {item.breakfast || "-"}
                  </p>
                  <p>
                    <b>점심</b>: {item.lunch || "-"}
                  </p>
                  <p>
                    <b>저녁</b>: {item.dinner || "-"}
                  </p>
                  <p>
                    <b>운동</b>: {item.workout || "-"}
                  </p>
                  <p>
                    <b>활동</b>: {item.activity || "-"}
                  </p>
                  <p>
                    <b>수면</b>: {item.sleep || "-"}
                  </p>
                  <p>
                    <b>메모</b>: {item.memo || "-"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}