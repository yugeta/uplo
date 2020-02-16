<?php
require_once __dir__."/../php/common.php";
$uplo_common = new \uplo\common();

$uplo = $_POST["uplo"];

// save-path
$dir  = "_hoge/";
$data_path = $dir.$uplo["id"]."_".$uplo["num"].".".$uplo["ext"];
$info_path = $dir.$uplo["id"]."_".$uplo["num"].".json";

// sava-data
$res1  = $uplo_common::post_data($data_path);
if($res1["status"] === "error"){
  exit("Error. (".$res1["message"].")");
}


// save-info
if(isset($_POST["contents"]) && $_POST["contents"]){
  $contents = $_POST["contents"];
  $info_data = json_encode($contents , JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  file_put_contents($info_path , $info_data.PHP_EOL);
}


// view
echo $data_path."\n";
print_r($res);
print_r($_POST);
exit();


