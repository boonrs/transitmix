app.utils = app.utils || {};

// Returns a set of coordinates that connect between 'from' and 'to' latlngs
// If an point.via is provided, the route will go through that point
// E.g. getRoute({from: [20, 30], to: [23, 40]}, callback)
app.utils.getRoute = function(latlngs, callback, context) {
  var routingUrl = 'http://router.project-osrm.org/viaroute?loc=' +
    latlngs.from[0] + ',' + latlngs.from[1];
  if (latlngs.via) routingUrl += '&loc=' + latlngs.via[0] + ',' + latlngs.via[1];
  routingUrl += '&loc=' + latlngs.to[0] + ',' + latlngs.to[1];

  $.getJSON(routingUrl, function(route) {
    var coordinates = app.utils.decodeGeometry(route.route_geometry);
    callback.call(context || this, coordinates);
  });
};

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

app.utils.closestLatLngOnSegment = function(p, p1, p2) {
  p = {x: p[0], y: p[1]};
  p1 = {x: p1[0], y: p1[1]};
  p2 = {x: p2[0], y: p2[1]};

  var x = p1.x,
    y = p1.y,
    dx = p2.x - x,
    dy = p2.y - y,
    dot = dx * dx + dy * dy,
    t;

  if (dot > 0) {
    t = ((p.x - x) * dx + (p.y - y) * dy) / dot;

    if (t > 1) {
      x = p2.x;
      y = p2.y;
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

return [x, y];

}