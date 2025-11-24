import oracledb from "oracledb";

const dbSettings = {
    user: "USER_DEVELOPER",
    password: "123",
    connectString: "localhost:1521/XE"
};

export const getConnection = async () => {
    try {
        const pool = await oracledb.getConnection(dbSettings);

        return pool;  
    } catch (err) {
        console.error("Error connecting to OracleDB:", err);
        throw err;
    }
}

export default getConnection;