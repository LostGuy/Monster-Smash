//Monster Object
var monster =
{
	IMAGE: "../images/monsterTileSheet.png",
	SIZE: 128,
	COLUMNS: 3,
	
	numberOfFrames: 5,
	currentFrame: 0,
	forward: true,
	
	sourceX : 0,
	sourceY : 0,
	
	HIDING: 0,
	JUMPING: 1,
	HIT: 2,
	state: this.HIDING,
	
	waitTime: undefined,
	
	timeToReset: 9,
	resetCounter: 0,
	
	findWaitTime: function()
	{
		this.waitTime = Math.ceil(Math.random()* 60);
	},
	
	updateAnimation: function()
	{
		this.sourceX = Math.floor(this.currentFrame % this.COLUMNS) * this.SIZE;
		this.sourceY = Math.floor(this.currentFrame / this.COLUMNS) * this.SIZE;
		
		if(this.state !== this.HIT)
		{
			if(this.waitTime > 0 || this.waitTime === undefined)
			{
				this.state = this.HIDING;
			}
			else
			{
				this.state = this.JUMPING;
			}
		}	
		
		switch(this.state)
		{
			case this.HIDING:
				this.currentFrame = 0;
				this.waitTime--;
				break;
			
			case this.JUMPING:
				if(this.currentFrame === this.numberOfFrames)
				{
					this.forward = false;
				}
				
				if(this.currentFrame === 0 && this.forward === false)
				{
					this.forward = true;
					this.findWaitTime();
					this.state = this.HIDING;
					break;
				}
				
				if(this.forward)
				{
					this.currentFrame++;
				}
				else
				{
					this.currentFrame--;
				}
				break;
				
			case this.HIT:
				this.currentFrame = 6;
				
				this.resetCounter++;
				
				if(this.resetCounter === this.timeToReset)
				{
					this.state = this.HIDING;
					this.forward = true;
					this.currentFrame = 0;
					this.resetCounter = 0;
					this.findWaitTime();
				}
				break;
			
		}
	}
};
var stage = document.querySelector("#stage");

//Arrays for map
var monsterObjects = [];
var monsterCanvases = [];
var monsterDrawingSurfaces = [];

//Game Variables
var monstersHit = 0;
var highScore = 0;
var gameOver = false;
var gameTimer =
{
	time: 0,
	interval: undefined,
	
	start: function()
	{
		var self = this;
		this.interval = setInterval(function(){self.tick();}, 1000)
	},
	tick: function()
	{
		this.time--;
	},
	stop: function()
	{
		clearInterval(this.interval);
	},
	reset: function()
	{
		this.time = 0;
	}
};
var song = new Audio("../audio/monsterMash.mp3");
song.loop = true;

var hitSound = new Audio("../audio/punch.wav");

var output = document.querySelector("#output");


//Map Variables
var ROWS = 3;
var COLUMNS = 4;
var SIZE = monster.SIZE;
var SPACE = 10;

var canvas = document.querySelector("canvas");
var drawingSurface = canvas.getContext("2d");
var button = document.querySelector("button");
var basicsDone = false;

var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "../images/" + monster.IMAGE;

canvas.addEventListener("mousedown", mousedownHandler, false);

//Loads
function loadHandler()
{
	//Only starts the song once
	if(!basicsDone)
	{
		song.play();
		basicsDone = true;
	}
	buildMap();
	
	gameTimer.time = 60;
	gameTimer.start();
	monster.findWaitTime();
	updateAnimation();
	button.removeEventListener("click", clickHandler, false);
	button.disabled = true;
	
	//Game timer

}

//Build Map
function buildMap()
{
	for( var row = 0; row < ROWS; row ++)
	{
		for( var column = 0; column < COLUMNS; column ++)
		{
			//Monster
			var newMonsterObject = Object.create(monster);
			newMonsterObject.findWaitTime();
			monsterObjects.push(newMonsterObject);
			
			//Canvas
			var canvas = document.createElement("canvas");
			canvas.setAttribute("width", SIZE);
			canvas.setAttribute("height", SIZE);
			stage.appendChild(canvas);
			canvas.style.top = row * (SIZE + SPACE) + "px";
			canvas.style.left = column * (SIZE + SPACE) + "px";
			canvas.addEventListener("mousedown", mousedownHandler, false);
			monsterCanvases.push(canvas);
			
			//DrawingSurface
			var drawingSurface = canvas.getContext("2d");
			monsterDrawingSurfaces.push(drawingSurface);			
		}
	}
}

//Animation
function updateAnimation()
{
	if(gameTimer.time > 0)
	{
		setTimeout(updateAnimation, 120);
	}
	
	for(var i = 0; i < monsterObjects.length; i++)
	{
		monsterObjects[i].updateAnimation();
	}
	
	if(gameTimer.time === 0)
	{
		endGame();
	}
	
	render();
}

//Mouse
function mousedownHandler(event)
{
	var theCanvasThatWasClicked = event.target;
	
	for(var i = 0; i < monsterCanvases.length; i++)
	{
		if(monsterCanvases[i] === theCanvasThatWasClicked)
		{
			var monster = monsterObjects[i];
			
			if(monster.state === monster.JUMPING)
			{
				monster.state = monster.HIT;
				monstersHit++;
				var hitSound = new Audio("../audio/punch.wav");
				hitSound.play();
			}
		}
	}
}

function render()
{
	for(var i = 0; i < monsterObjects.length; i++)
	{
		var monster = monsterObjects[i];
		var drawingSurface = monsterDrawingSurfaces[i];
		
		drawingSurface.clearRect(0, 0, SIZE, SIZE);
		
		drawingSurface.drawImage
		(
			image,
			monster.sourceX, monster.sourceY, SIZE, SIZE,
			0, 0, SIZE, SIZE
		);
	}
	
	output.innerHTML = "Monsters Smashed: " + monstersHit + 
	"<br>" + "Time Left: " + gameTimer.time + "<br>" +
	"High Score: " + highScore;
	
	//Updates the output based on the final score
	if(gameOver)
	{
		if(monstersHit > highScore)
		{
			highScore = monstersHit;
			output.innerHTML = "Monsters Smashed: " + monstersHit + 
			"<br>" + "Time Left: " + gameTimer.time + "<br>" +
			"High Score: " + highScore + "<br>" + "You got a new High Score!";
		}
		
		else if (monstersHit < highScore)
		{
			output.innerHTML = "Monsters Smashed: " + monstersHit + 
			"<br>" + "Time Left: " + gameTimer.time + "<br>" +
			"High Score: " + highScore + "<br>" + "Not your best.";
		}
		
		else
		{
			output.innerHTML = "Monsters Smashed: " + monstersHit + 
			"<br>" + "Time Left: " + gameTimer.time + "<br>" +
			"High Score: " + highScore + "<br>" + "You tied your best.";
		}
		//Allows the button to be usable for restarting the game.
		button.addEventListener("click", clickHandler, false);
		button.disabled = false;
		
	}
}

//Restarts the game
function clickHandler()
{
	loadHandler();
	monstersHit = 0;
	gameOver = false;
}

function endGame()
{
	gameTimer.stop();
	
	for (var i = 0; i < monsterCanvases.length; i++)
	{

		var canvas = monsterCanvases[i];
		canvas.removeEventListener("mousedown", mousedownHandler, false);
		gameOver = true;
	}
}