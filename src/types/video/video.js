(function(){

  var MAIN = function(){};

  MAIN.prototype.options = {
    template : null
  };

  // プレビュー表示の写真表示箇所のエレメントセット
  MAIN.prototype.setList = function(fl , options , dom){

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
      info_size.textContent = new LIB().convertSize(fl.size , 2 , 1000);
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

    var video  = li.querySelector(".video");
    if(!video){return;}
    var source = video.querySelector(".source");
    if(!source){return;}
    var path = URL.createObjectURL(fl);
    source.src = path;

    new LIB().event(video , "loadedmetadata" , (function(li,e){
      var audio = e.target;
      var info_time = li.querySelector(".info-time");
      if(info_time){
        var time  = audio.duration;
        info_time.textContent = new LIB().setFormatTime(time);
      }
    }).bind(this,li));
    



    return li;
  };


  MAIN.prototype.getVideoInfo = function(file){
    // IDv3
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (function(li , file , size , e){
      var filename = file.name;
      var type     = file.type;

      var res = new GET().getMp3ID3Tag(e.target.result , e.target.buffer);
      // console.log(res);
      var info_time = li.querySelector(".info-time");
      var endtime = li.querySelector(".info-time").getAttribute("data-endtime");
      if(info_time){
        info_time.textContent = new LIB().setFormatTime(endtime , "ms");
      }
    }).bind(this , li , file , size);
  };




  // ----------
  // submit-datas
  
  MAIN.prototype.getListData = function(options , file){
    if(!options){return;}

    return {
      name : file.name,
      size : file.size,
      mime : file.type,
      modi : file.lastModified,
      date : (Date.parse(file.lastModifiedDate))
    };
  };


  
  return MAIN;
})();
