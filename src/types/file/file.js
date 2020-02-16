(function(){

  var MAIN = function(){};

  MAIN.prototype.options = {
    // scriptname    : "",
    template      : null
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

    return li;
  };


  // ----------
  // submit-datas


  MAIN.prototype.getFileInfo = function(options , cache , li){
    if(!li){return;}
    if(!cache){return;}

    var file   = cache[0];
    var path_i = new LIB().pathinfo(file.name);

    return {
      imageFile : file,

      "uplo[id]"   : options.id,
      "uplo[num]"  : options.count - cache.length,
      "uplo[name]" : li.querySelector("[name='name']").value,
      "uplo[ext]"  : path_i.extension.toLowerCase(),
      "uplo[type]" : li.getAttribute("data-type"),

      "uplo[file]" : file.name,
      "uplo[size]" : file.size,
      "uplo[mime]" : file.type,
      "uplo[modi]" : file.lastModified,
      "uplo[date]" : Date.parse(file.lastModifiedDate)
    };

  };


  return MAIN;
})();
