'use strict';

const { Pool } = require('pg');

class PgDB {
	init() {
		this.pool = new Pool({
			user: 'postgres',
			host: 'lc360.amicodevelopment.net',
			database: 'LC360',
			password: 'prahi2016',
			port: 6987
		});
	}

	runQuery(query) {
		return new Promise((resolve, reject) => {
			this.pool.connect((err, client, done) => {
				if (err) {
					return reject(err);
				}
				client.query(query, (error, results) => {
					done();
					if (error) {
						// console.log(error);
						return reject(error);
					}
					return resolve(results);
				});
			});
		});
	}

	mysql_real_escape_string(str) {
		return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
			switch (char) {
				case "\0":
					return "\\0";
				case "\x08":
					return "\\b";
				case "\x09":
					return "\\t";
				case "\x1a":
					return "\\z";
				case "\n":
					return "\\n";
				case "\r":
					return "\\r";
				case "\"":
				case "'":
				case "\\":
				case "%":
					return "\\" + char; // prepends a backslash to backslash, percent, and double/single quotes
				default:
					return char;
			}
		});
	}
}

let databaseconn = new PgDB();
databaseconn.init();

global.dbConn = databaseconn;