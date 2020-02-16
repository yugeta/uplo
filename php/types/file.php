<?php
namespace uplo;

class file{

  public static function post($savepath=""){
    $res = self::save($savepath);
    return json_encode($res , JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  }

  public static function save($savepath=""){
    if(!$savepath){return;}

    $pathinfo = pathinfo($savepath);
    if($pathinfo["dirname"] && !is_dir($pathinfo["dirname"])){
      mkdir($pathinfo["dirname"] , 0755 , true);
    }

    move_uploaded_file($_FILES["imageFile"]["tmp_name"] , $savepath);

    if(is_file($savepath)){
      return array("status" => "ok" , "file" => $savepath);
    }
    else{
      return array("status" => "error" , "file" => $savepath , "message" => "Don't make file.");
    }
  }

  // public static function save_info($savepath=""){
  //   if(!$savepath){return;}

  //   $pathinfo = pathinfo($savepath);
  //   if($pathinfo["dirname"] && !is_dir($pathinfo["dirname"])){
  //     mkdir($pathinfo["dirname"] , 0755 , true);
  //   }

  //   move_uploaded_file($_FILES["imageFile"]["tmp_name"] , $savepath);

  //   if(is_file($savepath)){
  //     return array("status" => "ok" , "file" => $savepath);
  //   }
  //   else{
  //     return array("status" => "error" , "file" => $savepath , "message" => "Don't make file.");
  //   }
  // }
  
}