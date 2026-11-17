import { users } from "../data/mockData";

export function login(userData){
    const user = users.find((user)=>
        user.email.toLowerCase() === userData.email.trim().toLowerCase()
    )

    if(!user){
        return{
            success : false,
            user : null ,
            message : 'Invalid Email or Password'
        }
    }

    if (user.password !== userData.password) {
        return {
            success: false,
            user: null,
            message: "Invalid Email or Password",
        };
    }


    if (!user.isActive) {
      return {
        success: false,
        user: null,
        message: "Your account is not active",
      };
    }

    const {password , ...safeUserData} = user
    localStorage.setItem(
        'eduTrackUserData',
        JSON.stringify(safeUserData)
    )
    return{
        success : true,
        user : safeUserData,
        message : 'You Have Login Successfully'
    }
}