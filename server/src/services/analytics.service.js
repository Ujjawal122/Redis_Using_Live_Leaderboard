import redis from "../config/redis.js";

export const incrementTotalGames=async()=>{
    return await redis.incr("total_games")
}

export const incrementActiveUsers=async()=>{
    return await redis.incr("active_users")
}

export const getAnalytics=async()=>{
    const totalGames=await redis.get("total_games")

    const activeUser=await redis.get("active_users")

    return {
        totalGames,
        activeUser
    }
}
