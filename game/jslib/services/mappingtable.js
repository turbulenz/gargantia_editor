// Copyright (c) 2011 Turbulenz Limited
;
;

;

;

;

;

var MappingTable = (function () {
    function MappingTable() {
    }
    MappingTable.prototype.getURL = function (assetPath, missingCallbackFn) {
        var overrides = this.overrides;
        var profile = this.currentProfile;
        var override = overrides[profile];

        var url;
        while (override) {
            url = override.urnmapping[assetPath];
            if (url) {
                return url;
            }

            override = overrides[override.parent];
        }

        url = this.urlMapping[assetPath];
        if (url) {
            return url;
        } else {
            if (missingCallbackFn) {
                missingCallbackFn(assetPath);
            }
            return (this.assetPrefix + assetPath);
        }
    };

    // Overides and previously set mapping
    MappingTable.prototype.setMapping = function (mapping) {
        this.urlMapping = mapping;
    };

    MappingTable.prototype.map = function (logicalPath, physicalPath) {
        this.urlMapping[logicalPath] = physicalPath;
    };

    MappingTable.prototype.alias = function (alias, logicalPath) {
        var urlMapping = this.urlMapping;
        urlMapping[alias] = urlMapping[logicalPath];
    };

    MappingTable.prototype.getCurrentProfile = function () {
        return this.currentProfile;
    };

    MappingTable.prototype.setProfile = function (profile) {
        if (this.overrides.hasOwnProperty(profile)) {
            this.currentProfile = profile;
        } else {
            this.currentProfile = undefined;
        }
    };

    MappingTable.create = function (params) {
        var mappingTable = new MappingTable();

        mappingTable.mappingTableURL = params.mappingTableURL;
        mappingTable.tablePrefix = params.mappingTablePrefix;
        mappingTable.assetPrefix = params.assetPrefix;
        mappingTable.overrides = {};

        mappingTable.errorCallbackFn = params.errorCallback || TurbulenzServices.defaultErrorCallback;
        mappingTable.currentProfile = TurbulenzEngine.getSystemInfo().platformProfile;

        var onMappingTableLoad = function onMappingTableLoadFn(tableData) {
            var urlMapping = tableData.urnmapping || tableData.urnremapping || {};
            var overrides = tableData.overrides || {};

            mappingTable.urlMapping = urlMapping;
            mappingTable.overrides = overrides;

            // Prepend all the mapped physical paths with the asset server
            var tablePrefix = mappingTable.tablePrefix;
            if (tablePrefix) {
                var appendPrefix = function appendPrefix(map) {
                    var source;
                    for (source in map) {
                        if (map.hasOwnProperty(source)) {
                            map[source] = tablePrefix + map[source];
                        }
                    }
                };

                // Apply the prefix to the main runmapping table, and
                // any override tables.
                appendPrefix(urlMapping);
                var o;
                for (o in overrides) {
                    if (overrides.hasOwnProperty(o)) {
                        appendPrefix(overrides[o].urnmapping);
                    }
                }
            }

            params.onload(mappingTable);
        };

        if (!mappingTable.mappingTableURL) {
            if (params.mappingTableData) {
                TurbulenzEngine.setTimeout(function () {
                    onMappingTableLoad(JSON.parse(params.mappingTableData));
                }, 0);
            } else {
                TurbulenzEngine.setTimeout(function () {
                    mappingTable.errorCallbackFn("!! mappingtable params contain no url or data");
                }, 0);
            }
        } else {
            params.requestHandler.request({
                src: mappingTable.mappingTableURL,
                onload: function jsonifyResponse(jsonResponse, status) {
                    if (status === 200) {
                        var obj = JSON.parse(jsonResponse);
                        onMappingTableLoad(obj);
                    } else {
                        mappingTable.urlMapping = {};
                        jsonResponse = jsonResponse || { msg: "(no response)" };
                        mappingTable.errorCallbackFn("MappingTable.create: HTTP status " + status + ": " + jsonResponse.msg, status);
                    }
                }
            });
        }

        return mappingTable;
    };
    MappingTable.version = 1;
    return MappingTable;
})();
