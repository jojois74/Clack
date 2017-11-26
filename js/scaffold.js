var scaf = new function() {
	this.init = function(callback) {
		var build = '<!-- Main Container -->\
		<div id = "root">\
			<!-- Nav Bar -->\
			<div id = "nav"></div>\
			<!-- Page -->\
			<div id = "content"></div>\
			<!-- Footer -->\
			<div id = "foot"></div>\
		</div>';
		window.onload = function() {
			var contents = document.body.innerHTML;
			document.body.innerHTML = build;
			document.getElementById('content').innerHTML = contents;
			scaf.consider("nav");
			scaf.consider("foot");
			scaf.consider("content");
			callback.bind(scaf)(); //Binding optional
		};
	}
	this.nav = function(headers) { //Create nav bar
		var build = '\
		<ul id = "main_nav_tree">';
		for (var i = 0; i < headers.length; i++) {
			if (headers[i][1] == "")
				build += '<li id = ' + headers[i][0].replace(/\s/g,'') + '>' + headers[i][0] + '</li>';
			else
				build += '<li id = ' + headers[i][0].replace(/\s/g,'') + '><a href = "' + headers[i][1] + '">' + headers[i][0] + '</a></li>';
		}
		build += '\
		</ul>';
		scaf.find("nav").innerHTML = build;
	}
	this.foot = function(title, links) { //Create footer
		var build = '\
		<!-- Footer Title -->\
		<div id = "foot_title">' + title + '</div>\
		<!-- Footer Links -->\
		<ul id = "main_links_tree">';
		for (var i = 0; i < links.length; i++) {
			build += '<li>' + links[i] + '</li>';
		}
		build += '\
		</ul>';
		scaf.find("foot").innerHTML = build;
	}
	this.photo = function(src, caption) { //Add photo
		var build = '\
		<div class = "photo_container">\
			<img class = "photo" src = "' + src + '" /><br />\
			<span class = "caption">' + caption + '</span>\
		</div>';
		scaf.find("content").innerHTML += build;
	}
	this.divider = function() { //Add divider
		var build = '\
		<hr />';
		scaf.find("content").innerHTML += build;
	}
	this.find = function(sfId) { //Return an element by its scaf id (sf-id)
		var els = document.getElementsByTagName("*");
		for (var i = 0; i < els.length; i++)
		{
			if (els[i].getAttribute("sf-id") == sfId)
			{
				return els[i];
			}
		}
		return null;
	}
	this.consider = function(identifier) { //Register a scaf-id to an element (uses the same id)
		var el = document.getElementById(identifier);
		el.setAttribute("sf-id", identifier);
		return el;
	}
	this.inject = function(control) { //Copy data from some element to another scaf.inject("from | to") or use broken pipe for continuous updating scaf.inject("from / to")
		//control has three parts. from, to, and operator.
		control2 = "";
		for (var i = 0; i < control.length; i++)
		{
			control2 += (control.charAt(i) == " ") ? "" : control.charAt(i);
		}
		var splitUp = control2.split("|");
		var op = "|";
		if (splitUp.length == 1) //Pipe not found, use broken pipe
		{
			splitUp = control2.split("/");
			op = "/";
		}
		
		var from = splitUp[0];
		var to = splitUp[1];
		
		var fromSource = this.find(from).innerHTML;
		this.find(to).innerHTML = fromSource;
		
		if (op == "/") //Broken pipe tracks changes forever, updating whenever innerHTML changes
		{
			var observer = new MutationObserver((function(mutations) {
				var fromSource = this.find(from).innerHTML;
				this.find(to).innerHTML = fromSource;
			}).bind(this));
			 
			// configuration of the observer:
			var config = {childList: true, subtree: true};
			 
			// pass in the target node, as well as the observer options
			observer.observe(this.find(from), config);
		}
	}
}