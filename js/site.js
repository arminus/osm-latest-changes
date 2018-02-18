var map = L.map('map', { });
if (location.hash) {
    var h = location.hash.substr(1).split('/');
    map.setView([h[1], h[2]], h[0]);
} else {
    map.setView([15, -15], 2);
}

var overpass_server = '//overpass-api.de/api/'; //'https://overpass.kumi.systems/api/';
var days_to_show = 7;

var layer = null;
map.attributionControl.setPrefix('');
L.hash(map);
L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: "<a target='_blank' href='//www.openstreetmap.org/copyright' style='background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAB11BMVEXZ2dlkZGT///////////8mJibIyMj5+fm6urr///8sLCywsLBJSUn///9eXl7////////j4+P////////Q0ND////u7u7i4uIfHx/s7OxmZmZzc3P39/fw8PDg4OD5+fmNjY1cXFz5+flQUFBGRkaIiIhtbW3///////9hYWHS0tKlpaWsrKzZ2dmgoKCpqalycnLg4OCCgoJLS0tEREQlJSX9/f3///8/Pz/e3t4jIyP///////////+/v7+Ghobp6enDw8Pl5eVXV1f////////U1NT////////////////l5eW1tbX///+4uLj////////////////////////////w8PDNzc3GxsYuLi7w8PD///////9paWmvr6/c3NwhISHe3t5UVFQfHx/y8vLn5+d3d3eXl5f////09PTs7Oz///8zMzN8fHz///+UlJT////////u7u44ODj////p6en///86Ojqurq5ZWVlfX1////////8hISFBQUGioqIlJSXV1dV6enoqKioxMTH39/eLi4s4ODj///9ra2ubm5v9/f3Nzc28vLz///9LS0v///////////+FhYUdHR3////X19cjIyM2Njaenp7///8AAAAbGxtl93oXAAAAnXRSTlNzcE9udnpweG9Gem50TnI9Z3VgbHEWeHR9dnBvendzfG5ye3N0b3A4I3Fxbm5ybm5wdG5zdXt0NHVze14eMW9udW90cld4cUdSFx11bnJvHG1ANj8VQnlwcHl4H1xwb3N8dHN8eXZvbnV5d0t4byluAyd3dwt2VnZucnEvCn11bnxyb3p4e252BHBufXFvYnRzZQxvfWpyfHdufQB9fOn/1AAAAY5JREFUKM+V0mVvwzAQBuCMmZmZmZmZmZmZGcpMa7ukWXK5H7ukVbOpmqbt/WDZfiRLdz6C+8oqAPh6+8BqnANaOI74RoASydLisnzRdiGt9yQa9pVglC7LYws8advLTxEWoJaGx1x6ksx/LdQetI5R55xIE4O2+yvhwZDgwxUaobDh1kn6F/ud9vSMBu3p5lLgycqGAZosjneCe52zLTyjEB17DRAdERkva0Rk34h3x+gNinmy7FqyKOcWiDcWfw4QgL+TXC2sH8yOJ9V1AXRaUZmdkZqCALX4APDhotKjbcZ8LDkyoiyBp3I0ipRWgVgDORu768mJCFt3uEe4SXPA1wRFqgPatEVBJpyZSDcpFBR2mKzFubgGN5BfpjEb3GTVdJtNRqrq+DE9aQcMJFSKhIyW7UFsri7JUyHJqMhNhqT+UPL/iO+8ix4e5y1P38A6zv+X0Pln89jU7LT9mtU575mLkcmZV47/r/Y9+4temIKhARutVO/3H54Mc87ZuG1rFQfn8uq+r/dc7zp8AmmAXy4xp9xiAAAAAElFTkSuQmCC) no-repeat; background-size:26px 26px;width:24px;height:24px;display:block;z-index:1000;bottom:2px;right:5px;bottom:5px;position:absolute;'></a>"
    })
    .addTo(map);

function updateMap() {
    if (map.getZoom() > 11) {
        d3.select('#map').classed('faded', true);
        d3.select('#zoom-in').classed('hide', true);
        run();
    } else {
        d3.select('#map').classed('faded', true);
        d3.select('#zoom-in').classed('hide', false);
        abort();
        layer && map.removeLayer(layer);
        layer = null;
    }
}

updateMap();

