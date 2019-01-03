class Sprite {
  constructor({
    context,
    x,
    y,
    index,
    frame,
    image,
    scale = 1,
    opacity = 1,
    anchor = { x: 0.5, y: 0.5 }
  }) {
    this.context = context;
    this.index = index;
    this.frame = frame;
    this.image = image;
    this.x = x;
    this.y = y;
    this.anchor = anchor; //this is to define from where the image originates e.g. center expanding
    this.states = [
      {
        mode: "spawn",
        duration: 0.5
      },
      {
        mode: "static",
        duration: 1.5
      },
      {
        mode: "die",
        duration: 0.8
      }
    ];

    this.state = 0;
    this.scale = scale;
    this.opacity = opacity;
    this.currentTime = 0;
    this.kill = false;
  }

  set state(index) {
    this.stateIndex = index;
    this.stateTime = 0;
  }

  get state() {
    return this.states[this.stateIndex];
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

  update(dt) {
    this.stateTime += dt;
    const state = this.state; //this calls get state!!
    if (!state) {
      this.kill = true;
      return;
    }

    const delta = this.stateTime / state.duration;
    // if the state time elapsed
    if (delta > 1) {
      this.state = this.stateIndex + 1;
    }

    //looking for the new state
    switch (state.mode) {
      case "spawn": {
        //scale and fade in
        this.scale = delta;
        this.opacity = delta;
        break;
      }
      case "static": {
        this.scale = 1;
        this.opacity = 1;
        break;
      }
      case "die":
      default: {
        this.scale = 1 + delta;
        const newOpacity = 1 - delta;
        this.opacity = newOpacity < 0 ? 0 : newOpacity;
        break;
      }
    }
  }

  render() {
    //The CanvasRenderingContext2D.globalAlpha property of the Canvas 2D API
    // specifies the alpha (transparency) value that is applied to shapes and images
    // before they are drawn onto the canvas.
    const alpha = this.context.globalAlpha;
    this.context.globalAlpha = this.opacity;

    this.context.drawImage(
      // these first 5 properties are src (referring to the image)
      this.image,
      this.frame.x, // x value of image
      this.frame.y, // y value of image
      this.frame.w, // we will display full width of image
      this.frame.h, // we will display full height of image

      // these last 4 properties are destination (place on canvas)
      // these 2 coordinates below are the x and y points which is the top left  corner
      // of the destination canvas at which to place the top-left corner of the source image
      this.x - this.frame.w * this.scale * this.anchor.x, // going to be drawn on x axis
      this.y - this.frame.h * this.scale * this.anchor.y, // going to be drawn on y axis
      this.frame.w * this.scale, // width of the sprite on canvas
      this.frame.h * this.scale //height of the sprite on canvas
    );

    this.context.globalAlpha = alpha;
  }
}
