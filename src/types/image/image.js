(function(){

  var MAIN = function(){};

  MAIN.prototype.options = {
    template      : null,
    trim_box : {}
  };

  // プレビュー表示の写真表示箇所のエレメントセット
  MAIN.prototype.setList = function(fl , options , dom){

    var lib = new LIB();

    var parser = new DOMParser();
    var doc = parser.parseFromString(options.template[this.options.scriptname], "text/html");
    var li = doc.querySelector("."+ dom.li);

    var commentButton = li.querySelector("." + dom.comment_icon);
    commentButton.setAttribute("data-view" , (options.flg_icon_comment === true) ? 1 : 0);

    var filename = li.querySelector("."+ dom.filename);
    if(filename){
      if(filename.tagName === "INPUT"){
        filename.value = fl.name;
      }
      else{
        filename.textContent = fl.name;
      }
    }

    var info_type = li.querySelector("."+ dom.info_type);
    if(info_type){
      info_type.textContent = fl.type;
    }

    var info_size = li.querySelector("."+ dom.info_size);
    if(info_size){
      info_size.textContent = lib.convertSize(fl.size , 2 , 1000);
    }

    var commentForm = li.querySelector("."+ dom.comment_form);
    if(commentForm){
      commentForm.placeholder = (options.comment.placeholder) ? options.comment.placeholder : "";
    }

    // image-proc
    this.options.dom = dom;
    var img = li.querySelector("."+ dom.img);
    img.onload = (function(e){
      var img = e.target;
      this.setExif(img);
      this.viewImageSize(img);
      this.setTrim(img);
    }).bind(this);

  
    var path = URL.createObjectURL(fl);
    img.src = path;

    // rotate
    var btn_rotate = li.querySelector(".rotate-icon");
    if(btn_rotate){
      lib.event(btn_rotate , "click" , (function(e){this.clickRotateButton(e)}).bind(this));
    }

    // trim
    var btn_trim = li.querySelector(".trim-icon");
    if(btn_trim){
      lib.event(btn_trim , "click" , (function(e){this.clickTrimButton(e)}).bind(this));
    }
    this.setEvent();

    return li;
  };


  MAIN.prototype.setEvent = function(){
    if(typeof data_flg_uplo_image_events !== "undefined"){return}

    var lib = new LIB();
    lib.event(window , "mousedown"  , (function(e){this.trim_pointer_down(e , e.pageX , e.pageY)}).bind(this));
    lib.event(window , "mousemove"  , (function(e){this.trim_pointer_move(e , e.pageX , e.pageY)}).bind(this));
    lib.event(window , "mouseup"    , (function(e){this.trim_pointer_up()}).bind(this));

    lib.event(window , "touchstart" , (function(e){this.trim_pointer_down(e , e.changedTouches[e.changedTouches.length-1].pageX , e.changedTouches[e.changedTouches.length-1].pageY)}).bind(this) , {passive:false});
    lib.event(window , "touchmove"  , (function(e){this.trim_pointer_move(e , e.changedTouches[e.changedTouches.length-1].pageX , e.changedTouches[e.changedTouches.length-1].pageY)}).bind(this) , {passive:false});
    lib.event(window , "touchend"   , (function(e){this.trim_pointer_up()}).bind(this) , {passive:false});

    window.data_flg_uplo_image_events = true;
  };



  // [画像編集] rotateボタンを押した時の処理（左に90度回転）
  MAIN.prototype.clickRotateButton = function(e){
    var target = e.currentTarget;


    var li = new LIB().upperSelector(target , "li");
    if(!li){return;}

    var targetImage = li.querySelector("img.picture");
    if(!targetImage){return;}

    var area = li.querySelector(".contents-area");
    if(!area){return}

    var beforeRotateNum = area.getAttribute("data-rotate");
    var rotateNum = (beforeRotateNum) ? beforeRotateNum : "0";
    var before_rotate = rotateNum;

    // 反時計回りに回転
    switch(rotateNum){
      case "0":
        rotateNum = 270;
        break;
      case "90":
        rotateNum = 0;
        break;
      case "180":
        rotateNum = 90;
        break;
      case "270":
        rotateNum = 180;
        break;
    }
    var after_rotate = rotateNum;

    area.setAttribute("data-rotate" , rotateNum);

    // pixel-view
    this.viewImageSize(targetImage);

    // trim-box
    this.setTrim_box(targetImage , before_rotate , after_rotate);

    // trim-rotate
    this.setTrim(targetImage);
    
  };


  // natural-size
  // rotateFlg @ 回転90,270の場合:true それ以外:false
  MAIN.prototype.viewImageSize = function(img){
    if(!img){return;}
    var li = new LIB().upperSelector(img , "li");

    var imgSize = this.getImageSize(img);
    var boxSize = this.getBoxSize(img);

    var rotateFlg = this.checkRotate(img);

    var px_w = li.querySelector(".info-px .w");
    var px_h = li.querySelector(".info-px .h");
    if(px_w){
      var nw = (!rotateFlg) ? img.naturalWidth : img.naturalHeight;
      var w = (!rotateFlg) ? boxSize.width / imgSize.rate : boxSize.height / imgSize.rate;
      var w = Math.ceil(w);
      px_w.textContent = (nw < w) ? nw : w;
    }
    if(px_h){
      var nh = (!rotateFlg) ? img.naturalHeight : img.naturalWidth;
      var h = (!rotateFlg) ? boxSize.height / imgSize.rate : boxSize.width / imgSize.rate;
      var h = Math.ceil(h);
      px_h.textContent = (nh < h) ? nh : h;
    }
  };

  MAIN.prototype.getImageSize = function(img){
    if(!img){return}

    var base = {
      w : Number(img.naturalWidth),
      h : Number(img.naturalHeight)
    };

    // 横長
    if(base.w > base.h){
      var aspect = base.h / base.w;
      var w = img.offsetWidth;
      var h = w * aspect
      var t = (w / 2) - (h / 2);
      var rate = w / base.w;
      return {
        rate   : rate,
        top    : t,
        left   : 0,
        width  : Math.ceil(w),
        height : Math.ceil(h)
      };
    }
    // 縦長
    else if(base.w < base.h){
      var aspect = base.w / base.h;
      var h = img.offsetHeight;
      var w = h * aspect;
      var l = (h / 2) - (w / 2);
      var rate = h / base.h;
      return {
        rate   : rate,
        top    : 0,
        left   : l,
        width  : Math.ceil(w),
        height : Math.ceil(h)
      };
    }
    // 正方形
    else{
      return {
        rate   : img.offsetWidth / base.w,
        top    : 0,
        left   : 0,
        width  : Math.floor(img.offsetWidth),
        height : Math.floor(img.offsetHeight)
      };
    }
  };

  MAIN.prototype.getBoxSize = function(elm){
    if(!elm){return null;}
    var li = new LIB().upperSelector(elm , "li");
    if(!li){return null;}
    var trim_box = li.querySelector(".trim-box");
    return {
      width  : trim_box.offsetWidth,
      height : trim_box.offsetHeight,
      top    : trim_box.offsetTop,
      left   : trim_box.offsetLeft
    };
  };


  // ----------
  // exif

  // 画像を読み込んだ際のイベント処理
  MAIN.prototype.setExif = function(img){
    if(typeof window.EXIF === "undefined"){return}
    // exif-orientation
    var res = EXIF.getData(img , (function(img , e) {
      var exifData = EXIF.getAllTags(img);
      if(!exifData){return;}
      this.setOrientation(img , exifData);
      img.setAttribute("data-exif" , JSON.stringify(exifData));
      this.viewImageSize(img);
    }).bind(this , img));
    return res;
  };

  MAIN.prototype.setOrientation = function(img , exifData){
    if(!img || !exifData || !exifData.Orientation){return}
    if(exifData.Orientation != 6 && exifData.Orientation != 8){return}
    var contents_area = new LIB().upperSelector(img , "li .contents-area");
    var orientation = (new LIB().isIOSdevice()) ? 1 : exifData.Orientation;
    contents_area.setAttribute("data-orientation" , orientation);
  };



  // ----------
  // trim

  MAIN.prototype.clickTrimButton = function(e){
    var target = e.target;
    if(!target){return}

    var li = new LIB().upperSelector(target , "li");
    var trim_area = li.querySelector(".trim-area");
    if(!trim_area){return}

    var data_visible = trim_area.getAttribute("data-visible") !== "1" ? 1 : 0;
    trim_area.setAttribute("data-visible" , data_visible)
    
    var img = li.querySelector("img.picture");
    this.setTrim(img);
  };


  // ----------
  // TRIM

  // trim-control
  MAIN.prototype.setTrim = function(img){
    var imgSize = this.getImageSize(img);
    if(!imgSize){return}

    var area = new LIB().upperSelector(img , ".contents-area");
    if(!area){return}

    var trim_area = area.querySelector(".trim-area");

    var trim_relative = trim_area.querySelector(".trim-relative");
    if(!trim_relative){return;}
    
    this.setTrim_relative(trim_relative , imgSize);

    this.setTrim_pointer(trim_relative);
  };

  MAIN.prototype.setTrim_relative = function(elm , imgSize){
    var rotateFlg = this.checkRotate(elm);

    // 回転あり
    if(rotateFlg){
      elm.style.setProperty("top"    , imgSize.left   + "px" , "");
      elm.style.setProperty("left"   , imgSize.top    + "px" , "");
      elm.style.setProperty("width"  , imgSize.height + "px" , "");
      elm.style.setProperty("height" , imgSize.width  + "px" , "");
    }
    // 回転無し
    else{
      elm.style.setProperty("top"    , imgSize.top    + "px" , "");
      elm.style.setProperty("left"   , imgSize.left   + "px" , "");
      elm.style.setProperty("width"  , imgSize.width  + "px" , "");
      elm.style.setProperty("height" , imgSize.height + "px" , "");
    }
  };

  MAIN.prototype.setTrim_pointer = function(elm){

    var trim_box = elm.querySelector(".trim-box");
    if(!trim_box){return;}

    var trim_pointer_1 = elm.querySelector(".trim-pointer[data-type='top-left']");
    var trim_pointer_2 = elm.querySelector(".trim-pointer[data-type='top-right']");
    var trim_pointer_3 = elm.querySelector(".trim-pointer[data-type='bottom-left']");
    var trim_pointer_4 = elm.querySelector(".trim-pointer[data-type='bottom-right']");

    var w = trim_box.offsetWidth;
    var h = trim_box.offsetHeight;
    var t = trim_box.offsetTop;
    var l = trim_box.offsetLeft;

    // pointer : top-left
    trim_pointer_1.style.setProperty("top"  , t + "px" , "");
    trim_pointer_1.style.setProperty("left" , l + "px" , "");

    // pointer : top-right
    trim_pointer_2.style.setProperty("top"  , t + "px" , "");
    trim_pointer_2.style.setProperty("left" , (l + w) + "px" , "");

    // pointer : bottom-left
    trim_pointer_3.style.setProperty("top"  , (t + h) + "px" , "");
    trim_pointer_3.style.setProperty("left"  , l + "px" , "");

    // pointer : bottom-right
    trim_pointer_4.style.setProperty("top"  , (t + h) + "px" , "");
    trim_pointer_4.style.setProperty("left" , (l + w) + "px" , "");
  };

  MAIN.prototype.setTrim_box = function(img , before_rotate , after_rotate){
    if(!img){return;}

    var li = new LIB().upperSelector(img , "li");
    var trim_relative = li.querySelector(".trim-relative");
    var trim_box = trim_relative.querySelector(".trim-box");

    var contents_area = li.querySelector(".contents-area");
    var orientationNum = contents_area.getAttribute("data-orientation");
    orientationNum = orientationNum ? orientationNum : 0;

    var rw = trim_relative.offsetWidth;
    // var rh = trim_relative.offsetHeight;
    // var rt = trim_relative.offsetTop;
    // var rl = trim_relative.offsetLeft;

    var w = trim_box.offsetWidth;
    var h = trim_box.offsetHeight;
    var t = trim_box.offsetTop;
    var l = trim_box.offsetLeft;


    switch(after_rotate - before_rotate){
      // // 0->90 , 0->-270
      // case 90:
      // case -270:
      //   trim_box.style.setProperty("top"    , l + "px" , "");
      //   trim_box.style.setProperty("left"   , (rw - h) + "px" , "");
      //   trim_box.style.setProperty("width"  , h + "px" , "");
      //   trim_box.style.setProperty("height" , w + "px" , "");
      //   break;

      // // 0->180 , 0->-180
      // case 180:
      // case -180:
      //   trim_box.style.setProperty("top"    , (rh - h) + "px" , "");
      //   trim_box.style.setProperty("left"   , (rw  - w) + "px" , "");
      //   break;

      // 0->270 , 0->-90
      case 270:
      case -90:
        trim_box.style.setProperty("top"    , (rw  - w - l) + "px" , "");
        trim_box.style.setProperty("left"   , t + "px" , "");
        trim_box.style.setProperty("width"  , h + "px" , "");
        trim_box.style.setProperty("height" , w + "px" , "");
        
        break;
    }
    
  };

  MAIN.prototype.trim_pointer_down = function(e , px , py){
    var target = e.target;
    if(!target){return}
    target.setAttribute("data-active" , "1");

    // pointer
    if(target.className === "trim-pointer"){
      this.options.trim_pointer_target   = target;
      this.options.trim_pointer_position = {x:target.offsetLeft , y:target.offsetTop};
      this.options.trim_pointer_cursor   = {x:px , y:py}
      this.options.trim_pointer_parent   = new LIB().upperSelector(target , "li");
      var img = this.options.trim_pointer_parent.querySelector("img.picture");
      this.options.trim_pointer_imgSize  = this.getImageSize(img);
      target.setAttribute("data-target","1");
    }

    // trim-box
    else if(target.className === "trim-box"){
      this.options.trim_box.relative = new LIB().upperSelector(target , ".trim-relative");
      this.options.trim_box.target   = target;
      this.options.trim_box.position = {x:target.offsetLeft , y:target.offsetTop};
      this.options.trim_box.cursor   = {x:px , y:py}
    }
  };

  MAIN.prototype.trim_pointer_move = function(e , px , py){

    // pointer
    if(this.options.trim_pointer_target
    && this.options.trim_pointer_imgSize
    && this.options.trim_pointer_parent){
      e.preventDefault();
      this.set_trim_pointer_target(this.options.trim_pointer_target , this.options.trim_pointer_parent , this.options.trim_pointer_imgSize , px , py);
    }

    // trim-box
    else if(this.options.trim_box.target){
      e.preventDefault();
      this.set_trim_box_control(px , py);
    }
  }

  MAIN.prototype.set_trim_pointer_target = function(target , li , imgSize , px , py){

    var x = this.options.trim_pointer_position.x - (this.options.trim_pointer_cursor.x - px);
    var y = this.options.trim_pointer_position.y - (this.options.trim_pointer_cursor.y - py);
    var contents_area = li.querySelector(".contents-area");
    // var rotate = contents_area.getAttribute("data-rotate");

    // 縦長
    if(this.checkRotate(target)){
      x = (x > 0) ? x : 0;
      x = (x < imgSize.height) ? x : imgSize.height;
      y = (y > 0) ? y : 0;
      y = (y < imgSize.width) ? y : imgSize.width;
    }
    // 横長
    else{
      x = (x > 0) ? x : 0;
      x = (x < imgSize.width) ? x : imgSize.width;
      y = (y > 0) ? y : 0;
      y = (y < imgSize.height) ? y : imgSize.height;
    }
    // pointer-collision
    var pos = this.check_trim_pointer_collision(target , li , x , y);
    
    target.style.setProperty("top"  , pos.y + "px" , "");
    target.style.setProperty("left" , pos.x + "px" , "");

    // interlocking
    // var parent = new LIB().upperSelector(target , ["."+main.options.dom.li]);
    this.set_trim_popinter_interlocking(target , contents_area , pos.x , pos.y);
    this.set_trim_popinter_area(contents_area);
  };

  MAIN.prototype.check_trim_pointer_collision = function(target , li  , x , y){
    var tl = li.querySelector("[data-type='top-left'");
    var tr = li.querySelector("[data-type='top-right'");
    var bl = li.querySelector("[data-type='bottom-left'");
    var br = li.querySelector("[data-type='bottom-right'");
    switch(target.getAttribute("data-type")){
      case "top-left":
        x = (x < tr.offsetLeft) ? x : tr.offsetLeft;
        y = (y < bl.offsetTop)  ? y : bl.offsetTop;
        break;

      case "top-right":
        x = (x > tl.offsetLeft) ? x : tl.offsetLeft;
        y = (y < br.offsetTop)  ? y : br.offsetTop;
        break;

      case "bottom-left":
        x = (x < br.offsetLeft) ? x : br.offsetLeft;
        y = (y > tl.offsetTop)  ? y : tl.offsetTop;
        break;

      case "bottom-right":
        x = (x > bl.offsetLeft) ? x : bl.offsetLeft;
        y = (y > tr.offsetTop)  ? y : tr.offsetTop;
        break;
    }
    return {x : x , y : y};
  };

  MAIN.prototype.set_trim_popinter_interlocking = function(target , li , x , y){
    var type = target.getAttribute("data-type");
    switch(type){
      case "top-left":
        var elm_x = li.querySelector("[data-type='bottom-left']");
        var elm_y = li.querySelector("[data-type='top-right']");
        break;
      case "top-right":
        var elm_x = li.querySelector("[data-type='bottom-right']");
        var elm_y = li.querySelector("[data-type='top-left']");
        break;
      case "bottom-left":
        var elm_x = li.querySelector("[data-type='top-left']");
        var elm_y = li.querySelector("[data-type='bottom-right']");
        break;
      case "bottom-right":
        var elm_x = li.querySelector("[data-type='top-right']");
        var elm_y = li.querySelector("[data-type='bottom-left']");
        break;
    }
    if(!elm_x || !elm_y){return;}
    elm_x.style.setProperty("left" , x + "px" , "");
    elm_y.style.setProperty("top"  , y + "px" , "");
  };

  MAIN.prototype.set_trim_popinter_area = function(li){

    var box = li.querySelector(".trim-box");
    if(!box){return}

    var top_left     = li.querySelector("[data-type='top-left']");
    var top_right    = li.querySelector("[data-type='top-right']");
    var bottom_left  = li.querySelector("[data-type='bottom-left']");

    var left   = top_left.offsetLeft;
    var top    = top_left.offsetTop;
    var width  = (top_right.offsetLeft  - top_left.offsetLeft);
    var height = (bottom_left.offsetTop - top_left.offsetTop);

    box.style.setProperty("left"   , left   + "px" , "");
    box.style.setProperty("top"    , top    + "px" , "");
    box.style.setProperty("width"  , width  + "px" , "");
    box.style.setProperty("height" , height + "px" , "");

    this.setAttribute_trimSize(li , {
      left   : left,
      top    : top,
      width  : width,
      height : height
    });
  };

  MAIN.prototype.setAttribute_trimSize = function(pic , viewSize){
    if(!pic || !viewSize){return;}
    
    var area = pic.querySelector(".trim-area");
    if(area.getAttribute("data-visible") !== "1"){return;}

    var box  = pic.querySelector(".trim-box");
    var img  = pic.querySelector("img.picture");
    var w = Number(img.naturalWidth);
    var h = Number(img.naturalHeight);
    var rate = (w > h) ? area.offsetWidth / w : area.offsetHeight / h;

    img.setAttribute("data-trim-width"  , Math.floor(box.offsetWidth  / rate));
    img.setAttribute("data-trim-height" , Math.floor(box.offsetHeight / rate));

    img.setAttribute("data-trim-x"      , Math.floor(box.offsetLeft   / rate));
    img.setAttribute("data-trim-y"      , Math.floor(box.offsetTop    / rate));

    // this.setInfo(pic.getAttribute("data-num") , img);
    this.viewImageSize(img);
  };

  // trim処理の終了処理
  MAIN.prototype.trim_pointer_up = function(){

    if(this.options.trim_pointer_target){
      this.options.trim_pointer_target.removeAttribute("data-active");
    }
    else if(this.options.trim_box.target){
      this.options.trim_box.target.removeAttribute("data-active");
    }

    // pointer
    if(this.options.trim_pointer_target
    && this.options.trim_pointer_imgSize
    && this.options.trim_pointer_parent){
      this.options.trim_pointer_target.removeAttribute("data-target");
      this.options.trim_pointer_target = null;
      this.options.trim_pointer_position = null;
      this.options.trim_pointer_cursor = null;
      this.options.trim_pointer_imgSize  = null;
      this.options.trim_pointer_parent = null;
    }
    
    // box
    else if(this.options.trim_box.target
    && this.options.trim_box.position
    && this.options.trim_box.cursor){
      this.options.trim_box = {
        relative : null,
        target   : null,
        position : null,
        cursor   : null
      };
    }
  };


  MAIN.prototype.setElementStyle_relative = function(trim_relative , img){
    var w = Number(img.naturalWidth);
    var h = Number(img.naturalHeight);
    var imgSize = this.getImageSize(img);
    
    if(trim.checkRotate(img)){
      trim_relative.style.setProperty("top"    , imgSize.left + "px" , "");
      trim_relative.style.setProperty("left"   , imgSize.top  + "px" , "");
  
      if(w > h){
        trim_relative.style.setProperty("width"  , imgSize.height + "px" , "");
        trim_relative.style.setProperty("height" , "100%" , "");
      }
      else{
        trim_relative.style.setProperty("width"  , "100%" , "");
        trim_relative.style.setProperty("height" , imgSize.width + "px" , "");
      }
    }
    // 回転 : 正常
    else{
      trim_relative.style.setProperty("top"    , imgSize.top  + "px" , "");
      trim_relative.style.setProperty("left"   , imgSize.left + "px" , "");
  
      if(w > h){
        trim_relative.style.setProperty("width"  , "100%" , "");
        trim_relative.style.setProperty("height" , imgSize.height + "px" , "");
      }
      else{
        trim_relative.style.setProperty("width"  , imgSize.width + "px" , "");
        trim_relative.style.setProperty("height" , "100%" , "");
      }
    }
  };

  MAIN.prototype.set_trim_box_control = function(px,py){
    var target = this.options.trim_box.target;
    if(!target){return}
    var x = this.options.trim_box.position.x - (this.options.trim_box.cursor.x - px);
    var y = this.options.trim_box.position.y - (this.options.trim_box.cursor.y - py);
    x = (x < 0) ? 0 : x;
    y = (y < 0) ? 0 : y;
    x = (x + target.offsetWidth  > target.parentNode.offsetWidth)  ? target.parentNode.offsetWidth  - target.offsetWidth  : x;
    y = (y + target.offsetHeight > target.parentNode.offsetHeight) ? target.parentNode.offsetHeight - target.offsetHeight : y;
    target.style.setProperty("left" , x + "px" , "");
    target.style.setProperty("top"  , y + "px" , "");

    // pointer
    this.setTrim_pointer(this.options.trim_box.relative);
  };

  // orientation + rotate = roll-value
  MAIN.prototype.checkRotate = function(img){
    if(!img){return null}

    var contents_area = new LIB().upperSelector(img , ".contents-area");
    if(!contents_area){return;}

    var orientation = contents_area.getAttribute("data-orientation");
    var rotate      = contents_area.getAttribute("data-rotate");

    orientation = (orientation) ? orientation : 0;
    rotate      = (rotate)      ? rotate      : 0;

    // rotate=on
    if(orientation == 6 || orientation == 8){
      return (rotate == 90 || rotate == 270) ? false : true;
    }
    // rotate=off
    else{
      return (rotate == 90 || rotate == 270) ? true : false;
    }
  };



  // ----------
  // submit-datas
  
  MAIN.prototype.getFileInfo = function(li){
    var contents_area = li.querySelector(".contents-area");
    if(!contents_area){return;}

    var img = li.querySelector("img.picture");
    if(!img){return;}

    var trim = {
      top    : null,
      left   : null,
      width  : null,
      height : null
    };
    var trim_area = li.querySelector(".trim-area");
    if(trim_area && trim_area.getAttribute("data-visible") === "1"){
      var trim_box = trim_area.querySelector(".trim-box");
      if(trim_box){
        trim.top    = trim_box.offsetTop;
        trim.left   = trim_box.offsetLeft;
        trim.width  = trim_box.offsetWidth;
        trim.height = trim_box.offsetHeight;
      }
    }

    return {
      "contents[exif]"        : img.getAttribute("data-exif"),
      "contents[width]"       : img.naturalWidth,
      "contents[height]"      : img.naturalHeight,
      "contents[orientation]" : contents_area.getAttribute("data-orientation") || 0,
      "contents[rotate]"      : contents_area.getAttribute("data-rotate") || 0,
      "contents[trim_top]"    : trim.top,
      "contents[trim_left]"   : trim.left,
      "contents[trim_width]"  : trim.width,
      "contents[trim_height]" : trim.height
    };
  };

  return MAIN;
})();
