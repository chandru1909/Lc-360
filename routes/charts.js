const express = require("express");
const router = express.Router();

router.get("/alldevices", async function (req, res) {
	let query = `SELECT * FROM public.devices`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', devices: result.rows });
	}
	catch (err) {
		res.send({ status: 'ERROR', devices: err.message });
	}
});

router.post("/starttime", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let query = `SELECT * FROM public.rawdata WHERE topicname = '${topicName}' AND data LIKE '%SYS_START_TIME%' ORDER BY "timestamp" DESC LIMIT 1`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
})

router.post("/weight", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let interval = body.interval;
	let startTime = body.startTime;
	let endTime = body.endTime;
	let query = `SELECT AVG(weight) AS "averageweight", FLOOR("timestamp"/(1000 * ${interval})) AS "period" FROM public.data WHERE topicname = '${topicName}' AND "timestamp" >= ${startTime} AND "timestamp" <= ${endTime} GROUP By period`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { averageweight: r.averageweight, period: r.period * interval * 1000 } });
		res.send({ status: 'SUCCESS', output: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/temperature", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let interval = body.interval;
	let startTime = body.startTime;
	let endTime = body.endTime;
	let query = `SELECT AVG(temperature) AS "averagetemperature", FLOOR("timestamp"/(1000 * ${interval})) AS "period" FROM public.data WHERE topicname = '${topicName}' AND "timestamp" >= ${startTime} AND "timestamp" <= ${endTime} GROUP By period`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { averagetemperature: r.averagetemperature, period: r.period * interval * 1000 } });
		res.send({ status: 'SUCCESS', output: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/humidity", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let interval = body.interval;
	let startTime = body.startTime;
	let endTime = body.endTime;
	let query = `SELECT AVG(humidity) AS "averagehumidity", FLOOR("timestamp"/(1000 * ${interval})) AS "period" FROM public.data WHERE topicname = '${topicName}' AND "timestamp" >= ${startTime} AND "timestamp" <= ${endTime} GROUP By period`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { averagehumidity: r.averagehumidity, period: r.period * interval * 1000 } });
		res.send({ status: 'SUCCESS', output: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/batterypercentage", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let interval = body.interval;
	let startTime = body.startTime;
	let endTime = body.endTime;
	let query = `SELECT AVG(batterypercentage) AS "averagebatterypercentage", FLOOR("timestamp"/(1000 * ${interval})) AS "period" FROM public.data WHERE topicname = '${topicName}' AND "timestamp" >= ${startTime} AND "timestamp" <= ${endTime} GROUP By period`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { averagebatterypercentage: r.averagebatterypercentage, period: r.period * interval * 1000 } });
		res.send({ status: 'SUCCESS', output: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/log", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let after = body.after;

	let query = `SELECT * FROM public.rawdata WHERE topicname = '${topicName}' AND "timestamp" >= ${after} ORDER BY TIMESTAMP ASC`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/latest", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let query = `SELECT weight, temperature, humidity, batterypercentage, batterycurrent, batteryvoltage, wifissid, rssi, timestamp, abnormalweight, previousweight, chargingvolt, chargingcurrent FROM public.data WHERE topicname = '${topicName}' ORDER BY "timestamp" DESC LIMIT 1`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/wifissid", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let query = `SELECT * FROM public.wifissid WHERE topicname = '${topicName}' ORDER BY "timestamp" DESC LIMIT 1`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/allrunning", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let interval = body.interval;
	let startTime = body.startTime;
	let endTime = body.endTime;
	let query = `SELECT AVG(weight) AS "averageweight", AVG(temperature) AS "averagetemperature", AVG(humidity) AS "averagehumidity", AVG(batterypercentage) AS "averagebatterypercentage", AVG(ABS(batterycurrent)) AS "averagebatterycurrent", AVG(batteryvoltage) AS "averagebatteryvoltage", AVG(ABS(batterycurrent) * batteryvoltage) AS "averagebatterywattage", AVG(rssi) AS "averagewifirssi", FLOOR("timestamp"/(1000 * ${interval})) AS "period" FROM public.data WHERE topicname = '${topicName}' AND "timestamp" > ${startTime} AND "timestamp" <= ${endTime} GROUP By period`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { averageweight: r.averageweight, averagetemperature: r.averagetemperature, averagehumidity: r.averagehumidity, averagebatterypercentage: r.averagebatterypercentage, averagebatterycurrent: r.averagebatterycurrent, averagebatteryvoltage: r.averagebatteryvoltage, averagebatterywattage: r.averagebatterywattage, averagewifirssi: r.averagewifirssi, period: r.period * interval * 1000 } });
		res.send({ status: 'SUCCESS', output: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/heatmap", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let interval = body.interval;
	let startTime = body.startTime;
	let endTime = body.endTime;
	let query = `SELECT AVG(weight) AS "averageweight", FLOOR("timestamp"/(1000 * ${interval})) AS "period" FROM public.data WHERE topicname = '${topicName}' AND "timestamp" >= ${startTime} AND "timestamp" <= ${endTime} GROUP By period ORDER BY period ASC`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { averageweight: r.averageweight, period: r.period * interval * 1000 } });
		res.send({ status: 'SUCCESS', heatmap: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/allheatmap", async function (req, res) {
	let body = req.body;
	let interval = 60 * 60;
	let startTime = new Date().getTime() - (23 * 60 * 60 * 1000);
	let endTime = new Date().getTime();
	let query = `SELECT data.topicname, AVG(data.weight) AS "averageweight", FLOOR(data."timestamp"/(1000 * ${interval})) AS "period", devices.cellname FROM public.data INNER JOIN public.devices ON data.topicname = devices.topicname AND devices.status = 1 WHERE data."timestamp" >= ${startTime} AND data."timestamp" <= ${endTime} GROUP By data.topicname, devices.cellname, period ORDER BY devices.cellname, period ASC`;
	try {
		let result = await global.dbConn.runQuery(query);
		let output = result.rows.map(r => { return { topicname: r.topicname, averageweight: r.averageweight, period: r.period * interval * 1000, cellname: r.cellname } });
		res.send({ status: 'SUCCESS', output: output });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.get("/device", function (req, res) {
	res.render("device", { id: req.query.id });
})

router.post("/calibrateweight", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let weight = body.weight;

	let query = `INSERT INTO public.activities (topicname, eventtype, starttime, status, details) VALUES('${topicName}', 'calibrate', ${new Date().getTime()}, 1, 'W:${weight}') RETURNING *`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/getactivity", async function (req, res) {
	let body = req.body;
	let id = body.id;

	let query=`SELECT a.id, a.topicname, eventtype, a.starttime, a.status, details, d.celltype, d.cellname FROM public.activities a INNER JOIN public.devices d ON a.topicname = d.topicname AND d.status =1 WHERE a.id=${id}`;
	// let query = `SELECT * FROM public.activities WHERE id=${id} INNER JOIN public.devices ON public.devices.topicname= public.activities.topicname `;
	try {
		let result = await global.dbConn.runQuery(query);
		try {
			let events = await global.dbConn.runQuery(`SELECT * FROM public.events WHERE activityid=${id}`);
			result.rows[0].events = events.rows;
		}
		catch (err) {
			result.rows[0].events = [];
		}
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/firmware", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let path = body.path;

	let query = `INSERT INTO public.activities (topicname, eventtype, starttime, status, details) VALUES('${topicName}', 'firmware', ${new Date().getTime()}, 1, 'UPDATE:${path}') RETURNING *`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

router.post("/getactivities", async function (req, res) {
	let body = req.body;
	let topicName = body.topicName;
	let activitytype = body.type;

	let query = `SELECT activities.*, e.activityevent FROM public.activities, LATERAL (SELECT ARRAY (SELECT CONCAT('{', 'id: ', events.id,',', 'name: "',events.name,'"', ',', 'payload: "', events.payload, '"', ',', 'eventtime: ', events.eventtime, '}') FROM public.events WHERE activityid=activities.id) AS activityevent) e WHERE activities.topicname = '${topicName}' AND activities.eventtype='${activitytype}' ORDER BY activities.id DESC LIMIT 5`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
})

router.post("/placedWeight", async function (req, res) {
	let body = req.body;
	let status = body.status;
	let id = body.id;

	let query = `update public.activities set status=${status} where id=${id};`;
	try {
		let result = await global.dbConn.runQuery(query);
		res.send({ status: 'SUCCESS', output: result.rows[0] });
	}
	catch (err) {
		res.send({ status: 'ERROR', error: err.message });
	}
});

module.exports = router;