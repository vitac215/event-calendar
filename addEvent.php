<?php 

ini_set("session.cookie_httponly", 1);

header("Content-Type: application/json"); 
require 'database.php';
session_start();


$username = $_SESSION['username'];
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



$content = $_POST['content'];
$title = $_POST['title'];
$year = $_POST['year'];
$month = $_POST['month'];
$day = $_POST['day'];
$time = $_POST['time'];
$tag = $_POST['tag'];
$share_username = $_POST['share_username'];




// If the current user wants to share the event with another user...
if ($share_username != "") {

	// Check if the username exists
	$stmt=$mysqli->prepare("SELECT COUNT(*) FROM user WHERE username=?");
	if(!$stmt){
	    $s = $mysqli->error;
	    $failmessage = "Query Prep Failed: ".$s;
	    echo jason_encode(array(
	        "success" => false,
	        "message" => $failmessage
	     ));
	     exit;
	}
	$stmt->bind_param('s', $share_username);
	$stmt->execute();
	$stmt->bind_result($cnt);
	$stmt->fetch();

	// If the username does not exist... 
	if($cnt!=1){
		// echo "Existing username";
	    echo json_encode(array(
	        "success" => false,
	        "message" => "The user you want to share the event with does not exist"
	    ));
	    exit;
	}
	$stmt->close();

	// Adjust the title
	$title_share = $title." shared by ".$username;

	// Insert the event into the shared user's 
	$stmt = $mysqli->prepare("INSERT INTO event (title, cyear, cmonth, cday, ctime, content, username, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

	if(!$stmt){
	    $s = $mysqli->error;
	    $failmessage = "Query Prep Failed: ".$s;

		echo json_encode(array(
		"success" => false,
		"message" => $failmessage
		));
		exit;
	}

	$stmt->bind_param('siiissss', $title_share, $year, $month, $day, $time, $content, $share_username, $tag);
	$stmt->execute();
	$stmt->close();

}


//  echo json_encode(array(
//  	"tag" => $tag,
//  	"tagType" => $tagType
//  	));


// Insert the event into the current user's 
$stmt = $mysqli->prepare("INSERT INTO event (title, cyear, cmonth, cday, ctime, content, username, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

if(!$stmt){
    $s = $mysqli->error;
    $failmessage = "Query Prep Failed: ".$s;

	echo json_encode(array(
	"success" => false,
	"message" => $failmessage
	));
	exit;
}

$stmt->bind_param('siiissss', $title, $year, $month, $day, $time, $content, $username, $tag);
$stmt -> execute();
$stmt->close();


echo json_encode(array(
	"success" => true,
));
exit;


?>