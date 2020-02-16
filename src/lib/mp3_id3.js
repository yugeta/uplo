mp3_id3 = (function(){

  var LIB = function(){};

  LIB.prototype.bin2str = function(arr){
    var str = "";
    for(var i in arr){
      str += String.fromCharCode(arr[i]);
    }
    str = str.replace(/\u000f/g , "");
    return str;
  };

  // @ [0,1,2,3]
  LIB.prototype.size_bit = function(datas , bit){
    var num = 0;
    for(var i=0; i<datas.length; i++){
      var shift = (datas.length - 1 - i);
      if(shift){
        num += datas[i] << (bit * shift);
      }
      else{
        num += datas[i];
      }
    }
    return num;
  };

  LIB.prototype.getFrameKey = function(key){
    for(var i in frame_arr){
      if(frame_arr[i][0] === key){
        return i;
      }
      else if(frame_arr[i][1] === key){
        return i;
      }
    }
    return key;
  };

  LIB.prototype.txtEncoding = function(bite){
    switch(bite){
      case 0x00:
        return "iso-8859-1";
      case 0x01:
        return "utf-16";
      case 0x02:
        return "utf-16be";
      case 0x03:
        return "utf-8";
      default:
        return "iso-8859-1";
    }
  };
  LIB.prototype.bin2txt = function(data){
    var enc = new LIB().txtEncoding(data[0]);
    var dec = new TextDecoder(enc);
    switch(enc){
      case "utf-16":
      case "utf-16be":
      case "utf-8":
        var txt = dec.decode(data.slice(1));
        var esc = unescape(encodeURIComponent(txt));
        return decodeURIComponent(escape(esc));
      default:
        return dec.decode(data);
    }
  };



  var mp3_id3 = function(){};

  mp3_id3.prototype.read = function(file , callback){
    var reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = (function(e){
      var target = e.target;

      var res = this.v1(target.result , target.buffer);
      if(res === null){
        res = this.v2(target.result , target.buffer);
      }
      callback(res);
    }).bind(this);
  };




  // ----------
  // id3v1
  mp3_id3.prototype.v1 = function(binary){
    if(!binary){return null;}
    var data = (new Uint8Array(binary)).slice(-128);
    if (data[0] + data[1] + data[2] !== 220) {return null}
    var lib = new LIB();
    return {
      header : {
        id      : lib.bin2str(data.slice( 0,  0 + 3)),
        type    : 1,
        var     : (!data[127]) ? "1.0" : "1.1",
        version : (!data[127]) ? 0 : 1
      },
      frame : {
        title   : this.v1_str(data.slice( 3,  3 + 30)),
        artist  : this.v1_str(data.slice(33, 33 + 30)),
        album   : this.v1_str(data.slice(63, 63 + 30)),
        year    : lib.bin2str(data.slice(93, 93 +  4)),
        comment : this.v1_str(data.slice(97, 97 + 30)),
        track   : data[126],
        genre   : data[127] && typeof v1_genre[data[127]] !== "undefined" ? v1_genre[data[127]] : data[127]
      }
    };
  };
  mp3_id3.prototype.v1_str = function(data){
    var txt  = new TextDecoder("SJIS");
    return txt.decode(data);
  }


  // ----------
  // id3v2
  mp3_id3.prototype.v2 = function(binary , buffer){
    if(!binary){return null;}
    var data = new Uint8Array(binary);
    var res = {};

    // header
    var header = this.v2_header(data.slice(0 , 10));
    if(header.id !== "ID3"){return null;}
    res.header = header;

    // frame
    switch(header.version){
      case 2:
        var frame = this.v22_frames(data.slice(10 , header.size) , 0);
        break;

      case 3:
        var frame = this.v23_frames(data.slice(10 , header.size) , 0);
        break;
      case 4:
    }
    res.frame = frame;
    return res;
  };

  mp3_id3.prototype.v2_header = function(datas){
    return {
      id      : new LIB().bin2str(datas.slice(0, 3)),
      type    : 2,
      ver     : "2."+datas[3],
      version : datas[3],
      debug   : datas[4],
      flg     : datas[5],
      size    : this.v2_header_size(datas.slice(6, 6 + 4))
    };
  };

  mp3_id3.prototype.v2_header_size = function(datas){
    var num = 0;
    num += datas[0] << 0x15;
    num += datas[1] << 14;
    num += datas[2] << 7;
    num += datas[3];
    return num;
  };

  // ----------
  // v2.2
  mp3_id3.prototype.v22_frames = function(datas , offset){
    var res = {};
    while(datas.length > offset){
      var data = this.v22_frame(datas.slice(offset));
      if(!data.id){break;}
      if(data.size <= 6){break;}
      offset += data.size;
      var key = new LIB().getFrameKey(data.id);
      if(typeof res[key] === "undefined"){
        res[key] = data.data;
      }
      else{
        if(typeof res[key] === "string"){
          var d1 = res[key];
          res[key] = [];
          res[key].push(d1);
          
        }
        res[key].push(data.data);
      }
    }
    return res;
  };

  mp3_id3.prototype.v22_frame = function(datas){
    var lib = new LIB();
    var id       = datas.slice(0, 0 + 3);
    var size_arr = datas.slice(3, 3 + 3);
    var size     = lib.size_bit(size_arr , 8) + 6;
    var flg      = datas[6];
    var data_arr = datas.slice(7 , size);
    var utf16    = new TextDecoder("utf-16");
    var data     = flg ? utf16.decode(data_arr) : lib.bin2str(data_arr);
    data         = data.replace(/\u0000/g , "");

    
    return {
      id      : lib.bin2str(id),
      size    : size,
      flg     : flg,
      data    : data
    };
  };

  // ----------
  // v2.3
  mp3_id3.prototype.v23_frames = function(datas , offset){
    var res = {};
    while(datas.length > offset){
      var data = this.v23_frame(datas.slice(offset));
      if(!data.id){break;}
      if(data.size <= 10){break;}
      offset += data.size;
      var key = new LIB().getFrameKey(data.id);
      if(typeof res[key] === "undefined"){
        res[key] = data.data;
      }
      else{
        if(typeof res[key] === "string"){
          var d1 = res[key];
          res[key] = [];
          res[key].push(d1);
          
        }
        res[key].push(data.data);
      }
    }
    return res;
  };

  mp3_id3.prototype.v23_frame = function(datas){
    var lib = new LIB();
    var id       = datas.slice(0, 0 + 4);
    var size_arr = datas.slice(4, 4 + 4);
    var size     = lib.size_bit(size_arr , 8) + 10;
    var flg_arr  = datas.slice(8, 8 + 2);
    var flg      = lib.size_bit(flg_arr , 8);
    var data_arr = datas.slice(10 , size);
    var data     = new LIB().bin2txt(data_arr);
    data         = data.replace(/\u0000/g , "");

    return {
      id      : lib.bin2str(id),
      size    : size,
      flg     : flg,
      data    : data
    };
  };

  



  var PICTURE_TYPES = {
    "0": "Other",
    "1": "32x32 pixels 'file icon' (PNG only)",
    "2": "Other file icon",
    "3": "Cover (front)",
    "4": "Cover (back)",
    "5": "Leaflet page",
    "6": "Media (e.g. lable side of CD)",
    "7": "Lead artist/lead performer/soloist",
    "8": "Artist/performer",
    "9": "Conductor",
    A: "Band/Orchestra",
    B: "Composer",
    C: "Lyricist/text writer",
    D: "Recording Location",
    E: "During recording",
    F: "During performance",
    "10": "Movie/video screen capture",
    "11": "A bright coloured fish", //<--- WTF?
    "12": "Illustration",
    "13": "Band/artist logotype",
    "14": "Publisher/Studio logotype"
  };

  //from: http://bitbucket.org/moumar/ruby-mp3info/src/tip/lib/mp3info/id3v2.rb
  //TODO: replace with something longer
  var TAGS = {
    AENC: "Audio encryption",
    APIC: "Attached picture",
    COMM: "Comments",
    COMR: "Commercial frame",
    ENCR: "Encryption method registration",
    EQUA: "Equalization",
    ETCO: "Event timing codes",
    GEOB: "General encapsulated object",
    GRID: "Group identification registration",
    IPLS: "Involved people list",
    LINK: "Linked information",
    MCDI: "Music CD identifier",
    MLLT: "MPEG location lookup table",
    OWNE: "Ownership frame",
    PRIV: "Private frame",
    PCNT: "Play counter",
    POPM: "Popularimeter",
    POSS: "Position synchronisation frame",
    RBUF: "Recommended buffer size",
    RVAD: "Relative volume adjustment",
    RVRB: "Reverb",
    SYLT: "Synchronized lyric/text",
    SYTC: "Synchronized tempo codes",
    TALB: "Album",
    TBPM: "BPM",
    TCOM: "Composer",
    TCON: "Genre",
    TCOP: "Copyright message",
    TDAT: "Date",
    TDLY: "Playlist delay",
    TENC: "Encoded by",
    TEXT: "Lyricist",
    TFLT: "File type",
    TIME: "Time",
    TIT1: "Content group description",
    TIT2: "Title",
    TIT3: "Subtitle",
    TKEY: "Initial key",
    TLAN: "Language(s)",
    TLEN: "Length",
    TMED: "Media type",
    TOAL: "Original album",
    TOFN: "Original filename",
    TOLY: "Original lyricist",
    TOPE: "Original artist",
    TORY: "Original release year",
    TOWN: "File owner",
    TPE1: "Artist",
    TPE2: "Band",
    TPE3: "Conductor",
    TPE4: "Interpreted, remixed, or otherwise modified by",
    TPOS: "Part of a set",
    TPUB: "Publisher",
    TRCK: "Track number",
    TRDA: "Recording dates",
    TRSN: "Internet radio station name",
    TRSO: "Internet radio station owner",
    TSIZ: "Size",
    TSRC: "ISRC (international standard recording code)",
    TSSE: "Software/Hardware and settings used for encoding",
    TYER: "Year",
    TXXX: "User defined text information frame",
    UFID: "Unique file identifier",
    USER: "Terms of use",
    USLT: "Unsychronized lyric/text transcription",
    WCOM: "Commercial information",
    WCOP: "Copyright/Legal information",
    WOAF: "Official audio file webpage",
    WOAR: "Official artist/performer webpage",
    WOAS: "Official audio source webpage",
    WORS: "Official internet radio station homepage",
    WPAY: "Payment",
    WPUB: "Publishers official webpage",
    WXXX: "User defined URL link frame"
  };

  var TAG_MAPPING_2_2_to_2_3 = {
    BUF: "RBUF",
    COM: "COMM",
    CRA: "AENC",
    EQU: "EQUA",
    ETC: "ETCO",
    GEO: "GEOB",
    MCI: "MCDI",
    MLL: "MLLT",
    PIC: "APIC",
    POP: "POPM",
    REV: "RVRB",
    RVA: "RVAD",
    SLT: "SYLT",
    STC: "SYTC",
    TAL: "TALB",
    TBP: "TBPM",
    TCM: "TCOM",
    TCO: "TCON",
    TCR: "TCOP",
    TDA: "TDAT",
    TDY: "TDLY",
    TEN: "TENC",
    TFT: "TFLT",
    TIM: "TIME",
    TKE: "TKEY",
    TLA: "TLAN",
    TLE: "TLEN",
    TMT: "TMED",
    TOA: "TOPE",
    TOF: "TOFN",
    TOL: "TOLY",
    TOR: "TORY",
    TOT: "TOAL",
    TP1: "TPE1",
    TP2: "TPE2",
    TP3: "TPE3",
    TP4: "TPE4",
    TPA: "TPOS",
    TPB: "TPUB",
    TRC: "TSRC",
    TRD: "TRDA",
    TRK: "TRCK",
    TSI: "TSIZ",
    TSS: "TSSE",
    TT1: "TIT1",
    TT2: "TIT2",
    TT3: "TIT3",
    TXT: "TEXT",
    TXX: "TXXX",
    TYE: "TYER",
    UFI: "UFID",
    ULT: "USLT",
    WAF: "WOAF",
    WAR: "WOAR",
    WAS: "WOAS",
    WCM: "WCOM",
    WCP: "WCOP",
    WPB: "WPB",
    WXX: "WXXX"
  };

  //pulled from http://www.id3.org/id3v2-00 and changed with a simple replace
  //probably should be an array instead, but thats harder to convert -_-
  var v1_genre = {
    "0": "Blues",
    "1": "Classic Rock",
    "2": "Country",
    "3": "Dance",
    "4": "Disco",
    "5": "Funk",
    "6": "Grunge",
    "7": "Hip-Hop",
    "8": "Jazz",
    "9": "Metal",
    "10": "New Age",
    "11": "Oldies",
    "12": "Other",
    "13": "Pop",
    "14": "R&B",
    "15": "Rap",
    "16": "Reggae",
    "17": "Rock",
    "18": "Techno",
    "19": "Industrial",
    "20": "Alternative",
    "21": "Ska",
    "22": "Death Metal",
    "23": "Pranks",
    "24": "Soundtrack",
    "25": "Euro-Techno",
    "26": "Ambient",
    "27": "Trip-Hop",
    "28": "Vocal",
    "29": "Jazz+Funk",
    "30": "Fusion",
    "31": "Trance",
    "32": "Classical",
    "33": "Instrumental",
    "34": "Acid",
    "35": "House",
    "36": "Game",
    "37": "Sound Clip",
    "38": "Gospel",
    "39": "Noise",
    "40": "AlternRock",
    "41": "Bass",
    "42": "Soul",
    "43": "Punk",
    "44": "Space",
    "45": "Meditative",
    "46": "Instrumental Pop",
    "47": "Instrumental Rock",
    "48": "Ethnic",
    "49": "Gothic",
    "50": "Darkwave",
    "51": "Techno-Industrial",
    "52": "Electronic",
    "53": "Pop-Folk",
    "54": "Eurodance",
    "55": "Dream",
    "56": "Southern Rock",
    "57": "Comedy",
    "58": "Cult",
    "59": "Gangsta",
    "60": "Top 40",
    "61": "Christian Rap",
    "62": "Pop/Funk",
    "63": "Jungle",
    "64": "Native American",
    "65": "Cabaret",
    "66": "New Wave",
    "67": "Psychadelic",
    "68": "Rave",
    "69": "Showtunes",
    "70": "Trailer",
    "71": "Lo-Fi",
    "72": "Tribal",
    "73": "Acid Punk",
    "74": "Acid Jazz",
    "75": "Polka",
    "76": "Retro",
    "77": "Musical",
    "78": "Rock & Roll",
    "79": "Hard Rock",
    "80": "Folk",
    "81": "Folk-Rock",
    "82": "National Folk",
    "83": "Swing",
    "84": "Fast Fusion",
    "85": "Bebob",
    "86": "Latin",
    "87": "Revival",
    "88": "Celtic",
    "89": "Bluegrass",
    "90": "Avantgarde",
    "91": "Gothic Rock",
    "92": "Progressive Rock",
    "93": "Psychedelic Rock",
    "94": "Symphonic Rock",
    "95": "Slow Rock",
    "96": "Big Band",
    "97": "Chorus",
    "98": "Easy Listening",
    "99": "Acoustic",
    "100": "Humour",
    "101": "Speech",
    "102": "Chanson",
    "103": "Opera",
    "104": "Chamber Music",
    "105": "Sonata",
    "106": "Symphony",
    "107": "Booty Bass",
    "108": "Primus",
    "109": "Porn Groove",
    "110": "Satire",
    "111": "Slow Jam",
    "112": "Club",
    "113": "Tango",
    "114": "Samba",
    "115": "Folklore",
    "116": "Ballad",
    "117": "Power Ballad",
    "118": "Rhythmic Soul",
    "119": "Freestyle",
    "120": "Duet",
    "121": "Punk Rock",
    "122": "Drum Solo",
    "123": "A capella",
    "124": "Euro-House",
    "125": "Dance Hall"
  };



  var _frames = {
    // v2.2
    "BUF" : "Recommended buffer size",
    "CNT" : "Play counter",
    "COM" : "Comments",
    "CRA" : "Audio encryption",
    "CRM" : "Encrypted meta frame",
    "ETC" : "Event timing codes",
    "EQU" : "Equalization",
    "GEO" : "General encapsulated object",
    "IPL" : "Involved people list",
    "LNK" : "Linked information",
    "MCI" : "Music CD Identifier",
    "MLL" : "MPEG location lookup table",
    "PIC" : "Attached picture",
    "POP" : "Popularimeter",
    "REV" : "Reverb",
    "RVA" : "Relative volume adjustment",
    "SLT" : "Synchronized lyric/text",
    "STC" : "Synced tempo codes",
    "TAL" : "Album/Movie/Show title",
    "TBP" : "BPM (Beats Per Minute)",
    "TCM" : "Composer",
    "TCO" : "Content type",
    "TCR" : "Copyright message",
    "TDA" : "Date",
    "TDY" : "Playlist delay",
    "TEN" : "Encoded by",
    "TFT" : "File type",
    "TIM" : "Time",
    "TKE" : "Initial key",
    "TLA" : "Language(s)",
    "TLE" : "Length",
    "TMT" : "Media type",
    "TOA" : "Original artist(s)/performer(s)",
    "TOF" : "Original filename",
    "TOL" : "Original Lyricist(s)/text writer(s)",
    "TOR" : "Original release year",
    "TOT" : "Original album/Movie/Show title",
    "TP1" : "Lead artist(s)/Lead performer(s)/Soloist(s)/Performing group",
    "TP2" : "Band/Orchestra/Accompaniment",
    "TP3" : "Conductor/Performer refinement",
    "TP4" : "Interpreted, remixed, or otherwise modified by",
    "TPA" : "Part of a set",
    "TPB" : "Publisher",
    "TRC" : "ISRC (International Standard Recording Code)",
    "TRD" : "Recording dates",
    "TRK" : "Track number/Position in set",
    "TSI" : "Size",
    "TSS" : "Software/hardware and settings used for encoding",
    "TT1" : "Content group description",
    "TT2" : "Title/Songname/Content description",
    "TT3" : "Subtitle/Description refinement",
    "TXT" : "Lyricist/text writer",
    "TXX" : "User defined text information frame",
    "TYE" : "Year",
    "UFI" : "Unique file identifier",
    "ULT" : "Unsychronized lyric/text transcription",
    "WAF" : "Official audio file webpage",
    "WAR" : "Official artist/performer webpage",
    "WAS" : "Official audio source webpage",
    "WCM" : "Commercial information",
    "WCP" : "Copyright/Legal information",
    "WPB" : "Publishers official webpage",
    "WXX" : "User defined URL link frame",
    // v2.3
    "AENC" : "Audio encryption",
    "APIC" : "Attached picture",
    "COMM" : "Comments",
    "COMR" : "Commercial frame",
    "ENCR" : "Encryption method registration",
    "EQUA" : "Equalization",
    "ETCO" : "Event timing codes",
    "GEOB" : "General encapsulated object",
    "GRID" : "Group identification registration",
    "IPLS" : "Involved people list",
    "LINK" : "Linked information",
    "MCDI" : "Music CD identifier",
    "MLLT" : "MPEG location lookup table",
    "OWNE" : "Ownership frame",
    "PRIV" : "Private frame",
    "PCNT" : "Play counter",
    "POPM" : "Popularimeter",
    "POSS" : "Position synchronisation frame",
    "RBUF" : "Recommended buffer size",
    "RVAD" : "Relative volume adjustment",
    "RVRB" : "Reverb",
    "SYLT" : "Synchronized lyric/text",
    "SYTC" : "Synchronized tempo codes",
    "TALB" : "Album/Movie/Show title",
    "TBPM" : "BPM (beats per minute)",
    "TCOM" : "Composer",
    "TCON" : "Content type",
    "TCOP" : "Copyright message",
    "TDAT" : "Date",
    "TDLY" : "Playlist delay",
    "TENC" : "Encoded by",
    "TEXT" : "Lyricist/Text writer",
    "TFLT" : "File type",
    "TIME" : "Time",
    "TIT1" : "Content group description",
    "TIT2" : "Title/songname/content description",
    "TIT3" : "Subtitle/Description refinement",
    "TKEY" : "Initial key",
    "TLAN" : "Language(s)",
    "TLEN" : "Length",
    "TMED" : "Media type",
    "TOAL" : "Original album/movie/show title",
    "TOFN" : "Original filename",
    "TOLY" : "Original lyricist(s)/text writer(s)",
    "TOPE" : "Original artist(s)/performer(s)",
    "TORY" : "Original release year",
    "TOWN" : "File owner/licensee",
    "TPE1" : "Lead performer(s)/Soloist(s)",
    "TPE2" : "Band/orchestra/accompaniment",
    "TPE3" : "Conductor/performer refinement",
    "TPE4" : "Interpreted, remixed, or otherwise modified by",
    "TPOS" : "Part of a set",
    "TPUB" : "Publisher",
    "TRCK" : "Track number/Position in set",
    "TRDA" : "Recording dates",
    "TRSN" : "Internet radio station name",
    "TRSO" : "Internet radio station owner",
    "TSIZ" : "Size",
    "TSRC" : "ISRC (international standard recording code)",
    "TSSE" : "Software/Hardware and settings used for encoding",
    "TYER" : "Year",
    "TXXX" : "User defined text information frame",
    "UFID" : "Unique file identifier",
    "USER" : "Terms of use",
    "USLT" : "Unsychronized lyric/text transcription",
    "WCOM" : "Commercial information",
    "WCOP" : "Copyright/Legal information",
    "WOAF" : "Official audio file webpage",
    "WOAR" : "Official artist/performer webpage",
    "WOAS" : "Official audio source webpage",
    "WORS" : "Official internet radio station homepage",
    "WPAY" : "Payment",
    "WPUB" : "Publishers official webpage",
    "WXXX" : "User defined URL link frame"
  };

  var header_arr = [
    "id",
    "type",
    "version",
    "debug",
    "flg",
    "size"

  ];
  var frame_arr = {
    "title"     : ["TIT2", "TT2"],
    "artist"    : ["TPE1", "TP1"],
    "album"     : ["TALB", "TAL"],
    "year"      : ["TYER", "TYE"],
    "comment"   : ["COMM", "COM"],
    "track"     : ["TRCK", "TRK"],
    "genre"     : ["TCON", "TCO"],
    "picture"   : ["APIC", "PIC"],
    "lyrics"    : ["USLT", "ULT"]
  };
  var _defaultShortcuts = ["title", "artist", "album", "track"];




  return mp3_id3;
})();