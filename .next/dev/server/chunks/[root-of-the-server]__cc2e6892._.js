module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/api/open-meteo.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchHistoricalMSLP",
    ()=>fetchHistoricalMSLP,
    "fetchMSLPForLocation",
    ()=>fetchMSLPForLocation,
    "fetchMSLPForLocations",
    ()=>fetchMSLPForLocations
]);
async function fetchMSLPForLocation(location) {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.append("latitude", location.latitude.toString());
    url.searchParams.append("longitude", location.longitude.toString());
    url.searchParams.append("hourly", "pressure_msl,temperature_2m");
    url.searchParams.append("forecast_days", "1");
    url.searchParams.append("timezone", "America/Los_Angeles");
    const response = await fetch(url.toString(), {
        next: {
            revalidate: 3600
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch MSLP data for ${location.name}: ${response.statusText}`);
    }
    const data = await response.json();
    // Find the index for the current hour
    // The API returns times in the timezone we specified (America/Los_Angeles)
    const now = new Date();
    const nowTimestamp = now.getTime();
    // Find the most recent hour that is not in the future
    let currentIndex = 0;
    for(let i = 0; i < data.hourly.time.length; i++){
        const apiTime = new Date(data.hourly.time[i]).getTime();
        if (apiTime <= nowTimestamp) {
            currentIndex = i;
        } else {
            break;
        }
    }
    const timestamp = data.hourly.time[currentIndex];
    const pressure = data.hourly.pressure_msl[currentIndex];
    const temperature = data.hourly.temperature_2m?.[currentIndex];
    return {
        locationId: location.id,
        timestamp,
        pressure,
        temperature
    };
}
async function fetchMSLPForLocations(locations) {
    const promises = locations.map((location)=>fetchMSLPForLocation(location));
    return Promise.all(promises);
}
async function fetchHistoricalMSLP(location, startDate, endDate) {
    const url = new URL("https://archive-api.open-meteo.com/v1/archive");
    url.searchParams.append("latitude", location.latitude.toString());
    url.searchParams.append("longitude", location.longitude.toString());
    url.searchParams.append("start_date", startDate);
    url.searchParams.append("end_date", endDate);
    url.searchParams.append("hourly", "pressure_msl");
    url.searchParams.append("timezone", "America/Los_Angeles");
    const response = await fetch(url.toString(), {
        next: {
            revalidate: 86400
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch historical data for ${location.name}: ${response.statusText}`);
    }
    const data = await response.json();
    return {
        time: data.hourly.time,
        pressure: data.hourly.pressure_msl
    };
}
}),
"[project]/data/locations.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"locations":[{"id":"sna","name":"Santa Ana","code":"SNA","latitude":33.6762,"longitude":-117.8681,"type":"coast","elevation":17},{"id":"sba","name":"Santa Barbara","code":"SBA","latitude":34.4264,"longitude":-119.8403,"type":"coast","elevation":3},{"id":"smx","name":"Santa Maria","code":"SMX","latitude":34.8989,"longitude":-120.4573,"type":"coast","elevation":73},{"id":"dag","name":"Barstow","code":"DAG","latitude":34.8542,"longitude":-116.7866,"type":"interior","elevation":585},{"id":"las","name":"Las Vegas","code":"LAS","latitude":36.084,"longitude":-115.1537,"type":"interior","elevation":664},{"id":"lax","name":"Los Angeles (LAX)","code":"LAX","latitude":33.9416,"longitude":-118.4085,"type":"coast","elevation":38},{"id":"bur","name":"Burbank","code":"BUR","latitude":34.2006,"longitude":-118.359,"type":"interior","elevation":236},{"id":"ont","name":"Ontario","code":"ONT","latitude":34.056,"longitude":-117.6012,"type":"interior","elevation":287},{"id":"psp","name":"Palm Springs","code":"PSP","latitude":33.8297,"longitude":-116.5067,"type":"interior","elevation":145},{"id":"san","name":"San Diego","code":"SAN","latitude":32.7338,"longitude":-117.1933,"type":"coast","elevation":9},{"id":"crq","name":"Carlsbad","code":"CRQ","latitude":33.1283,"longitude":-117.28,"type":"coast","elevation":100},{"id":"smo","name":"Santa Monica","code":"SMO","latitude":34.0158,"longitude":-118.4513,"type":"coast","elevation":53},{"id":"vnr","name":"Van Nuys","code":"VNR","latitude":34.2098,"longitude":-118.4897,"type":"interior","elevation":244},{"id":"oxr","name":"Oxnard","code":"OXR","latitude":34.2008,"longitude":-119.207,"type":"coast","elevation":13},{"id":"bfl","name":"Bakersfield","code":"BFL","latitude":35.4336,"longitude":-119.0568,"type":"interior","elevation":150},{"id":"sbp","name":"San Luis Obispo","code":"SBP","latitude":35.2368,"longitude":-120.6424,"type":"coast","elevation":65},{"id":"vis","name":"Visalia","code":"VIS","latitude":36.3186,"longitude":-119.393,"type":"interior","elevation":90},{"id":"ipx","name":"Indio/Thermal","code":"IPX","latitude":33.6269,"longitude":-116.16,"type":"interior","elevation":-22},{"id":"lbb","name":"Long Beach","code":"LBB","latitude":33.8176,"longitude":-118.1516,"type":"coast","elevation":18},{"id":"riv","name":"Riverside","code":"RIV","latitude":33.9519,"longitude":-117.3962,"type":"interior","elevation":253},{"id":"sbd","name":"San Bernardino","code":"SBD","latitude":34.0953,"longitude":-117.2352,"type":"interior","elevation":348},{"id":"mry","name":"Monterey","code":"MRY","latitude":36.5874,"longitude":-121.843,"type":"coast","elevation":78},{"id":"sjc","name":"San Jose","code":"SJC","latitude":37.3639,"longitude":-121.9289,"type":"interior","elevation":18},{"id":"yum","name":"Yuma","code":"YUM","latitude":32.6566,"longitude":-114.606,"type":"interior","elevation":65}],"homeLocationId":"sna","dashboardLocationIds":["dag","las"]});}),
"[project]/app/api/pressure/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "revalidate",
    ()=>revalidate
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$open$2d$meteo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/open-meteo.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$locations$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/data/locations.json (json)");
;
;
;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const locationIds = searchParams.get("ids")?.split(",") || [];
        if (locationIds.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No location IDs provided"
            }, {
                status: 400
            });
        }
        const locations = __TURBOPACK__imported__module__$5b$project$5d2f$data$2f$locations$2e$json__$28$json$29$__["default"].locations;
        const requestedLocations = locationIds.map((id)=>locations.find((loc)=>loc.id === id)).filter(Boolean);
        if (requestedLocations.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No valid locations found"
            }, {
                status: 404
            });
        }
        const pressureReadings = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$open$2d$meteo$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchMSLPForLocations"])(requestedLocations);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: pressureReadings,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error fetching pressure data:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Failed to fetch pressure data",
            details: error instanceof Error ? error.message : "Unknown error"
        }, {
            status: 500
        });
    }
}
const revalidate = 3600; // Cache for 1 hour
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cc2e6892._.js.map