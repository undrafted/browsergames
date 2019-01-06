class Game {
  constructor() {
    this.canvas = document.getElementById("game");
    this.context = this.canvas.getContext("2d");
    this.context.font = "30px Verdana";
    this.sprites = [];
    this.loadJSON("bucket", data => {
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
    this.lastRefreshTime = Date.now();
    this.spawn(); //first spawn
    this.refresh();
  }

  //function to create a new sprite
  spawn() {
    const frameData = this.spriteData.frames[0];

    //create a new sprite object
    const sprite = new Sprite({
      context: this.context,
      x: 150,
      y: 180,
      width: frameData.sourceSize.w,
      height: frameData.sourceSize.h,
      anchor: { x: 0.5, y: 0.5 },
      image: this.spriteImage,
      json: this.spriteData,
      state: "walk"
    });

    this.bucket = sprite;
    // add the new sprite to the list of sprites
    this.sprites.push(sprite);
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
  }
}
