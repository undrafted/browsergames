class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.context.font = "30px Verdana";
    this.sprites = [];

    this.spriteImage = new Image();
    this.spriteImage.src = "flower.png";

    this.spriteImage.onload = () => {
      this.init();
    };
  }

  init() {
    this.score = 0; //set init score to 0 (obviously)

    this.lastRefreshTime = Date.now();
    this.spawn(); //first spawn
    this.refresh();

    // depending if touch device or desktop
    if ("ontouchstart" in window) {
      this.canvas.addEventListener("touchstart", this.tap.bind(this));
    } else {
      this.canvas.addEventListener("mousedown", this.tap.bind(this));
    }
  }

  tap(e) {
    // get mouse position & convert to canvas coordinates
    const mousePos = this.getMousePos(e);
    console.log(mousePos);

    for (let sprite of this.sprites) {
      if (sprite.hitTest(mousePos)) {
        sprite.kill = true;
        this.score++;
      }
    }
  }

  getMousePos(e) {
    // getBoundingClientRect returns the size of an element and its position relative to the viewport
    const rect = this.canvas.getBoundingClientRect();

    //touch device vs non touch device
    const clientX = e.targetTouches
      ? EventTarget.targetTouches[0].pageX
      : e.clientX;

    const clientY = e.targetTouches
      ? EventTarget.targetTouches[0].pageY
      : e.clientY;

    // canvas could be scaled up or down e.g. on phone
    const canvasScale = this.canvas.width / this.canvas.offsetWidth;

    const loc = {
      x: (clientX - rect.left) * canvasScale,
      y: (clientY - rect.top) * canvasScale
    };

    return loc;
  }

  //function to create a new sprite
  spawn() {
    //create a new sprite object
    const sprite = new Sprite({
      context: this.context,
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      width: this.spriteImage.width,
      height: this.spriteImage.height,
      image: this.spriteImage
    });

    // add the new sprite to the list of sprites
    this.sprites.push(sprite);
    this.sinceLastSpawn = 0;
  }

  refresh() {
    const now = Date.now();
    const dt = (now - this.lastRefreshTime) / 1000; //elapsed time in S

    this.update(dt); //update to spawn shit again
    this.render(); // re-render whole canvas

    this.lastRefreshTime = now;

    //browser function that accepts a callback
    // that gets called when the browser refreshes the screen
    // so this gets called infinitely during browser refresh (most of the time 60fps)
    requestAnimationFrame(() => {
      this.refresh();
    });
  }

  update(dt) {
    this.sinceLastSpawn += dt;
    // if 1 sec elapsed, spawn a new sprite
    if (this.sinceLastSpawn > 1) {
      this.spawn(); //spawn some shit
    }

    this.sprites = this.sprites.filter(sprite => !sprite.kill);

    for (let sprite of this.sprites) {
      sprite && sprite.update(dt);
    }
  }

  //render all sprites
  // apparently the canvas gets cleared and re-rendered?
  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let sprite of this.sprites) {
      sprite.render();
    }

    this.context.fillText(`Score: ${this.score}`, 150, 30);
  }
}

class Sprite {
  constructor({
    context,
    width,
    height,
    image,
    x,
    y,
    scale = 1,
    opacity = 1,
    anchor = { x: 0.5, y: 0.5 }
  }) {
    this.context = context;
    this.width = width;
    this.height = height;
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
    const radius = (this.width * this.scale) / 2;

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
      0, // x value of image
      0, // y value of image
      this.width, // we will display full width of image
      this.height, // we will display full height of image

      // these last 4 properties are destination (place on canvas)
      // these below coordinates are the x and y points (are the top left hand corner) - so we do some calculation to
      // draw the image properly
      this.x - this.width * this.scale * this.anchor.x, // going to be drawn on x axis
      this.y - this.height * this.scale * this.anchor.y, // going to be drawn on y axis
      this.width * this.scale, // width of the sprite canvas
      this.height * this.scale //height of the sprite on canvas
    );

    this.context.globalAlpha = alpha;
  }
}
