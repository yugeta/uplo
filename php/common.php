<?php
namespace uplo;

class common{

  // load-module
  public static function load($mode="file"){
    $mode = $mode ? $mode : "file";
    $path = __dir__."/types/".$mode.".php";
    if(!is_file($path)){return;}
    require_once $path;
  }

  public static function post_data($path=""){
    $mode = "file";

    // load-module
    if(self::load($mode)){
      return array(
        "status"  => "error",
        "message" => "Not found module. : ".$mode
      );
    }

    $class  = '\\uplo\\file';
    $method = "save";

    // check
    if(!class_exists($class)){
      return array(
        "status"  => "error",
        "message" => "Not class. : ".$class
      );
    }
    if(!method_exists($class,$method)){
      return array(
        "status"  => "error",
        "message" => "Not method. : ".$class."::".$method
      );
    }

    // save
    return call_user_func_array(array($class , $method) , array($path));
  }

  // public static function post_info($mode="file" , $path=""){
  //   // if($mode === "file"){return;}
    
  //   // load-module
  //   if(self::load($mode)){
  //     return array(
  //       "status"  => "error",
  //       "message" => "Not found module. : ".$mode
  //     );
  //   }

  //   $class  = '\\uplo\\'.$mode;
  //   $method = "save";

  //   // check
  //   if(!class_exists($class)){
  //     return array(
  //       "status"  => "error",
  //       "message" => "Not class. : ".$class
  //     );
  //   }
  //   if(!method_exists($class,$method)){
  //     return array(
  //       "status"  => "error",
  //       "message" => "Not method. : ".$class."::".$method
  //     );
  //   }

  //   // save
  //   return call_user_func_array(array($class , $method) , array($path , $_POST["info"]));
  // }



}