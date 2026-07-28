import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'

function App() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  // 수면시간 기록장 상태 관리
  const [records, setRecords] = useState([])
  const [recordInput, setRecordInput] = useState('')
  const [recordLoading, setRecordLoading] = useState(false)

  // ② Firestore에서 수면 기록 실시간 불러오기 (⑤ 최신순)
  useEffect(() => {
    const q = query(collection(db, 'sleep_records'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setRecords(list)
    }, (error) => {
      console.error('Firestore 불러오기 오류:', error)
    })

    return () => unsubscribe()
  }, [])

  // 수면 상태 측정 (Gemini API)
  const handleSubmit = async () => {
    if (!prompt.trim()) {
      alert('수면 고민을 입력해주세요.')
      return
    }

    setLoading(true)
    setResult('REM 수면 상태를 분석하고 있습니다...')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
      } else {
        setResult('오류 발생: ' + (data.error || '분석에 실패했습니다.'))
      }
    } catch (error) {
      setResult('통신 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // ① 입력창에 글을 쓰고 등록 버튼을 누르면 Firestore에 저장
  const handleRecordSubmit = async () => {
    if (!recordInput.trim()) {
      alert('수면 기록을 입력해주세요.')
      return
    }

    setRecordLoading(true)

    try {
      await addDoc(collection(db, 'sleep_records'), {
        content: recordInput.trim(),
        createdAt: serverTimestamp()
      })
      setRecordInput('')
    } catch (error) {
      console.error('Firestore 저장 오류:', error)
      alert('기록 등록에 실패했습니다.')
    } finally {
      setRecordLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>REM 수면 분석 및 측정</h1>
      
      {/* AI 측정 영역 */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="현재 겪고 계신 수면 고민을 자유롭게 적어주세요..."
      />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? '측정 중...' : '수면 상태 측정하기'}
      </button>
      {result && <div className="result-box">{result}</div>}

      {/* 수면시간 기록장 영역 (디자인 유지) */}
      <div className="board-section">
        <h2>수면시간 기록장</h2>
        
        <div className="board-input-group">
          <textarea
            value={recordInput}
            onChange={(e) => setRecordInput(e.target.value)}
            placeholder="오늘의 수면시간 및 기록을 적어주세요 (예: 7시간 수면, 자주 깸)..."
            className="board-textarea"
          />
          <button 
            onClick={handleRecordSubmit} 
            disabled={recordLoading}
            className="board-btn"
          >
            {recordLoading ? '등록 중...' : '기록 등록'}
          </button>
        </div>

        <div className="board-list">
          {records.length === 0 ? (
            <p className="empty-msg">등록된 수면 기록이 없습니다.</p>
          ) : (
            records.map((item) => (
              <div key={item.id} className="board-item">
                <p className="post-content">{item.content}</p>
                <span className="post-date">
                  {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleString('ko-KR') : '방금 전'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default App
