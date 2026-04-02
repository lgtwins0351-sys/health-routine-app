import { useEffect, useMemo, useState } from "react";
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
              <button onClick={saveDaily}>{daily.id ? "기록 수정 저장" : "오늘 기록 저장"}</button>
              <button className="secondary" onClick={resetDaily}>새 기록 쓰기</button>
              <button className="feedbackBtn" onClick={copyFeedbackText}>피드백 문구 복사</button>
              <button className="chatBtn" onClick={openChatGPTForFeedback}>ChatGPT 열기</button>
            </div>

            {feedbackText && (
              <div className="feedbackBox">
                <p><b>아래 문구를 복사해서 ChatGPT에 붙여넣으면 바로 피드백을 받을 수 있어요.</b></p>
                <textarea value={feedbackText} readOnly rows={10} />
              </div>
            )}
          </Card>

          <Card title="최근 저장 기록">
            {history.length === 0 ? (
              <p className="small">아직 저장된 기록이 없어요. 오늘 기록을 저장해보세요.</p>
            ) : (
              <div className="history">
                {history.map((item) => (
                  <div className="historyItem" key={item.id}>
                    <div className="historyHead">
                      <b>{item.date}</b>
                      <span>체크 {Object.values(item.checks).filter(Boolean).length}/6</span>
                    </div>
                    <p><b>아침</b>: {item.breakfast || "-"}</p>
                    <p><b>점심</b>: {item.lunch || "-"}</p>
                    <p><b>저녁</b>: {item.dinner || "-"}</p>
                    <p><b>운동</b>: {item.workout || "-"}</p>
                    <p><b>활동</b>: {item.activity || "-"}</p>
                    <p><b>수면</b>: {item.sleep || "-"}</p>
                    <p><b>메모</b>: {item.memo || "-"}</p>

                    <div className="historyActions">
                      <button className="editBtn" onClick={() => editHistoryItem(item)}>수정</button>
                      <button className="deleteBtn" onClick={() => deleteHistoryItem(item.id)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}