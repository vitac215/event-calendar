// Calendar Library
(function() {
	Date.prototype.deltaDays = function(c) {
		return new Date(this.getFullYear(), this.getMonth(), this.getDate()+c)
		}; 
		Date.prototype.getSunday = function() {
			return this.deltaDays(-1*this.getDay())
		}
}
)();

function Week(c) {
	this.sunday=c.getSunday(); 
	this.nextWeek = function() {
		return new Week(this.sunday.deltaDays(7))
	};
	this.prevWeek = function(){ 
		return new Week(this.sunday.deltaDays(-7))
	};
	this.contains = function(b) {
		return this.sunday.valueOf() === b.getSunday().valueOf()
	};
	this.getDates = function() {
		for(var b=[],a=0;7>a;a++)
			b.push(this.sunday.deltaDays(a));
			return b
	}
}

function Month(c,b){
	this.year=c;
	this.month=b;
	this.nextMonth = function() {
		return new Month(c+Math.floor((b+1)/12),(b+1)%12)
	};
	this.prevMonth = function() {
		return new Month(c+Math.floor((b-1)/12),(b+11)%12)
	};
	this.getDateObject = function(a) {
		return new Date(this.year,this.month,a)
	};
	this.getWeeks=function() {
		var a=this.getDateObject(1), b=this.nextMonth().getDateObject(0), c=[], a=new Week(a);
		for(c.push(a);!a.contains(b);)
			a=a.nextWeek(),c.push(a);
		return c;
	}
};

// Month names
var mos = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// Today's date
var today = new Date();
var todayDay = today.getDate();
var todayMonth = today.getMonth(); // March = 2

// Current month and date
// currenmos = Month {year: 2016, month: 2}, 2 is March	
var currentmos = new Month(today.getFullYear(), today.getMonth());

// For security use, will be filled in the login phase
var token; 

// Get content and title and tag
var contentForEdit;
var titleForEdit;
var tagForEdit;

