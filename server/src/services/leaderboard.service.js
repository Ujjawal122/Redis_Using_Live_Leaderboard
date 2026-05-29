
import redis from "../config/redis.js"

export const updateScoreService=async(username,score)=>{
    return await redis.zincrby(
        "leaderboard",
        score,
        username
    )
}

export const getTopPlayerService=async()=>{
    return await redis.zrevrange("leaderboard",
        0,
        9,
        "WITHSCORES"
    )
}

export const getPlayerRankService=async(username)=>{
    return await redis.zrevrank("leaderboard",username)
}

