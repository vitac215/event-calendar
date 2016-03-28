<?php 

ini_set("session.cookie_httponly", 1);

header("Content-Type: application/json"); 
require 'database.php';
session_start();


$username=$_SESSION['username'];
$token = $_SESSION['token'];
$token_post = $_POST['token_post'];

// Check if that's illegal access
if ( ($token != $token_post) || (empty($_SESSION['username'])) ) {
	echo json_encode(array(
		"success" => false,
		"message" => "illegal access"
	));
	exit;
}


$eventID=$_POST['eventID'];
$title=$_POST['title'];
$content=$_POST['content'];
$time=$_POST['time'];
$tag=$_POST['tag'];

settype($eventID, "int");

// Update the data in the database
$stmt=$mysqli->prepare("UPDATE event SET content=?, title=?, ctime=?, tag=? WHERE event_id=?");


if(!$stmt){
    $s = $mysqli->error;
    $failmessage = "Query Prep Failed: ".$s;

	echo json_encode(array(
		"success" => false,
		"message" => $failmessage
	));
	exit;
}
   
$stmt->bind_param('ssssi', $content, $title, $time, $tag, $eventID);
$stmt->execute();
$stmt->close();

echo json_encode(array(
	"success" => true
));
exit;

  
?>