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
 */ 
kd = require('kdtree');
fs = require('fs');
jQuery = require('jquery');

/**
 *
 */
function loadWeatherData(){
    var i = 0;
    var stations = [];
    var files = fs.readdirSync('data/tmp');
    var weatherTree = new kd.KDTree(2);

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
                lng = parseFloat( (latAr != null && longAr.length > 1 ? longAr[1] : 0) ),
                station = stationAr[1] || "";

            weatherTree.insert(lat, lng, station);
        }
    });

    return weatherTree;
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
                latitude : lat, 
                longitude : lng,
                /*location : jQuery("location", data).text(), 
                suggested_pickup : jQuery("suggested_pickup", data).text(), 
                suggested_pickup_period : jQuery("suggested_pickup_period", data).text(), */

                // Do not need zip code because tree searching is so fast, but write anyway to test accuracy
                zip: zipCodeTree.nearestValue(lat, lng)
            });
            
        }
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
    var dict = {};
    var data = fs.readFileSync("data/zips.csv", 'utf-8');
    var ary = data.split("\n");
    // for each
    jQuery.each(ary, function(index, line){
        line = line.replace(/\"/g, "");
        var lat = parseFloat((line.split(",")[2])),
            lng = parseFloat((line.split(",")[3]));
        if (!isNaN(lat) && !isNaN(lng)){
            tree.insert( lat, lng, line.split(",")[0]);
            dict[line.split(",")[0]] = [lat, lng];
        }
    });

    return [tree, dict];
}
var zips = loadZipData()[1];
var stations = loadWeatherData();
//createWeatherStationLookupFile(zip);

zipLocs = zips["01864"];
console.log( stations.nearest( zipLocs[0], zipLocs[1]));

// TODO: (free) web service to transform an arbitrary address into a lat/long (??)
