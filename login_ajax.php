<?php

ini_set("session.cookie_httponly", 1);

// login_ajax.php
require 'database.php'; 
header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json

session_start();

$username = $_POST['username'];
$password = $_POST['password'];

$stmt = $mysqli->prepare("SELECT password FROM user WHERE username=?");
 
// Bind the parameter
$stmt->bind_param('s', $username);
$stmt->execute();
 
// Bind the results
$stmt->bind_result($pwd_hash);
$stmt->fetch();

// Check to see if the username and password are valid.  (You learned how to do this in Module 3.)
 
if( preg_match('/^[\w_\-]+$/', $username) && crypt($password, $pwd_hash)==$pwd_hash ) {
 
	$_SESSION['username'] = $username;
	$_SESSION['token'] = substr(md5(rand()), 0, 10);
	$token = $_SESSION['token'];

	echo json_encode(array(
		"success" => true,
		"token" => $token
	));
	exit;
}
else {
	echo json_encode(array(
		"success" => false,
		"message" => "Incorrect Username or Password"
	));
	exit;
}

?>