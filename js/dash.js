const symbols = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ",
                 "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת", "ך", "ף", "ן", "ץ", "ם"];

angular.module("Dash", [])
	.controller("Letters", ["$scope", function($scope) {
		$scope.letters = [];
		//Get progress from sync request since our progress bar depends on this value
		$.ajax({url: 'php/getprog.php', method: 'GET', async: false, success: function(data) {
			var prog = JSON.parse(data);
			for (var i = 0; i < symbols.length; i++)
			{
				var let = new Letter(symbols[i], prog[i]);
				$scope.letters.push(let);
			}
		}});
		$scope.select = function(ind) {
			for (var i = 0; i < $scope.letters.length; i++) {
				if (i == ind)
				{
					$scope.letters[i].selected = true;
					document.getElementById(i).setAttribute('selected', 'yes');
					displayData($scope.letters[i]);
				}
				else
				{
					$scope.letters[i].selected = false;
					document.getElementById(i).setAttribute('selected', 'no');
				}
			}
		}
		
		$(document).ready(function() {
			$scope.select(0);
		});
	}])
	.filter("percent", function() {
		return function(input) {
			return input + "%";
		}
	});
	

function Letter(symbol, prog)
{
	this.glyph = symbol;
	this.progress = prog;
	this.selected = true;
}

function displayData(letter)
{
	console.log(letter);
	document.getElementsByClassName("bar")[0].style.width = (letter.progress) + "%";
	var img = document.getElementById('medal');
	if (letter.progress > 60)
	{
		img.src = "assets/png/goldmedal.png";
	}
	else if (letter.progress > 20)
	{
		img.src = "assets/png/silverstar.png";
	}
	else
	{
		img.src = "assets/png/bronzestar.png"
	}
	
	var a = document.getElementById('a');
	var b = document.getElementById('b');
	var c = document.getElementById('c');
	var d = document.getElementById('d');
	var e = document.getElementById('e');
	var f = document.getElementById('f');
	
	a.style.display = "none";
	b.style.display = "none";
	c.style.display = "none";
	d.style.display = "none";
	e.style.display = "none";
	f.style.display = "none";
	
	if (letter.progress < 8)
	{
		b.style.display = "inline-block";
		f.style.display = "inline-block";
	}
	if (letter.progress >= 8 && letter.progress < 16)
	{
		f.style.display = "inline-block";
		c.style.display = "inline-block";
	}
	if (letter.progress >= 16 && letter.progress < 32)
	{
		c.style.display = "inline-block";
		d.style.display = "inline-block";
	}
	if (letter.progress >= 32 && letter.progress < 58)
	{
		a.style.display = "inline-block";
		c.style.display = "inline-block";
	}
	if (letter.progress >= 58 && letter.progress < 86)
	{
		a.style.display = "inline-block";
		e.style.display = "inline-block";
	}
}

function g(uri)
{
	var params = ['height=' + screen.height, 'width=' + screen.width, 'fullscreen=yes', "directories=no", "titlebar=no", "toolbar=no", "location=no", "status=no", "menubar=no"].join(',');
	var gameWin = window.open(uri, 'popup_window', params); 
	gameWin.moveTo(0,0);
}