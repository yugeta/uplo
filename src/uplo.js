;$$uplo = (function(){

  var __modules = {
      image : {
        file : "types/image/image.js",
        css  : "types/image/image.css",
        tpl  : "types/image/template.html",
        librarys : {
          exif : {
            file : "lib/exif.js"
          }
        }
      },
      audio : {
        file : "types/audio/audio.js",
        css  : "types/audio/audio.css",
        tpl  : "types/audio/template.html",
        librarys : {
          mp3_id3 : {
            file : "lib/mp3_id3.js"
          }
          // encoding : {
          //   file : "lib/encoding.js"
          // }
          // id3 : {
          //   file : "lib/id3.js"
          // }
        }
      },
      video : {
        file : "types/video/video.js",
        css  : "types/video/video.css",
        tpl  : "types/video/template.html"
      },
      file : {
        file : "types/file/file.js",
        css  : "types/file/file.css",
        tpl  : "types/file/template.html"
      }
  };

  var __options = {
    scriptname    : "uplo",
    prefix        : "uplo",
    id            : null, // インスタンス（送信用とする）識別子 : システム利用用（設定不可）
    count         : null, // 送信する画像の総合枚数（送信ボタンを押すと確定） : システム利用用（設定不可）
    cacheTime     : null, // システム利用用（設定不可）
    currentPath   : null, // システム利用用（設定不可）

    btn_selector  : "#uplo", // クリックするボタンのselectors（複数対応）

    // 画像アップロード前のプレビュー用
    max_size      : null, // アップロードできる最大容量 (数値を入れると制限される , 1,1k,1m,1g)
    contentTypes  : [], // アップロードできるmimeタイプのホワイトリスト（登録がない場合は全ファイルアップロード可能）

    css_path      : null, // 表示系cssの任意指定（デフォルト(null)は起動スクリプトと同一階層）
    file_multi    : true, // 複数ファイルアップロード対応 [ true : 複数  , false : 1つのみ]
    // img_rotate_button  : null, // 画像編集の回転機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    // img_delete_button  : null, // 画像編集の削除機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    flg_icon_comment   : null, // 画像編集のコメント機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_trim_button    : true,

    // 機能（アイコン）表示フラグ
    flg_icon_rotate  : true,
    flg_icon_trim    : true,
    // flg_icon_comment : true,

    // post-data
    querys           : {},   // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)
    postStringFormat : "",  // post-string-format ["":HTML-ENTITIES , encode:encodeURIComponent(php->urldecode())]

    // comment
    comment : {
      placeholder : "Comment...",
    },

    file_select   : function(res){},  // ファイル選択直後の任意イベント処理
    post_success  : function(res){},  // 1ファイルファイル送信完了後の任意イベント処理
    post_finish   : function(res){},  // すべてのファイル送信完了後の任意イベント処理
    post_error    : function(res , options){
      console.log("Error ! " + (res ? res : ""));
    }   // ファイル送信エラーの時の任意イベント処理
  };

  var __dom = {
    base : "uplo-base",
      ul : "uplo-ul",
        li : "uplo-li",
          header : "header",
            num      : "num",
            filename : "filename",
            delete   : "delete",
          contents_area : "contents-area",
            img : "picture",

          info : "info",
            info_type  : "info-type",
            info_size  : "info-size",

          comment_icon : "comment-icon",
          comment_area : "comment-area",
            comment_title : "comment-title",
            comment_form  : "comment-form",
        
    buttons : "buttons",
      btn_submit : "button_submit",
      btn_cancel : "button_cancel",
      uploading  : "uploading",
      uploading_dot : "dot"
  }

  var __contentTypes = {
    image : [
      {ext  : "gif" , mime : "image/gif"},
      {ext  : "jpg" , mime : "image/jpeg"},
      {ext  : "jpg" , mime : "image/png"},
      {ext  : "svg" , mime : "image/svg+xml"},
      {ext  : "ico" , mime : "image/vnd.microsoft.icon"}
    ],  
    audio : [  
      {ext  : "mp3" , mime : "audio/mpeg"},
      {ext  : "mp3" , mime : "audio/mp3"},
      {ext  : "m4a" , mime : "audio/aac"},
      {ext  : "m4a" , mime : "audio/x-m4a"},
      {ext  : "ogg" , mime : "audio/ogg"},
      {ext  : "wav" , mime : "audio/wav"}
    ],  
    video : [  
      {ext  : "mp4" , mime : "video/mp4"},
      {ext  : "mpg" , mime : "video/mpeg"},
      {ext  : "ogv" , mime : "video/ogg"},
      {ext  : "mov" , mime : "video/quicktime"},
      {ext  : "avi" , mime : "video/x-msvideo"}
    ]
  };



  var LIB     = function(){};

  // 起動scriptタグを選択
  LIB.prototype.currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return this.currentScriptTag = scripts[scripts.length-1].src;
  })();

  // [共通関数] イベントセット
	LIB.prototype.event = function(target, mode, func , option , wait){
    option = (option) ? option : false;
    wait = (wait) ? wait : 0;
		if (target.addEventListener){target.addEventListener(mode, func, option)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};

  // [共通関数] URL情報分解
	LIB.prototype.urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };
  LIB.prototype.pathinfo = function(path){
    if(!path){return null;}
    var basename  = "",
        dirname   = [],
        filename  = [],
        extension = "";
    var paths = path.split("/");
    for(var i=0; i<paths.length-1; i++){
      dirname.push(paths[i]);
    }
    basename = paths[paths.length-1];
    var basenames = basename.split(".");
    for(var i=0;i<basenames.length-1;i++){
      filename.push(basenames[i]);
    }
    extension = basenames[basenames.length-1];
    return {
      "basename":basename,
      "dirname":dirname.join("/"),
      "filename":filename.join("."),
      "extension":extension
    };
  };

  // [共通関数] DOMの上位検索
  LIB.prototype.upperSelector = function(elm , selectors) {
    selectors = (typeof selectors === "object") ? selectors : [selectors];
    if(!elm || !selectors){return;}
    var flg = null;
    for(var i=0; i<selectors.length; i++){
      for (var cur=elm; cur; cur=cur.parentElement) {
        if (cur.matches(selectors[i])) {
          flg = true;
          break;
        }
      }
      if(flg){
        break;
      }
    }
    return cur;
  }

  // [共通関数] ブラウザのFileAPIが利用できるかどうかチェックする
  LIB.prototype.checkFileAPI = function(){
    // FileApi確認
		if( window.File
    && window.FileReader
    && window.FileList
    && window.Blob) {
      return true;
    }
    else{
      return false;
    }
  };

  LIB.prototype.convertSize = function(bite , decimal , kiro){
    decimal = (decimal) ? Math.pow(10,decimal) : 10;
    var kiro = kiro ? kiro : 1024;
    var size = bite;
    var unit = "B";
    var units = ["B" , "KB" , "MB" , "GB" , "TB"];
    for(var i=(units.length-1); i>0; i--){
      if(bite / Math.pow(kiro,i) > 1){
        size = Math.round(bite / Math.pow(kiro,i) * decimal) / decimal ;
        unit = units[i];
        break;
      }
    }
    return String(size) +" "+ unit;
  }

  // 1M->1000000 , 1K->1000 , 1G->1000000000 , 1T->1000000000000
  LIB.prototype.restoreSize = function(string , kiro){
    if(!string){return false;}
    var kiro = kiro || 1024;
    var reg = RegExp("^([0-9\.]+?)([kmgt]{1}b*)$","i");
    string.match(reg);
    if(!RegExp.$1 || !RegExp.$2){return false;}
    var num = Number(RegExp.$1);
    var unit = RegExp.$2.charAt(0).toLowerCase();
    var units = ["b" , "k" , "m" , "g" , "t"];
    res = false;
    if(units.indexOf(unit) !== -1){
      unit_num = units.indexOf(unit);
      calc_num = num * Math.pow(kiro , unit_num);
      res = Math.round(calc_num);
    }
    return res;
  };

  // [共通関数] JS読み込み時の実行タイミング処理（body読み込み後にJS実行する場合に使用）
	LIB.prototype.construct = function(func){
    var lib = func();
    switch(document.readyState){
      case "complete"    : (function(func){func}).bind(func);break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , (function(func){func}).bind(func) );break;
      default            : lib.event(window , "load"             , (function(func){func}).bind(func) );break;
		}
  };

  LIB.prototype.isIOSdevice = function(){
    if(typeof window.ontouchstart === "undefined"){
      return false;
    }

    if(navigator.userAgent.indexOf("iPhone") !== -1
    || navigator.userAgent.indexOf("iPad") !== -1
    || navigator.userAgent.indexOf("Macintosh") !== -1){
      return true;
    }

    return false;
  };

  LIB.prototype.setFormatTime = function(time , mode){
		var time2 = parseInt(time * 10 , 10) /10;
		var m = parseInt(time2 / 60 , 10);
		m = (m < 10) ? "0" + m.toFixed() : m.toFixed();
		var s = parseInt(time2 % 60 , 10);
		s = (s < 10) ? "0" + s.toFixed() : s.toFixed();
		var ms = parseInt((time % 1) * 100 , 10);
    ms = (ms < 10) ? "0" + ms.toFixed() : ms.toFixed();
    if(mode === "ms"){
      return m +":"+ s;
    }
    else{
      return m +":"+ s +":"+ ms;
    }
  };





  var AJAX = function(options){
    if(!options){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return;}
		// open メソッド;
		var option = this.setOption(options);

		// queryデータ
		var data = this.setQuery(option);
		if(!data.length){
			option.method = "get";
		}

		// 実行
		httpoj.open( option.method , option.url , option.async );
		// type
		if(option.type){
			httpoj.setRequestHeader('Content-Type', option.type);
		}
		
		// onload-check
		httpoj.onreadystatechange = function(){
			//readyState値は4で受信完了;
			if (this.readyState==4 && httpoj.status == 200){
				//コールバック
				option.onSuccess(this.responseText);
			}
		};

		// FormData 送信用
		if(typeof option.form === "object" && Object.keys(option.form).length){
			httpoj.send(option.form);
		}
		// query整形後 送信
		else{
			//send メソッド
			if(data.length){
				httpoj.send(data.join("&"));
			}
			else{
				httpoj.send();
			}
		}
		
  };
	AJAX.prototype.dataOption = {
		url:"",
		query:{},				// same-key Nothing
		querys:[],			// same-key OK
		data:{},				// ETC-data event受渡用
		form:{},
		async:"true",		// [trye:非同期 false:同期]
		method:"POST",	// [POST / GET]
		type:"application/x-www-form-urlencoded", // ["text/javascript" , "text/plane"]...
		onSuccess:function(res){},
		onError:function(res){}
	};
	AJAX.prototype.option = {};
	AJAX.prototype.createHttpRequest = function(){
		//Win ie用
		if(window.ActiveXObject){
			//MSXML2以降用;
			try{return new ActiveXObject("Msxml2.XMLHTTP")}
			catch(e){
				//旧MSXML用;
				try{return new ActiveXObject("Microsoft.XMLHTTP")}
				catch(e2){return null}
			}
		}
		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
		else{return null}
	};
	AJAX.prototype.setOption = function(options){
		var option = {};
		for(var i in this.dataOption){
			if(typeof options[i] != "undefined"){
				option[i] = options[i];
			}
			else{
				option[i] = this.dataOption[i];
			}
		}
		return option;
	};
	AJAX.prototype.setQuery = function(option){
		var data = [];
		if(typeof option.datas !== "undefined"){

			// data = option.data;
			for(var key of option.datas.keys()){
				data.push(key + "=" + option.datas.get(key));
			}
		}
		if(typeof option.query !== "undefined"){
			for(var i in option.query){
				data.push(i+"="+encodeURIComponent(option.query[i]));
			}
		}
		if(typeof option.querys !== "undefined"){
			for(var i=0;i<option.querys.length;i++){
				if(typeof option.querys[i] == "Array"){
					data.push(option.querys[i][0]+"="+encodeURIComponent(option.querys[i][1]));
				}
				else{
					var sp = option.querys[i].split("=");
					data.push(sp[0]+"="+encodeURIComponent(sp[1]));
				}
			}
		}
		return data;
	};




  

  

  

  var UPLO = function(options){
    if(!options){return}
    this.init(options);
  };

  UPLO.prototype.init = function(options){

    if(!window.FormData){
      console.log("データ送信機能がブラウザに対応していません。");
      return;
    }

    if(!window.XMLHttpRequest){
      console.log("AJAX機能がブラウザに対応していません。");
      return;
    }

    if(!__modules){return;}
    if(typeof this.load_flg !== "undefined"){
      setTimeout((function(options){this.start(options);}).bind(this , options),1000);
    }
    this.load_flg = true;
    var flg = this.loadModules(options);
    if(!flg){
      this.start(options);
    }
  };
  UPLO.prototype.loadModules = function(options){
    if(!__modules){return;}

    var base_script = new LIB().currentScriptTag;
    var base_url = new LIB().urlinfo(base_script);

    var flg = 0;
    for(var key in __modules){
      this.loadModule(base_url.dir , key , __modules[key] , options);
      flg++;
    }
    return flg;
  }
  UPLO.prototype.loadModule = function(dir , type , moduleData , options){
    if(typeof UPLO[type] !== "undefined"){return;}
    if(typeof moduleData["file"] === "undefined"){return;}

    var path = dir + moduleData["file"] +"?"+(+new Date());
    new AJAX({
      url : path,
      onSuccess : (function(type , options , res){
        if(!options){return;}
        UPLO[type] = eval(res);
        new UPLO[type]().options.scriptname = type;
        if(this.checkModules()){
          this.start(options);
        }
      }).bind(this , type , options)
    });

    // 関連ライブラリの読み込み
    if(typeof moduleData.librarys !== "undefined"){
      for(var key in moduleData.librarys){
        this.loadJS(dir , moduleData.librarys[key]);
      }
    }
  };
  UPLO.prototype.loadJS = function(dir , libraryData){
    if(typeof libraryData["file"] === "undefined"){return;}
    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var script  = document.createElement("script");
    script.src  = dir + libraryData["file"];
    base.appendChild(script);
  }

  UPLO.prototype.checkModules = function(){
    if(!__modules){return;}
    for(var key in __modules){
      if(typeof UPLO[key] === "undefined"){
        return false;
      }
    }
    return true;
  };

  UPLO.prototype.start = function(options){
    if(!options){return;}
    this.options = this.setOptions(__options , options);
    this.setCurrentTime();
    this.setCss(this.options.currentPath +"uplo.css" , "uplo");
    this.setTemplate(this.options.currentPath +"uplo_template.html" , "uplo");
    for(var key in __modules){
      this.setCss_key(key);
      this.setTemplate_key(key);
    }
    this.setInputTypeFile();
    this.setButton();

  };

  // [初期設定] テンプレートhtmlをセット
  UPLO.prototype.setTemplate_key = function(type){
    if(!type){return;}
    if(typeof __modules[type] === "undefined"){return;}
    if(typeof __modules[type]["tpl"] === "undefined" || !__modules[type]["tpl"]){return;}
    this.setTemplate(this.options.currentPath + __modules[type]["tpl"] , type);
  };
  UPLO.prototype.setTemplate = function(file , type){
    if(!file){return;}
    new AJAX({
      url : file,
      method : "get",
      onSuccess : (function(dir , type , res){
        if(!res){return}
        res = res.replace(/\{\{dir\}\}/g , dir);
        if(typeof this.options.template === "undefined"){
          this.options.template = {};
        }
        this.options.template[type] = res;
      }).bind(this , this.options.currentPath , type)
    });
  };


  // [初期設定] インスタンス引数を基本設定(options)と入れ替える
  UPLO.prototype.setOptions = function(options1,options2){
    var newOptions = {};
    for(var i in options1){newOptions[i] = options1[i];}
    for(var i in options2){newOptions[i] = options2[i];}
    newOptions.id = Math.floor((+new Date)/1000);
    return newOptions;
  };

  // 重複登録されないように秒単位での識別子作成用IDの作成
  UPLO.prototype.setCurrentTime = function(){
    var lib = new LIB();
    this.options.cacheTime = (+new Date());
    if(this.options.currentPath === null && typeof lib.currentScriptTag === "string"){
      var pathinfo = lib.urlinfo(lib.currentScriptTag);
      this.options.currentPath = pathinfo.dir;
    }
  };

  // [初期設定] 基本CSSセット
  UPLO.prototype.setCss_key = function(key){
    if(!key){return;}
    if(typeof __modules[key] === "undefined"){return;}
    if(typeof __modules[key]["css"] === "undefined" || !__modules[key]["css"]){return;}
    this.setCss(this.options.currentPath + __modules[key]["css"] , key);
  };
  UPLO.prototype.setCss = function(file , key){
    if(!key || !file){return;}

    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var css  = document.createElement("link");
    css.rel  = "stylesheet";
    css.href = file;
    base.appendChild(css);
  };

  // データ登録用のinputタグ（隠し要素）の作成
  UPLO.prototype.setInputTypeFile = function(){
    var lib      = new LIB();
    var inp      = document.createElement("input");
		inp.type     = "file";
    inp.name     = this.options.prefix +"_" + this.options.cacheTime;
    inp.multiple = (this.options.file_multi) ? "multiple" : ""; // 複数登録フラグ
    if(this.options.contentTypes.length){
      inp.accept   = this.options.contentTypes.join(","); // 対応可能ファイルタイプのセット
    }
    inp.style.setProperty("display","none","");
    lib.event(inp , "change" , (function(e){this.file_select(e);}).bind(this));
    document.body.appendChild(inp);
  };

  // [初期設定] データ読み込みボタンclickイベント処理
  UPLO.prototype.setButton = function(){
    var lib  = new LIB();
    var btns = document.querySelectorAll(this.options.btn_selector);
    for(var i=0; i<btns.length; i++){
      lib.event(btns[i] , "click" , (function(e){this.clickFileButton(e)}).bind(this));
    }
  };

  // データ取得ボタンクリック時の処理
  UPLO.prototype.clickFileButton = function(){
    var typeFile = this.getForm_typeFile();
    if(!typeFile){return}
    typeFile.click();
  };

  // 処理用form内のtype=fileを取得
  UPLO.prototype.getForm_typeFile = function(){
    return document.querySelector("input[name='"+ this.options.prefix +"_"+ this.options.cacheTime +"']");
  };

  // ファイルをピックアップした直後の処理
  UPLO.prototype.file_select = function(e){
    var lib = new LIB();
    if(!lib.checkFileAPI()){return;}
    var input = e.currentTarget;
    if(!input){return;}
    
    var files = input.files;
    if(!files || !files.length){return;}

    // システムデータ保持
    this.options.id = Math.floor((+new Date())/1000);
    this.options.count = input.files.length;

    // リスト表示処理
    var ul = this.viewBG();
    if(!ul){return;}
    for(var i=0; i<files.length; i++){
      var type = this.checkContentType(files[i].type);
      type = type ? type : "file";
      if(typeof UPLO[type] !== "undefined"){
        var li = new UPLO[type]().setList(files[i] , this.options , __dom , i);
        li.setAttribute("data-num" , i);
        li.setAttribute("data-type" , type);
        var deleteButton = li.querySelector("."+__dom.delete);
        if(deleteButton){
          new LIB().event(deleteButton , "click" , (function(e){this.clickDeleteButton(e)}).bind(this));
        }

        if(!li){continue}
        ul.appendChild(li);
        
        if(this.options.max_size){
          this.checkMaxSize(li , files[i] , this.options.max_size);
        }
      }
      
      
    }

    if(typeof this.options.file_select === "function"){
      this.options.file_select(e);
    }
  };

  UPLO.prototype.checkMaxSize = function(li , file , max){
    if(!li || !file || !max){return;}
    var num = new LIB().restoreSize(max);
    if(Number(file.size) <= Number(num)){return;}
    li.setAttribute("data-size-over" , "1");
  };

  // contentTypeから種類の算出
  UPLO.prototype.checkContentType = function(mime){
    if(!mime){return "";}
    for(var type in __contentTypes){
      for(var data in __contentTypes[type]){
        if(__contentTypes[type][data].mime === mime){
          return (typeof UPLO[type] !== "undefined") ? type : "";
        }
      }
    }
    return "";
  };

  // [画像編集] BG表示
  UPLO.prototype.viewBG = function(){

    var parser = new DOMParser();
    var dom    = parser.parseFromString(this.options.template[this.options.scriptname], "text/html");
    var base   = dom.querySelector("."+ __dom.base);
    if(!base){
      console.log(this.options.template[this.options.scriptname]);
      console.log("Error ! no-dom. :" + this.options.scriptname);
      return;
    }
    document.body.appendChild(base);
    // var template = this.options.template[this.options.scriptname];
    // document.body.insertAdjacentHTML("beforeend" , template);

    var btn_cancel = base.querySelector("."+ __dom.base +" ."+ __dom.btn_cancel);
    if(btn_cancel){
      new LIB().event(btn_cancel , "click" , (function(e){this.clickCancel(e)}).bind(this));
    }

    var btn_submit = base.querySelector("."+ __dom.base +" ."+ __dom.btn_submit);
    if(btn_submit){
      new LIB().event(btn_submit , "click" , (function(e){this.clickSubmitButton(e)}).bind(this));
    }

    var base = this.getBase();
    return base.querySelector("."+ __dom.ul);
  };


  UPLO.prototype.clickDeleteButton = function(e){
    var target = e.currentTarget;

    var targetListBase = new LIB().upperSelector(target , ["."+__dom.li]);
    if(!targetListBase){return;}

    targetListBase.parentNode.removeChild(targetListBase);

    // ラスト１つを削除した場合は、キャンセル扱い
    var lists = this.getContentsLists();
    if(!lists || !lists.length){
      this.clickCancel();
    }

    // キャッシュデータを更新
    this.options.count = lists.length;
  }

  // 編集画面の画像一覧リストの取得
  UPLO.prototype.getContentsLists = function(){
    var base = this.getBase();
    return base.querySelectorAll("."+ __dom.li);
  };

  UPLO.prototype.clickCancel = function(){
    var base = this.getBase();
    if(base){
      base.parentNode.removeChild(base);
    }
    var input = this.getForm_typeFile();
    if(input){
      input.value = "";
    }
  };

  UPLO.prototype.getBase = function(){
    var lists = document.getElementsByClassName(__dom.base);
    if(lists.length){
      return lists[0];
    }
    else{
      return null;
    }
  };

  // ----------
  // submit

  UPLO.prototype.clickSubmitButton = function(e){
    var input = this.getForm_typeFile();
    var files = input.files;
    var lists = this.getContentsLists();
    for(var i=0; i<lists.length; i++){
      var sizeCheck = lists[i].getAttribute("data-size-over");
      if(sizeCheck === "1"){
        lists[i].parentNode.removeChild(lists[i]);
        continue;
      }
      var num = lists[i].getAttribute("data-num");
      this.postFiles_cache.push(files[num]);
    }

    // submitボタンを押せないようにする
    this.disable_submitButtin(e.target);

    // uploading フラグ設置
    var base = this.getBase();
    var buttonArea = base.querySelector("."+ __dom.buttons );
    if(buttonArea){
      buttonArea.setAttribute("data-uploading","1");
    }

    if(this.postFiles_cache.length > 0){
      this.postFile(lists[0]);
    }
  };

  UPLO.prototype.disable_submitButtin = function(button){
    button.textContent = "...";
    button.disabled = true;
  };

  // ----------
  // データ送信(submit)処理
  UPLO.prototype.postFiles_cache = [];
  UPLO.prototype.postFile = function(li){

    // areaに送信中フラグをセット
    var area = li.querySelector("."+ __dom.contents_area);
    if(area){
      area.setAttribute("data-uploading" , "1");
    }

    // 全て送信完了したら編集画面を閉じる
    if(!this.postFiles_cache.length){
      this.clickCancel(this);
      return;
    }
    var fd = new FormData();
    // 任意項目の登録
    if(this.options.querys){
      for(var i in this.options.querys){
        fd.append(i , this.options.querys[i]);
      }
    }

    var type = li.getAttribute("data-type");
    if(!type){return;}

    var listData1 = new UPLO["file"]().getFileInfo(this.options , this.postFiles_cache , li);
    if(!listData1){return;}

    if(type !== "file"){
      var listData2 = new UPLO[type]().getFileInfo(li);
      listData2 = listData2 || {};
    }
    

    var listData = listData2 ? Object.assign(listData1 , listData2) : listData1;
    for(var i in listData){
      fd.append(i , listData[i]);
    }

    var xhr = new XMLHttpRequest();
    var url = (this.options.url) ? this.options.url : location.href;
    xhr.open('POST', url ,true);
    
    xhr.onreadystatechange = (function(xhr,e){
      switch(xhr.readyState){
        case 0:
          // 未初期化状態.
          // console.log( 'uninitialized!' );
          break;
        case 1: // データ送信中.
          // console.log( 'loading...' );
          break;
        case 2: // 応答待ち.
          // console.log( 'loaded.' );
          break;
        case 3: // データ受信中.
          // console.log( 'interactive... '+xhr.responseText.length+' bytes.' );
          break;
        case 4: // データ受信完了.
          switch(xhr.status){
            case 200 : console.log(this.postFiles_cache.length +":"+ xhr.responseText);

              var finish_flg = this.post_success();

              // ユーザー処理
              if(this.options.post_success){
                this.options.post_success(xhr.responseText , this.options);
              }

              // 複数ファイル完了処理
              if(finish_flg === true){
                this.options.post_finish(xhr.responseText , this.options);
              }

              break;
            case 404 :
              console.log("Error ! Not found program. (code:" + res +")");
              
              if(this.options.post_error){
                this.options.post_error(xhr.responseText , this.options)
              }
              break;
            case 500:
              console.log("Error ! Server program error. (code:"+ xhr.status +")");
            default :
              console.log("Error ! (code:"+ xhr.status+")");
              break;
          }
          break;
      }
    }).bind(this,xhr);
    xhr.send(fd);
  };



  UPLO.prototype.post_success = function(){

    // メモリしてあるファイル一覧から送信済みを削除
    if(this.postFiles_cache.length){
      this.postFiles_cache.shift();
    }

    // 表示一覧から送信済みを削除
    var lists = this.getContentsLists();
    if(lists.length){
      lists[0].parentNode.removeChild(lists[0]);
    }

    // 送信後の削除処理をした直後のエレメント一覧の取得
    var lists = this.getContentsLists();

    // 次のファイルが存在する場合、次のpost処理
    if(lists.length){
      setTimeout((function(list,e){this.postFile(list)}).bind(this,lists[0]) , 100);
      return false;
    }

    // 最終完了 (表示を閉じる)
    else{
      this.clickCancel();
      return true;
    }
  };

  UPLO.prototype.clickCancel = function(){
    var base = this.getBase();
    if(base){
      base.parentNode.removeChild(base);
    }

    var input = this.getForm_typeFile();
    input.value = "";
  };


  

  

  
  return UPLO;
})();
