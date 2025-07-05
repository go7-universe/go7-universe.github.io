import { useEffect, useState } from "react";

const initialCharacters = [
  "가렛 블랙게일", "강현우", "기사", "동선", "로스", "발몽 로슈포르",
  "브라운", "시구르드 빌헬름", "아이반 홉킨스", "아이안 웨일즈", "아이작 마일즈",
  "운", "이름없음", "이사야 바이스", "재밍", "전파", "진견우",
  "천", "한가천", "한권택", "한기준", "한세찬", "한진호", "한태웅", "황제"
];

const characterGroups = {
  "가렛 블랙게일": "제국칼렙",
  "강현우": "고칠민국",
  "기사": "제국칼렙",
  "동선": "제국칼렙",
  "로스": "너와의고칠",
  "발몽 로슈포르": "제국칼렙",
  "브라운": "너와의고칠",
  "시구르드 빌헬름": "너와의고칠",
  "아이반 홉킨스": "고칠세기",
  "아이안 웨일즈": "고칠세기",
  "아이작 마일즈": "고칠세기",
  "운": "제국칼렙",
  "이름없음": "고칠세기",
  "이사야 바이스": "고칠세기",
  "재밍": "너와의고칠",
  "전파": "너와의고칠",
  "진견우": "너와의고칠",
  "천": "제국칼렙",
  "한가천": "고칠민국",
  "한권택": "고칠민국",
  "한기준": "고칠민국",
  "한세찬": "고칠민국",
  "한진호": "고칠민국",
  "한태웅": "고칠민국",
  "황제": "제국칼렙",
};

const K = 32;
const length_char = initialCharacters.length;
const MAX_COUNT = length_char * (length_char-1) / 2;

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateElo(winner, loser, scores) {
  const Ra = scores[winner];
  const Rb = scores[loser];

  const Ea = expectedScore(Ra, Rb);
  const Eb = 1 - Ea;

  return {
    ...scores,
    [winner]: Ra + K * (1 - Ea),
    [loser]: Rb + K * (0 - Eb)
  };
}

function generateAllPairs(characters) {
  const pairs = [];
  for (let i = 0; i < characters.length; i++) {
    for (let j = i + 1; j < characters.length; j++) {
      // 무작위로 순서를 뒤섞음
      if (Math.random() < 0.5) {
        pairs.push([characters[i], characters[j]]);
      } else {
        pairs.push([characters[j], characters[i]]);
      }
    }
  }
  return pairs;
}

function shuffleArray(array) {
  return [...array].sort(() => 0.5 - Math.random());
}

function MainPage() {
  const [scores, setScores] = useState({});
  const [pair, setPair] = useState([null, null]);
  const [count, setCount] = useState(0);
  const [remainingPairs, setRemainingPairs] = useState([]);
  const [totalPairs, setTotalPairs] = useState(0);

  useEffect(() => {
    const savedScores = localStorage.getItem("eloScores");
    const savedPairs = localStorage.getItem("eloPairs");

    if (savedScores && savedPairs) {
      const parsedPairs = JSON.parse(savedPairs);
      setScores(JSON.parse(savedScores));
      setRemainingPairs(parsedPairs);
      setTotalPairs(parsedPairs.length);
      setCount(0);
    } else {
      const initScores = {};
      initialCharacters.forEach(c => (initScores[c] = 1500));
      const allPairs = shuffleArray(generateAllPairs(initialCharacters));
      setScores(initScores);
      setRemainingPairs(allPairs);
      setTotalPairs(allPairs.length);
      setCount(0);
      localStorage.setItem("eloScores", JSON.stringify(initScores));
      localStorage.setItem("eloPairs", JSON.stringify(allPairs));
    }
  }, []);

  useEffect(() => {
    if (remainingPairs.length > 0) {
      setPair(remainingPairs[0]);
    } else {
      setPair([null, null]);
    }
  }, [remainingPairs]);

  function handleVote(winner, loser) {
    const newScores = updateElo(winner, loser, scores);
    const newPairs = remainingPairs.slice(1);

    setScores(newScores);
    setRemainingPairs(newPairs);
    setCount(count + 1);

    localStorage.setItem("eloScores", JSON.stringify(newScores));
    localStorage.setItem("eloPairs", JSON.stringify(newPairs));
  }

  function handleReset() {
    const initScores = {};
    initialCharacters.forEach(c => (initScores[c] = 1500));
    const allPairs = shuffleArray(generateAllPairs(initialCharacters));

    setScores(initScores);
    setRemainingPairs(allPairs);
    setCount(0);
    setTotalPairs(allPairs.length);

    localStorage.setItem("eloScores", JSON.stringify(initScores));
    localStorage.setItem("eloPairs", JSON.stringify(allPairs));
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-6 max-w-5xl mx-auto text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">고칠 유니버스</h1>
      <h2 className="text-xl font-bold text-gray-800">정실을 찾아서</h2>
      {pair[0] && pair[1] ? (
        <div className="flex flex-row flex-wrap justify-center items-center gap-6">
          {[0, 1].map(i => (
            <button
              key={i}
              onClick={() => handleVote(pair[i], pair[1 - i])}
              className="flex-1 border-2 border-indigo-300 rounded-2xl p-4 hover:bg-indigo-50 shadow-lg transition"
            >
              <img
                src={`/images/rank/${pair[i]}.jpg`}
                alt={pair[i]}
                className="w-full aspect-[9/16] object-cover rounded-lg mb-3"
              />
              <div className="font-bold text-lg text-gray-800">{pair[i]}</div>
              <div className="text-sm text-indigo-500 font-medium">{characterGroups[pair[i]] || ""}</div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-green-600 font-semibold">🎉 모든 비교가 완료되었습니다!</p>
      )}



      <div className="text-sm text-gray-500">
        남은 비교 수: {remainingPairs.length} / {MAX_COUNT}
      </div>

      <h2 className="text-xl font-semibold mt-6">📈 현재 순위</h2>
      <ol className="text-left space-y-2">
        {sorted.map(([name, score], i) => (
          <li key={name} className="flex items-center gap-3">
            <img
              src={`/images/rank/${name}.jpg`}
              alt={name}
              className="w-10 h-10 object-cover rounded-full"
            />
            <div>
              <div className="font-semibold">{i + 1}. {name}</div>
              <div className="text-xs text-gray-500">{characterGroups[name] || ""} - {score.toFixed(1)}</div>
            </div>
          </li>
        ))}
      </ol>
      <button
        onClick={handleReset}
        className="text-indigo-700 border border-indigo-500 px-4 py-2 rounded-md hover:bg-indigo-100"
      >
        🔄 처음부터 다시 하기
      </button>
    </div>
  );
}

export default MainPage;