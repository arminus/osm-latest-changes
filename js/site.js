var map = L.map('map', {
    gestureHandling: activateGestureHandling(),
    contextmenu: true,
    contextmenuWidth: 150,
    contextmenuItems: [{
        text: 'Open with OSM',
        icon: 'img/osm-logo.png',
        callback: openOSM
    },
    {
        text: 'Open with GMaps',
        icon: 'img/gmaps-logo.png',
        callback: openGmaps
    }]
});

//Set map view either from hash value in URL (prio 1) or coords from local storage (prio 2)
var hash_from_local_storage = localStorage.getItem('location-hash');
if (location.hash || hash_from_local_storage) {
    var h = (location.hash || hash_from_local_storage).substr(1).split('/');
    map.setView([h[1], h[2]], h[0]);
} else {
    map.setView([15, -15], 2);
}

//Activate gesture handling only on small screens ("use two fingers to pan and zoom map")
function activateGestureHandling() {
    if (screen.width < 601) return true;
    else return false;
}

//If screen width changes during use of app (e.g. turning phone from portrait to landscape)
//--> Activate gesture handling if screen width is < 601px
window.addEventListener("resize", () => {
    // console.log(screen.width);
    if (screen.width < 601) map.gestureHandling.enable();
    else map.gestureHandling.disable();
});

//add "set current location" button to map
L.control.locate({
    initialZoomLevel: 14,
    strings: {
        title: "Show changes around my current location"
    }
}).addTo(map);

let sidebar = document.querySelector(".changesets");
//Toggle sidebar button on map
L.Control.toggleSidebarButton = L.Control.extend(
    {
        options:
        {
            position: 'topleft',
        },
        onAdd: function (map) {
            let controlDiv = L.DomUtil.create('div', 'leaflet-control-toggle leaflet-bar');
            L.DomEvent
                .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
                .addListener(controlDiv, 'click', toggleSidebar);

            let controlUI = L.DomUtil.create('a', 'leaflet-toggle-sidebar', controlDiv);
            controlUI.title = 'Toggle display of sidebar <Spacebar>';
            controlUI.href = '#';

            let barIcon = L.DomUtil.create('span', 'leaflet-control-toggle-icon', controlUI);

            return controlDiv;
        }
    });
let toggleSidebarButton = new L.Control.toggleSidebarButton();
map.addControl(toggleSidebarButton);

function toggleSidebar() {
    sidebar.classList.toggle("hide");
    // let size = map.getSize();
    // console.log(size);
    // let bounds = map.getBounds();
    // console.log(bounds);
    map.invalidateSize();//make sure that leaflet updates map size
    // size = map.getSize();
    // console.log(size);
    // bounds = map.getBounds();
    // console.log(bounds);
}

//Toggle display of sidebar on press of Spacebar
document.addEventListener("keyup", event => {
    // console.log(event.key);
    event.preventDefault(); //prevent default, i.e. "page down" for spacebar
    if (event.key == " ") {
        toggleSidebar();
    };
});

//Open link to external maps when "RMB --> Open with..."
function openOSM(e) {
    const url = `https://www.openstreetmap.org/?mlat=${e.latlng.lat}&mlon=${e.latlng.lng}#map=19/${e.latlng.lat}/${e.latlng.lng}`;
    window.open(url, '_blank').focus();
}

function openGmaps(e) {
    const url = `https://maps.google.com/maps?q=loc:${e.latlng.lat},${e.latlng.lng}`;
    window.open(url, '_blank').focus();
}

//Timeframe
var days_to_show;
// load resolution_from_local_storage from local storage, if available
var resolution_from_local_storage = localStorage.getItem("resolution");
if (resolution_from_local_storage) {
    days_to_show = resolution_from_local_storage;
    // select value from local storage in drop down menu
    document.getElementById('resolution').value = days_to_show;
} else {
    // else, i.e. no resolution saved in local storage: Default to 7 days
    days_to_show = 7;
}

