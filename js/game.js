//DO: popup new window for full screen
//DO: type paragraphs

const symbols = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ",
                 "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת", "ך", "ף", "ן", "ץ", "ם"];

//Hebrew keys
const ROW_1_H = ["/", "'", "ק", "ר", "א", "ט", "ו", "ן", "ם", "פ", "", ""];
const ROW_2_H = ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף", ","];
const ROW_3_H = ["ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ", "."];

//English keys
const ROW_1_E = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"];
const ROW_2_E = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"];
const ROW_3_E = ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"];

const HEBREW_KEYCODE_OFFSET = 1416;

var GAME_HEIGHT = Math.round(window.innerHeight / 1.02); //Subject to change
var GAME_WIDTH = Math.round(GAME_HEIGHT * (6 / 5)); //Subject to change
var UPDATE_DELAY = 40; //in milliseconds

var WORD_LENGTH_FACTOR = Number(findGetParameter("len")) || .95; //Higher means longer words (just a tendency)
var EASY_MODE = bool(findGetParameter("easy") || false); //Only use stop words
var HELP_MODE = bool(findGetParameter("help") || true); //Only highlight correct letters
var HIGHLIGHT_MODE = bool(findGetParameter("hlight") || true); //Highlight the currently pressed key
var TIME = Number(findGetParameter("time") || 0); //Time in seconds for each word

var res = "assets/txt/treeencoded.json";
var wordsLoaded = false;
var bodyReady = false;
var words = null;
var mutex = false;
var goal = "";
var nextGoal = "";
var pressed = "";

var level = 0;
var inputTooLong = null;
var clearPressed = null;

var timeLeft = TIME;

function getWords()
{
	//We are testing locally so we can't ajax it
	//For now just load in the data
	
	$.post(res, function(data) {
		//console.log("sucess");
		words = data;
		wordsLoaded = true;
		if (bodyReady) runGame();
	});
  
}

getWords();

//Run the game after the document body is ready
window.onload = function() {
	bodyReady = true;
	if (wordsLoaded) runGame();
};

function runGame()
{
	if (mutex) return "Another branch has already reached here.";
	mutex = true;

	document.getElementById('loadingDialog').style.display = "none";
	
	//Set up canvas
	var game = document.getElementById('game');
	game.style.display = "initial";
	game.width = GAME_WIDTH;
	game.height = GAME_HEIGHT;
	
	//Get graphics 2d context
	var g = game.getContext("2d");
	g.translate(-0.5, 0.5); //Remove graying of lines due to anti-aliasing on non-half px coords
	
	var score = 0;
	var wrong = 0;
	
	var input = "";
	window.addEventListener("keypress", function(e) {
		var code = e.which || e.keyCode || e.charCode || e.keyIdentifier;
		var glyph = String.fromCharCode(code);
		
		if (code >= 39 && code <= 122) //English chars
		{
			//Convert to Hebrew
			glyph = (function(glyph) {
				glyph = glyph.toUpperCase();
				var c = "";
				var loc = -1;
				if ((loc = ROW_1_E.indexOf(glyph)) > -1)
				{
					c = ROW_1_H[loc];
				}
				if ((loc = ROW_2_E.indexOf(glyph)) > -1)
				{
					c = ROW_2_H[loc];
				}
				if ((loc = ROW_3_E.indexOf(glyph)) > -1)
				{
					c = ROW_3_H[loc];
				}
				return c;
			})(glyph);
		}
		
		pressed = glyph;
		
		clearPressed = function() {
			pressed = "";
		};
		
		if (code == 8) //Backspace
		{
			e.preventDefault();
			if (input.length > 0)
			{
				input = input.substring(0, input.length - 1);
			}
		}
		
		inputTooLong = function() {
			input = input.substring(0, input.length - 1);
		}
		
		if (symbols.indexOf(glyph) > -1) //User typed a Hebrew key
		{
			input += glyph;
			e.preventDefault();
		}
		
		if (code == 32) //Space
		{
			submitWord(e);
		}
	});
	
	function submitWord(e)
	{
		if (e)
			e.preventDefault();
		timeLeft = TIME;
		//Submit word
		if (input == goal)
		{
			//Correct
			score++;
			for (var j = 0; j < goal.length; j++)
			{
				var glyph = goal[j];
				$.post("php/progress.php", { letter: (symbols.indexOf(glyph) + 1) } );
				if (TIME < 7 && TIME != 0)
				{
					console.log("bonus?");
					$.post("php/progress.php", { letter: (symbols.indexOf(glyph) + 1) } );
				}
				if (!HELP_MODE && !HIGHLIGHT_MODE && WORD_LENGTH_FACTOR > .9)
				{
					console.log("bonus2");
					$.post("php/progress.php", { letter: (symbols.indexOf(glyph) + 1) } );
				}
			}
		}
		else
		{
			//Wrong
			wrong++;
		}
		goal = nextGoal;
		nextGoal = chooseWord(letters, words);
		while (nextGoal == "" || nextGoal.length < 3)
		{
			nextGoal = chooseWord(letters, words);
		}
		//console.log("WORD ", goal);
		input = "";
		timeLeft = TIME;
	}
	
	window.addEventListener("keyup", function() {
		if (clearPressed)
		{
			clearPressed();
		}
	});
	
	//Choose Words
	const levels = ["כעיח", "גל", "דך", "שף", "קן", "רו", "אט", "םפ", "סת", "בצ", "זץ", "המנ"];
	var letters = symbols.toString();
	
	goal = chooseWord(letters, words);
	while (goal == "" || goal.length < 3)
	{
		goal = chooseWord(letters, words);
	}
	
	//console.log("WORD ", goal);
	
	nextGoal = chooseWord(letters, words);
	while (nextGoal == "" || nextGoal.length < 3)
	{
		nextGoal = chooseWord(letters, words);
	}
	
	if (TIME > 0)
	{
		var tick = setInterval(function() {
			timeLeft--;
			if (timeLeft < 0)
			{
				timeLeft = TIME;
				submitWord(null);
			}
		}, 1000);
	}
	var graphicsUpdate = setInterval(function() {draw(g, input, goal, nextGoal, score, wrong, pressed)}, UPDATE_DELAY);
}

