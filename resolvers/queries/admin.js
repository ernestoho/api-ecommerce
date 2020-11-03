const {
    verifyJwt
} = require("../../helpers/auth/middlewares")


async function users(_, {}, {
    pool,
    req
}) {
    verifyJwt(req)
    const {
        role_id
    } = req.payload

    if (!(role_id === "admin" || role_id === "super_admin")) {
        throw new Error("Unauthorised, you are not an admin")
    }

    try {
        const users = await pool.query(`select * from users order by created_at desc`)
        return users.rows

    } catch (err) {
        throw new Error(err.message)
    }
}


async function products(_, {
    limit,
    offset
}, {
    pool,
    req
}) {
    verifyJwt(req)
    const {
        role_id
    } = req.payload

    if (!(role_id === "admin" || role_id === "super_admin")) {
        throw new Error("Unauthorised, you are not an admin")
    }
    try {
        const users = await pool.query(`select * from products order by created_at desc limit ${limit} offset ${offset}`)
        return users.rows

    } catch (err) {
        throw new Error(err.message)
    }
}


async function getAllOrders(_, {}, {
    pool,
    req
}) {
    verifyJwt(req)
    const {
        role_id
    } = req.payload

    if (!(role_id === "admin" || role_id === "super_admin")) {
        throw new Error("Unauthorised, you are not an admin")
    }
    try {
        const result = await pool.query(`select * from orders order by created_at desc`)
        return result.rows
    } catch (err) {
        throw new Error(err.message)
    }
}

module.exports = {
    getAllOrders,
    users,
    products
}