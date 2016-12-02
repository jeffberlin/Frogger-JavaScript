var CANVAS_HEIGHT = 606;
var CANVAS_WIDTH = 505;

var ENEMY_COLLISION_RADIUS = 50;
var ENEMY_DELAY_MAX = -300;
var ENEMY_DELAY_MIN = -50;
var ENEMY_NUMBER = 3;
var ENEMY_SPEED_MAX = 200;
var ENEMY_SPEED_MIN = 50;
var ENEMY_Y_MIN = 50;
var ENEMY_Y_MAX = 250;

var ENEMY_ROCK_NUMBER = 1;
var ENEMY_ROCK_SPEED_FACTOR = 1.5;
var ENEMY_ROCK_COLLISION_RADIUS = 70;

var LEVELUP_ACCELERATION_FACTOR = 1.1;
var LEVELUP_ACCELERATION_PROBABILITY = 0.4;
var LEVELUP_NEW_ENEMY_PROBABILITY = 0.2;
var LEVELUP_NEW_ROCK_PROBABILITY = 0.1;
var LEVELUP_GEM_O_PROBABILITY = 0.15;
var LEVELUP_GEM_B_PROBABILITY = 0.1;
var LEVELUP_GEM_G_PROBABILITY = 0.3;
var LEVELUP_HEART_PROBABILITY = 0.1;

var PLAYER_LIVES = 3;   // starting # of lives
var PLAYER_START_X = 200;   // start position
var PLAYER_START_Y = 430;   // start position
var PLAYER_STEP = 30;   // step length
var PLAYER_WATER_POINTS = 100;    // points for reaching Top

var BONUS_COLLISION_RADIUS = 50;    // closeness for Power-Ups
var BONUS_SLOWDOWN_FACTOR = 0.9;    // how slow bugs get from Gem-Green
var BONUS_X_MIN = 0;
var BONUS_X_MAX = CANVAS_WIDTH - 100;
var BONUS_Y_MIN = ENEMY_Y_MIN;
var BONUS_Y_MAX = ENEMY_Y_MAX;
var BONUS_GEM_POINTS = 10; //points for getting Gems

var gameState = "BeforeGame";
var playerSprite = 'images/char-boy.png';   //Default character

/**
* @class
* @description
* @param {string} sprite
* @param {number} x
* @param {number} y
* @param {number} speed
* @param {string} type
*/
// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = Math.random() * (ENEMY_DELAY_MAX - ENEMY_DELAY_MIN) + ENEMY_DELAY_MIN;
    this.y = Math.random() * (ENEMY_Y_MAX - ENEMY_Y_MIN) + ENEMY_Y_MIN;
    this.speed = Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN) + ENEMY_SPEED_MIN;
    this.type = "Bug";
};

/**
* @function
* @description
* @param {number} factor
*/
Enemy.prototype.accelerate = function(factor) {
  this.speed *= factor;
};

/**
* @function
* @description
*/
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
* @function
* @description
* @param {number} dt
*/
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = (this.x + 100 + (this.speed * dt) ) % (CANVAS_WIDTH + 150) - 100;
//manage movement
    if ( Math.sqrt( Math.pow((this.x - player.x),2) + Math.pow((this.y - player.y),2) ) < ENEMY_COLLISION_RADIUS ) {
      player.collision();
    }
};

/**
* @description
* @class
* @param {number} direction
*/
var EnemyRock = function() {
  Enemy.call(this);
  this.sprite = 'images/Rock.png';
  this.direction = -1;
  this.speed *= ENEMY_ROCK_SPEED_FACTOR;
  this.type = "Flying Rock";
};