var xhr;
function run() {
    if (xhr) xhr.abort();
    var bounds = map.getBounds();
    var bbox = bounds.getSouthWest().lat + ',' +
               bounds.getSouthWest().lng + ',' +
               bounds.getNorthEast().lat + ',' +
               bounds.getNorthEast().lng;
    var last_week = (new Date(new Date()-1000*60*60*24*days_to_show)).toISOString();
    //var overpass_query = '[out:json];way(' + bbox + ')(newer:"' + last_week + '");out meta;node(w);out skel;node(' + bbox + ')(newer:"' + last_week + '");out meta;';
    var overpass_query = '[adiff:"' + last_week + '"][bbox:' + bbox + '][out:xml][timeout:22];way->.ways;(.ways>;node;);out meta;.ways out geom meta;';
    xhr = d3.xml(overpass_server+'interpreter?data='+overpass_query
        ).on('load', function(data) {
            var newData = document.implementation.createDocument(null, 'osm');
            var oldData = document.implementation.createDocument(null, 'osm');
            var elements = data.querySelectorAll('action');
            for (var i=0; i<elements.length; i++) {
                var element = elements[i];
                switch (element.getAttribute('type')) {
                    case 'create':
                        newData.documentElement.appendChild(element.querySelector("*"));
                        break;
                    case 'modify':
                    case 'delete':
                        var newElement = element.querySelector('new > *');
                        var oldElement = element.querySelector('old > *');
                        // fake changeset id on new data
                        var newestTs = +new Date(newElement.getAttribute("timestamp"));
                        if (newElement.tagName == 'way') {
                          // inherit meta data from newest child node
                          var nds = newElement.getElementsByTagName('nd');
                          for (var j=0; j<nds.length; j++) {
                            var nodeId = nds[j].getAttribute('ref');
                            var node = newData.querySelector('node[id="'+nodeId+'"]');
                            if (node === null) continue;
                            var nodeTs = +new Date(node.getAttribute("timestamp"));
                            if (nodeTs > newestTs) {
                              newElement.setAttribute('changeset', node.getAttribute('changeset'));
                              newElement.setAttribute('user', node.getAttribute('user'));
                              newElement.setAttribute('uid', node.getAttribute('uid'));
                              newElement.setAttribute('timestamp', node.getAttribute('timestamp'));
                            }
                          }
                        }
                        // fake changeset id on old data
                        oldElement.setAttribute('changeset', newElement.getAttribute('changeset'));
                        oldElement.setAttribute('user', newElement.getAttribute('user'));
                        oldElement.setAttribute('uid', newElement.getAttribute('uid'));
                        oldElement.setAttribute('timestamp', newElement.getAttribute('timestamp'));
                        if (element.getAttribute('type') == 'modify')
                            newData.documentElement.appendChild(newElement);
                        oldData.documentElement.appendChild(oldElement);
                }
            }

            var newGeojson = osmtogeojson.toGeojson(newData);
            var oldGeojson = osmtogeojson.toGeojson(oldData);
            oldGeojson.features.forEach(function(feature) {
                feature.properties.__is_old__ = true;
            });

            d3.select('#map').classed('faded', false);
            layer && map.removeLayer(layer);

            var datescale = d3.time.scale()
                .domain([new Date(last_week), new Date()])
                .range([0, 1]);
            var colint = d3.interpolateRgb('#777', '#f00');

            function setStyle(f) {
                return {
                    color: colint(datescale(new Date(f.properties.meta.timestamp))),
                    opacity: f.properties.__is_old__ === true ? 0.2 : 1,
                    weight: 3
                }
            };
            layer = new L.GeoJSON({
              type: 'FeatureCollection',
              features: [].concat(oldGeojson.features).concat(newGeojson.features)
            }, {
                style: setStyle,
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {radius: 8});
                }})
                .addTo(map);

            var bytime = [];
            var changesets = {};

            layer.eachLayer(function(l) {
                if (!l.feature.properties.meta.changeset)
                    return;
                changesets[l.feature.properties.meta.changeset] = changesets[l.feature.properties.meta.changeset] || {
                    id: l.feature.properties.meta.changeset,
                    time: new Date(l.feature.properties.meta.timestamp),
                    user: l.feature.properties.meta.user,
                    comment: '',
                    features: []
                };
                changesets[l.feature.properties.meta.changeset].features.push(l);
            });
            for (var k in changesets) {
                bytime.push(changesets[k]);
            }

            layer.on('click', function(e) {
                click({ feature: e.layer });
            });

            bytime.sort(function(a, b) {
                return (+b.time) - (+a.time);
            });

            var results = d3.select('#results');
            var allresults = results
                .selectAll('div.result')
                .data(bytime, function(d) {
                    return d.id;
                })
                .attr('class', 'result')
                .style('color', function(l) {
                    return colint(datescale(l.time));
                });
            allresults.exit().remove();

            var rl = allresults.enter()
                .append('div')
                .attr('class', 'result')
                .style('color', function(l) {
                    return colint(datescale(l.time));
                });
            allresults.order();

            function click(d) {
                results
                    .selectAll('div.result')
                    .classed('active', function(_) {
                        return _.id == (d.id || d.feature.feature.properties.meta.changeset);
                });
                layer.eachLayer(function(l) {
                    layer.resetStyle(l);
                })
                var id = d.id ? d.id : d.feature.feature.properties.meta.changeset;
                layer.eachLayer(function(l) {
                    if (l.feature.properties.meta.changeset == id) {
                        l.setStyle({ color: '#0f0' });
                    }
                });
            }

            rl.on('click', click);

            rl.append('span')
            .classed('load', true)
            .html('&rarr; ');

            rl.append('a').text(function(d) {
               return d.user;
            })
            .attr('target', '_blank')
            .attr('href', function(d) {
                return '//openstreetmap.org/user/' + d.user;
            });

            rl.append('span').text(' ');

            rl.append('span').attr('class', 'date').text(function(d) {
                return moment(d.time).format('MMM Do YYYY, h:mm:ss a');
            });

            rl.append('span').text(' ');

            rl.append('a').attr('class', 'reveal').text('«zoom»')
            .attr('target', '_blank')
            .attr('href', '#')
            .on('click', function(d) {
                d3.event.preventDefault();
                map.fitBounds(d.features.reduce(function(a, b) {
                    return a.extend(b.getBounds());
                }, new L.LatLngBounds()));
            });

            rl.append('span').text(' ');

            rl.append('a').attr('class', 'reveal').text('«achavi»')
            .attr('target', '_blank')
            .attr('href', function(d) {
                return '//overpass-api.de/achavi/?changeset=' + d.id;
            });

            rl.append('div').attr('class', 'changeset');
            var queue = d3.queue();
            var changesetIds = rl.data().map(function(d) {return d.id});
            while (changesetIds.length > 0) {
                queue.defer(d3.xml, '//www.openstreetmap.org/api/0.6/changesets?changesets=' + changesetIds.splice(0,100));
            }
            queue.awaitAll(function(error, xmls) {
                if (error) return console.error(error);

                var changesets = {};
                xmls.forEach(function(xml) {
                    var css = xml.getElementsByTagName('changeset');
                    for (var i=0; i<css.length; i++) {
                        var cid = css[i].getAttribute('id');
                        changesets[cid] = {
                            discussionCount: +css[i].getAttribute("comments_count")
                        };
                        var tag = css[i].querySelector('tag[k="comment"]');
                        if (tag)
                            changesets[cid].comment = tag.getAttribute('v');
                    }
                });
                rl.select('span.load').each(function(d) {
                    if (changesets[d.id].discussionCount > 0)
                        d3.select(this).html('&rArr; ');
                });
                rl.select('div.changeset').each(function(d) {
                    d3.select(this).html(
                        '<a href="//openstreetmap.org/browse/changeset/' + d.id + '" target="_blank" class="comment">' +
                        (changesets[d.id].comment || '<span class="no-comment">&mdash;</span>') +
                        '</a>'
                    );
                });
            });


    }).get();
}
function abort() {
    if (xhr) {
        xhr.abort();
        xhr=null;
    }
    var results = d3.select('#results');
    var allresults = results
        .selectAll('div.result')
        .data([])
        .exit().remove();
}
var timeOutId = 0;
map.on('dragend	', function(event) {
    if (event.distance < 12) return;
    clearTimeout(timeOutId);
    timeOutId = setTimeout(updateMap, 500);
});
map.on('zoomend', function() {
    clearTimeout(timeOutId);
    timeOutId = setTimeout(updateMap, 500);
});

d3.select('h2 select')
    .on('change', function() {
        switch (this.selectedIndex) {
            case 0: // yesterday
                days_to_show = 1;
                break;
            case 1: // last week
                days_to_show = 7;
                break;
            case 2: // last month
                days_to_show = 30;
                break;
        }
        updateMap();
    });
