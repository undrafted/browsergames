class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.sprites = [];

    this.spriteImage = new Image();
    this.spriteImage.src = "flower.png";

    this.spriteImage.onload = () => {
      this.lastRefreshTime = Date.now();
      this.spawn(); //first spawn
      this.refresh();
    };
  }

  //function to create a new sprite
  spawn() {
    const sprite = new Sprite({
      context: this.context,
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      width: this.spriteImage.width,
      height: this.spriteImage.height,
      image: this.spriteImage
    });

    // add the new sprite to the list of sprites
    //for re-render
    this.sprites.push(sprite);
    this.sinceLastSpawn = 0;
  }

  refresh() {
    const now = Date.now();
    const dt = (now - this.lastRefreshTime) / 1000; //elapsed time in S

    this.update(dt); //update to spawn shit again
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
      this.render(); //re-render the canvas
    }
  }

  //render all sprites
  // apparently the canvas gets cleared and re-rendered?
  render() {
    console.log("render");
    for (let sprite of this.sprites) {
      sprite.render();
    }
  }
}

class Sprite {
  constructor({ context, width, height, image, x, y }) {
    this.context = context;
    this.width = width;
    this.height = height;
    this.image = image;
    this.x = x;
    this.y = y;
  }

  render() {
    this.context.drawImage(this.image, this.x, this.y);
  }
}
