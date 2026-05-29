import User from "../models/userModel.js";

export const createPlayerService=async(data)=>{
    return await User.create(data);
}

export const getPlayerService=async(id)=>{
    return await User.findById(id).select("-password")
}

export const updatePlayerService=async(id,data)=>{
    return await User.findByIdAndUpdate(id,data,{
        new:true,
        runValidators:true
    }).select("-password")
}

export const deletePlayerService=async(id)=>{
    return await User.findByIdAndDelete(id);
}
