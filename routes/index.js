const { query } = require("express");
const express = require("express");
const router = express.Router();

router.get("/", async function (req, res) {
    let query = `SELECT DISTINCT devices.id, data.senderip, data.sendermac, devices.celltype, devices.cellname, devices.firmware, devices.topicname, devices.location FROM public.data INNER JOIN (SELECT topicname, MAX("timestamp") AS latesttime FROM data GROUP BY topicname ORDER BY 1 DESC LIMIT 100) AS topicname ON data.topicname = topicname.topicname AND data.timestamp = topicname.latesttime INNER JOIN public.devices ON data.topicname = devices.topicname AND devices.status = 1 ORDER BY devices.cellname ASC`;
    let devices = [];
    try {
        let result = await global.dbConn.runQuery(query);
        devices = result.rows;
    }
    catch (err) {
    }

    res.render("index", { devices: devices, name: req.session.user.username });
});

router.get("/device/:id", async function (req, res) {
    let id = req.params.id;
    let deviceDetails = {};
    if (id) {
        let query = `SELECT * FROM public.devices WHERE id=${id}`;
        try {
            let result = await global.dbConn.runQuery(query);
            deviceDetails = result.rows[0];
        }
        catch (err) {
        }
        res.render("device", { device: deviceDetails, _24HrUrl: id.toString() + "/24", name: req.session.user.username });
    }
    else {
        res.redirect("/");
    }
});

router.get("/device/:id/24", async function (req, res) {
    let id = req.params.id;
    let deviceDetails = {};
    if (id) {
        let query = `SELECT * FROM public.devices WHERE id=${id}`;
        try {
            let result = await global.dbConn.runQuery(query);
            deviceDetails = result.rows[0];
        }
        catch (err) {
        }
        res.render("device24", { device: deviceDetails, name: req.session.user.username, liveUrl: id.toString() });
    }
    else {
        res.redirect("/");
    }
});

router.get("/sign-in", async function (req, res) {
    res.render("sign-in");
});

router.post("/sign-in", async function (req, res) {
    let query = `SELECT * FROM public.users where email='${req.body.email}' and secret='${req.body.password}'`;
    try {
        let result = await global.dbConn.runQuery(query);
        if (result.rows.length > 0) {
            req.session.user = result.rows[0];
            console.log(req.session.user);
            res.write("<script>window.location.href='/';</script>");
            res.end();
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/sign-out", function (req, res) {
    req.session.destroy();
    res.redirect("/");
});

router.get("/sign-up", async function (req, res) {
    res.render("sign-up");
});

router.post("/sign-up", async function (req, res) {
    let query = `INSERT INTO public.users(username, email, secret, status, usertype) values('${req.body.name}','${req.body.email}','${req.body.password}',1,'User');`;
    try {
        let result = await global.dbConn.runQuery(query);
        //res.status(200).json({ Status: "Success", data: result });
        res.write("<script>window.location.href='/sign-in'</script>");
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/new-device", async function (req, res) {
    res.render("new-device");
});

router.get("/device-list", async function (req, res) {
    let query = `SELECT * FROM public.devices where status=1 ORDER BY cellname ASC`;
    try {
        let result = await global.dbConn.runQuery(query);
        console.log(result.rows);
        res.render("device-list", { list: result.rows, name: req.session.user.username });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/add-device", async function (req, res) {
    let query = `INSERT INTO public.devices(cellname, celltype, location, topicname, firmware,minload,maxload,capacity,status) values('${req.body.cellname}','${req.body.celltype}','${req.body.location}','${req.body.topicname}','${req.body.firmware}','${req.body.minthreshold}','${req.body.maxthreshold}','${req.body.capacity}',1);`;
    try {
        let result = await global.dbConn.runQuery(query);
        console.log(result);
        res.write("<script>window.location.href='/device-list'</script>");
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/edit_loadcell/:id", async function (req, res) {
    let query = `SELECT * FROM public.devices where id=${req.params.id}`;
    try {
        let result = await global.dbConn.runQuery(query);
        res.render("edit-device", { data: result.rows[0] });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/edit-device", async function (req, res) {
    let query = `UPDATE public.devices SET cellname='${req.body.cellname}', celltype='${req.body.celltype}', location='${req.body.location}', topicname='${req.body.topicname}', firmware='${req.body.firmware}',minload='${req.body.minthreshold}',maxload='${req.body.maxthreshold}', capacity='${req.body.capacity}' WHERE id=${req.body.id};`;
    try {
        let result = await global.dbConn.runQuery(query);
        console.log(result);
        res.write("<script>window.location.href='/device-list'</script>");
        res.end();
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/delete_loadcell/:id", async function (req, res) {
    let query = `update public.devices set status=0 where id=${req.params.id};`;
    try {
        let result = await global.dbConn.runQuery(query);
        res.redirect("/device-list");
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/event-timeline", async function (req, res) {
    res.render("event-timeline");
});

router.post("/calibrate", async function (req, res, next) {

});

router.get("/bulkUpdate", async function (req,res){
    let ids=req.query.ids;
        ids=JSON.parse(ids);

        let query = `SELECT * FROM public.devices where id in (${ids.map(function (x){return x})})`;
        try {
            let result = await global.dbConn.runQuery(query);
              res.render("bulk-update", { data: result.rows, name: req.session.user.username})
        }
        catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
})

module.exports = router;