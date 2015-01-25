	//データ保存用配列
	var ShopData = [];

	//フィールド名の設定
	//企業ID,店舗ID,店舗・施設名,郵便,住所１２３,住所４,緯度,経度,電話,FAX,URL,営業・利用可能時間,定休日,プレパス特典（協賛店のみ）,,,,,
	var Fields = ["co_id","sp_id","sp_name","zip_no","zip_main","zip_sub","lat","lng","tel","fax","url","open_time","holidy","special"];


$(function(){

        var mapOpts;
        var mapCanvas;

	//36.594702060135035,136.62559032440186
	var mapLat = "36.594702060135035";	//石川県庁
	var mapLng = "136.62559032440186";	//現在地が取得できない場合
	var mapZoom = 14;

	//36.87522650673951,136.86767578125
	var defLat  = "36.87522650673951";	//石川県全体見渡せる位置
	var defLng  = "136.86767578125";
	var defZoom = 8;

	var markersArray = [];

 	//csvデータの配列への読み込み
	csvToArray('data/prepath.csv', function(data){
		ShopData = [];
        	for (i in data){
               		if (i == 0) {
                		continue;
               		}
                		ShopData.push(data[i]);
            	}
       	});

	getLocation2();	//mapLat mapLng　に現在地をセットする
			//しかし、取得のタイミングが遅く、初期地図表示に間に合わない
   	mapInit();

	function mapInit(){
        	var latlng = new google.maps.LatLng(defLat, defLng);
        	mapOpts = {
            		zoom: defZoom,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
        	};
        	mapCanvas = new google.maps.Map(document.getElementById("map_canvas"), mapOpts);
    	}

	//マップの中心地を現在地に移動（暫定対策）
	function mapCenter(){
		var center = new google.maps.LatLng(mapLat,mapLng);
		var zoom = mapZoom;

		mapCanvas.setCenter(center);
		mapCanvas.setZoom(zoom);
	}

	//マップの中心地を初期化
	function mapClear(){
		var center = new google.maps.LatLng(defLat,defLng);
		var zoom = defZoom;

		mapCanvas.setCenter(center);
		mapCanvas.setZoom(zoom);
	}

	//search_bt onClick 
	$("#search_bt").click(function(){		
	       	search_exec();
        });
	//clear_br onClick
	$("#clear_bt").click(function(){
		for(var i=0 ; i < markersArray.length ; i++){
        		markersArray[i].setMap(null);
		}
		markersArray = [];

		//マップ初期化
		mapClear();
        });
	//place_bt onClick
	$("#place_bt").click(function(){
		//現在地へ
		mapCenter();
        });	

     	
	function callFieldNo(fname){
		for(var i=0 ; i < Fields.length ; i++){
			if(Fields[i] == fname){
				return i;
				break;
			}
		}
		return false;
	}

	function getLocation2() {
        	if (navigator.geolocation) {
           		navigator.geolocation.getCurrentPosition(successCallback2,errorCallback)
        	} else {
            		errorCallback();
        	}
    	}

   	function successCallback2(pos) {
        	var lat = pos.coords.latitude;
        	var lng = pos.coords.longitude;
        	$('#loading').hide();
        	//showGoogleMap(lat, lng);

		mapLat = lat;
		mapLng = lng;
    	}

	function search_exec(){
		//現在地の取得
		//navigator.geolocation.getCurrentPosition(successCallback2,errorCallback);

		var keyword = document.getElementById("search_txt").value;
		if(keyword == ""){
			alert("キーワードを入力してください");
			return false;
		}

		var sname = $('[name=search]').val();

		//var sname = "sp_name";
		var fno   = callFieldNo(sname);
		
		var flg = 0;
		var lat = 0, lng =0;
		for(var i =0 ; i < ShopData.length ; i++){
			if(ShopData[i][fno].indexOf(keyword)!=-1){

				pushPin2(mapCanvas , ShopData[i]);

				flg++;
			};
		}
		if(flg == 0){
			alert("データが見つかりませんでした");
		}else{
			alert(flg + "件のデータがありました");
		}
	}

   	function pushPin2(map ,data) {

        	//現在地のピン
        	var lat = data[callFieldNo("lat")];
        	var lng = data[callFieldNo("lng")];
        	var latlng = new google.maps.LatLng(lat, lng);
        	var marker = new google.maps.Marker({
           		position:latlng,
			icon : "icon/red_pin0.png",
			map: map
        	});

		var buff = "<div style='width:150px;'>";
		buff += data[callFieldNo("sp_name")];
		buff += "<br />" + data[callFieldNo("tel")];
		buff += "<br />" + data[callFieldNo("special")];

		var url = data[callFieldNo("url")];
		if(url != ""){
			buff += "<br />" + "<a href='" + url + "' target='_blank' >ホームページ</a>";
		}
		buff += "</div>";

        	google.maps.event.addListener(marker, 'click', function() {
           		var infowindow = new google.maps.InfoWindow({
                  		content: buff,
                  		position: marker.getPosition(),
            		});
            		infowindow.open(map,marker);
        	});

		marker.setMap(map);

		markersArray.push(marker);
   	}

	//*************

    //initlaize();

    function initlaize() {
        getLocation();
    }

    function showGoogleMap(initLat, initLng) {
        var latlng = new google.maps.LatLng(initLat, initLng);
        var opts = {
            zoom: 16,
center: latlng,
mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map_canvas"), opts);

        //現在地のピン
        /*
        var now_latlng = new google.maps.LatLng(initLat, initLng);
        var now_marker = new google.maps.Marker({
            position:now_latlng,
            title: '現在地',
            map: map,
        });
        */

        pushPins(map);
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback,errorCallback)
        } else {
            errorCallback();
        }
    }

    function successCallback(pos) {
        var lat = pos.coords.latitude;
        var lng = pos.coords.longitude;
        $('#loading').hide();
        showGoogleMap(lat, lng);
    }

    function errorCallback() {
        //alert("cannot get location");
	$("#loading").html("現在地が取得できませんでした");
    }

    function pushPins(map)
    {
        csvToArray('data/prepath.csv', function(data){
            for (i in data){
                if (i == 0) {
                    continue;
                }
                pushPin(map, data);
            }
        });
    }

    function pushPin(map, data) {
        //現在地のピン
        var lat = data[i][6];
        var lng = data[i][7];
        var latlng = new google.maps.LatLng(lat, lng);
        var marker = new google.maps.Marker({
            position:latlng,
            map: map
        });

        google.maps.event.addListener(marker, 'click', function() {
            var infowindow = new google.maps.InfoWindow({
                  content: 'click',
                  position: marker.getPosition(),
            });
            infowindow.open(map);
        });
    }

    function csvToArray(filename, callback) {
        $.get(filename, function(csvdata) {
            //CSVのパース作業
            //CRの解析ミスがあった箇所を修正しました。
            //以前のコードだとCRが残ったままになります。
            // var csvdata = csvdata.replace("\r/gm", ""),
            csvdata = csvdata.replace(/\r/gm, "");
            var line = csvdata.split("\n"),
        ret = [];
        for (var i in line) {
            //空行はスルーする。
            if (line[i].length == 0) continue;

            var row = line[i].split(",");

            ret.push(row);
        }
        callback(ret);
        });
    }
});

