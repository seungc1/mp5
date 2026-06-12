import { useState, useRef, useEffect } from "react";

// 백엔드 포트 (vite proxy 사용 시 그대로, 직접 연결 시 http://localhost:8082 로 변경)
const API_BASE = "";

function VideoCard({ book, rank }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState(book.videoUrl || null);
  const [error, setError] = useState("");

  // vite proxy가 /videos/** → http://localhost:8082/videos/** 로 포워딩
  // 따라서 백엔드가 돌려준 "/videos/파일명.mp4" 그대로 사용 가능
  const resolvedVideoUrl = videoUrl || null;

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnded = () => setIsPlaying(false);

  const handleGenerateClick = () => {
    if (!showApiInput) {
      setShowApiInput(true);
      return;
    }
    if (!apiKey.trim()) {
      setError("OpenAI API Key를 입력해주세요.");
      return;
    }
    startGenerate();
  };

  const startGenerate = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/videos/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: book.title, apiKey }),
      });

      // 백엔드가 String(URL 텍스트)을 바로 리턴하는 구조
      const text = await res.text();
      if (!res.ok) throw new Error(text || "영상 제작 실패");

      // "/videos/파일명.mp4" 형태로 옴
      setVideoUrl(text.trim());
      setShowApiInput(false);
      setApiKey("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bs-video-card">
      <div className="bs-rank-badge">{rank}</div>

      <div className="bs-video-wrapper">
        {resolvedVideoUrl ? (
          <>
            <video
              ref={videoRef}
              src={resolvedVideoUrl}
              className="bs-video-player"
              onEnded={handleVideoEnded}
              playsInline
            />
            <button
              className={`bs-play-btn ${isPlaying ? "bs-play-btn--playing" : ""}`}
              onClick={handlePlayPause}
              aria-label={isPlaying ? "일시정지" : "재생"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>
          </>
        ) : (
          <div className="bs-video-placeholder">
            {book.cover || book.coverUrl || book.coverImageUrl ? (
              <img
                src={book.cover || book.coverUrl || book.coverImageUrl}
                alt={book.title}
                className="bs-cover-img"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <div className="bs-cover-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                </svg>
              </div>
            )}

            {isGenerating && (
              <div className="bs-generating-overlay">
                <span className="bs-spinner bs-spinner--lg" />
                <p>AI 영상 제작 중...</p>
                <p className="bs-generating-sub">GPT 대본 → TTS 음성 → FFmpeg 합성</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bs-card-info">
        <h4 className="bs-book-title" title={book.title}>{book.title}</h4>
        <p className="bs-book-author">{book.author}</p>

        {!resolvedVideoUrl && !isGenerating && (
          <>
            {showApiInput && (
              <div className="bs-api-input-row">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startGenerate()}
                  placeholder="OpenAI API Key"
                  className="bs-api-input"
                  autoFocus
                />
              </div>
            )}
            {error && <p className="bs-error-msg">{error}</p>}
            <button
              className="bs-generate-btn"
              onClick={handleGenerateClick}
              disabled={isGenerating}
            >
              {showApiInput ? (
                "▶ 영상 제작 시작"
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  AI 영상 만들기
                </>
              )}
            </button>
          </>
        )}

        {isGenerating && <p className="bs-generating-msg">제작 중... 잠시만 기다려주세요</p>}
        {error && resolvedVideoUrl && <p className="bs-error-msg">{error}</p>}

        {resolvedVideoUrl && !isPlaying && (
          <p className="bs-video-ready-msg">▶ 재생 버튼을 눌러 감상하세요</p>
        )}
      </div>
    </div>
  );
}

function BestsellerSection() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // GET /books 에서 전체 책 목록을 가져온 뒤
        // videoUrl이 있는 책을 우선으로, 없으면 앞 5권을 베스트셀러로 표시
        const res = await fetch(`${API_BASE}/books`);
        if (!res.ok) throw new Error("책 목록 로드 실패");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.books || [];

        const normalized = list.map((b) => ({
          ...b,
          cover: b.cover || b.coverUrl || b.coverImageUrl,
        }));

        // videoUrl 있는 책 먼저, 그 다음 나머지 — 총 5권
        const withVideo = normalized.filter((b) => b.videoUrl);
        const withoutVideo = normalized.filter((b) => !b.videoUrl);
        const bestsellers = [...withVideo, ...withoutVideo].slice(0, 5);

        setBooks(bestsellers);
      } catch (e) {
        console.error("베스트셀러 로드 실패:", e);
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section className="bestseller-section box">
      <div className="bestseller-header">
        <div className="bestseller-title-row">
          <span className="bestseller-badge">🏆 BEST SELLER</span>
          <h3 className="bestseller-heading">이 주의 베스트셀러</h3>
        </div>
        <p className="bestseller-sub">AI가 제작한 15초 쇼츠 영상으로 책을 미리 만나보세요</p>
      </div>

      <div className="bestseller-scroll-wrapper">
        {isLoading ? (
          <div className="bs-loading-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bs-skeleton-card" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <p className="bs-empty-msg">등록된 도서가 없습니다.</p>
        ) : (
          <div className="bestseller-list">
            {books.map((book, idx) => (
              <VideoCard key={book.id} book={book} rank={idx + 1} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BestsellerSection;