function btwn(a, b)
{
	return Math.floor((Math.random() * (b + 1)) + a);
}

function chooseWord(priority, words)
{
	var found = false;
	var node = words;
	var tried = [];
	var word = "";
	while (!found)
	{
		if (node != null && (node.end && (Math.random() > WORD_LENGTH_FACTOR || node.children.length == 0)))
		{
			found = true;
		}
		else
		{
			var l = btwn(0, priority.length - 1);
			var tempNode = node;
			node = find(priority.charAt(l), node);
			//console.log(node, l, priority.charAt(l));
			if (node == null)
			{
				if (tried.indexOf(priority.charAt(l)) == -1)
				{
					tried.push(priority.charAt(l));
				}
				if (tried.length == priority.length) //We tried em all
				{
					if (priority.length == symbols.length)
					{
						alert("Training Session Over");
					}
					else
					{
						//console.log("temporary node", tempNode);
						var last = chooseWord(symbols.toString(), tempNode);
						//console.log("COMPONENETS:", word, last)
						return word + last;
					}
				}
				node = tempNode;
				continue;
			}
			else
			{
				word += node.data;
			}
			//console.log("WORD SO FAR", word);
		}
	}
	//console.log("UP A LEVEL");
	return word;
}

function find(letter, node)
{
	for (var i = 0; i < node.children.length; i++)
	{
		if (node.children[i].data == letter)
		{
			return node.children[i];
		}
	}
	return null;
}

function draw(g, input, goal, nextGoal, score, wrong, pressed)
{
	/*Reset*/
	g.beginPath();
	g.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	
	drawInput(g, input);
	drawKeyboard(g, goal, pressed);
	drawGoal(g, goal, nextGoal);
	drawScore(g, score, wrong);
	if (TIME > 0)
		drawTimer(g);
	
	//Apply lines
	g.stroke();
}

function drawTimer(g)
{
	var LENGTH = Math.round(GAME_WIDTH / 8);
	var HEIGHT = LENGTH * 2;
	var X = Math.round((GAME_WIDTH / 2) - (LENGTH / 2));
	var Y = Math.round((GAME_HEIGHT / 25));
	g.fillStyle = "gray";
	g.fillRect(X, Y + (HEIGHT - (HEIGHT * (timeLeft / TIME))), LENGTH, HEIGHT * (timeLeft / TIME));
	g.fillStyle = "black";
}

function drawGoal(g, goal)
{
	var FONT_SIZE = Math.round(GAME_WIDTH / 16);
	var X = Math.round((GAME_WIDTH / 2));
	var Y = Math.round(4 * (GAME_HEIGHT / 9));
	
	var calc = document.getElementById('hiddenWidthCalculation');
	calc.style.fontSize = FONT_SIZE + "px";
	calc.style.fontFamily = "'Alef', sans-serif";
	calc.innerHTML = goal;
	var TEXT_WIDTH = (calc.clientWidth + 1);
	calc.innerHTML = nextGoal;
	var TEXT_WIDTH_2 = (calc.clientWidth + 1);
	
	g.font = FONT_SIZE + "px Alef";
	g.fillText(goal, X - TEXT_WIDTH / 2, Y);
	g.fillStyle = "gray";
	g.fillText(nextGoal, X - (TEXT_WIDTH / 2) - TEXT_WIDTH_2 - FONT_SIZE, Y);
	g.fillStyle = "black";
}