// JQuery 
$(function(){


	// Display the current month and year immediately when the page is loaded
	updateCalendar();

	// When the next button is pressed...
	$("#btn_nextmos").click( function(event) {
		currentmos=currentmos.nextMonth();
		// Display new days
		updateCalendar();
		displayEvent();
	});

	// When the previous button is pressed...
	$("#btn_prevmos").click( function(event) {
		currentmos=currentmos.prevMonth();
		// Display new days
		updateCalendar();
		displayEvent();
	});
	// js way to do it
	// document.getElementById("btn_nextmos").addEventListener("click", function(event){
	// 	currentmos=currentmos.nextMonth();
	// 	updateCalendar();
	// }, false);


	// Update the calendar
	function updateCalendar() {

		// Clear the table
		$('.day').remove();
		$('#tdday').remove();

		// Display the current month and year
		$("#current").html(mos[currentmos.month] + " " + currentmos.year);

		
		// Get the weeks
		var weeks = currentmos.getWeeks();


		// Stuff the calendar table
		// Get the month's weeks
		$cellTemp = $('<td id="" class="tdday"></td>');

		$table = $('#table');

		// For each week row...
		for(var i=0; i<weeks.length; ++i){
			// Create a row 
			$tr = $('<tr class="day"></tr>');

			// Get this week's sunday
			var thisSunday = weeks[i].sunday;

			// For each day within that week row...
			for(var j=0; j<7; ++j){
				$cell = $cellTemp.clone(true);
				// Get each day
				var thisDay = thisSunday.deltaDays(j);
				// If the month of the day is not same as the displaying month...
				if(thisDay.getMonth() != currentmos.month) {
					// Do not display any date
				}
				else{
					// Display the date 
					$cell.text(thisDay.getDate());
				}
				$tr.append($cell);
			}
			$table.append($tr);
		}


		// Change id and value for each cell in the table
		// Get the table
		table = document.getElementById('table');
		// Get each cell
		var tdid = table.getElementsByTagName('td');
		// For each cell
		for (var i = tdid.length-1; i>6; i--) {
			var td = tdid[i];
			// If the cell contains something...
			if (td.innerHTML != null) {
				// the cell's id is equal to the cell's value
				td.id = td.innerHTML;
				// td.value = td.innerHTML;
			}
		} // Don't count the first row

		// Highlight today's cell
		// Check what month is the page
		if (todayMonth == currentmos.month) {
			$('#'+todayDay).css("background-color","#ffb3b3");
		}

	} // End of updateCalendar function


	// Display event function
	function displayEvent() {
		// Get the month and year the calendar is displaying 
		// Check if the user is loggined...
		if (loginStatus.innerHTML != "Welcome, Guest") {
			var year = currentmos.year;
			var month = currentmos.month + 1; // so March = 3

			// Post data to php
			$.ajax({
				method: "POST",
				url: "displayEvent.php",
				data: {year:year, month:month, token_post:token}
			})
			.done(function(data){
				// If there's illegal access
				if (data.success == false) {
					alert(data.message);
				}
				else {
					// If the user is not logined
					if (data.login == false) {
						// Display no events
						// alert("no events");
					}
					else { // If the user is logined
						// Run through the event array
						for(var k=0; k<data.length; ++k) {
							// If the tag selected is all, or matches the event tag
							if ($('#eventTag').val() == "All" || $('#eventTag').val() == data[k].etag) {
								contentForEdit = data[k].econtent;
								titleForEdit = data[k].etitle;
								tagForEdit = data[k].etag;
								var  thisDate = parseInt(data[k].eday);
								$('#'+thisDate).append('<div class="eventDay" event-id="' + data[k].eid + '"' + 'event-content="' + contentForEdit + '"' + 'event-title="' + titleForEdit + '"' + 'event-tag="' + tagForEdit + '">' + data[k].etime + ' ' + data[k].etitle + '</div>');
							}
							// else, display nothing
						}
					}
				}
			});
		}
		
	} // End of display event function

	// When tag selected is changed, update calendar and display events
	$("#eventTag").change(updateCalendar);
	$("#eventTag").change(displayEvent);



	// Register
	function registerAjax(event) {
		var username = document.getElementById("username").value; // Get the username from the form
		var password = document.getElementById("password").value; // Get the password from the form
	 
		// Make a URL-encoded string for passing POST data:
		var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);
	 
		var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
		xmlHttp.open("POST", "register_ajax.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
		xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
		xmlHttp.addEventListener("load", function(event){
			var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
			if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
				alert("You've been registered successfully!");

				// // Change the login status
				// $("#loginStatus").html("Welcome, " + username);

				// // Display the evnets
				// displayEvent();

			}else{
				alert("You were not registered:  "+jsonData.message);
			}
		}, false); // Bind the callback to the load event
		xmlHttp.send(dataString); // Send the data
	}

	$("#btn_reg").click(registerAjax);
	// document.getElementById("btn_reg").addEventListener("click", registerAjax, false); // Bind the AJAX call to button click







	// Login
	function loginAjax(event) {
		if (loginStatus.innerHTML != "Welcome, Guest") {
			alert("You already logged in");
		}

		else {

			var username = document.getElementById("username").value; // Get the username from the form
			var password = document.getElementById("password").value; // Get the password from the form
		 
			// Make a URL-encoded string for passing POST data:
			var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);
		 
			var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
			xmlHttp.open("POST", "login_ajax.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
			
			xmlHttp.addEventListener("load", function(event){
				var jsonData = JSON.parse(event.target.responseText); // parse the JSON into a JavaScript object
				if(jsonData.success){  // in PHP, this was the "success" key in the associative array; in JavaScript, it's the .success property of jsonData
					alert("You've been logged In successfully!");
					token = jsonData.token;
					// Change the login status
					$("#loginStatus").html("Welcome, " + username);

					// alert(jsonData.token);

					// Display the events
					displayEvent();

				}else{
					alert("You were not logged in:  "+jsonData.message);
				}
			}, false); // Bind the callback to the load event

			xmlHttp.send(dataString); // Send the data

		}
	}

	$("#btn_login").click(loginAjax);
	// document.getElementById("btn_login").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click




	// Logout
	function logoutAjax(event) {
		// Check login status
		if (loginStatus.innerHTML == "Welcome, Guest") {
			alert("Please Login first!");
		}
		else {
			var username = document.getElementById("username").value; // Get the username from the form
			var password = document.getElementById("password").value; // Get the password from the form
		 
			// Make a URL-encoded string for passing POST data:
			var dataString = "username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password);
		 
			var xmlHttp = new XMLHttpRequest(); // Initialize our XMLHttpRequest instance
			xmlHttp.open("POST", "logout_ajax.php", true); // Starting a POST request (NEVER send passwords as GET variables!!!)
			xmlHttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); // It's easy to forget this line for POST requests
			xmlHttp.addEventListener("load", function(event){
				alert("You've been logged out successfully!");

				updateCalendar();
				displayEvent();

				// Change the login status
				$("#loginStatus").html("Welcome, Guest");

			}, false); // Bind the callback to the load event
			xmlHttp.send(dataString); // Send the data		
		}

	} // End of logout function

	$("#btn_logout").click(logoutAjax);



	// Create Event Box
	// Get the modal
	var modal = $('#addEvent');
	var day;

	$(document).on('click', '.tdday', function(e){
		// When the user clicks the day, open the modal
		// If the day is not an event day
		if ($(this).attr('id') == "") {
			// Do nothing
		}
		else {

			modal.fadeIn(100);
			//modal.style.display = "block";
		}
		day = $(this).attr('id');
	});

	// Close the modal when the user clicks the close button
	$(".close").on('click', function(){
		modal.hide();
	});

	
	// Add Event Create Event
	$("#submit").on('click', function(){
		// Check login status
		if (loginStatus.innerHTML == "Welcome, Guest") {
			alert("Please Login first!");
		}
	 	else {
			var title = $('#eventTitle').val();
			var time = $('#eventTime').val();  // Eg. 3:33

			// Check if the title is filled...
			if (title == "" || time == "") {
				alert("Please enter the title and time");
			}
			else {
				var content = $('#eventContent').val();
				var tag = $('#addEventTag').val();
				var share_username = $('#eventShare').val(); // another user to be shared 

				var emonth = currentmos.month+1;  // So March = 3
				var eyear = currentmos.year;

				// Prepare the alert
				var date;
				if(emonth<10) {
					if (day<10) {
						date = eyear+"-0"+emonth+"-0"+day;
					}
					else {
						date = eyear+"-0"+emonth+"-"+day;
					}
				}
		 		else{
		 			if (day<10) {
						date = eyear+"-"+emonth+"-0"+day;
					}
					else {
						date = eyear+"-"+emonth+"-"+day;
					}
		 		}


				// Post data to php
				$.ajax({
					method: "POST",
					url: "addEvent.php",
					data: {title: title, content: content, time: time, year:eyear, month:emonth, day:day, tag: tag, share_username: share_username, token_post: token}
				})
				.done(function(data){
					if (data.success==false) {
						alert(data.message);
					}
					else {
						// If success...
						// Close the modal
						alert("Event Created on "+date);
						modal.hide();
						updateCalendar();
						displayEvent();
					}
				});
				// Clear the form
				document.getElementById("addEventForm").reset();
			}


		}

	});





	// Edit Event Box
	// Get the modal
	var modal2 = $('#editEvent');
	var eventIDforEdit;

	$(document).on('click', '.eventDay', function(e){

		contentForEdit = $(this).attr('event-content');
		titleForEdit = $(this).attr('event-title');
		// tagForEdit = $(this).attr('event-tag');

		// Replace placeholder with the actual content and title
		$('#eventContentEdit').attr('placeholder', contentForEdit);
		$('#eventTitleEdit').attr('placeholder', titleForEdit);
		// $('#'+tagForEdit).attr('selected', "selected");
		

		// When the user hovers the day, open the modal
		modal2.fadeIn(200);	
		// Get the event ID
		eventIDforEdit = $(this).attr('event-id');
		// Stop the creat event function
		e.stopPropagation();
	});

	// Close the modal when the user clicks the close button
	$(".close2").on('click', function(){
		modal2.hide();
	});

	// Edit events post to php
	$("#edit").on('click', function(){
		// Get the necessary data
		var titleEdit = $('#eventTitleEdit').val();
		var timeEdit = $('#eventTimeEdit').val();  // Eg. 03:33

		// Check if the title is filled...
		if (titleEdit == "" || timeEdit == "") {
			alert("Please enter the title and time");
		}

		else {
			var contentEdit = $('#eventContentEdit').val();
			var tagEdit = $("#editEventTag").val();

			// Post data to php
			$.ajax({
				method: "POST",
				url: "editEvent.php",
				data: {eventID: eventIDforEdit, title: titleEdit, content: contentEdit, time: timeEdit, tag: tagEdit, token_post: token}
			})
			.done(function(data){
				if (data.success==false) {
					alert(data.message);
				}
				else {
					alert("Event edit successfully");
					// If success...
					// Close the modal
					modal2.hide();
					updateCalendar();
					displayEvent();
				}
			})
			
			document.getElementById("editEventForm").reset();
		}


	});



	// Delete Event
	$("#delete").on('click', function(){
		// Post data to php
		$.ajax({
			method: "POST",
			url: "deleteEvent.php",
			data: {eventID: eventIDforEdit, token_post: token}
		})
		.done(function(data){
			if (data.success==false) {
				alert(data.message);
			}
			else {
				alert("Event delete successfully");
				// If success...
				// Close the modal
				modal2.hide();
				updateCalendar();
				displayEvent();
			}
		})

		document.getElementById("editEventForm").reset();
	});

}); // End of JQuey