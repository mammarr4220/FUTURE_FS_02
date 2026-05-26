import express from "express";

import path, { dirname } from "path";

import { fileURLToPath } from "url";

import mysql from "mysql2";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

const port = 5000;

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "crm_system"
});

db.connect((err) => {

    if (err) {

        console.log("Database connection failed");

    } else {

        console.log(
            "Successfully connected to MySQL database"
        );
    }
});

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const sql = `
        SELECT id, username
        FROM admins
        WHERE username = ? AND password = ?
    `;

    db.query(sql, [username, password], (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (results.length > 0) {

            const admin = results[0];

            return res.json({
                success: true,
                admin: {
                    id: admin.id,
                    username: admin.username
                }
            });
        }

        return res.json({
            success: false,
            message: "Invalid username or password"
        });
    });
});

app.post("/add-lead", (req, res) => {

    const {
        client_id,
        full_name,
        email,
        phone_number,
        lead_source,
        lead_status,
        lead_notes
    } = req.body;

    const sql = `
        INSERT INTO leads
        (
            client_id,
            full_name,
            email,
            phone_number,
            lead_source,
            lead_status,
            lead_notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            client_id,
            full_name,
            email,
            phone_number,
            lead_source,
            lead_status,
            lead_notes
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Failed to add lead"
                );
            }

            res.send("Lead added successfully");
        }
    );
});

app.get("/leads", (req, res) => {

    const sql = `
        SELECT *
        FROM leads
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).send(
                "Failed to fetch leads"
            );
        }

        res.json(results);
    });
});

app.put("/update-lead/:id", (req, res) => {

    const { id } = req.params;

    const { lead_status } = req.body;

    const sql = `
        UPDATE leads
        SET lead_status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [lead_status, id],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Failed to update lead"
                );
            }

            res.send(
                "Lead status updated successfully"
            );
        }
    );
});

app.put("/edit-lead/:id", (req, res) => {

    const { id } = req.params;

    const {
        client_id,
        full_name,
        email,
        phone_number,
        lead_source,
        lead_status,
        lead_notes
    } = req.body;

    const sql = `
        UPDATE leads
        SET
            client_id = ?,
            full_name = ?,
            email = ?,
            phone_number = ?,
            lead_source = ?,
            lead_status = ?,
            lead_notes = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            client_id,
            full_name,
            email,
            phone_number,
            lead_source,
            lead_status,
            lead_notes,
            id
        ],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).send(
                    "Failed to edit lead"
                );
            }

            res.send(
                "Lead edited successfully"
            );
        }
    );
});

app.delete("/delete-lead/:id", (req, res) => {

    const { id } = req.params;

    const sql = `
        DELETE FROM leads
        WHERE id = ?
    `;

    db.query(sql, [id], (err) => {

        if (err) {

            console.log(err);

            return res.status(500).send(
                "Failed to delete lead"
            );
        }

        res.send(
            "Lead deleted successfully"
        );
    });
});

app.listen(port, () => {

    console.log(
        `The app server is successfully running on port ${port}`
    );
});