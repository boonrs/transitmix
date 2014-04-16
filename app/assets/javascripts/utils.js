app.utils = app.utils || {};

// Takes an encoded geometry and returns a set of latlngs
app.utils.decodeGeometry = function(encoded, precision) {
  precision = precision || 6;
  precision = Math.pow(10, -precision);
  var len = encoded.length, index=0, lat=0, lng = 0, array = [];
  while (index < len) {
    var b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    var dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    array.push( [lat * precision, lng * precision] );
  }
  return array;
}

// Make sure point is in [a, b] format for consistency
app.utils.cleanPoint = function(point) {
  if (!_.isArray(point)) point = _.values(point);
  return point;
}

// Calculate the distance between two latlngs.
// e.g. haversine([12.33, 78.99], [13.192, 79.11])
// https://github.com/niix/haversine/blob/master/haversine.js
app.utils.haversine = (function() {
  var toRad = function(num) {
    return num * Math.PI / 180
  }

  return function haversine(start, end, options) {
    var miles = 3960
    var km    = 6371
    options   = options || {}

    var R = options.unit === 'km' ? km : miles

    var dLat = toRad(end[0] - start[0])
    var dLon = toRad(end[1] - start[1])
    var lat1 = toRad(start[0])
    var lat2 = toRad(end[0])

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2)
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    if (options.threshold) {
      return options.threshold > (R * c)
    } else {
      return R * c
    }
  }
})();

// www.movable-type.co.uk/scripts/latlong.html
app.utils.azimuth = function(start, end) {
  var toRad = function(num) {
    return num * Math.PI / 180
  }

  var dLat = toRad(end[0] - start[0]);
  var dLon = toRad(end[1] - start[1]);
  var lat1 = toRad(start[0]);
  var lat2 = toRad(end[0]);

  var x = Math.sin(dLon) * Math.cos(lat2);
  var y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2)*Math.cos(dLon);

  return Math.atan2(y, x);
}

// Calculate the distance from an array of latlngs
app.utils.calculateDistance = function(latlngs) {
  var haversine = app.utils.haversine;
  var sum = 0;

  for(var i = 0; i < latlngs.length - 1; i++) {
    sum += haversine(latlngs[i], latlngs[i + 1]);
  }

  return sum;
};

// Lightens or darkens a CSS hex color value
app.utils.tweakColor = function(color, percent) {
  var num = parseInt(color,16),
  amt = Math.round(2.55 * percent),
  R = (num >> 16) + amt,
  B = (num >> 8 & 0x00FF) + amt,
  G = (num & 0x0000FF) + amt;

  return(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};

// Given an array of latlngs, finds the index of
// the closest location to point
app.utils.indexOfClosest = function(arr, point) {
  var closest = 0;
  var minDistance = app.utils.haversine(arr[0], point);

  for (var i = 1; i < arr.length; i++) {
    var distance = app.utils.haversine(arr[i], point);
    if (distance < minDistance) {
      minDistance = distance;
      closest = i;
    }
  }

  return closest;
};

// Given an array of line segments and a point, find the index of 
// the line segment the point most closely fits
app.utils.closestLineSegment = function(segments, point) {
  // is there a way to do this that assumes the world isn't flat?

  // TODO: this fn does something that's kind of but not at all right.
  // It should walk through each consecutive pair of points, checking to see
  // if our clicked point lies between them. If so, it should return the index
  // of the line segment + the two points
  var closest = -1;
  var minDiff = Infinity;

  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];

    if (segment.length == 0) continue;

    var firstPoint = segment[0];
    var lastPoint = _.last(segment);

    var lineAzimuth = app.utils.azimuth(firstPoint, lastPoint);
    var pointAzimuth = app.utils.azimuth(firstPoint, point);

    var azimuthDiff = Math.abs(lineAzimuth-pointAzimuth);

    if (azimuthDiff < minDiff) {
      minDiff = azimuthDiff;
      closest = i;
    }
  }

  return closest;
}