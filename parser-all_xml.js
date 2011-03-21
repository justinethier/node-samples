/**
 * Parser for all_xml.zip data 
 * by Justin Ethier
 *
 * Read all XMl files in the current directory, and output their weather data
 * to the console as JSON.
 *
 * Indended to be run within a directory containing the extracted contents of
 * the all_xml.zip file obtained from NOAA:
 *
 * http://www.weather.gov/xml/current_obs/all_xml.zip
 *
 *
 *
 * TODO: need to integrate this with ZIP Code data ( http://zips.sourceforge.net/ )
 *       and a nearest neighbor search to tag each station with a zip code.
 *
 *       ideally it would be nice if there was a high-speed nearest neighbor
 *       algorithm we could tie into, written in either C or python.
 *       it would be nice to keep it in JS, but that might not be practical
 *       in terms of speed.
 */ 
kd = require('kdtree');
fs = require('fs');
jQuery = require('jquery');

var i = 0;
var tree = new kd.KDTree(2);

function loadWeatherData(){
    jQuery.each(files, function(index, filename){
        filename = 'data/tmp/' + filename;
        if (filename.substr(filename.length-4, 4) == ".xml") {
            data = fs.readFileSync(filename, 'utf-8');
            var stationRe = new RegExp("<station_id>(.*)</station_id>"),
                stationAr = stationRe.exec(data),
                locRe = new RegExp("<location>(.*)</location>"),
                locAr = locRe.exec(data),
                latRe = new RegExp("<latitude>(.*)</latitude>"),
                latAr = latRe.exec(data),
                longRe = new RegExp("<longitude>(.*)</longitude>"),
                longAr = longRe.exec(data);
    
            var dataRow = {
                station : stationAr[1] || "",
                location : (locAr != null && locAr.length > 1 ? locAr[1] : ""),
                // TODO: filter out if null?
                latitude :  (latAr != null && latAr.length > 1 ? latAr[1] : 0), 
                longitude : (latAr != null && longAr.length > 1 ? longAr[1] : 0)
    /*            station : jQuery("station_id", data).text(), 
                location : jQuery("location", data).text(), 
                suggested_pickup : jQuery("suggested_pickup", data).text(), 
                suggested_pickup_period : jQuery("suggested_pickup_period", data).text(), 
                latitude : jQuery("latitude", data).text(),
                longitude : jQuery("longitude", data).text()*/
            };

            tree.insert(dataRow.latitude, dataRow.longitude, dataRow.station);
            
            console.log(filename);
            console.log(JSON.stringify(dataRow));
        }

        i++;
        if (i > 10) return false;
    });
}

function loadZipData(){
    var data = fs.readFileSync("data/zips.csv", 'utf-8');
    var ary = data.split("\n");
    // for each
        console.log(ary[1].split(","));
        console.log( (ary[1].split(",")[3]) );
        console.log( parseFloat((ary[1].split(",")[3])) );
        var test = ary[1].split(",")[3];
        console.log( parseFloat(test) );

}
//loadWeatherData();
loadZipData();
