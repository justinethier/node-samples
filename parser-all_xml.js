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

/**
 * TODO: extract common code from the station=>file code, and 
 *       have this function load station data into a tree, 
 *       either using the file (probably faster) or the
 *       same process (if it is not too slow, but it probably will be)
 */
function loadWeatherData(zipCodeTree){
    var i = 0;
    var tree = new kd.KDTree(2);
    var stations = {};

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

// TODO: look up zip code and write to file

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

/**
 * Create a file to use to look up weather stations by lat/long
 */
function createWeatherStationLookupFile(zipCodeTree){
    var i = 0;
    var stations = [];
    var files = fs.readdirSync('data/tmp');

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


            var lat = parseFloat( (latAr != null && latAr.length > 1 ? latAr[1] : 0) ), 
                lng = parseFloat( (latAr != null && longAr.length > 1 ? longAr[1] : 0) );

            stations.push({
                station : stationAr[1] || "",
                location : (locAr != null && locAr.length > 1 ? locAr[1] : ""),
                // TODO: filter out if null?
                latitude : lat, 
                longitude : lng,
    /*            station : jQuery("station_id", data).text(), 
                location : jQuery("location", data).text(), 
                suggested_pickup : jQuery("suggested_pickup", data).text(), 
                suggested_pickup_period : jQuery("suggested_pickup_period", data).text(), 
                latitude : jQuery("latitude", data).text(),
                longitude : jQuery("longitude", data).text()*/

                // Do not need zip code because tree searching is so fast, but write anyway to test accuracy
                zip: zipCodeTree.nearestValue(lat, lng)
            });
            
        }

//        i++;
//        if (i > 10) return false;
    });

    fs.writeFile('tmp-stations.json', JSON.stringify(stations));
}

/**
 * Load zip codes from file and put them in a tree for fast searching
 *
 * TODO: there are some errors in the zip data. For example, zip code 207HH
 */
function loadZipData(){
    var tree = new kd.KDTree(2);
    var data = fs.readFileSync("data/zips.csv", 'utf-8');
    var ary = data.split("\n");
    // for each
    jQuery.each(ary, function(index, line){
        line = line.replace(/\"/g, "");
        var lat = parseFloat((line.split(",")[2])),
            lng = parseFloat((line.split(",")[3]));
        if (!isNaN(lat) && !isNaN(lng)){
            tree.insert( lat, lng, line.split(",")[0]);
        }
    });

    return tree;
}
var zip = loadZipData();
console.log( zip.nearestValue(39.183038, -76.668949) );
console.log( zip.nearestValue(40.690596, -74.044762) );
console.log( zip.nearestValue(37.828768, -122.350616) );
console.log( zip.nearestValue(0, 0) );


//loadWeatherData(zip);
createWeatherStationLookupFile(zip);
