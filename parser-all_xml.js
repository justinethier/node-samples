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
 */ 
fs = require('fs');
jQuery = require('jquery');

var files = fs.readdirSync('.');
jQuery.each(files, function(index, filename){
    if (filename.substr(filename.length-4, 4) == ".xml") {
        data = fs.readFileSync(filename, 'utf-8');
        var dataRow = {
            station : jQuery("station_id", data).text(), 
            location : jQuery("location", data).text(), 
            suggested_pickup : jQuery("suggested_pickup", data).text(), 
            suggested_pickup_period : jQuery("suggested_pickup_period", data).text(), 
            latitude : jQuery("latitude", data).text(),
            longitude : jQuery("longitude", data).text()
        };
        
        console.log(JSON.stringify(dataRow));
    }
});