function drawScore(g, score, wrong)
{
	var FONT_SIZE = Math.round(GAME_WIDTH / 32);
	var X = Math.round((GAME_WIDTH / 80));
	var Y = Math.round((GAME_HEIGHT / 25));
	
	g.font = FONT_SIZE + "px Alef";
	g.fillText("Score: " + score, X, Y);
	g.fillText("Missed: " + wrong, X, Y + FONT_SIZE);
}

function drawInput(g, input)
{
	var FONT_SIZE = Math.round(GAME_WIDTH / 16);
	var Y_OFFSET = Math.round(FONT_SIZE * .82);
	var LENGTH = Math.round(FONT_SIZE * 8);
	var HEIGHT = Math.round(FONT_SIZE * 1.2);
	var X = Math.round((GAME_WIDTH / 2) - (LENGTH / 2));
	var Y = Math.round(7.2 * (GAME_HEIGHT / 11) - (HEIGHT / 2));
	
	//g.rect(X, Y, LENGTH, HEIGHT);
	g.moveTo(X, Y + HEIGHT);
	g.lineTo(X + LENGTH, Y + HEIGHT);
	
	var calc = document.getElementById('hiddenWidthCalculation');
	calc.style.fontSize = FONT_SIZE + "px";
	calc.style.fontFamily = "'Alef', sans-serif";
	calc.innerHTML = input;
	var TEXT_WIDTH = (calc.clientWidth + 1);
	
	var X_OFFSET = Math.round(LENGTH - TEXT_WIDTH - FONT_SIZE * .2);
	
	if (TEXT_WIDTH > LENGTH)
	{
		if (inputTooLong)
		{
			inputTooLong();
		}
	}
	else
	{
		g.font = FONT_SIZE + "px Alef";
		g.fillText(input, X + X_OFFSET, Y + Y_OFFSET); //"!\u200f" is the rtl mark
	}
}