EnemyRock.prototype = Object.create(Enemy.prototype);
EnemyRock.prototype.constructor = EnemyRock;
/**
* @function
* @description
*/
EnemyRock.prototype.update = function(dt) {
  this.x = (this.x + 100 + (this.speed * dt * this.direction) ) % (CANVAS_WIDTH + 150) - 100 ;

  //turn left
  if ( (this.direction == 1) && (this.x > CANVAS_WIDTH)) {
    this.direction = -1;
    this.y = Math.random() * (ENEMY_Y_MAX - ENEMY_Y_MIN) + ENEMY_Y_MIN;
    this.sprite = 'images/Rock.png';
  }

//turn right
  if ( (this.direction == -1) && (this.x < -100)) {
        this.direction = 1;
        this.y = Math.random() * (ENEMY_Y_MAX - ENEMY_Y_MIN) + ENEMY_Y_MIN;
        this.sprite = 'images/Rock.png';
  }

  //collision
  if ( Math.sqrt( Math.pow((this.x - player.x),2) + Math.pow((this.y - player.y),2) ) < ENEMY_ROCK_COLLISION_RADIUS ) {
    player.collision();
  }
};

/**
* @description Player class
* @class
* @param {string} sprite
* @param {number} x
* @param {number} y
* @param {number} points
* @param {string} lives
*/
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
  this.sprite = playerSprite;
  this.x = PLAYER_START_X;
  this.y = PLAYER_START_Y;
  this.points = 0;
  this.lives = PLAYER_LIVES;
};
/**
* @function
* @description In case of collision with an enemy - move player to initial position and decrease his lives
*/
Player.prototype.collision = function() {
  this.x = PLAYER_START_X;
  this.y = PLAYER_START_Y;
  this.lives -= 1;
};
/**
* @function
* @description Manage what's happening when player grabs benefits
*/
Player.prototype.grab = function(bonus) {
  // Apply benefit profit:
  bonus.makeProfit();
  // Delete benefit:
  var len = allBonus.length;
  for (i=0; i<len; i++) {
    if ((allBonus[i].x == bonus.x) && (allBonus[i].y == bonus.y)) {
      allBonus.splice(i,1);
      return 0;
    }
  }
};

/**
* @function
* @description Handles the input from keyboard. Manage player's movements and collision w/borders
* @param {number} key
*/
Player.prototype.handleInput = function(key) {
  if ( (key=="left") && (this.x - PLAYER_STEP > -25) ) {
    this.x -= PLAYER_STEP;
  }
  if ( (key=="right") && (this.x + PLAYER_STEP < CANVAS_WIDTH - 70) ) {
    this.x += PLAYER_STEP;
  }
  if ( (key=="down") && (this.y + PLAYER_STEP < PLAYER_START_Y) ) {
    this.y += PLAYER_STEP;
  }
  if (key=="up") {
    this.y -= PLAYER_STEP;
  }
};
/**
* @function
* @description Draw player on screen
*/
Player.prototype.render = function() {
  ctx.font = "15pt Verdana";
  ctx.fillStyle = "snow";
  ctx.fillText("Points: " + this.points, 4, 75);
  ctx.fillStyle = "red";
  ctx.font = "bold 15pt Verdana";
  ctx.fillText("Lives: " + this.lives, 4, 105);
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
/**
* @function
* @description Manage players lives and effects when player reaches water
*/
Player.prototype.update = function() {
  function chooseRandomItem(probabilityList) {
    var tmp = Math.random();
    var sum = 0;
    var len = probabilityList.length;
    var i = 0;
    while ((sum < tmp) && (i < len)) {
      sum += probabilityList[i];
      i++;
    }
    return i-1;
  }

  //If player reaches top water
  if (this.y < 10) {
    //Move char to start & add points
    this.x = PLAYER_START_X;
    this.y = PLAYER_START_Y;
    this.points += PLAYER_WATER_POINTS;


    var negative = chooseRandomItem([
      LEVELUP_ACCELERATION_PROBABILITY,
      LEVELUP_NEW_ENEMY_PROBABILITY,
      LEVELUP_NEW_ROCK_PROBABILITY,
      1
    ]);
    switch (negative) {
      case 0: //accel enemies
              var len = allEnemies.length;
              for (var i = 0; i < len; i++) {
                allEnemies[i].accelerate(LEVELUP_ACCELERATION_FACTOR);
              }
              break;
      case 1: //add new enemy
              allEnemies.push(new Enemy());
              break;
      case 2: //add new master bugs
              allEnemies.push(new EnemyRock());
              break;
    }

    //Add bonuses
    var positive = chooseRandomItem([
      LEVELUP_GEM_O_PROBABILITY,
      LEVELUP_GEM_B_PROBABILITY,
      LEVELUP_GEM_G_PROBABILITY,
      LEVELUP_HEART_PROBABILITY,
      1
    ]);
    switch (positive) {
          case 0: //add orange gem
                  allBonus.push(new BonusGemOrange());
                  break;
          case 1: //add green gem
                  allBonus.push(new BonusGemGreen());
                  break;
          case 2: //add heart
                  allBonus.push(new BonusHeart());
                  break;
          case 3: //add blue gem
                  allBonus.push(new BonusGemBlue());
                  break;
    }
  }

  if (this.lives < 1) {
    gameState = "AfterGame";
  }
};
/**
* @description Basic bonus (gems/heart) class.
* @class
* @param {string} sprite
* @param {number} x
* @param {number} y
*/
var Bonus = function() {
  this.sprite = 'images/Heart.png';
  this.x = Math.random() * (BONUS_X_MAX - BONUS_X_MIN) + BONUS_X_MIN;
  this.y = Math.random() * (BONUS_Y_MAX - BONUS_Y_MIN) + BONUS_Y_MIN;
};
/**
* @function
* @description Draw bonus on the screen
*/
Bonus.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 80, 140);
};
/**
* @function
* @description Manage collision
*/
Bonus.prototype.update = function() {
  if ( Math.sqrt( Math.pow((this.x - player.x),2) + Math.pow((this.y - player.y),2) ) < BONUS_COLLISION_RADIUS ) {
    player.grab(this);
  }
};

