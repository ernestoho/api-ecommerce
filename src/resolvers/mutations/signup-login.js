const {
    registerValidation
} = require("../../helpers/auth/joivalidate")
const bcrypt = require("bcryptjs")
const {
    createRefreshToken,
    createToken
} = require("../../helpers/auth/create-tokens")

/*
 Returns all users for admin dashboard.

 in all functions/mutations, first arg expects parent, second expects inputs, third - context
*/
async function signUp(_, {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
    role,
    phone,
    pending,
    business_name,
    business_name_slug,
    business_address,
    business_area,
    business_image,
    business_bio,
    customer_address
}, {
    pool
}) {
    try {
        const validation = registerValidation({
            first_name,
            last_name,
            email,
            password,
            confirm_password
        })

        if (validation.error) {
            throw new Error(validation.error.message)
        }

        const emailExists = await pool.query(`select email from users where email = $1`, [email])

        if (emailExists.rows.length > 0) {
            throw new Error("email already exists")
        }

        // hash password 

        const salt = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(password, salt)

        // Signing up a user 
        await pool.query(`INSERT INTO users (first_name,last_name,email,password,phone,role,pending,business_name,
            business_name_slug,
            business_address,
            business_area,
            business_image,
            business_bio,
            customer_address) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [first_name, last_name, email, hashedpassword, phone, role, pending, business_name,
                business_name_slug,
                business_address,
                business_area,
                business_image,
                business_bio,
                customer_address
            ]);

        return {
            message: "sign up successful"
        }

    } catch (err) {
        throw new Error(err.message)
    }

}

async function logIn(_, {
    email,
    password
}, {
    res,
    pool
}) {
    try {
        const users = await pool.query("select * from users where email = $1", [email]);

        if (users.rows.length === 0) {
            throw new Error("wrong email or password")
        }
        const validPass = await bcrypt.compare(password, users.rows[0].password)
        if (!validPass) {
            throw new Error("wrong email or password")
        }

        // cookie expiry date - 7 days 
        let date = new Date()
        date.setDate(date.getDate() + 7);

        //imports to create tokens
        const token = createToken(users) //returns access token
        res.cookie('ecom', createRefreshToken(users), {
            httpOnly: true,
            expires: date,
            // secure: true
        })

        //role here is either customer, admin or vendor. it's determined at sign up
        res.cookie('role', users.rows[0].role, {
            httpOnly: true,
            expires: date,
            // secure: true
        });

        return {
            accesstoken: token,
            role: users.rows[0].role
        }

    } catch (err) {
        throw new Error(err.message)
    }

}

module.exports = {
    signUp,
    logIn
}