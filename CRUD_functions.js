import sql from "./db.js";

// Handle user signup
export const createUser = function (req, res) {
    if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
    }

    const newUser = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        phone_number: req.body.phone_number
    };

    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password || !newUser.phone_number) {
        res.status(400).send({ message: "Missing required fields" });
        return;
    }

    // Check if email already exists
    sql.query("SELECT id FROM users WHERE email = ?", [newUser.email], (err, results) => {
        if (err) {
            console.log("[CRUD] Error checking if email exists:", err);
            res.status(500).send({ message: "Internal server error while checking email" });
            return;
        }
        if (results.length > 0) {
            res.status(409).send({ message: "Email already exists" });
            return;
        }

        // Insert new user to database
        sql.query("INSERT INTO users SET ?", newUser, (err, result) => {
            if (err) {
                console.log("[CRUD] Error inserting new user into database:", err);
                res.status(500).send({ message: "Internal server error while creating user" });
                return;
            }
            console.log("[CRUD] User created:", { id: result.insertId, ...newUser });
            res.status(201).send({ message: "User created successfully", userId: result.insertId });
        });
    });
};

// Handle user login
export const loginUser = function (req, res) {
    if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
    }

    const user = {
        email: req.body.email,
        password: req.body.password
    };

    if (!user.email || !user.password) {
        res.status(400).send({ message: "Missing required fields" });
        return;
    }

    // Check if user exists by email
    sql.query("SELECT * FROM users WHERE email = ?", [user.email], (err, results) => {
        if (err) {
            console.log("[CRUD] Error querying user by email:", err);
            res.status(500).send({ message: "Internal server error while checking user" });
            return;
        }
        if (results.length === 0) {
            res.status(404).send({ message: "User does not exist" });
            return;
        }

        const dbUser = results[0];

        // Validate password
        if (user.password !== dbUser.password) {
            res.status(401).send({ message: "Incorrect password" });
            return;
        }

        console.log("[CRUD] Login successful:", { id: dbUser.id, email: dbUser.email });
        res.status(200).send({
            message: "Login successful",
            user: {
                id: dbUser.id,
                first_name: dbUser.first_name,
                last_name: dbUser.last_name,
                email: dbUser.email,
                phone_number: dbUser.phone_number
            }
        });
    });
};

// Check if email exists for password reset
export const resetPasswordCheckEmail = function (req, res) {
    if (!req.body || !req.body.email) {
        res.status(400).send({ message: "Email is required" });
        return;
    }

    const email = req.body.email;

    sql.query("SELECT id FROM users WHERE email = ?", [email], (err, results) => {
        if (err) {
            console.log("[CRUD] Error checking email existence:", err);
            res.status(500).send({ message: "Internal server error while checking email" });
            return;
        }

        if (results.length === 0) {
            res.status(404).send({ message: "Email not found" });
            return;
        }

        console.log("[CRUD] Email found for password reset:", email);
        res.status(200).send({ message: "Email exists", userId: results[0].id });
    });
};

// Add new dog to database
export const addDog = function (req, res) {
    if (!req.body) {
        res.status(400).send({ message: "Content cannot be empty" });
        return;
    }

    const newDog = {
        name: req.body.name,
        breed: req.body.breed,
        age: req.body.age,
        gender: req.body.gender,
        size: req.body.size,
        energy_level: req.body.energy_level,
        city: req.body.city,
        image_url: req.file ? `/uploads/${req.file.filename}` : null,
        owner_id: req.body.owner_id
    };

    if (!newDog.name || !newDog.age || !newDog.gender || !newDog.size || !newDog.energy_level || !newDog.city || !newDog.owner_id) {
        res.status(400).send({ message: "Missing required fields" });
        return;
    }

    sql.query("INSERT INTO dogs SET ?", newDog, (err, result) => {
        if (err) {
            console.log("[CRUD] Error inserting dog into database:", err);
            res.status(500).send({ message: "Internal server error while adding dog" });
            return;
        }

        console.log("[CRUD] Dog added successfully:", { id: result.insertId, ...newDog });
        res.status(201).send({ message: "Dog added successfully", dogId: result.insertId });
    });
};

