class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.context.font = "30px Verdana";
    this.sprites = [];

    this.loadJSON("flowers", data => {
      this.spriteData = JSON.parse(data);
      this.spriteImage = new Image();
      this.spriteImage.src = this.spriteData.meta.image;
      this.spriteImage.onload = () => {
        this.init();
      };
    });
  }

  loadJSON(json, callback) {
    const xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", `${json}.json`, true);

    xobj.onreadystatechange = function() {
      if (xobj.readyState === 4 && xobj.status === 200) {
        //required use of an anonymous callback as .open will NOT return
        // a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
      }
    };
    xobj.send(null);
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
    // here we take the random flowers to display
    const index = Math.floor(Math.random() * 5);
    const frame = this.spriteData.frames[index].frame;

    //create a new sprite object
    const sprite = new Sprite({
      context: this.context,
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      index: index,
      frame: frame,
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
