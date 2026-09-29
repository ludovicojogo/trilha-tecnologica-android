(function () {
  function confetti(options) {
    options = options || {};
    var count = Math.min(options.particleCount || 60, 160);
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    var dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    var ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    var ox = ((options.origin && options.origin.x) || 0.5) * innerWidth;
    var oy = ((options.origin && options.origin.y) || 0.65) * innerHeight;
    var colors = ['#38bdf8','#22c55e','#f59e0b','#ec4899','#a78bfa','#ffffff'];
    var pieces = Array.from({length: count}, function (_, i) {
      var angle = (Math.random() * Math.PI) + Math.PI;
      var speed = 3 + Math.random() * 8;
      return {
        x: ox, y: oy,
        vx: Math.cos(angle) * speed + (Math.random() - .5) * 4,
        vy: Math.sin(angle) * speed - 2 - Math.random() * 4,
        size: 4 + Math.random() * 7,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - .5) * .35,
        color: colors[i % colors.length],
        life: 75 + Math.random() * 35
      };
    });
    var frame = 0;
    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      var alive = false;
      pieces.forEach(function (p) {
        if (p.life <= 0) return;
        alive = true;
        p.life--;
        p.vy += .18;
        p.vx *= .992;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.min(1, p.life / 18);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size/2, -p.size/4, p.size, p.size/2);
        ctx.restore();
      });
      frame++;
      if (alive && frame < 140) requestAnimationFrame(tick);
      else canvas.remove();
    }
    requestAnimationFrame(tick);
  }
  window.confetti = window.confetti || confetti;
})();
