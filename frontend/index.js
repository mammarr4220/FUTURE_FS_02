function checkAuth() {

    const admin = localStorage.getItem("admin");

    if (!admin) {

        document.getElementById("dashboard-page").classList.add("hidden");
        document.getElementById("login-page").classList.remove("hidden");

        return;
    }

    const adminData = JSON.parse(admin);

    document.getElementById("login-page").classList.add("hidden");
    document.getElementById("dashboard-page").classList.remove("hidden");
    document.getElementById("admin-grid").classList.remove("hidden");
    document.getElementById("main-grid").classList.remove("hidden");
    document.getElementById("leads-grid").classList.remove("hidden");

    const adminNames = document.querySelectorAll("#admin-name");

    adminNames.forEach((element) => {
        element.textContent = adminData.username;
    });

    const initials = adminData.username
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    document.getElementById("admin-initials").textContent = initials;

    loadLeads();
}

function login() {

    const form = document.getElementById("form");

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        const username = document.getElementById("username").value;

        const password = document.getElementById("password").value;

        try {

            const response = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!data.success) {

                alert("Invalid username or password");

                return;
            }

            localStorage.setItem(
                "admin",
                JSON.stringify(data.admin)
            );

            checkAuth();

        } catch (err) {

            console.log(err);

            alert("Server error");
        }
    });
}

function addLead() {

    const addNewLead = document.getElementById("add");

    const leadsForm = document.getElementById("leads-form");

    const formGrid = document.getElementById("form-grid");

    const leadsGrid = document.getElementById("leads-grid");

    addNewLead.addEventListener("click", (e) => {

        e.preventDefault();

        leadsForm.reset();

        document.getElementById("edit-id").value = "";

        document.getElementById("submit-lead").textContent = "Add Lead";

        leadsGrid.classList.add("hidden");

        formGrid.classList.remove("hidden");
    });

    leadsForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const editId = document.getElementById("edit-id").value;

        const leadData = {

            client_id: document.getElementById("client-id")?.value || "",

            full_name: document.getElementById("lead-name").value,

            email: document.getElementById("lead-email").value,

            phone_number: document.getElementById("phone-number").value,

            lead_source: document.getElementById("lead-source").value,

            lead_status: document.getElementById("lead-status").value,

            lead_notes: document.getElementById("lead-notes").value
        };

        try {

            if (editId) {

                await fetch(`/edit-lead/${editId}`, {

                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(leadData)
                });

            } else {

                await fetch("/add-lead", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(leadData)
                });
            }

            leadsForm.reset();

            document.getElementById("edit-id").value = "";

            document.getElementById("submit-lead").textContent = "Add Lead";

            formGrid.classList.add("hidden");

            leadsGrid.classList.remove("hidden");

            loadLeads();

        } catch (err) {

            console.log(err);

            alert("Failed to save lead");
        }
    });
}

async function updateLeadStatus(id, status) {

    await fetch(`/update-lead/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            lead_status: status
        })
    });

    loadLeads();
}

async function deleteLead(id) {

    await fetch(`/delete-lead/${id}`, {
        method: "DELETE"
    });

    loadLeads();
}

async function loadLeads() {

    const tableBody = document.getElementById("leads-table-body");

    const response = await fetch("/leads");

    const leads = await response.json();

    tableBody.innerHTML = "";

    leads.forEach((lead) => {

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${lead.full_name}</td>

            <td>${lead.email}</td>

            <td>${lead.phone_number}</td>

            <td>${lead.lead_source}</td>

            <td>
                <select class="status-select">

                    <option value="New"
                        ${lead.lead_status === "New" ? "selected" : ""}>
                        New
                    </option>

                    <option value="Contacted"
                        ${lead.lead_status === "Contacted" ? "selected" : ""}>
                        Contacted
                    </option>

                    <option value="Converted"
                        ${lead.lead_status === "Converted" ? "selected" : ""}>
                        Converted
                    </option>

                </select>
            </td>

            <td>${lead.lead_notes}</td>

            <td>
                <button class="update-btn">
                    Update
                </button>

                <button class="delete-btn">
                    Delete
                </button>
            </td>
        `;

        const updateBtn = row.querySelector(".update-btn");

        const deleteBtn = row.querySelector(".delete-btn");

        const select = row.querySelector(".status-select");

        updateBtn.addEventListener("click", () => {

            document.getElementById("form-grid")
                .classList.remove("hidden");

            document.getElementById("leads-grid")
                .classList.add("hidden");

            document.getElementById("submit-lead")
                .textContent = "Save Changes";

            document.getElementById("edit-id").value = lead.id;

            if (document.getElementById("client-id")) {
                document.getElementById("client-id").value =
                    lead.client_id || "";
            }

            document.getElementById("lead-name").value =
                lead.full_name;

            document.getElementById("lead-email").value =
                lead.email;

            document.getElementById("phone-number").value =
                lead.phone_number;

            document.getElementById("lead-source").value =
                lead.lead_source;

            document.getElementById("lead-status").value =
                select.value;

            document.getElementById("lead-notes").value =
                lead.lead_notes;
        });

        deleteBtn.addEventListener("click", async () => {

            await deleteLead(lead.id);
        });

        select.addEventListener("change", async () => {

            await updateLeadStatus(
                lead.id,
                select.value
            );
        });

        tableBody.appendChild(row);
    });
}

checkAuth();
login();
addLead();