/**
* @description Subclass of "Benefit". Used to create blue gems
* @class
*/
BonusGemBlue = function() {
  Bonus.call(this);
  this.sprite = 'images/Gem Blue.png';
};

BonusGemBlue.prototype = Object.create(Bonus.prototype);
BonusGemBlue.prototype.constructor = BonusGemBlue;
BonusGemBlue.prototype.makeProfit = function() {
    player.points += 10;
  // delete first EnemyMaster if it exists. Else - nothing
  var len = allEnemies.length;
  for (i=0; i<len; i++) {
    if (allEnemies[i].type == "Flying Rock") {
      allEnemies.splice(i,1);
      return 0;
    }
  }
};
/**
* @description Green Gem
* @class
*/
var BonusGemGreen = function() {
  Bonus.call(this);
  this.sprite = 'images/Gem Green.png';
};

BonusGemGreen.prototype = Object.create(Bonus.prototype);
BonusGemGreen.prototype.constructor = BonusGemGreen;
BonusGemGreen.prototype.makeProfit = function() {
    player.points += 10;
  //slowdown all bugs
  var len = allEnemies.length;
  for (i=0; i<len; i++) {
    allEnemies[i].accelerate(BONUS_SLOWDOWN_FACTOR);
  }
};
/**
* @description Orange gems
* @class
*/
BonusGemOrange = function() {
  Bonus.call(this);
  this.sprite = 'images/Gem Orange.png';
};

BonusGemOrange.prototype = Object.create(Bonus.prototype);
BonusGemOrange.prototype.constructor = BonusGemOrange;
BonusGemOrange.prototype.makeProfit = function() {
    player.points += 10;
  var len = allEnemies.length;
  for (i=0; i<len; i++) {
    console.log(allEnemies[i].type);
    if (allEnemies[i].type == "Bug") {
      allEnemies.splice(i,1);
      return 0;
    }
  }
};
/**
* @description Hearts
* @class
*/
var BonusHeart = function() {
  Bonus.call(this);
  this.sprite = 'images/Heart.png';
};

BonusHeart.prototype = Object.create(Bonus.prototype);
BonusHeart.prototype.constructor = BonusHeart;
BonusHeart.prototype.makeProfit = function() {
  //add extra Life
  player.lives += 1;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
for (var i = 0; i < ENEMY_NUMBER; i++) {
  allEnemies.push(new Enemy());
}

for (var i = 0; i < ENEMY_ROCK_NUMBER; i++) {
  allEnemies.push(new Enemy());
}

var player = new Player();

var allBonus = [];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