var layer = null;
map.attributionControl.setPrefix('');
L.hash(map);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: "<a target='_blank' href='https://www.openstreetmap.org/copyright' style='background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAB11BMVEXZ2dlkZGT///////////8mJibIyMj5+fm6urr///8sLCywsLBJSUn///9eXl7////////j4+P////////Q0ND////u7u7i4uIfHx/s7OxmZmZzc3P39/fw8PDg4OD5+fmNjY1cXFz5+flQUFBGRkaIiIhtbW3///////9hYWHS0tKlpaWsrKzZ2dmgoKCpqalycnLg4OCCgoJLS0tEREQlJSX9/f3///8/Pz/e3t4jIyP///////////+/v7+Ghobp6enDw8Pl5eVXV1f////////U1NT////////////////l5eW1tbX///+4uLj////////////////////////////w8PDNzc3GxsYuLi7w8PD///////9paWmvr6/c3NwhISHe3t5UVFQfHx/y8vLn5+d3d3eXl5f////09PTs7Oz///8zMzN8fHz///+UlJT////////u7u44ODj////p6en///86Ojqurq5ZWVlfX1////////8hISFBQUGioqIlJSXV1dV6enoqKioxMTH39/eLi4s4ODj///9ra2ubm5v9/f3Nzc28vLz///9LS0v///////////+FhYUdHR3////X19cjIyM2Njaenp7///8AAAAbGxtl93oXAAAAnXRSTlNzcE9udnpweG9Gem50TnI9Z3VgbHEWeHR9dnBvendzfG5ye3N0b3A4I3Fxbm5ybm5wdG5zdXt0NHVze14eMW9udW90cld4cUdSFx11bnJvHG1ANj8VQnlwcHl4H1xwb3N8dHN8eXZvbnV5d0t4byluAyd3dwt2VnZucnEvCn11bnxyb3p4e252BHBufXFvYnRzZQxvfWpyfHdufQB9fOn/1AAAAY5JREFUKM+V0mVvwzAQBuCMmZmZmZmZmZmZGcpMa7ukWXK5H7ukVbOpmqbt/WDZfiRLdz6C+8oqAPh6+8BqnANaOI74RoASydLisnzRdiGt9yQa9pVglC7LYws8advLTxEWoJaGx1x6ksx/LdQetI5R55xIE4O2+yvhwZDgwxUaobDh1kn6F/ud9vSMBu3p5lLgycqGAZosjneCe52zLTyjEB17DRAdERkva0Rk34h3x+gNinmy7FqyKOcWiDcWfw4QgL+TXC2sH8yOJ9V1AXRaUZmdkZqCALX4APDhotKjbcZ8LDkyoiyBp3I0ipRWgVgDORu768mJCFt3uEe4SXPA1wRFqgPatEVBJpyZSDcpFBR2mKzFubgGN5BfpjEb3GTVdJtNRqrq+DE9aQcMJFSKhIyW7UFsri7JUyHJqMhNhqT+UPL/iO+8ix4e5y1P38A6zv+X0Pln89jU7LT9mtU575mLkcmZV47/r/Y9+4temIKhARutVO/3H54Mc87ZuG1rFQfn8uq+r/dc7zp8AmmAXy4xp9xiAAAAAElFTkSuQmCC) no-repeat; background-size:26px 26px;width:24px;height:24px;display:block;z-index:1000;bottom:2px;right:5px;bottom:5px;position:absolute;'></a>"
}).addTo(map);

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
    localStorage.setItem('location-hash', location.hash);
}

var overpass_server = '//overpass-api.de/api/'; //'https://overpass.kumi.systems/api/';
let loadingAnimation = document.querySelector("#loading-animation");
let xhr;
updateMap();

