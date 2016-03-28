<?php 

ini_set("session.cookie_httponly", 1);

header("Content-Type: application/json"); 
require 'database.php';
session_start();


// Get the username from session, token from post
$username = $_SESSION['username'];
$token = $_SESSION['token'];
$token_post = $_POST['token_post'];


// Check if the user is logged in
if (empty($_SESSION['username'])) {
	echo json_encode(array(
		"login" => false
	));
	exit;
}

// Check if that's illegal access
if ($token != $token_post) {
	echo json_encode(array(
		"success" => false,
		"message" => "illegal access"
	));
	exit;
}


// Get the posted year and month
$year = $_POST['year'];
$month = $_POST['month'];



// $monthType = gettype($month);   // omg it's a string

// Set the month and year type to be int
settype($month, "int");
settype($year, "int");


// Select event id, title, and day for specified username from the event database 
// and group them by the time
$stmt = $mysqli->prepare("SELECT * FROM event WHERE username=? and cmonth=? and cyear=? ORDER BY cday, ctime");

if(!$stmt){
    $s = $mysqli->error;
    $failmessage = "Query Prep Failed: ".$s;

	echo json_encode(array(
	"success" => false,
	"message" => $failmessage
	));
	exit;
}

$stmt->bind_param('sii', $username, $month, $year);
$stmt->execute();
$result = $stmt->get_result();

$data;

// while($stmt->fetch()) {
// 	if ($eid != null) {
// 		$data = array(
// 			"eid" => $eid,
// 			"etitle" => $etitle,
// 			"eday" => $eday,
// 			"eyear" => $eyear
// 		);
// 	}
// }

while ($row = $result->fetch_assoc()) {
	$eid 		= htmlentities($row['event_id']);
	$etitle 	= htmlentities($row['title']);
	$econtent 	= htmlentities($row['content']);
	$eusername	= htmlentities($row['username']);
	$etime 		= htmlentities($row['ctime']);
	$eyear 		= htmlentities($row['cyear']);
	$emonth		= htmlentities($row['cmonth']);
	$eday 		= htmlentities($row['cday']);
	$etag		= htmlentities($row['tag']);

	$temp = array(
		"eid" => $eid,
		"etitle" => $etitle,
		"econtent" => $econtent,
		"eusername" => $eusername,
		"etime" => $etime,
		"eyear" => $eyear,
		"emonth" => $emonth,
		"eday" => $eday,
		"etag" => $etag
	);

	$data[] = $temp;
}

$stmt->close();

echo json_encode($data);

exit;
?>