import { useState, useEffect, useRef, useCallback } from "react";

const AGGRESSIVE = [
  { name: "Wicket", label: "W", color: "#c0392b", prob: 0.30 },
  { name: "0 Runs", label: "0", color: "#636e72", prob: 0.10 },
  { name: "1 Run",  label: "1", color: "#27ae60", prob: 0.10 },
  { name: "2 Runs", label: "2", color: "#2980b9", prob: 0.10 },
  { name: "3 Runs", label: "3", color: "#8e44ad", prob: 0.05 },
  { name: "4 Runs", label: "4", color: "#e67e22", prob: 0.20 },
  { name: "6 Runs", label: "6", color: "#e74c3c", prob: 0.15 },
];

const DEFENSIVE = [
  { name: "Wicket", label: "W", color: "#c0392b", prob: 0.10 },
  { name: "0 Runs", label: "0", color: "#636e72", prob: 0.25 },
  { name: "1 Run",  label: "1", color: "#27ae60", prob: 0.30 },
  { name: "2 Runs", label: "2", color: "#2980b9", prob: 0.18 },
  { name: "3 Runs", label: "3", color: "#8e44ad", prob: 0.05 },
  { name: "4 Runs", label: "4", color: "#e67e22", prob: 0.07 },
  { name: "6 Runs", label: "6", color: "#e74c3c", prob: 0.05 },
];

const COMMENTARY = {
  W: [
    "Bowled him! Stumps are all over the place!",
    "OUT! Caught behind, what a soft dismissal.",
    "Gone! That's a terrible shot to play!",
  ],
  "0": [
    "Dot ball. Played and missed completely.",
    "Tight line from the bowler, no run taken.",
    "Defended solidly but no run there.",
  ],
  "1": [
    "Pushed to mid-on, easy single.",
    "One run, good running between the wickets.",
    "Nudged off the pads for a single.",
  ],
  "2": [
    "Two runs! Nicely placed through the gap.",
    "Driven well, they come back for two.",
    "Good shot, two more on the board.",
  ],
  "3": [
    "Three! Great running between the wickets!",
    "Pushed to the deep, three hard runs.",
    "Smart cricket, three taken.",
  ],
  "4": [
    "FOUR! Cracking drive through the covers!",
    "BOUNDARY! Timed to perfection!",
    "Four runs! That's hit to the fence!",
  ],
  "6": [
    "SIX! That's gone into the stands!",
    "MAXIMUM! Huge hit over long-on!",
    "SIX! Crowd goes absolutely wild!",
  ],
};

function getComment(outcome) {
  var lines = COMMENTARY[outcome] || ["Good ball!"];
  return lines[Math.floor(Math.random() * lines.length)];
}

function getOutcome(pos, probs) {
  var acc = 0;
  for (var i = 0; i < probs.length; i++) {
    acc += probs[i].prob;
    if (pos <= acc) return probs[i].label;
  }
  return probs[probs.length - 1].label;
}

function drawField(ctx, W, H, runs, wickets, ballsDone, style) {
  var sky = ctx.createLinearGradient(0, 0, 0, H * 0.45);
  sky.addColorStop(0, "#4a90c4");
  sky.addColorStop(1, "#87ceeb");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.45);

  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(0, H * 0.45, W, H);
  ctx.fillStyle = "#c8a838";
  ctx.beginPath();
  ctx.ellipse(W * 0.5, H * 0.82, 90, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.36, H * 0.87);
  ctx.lineTo(W * 0.64, H * 0.87);
  ctx.stroke();
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 3;
  for (var s = -1; s <= 1; s++) {
    ctx.beginPath();
    ctx.moveTo(W * 0.32 + s * 7, H * 0.93);
    ctx.lineTo(W * 0.32 + s * 7, H * 0.78);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W * 0.32 - 9, H * 0.775);
  ctx.lineTo(W * 0.32 + 9, H * 0.775);
  ctx.stroke();
  for (var ci = 0; ci < 90; ci++) {
    var cx = (ci * 131.3) % W;
    var cy = 12 + (ci * 47.1) % 35;
    ctx.beginPath();
    ctx.arc(cx, cy, 3 + (ci % 3), 0, Math.PI * 2);
    ctx.fillStyle = "hsl(" + (ci * 43) % 360 + ", 60%, 55%)";
    ctx.fill();
  }

  ctx.fillStyle = "#111";
  ctx.fillRect(W * 0.72, 10, 140, 65);
  ctx.strokeStyle = "#f5c518";
  ctx.lineWidth = 1;
  ctx.strokeRect(W * 0.72, 10, 140, 65);
  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 11px monospace";
  ctx.textAlign = "left";
  ctx.fillText("Score: " + runs + "/" + wickets, W * 0.72 + 8, 28);
  var ov = Math.floor(ballsDone / 6) + "." + (ballsDone % 6);
  ctx.fillText("Overs: " + ov, W * 0.72 + 8, 43);
  ctx.fillText(style.toUpperCase(), W * 0.72 + 8, 58);
}