function run() {
    loadingAnimation.classList.remove("hide");//display loading spinner
    if (xhr) xhr.abort();
    var bounds = map.getBounds();
    var bbox = bounds.getSouthWest().lat + ',' +
        bounds.getSouthWest().wrap().lng + ',' +
        bounds.getNorthEast().lat + ',' +
        bounds.getNorthEast().wrap().lng;
    var last_week = (new Date(new Date() - 1000 * 60 * 60 * 24 * days_to_show)).toISOString();
    // var overpass_query = '[out:json];way(' + bbox + ')(newer:"' + last_week + '");out meta;node(w);out skel;node(' + bbox + ')(newer:"' + last_week + '");out meta;';
    var overpass_query = '[adiff:"' + last_week + '"][bbox:' + bbox + '][out:xml][timeout:22];way->.ways;(.ways>;node;);out meta;.ways out geom meta;';
    // console.log(overpass_server + 'interpreter?data=' + overpass_query);

    xhr = d3.xml(overpass_server + 'interpreter?data=' + overpass_query
        // xhr = d3.xml("./examples/example.xml" //To load example xml: Hide line above and unhide this line
    ).on("error", function (error) {
        loadingAnimation.classList.add("hide");//hide loading spinner
        message("alarm", "Server error: " + error.statusText); //Error message in case of no results from Overpass
    })
        .on('load', function (data) {
            // console.log(data);
            loadingAnimation.classList.add("hide");//hide loading spinner
            var newData = document.implementation.createDocument(null, 'osm');
            var oldData = document.implementation.createDocument(null, 'osm');
            var elements = data.querySelectorAll('action');
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                switch (element.getAttribute('type')) {
                    case 'create':
                        newData.documentElement.appendChild(element.querySelector("*").cloneNode(true));//cloneNode needed to keep "data" unchanged
                        break;
                    case 'modify':
                    case 'delete':
                        var newElement = element.querySelector('new > *').cloneNode(true);//cloneNode needed to keep "data" unchanged
                        var oldElement = element.querySelector('old > *').cloneNode(true);
                        // fake changeset id on new data
                        var newestTs = +new Date(newElement.getAttribute("timestamp"));
                        if (newElement.tagName == 'way') {
                            // inherit meta data from newest child node
                            var nds = newElement.getElementsByTagName('nd');
                            for (var j = 0; j < nds.length; j++) {
                                var nodeId = nds[j].getAttribute('ref');
                                var node = newData.querySelector('node[id="' + nodeId + '"]');
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
            oldGeojson.features.forEach(function (feature) {
                feature.properties.__is_old__ = true;
            });

            d3.select('#map').classed('faded', false);
            layer && map.removeLayer(layer);

            var datescale = d3.time.scale()
                .domain([new Date(last_week), new Date()])
                .range([0, 1]);
            var colint = d3.interpolateRgb('#777', '#f00');


            layer = new L.GeoJSON({
                type: 'FeatureCollection',
                features: [].concat(oldGeojson.features).concat(newGeojson.features)
            }, {
                style: setStyle,
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, { radius: 8 });
                },
                onEachFeature: onEachFeature
            })
                .addTo(map);

            function setStyle(f) {
                return {
                    color: colint(datescale(new Date(f.properties.meta.timestamp))),
                    opacity: f.properties.__is_old__ === true ? 0.2 : 1,
                    weight: 3
                }
            };

            //What happens when hovering over each polygon/way/marker
            function onEachFeature(feature, layer) {
                // console.log(feature);
                // console.log(layer);

                //Increase line weight when feature gets focus
                layer.on('mouseover', function (e) {
                    layer.setStyle({ weight: 8 });
                });

                //Change line weight back when feature loses focus
                layer.on('mouseout', function (e) {
                    layer.setStyle({ weight: 3 });
                });
            }

            var bytime = [];
            var changesets = {};

            layer.eachLayer(function (l) {
                if (!l.feature.properties.meta.changeset) return;
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

            layer.on('click', function (e) {
                //Highlight clicked layer on map and in sidebar
                click({ feature: e.layer });
                //Scroll selected element into view in sidebar
                //(Only on large screens. On small screens the map scrolls out of view, which is annoying)
                if (screen.width > 600) {
                    document.querySelector('.active').scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                const tableHtml = createTable(e.layer.feature.properties.id)
                let mapContainer = document.querySelector(".map-container");

                let tagComparisonPopup = L.popup({
                    maxWidth: mapContainer.clientWidth - 45,
                    maxHeight: mapContainer.clientHeight - 40,
                    className: "stylePopup"
                })
                    .setLatLng(e.latlng)
                    .setContent(tableHtml)
                    .openOn(map);
            });

            bytime.sort(function (a, b) {
                return (+b.time) - (+a.time);
            });

            var results = d3.select('#results');
            var allresults = results
                .selectAll('div.result')
                .data(bytime, function (d) {
                    return d.id;
                })
                .attr('class', 'result')
                .style('color', function (l) {
                    return colint(datescale(l.time));
                });
            allresults.exit().remove();

            var rl = allresults.enter()
                .append('div')
                .attr('class', 'result')
                .attr('title', 'Changeset is highlighted on map')
                .style('color', function (l) {
                    return colint(datescale(l.time));
                });
            allresults.order();

            //Create tag comparison table
            function createTable(id) {
                {
                    const node = data.querySelectorAll('[id="' + id + '"]');
                    // const node = data.querySelectorAll('[id="1072310203"]');//"create" example
                    // const node = data.querySelectorAll('[id="3611264529"]');//"modify" example
                    // const node = data.querySelectorAll('[id="1501"]');//"delete" example

                    //Example calls from xml file
                    // console.log(node[0]);
                    // console.log(node[0].parentNode.parentNode.getAttribute('type'));
                    // console.log(node[0].querySelectorAll("tag")[0].getAttribute('k'));

                    //First check what type of action has been performed on the element (i.e. create, modify, delete)
                    let action = node[0].parentNode.parentNode.getAttribute('type');//Check if action is "modify", "delete" or "null"
                    if (!action) action = "create";//The xml data structure is different for "create" nodes, thus action will be "null" in the line above
                    // console.log(action);

                    //Create header with element info
                    let tableHtml = `<span class="${action} capitalize">${action}</span> ${node[0].nodeName} <a href="https://www.openstreetmap.org/${node[0].nodeName}/${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">${node[0].getAttribute("id")}</a>`;
                    // document.querySelector("#element-info").innerHTML = elementInfoHtml;

                    //Variables
                    tableHtml += `<table class="table-container">`;

                    //Object with all key-value pairs for new and old and relevant meta tags for table
                    const keyvalues = { old: { meta: {}, tags: {} }, new: { meta: {}, tags: {} } };

                    //1 CREATE
                    if (action === "create") {
                        //Copy meta tags
                        const keysNew = node[0].querySelectorAll("tag");

                        //Create table
                        tableHtml += `
                            <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>New</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr class="metatags">
                                    <td>version</td>
                                    <td>${node[0].getAttribute("version")}</td>
                                </tr>
                                <tr class="metatags">
                                    <td>timestamp</td>
                                    <td>${node[0].getAttribute("timestamp")}</td>
                                </tr>
                                <tr class="metatags">
                                    <td>user</td>
                                    <td>${node[0].getAttribute("user")}</td>
                                </tr>
                        `;

                        for (let i = 0; i < keysNew.length; i++) {
                            tableHtml += `
                                <tr class="create">
                                    <td>${keysNew[i].getAttribute('k')}</td>
                                    <td>${keysNew[i].getAttribute('v')}</td>
                                </tr>
                                `
                        }
                    }

                    //2 MODIFY/DELETE
                    else {
                        //Create Set with all unique key-values from old and new
                        const uniqueKeysSet = new Set();
                        //Start with old
                        //Copy meta tags
                        keyvalues.old.meta["version"] = node[0].getAttribute("version");
                        keyvalues.old.meta["timestamp"] = moment(node[0].getAttribute("timestamp")).fromNow();
                        keyvalues.old.meta["user"] = node[0].getAttribute("user");
                        const keysOld = node[0].querySelectorAll("tag");
                        for (let i = 0; i < keysOld.length; i++) {
                            keyvalues.old.tags[keysOld[i].getAttribute('k')] = keysOld[i].getAttribute('v');
                            uniqueKeysSet.add(keysOld[i].getAttribute('k'));
                        }
                        //Continue with new
                        //Copy meta tags
                        keyvalues.new.meta["version"] = node[1].getAttribute("version");
                        keyvalues.new.meta["timestamp"] = moment(node[1].getAttribute("timestamp")).fromNow();
                        keyvalues.new.meta["user"] = node[1].getAttribute("user");
                        const keysNew = node[1].querySelectorAll("tag");
                        for (let i = 0; i < keysNew.length; i++) {
                            keyvalues.new.tags[keysNew[i].getAttribute('k')] = keysNew[i].getAttribute('v');
                            uniqueKeysSet.add(keysNew[i].getAttribute('k'));
                        }
                        // console.log(keyvalues);
                        //Create array in which all keys are ordered alphabetically
                        const uniqueKeysArr = Array.from(uniqueKeysSet).sort();
                        // console.log(uniqueKeysArr);

                        //Create table
                        tableHtml += `
                            <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>Old</th>
                                    <th>New</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr class="metatags">
                                    <td><div>version</div></td>
                                    <td>${keyvalues.old.meta["version"]}</td>
                                    <td>${keyvalues.new.meta["version"]}</td>
                                </tr>
                                <tr class="metatags">
                                    <td>timestamp</td>
                                    <td>${keyvalues.old.meta["timestamp"]}</td>
                                    <td>${keyvalues.new.meta["timestamp"]}</td>
                                </tr>
                                <tr class="metatags">
                                    <td><div>user</td>
                                    <td>${keyvalues.old.meta["user"]}</td>
                                    <td>${keyvalues.new.meta["user"]}</td>
                                </tr>
                            `;

                        //Traverse uniqueKeysArray and check in object which value this key has in new and old
                        for (let i = 0; i < uniqueKeysArr.length; i++) {
                            let oldTag = keyvalues.old.tags[uniqueKeysArr[i]];
                            let newTag = keyvalues.new.tags[uniqueKeysArr[i]];
                            let cssClass;
                            //Case 1: Tag deleted in new --> Background color red, change from "undefined" to ""
                            if (!newTag) {
                                cssClass = "delete";
                                newTag = "";
                            }
                            //Case 2: Tag created in new --> Background color create, change from "undefined" to ""
                            else if (!oldTag) {
                                cssClass = "create";
                                oldTag = "";
                            }
                            //Case 3: Tag different in new --> Background color yellow
                            else if (oldTag !== newTag) cssClass = "modify";

                            //Case 4: Tags similar --> Don't display this key-value pair
                            else cssClass = "'unchanged'";
                            // else continue;
                            // Better option: Add a class "unchanged", hide them and add a button to show similar tags
                            // Table height needs to update see https://leafletjs.com/reference.html#divoverlay-contentupdate
                            // table rows can be animated https://stackoverflow.com/a/37376274/5263954

                            tableHtml += `
                                <tr ${(cssClass ? 'class=' + cssClass : '')}>
                                    <td>${uniqueKeysArr[i]}</td>
                                    <td>${oldTag}</td>
                                    <td>${newTag}</td>
                                </tr>
                                `
                        }
                    }

                    tableHtml += `
                            </tbody>
                        </table>
                    `;

                    //Create link to edit geometry in iD editor
                    tableHtml += `<a href="https://www.openstreetmap.org/edit?${node[0].nodeName}=${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">Edit in iD</a>`;

                    return tableHtml;
                }
            }

            //Highlight clicked layer on map and in sidebar
            function click(d) {
                results
                    .selectAll('div.result')
                    .classed('active', function (_) {
                        return _.id == (d.id || d.feature.feature.properties.meta.changeset);
                    });
                layer.eachLayer(function (l) {
                    layer.resetStyle(l);
                })
                var id = d.id ? d.id : d.feature.feature.properties.meta.changeset;
                layer.eachLayer(function (l) {
                    if (l.feature.properties.meta.changeset == id) {
                        l.setStyle({ color: '#008dff' });
                    }
                });

                //Make sure that sidebar is displayed
                sidebar.classList.remove("hide");
            }

            rl.on('click', click);//Highlight changeset on click (desktop/mobile)
            rl.on('mouseover', click);//Highlight changeset on mouseover (desktop)

            let stopDownloadCheckbox = document.querySelector("#stopDownloadCheckbox");

            //"Zoom to changeset" button
            rl.append('div')
                .classed('zoom', true)
                .attr('title', 'Zoom to changeset')
                //.html('&#x1F50E; ')//Unicode glyph for a loupe
                .on('click', function (d) {
                    if (stopDownloadCheckbox.checked === false) {
                        //First stop download of changesets on pan and zoom
                        stopDownloadCheckbox.checked = true;
                        //Inform user
                        message("success", "Download of changesets has been temporarily stopped");
                    }
                    //Check each layer on the map. If it belongs to clicked changeset --> add it to a featureGroup
                    //(featureGroup needed because layers with points only don't have a getBounds function)
                    d3.event.preventDefault();
                    var id = d.id ? d.id : d.feature.feature.properties.meta.changeset;
                    var changesetLayers = L.featureGroup();
                    layer.eachLayer(function (l) {
                        if (l.feature.properties.meta.changeset == id) l.addTo(changesetLayers);
                    });
                    //Zoom and pan to featureGroup
                    map.fitBounds(changesetLayers.getBounds());
                    //On small screens (screen width < 601px) scroll all the way down, so that map is completely visible on screen
                    if (screen.width < 601) {
                        let mapContainer = document.querySelector(".map-container");
                        window.scrollTo({ //does not work with map container, thus "window"
                            top: 2222,
                            behavior: 'smooth'
                        });
                    }
                })
                .append('svg')
                .classed('loupe', true)
                .append('use')
                .attr('href', 'img/icons.svg#loupe');

            //Text bubble symbol
            rl.append('span')
                .classed('text-bubble', true);

            //User name
            rl.append('a').text(function (d) {
                return d.user;
            })
                .attr('title', 'Go to OSM user page')
                .attr('target', '_blank')
                .attr('href', function (d) {
                    return '//openstreetmap.org/user/' + d.user;
                });

            rl.append('span').text(' ');

            rl.append('span')
                .attr('title', function (d) {
                    return moment(d.time).format('MMM Do YYYY, h:mm:ss a');
                })
                .attr('class', 'date').text(function (d) {
                    return moment(d.time).fromNow();
                });

            //link to achavi (temporarily hidden. To be discussed, if needed or not)
            // rl.append('span').text(' ');
            // rl.append('a').attr('class', 'reveal').text('«achavi»')
            //     .attr('target', '_blank')
            //     .attr('title', 'Get details about this changeset on Achavi')
            //     .attr('href', function (d) {
            //         return 'https://overpass-api.de/achavi/?changeset=' + d.id;
            //     });

            //Changeset information
            rl.append('div').attr('class', 'changeset');
            var queue = d3.queue();
            var changesetIds = rl.data()
                .map(function (d) { return d.id })
                .filter(function (changesetId) { return changesetId !== ''; });
            while (changesetIds.length > 0) {
                queue.defer(d3.xml, 'https://www.openstreetmap.org/api/0.6/changesets?changesets=' + changesetIds.splice(0, 100).join(','));
            }
            queue.awaitAll(function (error, xmls) {
                if (error) return console.error(error);

                var changesets = {};
                xmls.forEach(function (xml) {
                    var css = xml.getElementsByTagName('changeset');
                    for (var i = 0; i < css.length; i++) {
                        var cid = css[i].getAttribute('id');
                        changesets[cid] = {
                            discussionCount: +css[i].getAttribute("comments_count")
                        };
                        var tag = css[i].querySelector('tag[k="comment"]');
                        if (tag)
                            changesets[cid].comment = tag.getAttribute('v');
                    }
                });
                rl.select('span.text-bubble').each(function (d) {
                    if (changesets[d.id].discussionCount > 0) {
                        // d3.select(this).html('&#128489; ');//Speech bubble glyphicon (doesn't work on Android)
                        d3.select(this).attr('title', 'Changeset has comments');
                        d3.select(this).append('svg')
                            .classed('text-bubble-svg', true)
                            .append('use')
                            .attr('href', 'img/icons.svg#speech-bubble');
                    }
                });
                rl.select('div.changeset').each(function (d) {
                    d3.select(this).html(
                        '<a href="https://openstreetmap.org/browse/changeset/' + d.id + '" target="_blank" class="comment" title="Go to OSM changeset page">' +
                        (changesets[d.id].comment || '<span class="no-comment">&mdash;</span>') +
                        '</a>'
                    );
                });
            });
        }).get();
}

//Show a modal with a message
function message(type, text) {
    // console.log(error.statusText);

    // Get the infobox modal
    const infobox = document.querySelector(".infobox");

    infobox.classList.remove("show", "alarm", "success");
    void infobox.offsetWidth; //Found here: https://css-tricks.com/restart-css-animation/#update-another-javascript-method-to-restart-a-css-animation
    infobox.innerHTML = text;
    infobox.classList.add("show", type);
}

function abort() {
    if (xhr) {
        xhr.abort();
        xhr = null;
    }
    loadingAnimation.classList.add("hide");//hide loading spinner
    var results = d3.select('#results');
    var allresults = results
        .selectAll('div.result')
        .data([])
        .exit().remove();
}

let timeOutId = 0;
map.on('dragend	', function (event) {
    if (event.distance < 12) return;
    if (stopDownloadCheckbox.checked) return;//if stopDownloadCheckbox is checked stop function execution. Else proceed.
    clearTimeout(timeOutId);
    timeOutId = setTimeout(updateMap, 500);
});
map.on('zoomend', function () {
    if (stopDownloadCheckbox.checked) return;//if stopDownloadCheckbox is checked stop function execution. Else proceed.
    clearTimeout(timeOutId);
    timeOutId = setTimeout(updateMap, 500);
});

d3.select('#resolution')
    .attr('title', 'Select a time range')
    .on('change', function () {
        switch (this.selectedIndex) {
            case 0: // last 24h
                days_to_show = 1;
                break;
            case 1: // last 3 days
                days_to_show = 3;
                break;
            case 2: // last week
                days_to_show = 7;
                break;
            case 3: // last month
                days_to_show = 30;
                break;
        }
        localStorage.setItem("resolution", days_to_show);
        updateMap();
    });

//Display "Back-to-top" button if changesets in sidebar are overflowing
sidebar.addEventListener("scroll", event => {
    let toTop = document.querySelector(".to-top");
    // console.log(sidebar.scrollTop);
    if (sidebar.scrollTop > 50) toTop.classList.remove("hide");//display to-top button
    else toTop.classList.add("hide");//hide to-top button
});

//Scroll to top when clicking on "Back-to-top" button
function scrollToTop() {
    sidebar.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}