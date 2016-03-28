<?php

ini_set("session.cookie_httponly", 1);

// register_ajax.php
require 'database.php'; 
header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
 
$username = $_POST['username'];
$password = $_POST['password'];

// Check if the username satisfies the regular expression requirement
if( !preg_match('/^[\w_\-]+$/', $username) ){   
	// echo "Invalid Username";
    echo json_encode(array(
        "success" => false,
        "message" => "Invalid Username"
    ));
    exit;
}

// Check if the username entered already exists in the database or not
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
$stmt->bind_param('s', $username);
$stmt->execute();
$stmt->bind_result($cnt);
$stmt->fetch();

// If the username already exists... 
if($cnt==1){
	// echo "Existing username";
    echo json_encode(array(
        "success" => false,
        "message" => "Existing username"
    ));
    exit;
}
$stmt->close();


// Get the length of the username and password
$n=strlen($username);
$p=strlen($password);

// Check if the username is entered
if($n==0){
	// echo "Please enter your username";
    echo json_encode(array(
        "success" => false,
        "message" => "Please enter your username"
    ));
	exit;

// Check if the password is entered
}elseif($p==0){
	// echo "Please enter the password";
    echo json_encode(array(
        "success" => false,
        "message" => "Please enter the password"
    ));
	exit;


// Check if the username exceeds the length requirement
}elseif(!($n>=4 && $n<=10)){
    echo json_encode(array(
        "success" => false,
        "message" => "The length of the usernsme should be 5-16"
    ));
	exit;


// Check if the password exceeds the length requirement
}elseif(!($p>=5 && $p<=16)){
	echo json_encode(array(
        "success" => false,
        "message" => "The length of the password should be 5-16"
    ));
	exit;
}
else{  

    // Encrype and salt the password
    $crypted_password=crypt($password);

    // Insert the username and password into the database
    $stmt = $mysqli->prepare("insert into user (username, password) values (?, ?)");
    if(!$stmt){
    $s = $mysqli->error;
    $failmessage = "Query Prep Failed: ".$s;
    echo json_encode(array(
        "success" => false,
        "message" => $failmessage
    ));
    exit;
    }

    $stmt->bind_param('ss', $username, $crypted_password);
    if ( $stmt->execute() ){
        //if insert success, query usern from database
        $stmt = $mysqli->prepare("select COUNT(*) from user where username = ?");
        if(!$stmt){
        $s = $mysqli->error;
        $failmessage = "Query Prep Failed: ".$s;
        echo json_encode(array(
            "success" => false,
            "message" => $failmessage
        ));
        exit;
        }
        $stmt->bind_param('s', $username);
        $user = $_POST['username'];
        $stmt->execute();
        
        // Bind the results
        $stmt->bind_result($cnt);
        $stmt->fetch();
        $stmt->close();
        
        if( $cnt == 1 ){
            // Register Successful
            // Need to login one more time
            echo json_encode(array(
                "success" => true,
            ));
            exit;	
        }
        else{
            echo json_encode(array(
                "success" => false,
                "message" => "Incorrect Username or Password"
            ));
            exit;
        }
    }
    else{
        // Register failed
        echo json_encode(array(
            "success" => false,
            "message" => "Incorrect Username or Password"
        ));
        exit;
    }
}

?>