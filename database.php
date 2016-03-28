<?php

// connect to the database 'calendar'

$mysqli = new mysqli('localhost', 'cal_inst', 'cal_password', 'calendar');
 
if($mysqli->connect_errno) {
	printf("Connection Failed: %s\n", $mysqli->connect_error);
	exit;
}
 ?>