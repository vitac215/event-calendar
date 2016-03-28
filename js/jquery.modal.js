// JQuey Modal

// Get the modal
var modal = $('#addEvent');

var day;

$(document).on('click', '.tdday', function(){
	// When the user clicks the day, open the modal
	if ($(this).attr('id') == "") {
		// Do nothing
	}
	else {
		modal.fadeIn(200);
		//modal.style.display = "block";
	}
	day = $(this).attr('id');
});

// Close the modal
$(".close").on('click', function(){
	modal.hide();
});

