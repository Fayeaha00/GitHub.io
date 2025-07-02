let numLines = 180;
let numParticles = 120;
let maxLength;
let brightColors = [];
let noiseOffsets = [];

let particles = [];

let amp;
let song;
let fileInput;

function preload() {
  // 加载默认音乐（可选）
  // song = loadSound("assets/dance.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  maxLength = min(width, height) * 0.45;

  // 设置颜色
  brightColors = [
    color(255, 102, 153),
    color(255, 204, 102),
    color(102, 255, 204),
    color(153, 102, 255),
    color(255, 255, 153),
    color(255, 153, 102)
  ];

  // 初始化噪声偏移
  for (let i = 0; i < numLines; i++) {
    noiseOffsets.push(createVector(random(1000), random(1000)));
  }

  // 初始化粒子
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle());
  }

  // 音频设置
  amp = new p5.Amplitude();

  // 上传音频按钮
  fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
}

function draw() {
  background(10, 10, 30, 40);
  translate(width / 2, height / 2);

  let t = frameCount * 0.015;
  let volume = amp.getLevel();
  let beatFactor = map(volume, 0, 0.3, 0.8, 1.5);

  drawSpotlight(volume);
  drawDancer(t, beatFactor, volume);
  drawParticles(t, volume);
}

function handleFile(file) {
  if (file.type === 'audio') {
    if (song && song.isPlaying()) song.stop();
    song = loadSound(file.data, () => {
      song.play();
      amp.setInput(song);
    });
  }
}

// ✨ 中心线条（舞者）
function drawDancer(t, beatFactor, volume) {
  for (let i = 0; i < numLines; i++) {
    let angle = TWO_PI / numLines * i + t;
    let baseLen = maxLength * 0.7 * beatFactor;
    let n = noise(noiseOffsets[i].x + t, noiseOffsets[i].y);
    let sway = map(n, 0, 1, -PI / 8, PI / 8);
    let a = angle + sway;
    let len = baseLen + sin(t + i) * 30;

    let x2 = cos(a) * len;
    let y2 = sin(a) * len;
    let cx = cos(a + PI / 3) * len * 0.3;
    let cy = sin(a + PI / 3) * len * 0.3;

    noFill();
    strokeWeight(1.5);
    let c = brightColors[i % brightColors.length];
    stroke(c.levels[0], c.levels[1], c.levels[2], 100 + 120 * volume);
    bezier(0, 0, cx, cy, cx, cy, x2, y2);
  }
}

// 🌟 粒子绘制
function drawParticles(t, volume) {
  for (let p of particles) {
    p.update(t, volume);
    p.display();
  }
}

// 💡 中心光环
function drawSpotlight(volume) {
  noStroke();
  for (let r = 300; r > 10; r -= 5) {
    let b = map(r, 300, 10, 0, 200 * volume);
    fill(255, 255, 255, b);
    ellipse(0, 0, r, r);
  }
}

// 粒子类
class Particle {
  constructor() {
    this.angle = random(TWO_PI);
    this.radius = random(60, 300);
    this.speed = random(0.005, 0.02);
    this.size = random(2, 5);
    this.c = random(brightColors);
  }

  update(t, volume) {
    this.angle += this.speed + volume * 0.05;
    this.radius += sin(t + this.angle) * 0.5;
  }

  display() {
    let x = cos(this.angle) * this.radius;
    let y = sin(this.angle) * this.radius;
    noStroke();
    fill(this.c.levels[0], this.c.levels[1], this.c.levels[2], random(60, 220));
    ellipse(x, y, this.size, this.size);
  }
}
