(function(){

  var MAIN = function(){};

  MAIN.prototype.datas = {};

  MAIN.prototype.options = {
    template : null
  };

  // プレビュー表示の写真表示箇所のエレメントセット
  MAIN.prototype.setList = function(fl , options , dom , num){

    var parser = new DOMParser();
    var doc = parser.parseFromString(options.template[this.options.scriptname], "text/html");
    var li = doc.querySelector("."+ dom.li);

    var commentButton = li.querySelector(".comment-area");
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
      info_size.textContent = new LIB().convertSize(fl.size , 2 ,1000);
    }

    var commentForm = li.querySelector("."+ dom.comment_form);
    if(commentForm){
      commentForm.placeholder = (options.comment.placeholder) ? options.comment.placeholder : "";
    }

    // sound-proc
    // this.options.dom = dom;
    // var snd = li.querySelector(".audio");
    // snd.onload = (function(e){
    //   var snd = e.target;
    //   this.setExif(snd);
    //   this.viewImageSize(snd);
    //   this.setTrim(snd);
    // }).bind(this);

    var audio  = li.querySelector(".audio");
    if(!audio){return;}
    var source = audio.querySelector(".source");
    if(!source){return;}
    var path = URL.createObjectURL(fl);
    source.src = path;

    new LIB().event(audio , "loadedmetadata" , (function(li,e){
      var audio = e.target;
      var info_time = li.querySelector(".info-time");
      if(info_time){
        var time  = audio.duration;
        info_time.textContent = new LIB().setFormatTime(time);
      }
    }).bind(this,li));
    

    // this.setTag(fl);
    new mp3_id3().read(fl , (function(num , data){
      if(!data){return;}
      if(typeof data.header === "undefined"
      || typeof data.frame === "undefined"){return;}

      var newFrame = {
        id3     : data.header.ver     || "",
        title   : data.frame.title    || "",
        artist  : data.frame.artist   || "",
        album   : data.frame.album    || "",
        year    : data.frame.year     || "",
        track   : data.frame.track    || "",
        genre   : data.frame.genre    || ""
      };
      
      this.datas[num] = {
        header : data.header,
        frame  : newFrame
      };
      
    }).bind(this , num));
    

    return li;
  };



  // ----------
  // submit-datas
  MAIN.prototype.getFileInfo = function(li){
    var num = li.getAttribute("data-num");
    if(typeof this.datas[num] !== "undefined"
    && typeof this.datas[num].frame !== "undefined"){
      var res = {};
      for(var i in this.datas[num].frame){
        res["contents["+i+"]"] = this.datas[num].frame[i];
      }
      return res;
    }
    else{
      return null;
    }
  };

  
  return MAIN;
})();