function drawKeyboard(g, goal, pressed)
{
	var KEY_SIZE = Math.round(GAME_WIDTH / 16);
	var FONT_SIZE_H = Math.round(KEY_SIZE / 1.7);
	var FONT_SIZE_E = Math.round(FONT_SIZE_H / 2.5);
	var KEY_SPACING = Math.round(KEY_SIZE / 4.5);
	var ROW_OFFSET = KEY_SPACING;
	var TOTAL_HEIGHT = (3 * KEY_SIZE) + (2 * KEY_SPACING)
	var TOTAL_WIDTH = (12 * KEY_SIZE) + (11 * KEY_SPACING)//Applies unless ROW_OFFSET is big enough that one of the second two rows is the longest
	var START_X = Math.round((GAME_WIDTH - TOTAL_WIDTH) / 2); //Center it
	var START_Y = Math.round(GAME_HEIGHT - TOTAL_HEIGHT - KEY_SPACING); //Sticky near bottom
	
	var GLYPH_H_X_OFFSET = Math.round((KEY_SIZE / 2) + (FONT_SIZE_H / 7));
	var GLYPH_H_Y_OFFSET = Math.round((KEY_SIZE / 2) + (FONT_SIZE_H / 3));
	
	var GLYPH_E_X_OFFSET = Math.round((KEY_SIZE / 13) + FONT_SIZE_E);
	var GLYPH_E_Y_OFFSET = Math.round(FONT_SIZE_E);
	
	//Notches on F and J
	var NOTCH_LENGTH = KEY_SIZE / 5;
	
	var currentX = START_X - KEY_SPACING;
	var currentY = START_Y;
	
	g.lineWidth = 1;
	g.strokeStyle = "#000000";
	
	//First row
	for (var i = 0; i < 12; i++)
	{
		g.rect(currentX + KEY_SPACING, currentY, KEY_SIZE, KEY_SIZE);
		
		var glyph = ROW_1_H[i];
		
		if (glyph == pressed && pressed != "" && HIGHLIGHT_MODE) //Highlight the currently pressed key
		{
			g.fillStyle = "rgba(255, 200, 0, 0.75)";
			g.fillRect(currentX + KEY_SPACING + 1, currentY + 1, KEY_SIZE - 2, KEY_SIZE - 2);
			g.fillStyle = "#000000";
		}
		
		if (HELP_MODE && (goal.indexOf(glyph) == -1 || glyph == ""))
		{
			g.fillStyle = "gray";
		}
		
		g.font = FONT_SIZE_H + "px Alef";
		g.fillText(glyph, currentX + GLYPH_H_X_OFFSET, currentY + GLYPH_H_Y_OFFSET); 
		
		glyph = ROW_1_E[i];
		g.font = FONT_SIZE_E + "px sans-serif";
		g.fillText(glyph, currentX + GLYPH_E_X_OFFSET, currentY + GLYPH_E_Y_OFFSET);
		
		currentX += KEY_SPACING + KEY_SIZE;
		g.fillStyle = "black";
	}
	
	//Second row
	currentY += KEY_SPACING + KEY_SIZE;
	currentX = START_X - KEY_SPACING + ROW_OFFSET;
	for (var i = 0; i < 11; i++)
	{
		g.rect(currentX + KEY_SPACING, currentY, KEY_SIZE, KEY_SIZE);
		
		var glyph = ROW_2_H[i];
		
		if (glyph == pressed && pressed != "" && HIGHLIGHT_MODE) //Highlight the currently pressed key
		{
			g.fillStyle = "rgba(255, 200, 0, 0.75)";
			g.fillRect(currentX + KEY_SPACING + 1, currentY + 1, KEY_SIZE - 2, KEY_SIZE - 2);
			g.fillStyle = "#000000";
		}
		
		if (HELP_MODE && goal.indexOf(glyph) == -1)
		{
			g.fillStyle = "gray";
		}
		
		g.font = FONT_SIZE_H + "px Alef";
		g.fillText(glyph, currentX + GLYPH_H_X_OFFSET, currentY + GLYPH_H_Y_OFFSET);
		
		glyph = ROW_2_E[i];
		g.font = FONT_SIZE_E + "px sans-serif";
		g.fillText(glyph, currentX + GLYPH_E_X_OFFSET, currentY + GLYPH_E_Y_OFFSET);
		
		//Notches on F and J
		
		if (i == 3 || i == 6)
		{
			g.moveTo(currentX + KEY_SPACING + (KEY_SIZE - NOTCH_LENGTH) / 2, currentY + (9 * KEY_SIZE / 10))
			g.lineTo(NOTCH_LENGTH + currentX + KEY_SPACING + (KEY_SIZE - NOTCH_LENGTH) / 2, currentY + (9 * KEY_SIZE / 10));
		}
		
		currentX += KEY_SPACING + KEY_SIZE;
		g.fillStyle = "black";
	}
	
	//Third row
	currentY += KEY_SPACING + KEY_SIZE;
	currentX = START_X - KEY_SPACING + (3 * ROW_OFFSET);
	for (var i = 0; i < 10; i++)
	{
		g.rect(currentX + KEY_SPACING, currentY, KEY_SIZE, KEY_SIZE);
		
		var glyph = ROW_3_H[i];
		
		if (glyph == pressed && pressed != "" && HIGHLIGHT_MODE) //Highlight the currently pressed key
		{
			g.fillStyle = "rgba(255, 200, 0, 0.75)";
			g.fillRect(currentX + KEY_SPACING + 1, currentY + 1, KEY_SIZE - 2, KEY_SIZE - 2);
			g.fillStyle = "#000000";
		}
		
		if (HELP_MODE && goal.indexOf(glyph) == -1)
		{
			g.fillStyle = "gray";
		}
		
		g.font = FONT_SIZE_H + "px Alef";
		g.fillText(glyph, currentX + GLYPH_H_X_OFFSET, currentY + GLYPH_H_Y_OFFSET);
		
		glyph = ROW_3_E[i];
		g.font = FONT_SIZE_E + "px sans-serif";
		g.fillText(glyph, currentX + GLYPH_E_X_OFFSET, currentY + GLYPH_E_Y_OFFSET);
		
		currentX += KEY_SPACING + KEY_SIZE;
		g.fillStyle = "black";
	}
}

window.addEventListener("resize", function() {
	GAME_HEIGHT = Math.round(window.innerHeight / 1.025); //Subject to change
	GAME_WIDTH = Math.round(GAME_HEIGHT * (6 / 5)); //Subject to change
	var game = document.getElementById('game');
	game.width = GAME_WIDTH;
	game.height = GAME_HEIGHT;
	var g = game.getContext("2d");
	g.translate(-0.5, 0.5);
});

function findGetParameter(parameterName)
{
    var result = null;
    var keyval = [];
    var items = location.search.substr(1).split("&"); //After ?, split by &
    for (var i = 0; i < items.length; i++) {
        keyval = items[i].split("=");
        if (keyval[0] == parameterName)
		{
			result = decodeURIComponent(keyval[1]);
		}
    }
    return result;
}

function bool(st)
{
	if (st === "true") return true;
	if (st === "false") return false;
	return st;
}