function drawBatsman(ctx, W, H, batAngle) {
  var bx = W * 0.34;
  var by = H * 0.93;
  ctx.save();
  ctx.translate(bx, by);
  ctx.fillStyle = "#fff";
  ctx.fillRect(-8, -38, 8, 24);
  ctx.fillRect(2, -38, 8, 24);

  ctx.fillStyle = "#333";
  ctx.fillRect(-9, -15, 11, 5);
  ctx.fillRect(1, -15, 11, 5);
  ctx.fillStyle = "#006600";
  ctx.fillRect(-9, -62, 20, 27);

  ctx.fillStyle = "#c9a06e";
  ctx.beginPath();
  ctx.arc(2, -68, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#004400";
  ctx.beginPath();
  ctx.arc(2, -71, 9, Math.PI, 0);
  ctx.fill();

  ctx.save();
  ctx.translate(11, -40);
  ctx.rotate(batAngle);
  ctx.fillStyle = "#d4a800";
  ctx.fillRect(0, -3, 28, 7);
  ctx.restore();

  ctx.restore();
}

function drawBall(ctx, bx, by) {
  ctx.beginPath();
  ctx.arc(bx, by, 8, 0, Math.PI * 2);
  var bg = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 8);
  bg.addColorStop(0, "#ff7777");
  bg.addColorStop(1, "#bb0000");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(bx, by, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
}

export default function CricketGame() {
  const [runs, setRuns]               = useState(0);
  const [wickets, setWickets]         = useState(0);
  const [ballsDone, setBallsDone]     = useState(0);
  const [style, setStyle]             = useState("aggressive");
  const [gameOver, setGameOver]       = useState(false);
  const [busy, setBusy]               = useState(false);
  const [commentary, setCommentary]   = useState("");
  const [showComm, setShowComm]       = useState(false);
  const [resultText, setResultText]   = useState("");
  const [showResult, setShowResult]   = useState(false);
  const [sliderPos, setSliderPos]     = useState(0);
  const runsRef       = useRef(0);
  const wicketsRef    = useRef(0);
  const ballsDoneRef  = useRef(0);
  const styleRef      = useRef("aggressive");
  const gameOverRef   = useRef(false);
  const busyRef       = useRef(false);

  const canvasRef = useRef(null);
  const sliderPosRef    = useRef(0);
  const sliderDirRef    = useRef(1);
  const sliderAnimRef   = useRef(null);
  const sliderActiveRef = useRef(false);
  const ballXRef    = useRef(0);
  const ballYRef    = useRef(0);
  const showBallRef = useRef(false);
  const batAngleRef = useRef(0);

  const W = 760;
  const H = 290;
  const TOTAL_BALLS = 12;
  const MAX_WICKETS = 2;
  useEffect(() => { runsRef.current = runs; },         [runs]);
  useEffect(() => { wicketsRef.current = wickets; },   [wickets]);
  useEffect(() => { ballsDoneRef.current = ballsDone; },[ballsDone]);
  useEffect(() => { styleRef.current = style; },       [style]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { busyRef.current = busy; },         [busy]);
  const drawScene = useCallback(() => {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    drawField(ctx, W, H, runsRef.current, wicketsRef.current, ballsDoneRef.current, styleRef.current);
    drawBatsman(ctx, W, H, batAngleRef.current);
    if (showBallRef.current) {
      drawBall(ctx, ballXRef.current, ballYRef.current);
    }
  }, []);
  const runSlider = useCallback(() => {
    if (!sliderActiveRef.current) return;
    sliderPosRef.current += sliderDirRef.current * 0.0055;
    if (sliderPosRef.current >= 1) { sliderPosRef.current = 1; sliderDirRef.current = -1; }
    if (sliderPosRef.current <= 0) { sliderPosRef.current = 0; sliderDirRef.current =  1; }
    setSliderPos(sliderPosRef.current);
    sliderAnimRef.current = requestAnimationFrame(runSlider);
  }, []);

  const startSlider = useCallback(() => {
    sliderActiveRef.current = true;
    runSlider();
  }, [runSlider]);

  const stopSlider = useCallback(() => {
    sliderActiveRef.current = false;
    cancelAnimationFrame(sliderAnimRef.current);
  }, []);
  useEffect(() => {
    drawScene();
    startSlider();
    return () => stopSlider();
  }, [drawScene, startSlider, stopSlider]);
  function animBowl(cb) {
    ballXRef.current = W * 0.82;
    ballYRef.current = H * 0.74;
    showBallRef.current = true;

    var destX  = W * 0.35;
    var destY  = H * 0.85;
    var steps  = 30;
    var step   = 0;
    var startX = ballXRef.current;
    var startY = ballYRef.current;

    function go() {
      if (step < steps) {
        var t = step / steps;
        ballXRef.current = startX + (destX - startX) * t;
        ballYRef.current = startY + (destY - startY) * t;
        ballYRef.current -= Math.sin(t * Math.PI) * 20;
        drawScene();
        step++;
        requestAnimationFrame(go);
      } else {
        cb();
      }
    }
    go();
  }
  function animSwing(outcome, cb) {
    var maxSwing = outcome === "W" ? 0.15 : -0.9;
    var steps    = 18;
    var s        = 0;

    function swing() {
      if (s < steps) {
        var t = s / steps;
        batAngleRef.current = maxSwing * Math.sin(t * Math.PI);
        drawScene();
        s++;
        requestAnimationFrame(swing);
      } else {
        batAngleRef.current = 0;
        if (outcome !== "W" && outcome !== "0") {
          animBallFly(outcome, cb);
        } else if (outcome === "W") {
          var fl = 0;
          function flash() {
            if (fl < 8) {
              drawScene();
              var ctx = canvasRef.current.getContext("2d");
              ctx.fillStyle = "rgba(180,0,0,0.25)";
              ctx.fillRect(0, 0, W, H);
              fl++;
              requestAnimationFrame(flash);
            } else {
              showBallRef.current = false;
              drawScene();
              cb();
            }
          }
          flash();
        } else {
          showBallRef.current = false;
          drawScene();
          cb();
        }
      }
    }
    swing();
  }
  function animBallFly(outcome, cb) {
    var r  = parseInt(outcome) || 0;
    var tx = r >= 4 ? W * 0.95 : W * 0.75;
    var ty = r >= 6 ? 10       : r >= 4 ? 50 : H * 0.55;
    var steps  = 28;
    var s      = 0;
    var startX = ballXRef.current;
    var startY = ballYRef.current;

    function fly() {
      if (s < steps) {
        var t = s / steps;
        ballXRef.current = startX + (tx - startX) * t;
        ballYRef.current = startY + (ty - startY) * t - Math.sin(t * Math.PI) * 45;
        drawScene();
        s++;
        requestAnimationFrame(fly);
      } else {
        showBallRef.current = false;
        drawScene();
        cb();
      }
    }
    fly();
  }

  function hitBall() {
    if (busyRef.current || gameOverRef.current) return;
    stopSlider();
    var pos     = sliderPosRef.current;
    var probs   = styleRef.current === "aggressive" ? AGGRESSIVE : DEFENSIVE;
    var outcome = getOutcome(pos, probs);

    busyRef.current = true;
    setBusy(true);
    animBowl(function () {
      animSwing(outcome, function () {
        var newRuns    = runsRef.current;
        var newWickets = wicketsRef.current;
        var newBalls   = ballsDoneRef.current + 1;
        var over       = false;

        if (outcome === "W") {
          newWickets++;
          if (newWickets >= MAX_WICKETS) over = true;
        } else {
          newRuns += parseInt(outcome) || 0;
        }
        if (newBalls >= TOTAL_BALLS) over = true;

        
        setRuns(newRuns);
        setWickets(newWickets);
        setBallsDone(newBalls);
        runsRef.current      = newRuns;
        wicketsRef.current   = newWickets;
        ballsDoneRef.current = newBalls;
        drawScene(); 
        showResultFlash(outcome);
        setCommentary(getComment(outcome));
        setShowComm(true);
        setTimeout(() => setShowComm(false), 2400);

        if (over) {
          gameOverRef.current = true;
          setGameOver(true);
          return;
        }
        setTimeout(function () {
          busyRef.current = false;
          setBusy(false);
          startSlider();
        }, 1300);
      });
    });
  }

  function showResultFlash(outcome) {
    var txt = "";
    if      (outcome === "W") txt = "💀 OUT!";
    else if (outcome === "6") txt = "💥 SIX!";
    else if (outcome === "4") txt = "🔥 FOUR!";
    else if (outcome === "0") txt = "• Dot Ball";
    else txt = "✅ " + outcome + (outcome === "1" ? " Run" : " Runs");
    setResultText(txt);
    setShowResult(true);
    setTimeout(() => setShowResult(false), 1100);
  }

  function resetGame() {
    stopSlider();

    setRuns(0);       runsRef.current      = 0;
    setWickets(0);    wicketsRef.current   = 0;
    setBallsDone(0);  ballsDoneRef.current = 0;
    setGameOver(false); gameOverRef.current  = false;
    setBusy(false);     busyRef.current      = false;

    showBallRef.current  = false;
    batAngleRef.current  = 0;
    sliderPosRef.current = 0;
    sliderDirRef.current = 1;

    setShowComm(false);
    setShowResult(false);

    setTimeout(() => {
      drawScene();
      startSlider();
    }, 50);
  }

  var probs   = style === "aggressive" ? AGGRESSIVE : DEFENSIVE;
  var overStr = Math.floor(ballsDone / 6) + "." + (ballsDone % 6);
  var sr      = ballsDone > 0 ? ((runs / ballsDone) * 100).toFixed(2) : "0.00";
  var reason  = wickets >= MAX_WICKETS ? "All wickets lost!" : "Overs complete!";

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>🏏 Cricket Batting Game</h2>

      <div style={styles.scoreboard}>
        {[
          { label: "Runs",        val: runs },
          { label: "Wickets",     val: wickets + " / " + MAX_WICKETS },
          { label: "Overs",       val: overStr },
          { label: "Balls Left",  val: TOTAL_BALLS - ballsDone },
          { label: "Strike Rate", val: sr },
        ].map((item) => (
          <div key={item.label} style={styles.scoreBox}>
            <p style={styles.scoreLabel}>{item.label}</p>
            <span style={styles.scoreVal}>{item.val}</span>
          </div>
        ))}
      </div>

      <div style={styles.canvasWrap}>
        <canvas ref={canvasRef} width={W} height={H} style={styles.canvas} />

        {showComm && <div style={styles.commBox}>{commentary}</div>}

        {showResult && <div style={styles.resultFlash}>{resultText}</div>}

        {gameOver && (
          <div style={styles.gameOver}>
            <h3 style={styles.goTitle}>Game Over!</h3>
            <p style={styles.goText}>
              Final: {runs}/{wickets} in {overStr} overs
            </p>
            <p style={styles.goText}>
              {reason} &nbsp;|&nbsp; SR: {sr}
            </p>
            <button style={styles.goBtn} onClick={resetGame}>
              Play Again
            </button>
          </div>
        )}
      </div>

      <div style={styles.controls}>

        <div style={styles.styleBtns}>
          <button
            style={{ ...styles.styleBtn, ...(style === "aggressive" ? styles.styleBtnActive : {}) }}
            onClick={() => setStyle("aggressive")}
          >
            ⚡ Aggressive
          </button>
          <button
            style={{ ...styles.styleBtn, ...(style === "defensive" ? styles.styleBtnActive : {}) }}
            onClick={() => setStyle("defensive")}
          >
            🛡 Defensive
          </button>
        </div>

        <p style={styles.pbLabel}>Power Bar — Stop the slider to play your shot</p>
        <div style={styles.pbOuter}>
          <div style={styles.pbBar}>
            {probs.map((seg) => (
              <div
                key={seg.label}
                style={{
                  flex: seg.prob,
                  background: seg.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "0.72rem",
                  fontWeight: "bold",
                  textShadow: "1px 1px 2px black",
                  minWidth: "6px",
                  overflow: "hidden",
                }}
              >
                {seg.prob >= 0.08 ? seg.label : ""}
              </div>
            ))}
          </div>

          {/* moving slider */}
          <div
            style={{
              ...styles.sliderLine,
              left: (sliderPos * 100) + "%",
            }}
          />
        </div>

        <div style={styles.btnRow}>
          <button
            style={{ ...styles.playBtn, ...(busy ? styles.playBtnDisabled : {}) }}
            onClick={hitBall}
            disabled={busy || gameOver}
          >
            🏏 Play Shot
          </button>
          <button style={styles.restartBtn} onClick={resetGame}>
            ↺ Restart
          </button>
        </div>

        <div style={styles.probSection}>
          <p style={styles.probTitle}>Probability Distribution</p>
          <div style={styles.probCells}>
            {probs.map((seg) => (
              <div key={seg.label} style={styles.probCell}>
                <small style={{ color: seg.color, fontSize: "0.58rem" }}>
                  {seg.name}
                </small>
                <b style={{ color: "#f5c518", fontSize: "0.85rem" }}>
                  {(seg.prob * 100).toFixed(0)}%
                </b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.ballTrack}>
        {Array.from({ length: TOTAL_BALLS }).map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.ballDot,
              background: i < ballsDone ? "#555" : "#f5c518",
              opacity:    i < ballsDone ? 1      : 0.25,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#1b1b2f",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "15px",
    minHeight: "100vh",
  },
  title: {
    color: "#f5c518",
    fontSize: "1.5rem",
    marginBottom: "10px",
    letterSpacing: "1px",
  },
  scoreboard: {
    background: "#111",
    border: "2px solid #f5c518",
    borderRadius: "8px",
    padding: "10px 20px",
    display: "flex",
    gap: "30px",
    marginBottom: "0",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "760px",
    maxWidth: "100%",
  },
  scoreBox: { textAlign: "center" },
  scoreLabel: {
    color: "#aaa",
    fontSize: "0.7rem",
    textTransform: "uppercase",
    margin: 0,
  },
  scoreVal: {
    color: "#f5c518",
    fontSize: "1.4rem",
    fontWeight: "bold",
  },
  canvasWrap: {
    position: "relative",
    width: "760px",
    maxWidth: "100%",
  },
  canvas: {
    width: "100%",
    height: "auto",
    display: "block",
    border: "2px solid #444",
  },
  commBox: {
    position: "absolute",
    top: "8px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.75)",
    color: "#f5c518",
    padding: "5px 14px",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    zIndex: 5,
    pointerEvents: "none",
  },
  resultFlash: {
    position: "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "2.8rem",
    fontWeight: "900",
    color: "white",
    textShadow: "2px 2px 8px black",
    zIndex: 6,
    pointerEvents: "none",
  },
  gameOver: {
    position: "absolute",
    top: 0, left: 0,
    width: "100%", height: "100%",
    background: "rgba(0,0,0,0.87)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    gap: "8px",
  },
  goTitle: { color: "#f5c518", fontSize: "2rem", margin: 0 },
  goText:  { color: "white", fontSize: "1rem", margin: 0 },
  goBtn: {
    marginTop: "10px",
    padding: "10px 28px",
    background: "#f5c518",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  controls: {
    width: "760px",
    maxWidth: "100%",
    background: "#111",
    border: "2px solid #333",
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    padding: "12px 14px",
  },
  styleBtns: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
    justifyContent: "center",
  },
  styleBtn: {
    flex: 1,
    maxWidth: "180px",
    padding: "7px",
    border: "2px solid #555",
    borderRadius: "6px",
    background: "#1b1b2f",
    color: "#bbb",
    fontSize: "0.85rem",
    fontWeight: "bold",
    cursor: "pointer",
  },
  styleBtnActive: {
    borderColor: "#f5c518",
    color: "#f5c518",
    background: "#222200",
  },
  pbLabel: {
    color: "#888",
    fontSize: "0.68rem",
    textAlign: "center",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  pbOuter: {
    position: "relative",
    marginBottom: "6px",
  },
  pbBar: {
    display: "flex",
    height: "38px",
    borderRadius: "5px",
    overflow: "hidden",
    border: "2px solid #444",
  },
  sliderLine: {
    position: "absolute",
    top: "-3px",
    width: "3px",
    height: "44px",
    background: "white",
    borderRadius: "2px",
    pointerEvents: "none",
    boxShadow: "0 0 6px white",
    transform: "translateX(-50%)",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginTop: "8px",
  },
  playBtn: {
    padding: "9px 30px",
    background: "#f5c518",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontWeight: "bold",
    cursor: "pointer",
    letterSpacing: "1px",
  },
  playBtnDisabled: {
    background: "#555",
    color: "#888",
    cursor: "not-allowed",
  },
  restartBtn: {
    padding: "9px 22px",
    background: "transparent",
    border: "2px solid #f5c518",
    borderRadius: "6px",
    color: "#f5c518",
    fontSize: "0.82rem",
    cursor: "pointer",
  },
  probSection: {
    marginTop: "10px",
    borderTop: "1px solid #222",
    paddingTop: "8px",
  },
  probTitle: {
    color: "#666",
    fontSize: "0.65rem",
    textAlign: "center",
    textTransform: "uppercase",
    marginBottom: "5px",
  },
  probCells: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    justifyContent: "center",
  },
  probCell: {
    background: "#1b1b2f",
    borderRadius: "5px",
    padding: "3px 10px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
  },
  ballTrack: {
    display: "flex",
    gap: "4px",
    justifyContent: "center",
    marginTop: "8px",
    flexWrap: "wrap",
  },
  ballDot: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
  },
};