// Retrieve all dogs along with their owner's contact info
export const getAllDogs = function (req, res) {
    const query = `
        SELECT 
            dogs.*, 
            users.first_name AS owner_first_name,
            users.last_name AS owner_last_name,
            users.phone_number AS owner_phone,
            users.email AS owner_email
        FROM dogs
        JOIN users ON dogs.owner_id = users.id
    `;

    sql.query(query, (err, results) => {
        if (err) {
            console.log("[CRUD] Error retrieving all dogs with owner info:", err);
            res.status(500).send({ message: "Internal server error while retrieving dogs" });
            return;
        }

        // Merge owner full name for convenience
        const dogsWithOwner = results.map(dog => ({
            ...dog,
            owner: `${dog.owner_first_name} ${dog.owner_last_name}`,
            phone: dog.owner_phone,
            email: dog.owner_email
        }));

        res.status(200).send(dogsWithOwner);
    });
};

// Filter dogs by city, size, gender, or energy level
export const filterDogs = function (req, res) {
    const { city, size, gender, energy_level } = req.body;

    let query = "SELECT * FROM dogs WHERE 1=1";
    const params = [];

    if (city) {
        query += " AND city = ?";
        params.push(city);
    }
    if (size) {
        query += " AND size = ?";
        params.push(size);
    }
    if (gender) {
        query += " AND gender = ?";
        params.push(gender);
    }
    if (energy_level) {
        query += " AND energy_level = ?";
        params.push(energy_level);
    }

    sql.query(query, params, (err, results) => {
        if (err) {
            console.log("[CRUD] Error filtering dogs:", err);
            res.status(500).send({ message: "Internal server error while filtering dogs" });
            return;
        }

        res.status(200).send(results);
    });
};

// Create a new match between two dogs
export const createMatch = function (req, res) {
    const { dog1_id, dog2_id } = req.body;

    if (!dog1_id || !dog2_id) {
        res.status(400).send({ message: "Missing dog IDs" });
        return;
    }

    const match = {
        dog1_id,
        dog2_id
    };

    sql.query("INSERT INTO matches SET ?", match, (err, result) => {
        if (err) {
            console.log("[CRUD] Error creating match:", err);
            res.status(500).send({ message: "Internal server error while creating match" });
            return;
        }

        console.log("[CRUD] Match created successfully:", result.insertId);
        res.status(201).send({ message: "Match created successfully", matchId: result.insertId });
    });
};

// Get all matches related to a user (based on owned dogs)
export const getMatchesByUser = function (req, res) {
    const userId = req.params.userId;

    if (!userId) {
        res.status(400).send({ message: "User ID is required" });
        return;
    }

    const query = `
        SELECT * FROM matches 
        WHERE dog1_id IN (SELECT id FROM dogs WHERE owner_id = ?)
           OR dog2_id IN (SELECT id FROM dogs WHERE owner_id = ?)
    `;

    sql.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.log("[CRUD] Error retrieving matches for user:", err);
            res.status(500).send({ message: "Internal server error while retrieving matches" });
            return;
        }

        res.status(200).send(results);
    });
};

// Update user password by email
export const updatePassword = function(req, res) {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).send({ message: "Missing email or new password" });
    }

    sql.query("UPDATE users SET password = ? WHERE email = ?", [newPassword, email], (err, result) => {
        if (err) {
            console.log("[CRUD] Error updating password:", err);
            return res.status(500).send({ message: "Internal server error while updating password" });
        }

        res.status(200).send({ message: "Password updated successfully" });
    });
};

// Get user details by ID
export const getUserById = function (req, res) {
    const userId = req.params.id;

    if (!userId) {
        return res.status(400).send({ message: "User ID is required" });
    }

    sql.query("SELECT id, first_name, last_name, email FROM users WHERE id = ?", [userId], (err, results) => {
        if (err) {
            console.log("[CRUD] Error retrieving user:", err);
            return res.status(500).send({ message: "Internal server error while retrieving user" });
        }

        if (results.length === 0) {
            return res.status(404).send({ message: "User not found" });
        }

        res.status(200).send(results[0]);
    });
};

