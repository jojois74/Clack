scaf.init(function (){
	scaf.nav([["Practice", ""], ["Dashboard", "dash.html"], ["Log In", "javascript:fblogin()"], ["Log Out", "javascript:fblogout()"]]);
	document.getElementById("LogOut").style.display = "none";
	document.getElementById("Dashboard").style.display = "none";
	
	var st = "<div id = 'cont'><ul><li><a href = 'javascript:g(\"game.html?time=0&hlight=true&help=true&len=.1\")'>Training Wheels</a></li><br /><li><a href = 'javascript:g(\"game.html?time=10&hlight=true&help=false&len=.9\")'>Timed</a></li><br /><li><a href = 'javascript:g(\"game.html?time=6&hlight=false&help=false&len=.99\")'>Intense</a></li></ul></div>";
	document.getElementById('Practice').innerHTML += st;
});

function fblogin()
{
	FB.login(function(response) {
	  if (response.status === 'connected') {
		console.log("Login successful?");
		console.log(response);
		console.log(response.authResponse.userID);
		trackUser(response.authResponse.userID);
	  } else {
		console.log("Login unsuccessful, please try again!");
	  }
	});
	document.getElementById("LogIn").style.display = "none";
	document.getElementById("LogOut").style.display = "inline-block";
	document.getElementById("Dashboard").style.display = "inline-block";
}

function trackUser(id)
{
	$.post("php/track.php", {ident: id, logged: 1} );
}

function fblogout()
{
	console.log("Trying to log out");
	FB.logout(function(response) {
		console.log("Log out likely successful");
		console.log(response);
		//$.post("php/track.php", {ident: id, logged: 0} );
	});
	console.log("Fired asynch log out command");
	document.getElementById("LogIn").style.display = "inline-block";
	document.getElementById("LogOut").style.display = "none";
	document.getElementById("Dashboard").style.display = "none";
}

function g(uri)
{
	var params = ['height=' + screen.height, 'width=' + screen.width, 'fullscreen=yes', "directories=no", "titlebar=no", "toolbar=no", "location=no", "status=no", "menubar=no"].join(',');
	var gameWin = window.open(uri, 'popup_window', params); 
	gameWin.moveTo(0,0);
}