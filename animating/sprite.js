class Sprite {
  constructor({
    context,
    x,
    y,
    width,
    height,
    frameData,
    image,
    scale = 1,
    opacity = 1,
    anchor = { x: 0.5, y: 0.5 },
    json,
    state
  }) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.image = image;
    this.json = json;
    this.frameData = frameData;
    this.x = x;
    this.y = y;
    this.anchor = anchor; //this is to define from where the image originates e.g. center expanding
    this.states = {
      walk: {
        frames: [0, 1, 2, 3, 4, 5, 6, 7],
        loop: true,
        motion: { x: 120, y: 0 },
        fps: 8
      }
    };
    this.state = this.states[state];
    this.scale = scale;
    this.opacity = opacity;
    this.currentTime = 0;

    this.state.duration = this.state.frames.length * (1 / this.state.fps);
  }

  getState() {
    let stateTime = 0;
    for (var i = 0; i < this.states.length; i++) {
      const state = {
        mode: this.states[i].mode,
        duration: this.states[i].duration
      };
      if (
        this.currentTime >= stateTime &&
        this.currentTime < stateTime + state.duration
      ) {
        state.time = this.currentTime - stateTime;
        return state;
      } else {
        stateTime += state.duration;
      }
    }
  }

  //calculating the distance using the pythagorean theorem
  static distanceBetweenPoints(a, b) {
    const x = a.x - b.x;
    const y = a.y - b.y;
    return Math.sqrt(x * x + y * y);
  }

  hitTest(mousePos) {
    const centre = { x: this.x, y: this.y };
    const radius = (this.frame.w * this.scale) / 2;

    //now test if the mousePos is in the circle
    const dist = Sprite.distanceBetweenPoints(mousePos, centre);
    return dist < radius;
  }

  get offset() {
    const scale = this.scale;
    const { sourceSize, spriteSourceSize } = this.frameData;
    const w = sourceSize.w;
    const h = spriteSourceSize.h;
    const x = spriteSourceSize.x;
    const y = spriteSourceSize.y;
    return {
      x: (w - x) * scale * this.anchor.x,
      y: (h - y) * scale * this.anchor.y
    };
  }

  update(dt) {
    this.currentTime += dt;
    if (this.currentTime > this.state.duration) {
      if (this.state.loop) {
        this.currentTime -= this.state.duration;
      }
    }

    this.x += this.state.motion.x * dt;
    this.y += this.state.motion.y * dt;

    if (this.x > 500) {
      this.x = -100;
    }

    const index = Math.floor(
      (this.currentTime / this.state.duration) * this.state.frames.length
    );

    this.frameData = this.json.frames[this.state.frames[index]];
  }

  render() {
    // Draw the animation
    const alpha = this.context.globalAlpha;

    this.context.globalAlpha = this.opacity;

    const frame = this.frameData.frame;
    const offset = this.offset;

    this.context.drawImage(
      this.image,
      frame.x,
      frame.y,
      frame.w,
      frame.h,
      this.x - offset.x,
      this.y - offset.y,
      frame.w * this.scale,
      frame.h * this.scale
    );

    this.context.globalAlpha = alpha;
  }
}
